import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { creerRouteJeton } from '../server/routeJeton.js'
import routeVercel from '../api/conversation-token.js'

// Données fictives : aucune clé ni aucun jeton réels dans ce banc de test.
const code = 'code-fictif-de-test-avec-plus-de-32-caracteres'
const cle = 'cle-fictive-elevenlabs'
const origine = 'https://voicebot.example'
const configuration = {
  VOICEBOT_VOIX_ACTIVE: 'true',
  ELEVENLABS_API_KEY: cle,
  ELEVENLABS_AGENT_ID: 'agent_fictif',
  VOICEBOT_ORIGINE: origine,
  VOICEBOT_CODE_ACCES_SHA256: createHash('sha256').update(code).digest('hex'),
}

function requete({ method = 'POST', headers = {}, suffixe = '', body } = {}) {
  const entetes = new Headers({ origin: origine, authorization: `Bearer ${code}` })
  for (const [nom, valeur] of Object.entries(headers)) {
    if (valeur === null) entetes.delete(nom)
    else entetes.set(nom, valeur)
  }
  return new Request(`${origine}/api/conversation-token${suffixe}`, {
    method, headers: entetes, body,
  })
}

function preparer({ env = configuration, fournisseur } = {}) {
  const appels = []
  const route = creerRouteJeton({
    env,
    async demander(url, options) {
      appels.push({ url: new URL(url), options })
      return fournisseur
        ? fournisseur(url, options)
        : Response.json({ token: 'jeton-fictif', conversation_id: 'conversation-fictive' })
    },
  })
  return { route, appels }
}

async function verifierRefus(banc, demande, statut) {
  const reponse = await banc.route(demande)
  assert.equal(reponse.status, statut)
  assert.equal(reponse.headers.get('cache-control'), 'no-store')
  const donnees = await reponse.json()
  assert.equal(typeof donnees.erreur, 'string')
  assert.deepEqual(Object.keys(donnees), ['erreur'])
  assert.equal(banc.appels.length, 0, 'Un refus local ne contacte jamais ElevenLabs.')
  return reponse
}

test('route jeton : refuse les méthodes autres que POST', async () => {
  for (const method of ['GET', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']) {
    const reponse = await verifierRefus(preparer(), requete({ method }), 405)
    assert.equal(reponse.headers.get('allow'), 'POST')
  }
})

test('route jeton : verrou fermé sauf activation explicite', async () => {
  for (const valeur of [undefined, '', 'false', 'TRUE', '1']) {
    await verifierRefus(preparer({
      env: { ...configuration, VOICEBOT_VOIX_ACTIVE: valeur },
    }), requete(), 503)
  }
  await verifierRefus(preparer({ env: {} }), requete(), 503)
})

test('route jeton : configuration manquante ou invalide refusée', async () => {
  for (const nom of ['ELEVENLABS_API_KEY', 'ELEVENLABS_AGENT_ID',
    'VOICEBOT_ORIGINE', 'VOICEBOT_CODE_ACCES_SHA256']) {
    for (const valeur of [undefined, '', '   ']) {
      await verifierRefus(preparer({
        env: { ...configuration, [nom]: valeur },
      }), requete(), 503)
    }
  }
  for (const origineInvalide of ['pas-une-url', `${origine}/`,
    `${origine}/chemin`, `${origine}?parametre=1`, 'null', 'file:///tmp']) {
    await verifierRefus(preparer({
      env: { ...configuration, VOICEBOT_ORIGINE: origineInvalide },
    }), requete(), 503)
  }
  for (const hash of ['a'.repeat(63), 'a'.repeat(65), 'z'.repeat(64)]) {
    await verifierRefus(preparer({
      env: { ...configuration, VOICEBOT_CODE_ACCES_SHA256: hash },
    }), requete(), 503)
  }
})

test('route jeton : exige l’origine exacte, sans autorisation CORS générale', async () => {
  for (const origin of [null, 'null', 'https://autre.example',
    'http://voicebot.example', `${origine}:444`, `${origine}/`]) {
    const reponse = await verifierRefus(preparer(), requete({ headers: { origin } }), 403)
    assert.equal(reponse.headers.get('access-control-allow-origin'), null)
  }
})

test('route jeton : refuse les codes incorrects et les enveloppes invalides', async () => {
  for (const authorization of [null, '', code, `Basic ${code}`, 'Bearer court',
    `Bearer ${'a'.repeat(129)}`, `Bearer ${'a'.repeat(32)}`,
    `Bearer ${'!'.repeat(40)}`, `Bearer ${code} autre`]) {
    await verifierRefus(preparer(), requete({ headers: { authorization } }), 401)
  }
})

test('route jeton : ne renvoie que le jeton et utilise l’agent du serveur', async () => {
  const banc = preparer()
  const reponse = await banc.route(requete({
    suffixe: '?agent_id=agent_intrus',
    body: JSON.stringify({ agent_id: 'autre_agent' }),
  }))
  assert.equal(reponse.status, 200)
  assert.equal(reponse.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await reponse.json(), { token: 'jeton-fictif' })
  assert.equal(banc.appels.length, 1)
  const { url, options } = banc.appels[0]
  assert.equal(url.origin, 'https://api.elevenlabs.io')
  assert.equal(url.pathname, '/v1/convai/conversation/token')
  assert.deepEqual([...url.searchParams], [['agent_id', 'agent_fictif']])
  assert.equal(options.headers['xi-api-key'], cle)
  assert.equal(options.redirect, 'error')
  assert.ok(options.signal instanceof AbortSignal)
  assert.equal(options.signal.aborted, false)
})

test('route jeton : accepte une empreinte hexadécimale en majuscules', async () => {
  const banc = preparer({ env: {
    ...configuration,
    VOICEBOT_CODE_ACCES_SHA256: configuration.VOICEBOT_CODE_ACCES_SHA256.toUpperCase(),
  } })
  assert.equal((await banc.route(requete())).status, 200)
})

test('route jeton : masque les erreurs HTTP du fournisseur et ne réessaie pas', async () => {
  for (const statut of [401, 403, 429, 500]) {
    const banc = preparer({ fournisseur: () => new Response(`détail privé ${cle}`, {
      status: statut,
    }) })
    const reponse = await banc.route(requete())
    assert.equal(reponse.status, 502)
    assert.equal(reponse.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await reponse.json(), {
      erreur: 'Impossible d’obtenir un accès à la conversation.',
    })
    assert.equal(banc.appels.length, 1)
  }
})

test('route jeton : refuse JSON invalide et jetons absents, vides ou non textuels', async () => {
  const fournisseurs = [
    () => new Response('JSON invalide'),
    ...[null, {}, { token: '' }, { token: '  ' }, { token: 42 }]
      .map(valeur => () => Response.json(valeur)),
  ]
  for (const fournisseur of fournisseurs) {
    const banc = preparer({ fournisseur })
    const reponse = await banc.route(requete())
    assert.equal(reponse.status, 502)
    assert.deepEqual(await reponse.json(), {
      erreur: 'Le service de conversation est indisponible.',
    })
    assert.equal(banc.appels.length, 1)
  }
})

test('route jeton : panne, expiration et lecture interrompue restent génériques', async () => {
  const fournisseurs = [
    () => { throw new Error(`panne privée ${cle}`) },
    () => { throw new DOMException('Expiration simulée', 'TimeoutError') },
    () => ({ ok: true, json() { throw new Error(`lecture privée ${cle}`) } }),
  ]
  for (const fournisseur of fournisseurs) {
    const banc = preparer({ fournisseur })
    const reponse = await banc.route(requete())
    assert.equal(reponse.status, 502)
    assert.equal(reponse.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await reponse.json(), {
      erreur: 'Le service de conversation est indisponible.',
    })
    assert.equal(banc.appels.length, 1)
  }
})

test('route jeton : entrée Vercel reliée au gestionnaire Web', async () => {
  assert.equal(typeof routeVercel.fetch, 'function')
  // GET est refusé avant tout accès aux variables ou au réseau.
  const reponse = await routeVercel.fetch(requete({ method: 'GET' }))
  assert.equal(reponse.status, 405)
})
