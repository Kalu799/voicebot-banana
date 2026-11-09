import {
  ConversationProvider,
  useConversationClientTool,
} from '@elevenlabs/react'
import { creerOutilsNotes } from '../services/notesTools.js'
import { useNotes } from '../stores/useNotes.js'

// Tous les outils renvoient à l’agent le même format JSON.
// Les mutations attendent la sauvegarde réelle avant de répondre.
function resultatPourAgent(outil) {
  return async parametres => {
    const resultat = await outil(parametres)
    return JSON.stringify(resultat)
  }
}

function OutilsConversationNotes() {
  const store = useNotes()
  const outils = creerOutilsNotes(store)

  // Les noms correspondent exactement aux définitions ElevenLabs.
  // Chaque hook reste appelé à chaque rendu, sans boucle ni condition.
  useConversationClientTool(
    'creer_note', resultatPourAgent(outils.creer_note),
  )
  useConversationClientTool(
    'chercher_notes', resultatPourAgent(outils.chercher_notes),
  )
  useConversationClientTool(
    'lire_note', resultatPourAgent(outils.lire_note),
  )
  useConversationClientTool(
    'modifier_note', resultatPourAgent(outils.modifier_note),
  )
  useConversationClientTool(
    'supprimer_note', resultatPourAgent(outils.supprimer_note),
  )
  useConversationClientTool(
    'restaurer_note', resultatPourAgent(outils.restaurer_note),
  )

  return null
}

export default function ConversationNotesProvider({ children }) {
  return (
    <ConversationProvider>
      <OutilsConversationNotes />
      {children}
    </ConversationProvider>
  )
}
