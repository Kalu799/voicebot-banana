export default function NoteCard({ note }) {
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
    </article>
  )
}
