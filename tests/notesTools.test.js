import test from 'node:test'
import assert from 'node:assert/strict'
import { creerOutilsNotes } from '../src/services/notesTools.js'
import { chercherNotes, lireNote } from '../src/utils/rechercheNotes.js'
import {
  creerNote, preparerModification, preparerSuppression, preparerRestauration,
} from '../src/utils/note.js'

function exemple(champs = {}) {
  return {
    id: 'note-initiale', titre: 'Idée de vidéo', contenu: 'Présenter le voicebot.',
    categorie: 'Création', projet: 'BananaNavy',
    createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-01T10:00:00.000Z',
    deletedAt: null, ...champs,
  }
}

// Store en mémoire pour contrôler les appels de l'adaptateur, sans React ni IndexedDB.
function preparerStore(initiales = []) {
  let notes = initiales
  const appels = []
  function remplacer(id, preparer) {
    const note = lireNote(notes, id)
    const resultat = preparer(note)
    notes = notes.map(note => note.id === id ? resultat : note)
    return resultat
  }
  const store = {
    notes: [], // Volontairement périmé : les outils doivent passer par obtenirNotes.
    async obtenirNotes() {
      appels.push('lecture')
      return notes.map(note => ({ ...note }))
    },
    async ajouterNote(champs) {
      appels.push('creation')
      const note = creerNote(champs)
      notes = [...notes, note]
      return note
    },
    async modifierNote(id, changements) {
      appels.push('modification')
      return remplacer(id, note => preparerModification(note, changements))
    },
    async supprimerNote(id) {
      appels.push('suppression')
      return remplacer(id, preparerSuppression)
    },
    async restaurerNote(id) {
      appels.push('restauration')
      return remplacer(id, preparerRestauration)
    },
  }
  return { store, appels }
}

test('recherche : accents, termes répartis, filtres exacts et tri sans mutation', () => {
  const anciennes = Object.freeze(exemple())
  const recente = Object.freeze(exemple({ id: 'recente', titre: 'Autre vidéo', updatedAt: '2026-11-02T10:00:00.000Z' }))
  const supprimee = Object.freeze(exemple({ id: 'corbeille', deletedAt: '2026-11-03T10:00:00.000Z' }))
  const notes = Object.freeze([anciennes, recente, supprimee])
  const resultat = chercherNotes(notes, { texte: 'VIDEO voicebot', categorie: '  CREATION ', projet: 'banananavy' })
  assert.deepEqual(resultat.notes.map(note => note.id), ['recente', 'note-initiale'])
  assert.equal(resultat.total, 2)
  assert.equal(chercherNotes(notes, { categorie: 'cré' }).total, 0)
  assert.equal(chercherNotes(notes, { texte: 'inexistant' }).total, 0)
  assert.equal(chercherNotes(notes, { categorie: '   ', projet: '  ' }).total, 2)
  assert.deepEqual(chercherNotes(notes, { corbeille: true }).notes.map(note => note.id), ['corbeille'])
  assert.equal(notes[0], anciennes)
})

test('recherche : résultats bornés, total complet et extraits sans contenu intégral', async () => {
  const { store } = preparerStore(Array.from({ length: 25 }, (_, i) => exemple({ id: `note-${i}`, contenu: 'a'.repeat(200) })))
  const outils = creerOutilsNotes(store)
  const resultat = await outils.chercher_notes()
  assert.equal(resultat.succes, true)
  assert.equal(resultat.total, 25)
  assert.equal(resultat.notes.length, 5)
  assert.equal(resultat.notes[0].extrait.length, 160)
  assert.equal(Object.hasOwn(resultat.notes[0], 'contenu'), false)
  assert.equal((await outils.chercher_notes({ limite: 20 })).notes.length, 20)
})

test('lecture : copie complète, accès à la corbeille et identifiant introuvable', () => {
  const note = Object.freeze(exemple({ deletedAt: '2026-11-02T10:00:00.000Z' }))
  const copie = lireNote([note], note.id)
  assert.deepEqual(copie, note)
  assert.notEqual(copie, note)
  copie.titre = 'Modification externe'
  assert.equal(note.titre, 'Idée de vidéo')
  assert.throws(() => lireNote([note], 'absente'), /Note introuvable/)
})

test('six outils : création, recherche, lecture, modification, corbeille et restauration', async () => {
  const { store } = preparerStore()
  const outils = creerOutilsNotes(store)
  assert.deepEqual(Object.keys(outils).sort(), ['creer_note', 'chercher_notes', 'lire_note', 'modifier_note', 'supprimer_note', 'restaurer_note'].sort())
  const creation = await outils.creer_note({ titre: '  Idée de vidéo  ', contenu: 'Trente secondes.', projet: 'BananaNavy' })
  assert.equal(creation.succes, true)
  assert.equal(creation.note.titre, 'Idée de vidéo')
  assert.equal(Object.hasOwn(creation.note, 'contenu'), false)
  const id = creation.note.id
  assert.equal((await outils.chercher_notes({ texte: 'video' })).notes[0].id, id)
  const initiale = (await outils.lire_note({ id })).note
  assert.equal(initiale.contenu, 'Trente secondes.')
  assert.equal((await outils.modifier_note({ id, changements: { contenu: 'Une minute.' } })).succes, true)
  const modifiee = (await outils.lire_note({ id })).note
  assert.equal(modifiee.contenu, 'Une minute.')
  assert.equal(modifiee.createdAt, initiale.createdAt)
  assert.notEqual((await outils.supprimer_note({ id })).note.deletedAt, null)
  assert.equal((await outils.chercher_notes()).total, 0)
  assert.equal((await outils.chercher_notes({ corbeille: true })).notes[0].id, id)
  assert.equal((await outils.modifier_note({ id, changements: { titre: 'Interdit' } })).succes, false)
  assert.equal((await outils.restaurer_note({ id })).note.deletedAt, null)
  assert.equal((await outils.chercher_notes()).total, 1)
})

test('titres identiques : recherche multiple et mutations exclusivement par identifiant', async () => {
  const { store } = preparerStore([exemple(), exemple({ id: 'autre-note' })])
  const outils = creerOutilsNotes(store)
  assert.equal((await outils.chercher_notes({ texte: 'video' })).total, 2)
  assert.equal((await outils.modifier_note({ id: 'autre-note', changements: { contenu: 'Cible précise' } })).succes, true)
  assert.equal((await outils.lire_note({ id: 'note-initiale' })).note.contenu, 'Présenter le voicebot.')
  assert.equal((await outils.lire_note({ id: 'autre-note' })).note.contenu, 'Cible précise')
  assert.deepEqual(await outils.supprimer_note({ id: 'inconnue' }), { succes: false, erreur: 'Note introuvable.' })
})

test('tous les outils refusent les enveloppes et paramètres inconnus avant accès au store', async () => {
  const { store, appels } = preparerStore()
  const outils = creerOutilsNotes(store)
  for (const executer of Object.values(outils)) {
    for (const parametres of [null, [], 'texte', 5, new Date(), Object.create({ id: 'hérité' }), { inconnu: 'x' }, JSON.parse('{"__proto__":{}}')]) {
      const resultat = await executer(parametres)
      assert.equal(resultat.succes, false)
      assert.equal(typeof resultat.erreur, 'string')
    }
  }
  assert.deepEqual(appels, [])
})

test('validation des textes, identifiants, filtres et champs protégés avant appel au store', async () => {
  const { store, appels } = preparerStore()
  const outils = creerOutilsNotes(store)
  for (const p of [{}, { titre: '' }, { titre: '  ' }, { titre: 12 }, { titre: 'Valide', contenu: null }, { titre: 'Valide', categorie: [] }, { titre: 'Valide', projet: false }, { titre: 'Valide', id: 'imposé' }]) {
    assert.equal((await outils.creer_note(p)).succes, false)
  }
  for (const outil of ['lire_note', 'supprimer_note', 'restaurer_note']) {
    for (const p of [{}, { id: '' }, { id: '  ' }, { id: 4 }]) assert.equal((await outils[outil](p)).succes, false)
  }
  for (const p of [{ texte: 1 }, { categorie: null }, { projet: [] }, { corbeille: 'false' }, { corbeille: null }, ...[0, 21, 2.5, '5', undefined, NaN, Infinity].map(limite => ({ limite }))]) {
    assert.equal((await outils.chercher_notes(p)).succes, false)
  }
  for (const changements of [undefined, null, [], { id: 'autre' }, { createdAt: 'autre' }, { updatedAt: 'autre' }, { deletedAt: null }, { titre: '' }, { titre: '  ' }, { contenu: 3 }, { projet: false }]) {
    assert.equal((await outils.modifier_note({ id: 'note', changements })).succes, false)
  }
  assert.deepEqual(appels, [])
})

test('un résultat réussi attend la sauvegarde ; un échec reste structuré', async () => {
  let terminer
  let termine = false
  const outils = creerOutilsNotes({ ajouterNote: () => new Promise(resolve => { terminer = resolve }) })
  const resultat = outils.creer_note({ titre: 'Attente' }).then(valeur => { termine = true; return valeur })
  await Promise.resolve()
  assert.equal(termine, false)
  terminer(exemple())
  assert.equal((await resultat).succes, true)

  const echecs = creerOutilsNotes({
    ajouterNote: async () => { throw new Error('Sauvegarde refusée') },
    obtenirNotes: async () => { throw new Error('Lecture refusée') },
    supprimerNote: async () => { throw 'Échec inattendu' },
  })
  assert.deepEqual(await echecs.creer_note({ titre: 'Échec' }), { succes: false, erreur: 'Sauvegarde refusée' })
  assert.deepEqual(await echecs.lire_note({ id: 'note' }), { succes: false, erreur: 'Lecture refusée' })
  assert.equal(typeof (await echecs.supprimer_note({ id: 'note' })).erreur, 'string')
})
