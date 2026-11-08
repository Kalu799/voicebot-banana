import { createHash, timingSafeEqual } from 'node:crypto'

// Toutes les réponses interdisent la mise en cache, notamment celle du jeton.
function repondre(statut, donnees, entetes = {}) {
  return Response.json(donnees, {
    status: statut,
    headers: {
      'Cache-Control': 'no-store',
      ...entetes,
    },
  })
}

function empreinte(valeur) {
  return createHash('sha256').update(valeur).digest()
}

// Le serveur conserve une empreinte du code, pas le code lui-même.
function accesAutorise(autorisation, empreinteAttendue) {
  const correspondance =
    /^Bearer ([A-Za-z0-9_-]{32,128})$/.exec(autorisation ?? '')

  if (!correspondance) return false

  return timingSafeEqual(
    empreinte(correspondance[1]),
    Buffer.from(empreinteAttendue, 'hex'),
  )
}

// Les dépendances sont remplaçables dans les tests, sans appel réel.
export function creerRouteJeton({
  env = process.env,
  demander = fetch,
} = {}) {
  return async function traiterDemande(requete) {
    if (requete.method !== 'POST') {
      return repondre(405, {
        erreur: 'Méthode non autorisée.',
      }, { Allow: 'POST' })
    }

    // Ce verrou restera fermé jusqu’à la vérification de la protection Vercel.
    if (env.VOICEBOT_VOIX_ACTIVE !== 'true') {
      return repondre(503, {
        erreur: 'L’accès vocal est désactivé.',
      })
    }

    const {
      ELEVENLABS_API_KEY: cle,
      ELEVENLABS_AGENT_ID: agentId,
      VOICEBOT_ORIGINE: origine,
      VOICEBOT_CODE_ACCES_SHA256: codeHash,
    } = env

    let configurationValide = false

    try {
      configurationValide = Boolean(
        cle?.trim()
        && agentId?.trim()
        && origine
        && new URL(origine).origin === origine
        && /^[a-f0-9]{64}$/i.test(codeHash ?? ''),
      )
    } catch {
      configurationValide = false
    }

    if (!configurationValide) {
      return repondre(503, {
        erreur: 'L’accès vocal est indisponible.',
      })
    }

    if (requete.headers.get('origin') !== origine) {
      return repondre(403, {
        erreur: 'Origine non autorisée.',
      })
    }

    if (!accesAutorise(
      requete.headers.get('authorization'),
      codeHash,
    )) {
      return repondre(401, {
        erreur: 'Code d’accès invalide.',
      })
    }

    // L’agent est choisi par le serveur, jamais par les paramètres du navigateur.
    const url = new URL(
      'https://api.elevenlabs.io/v1/convai/conversation/token',
    )
    url.searchParams.set('agent_id', agentId)

    try {
      const reponse = await demander(url, {
        headers: { 'xi-api-key': cle },
        signal: AbortSignal.timeout(10_000),
        redirect: 'error',
      })

      if (!reponse.ok) {
        return repondre(502, {
          erreur: 'Impossible d’obtenir un accès à la conversation.',
        })
      }

      const resultat = await reponse.json()

      if (typeof resultat?.token !== 'string'
        || !resultat.token.trim()) {
        throw new Error('Réponse de jeton invalide.')
      }

      return repondre(200, { token: resultat.token })
    } catch {
      // Ne transmettre ni secret ni détail technique du fournisseur.
      return repondre(502, {
        erreur: 'Le service de conversation est indisponible.',
      })
    }
  }
}
