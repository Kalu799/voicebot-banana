const messages = {
  401: 'Code d’accès invalide.',
  403: 'Cette origine n’est pas autorisée.',
  429: 'Trop de demandes. Patientez avant de réessayer.',
  503: 'L’accès vocal est désactivé ou indisponible.',
}

export async function obtenirJetonConversation(
  codeAcces,
  signal = AbortSignal.timeout(15_000),
) {
  // Appliquer le même format que le serveur avant tout envoi.
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(codeAcces ?? '')) {
    throw new Error('Le format du code d’accès est invalide.')
  }

  let reponse
  try {
    // Même origine, aucun secret dans l’URL et aucune relance automatique.
    reponse = await fetch('/api/conversation-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${codeAcces}` },
      cache: 'no-store',
      redirect: 'error',
      signal,
    })
  } catch {
    throw new Error('Demande interrompue ou serveur inaccessible.')
  }

  if (!reponse.ok) {
    // Ne pas afficher la réponse brute du serveur.
    throw new Error(
      messages[reponse.status]
        ?? 'Impossible d’obtenir un accès à la conversation.',
    )
  }

  let resultat
  try {
    resultat = await reponse.json()
  } catch {
    throw new Error('Réponse de conversation invalide.')
  }

  if (typeof resultat?.token !== 'string' || !resultat.token.trim()) {
    throw new Error('Réponse de conversation invalide.')
  }

  // Le futur bouton utilisera ce jeton sans le stocker durablement.
  return resultat.token
}
