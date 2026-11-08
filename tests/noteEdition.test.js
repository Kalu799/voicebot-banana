import test from 'node:test'
import assert from 'node:assert/strict'
import { preparerChangementsEdition, preparerModification } from '../src/utils/note.js'

function noteInitiale() {
  return Object.freeze({
    id: 'note-test', titre: 'Titre initial', contenu: 'Contenu initial',
    categorie: 'Idée', projet: 'BananaNavy',
    createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-01T10:00:00.000Z',
    deletedAt: null,
  })
}

test('un titre édité ne réenvoie pas le contenu intact du brouillon', () => {
  const initiale = noteInitiale()
  const brouillon = Object.freeze({ ...initiale, titre: 'Titre manuel' })
  const changements = preparerChangementsEdition(initiale, brouillon)
  assert.deepEqual(changements, { titre: 'Titre manuel' })
  const recente = Object.freeze({ ...initiale, contenu: 'Contenu récent du simulateur' })
  const resultat = preparerModification(recente, changements, initiale)
  assert.equal(resultat.titre, 'Titre manuel')
  assert.equal(resultat.contenu, 'Contenu récent du simulateur')
  assert.equal(resultat.id, initiale.id)
  assert.equal(resultat.createdAt, initiale.createdAt)
  assert.equal(initiale.contenu, 'Contenu initial')
})

test('un conflit sur le même champ refuse tout le changement et préserve les données', () => {
  const initiale = noteInitiale()
  const brouillon = Object.freeze({ ...initiale, titre: 'Titre manuel', contenu: 'Contenu manuel' })
  const recente = Object.freeze({ ...initiale, contenu: 'Contenu concurrent' })
  const changements = preparerChangementsEdition(initiale, brouillon)
  assert.throws(() => preparerModification(recente, changements, initiale), /contenu.*changé pendant l’édition/)
  assert.equal(recente.titre, 'Titre initial')
  assert.equal(recente.contenu, 'Contenu concurrent')
  assert.equal(brouillon.contenu, 'Contenu manuel')
})

test('un brouillon identique au nouvel état peut être enregistré sans écriture', () => {
  const initiale = noteInitiale()
  const recente = Object.freeze({ ...initiale, contenu: 'Même contenu' })
  const changements = preparerChangementsEdition(initiale, { ...initiale, contenu: 'Même contenu' })
  assert.equal(preparerModification(recente, changements, initiale), recente)
})

test('une édition vide ou annulée ne remet pas une ancienne version', () => {
  const initiale = noteInitiale()
  const recente = Object.freeze({ ...initiale, titre: 'Titre récent', contenu: 'Contenu récent' })
  const changements = preparerChangementsEdition(initiale, { ...initiale })
  assert.deepEqual(changements, {})
  assert.equal(preparerModification(recente, changements, initiale), recente)
  assert.deepEqual(preparerChangementsEdition(initiale, { ...initiale, titre: '  Titre initial  ' }), {})
})

test('le nettoyage et la validation des champs restent appliqués', () => {
  const initiale = noteInitiale()
  const changements = preparerChangementsEdition(initiale, {
    ...initiale, categorie: '  Vidéo  ', projet: '  Démo  ', contenu: '  Ligne 1\nLigne 2  ',
  })
  assert.deepEqual(changements, { contenu: '  Ligne 1\nLigne 2  ', categorie: 'Vidéo', projet: 'Démo' })
  assert.throws(() => preparerModification(initiale, { titre: ' ' }, initiale), /titre.*obligatoire/)
  assert.throws(() => preparerModification(initiale, { id: 'autre' }, initiale), /ne peut pas/)
  assert.throws(() => preparerModification(initiale, { contenu: 'Nouveau' }, {}), /valeur initiale/)
  for (const invalide of [null, [], 'texte']) {
    assert.throws(() => preparerModification(initiale, { titre: 'Nouveau' }, invalide), /valeurs initiales/)
  }
})

test('les modifications partielles des outils restent compatibles sans valeurs initiales', () => {
  const initiale = noteInitiale()
  const resultat = preparerModification(initiale, { contenu: 'Modification par outil' })
  assert.equal(resultat.contenu, 'Modification par outil')
  assert.equal(resultat.titre, initiale.titre)
})
