import test from 'node:test'
import assert from 'node:assert/strict'
import { obtenirJetonConversation } from '../src/services/conversationAccess.js'

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
