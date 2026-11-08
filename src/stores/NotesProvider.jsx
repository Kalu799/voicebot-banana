import { useEffect, useReducer, useRef } from 'react'
import {
  creerNote,
  preparerModification,
  preparerSuppression,
  preparerRestauration,
} from '../utils/note.js'
import { enregistrerNote, recupererNotes } from '../services/notesStorage.js'
import { importerNotes } from '../services/notesBackup.js'
import { NotesContext } from './NotesContext.js'
import { etatInitialNotes, notesReducer } from './notesReducer.js'

export function NotesProvider({ children }) {
  const [etat, dispatch] = useReducer(notesReducer, etatInitialNotes)
  const chargementReussi = useRef(false)
  // Dernière version sauvegardée, disponible même avant le prochain rendu React.
  const notesCourantes = useRef([])
  const fileActions = useRef(Promise.resolve())

  useEffect(() => {
    let ignore = false

    async function charger() {
      try {
        const notes = await recupererNotes()

        if (!ignore) {
          notesCourantes.current = notes
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

  function verifierDisponibilite() {
    if (!chargementReussi.current) {
      throw new Error(
        'Les notes ne sont pas disponibles. Rechargez la page pour les charger.',
      )
    }
  }

  async function executerAction(operation) {
    verifierDisponibilite()

    const execution = fileActions.current.then(async () => {
      verifierDisponibilite()
      dispatch({ type: 'ERREUR_EFFACEE' })

      try {
        return await operation()
      } catch (cause) {
        if (chargementReussi.current) {
          dispatch({ type: 'ERREUR_ACTION', message: cause.message })
        }

        throw cause
      }
    })

    // Une action échouée ne bloque pas les tentatives suivantes.
    fileActions.current = execution.catch(() => {})
    return execution
  }

  function obtenirNotes() {
    // La lecture attend les actions précédentes et renvoie des objets indépendants.
    return executerAction(() =>
      notesCourantes.current.map(note => ({ ...note })),
    )
  }

  function ajouterNote(champs) {
    return executerAction(async () => {
      const note = creerNote(champs)
      await enregistrerNote(note)

      // La sauvegarde précède la mise à jour de l'état partagé.
      if (chargementReussi.current) {
        notesCourantes.current = [...notesCourantes.current, note]
        dispatch({ type: 'NOTE_AJOUTEE', note })
      }

      return note
    })
  }

  function changerNote(id, preparer) {
    return executerAction(async () => {
      if (typeof id !== 'string' || !id.trim()) {
        throw new Error('L’identifiant de la note est obligatoire.')
      }

      const note = notesCourantes.current.find(note => note.id === id)
      if (!note) throw new Error('Note introuvable.')

      const resultat = preparer(note)
      if (resultat === note) return note

      await enregistrerNote(resultat)

      if (chargementReussi.current) {
        notesCourantes.current = notesCourantes.current.map(note =>
          note.id === id ? resultat : note,
        )
        dispatch({ type: 'NOTE_MISE_A_JOUR', note: resultat })
      }

      return resultat
    })
  }

  function modifierNote(id, changements) {
    return changerNote(id, note => preparerModification(note, changements))
  }

  function supprimerNote(id) {
    return changerNote(id, preparerSuppression)
  }

  function restaurerNote(id) {
    return changerNote(id, preparerRestauration)
  }

  function importerSauvegarde(fichier) {
    return executerAction(async () => {
      const resultat = await importerNotes(fichier)

      let notes
      try {
        notes = await recupererNotes()
      } catch (cause) {
        const erreur = new Error(
          'L’import est enregistré, mais l’actualisation des notes a échoué. Rechargez la page avant de continuer.',
          { cause },
        )

        // Permet à l'appelant de reconnaître un import déjà terminé.
        erreur.importEnregistre = true
        erreur.resultatImport = resultat

        if (chargementReussi.current) {
          chargementReussi.current = false
          dispatch({ type: 'CHARGEMENT_ECHOUE', message: erreur.message })
        }

        throw erreur
      }

      if (chargementReussi.current) {
        notesCourantes.current = notes
        dispatch({ type: 'NOTES_CHARGEES', notes })
      }

      return resultat
    })
  }

  return (
    <NotesContext.Provider value={{
      ...etat,
      obtenirNotes,
      ajouterNote,
      modifierNote,
      supprimerNote,
      restaurerNote,
      importerSauvegarde,
    }}>
      {children}
    </NotesContext.Provider>
  )
}
