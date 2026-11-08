import { useId, useRef, useState } from 'react'
import { exporterNotes } from '../services/notesBackup.js'
import { useNotes } from '../stores/useNotes.js'

function decrireImport({ importees, ignorees }) {
  const ajout = importees === 1 ? 'note ajoutée' : 'notes ajoutées'
  const ignore = ignorees === 1 ? 'note ignorée' : 'notes ignorées'
  return `${importees} ${ajout} et ${ignorees} ${ignore}.`
}

export default function NotesBackup() {
  const { importerSauvegarde, chargement, rechargementRequis } = useNotes()
  const identifiant = useId()
  const inputFichier = useRef(null)
  const verrou = useRef(false)
  const [operation, setOperation] = useState('')
  const [message, setMessage] = useState('')
  const [erreurLocale, setErreurLocale] = useState('')
  const indisponible = chargement || rechargementRequis || Boolean(operation)

  function commencer(nom) {
    if (indisponible || verrou.current) return false

    verrou.current = true
    setOperation(nom)
    setMessage('')
    setErreurLocale('')
    return true
  }

  function terminer() {
    verrou.current = false
    setOperation('')
  }

  async function exporter() {
    if (!commencer('export')) return

    try {
      const fichier = await exporterNotes()
      const url = URL.createObjectURL(fichier)
      const lien = document.createElement('a')
      lien.href = url
      lien.download = fichier.name
      document.body.append(lien)

      try {
        lien.click()
      } finally {
        lien.remove()
        // Laisser le navigateur démarrer le téléchargement avant de libérer l'URL.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }

      setMessage('Téléchargement de la sauvegarde demandé.')
    } catch (cause) {
      setErreurLocale(cause.message)
    } finally {
      terminer()
    }
  }

  async function importer(evenement) {
    const selection = evenement.currentTarget
    const fichier = selection.files?.[0]

    // Permet de sélectionner à nouveau le même fichier, même après un refus.
    selection.value = ''
    if (!fichier || !commencer('import')) return

    try {
      const resultat = await importerSauvegarde(fichier)
      setMessage(decrireImport(resultat))
    } catch (cause) {
      // App affiche les erreurs d'import du store.
      if (cause.importEnregistre) {
        setMessage(`Import enregistré : ${decrireImport(cause.resultatImport)}`)
      }
    } finally {
      terminer()
    }
  }

  return (
    <section className="panneau sauvegardes"
      aria-labelledby={`${identifiant}-titre`} aria-busy={Boolean(operation)}>
      <div className="sauvegardes-entete">
        <div>
          <h2 id={`${identifiant}-titre`}>Sauvegardes</h2>
          <p className="aide">
            Exportez vos notes, corbeille comprise. À l’import,
            les notes déjà présentes sont conservées.
          </p>
        </div>
        <div className="actions-note">
          <button type="button" disabled={indisponible} onClick={exporter}>
            {operation === 'export' ? 'Export en cours…' : 'Exporter les notes'}
          </button>
          <button type="button" className="bouton-secondaire"
            disabled={indisponible} onClick={() => inputFichier.current.click()}>
            {operation === 'import' ? 'Import en cours…' : 'Importer une sauvegarde'}
          </button>
        </div>
      </div>

      <input ref={inputFichier} type="file" accept=".json,application/json"
        hidden disabled={indisponible} onChange={importer} />
      <p className="confirmation" role="status">{message}</p>
      {erreurLocale && <p className="erreur" role="alert">{erreurLocale}</p>}
    </section>
  )
}
