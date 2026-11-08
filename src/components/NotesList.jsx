import NoteCard from './NoteCard.jsx'

export default function NotesList({ notes, corbeille = false, onConfirmer }) {
  if (notes.length === 0) {
    return (
      <p className="liste-vide">
        {corbeille ? 'La corbeille est vide.'
          : 'Aucune note pour le moment. Créez votre première note avec le formulaire.'}
      </p>
    )
  }

  return (
    <ul className="notes-liste">
      {notes.map(note => (
        <li key={note.id}><NoteCard note={note} onConfirmer={onConfirmer} /></li>
      ))}
    </ul>
  )
}
