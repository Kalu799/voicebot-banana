import { chercherNotes, lireNote } from '../utils/rechercheNotes.js'

function validerObjet(valeur, champsAutorises) {
  if (valeur === null || typeof valeur !== 'object' || Array.isArray(valeur)) {
    throw new Error('Les paramètres doivent être un objet.')
  }

  const prototype = Object.getPrototypeOf(valeur)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error('Les paramètres doivent être un objet simple.')
  }

  for (const champ of Object.keys(valeur)) {
    if (!champsAutorises.includes(champ)) {
      throw new Error(`Paramètre non autorisé : ${champ}.`)
    }
  }
}

function validerTextes(parametres, champs, obligatoires = []) {
  for (const champ of champs) {
    if (!Object.hasOwn(parametres, champ)) {
      if (obligatoires.includes(champ)) {
        throw new Error(`Le paramètre ${champ} est obligatoire.`)
      }
      continue
    }

    if (typeof parametres[champ] !== 'string') {
      throw new Error(`Le paramètre ${champ} doit être un texte.`)
    }

    if (obligatoires.includes(champ) && !parametres[champ].trim()) {
      throw new Error(`Le paramètre ${champ} ne doit pas être vide.`)
    }
  }
}

// Le contenu complet est réservé à lire_note ; les mutations renvoient un résumé.
function resumerNote(note) {
  return {
    id: note.id,
    titre: note.titre,
    categorie: note.categorie,
    projet: note.projet,
    updatedAt: note.updatedAt,
    deletedAt: note.deletedAt,
  }
}

function outil(champsAutorises, traiter) {
  return async (parametres = {}) => {
    try {
      validerObjet(parametres, champsAutorises)
      return { succes: true, ...await traiter(parametres) }
    } catch (cause) {
      return {
        succes: false,
        erreur: cause instanceof Error ? cause.message : 'Impossible d’exécuter cet outil.',
      }
    }
  }
}

/** Adaptateur commun au futur simulateur et aux client tools ElevenLabs. */
export function creerOutilsNotes(store) {
  const champsNote = ['titre', 'contenu', 'categorie', 'projet']

  return {
    creer_note: outil(champsNote, async parametres => {
      validerTextes(parametres, champsNote, ['titre'])
      return { note: resumerNote(await store.ajouterNote(parametres)) }
    }),

    chercher_notes: outil(
      ['texte', 'categorie', 'projet', 'corbeille', 'limite'],
      async parametres => {
        validerTextes(parametres, ['texte', 'categorie', 'projet'])

        if (Object.hasOwn(parametres, 'corbeille')
          && typeof parametres.corbeille !== 'boolean') {
          throw new Error('Le paramètre corbeille doit être un booléen.')
        }

        if (Object.hasOwn(parametres, 'limite')
          && (!Number.isInteger(parametres.limite)
            || parametres.limite < 1 || parametres.limite > 20)) {
          throw new Error('La limite doit être un entier entre 1 et 20.')
        }

        return chercherNotes(await store.obtenirNotes(), parametres)
      },
    ),

    lire_note: outil(['id'], async parametres => {
      validerTextes(parametres, ['id'], ['id'])
      return { note: lireNote(await store.obtenirNotes(), parametres.id) }
    }),

    modifier_note: outil(['id', 'changements'], async parametres => {
      validerTextes(parametres, ['id'], ['id'])
      validerObjet(parametres.changements, champsNote)
      validerTextes(parametres.changements, champsNote)

      if (Object.hasOwn(parametres.changements, 'titre')
        && !parametres.changements.titre.trim()) {
        throw new Error('Le titre de la note est obligatoire.')
      }

      return {
        note: resumerNote(await store.modifierNote(
          parametres.id, parametres.changements,
        )),
      }
    }),

    supprimer_note: outil(['id'], async parametres => {
      validerTextes(parametres, ['id'], ['id'])
      return { note: resumerNote(await store.supprimerNote(parametres.id)) }
    }),

    restaurer_note: outil(['id'], async parametres => {
      validerTextes(parametres, ['id'], ['id'])
      return { note: resumerNote(await store.restaurerNote(parametres.id)) }
    }),
  }
}
