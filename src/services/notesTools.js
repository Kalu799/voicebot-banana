import { chercherNotes, lireNote } from '../utils/rechercheNotes.js'

/**
 * Refuse les paramètres non objets simples et les champs hors contrat.
 * Cette validation sert aussi à changements : l’agent ne peut pas modifier id/dates.
 */
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

/**
 * Vérifie le type des champs présents et la présence/non-vacuité des obligatoires.
 * Un champ facultatif absent est accepté ; un champ présent non textuel est refusé.
 */
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

/**
 * Prépare l’accusé de mutation avec identité, classement et dates, sans contenu.
 * Évite de retransmettre tout le texte à l’agent après chaque écriture.
 */
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

/**
 * Enveloppe un traitement dans le contrat commun des six outils.
 * Valide les clés, attend le traitement puis renvoie { succes: true, ...résultat }.
 * Convertit toute exception en { succes: false, erreur }, lisible par l’agent et
 * le simulateur. Une erreur métier n’est donc pas une promesse rejetée ici.
 */
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

/**
 * Construit les six outils à partir des actions d’un store fourni par l’appelant.
 * Même logique pour simulateur et ElevenLabs ; aucun appel vocal dans ce fichier.
 * Les lectures passent par obtenirNotes pour attendre la file ; les mutations
 * attendent la sauvegarde effectuée par le store avant d’annoncer leur réussite.
 */
export function creerOutilsNotes(store) {
  const champsNote = ['titre', 'contenu', 'categorie', 'projet']

  return {
    // titre requis ; les autres textes sont facultatifs. Renvoie un résumé sauvegardé.
    creer_note: outil(champsNote, async parametres => {
      validerTextes(parametres, champsNote, ['titre'])
      return { note: resumerNote(await store.ajouterNote(parametres)) }
    }),

    // Recherche filtrée : 5 résultats par défaut, 20 au maximum, avec extraits.
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

    // Lecture complète par id, y compris dans la corbeille ; aucun choix par titre.
    lire_note: outil(['id'], async parametres => {
      validerTextes(parametres, ['id'], ['id'])
      return { note: lireNote(await store.obtenirNotes(), parametres.id) }
    }),

    // Applique seulement changements ; les champs omis conservent leur valeur.
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

    // Suppression réversible : date la mise en corbeille sans effacer le contenu.
    supprimer_note: outil(['id'], async parametres => {
      validerTextes(parametres, ['id'], ['id'])
      return { note: resumerNote(await store.supprimerNote(parametres.id)) }
    }),

    // Restaure par id ; répéter sur une note active ne provoque pas d’écriture.
    restaurer_note: outil(['id'], async parametres => {
      validerTextes(parametres, ['id'], ['id'])
      return { note: resumerNote(await store.restaurerNote(parametres.id)) }
    }),
  }
}
