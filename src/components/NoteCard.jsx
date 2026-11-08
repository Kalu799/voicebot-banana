import { useRef, useState } from 'react'
import { useNotes } from '../stores/useNotes.js'
import NoteForm from './NoteForm.jsx'

export default function NoteCard({ note, onConfirmer = () => {} }) {
  const { supprimerNote, restaurerNote, chargement, rechargementRequis } = useNotes()
  const [edition, setEdition] = useState(false)
  const [actionEnCours, setActionEnCours] = useState('')
  const actionVerrouillee = useRef(false)
  const enCorbeille = note.deletedAt !== null
  const indisponible = chargement || rechargementRequis || Boolean(actionEnCours)

  async function changerCorbeille() {
    if (indisponible || actionVerrouillee.current) return

    actionVerrouillee.current = true
    setActionEnCours(enCorbeille ? 'restauration' : 'suppression')
    onConfirmer('')

    try {
      if (enCorbeille) {
        await restaurerNote(note.id)
        onConfirmer('Note restaurée.')
      } else {
        await supprimerNote(note.id)
        onConfirmer('Note mise en corbeille.')
      }
    } catch {
      // App affiche l'erreur ; la carte reste à sa place si la sauvegarde échoue.
    } finally {
      actionVerrouillee.current = false
      setActionEnCours('')
    }
  }

  if (edition && !enCorbeille) {
    return (
      <article className="note note-edition">
        <h3>Modifier la note</h3>
        <NoteForm
          note={note}
          onAnnuler={() => setEdition(false)}
          onEnregistre={() => {
            setEdition(false)
            onConfirmer('Note modifiée.')
          }}
        />
      </article>
    )
  }

  return (
    <article className="note">
      <h3>{note.titre}</h3>
      <p className="note-contenu">{note.contenu || 'Aucun contenu.'}</p>
      {(note.categorie || note.projet) && (
        <dl className="note-informations">
          {note.categorie && (
            <div><dt>Catégorie</dt><dd>{note.categorie}</dd></div>
          )}
          {note.projet && (
            <div><dt>Projet</dt><dd>{note.projet}</dd></div>
          )}
        </dl>
      )}
      <p className="note-date">
        Créée le{' '}
        <time dateTime={note.createdAt}>
          {new Date(note.createdAt).toLocaleString('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </time>
      </p>
      {enCorbeille && (
        <p className="note-date">
          Mise en corbeille le{' '}
          <time dateTime={note.deletedAt}>
            {new Date(note.deletedAt).toLocaleString('fr-FR', {
              dateStyle: 'medium', timeStyle: 'short',
            })}
          </time>
        </p>
      )}
      <div className="actions-note">
        {!enCorbeille && (
          <button type="button" className="bouton-secondaire" disabled={indisponible}
            onClick={() => {
              onConfirmer('')
              setEdition(true)
            }}>
            Modifier
          </button>
        )}
        <button type="button" className="bouton-secondaire" disabled={indisponible}
          onClick={changerCorbeille}>
          {actionEnCours
            ? enCorbeille ? 'Restauration…' : 'Mise en corbeille…'
            : enCorbeille ? 'Restaurer' : 'Mettre en corbeille'}
        </button>
      </div>
    </article>
  )
}
