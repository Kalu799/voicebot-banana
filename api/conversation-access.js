import { creerRouteConfigurationAcces } from '../server/routeJeton.js'

// Expose seulement si le formulaire doit demander un code. Aucun secret,
// jeton ou appel ElevenLabs ; la route de jeton contrôle elle-même l’accès.
export default {
  fetch: creerRouteConfigurationAcces(),
}
