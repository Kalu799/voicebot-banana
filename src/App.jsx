import { useState } from 'react'
import NoteForm from './components/NoteForm.jsx'
import NotesList from './components/NotesList.jsx'
import NotesBackup from './components/NotesBackup.jsx'
import ToolsSimulator from './components/ToolsSimulator.jsx'
import ConversationPanel from './components/ConversationPanel.jsx'
import { useNotes } from './stores/useNotes.js'

export default function App() {
  const { notes, chargement, erreur, rechargementRequis } = useNotes()
  const [vue, setVue] = useState('actives')
  const [confirmation, setConfirmation] = useState('')
  // filter produit une nouvelle liste : le tri ne modifie pas celle du store.
  const notesActives = notes
    .filter(note => note.deletedAt === null)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  const notesSupprimees = notes
    .filter(note => note.deletedAt !== null)
    .sort((a, b) => Date.parse(b.deletedAt) - Date.parse(a.deletedAt))

  return (
    <main className="application">
      <header className="entete">
        <p className="marque">BananaNavy · Voicebot</p>
        <h1>Vos notes commencent par une idée.</h1>
        <p>Un espace pour noter, retrouver et faire grandir vos idées.</p>
      </header>

      {erreur && (
        <div className="erreur" role="alert">
          <p>{erreur}</p>
          {rechargementRequis && (
            <button type="button" onClick={() => window.location.reload()}>
              Recharger la page
            </button>
          )}
        </div>
      )}

      <ConversationPanel />
      <NotesBackup />

      <div className="espace-notes">
        <section className="panneau" aria-labelledby="nouvelle-note">
          <h2 id="nouvelle-note">Nouvelle note</h2>
          <p className="aide">Seul le titre est obligatoire.</p>
          <NoteForm />
        </section>

        <section className="panneau" aria-labelledby="notes-enregistrees"
          aria-busy={chargement}>
          <h2 id="notes-enregistrees">
            {vue === 'actives' ? 'Mes notes' : 'Corbeille'}
          </h2>
          <div className="choix-vue" role="group" aria-label="Afficher les notes">
            <button type="button" aria-pressed={vue === 'actives'}
              onClick={() => setVue('actives')}>
              Mes notes{!chargement && ` (${notesActives.length})`}
            </button>
            <button type="button" aria-pressed={vue === 'corbeille'}
              onClick={() => setVue('corbeille')}>
              Corbeille{!chargement && ` (${notesSupprimees.length})`}
            </button>
          </div>
          <p className="confirmation" role="status">{confirmation}</p>
          {chargement ? (
            <p role="status">Chargement des notes…</p>
          ) : rechargementRequis && notes.length === 0 ? (
            <p>Rechargez la page pour retrouver vos notes.</p>
          ) : (
            <>
              {/* Garder les listes montées préserve un brouillon lors du changement de vue. */}
              <div hidden={vue !== 'actives'}>
                <NotesList notes={notesActives} onConfirmer={setConfirmation} />
              </div>
              <div hidden={vue !== 'corbeille'}>
                <NotesList notes={notesSupprimees} corbeille onConfirmer={setConfirmation} />
              </div>
            </>
          )}
        </section>
      </div>

      <ToolsSimulator />

      <p className="pied-page">Vos notes sont conservées dans ce navigateur.</p>
    </main>
  )
}
