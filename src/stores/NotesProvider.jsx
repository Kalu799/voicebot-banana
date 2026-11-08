import { useEffect, useReducer, useRef } from 'react'
import { creerNote } from '../utils/note.js'
import { enregistrerNote, recupererNotes } from '../services/notesStorage.js'
import { NotesContext } from './NotesContext.js'
import { etatInitialNotes, notesReducer } from './notesReducer.js'

export function NotesProvider({ children }) {
  const [etat, dispatch] = useReducer(notesReducer, etatInitialNotes)
  const chargementReussi = useRef(false)

  useEffect(() => {
    let ignore = false

    async function charger() {
      try {
        const notes = await recupererNotes()

        if (!ignore) {
          chargementReussi.current = true
          dispatch({ type: 'NOTES_CHARGEES', notes })
        }
      } catch (cause) {
        if (!ignore) {
          dispatch({ type: 'CHARGEMENT_ECHOUE', message: cause.message })
        }
      }
    }

    charger()

    // Ignore une lecture devenue obsolète, notamment avec StrictMode.
    return () => {
      ignore = true
      chargementReussi.current = false
    }
  }, [])

  async function ajouterNote(champs) {
    // Évite qu'un chargement tardif remplace une note tout juste créée.
    if (!chargementReussi.current) {
      throw new Error(
        'Les notes ne sont pas encore chargées. Si le chargement a échoué, rechargez la page.',
      )
    }

    dispatch({ type: 'ERREUR_EFFACEE' })

    try {
      const note = creerNote(champs)
      await enregistrerNote(note)

      // La sauvegarde précède la mise à jour de l'état partagé.
      if (chargementReussi.current) {
        dispatch({ type: 'NOTE_AJOUTEE', note })
      }

      return note
    } catch (cause) {
      if (chargementReussi.current) {
        dispatch({ type: 'ERREUR_ACTION', message: cause.message })
      }

      // Le futur appelant vocal doit aussi connaître l'échec.
      throw cause
    }
  }

  return (
    <NotesContext.Provider value={{ ...etat, ajouterNote }}>
      {children}
    </NotesContext.Provider>
  )
}
