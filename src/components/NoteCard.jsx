import { useRef, useState } from 'react'
import { useNotes } from '../stores/useNotes.js'
import NoteForm from './NoteForm.jsx'

/**
 * Affiche une note et ses commandes selon deletedAt : édition/suppression si
 * active, restauration si en corbeille. Gère l’ouverture du formulaire localement
 * et remonte les confirmations à App pour qu’elles survivent au déplacement de carte.
 */
export default function NoteCard({ note, onConfirmer = () => {} }) {
  const { supprimerNote, restaurerNote, supprimerDefinitivementNotes, chargement, rechargementRequis } = useNotes()
  const [edition, setEdition] = useState(false)
  const [actionEnCours, setActionEnCours] = useState('')
  const actionVerrouillee = useRef(false)
  const enCorbeille = note.deletedAt !== null
  const indisponible = chargement || rechargementRequis || Boolean(actionEnCours)

  /**
   * Choisit suppression ou restauration selon l’état de la carte.
   * Attend la sauvegarde avant confirmation et empêche deux clics rapprochés.
   * Si l’écriture échoue, le store ne déplace pas la note et App affiche l’erreur.
   */
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

  async function supprimerDefinitivement() {
    if (indisponible || actionVerrouillee.current) return
    if (!window.confirm(`Supprimer définitivement la note « ${note.titre} » ? Cette action est irréversible.`)) return
    actionVerrouillee.current = true
    setActionEnCours('effacement')
    onConfirmer('')
    try {
      await supprimerDefinitivementNotes([note.id])
      onConfirmer('Note supprimée définitivement.')
    } catch {
      // Le store affiche l’erreur et conserve la note si l’écriture échoue.
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
          {actionEnCours && actionEnCours !== 'effacement'
            ? enCorbeille ? 'Restauration…' : 'Mise en corbeille…'
            : enCorbeille ? 'Restaurer' : 'Mettre en corbeille'}
        </button>
        {enCorbeille && (
          <button type="button" className="bouton-danger" disabled={indisponible}
            onClick={supprimerDefinitivement}>
            {actionEnCours === 'effacement' ? 'Suppression…' : 'Supprimer définitivement'}
          </button>
        )}
      </div>
    </article>
  )
}
