import NoteCard from './NoteCard.jsx'

export default function NotesList({ notes }) {
  if (notes.length === 0) {
    return (
      <p className="liste-vide">
        Aucune note pour le moment. Créez votre première note avec le formulaire.
      </p>
    )
  }

  return (
    <ul className="notes-liste">
      {notes.map(note => (
        <li key={note.id}><NoteCard note={note} /></li>
      ))}
    </ul>
  )
}
