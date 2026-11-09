/**
 * Prépare un texte pour comparer sans casse, accents ni espaces aux extrémités.
 * La valeur originale de la note n’est jamais modifiée.
 */
function normaliser(texte) {
  return texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr-FR')
    .trim()
}

/**
 * Recherche pure sur une liste déjà chargée ; les outils valident les paramètres.
 * Tous les mots doivent apparaître quelque part dans les champs réunis.
 * Catégorie et projet sont des filtres exacts après normalisation ; corbeille
 * choisit exclusivement notes actives ou supprimées. Trie par updatedAt décroissant.
 * Renvoie total avant limitation et au plus limite résumés avec extrait de 160
 * caractères. Aucun accès réseau/stockage et aucune mutation de la liste source.
 */
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

/**
 * Retrouve une note par id exact, active ou en corbeille, et renvoie une copie
 * complète. Lève une erreur si l’id n’existe pas ; aucun accès au stockage.
 */
export function lireNote(notes, id) {
  const note = notes.find(note => note.id === id)
  if (!note) throw new Error('Note introuvable.')

  return { ...note }
}
