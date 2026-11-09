// État avant la première lecture IndexedDB. Une liste vide n’indique donc pas
// encore une bibliothèque vide : il faut attendre la fin de chargement.
export const etatInitialNotes = {
  notes: [],
  chargement: true,
  erreur: null,
  rechargementRequis: false,
}

/**
 * Applique une action du provider et renvoie un nouvel état pour React.
 * Ne sauvegarde rien : NOTE_AJOUTEE et NOTE_MISE_A_JOUR arrivent après l’écriture.
 * CHARGEMENT_ECHOUE garde les notes affichées mais impose un rechargement ;
 * ERREUR_ACTION signale un échec ponctuel sans verrouiller toutes les actions.
 * Une action inconnue est une erreur de programmation et provoque une exception.
 */
export function notesReducer(etat, action) {
  switch (action.type) {
    case 'NOTES_CHARGEES':
      return {
        ...etat,
        notes: action.notes,
        chargement: false,
        erreur: null,
        rechargementRequis: false,
      }

    case 'CHARGEMENT_ECHOUE':
      return {
        ...etat,
        chargement: false,
        erreur: action.message,
        rechargementRequis: true,
      }

    case 'NOTE_AJOUTEE':
      return {
        ...etat,
        notes: [...etat.notes, action.note],
        erreur: null,
      }

    case 'NOTE_MISE_A_JOUR':
      return {
        ...etat,
        notes: etat.notes.map(note =>
          note.id === action.note.id ? action.note : note,
        ),
        erreur: null,
      }

    case 'NOTES_EFFACEES':
      return {
        ...etat,
        notes: etat.notes.filter(note => !action.ids.includes(note.id)),
        erreur: null,
      }

    case 'ERREUR_ACTION':
      return { ...etat, erreur: action.message }

    case 'ERREUR_EFFACEE':
      return { ...etat, erreur: null }

    default:
      throw new Error(`Action de notes inconnue : ${action.type}`)
  }
}
