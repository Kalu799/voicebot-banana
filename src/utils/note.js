/**
 * Construit une nouvelle note en mémoire, sans la sauvegarder.
 * Les champs fournis doivent être des chaînes de caractères.
 */
export function creerNote({
  titre,
  contenu = '',
  categorie = '',
  projet = '',
}) {
  const titreNettoye = titre.trim()

  if (!titreNettoye) {
    throw new Error('Le titre de la note est obligatoire.')
  }

  // Une même date garantit la cohérence lors de la création.
  const maintenant = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    titre: titreNettoye,
    contenu,
    categorie: categorie.trim(),
    projet: projet.trim(),
    createdAt: maintenant,
    updatedAt: maintenant,
    deletedAt: null,
  }
}

/** Prépare uniquement les champs éditables, en conservant l'identité de la note. */
export function preparerModification(note, changements) {
  if (note.deletedAt !== null) {
    throw new Error('Restaurez la note avant de la modifier.')
  }

  if (changements === null
    || typeof changements !== 'object'
    || Array.isArray(changements)) {
    throw new Error('Les changements doivent être un objet.')
  }

  const champsAutorises = ['titre', 'contenu', 'categorie', 'projet']
  const resultat = { ...note }
  let modifiee = false

  for (const [champ, valeur] of Object.entries(changements)) {
    if (!champsAutorises.includes(champ)) {
      throw new Error(`Le champ ${champ} ne peut pas être modifié.`)
    }

    if (typeof valeur !== 'string') {
      throw new Error(`Le champ ${champ} doit être un texte.`)
    }

    const texte = champ === 'contenu' ? valeur : valeur.trim()

    if (champ === 'titre' && !texte) {
      throw new Error('Le titre de la note est obligatoire.')
    }

    resultat[champ] = texte
    if (texte !== note[champ]) modifiee = true
  }

  // Aucun changement réel : conserver aussi la date de modification.
  if (!modifiee) return note

  return { ...resultat, updatedAt: new Date().toISOString() }
}

export function preparerSuppression(note) {
  if (note.deletedAt !== null) return note

  const maintenant = new Date().toISOString()
  return { ...note, deletedAt: maintenant, updatedAt: maintenant }
}

export function preparerRestauration(note) {
  if (note.deletedAt === null) return note

  return { ...note, deletedAt: null, updatedAt: new Date().toISOString() }
}
