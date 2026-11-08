import NoteForm from './components/NoteForm.jsx'
import NotesList from './components/NotesList.jsx'
import { useNotes } from './stores/useNotes.js'

export default function App() {
  const { notes, chargement, erreur, rechargementRequis } = useNotes()
  // filter produit une nouvelle liste : le tri ne modifie pas celle du store.
  const notesActives = notes
    .filter(note => note.deletedAt === null)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

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

      <div className="espace-notes">
        <section className="panneau" aria-labelledby="nouvelle-note">
          <h2 id="nouvelle-note">Nouvelle note</h2>
          <p className="aide">Seul le titre est obligatoire.</p>
          <NoteForm />
        </section>

        <section className="panneau" aria-labelledby="notes-actives"
          aria-busy={chargement}>
          <h2 id="notes-actives">
            Mes notes{!chargement && ` (${notesActives.length})`}
          </h2>
          {chargement ? (
            <p role="status">Chargement des notes…</p>
          ) : rechargementRequis && notesActives.length === 0 ? (
            <p>Rechargez la page pour retrouver vos notes.</p>
          ) : (
            <NotesList notes={notesActives} />
          )}
        </section>
      </div>

      <p className="pied-page">Vos notes sont conservées dans ce navigateur.</p>
    </main>
  )
}
