import { useId, useRef, useState } from 'react'
import { creerOutilsNotes } from '../services/notesTools.js'
import { useNotes } from '../stores/useNotes.js'

const exemples = {
  creer_note: {
    titre: 'Idée de vidéo BananaNavy',
    contenu: 'Durée : trente secondes.',
    categorie: 'Idée',
    projet: 'BananaNavy',
  },
  chercher_notes: { texte: 'BananaNavy', corbeille: false, limite: 5 },
  lire_note: { id: 'IDENTIFIANT_DE_LA_NOTE' },
  modifier_note: {
    id: 'IDENTIFIANT_DE_LA_NOTE',
    changements: { contenu: 'Durée : une minute.' },
  },
  supprimer_note: { id: 'IDENTIFIANT_DE_LA_NOTE' },
  restaurer_note: { id: 'IDENTIFIANT_DE_LA_NOTE' },
}

/**
 * Permet d’appeler les six outils communs avec du JSON, sans microphone ni réseau
 * ElevenLabs. Les écritures sont réelles. Les paramètres et le dernier résultat
 * restent dans l’état du composant et disparaissent au rechargement.
 */
export default function ToolsSimulator() {
  const store = useNotes()
  const outils = creerOutilsNotes(store)
  const identifiant = useId()
  const verrou = useRef(false)
  const [outil, setOutil] = useState('creer_note')
  const [parametres, setParametres] = useState(
    JSON.stringify(exemples.creer_note, null, 2),
  )
  const [enCours, setEnCours] = useState(false)
  const [resultat, setResultat] = useState(null)
  const indisponible = store.chargement || store.rechargementRequis || enCours

  /**
   * Charge l’exemple JSON de l’outil choisi, sans exécuter d’action.
   * Le précédent résultat garde son propre nom d’outil pour éviter toute confusion.
   */
  function changerOutil(evenement) {
    const nom = evenement.target.value
    setOutil(nom)
    setParametres(JSON.stringify(exemples[nom], null, 2))
  }

  /**
   * Parse le JSON, vérifie le nom de l’outil et attend l’adaptateur partagé.
   * Affiche un résultat structuré même en cas de JSON invalide ; conserve la saisie
   * pour correction et libère le verrou dans tous les cas.
   */
  async function executer(evenement) {
    evenement.preventDefault()
    if (indisponible || verrou.current) return

    verrou.current = true
    setEnCours(true)

    try {
      let valeurs
      try {
        valeurs = JSON.parse(parametres)
      } catch {
        throw new Error('Les paramètres ne contiennent pas un JSON valide.')
      }

      if (!Object.hasOwn(outils, outil)) {
        throw new Error('Outil inconnu.')
      }

      const donnees = await outils[outil](valeurs)
      // Associer le résultat à l'appel exécuté, même après un changement de sélection.
      setResultat({ outil, donnees })
    } catch (cause) {
      setResultat({
        outil,
        donnees: {
          succes: false,
          erreur: cause instanceof Error
            ? cause.message : 'Impossible d’exécuter la simulation.',
        },
      })
    } finally {
      verrou.current = false
      setEnCours(false)
    }
  }

  return (
    <section className="panneau simulateur"
      aria-labelledby={`${identifiant}-titre`} aria-busy={enCours}>
      <h2 id={`${identifiant}-titre`}>Simulation des outils</h2>
      <p className="aide">
        Simulation locale, sans microphone ni appel ElevenLabs.
        Les actions modifient réellement vos notes enregistrées.
      </p>

      <form onSubmit={executer}>
        <fieldset disabled={indisponible}>
          <legend className="sr-only">Appel d’un outil de notes</legend>

          <label htmlFor={`${identifiant}-outil`}>Outil à simuler</label>
          <select id={`${identifiant}-outil`} value={outil} onChange={changerOutil}>
            {Object.keys(exemples).map(nom => (
              <option key={nom} value={nom}>{nom}</option>
            ))}
          </select>

          <label htmlFor={`${identifiant}-parametres`}>Paramètres JSON</label>
          <p id={`${identifiant}-aide`} className="aide">
            Pour cibler une note, copiez son identifiant depuis un résultat
            de création ou de recherche.
          </p>
          <textarea id={`${identifiant}-parametres`}
            aria-describedby={`${identifiant}-aide`}
            className="parametres-json" value={parametres}
            onChange={evenement => setParametres(evenement.target.value)}
            rows={9} spellCheck={false} />

          <button type="submit">
            {enCours ? 'Simulation en cours…' : 'Exécuter la simulation'}
          </button>
        </fieldset>
      </form>

      <p className="confirmation" role="status">
        {enCours ? 'Exécution locale en cours…'
          : resultat ? resultat.donnees.succes
            ? 'Simulation terminée avec succès.' : 'La simulation a échoué.'
          : ''}
      </p>

      {resultat && (
        <div className="resultat-simulation">
          <h3 id={`${identifiant}-resultat`}>Dernier résultat : {resultat.outil}</h3>
          <pre tabIndex={0} aria-labelledby={`${identifiant}-resultat`}>
            <code>{JSON.stringify(resultat.donnees, null, 2)}</code>
          </pre>
        </div>
      )}
    </section>
  )
}
