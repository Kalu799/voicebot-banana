import { useContext } from 'react'
import { NotesContext } from './NotesContext.js'

/**
 * Donne accès à l’état des notes et aux actions du provider parent.
 * Lève une erreur de configuration si aucun NotesProvider n’entoure le composant.
 */
export function useNotes() {
  const contexte = useContext(NotesContext)

  if (contexte === null) {
    throw new Error('useNotes doit être utilisé dans un NotesProvider.')
  }

  return contexte
}
