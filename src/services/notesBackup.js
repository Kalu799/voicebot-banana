import { fusionnerNotes, recupererNotes } from './notesStorage.js'

function estObjet(valeur) {
  return valeur !== null
    && typeof valeur === 'object'
    && !Array.isArray(valeur)
}

function estDateISO(valeur) {
  if (typeof valeur !== 'string') return false

  const date = new Date(valeur)
  return !Number.isNaN(date.getTime()) && date.toISOString() === valeur
}

/** Valide le fichier entier avant de transmettre des notes au stockage. */
function validerSauvegarde(sauvegarde) {
  if (!estObjet(sauvegarde) || sauvegarde.version !== 1) {
    throw new Error('Format de sauvegarde non reconnu : version 1 attendue.')
  }

  if (!estDateISO(sauvegarde.exportedAt) || !Array.isArray(sauvegarde.notes)) {
    throw new Error('La sauvegarde doit contenir une date ISO et une liste de notes.')
  }

  const identifiants = new Set()
  const champsTexte = ['id', 'titre', 'contenu', 'categorie', 'projet']

  return sauvegarde.notes.map((note, index) => {
    const position = index + 1

    if (!estObjet(note)
      || champsTexte.some(champ => typeof note[champ] !== 'string')
      || !note.id.trim()
      || !note.titre.trim()) {
      throw new Error(`Note ${position} : champs texte invalides ou titre/identifiant vide.`)
    }

    if (!estDateISO(note.createdAt)
      || !estDateISO(note.updatedAt)
      || (note.deletedAt !== null && !estDateISO(note.deletedAt))) {
      throw new Error(`Note ${position} : dates invalides.`)
    }

    if (identifiants.has(note.id)) {
      throw new Error(`Note ${position} : identifiant répété dans le fichier.`)
    }

    identifiants.add(note.id)

    // Conserve les valeurs originales et uniquement les champs prévus.
    return {
      id: note.id,
      titre: note.titre,
      contenu: note.contenu,
      categorie: note.categorie,
      projet: note.projet,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      deletedAt: note.deletedAt,
    }
  })
}

/** Produit un fichier JSON en mémoire ; son téléchargement revient à l'interface. */
export async function exporterNotes() {
  const sauvegarde = {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes: await recupererNotes(),
  }

  // Vérifie que le fichier produit pourra être réimporté.
  sauvegarde.notes = validerSauvegarde(sauvegarde)

  return new File(
    [JSON.stringify(sauvegarde, null, 2)],
    `voicebot-notes-${sauvegarde.exportedAt.slice(0, 10)}.json`,
    { type: 'application/json' },
  )
}

export async function importerNotes(fichier) {
  if (!(fichier instanceof Blob)) {
    throw new Error('Sélectionnez un fichier de sauvegarde JSON.')
  }

  let texte
  try {
    texte = await fichier.text()
  } catch (cause) {
    throw new Error('Impossible de lire le fichier de sauvegarde.', { cause })
  }

  let sauvegarde
  try {
    sauvegarde = JSON.parse(texte)
  } catch (cause) {
    throw new Error('Le fichier ne contient pas un JSON valide.', { cause })
  }

  // Toute la validation précède l'ouverture de la transaction d'écriture.
  const notes = validerSauvegarde(sauvegarde)
  return fusionnerNotes(notes)
}
