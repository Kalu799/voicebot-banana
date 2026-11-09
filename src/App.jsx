import { useRef, useState } from 'react'
import NoteForm from './components/NoteForm.jsx'
import NotesList from './components/NotesList.jsx'
import NotesBackup from './components/NotesBackup.jsx'
import ToolsSimulator from './components/ToolsSimulator.jsx'
import ConversationPanel from './components/ConversationPanel.jsx'
import { useNotes } from './stores/useNotes.js'

/**
 * Écran principal : assemble la conversation, la navigation et les notes du store.
 * La vue choisie et les confirmations restent locales à l'interface ; les notes
 * sauvegardées appartiennent au NotesProvider. Aucun accès IndexedDB ici.
 */
export default function App() {
  const { notes, chargement, erreur, rechargementRequis } = useNotes()
  const [vue, setVue] = useState('actives')
  const [confirmation, setConfirmation] = useState('')
  const boutonMesNotes = useRef(null)
  // filter produit une nouvelle liste : le tri ne modifie pas celle du store.
  const notesActives = notes
    .filter(note => note.deletedAt === null)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  const notesSupprimees = notes
    .filter(note => note.deletedAt !== null)
    .sort((a, b) => Date.parse(b.deletedAt) - Date.parse(a.deletedAt))

  /**
   * Affiche le panneau demandé et efface la confirmation de la vue précédente.
   * Les panneaux masqués restent montés : leurs brouillons ne sont pas réinitialisés.
   */
  function afficherVue(prochaineVue) {
    setVue(prochaineVue)
    setConfirmation('')
  }

  /**
   * Callback appelé après création sauvegardée : revient aux notes actives,
   * annonce la réussite et replace le focus hors du formulaire désormais masqué.
   */
  function terminerCreation() {
    setVue('actives')
    setConfirmation('Note enregistrée.')
    // Le formulaire va être masqué : rendre le focus à une commande visible.
    boutonMesNotes.current?.focus()
  }

  return (
    <main className="application">
      <header className="entete">
        <p className="marque">BananaNavy · Voicebot</p>
        <h1>Vos notes commencent par une idée.</h1>
        <p>Parlez de vos idées, retrouvez-les ici.</p>
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

      <div className="espace-travail">
        {/* La conversation reste montée pendant toute la navigation à droite. */}
        <aside className="espace-conversation" aria-label="Assistant vocal">
          <ConversationPanel />
          <details className="acces-simulateur">
            <summary>Ouvrir le simulateur</summary>
            <ToolsSimulator />
          </details>
        </aside>

        <section className="panneau espace-notes" aria-label="Gestion des notes">
          <nav className="navigation-notes" aria-label="Navigation des notes">
            <button ref={boutonMesNotes} type="button"
              aria-pressed={vue === 'actives'} aria-controls="vue-notes-actives"
              onClick={() => afficherVue('actives')}>
              Mes notes{!chargement && <span className="compteur">{notesActives.length}</span>}
            </button>
            <button type="button" aria-pressed={vue === 'corbeille'}
              aria-controls="vue-corbeille" onClick={() => afficherVue('corbeille')}>
              Corbeille{!chargement && <span className="compteur">{notesSupprimees.length}</span>}
            </button>
            <button type="button" aria-pressed={vue === 'creation'}
              aria-controls="vue-creation" onClick={() => afficherVue('creation')}>
              Ajouter une note
            </button>
            <button type="button" aria-pressed={vue === 'sauvegarde'}
              aria-controls="vue-sauvegarde" onClick={() => afficherVue('sauvegarde')}>
              Sauvegarde
            </button>
          </nav>

          <p className="confirmation" role="status">{confirmation}</p>

          {/* Masquer sans démonter conserve les brouillons et les états des panneaux. */}
          <div id="vue-creation" hidden={vue !== 'creation'}>
            <h2>Ajouter une note</h2>
            <p className="aide">Une idée à saisir au clavier ? Seul le titre est obligatoire.</p>
            <NoteForm onEnregistre={terminerCreation} />
          </div>

          <div id="vue-sauvegarde" hidden={vue !== 'sauvegarde'}>
            <NotesBackup />
          </div>

          <div id="vue-notes-actives" hidden={vue !== 'actives'}
            aria-busy={chargement}>
            <h2>Mes notes</h2>
            <p className="aide">Vos idées enregistrées, à retrouver et à faire grandir.</p>
            {chargement ? <p role="status">Chargement des notes…</p>
              : rechargementRequis && notes.length === 0
                ? <p>Rechargez la page pour retrouver vos notes.</p>
                : <NotesList notes={notesActives} onConfirmer={setConfirmation} />}
          </div>

          <div id="vue-corbeille" hidden={vue !== 'corbeille'}
            aria-busy={chargement}>
            <h2>Corbeille</h2>
            <p className="aide">Les notes mises de côté peuvent être restaurées.</p>
            {chargement ? <p role="status">Chargement des notes…</p>
              : rechargementRequis && notes.length === 0
                ? <p>Rechargez la page pour retrouver vos notes.</p>
                : <NotesList notes={notesSupprimees} corbeille onConfirmer={setConfirmation} />}
          </div>
        </section>
      </div>

      <p className="pied-page">Vos notes sont conservées dans ce navigateur.</p>
    </main>
  )
}
