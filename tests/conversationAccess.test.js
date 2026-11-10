import test from 'node:test'
import assert from 'node:assert/strict'
import { obtenirConfigurationAcces, obtenirJetonConversation } from '../src/services/conversationAccess.js'
import { creerRouteConfigurationAcces, creerRouteJeton } from '../server/routeJeton.js'
import { createHash } from 'node:crypto'

// Le transport est remplacé dans chaque test : aucun réseau ni secret réel.
const code = 'code-fictif-de-test-avec-plus-de-32-caracteres'

test('accès client : refuse les codes invalides sans demande réseau', async t => {
  const transport = t.mock.method(globalThis, 'fetch', () => {
    throw new Error('Aucune demande attendue.')
  })

  for (const valeur of [undefined, null, '', 'court', 'a'.repeat(31),
    'a'.repeat(129), '!'.repeat(40), `${code} `]) {
    await assert.rejects(obtenirJetonConversation(valeur), {
      message: 'Le format du code d’accès est invalide.',
    })
  }
  assert.equal(transport.mock.callCount(), 0)
})

test('accès client : POST relatif, code dans l’en-tête et jeton seul en résultat', async t => {
  const signal = new AbortController().signal
  const transport = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ token: 'jeton-fictif', autre: 'champ ignoré' }),
  )

  assert.equal(await obtenirJetonConversation(code, signal), 'jeton-fictif')
  assert.equal(transport.mock.callCount(), 1)
  assert.deepEqual(transport.mock.calls[0].arguments, [
    '/api/conversation-token',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${code}` },
      cache: 'no-store',
      redirect: 'error',
      signal,
    },
  ])
})

test('accès client : traduit les refus sans lire leur corps ni réessayer', async t => {
  let statut
  const transport = t.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: statut,
    json() { throw new Error('Le corps d’un refus ne doit pas être lu.') },
  }))
  const cas = [
    [401, 'Code d’accès invalide.'],
    [403, 'Cette origine n’est pas autorisée.'],
    [429, 'Trop de demandes. Patientez avant de réessayer.'],
    [503, 'L’accès vocal est désactivé ou indisponible.'],
    [502, 'Impossible d’obtenir un accès à la conversation.'],
    [500, 'Impossible d’obtenir un accès à la conversation.'],
  ]

  for (const [valeur, message] of cas) {
    statut = valeur
    await assert.rejects(obtenirJetonConversation(code), { message })
  }
  assert.equal(transport.mock.callCount(), cas.length)
})

test('accès client : refuse JSON invalide et jetons absents ou incorrects', async t => {
  let reponse
  const transport = t.mock.method(globalThis, 'fetch', async () => reponse)
  const reponses = [
    new Response('JSON invalide'),
    ...[null, {}, { token: null }, { token: '' }, { token: '  ' }, { token: 42 }]
      .map(valeur => Response.json(valeur)),
  ]

  for (reponse of reponses) {
    await assert.rejects(obtenirJetonConversation(code), {
      message: 'Réponse de conversation invalide.',
    })
  }
  assert.equal(transport.mock.callCount(), reponses.length)
})

test('accès client : masque les pannes et expirations sans nouvelle tentative', async t => {
  let cause
  const transport = t.mock.method(globalThis, 'fetch', async () => { throw cause })

  for (cause of [new Error(`détail privé ${code}`),
    new DOMException('Expiration simulée', 'TimeoutError')]) {
    await assert.rejects(obtenirJetonConversation(code), {
      message: 'Demande interrompue ou serveur inaccessible.',
    })
  }
  assert.equal(transport.mock.callCount(), 2)
})

test('accès client : transmet une annulation au transport en attente', async t => {
  const controleur = new AbortController()
  const transport = t.mock.method(globalThis, 'fetch', (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    }),
  )

  const attente = obtenirJetonConversation(code, controleur.signal)
  controleur.abort()
  await assert.rejects(attente, {
    message: 'Demande interrompue ou serveur inaccessible.',
  })
  assert.equal(transport.mock.callCount(), 1)
})

test('accès client : demande une limite de quinze secondes par défaut', async t => {
  const signal = new AbortController().signal
  // Vérifier le délai demandé sans attendre réellement quinze secondes.
  const minuterie = t.mock.method(AbortSignal, 'timeout', () => signal)
  const transport = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ token: 'jeton-fictif' }),
  )

  await obtenirJetonConversation(code)
  assert.deepEqual(minuterie.mock.calls[0].arguments, [15_000])
  assert.equal(transport.mock.calls[0].arguments[1].signal, signal)
})

test('accès client : configuration publique minimale et erreurs de configuration', async t => {
  let reponse
  const signal = new AbortController().signal
  const transport = t.mock.method(globalThis, 'fetch', async () => reponse)
  for (const codeRequis of [true, false]) {
    reponse = Response.json({ codeRequis, autre: 'ignoré' })
    assert.deepEqual(await obtenirConfigurationAcces(signal), { codeRequis })
  }
  assert.deepEqual(transport.mock.calls[0].arguments, [
    '/api/conversation-access',
    { method: 'GET', cache: 'no-store', redirect: 'error', signal },
  ])
  for (reponse of [Response.json({}), Response.json({ codeRequis: 'false' }),
    new Response('non JSON'), new Response('', { status: 503 })]) {
    await assert.rejects(obtenirConfigurationAcces(signal))
  }
})

test('accès client : mode public sans code ni en-tête d’authentification', async t => {
  const transport = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ token: 'jeton-fictif' }))
  assert.equal(await obtenirJetonConversation('', undefined, { codeRequis: false }), 'jeton-fictif')
  assert.deepEqual(transport.mock.calls[0].arguments[1].headers, {})
})

test('accès complet simulé : public, retour au mode privé et refus d’un client obsolète', async t => {
  const env = {
    VOICEBOT_VOIX_ACTIVE: 'true',
    VOICEBOT_ACCES_PUBLIC: 'true',
    VOICEBOT_ORIGINE: 'https://voicebot.example',
    ELEVENLABS_API_KEY: 'cle-fictive',
    ELEVENLABS_AGENT_ID: 'agent-fictif',
    VOICEBOT_CODE_ACCES_SHA256: createHash('sha256').update(code).digest('hex'),
  }
  let appelsFournisseur = 0
  const route = creerRouteJeton({ env, demander: async () => {
    appelsFournisseur += 1
    return Response.json({ token: 'jeton-fictif' })
  } })
  const routeConfiguration = creerRouteConfigurationAcces({ env })
  t.mock.method(globalThis, 'fetch', (url, options) =>
    (url === '/api/conversation-access' ? routeConfiguration : route)(new Request(
    new URL(url, env.VOICEBOT_ORIGINE),
    { ...options, headers: { ...options.headers, origin: env.VOICEBOT_ORIGINE } },
  )))
  assert.deepEqual(await obtenirConfigurationAcces(), { codeRequis: false })
  assert.equal(await obtenirJetonConversation('', undefined, { codeRequis: false }), 'jeton-fictif')
  env.VOICEBOT_ACCES_PUBLIC = 'false'
  assert.deepEqual(await obtenirConfigurationAcces(), { codeRequis: true })
  // Une page encore ouverte en mode public ne contourne pas le contrôle serveur.
  await assert.rejects(obtenirJetonConversation('', undefined, { codeRequis: false }), {
    message: 'Code d’accès invalide.',
  })
  assert.equal(appelsFournisseur, 1)
  assert.equal(await obtenirJetonConversation(code), 'jeton-fictif')
  assert.equal(appelsFournisseur, 2)
})
