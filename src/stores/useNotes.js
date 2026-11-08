import { useContext } from 'react'
import { NotesContext } from './NotesContext.js'

export function useNotes() {
  const contexte = useContext(NotesContext)

  if (contexte === null) {
    throw new Error('useNotes doit être utilisé dans un NotesProvider.')
  }

  return contexte
}
