import { creerRouteJeton } from '../server/routeJeton.js'

// Vercel transmet les requêtes à notre logique serveur.
// Point d’entrée HTTP uniquement : la logique reste dans server/ pour être
// testable sans lancer Vercel. Les secrets sont lus dans l’environnement serveur.
export default {
  fetch: creerRouteJeton(),
}
