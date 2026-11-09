import test from 'node:test'
import assert from 'node:assert/strict'
import { effacerNotesEnCorbeille } from '../src/services/notesStorage.js'
import { notesReducer, etatInitialNotes } from '../src/stores/notesReducer.js'

// Simule les événements et l’atomicité IndexedDB sans dépendance supplémentaire.
function baseTest(t, notes, { echec = false } = {}) {
  let donnees = new Map(notes.map(note => [note.id, note]))
  let fermee = false
  let ouvertures = 0
  const base = {
    close() { fermee = true },
    transaction() {
      const copie = new Map(donnees)
      let annulee = false
      const transaction = {
        abort() {
          annulee = true
          queueMicrotask(() => transaction.onabort())
        },
        objectStore() {
          return {
            get(id) {
              const requete = {}
              queueMicrotask(() => {
                if (annulee) return
                requete.result = copie.get(id)
                requete.onsuccess()
              })
              return requete
            },
            delete(id) { copie.delete(id) },
          }
        },
      }
      setTimeout(() => {
        if (annulee) return
        if (echec) {
          transaction.error = new Error('Stockage indisponible')
          transaction.abort()
        } else {
          donnees = copie
          transaction.oncomplete()
        }
      }, 0)
      return transaction
    },
  }
  const precedent = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB')
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: { open() {
      ouvertures += 1
      const requete = { result: base }
      queueMicrotask(() => requete.onsuccess())
      return requete
    } },
  })
  t.after(() => {
    if (precedent) Object.defineProperty(globalThis, 'indexedDB', precedent)
    else delete globalThis.indexedDB
  })
  return {
    ids: () => [...donnees.keys()],
    fermee: () => fermee,
    ouvertures: () => ouvertures,
  }
}

const active = { id: 'active', deletedAt: null }
const corbeille = { id: 'corbeille', deletedAt: '2026-11-09T10:00:00Z' }
const autre = { ...corbeille, id: 'autre' }

test('suppression individuelle persistée : conserve les autres notes et ferme la base', async t => {
  const base = baseTest(t, [active, corbeille, autre])
  await effacerNotesEnCorbeille(['corbeille'])
  assert.deepEqual(base.ids(), ['active', 'autre'])
  assert.equal(base.fermee(), true)
})

test('vidage limité aux ids confirmés, accepte les ids déjà effacés', async t => {
  const base = baseTest(t, [active, corbeille, autre])
  await effacerNotesEnCorbeille(['corbeille', 'autre', 'absente'])
  assert.deepEqual(base.ids(), ['active'])
})

test('une note restaurée annule toute la transaction', async t => {
  const base = baseTest(t, [corbeille, active])
  await assert.rejects(effacerNotesEnCorbeille(['corbeille', 'active']), /restaurée/)
  assert.deepEqual(base.ids(), ['corbeille', 'active'])
  assert.equal(base.fermee(), true)
})

test('un échec de stockage conserve toutes les notes', async t => {
  const base = baseTest(t, [corbeille, autre], { echec: true })
  await assert.rejects(effacerNotesEnCorbeille(['corbeille', 'autre']), /échoué/)
  assert.deepEqual(base.ids(), ['corbeille', 'autre'])
  assert.equal(base.fermee(), true)
})

test('liste vide sans écriture et identifiants invalides refusés', async t => {
  const base = baseTest(t, [active])
  await effacerNotesEnCorbeille([])
  await assert.rejects(effacerNotesEnCorbeille(['']), /identifiants/)
  assert.equal(base.ouvertures(), 0)
})

test('le store retire uniquement les notes effacées après persistance', () => {
  const etat = { ...etatInitialNotes, notes: [active, corbeille, autre], chargement: false }
  const resultat = notesReducer(etat, { type: 'NOTES_EFFACEES', ids: ['corbeille', 'autre'] })
  assert.deepEqual(resultat.notes, [active])
  assert.equal(etat.notes.length, 3)
})
