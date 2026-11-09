import { createContext } from 'react'

// Canal de partage entre NotesProvider et useNotes. null permet au hook
// de détecter un composant utilisé en dehors du provider au lieu de masquer l’erreur.
export const NotesContext = createContext(null)
