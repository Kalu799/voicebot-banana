import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { NotesProvider } from './stores/NotesProvider.jsx'
import ConversationNotesProvider
  from './components/ConversationNotesProvider.jsx'
import './styles.css'

// StrictMode aide à repérer certains problèmes pendant le développement.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotesProvider>
      {/* Le pont vocal doit pouvoir accéder au store des notes. */}
      <ConversationNotesProvider>
        <App />
      </ConversationNotesProvider>
    </NotesProvider>
  </StrictMode>,
)
