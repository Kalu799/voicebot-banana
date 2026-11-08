const NOM_BASE = 'voicebot'
const VERSION_BASE = 1
const MAGASIN_NOTES = 'notes'

/** Ouvre la base ; un appel direct doit être suivi de base.close(). */
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

/** Enregistre une note complète et attend la fin effective de la transaction. */
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

/** Récupère toutes les notes, y compris celles de la future corbeille, sans tri. */
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

/** Ajoute les notes validées par l'import, en conservant les identifiants locaux. */
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
