import NoteCard from './NoteCard.jsx'

/**
 * Affiche la liste déjà filtrée/triée par App, ou un message vide adapté.
 * Les ids servent de clés stables ; les confirmations sont transmises aux cartes.
 * Ce composant ne charge, ne trie et ne sauvegarde aucune note.
 */
export default function NotesList({ notes, corbeille = false, onConfirmer }) {
  if (notes.length === 0) {
    return (
      <p className="liste-vide">
        {corbeille ? 'La corbeille est vide.'
          : 'Aucune note pour le moment. Parlez à l’assistant ou choisissez « Ajouter une note ».'}
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
