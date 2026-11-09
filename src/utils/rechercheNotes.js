function normaliser(texte) {
  return texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr-FR')
    .trim()
}

/** Recherche pure ; les paramètres sont validés par la couche des outils. */
export function chercherNotes(notes, {
  texte = '',
  categorie = '',
  projet = '',
  corbeille = false,
  limite = 5,
} = {}) {
  const termes = normaliser(texte).split(/\s+/).filter(Boolean)
  const categorieRecherchee = normaliser(categorie)
  const projetRecherche = normaliser(projet)

  const correspondances = notes.filter(note => {
    const dansCorbeille = note.deletedAt !== null
    if (dansCorbeille !== corbeille) return false

    if (categorieRecherchee && normaliser(note.categorie) !== categorieRecherchee) return false
    if (projetRecherche && normaliser(note.projet) !== projetRecherche) return false

    const texteNote = normaliser(
      [note.titre, note.contenu, note.categorie, note.projet].join(' '),
    )
    return termes.every(terme => texteNote.includes(terme))
  }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))

  return {
    total: correspondances.length,
    notes: correspondances.slice(0, limite).map(note => ({
      id: note.id,
      titre: note.titre,
      extrait: note.contenu.slice(0, 160),
      categorie: note.categorie,
      projet: note.projet,
      updatedAt: note.updatedAt,
      deletedAt: note.deletedAt,
    })),
  }
}

export function lireNote(notes, id) {
  const note = notes.find(note => note.id === id)
  if (!note) throw new Error('Note introuvable.')

  return { ...note }
}
