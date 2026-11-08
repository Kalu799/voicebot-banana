import { useRef, useState } from 'react'
import { useNotes } from '../stores/useNotes.js'

const champsVides = {
  titre: '',
  contenu: '',
  categorie: '',
  projet: '',
}

export default function NoteForm() {
  const { ajouterNote, chargement, rechargementRequis } = useNotes()
  const [champs, setChamps] = useState(champsVides)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const soumissionEnCours = useRef(false)
  const indisponible = chargement || rechargementRequis || sauvegarde

  function changerChamp(evenement) {
    const { name, value } = evenement.target
    setChamps(precedents => ({ ...precedents, [name]: value }))
    setConfirmation('')
  }

  async function soumettre(evenement) {
    evenement.preventDefault()
    if (indisponible || soumissionEnCours.current) return

    // Bloque aussi deux soumissions arrivant avant le prochain rendu.
    soumissionEnCours.current = true
    setSauvegarde(true)
    setConfirmation('')

    try {
      await ajouterNote(champs)
      setChamps(champsVides)
      setConfirmation('Note enregistrée.')
    } catch {
      // App affiche l'erreur du store ; le formulaire conserve la saisie.
    } finally {
      soumissionEnCours.current = false
      setSauvegarde(false)
    }
  }

  return (
    <form onSubmit={soumettre} aria-busy={sauvegarde}>
      <fieldset disabled={indisponible}>
        <legend className="sr-only">Détails de la nouvelle note</legend>

        <label htmlFor="note-titre">Titre <span>(obligatoire)</span></label>
        <input id="note-titre" name="titre" value={champs.titre}
          onChange={changerChamp} required />

        <label htmlFor="note-contenu">Contenu</label>
        <textarea id="note-contenu" name="contenu" value={champs.contenu}
          onChange={changerChamp} rows={5} />

        <label htmlFor="note-categorie">Catégorie</label>
        <input id="note-categorie" name="categorie" value={champs.categorie}
          onChange={changerChamp} />

        <label htmlFor="note-projet">Projet</label>
        <input id="note-projet" name="projet" value={champs.projet}
          onChange={changerChamp} />

        <button type="submit">
          {sauvegarde ? 'Enregistrement…' : 'Enregistrer la note'}
        </button>
      </fieldset>
      <p className="confirmation" role="status">{confirmation}</p>
    </form>
  )
}
