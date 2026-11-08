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
