const NOM_BASE = 'voicebot'
const VERSION_BASE = 1
const MAGASIN_NOTES = 'notes'

/**
 * Ouvre la base locale voicebot version 1 et crée le magasin notes si nécessaire.
 * Convertit les événements IndexedDB en promesse de connexion ; refuse si l’API
 * est absente, si l’ouverture échoue ou si un autre onglet bloque la migration.
 * L’appelant doit fermer la connexion reçue ; les autres fonctions le font déjà.
 */
export function ouvrirBase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB est indisponible dans cet environnement.'))
      return
    }

    const requete = indexedDB.open(NOM_BASE, VERSION_BASE)
    let ouvertureBloquee = false

    requete.onblocked = () => {
      ouvertureBloquee = true
      reject(new Error(
        'Ouverture bloquée : fermez les autres onglets de cette application, puis réessayez.',
      ))
    }

    // Cet événement crée la structure lors de la première ouverture.
    requete.onupgradeneeded = () => {
      if (ouvertureBloquee) {
        requete.transaction.abort()
        return
      }

      const base = requete.result
      if (!base.objectStoreNames.contains(MAGASIN_NOTES)) {
        base.createObjectStore(MAGASIN_NOTES, { keyPath: 'id' })
      }
    }

    requete.onerror = () => {
      reject(new Error(
        'Impossible d’ouvrir la base de notes.',
        { cause: requete.error },
      ))
    }

    requete.onsuccess = () => {
      const base = requete.result

      // Une ouverture déjà signalée en échec ne doit pas laisser de connexion.
      if (ouvertureBloquee) {
        base.close()
        return
      }

      // Libère la connexion si un autre onglet demande une nouvelle version.
      base.onversionchange = () => base.close()
      resolve(base)
    }
  })
}

/**
 * Ajoute ou remplace une note complète par son id avec put dans une transaction.
 * Attend oncomplete : le succès d’une requête seule ne prouve pas que la
 * transaction est validée. Résout sans valeur, rejette si elle est annulée.
 * Ferme sa connexion dans tous les cas ; la validation métier revient au store.
 */
export async function enregistrerNote(note) {
  const base = await ouvrirBase()

  try {
    await new Promise((resolve, reject) => {
      const transaction = base.transaction(MAGASIN_NOTES, 'readwrite')

      transaction.oncomplete = () => resolve()
      transaction.onabort = () => {
        reject(new Error(
          'La note n’a pas pu être sauvegardée.',
          { cause: transaction.error },
        ))
      }

      // put ajoute une note ou remplace celle qui porte le même identifiant.
      transaction.objectStore(MAGASIN_NOTES).put(note)
    })
  } finally {
    base.close()
  }
}

/**
 * Lit toutes les notes, corbeille comprise, sans tri de présentation.
 * Renvoie une promesse de tableau (vide si aucune note), après fin de transaction.
 * Ferme sa connexion même après erreur ; ne filtre ni ne valide les objets lus.
 */
export async function recupererNotes() {
  const base = await ouvrirBase()

  try {
    return await new Promise((resolve, reject) => {
      const transaction = base.transaction(MAGASIN_NOTES, 'readonly')
      const requete = transaction.objectStore(MAGASIN_NOTES).getAll()

      transaction.oncomplete = () => resolve(requete.result)
      transaction.onabort = () => {
        reject(new Error(
          'Les notes n’ont pas pu être récupérées.',
          { cause: transaction.error },
        ))
      }
    })
  } finally {
    base.close()
  }
}

/**
 * Fusionne une liste déjà validée dans une seule transaction d’écriture.
 * Un id local existant est ignoré, même si son contenu diffère ; les autres notes
 * sont ajoutées. Renvoie { importees, ignorees } après validation de la transaction.
 * Une annulation retire tous les ajouts de cet import, sans toucher aux notes
 * préexistantes. Cette couche ne valide pas le format du fichier JSON.
 */
export async function fusionnerNotes(notes) {
  const base = await ouvrirBase()

  try {
    return await new Promise((resolve, reject) => {
      const transaction = base.transaction(MAGASIN_NOTES, 'readwrite')
      const magasin = transaction.objectStore(MAGASIN_NOTES)
      let importees = 0
      let ignorees = 0
      let erreurEcriture

      transaction.oncomplete = () => resolve({ importees, ignorees })
      transaction.onabort = () => {
        reject(new Error(
          'Import annulé : aucune nouvelle note n’a été enregistrée.',
          { cause: erreurEcriture ?? transaction.error },
        ))
      }

      // Une erreur synchrone doit aussi annuler les ajouts déjà effectués.

      /**
       * Conserve la cause d’une erreur synchrone et annule toute la transaction,
       * pour ne pas conserver les ajouts précédents d’un import finalement refusé.
       */
      function annuler(cause) {
        erreurEcriture = cause
        transaction.abort()
      }

      try {
        for (const note of notes) {
          const recherche = magasin.get(note.id)

          recherche.onsuccess = () => {
            if (recherche.result !== undefined) {
              ignorees += 1
              return
            }

            try {
              const ajout = magasin.add(note)
              ajout.onsuccess = () => { importees += 1 }
            } catch (cause) {
              annuler(cause)
            }
          }
        }
      } catch (cause) {
        annuler(cause)
      }
    })
  } finally {
    base.close()
  }
}

/**
 * Efface les ids confirmés dans une seule transaction. Relit chaque note dans
 * cette transaction pour refuser aussi une restauration faite dans un autre onglet.
 * Une erreur annule toute la suppression, y compris les suppressions déjà lancées.
 */
export async function effacerNotesEnCorbeille(ids) {
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string' || !id.trim())) {
    throw new Error('Les identifiants des notes sont obligatoires.')
  }
  if (ids.length === 0) return
  const base = await ouvrirBase()

  try {
    await new Promise((resolve, reject) => {
      const transaction = base.transaction(MAGASIN_NOTES, 'readwrite')
      const magasin = transaction.objectStore(MAGASIN_NOTES)
      let erreur
      transaction.oncomplete = () => resolve()
      transaction.onabort = () => reject(erreur ?? new Error(
        'La suppression définitive a échoué.', { cause: transaction.error },
      ))

      for (const id of new Set(ids)) {
        const requete = magasin.get(id)
        requete.onsuccess = () => {
          const note = requete.result
          if (note && note.deletedAt == null) {
            erreur = new Error('Une note a été restaurée. Rechargez la page avant de réessayer.')
            transaction.abort()
            return
          }
          // Un id déjà effacé ne nécessite aucune écriture.
          if (note) magasin.delete(id)
        }
      }
    })
  } finally {
    base.close()
  }
}
