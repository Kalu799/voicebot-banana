import { creerRouteJeton } from '../server/routeJeton.js'

// Vercel transmet les requêtes à notre logique serveur.
export default {
  fetch: creerRouteJeton(),
}
