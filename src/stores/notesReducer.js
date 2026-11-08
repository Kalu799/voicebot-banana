export const etatInitialNotes = {
  notes: [],
  chargement: true,
  erreur: null,
}

/** Calcule le nouvel état sans modifier le précédent ni accéder au stockage. */
export function notesReducer(etat, action) {
  switch (action.type) {
    case 'NOTES_CHARGEES':
      return {
        ...etat,
        notes: action.notes,
        chargement: false,
        erreur: null,
      }

    case 'CHARGEMENT_ECHOUE':
      return { ...etat, chargement: false, erreur: action.message }

    case 'NOTE_AJOUTEE':
      return {
        ...etat,
        notes: [...etat.notes, action.note],
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
