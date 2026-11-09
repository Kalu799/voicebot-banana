import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Construit une réponse JSON HTTP avec interdiction de cache, quel que soit
 * le statut. Accepte des en-têtes complémentaires, par exemple Allow sur un 405.
 */
function repondre(statut, donnees, entetes = {}) {
  return Response.json(donnees, {
    status: statut,
    headers: {
      'Cache-Control': 'no-store',
      ...entetes,
    },
  })
}

/**
 * Calcule SHA-256 en Buffer de longueur fixe pour comparer le code à son empreinte
 * configurée. Le code reçu n’est ni persisté ni renvoyé au navigateur.
 */
function empreinte(valeur) {
  return createHash('sha256').update(valeur).digest()
}

/**
 * Extrait un code Bearer au format strict, calcule son empreinte et la compare
 * avec timingSafeEqual. L’empreinte attendue doit avoir été validée par la route.
 * Le contrôle d’origine complémentaire ne remplace pas ce contrôle d’accès.
 */
function accesAutorise(autorisation, empreinteAttendue) {
  const correspondance =
    /^Bearer ([A-Za-z0-9_-]{32,128})$/.exec(autorisation ?? '')

  if (!correspondance) return false

  return timingSafeEqual(
    empreinte(correspondance[1]),
    Buffer.from(empreinteAttendue, 'hex'),
  )
}

/**
 * Fabrique le gestionnaire HTTP à partir de l’environnement et du transport fetch.
 * Les tests injectent leurs propres valeurs sans secret ni appel ElevenLabs.
 * Seul ce module serveur lit la clé API. La limitation IP Vercel est configurée
 * hors de cette fonction ; aucune limitation distribuée n’est implémentée ici.
 */
export function creerRouteJeton({
  env = process.env,
  demander = fetch,
} = {}) {

  /**
   * Contrôle dans l’ordre : méthode, activation, configuration, origine puis code.
   * Après autorisation seulement, demande un jeton pour l’agent fixé côté serveur,
   * avec délai de 10 s. Renvoie le jeton en 200 ou une erreur publique sans secret.
   * Ne reçoit ni notes ni audio : ceux-ci passent par la conversation dans le SDK.
   */
  return async function traiterDemande(requete) {
    if (requete.method !== 'POST') {
      return repondre(405, {
        erreur: 'Méthode non autorisée.',
      }, { Allow: 'POST' })
    }

    // Verrou explicite : seule la valeur exacte true ouvre cette route dans cet environnement.
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
