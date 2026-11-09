import {
  ConversationProvider,
  useConversationClientTool,
} from '@elevenlabs/react'
import { creerOutilsNotes } from '../services/notesTools.js'
import { useNotes } from '../stores/useNotes.js'

// Ce composant enregistre un outil ; il n’affiche rien à l’écran.
function OutilCreationNote() {
  const store = useNotes()
  const outils = creerOutilsNotes(store)

  useConversationClientTool('creer_note', async parametres => {
    // Réutiliser les validations et la sauvegarde du simulateur.
    // La promesse ne réussit qu’après la transaction IndexedDB.
    const resultat = await outils.creer_note(parametres)

    // Transmettre à l’agent un résultat JSON contenant notamment succes.
    return JSON.stringify(resultat)
  })

  return null
}

export default function ConversationNotesProvider({ children }) {
  return (
    <ConversationProvider>
      <OutilCreationNote />
      {children}
    </ConversationProvider>
  )
}
