import { useId, useRef, useState } from 'react'
import { useNotes } from '../stores/useNotes.js'
import { preparerChangementsEdition } from '../utils/note.js'

const champsVides = {
  titre: '',
  contenu: '',
  categorie: '',
  projet: '',
}

export default function NoteForm({ note = null, onAnnuler, onEnregistre }) {
  const { ajouterNote, modifierNote, chargement, rechargementRequis } = useNotes()
  const identifiant = useId()
  // Garder la version d'ouverture, même si la note change pendant la saisie.
  const champsInitiaux = useRef(note ? {
    titre: note.titre,
    contenu: note.contenu,
    categorie: note.categorie,
    projet: note.projet,
  } : champsVides)
  const [champs, setChamps] = useState(champsInitiaux.current)
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
      if (note) {
        const changements = preparerChangementsEdition(champsInitiaux.current, champs)
        await modifierNote(note.id, changements, champsInitiaux.current)
        onEnregistre?.()
      } else {
        await ajouterNote(champs)
        setChamps(champsVides)
        setConfirmation('Note enregistrée.')
      }
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
        <legend className="sr-only">
          {note ? 'Modifier les détails de la note' : 'Détails de la nouvelle note'}
        </legend>

        <label htmlFor={`${identifiant}-titre`}>Titre <span>(obligatoire)</span></label>
        <input id={`${identifiant}-titre`} name="titre" value={champs.titre}
          onChange={changerChamp} required />

        <label htmlFor={`${identifiant}-contenu`}>Contenu</label>
        <textarea id={`${identifiant}-contenu`} name="contenu" value={champs.contenu}
          onChange={changerChamp} rows={5} />

        <label htmlFor={`${identifiant}-categorie`}>Catégorie</label>
        <input id={`${identifiant}-categorie`} name="categorie" value={champs.categorie}
          onChange={changerChamp} />

        <label htmlFor={`${identifiant}-projet`}>Projet</label>
        <input id={`${identifiant}-projet`} name="projet" value={champs.projet}
          onChange={changerChamp} />

        <div className="actions-note">
          <button type="submit">
            {sauvegarde ? 'Enregistrement…'
              : note ? 'Enregistrer les modifications' : 'Enregistrer la note'}
          </button>
          {note && (
            <button type="button" className="bouton-secondaire" onClick={onAnnuler}>
              Annuler
            </button>
          )}
        </div>
      </fieldset>
      <p className="confirmation" role="status">{confirmation}</p>
    </form>
  )
}
