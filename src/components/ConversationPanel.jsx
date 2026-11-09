import { useCallback, useEffect, useRef, useState } from 'react'
import { useConversation } from '@elevenlabs/react'
import { obtenirJetonConversation } from '../services/conversationAccess.js'
import { useNotes } from '../stores/useNotes.js'

export default function ConversationPanel() {
  const { chargement, rechargementRequis } = useNotes()
  const [code, setCode] = useState('')
  const [etape, setEtape] = useState('repos')
  const [information, setInformation] = useState('')
  const [secondes, setSecondes] = useState(0)
  const [messages, setMessages] = useState([])

  // Une référence bloque immédiatement les doubles clics et les retours obsolètes.
  const tentative = useRef(null)

  const { startSession, endSession, status, isSpeaking } = useConversation({
    onConnect() {
      const courante = tentative.current
      if (!courante) {
        endSession()
        return
      }

      courante.connexion = performance.now()
      courante.activite = courante.connexion
      setEtape('conversation')
    },

    onDisconnect() {
      tentative.current?.controleur.abort()
      tentative.current = null
      setEtape('repos')
    },

    onError() {
      if (!tentative.current) return
      arreter('La conversation a rencontré une erreur.')
    },

    onMessage({ message, role }) {
      if (!tentative.current) return
      tentative.current.activite = performance.now()

      // Transcription temporaire et bornée, sans sauvegarde locale.
      setMessages(liste => [
        ...liste,
        { texte: message, auteur: role === 'user' ? 'Vous' : 'Assistant' },
      ].slice(-40))
    },

    onAudio() {
      // Une réponse audio reçue compte aussi comme activité.
      if (tentative.current) {
        tentative.current.activite = performance.now()
      }
    },
  })

  const arreter = useCallback((raison = '') => {
    const courante = tentative.current
    tentative.current = null
    courante?.controleur.abort()

    // Le SDK gère également l’arrêt d’une connexion encore en préparation.
    endSession()
    setEtape('repos')
    setCode('')
    setInformation(raison)
  }, [endSession])

  useEffect(() => {
    const minuterie = window.setInterval(() => {
      const courante = tentative.current
      if (!courante) return
      const maintenant = performance.now()

      if (courante.connexion === null) {
        if (maintenant - courante.debut >= 30_000) {
          arreter('Connexion trop longue. Réessayez plus tard.')
        }
        return
      }

      const duree = maintenant - courante.connexion
      setSecondes(Math.floor(duree / 1000))

      if (duree >= 120_000) {
        arreter('Session arrêtée après deux minutes.')
      } else if (maintenant - courante.activite >= 30_000) {
        arreter('Session arrêtée après trente secondes sans échange reçu.')
      }
    }, 500)

    const quitter = () => arreter()
    const masquer = () => {
      if (document.hidden) arreter()
    }

    window.addEventListener('pagehide', quitter)
    document.addEventListener('visibilitychange', masquer)

    return () => {
      window.clearInterval(minuterie)
      window.removeEventListener('pagehide', quitter)
      document.removeEventListener('visibilitychange', masquer)
      arreter()
    }
  }, [arreter])

  async function demarrer(evenement) {
    evenement.preventDefault()
    if (tentative.current || chargement || rechargementRequis) return
    if (status === 'connecting' || status === 'connected') return

    const courante = {
      controleur: new AbortController(),
      debut: performance.now(),
      connexion: null,
      activite: performance.now(),
    }

    tentative.current = courante
    setInformation('')
    setMessages([])
    setSecondes(0)
    setEtape('jeton')

    try {
      // Combiner l’arrêt manuel et une limite de quinze secondes.
      const signal = AbortSignal.any([
        courante.controleur.signal,
        AbortSignal.timeout(15_000),
      ])
      const attente = obtenirJetonConversation(code, signal)
      setCode('')
      const token = await attente

      // Un jeton arrivé après « Arrêter » ne doit pas ouvrir de session.
      if (tentative.current !== courante) return

      setEtape('connexion')

      // La connexion est confirmée par onConnect, pas par le retour de cet appel.
      startSession({ conversationToken: token, connectionType: 'webrtc' })
    } catch (cause) {
      if (tentative.current !== courante) return
      arreter(
        cause instanceof Error
          ? cause.message
          : 'Impossible de démarrer la conversation.',
      )
    }
  }

  const occupe = etape !== 'repos'
    || status === 'connecting'
    || status === 'connected'
  const duree = `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, '0')}`
  const libelle = etape === 'jeton'
    ? 'Vérification de l’accès…'
    : etape === 'connexion'
      ? 'Connexion et accès au microphone…'
      : etape === 'conversation'
        ? isSpeaking ? 'L’assistant répond.' : 'À votre écoute.'
        : 'Conversation arrêtée.'

  return (
    <section className="panneau conversation" aria-labelledby="titre-conversation">
      <h2 id="titre-conversation">Conversation vocale</h2>
      <p className="aide">
        Le microphone sert à parler à l’assistant.
        Les échanges et les notes transmises passent par ElevenLabs.
        La session s’arrête aussi lorsque vous masquez cette page.
      </p>

      <form className="commandes-conversation" onSubmit={demarrer}>
        <label htmlFor="code-conversation">Code d’accès personnel</label>
        <input
          id="code-conversation"
          type="password"
          autoComplete="off"
          value={code}
          onChange={evenement => setCode(evenement.target.value)}
          disabled={occupe}
        />
        <button type="submit"
          disabled={occupe || chargement || rechargementRequis || !code}>
          Démarrer
        </button>
        <button type="button" disabled={!occupe}
          onClick={() => arreter()}>
          Arrêter
        </button>
      </form>

      <p role="status">{libelle} {information}</p>
      <p>Durée : {duree}</p>

      <div className="transcription-entete">
        <h3 id="titre-transcription">Transcription</h3>
        <span>Temporaire</span>
      </div>
      {messages.length === 0 && (
        <p className="transcription-vide">Vos échanges avec l’assistant apparaîtront ici.</p>
      )}
      <ol className="transcription" aria-label="Messages de la conversation"
        tabIndex={messages.length > 0 ? 0 : undefined}>
        {messages.map((message, index) => (
          <li key={index}>
            <strong>{message.auteur} :</strong> {message.texte}
          </li>
        ))}
      </ol>
    </section>
  )
}
