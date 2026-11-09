import {
  ConversationProvider,
  useConversationClientTool,
} from '@elevenlabs/react'
import { creerOutilsNotes } from '../services/notesTools.js'
import { useNotes } from '../stores/useNotes.js'

// Tous les outils renvoient à l’agent le même format JSON.
// Les mutations attendent la sauvegarde réelle avant de répondre.

/**
 * Adapte la réponse structurée d’un outil local en chaîne JSON pour le SDK.
 * Attend son résultat, donc la sauvegarde pour une mutation, avant de répondre.
 */
function resultatPourAgent(outil) {
  return async parametres => {
    const resultat = await outil(parametres)
    return JSON.stringify(resultat)
  }
}

/**
 * Enregistre les six fonctions auprès du SDK sans produire d’interface.
 * Leurs noms doivent correspondre aux outils configurés dans l’agent distant ;
 * le store injecté est celui utilisé par l’interface et le simulateur.
 */
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

/**
 * Fournit une conversation SDK commune au panneau et aux outils.
 * Doit être monté sous NotesProvider pour que l’enregistrement accède aux notes.
 */
export default function ConversationNotesProvider({ children }) {
  return (
    <ConversationProvider>
      <OutilsConversationNotes />
      {children}
    </ConversationProvider>
  )
}
