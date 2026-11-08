# Route serveur de jetons de conversation

Implémentation ajoutée le 8 novembre 2026, **désactivée par défaut**. Les tests
utilisent un fournisseur simulé ; la route n’a pas été déployée ni exercée avec
ElevenLabs. Aucun secret réel n’a été créé ou renseigné pendant cette étape.

## Fichiers et flux

| Fichier | Responsabilité |
| --- | --- |
| `conversation-token.js` | Entrée Vercel utilisant les objets Web `Request` et `Response` |
| `../server/routeJeton.js` | Vérifications locales et demande du jeton au fournisseur |
| `../.env.example` | Variables documentées sans secret, accès désactivé |
| `../tests/routeJeton.test.js` | Scénarios Node sans réseau ni données réelles |

Flux cible : navigateur → pare-feu Vercel → `POST /api/conversation-token` →
contrôle du code d’accès → ElevenLabs → jeton WebRTC → navigateur.
Le SDK et le champ de saisie du code d’accès ne sont pas encore implémentés.

Le navigateur devra envoyer `Authorization: Bearer <code-personnel>` et utiliser
la même origine que l’application. La route ne lit aucun corps de requête et
n’utilise pas les paramètres de l’URL entrante : l’identifiant de l’agent vient
exclusivement de l’environnement serveur. Elle appelle en GET l’endpoint
`https://api.elevenlabs.io/v1/convai/conversation/token` avec `agent_id` et la clé
dans l’en-tête `xi-api-key`. La réponse au navigateur contient uniquement `token`.

## Configuration prévue

Les variables sont documentées dans [`.env.example`](../.env.example).

| Variable | Rôle |
| --- | --- |
| `VOICEBOT_VOIX_ACTIVE` | Seule la valeur exacte `true` ouvre le verrou ; conserver `false` tant que les prérequis ne sont pas vérifiés |
| `ELEVENLABS_API_KEY` | Clé ElevenLabs, exclusivement côté serveur |
| `ELEVENLABS_AGENT_ID` | Identifiant de notre agent, fixé côté serveur |
| `VOICEBOT_CODE_ACCES_SHA256` | Empreinte SHA-256 hexadécimale de 64 caractères du code personnel |
| `VOICEBOT_ORIGINE` | Origine exacte autorisée, sans chemin ni barre finale, par exemple `https://voicebot.example` |

Le futur code d’accès sera aléatoire et long : 32 à 128 caractères parmi lettres
ASCII, chiffres, tiret et soulignement. Ce format permet notamment un code généré
à partir de 32 octets aléatoires encodés en base64url. La création du code et de
son empreinte sera expliquée dans une étape distincte, sans les enregistrer dans
Git ni les partager dans le chat. L’interface le conservera uniquement en mémoire.
La comparaison des empreintes utilise `timingSafeEqual` sur deux buffers de
32 octets ; cela ne remplace pas la limitation des tentatives.

Aucune variable secrète ne porte le préfixe `VITE_`. `.env.local` est déjà exclu
de Git. En production, HTTPS est nécessaire pour le code et le jeton. Le contrôle
d’origine est complémentaire : un client extérieur au navigateur peut fabriquer
cet en-tête. Il ne constitue pas une authentification.

## Limitation à configurer avant activation

La limitation n’est **pas implémentée dans cette fonction** : elle sera appliquée
par une règle Vercel devant la route, et devra être vérifiée séparément.
Le verrou `VOICEBOT_VOIX_ACTIVE` est manuel : il ne détecte pas automatiquement
la présence ou la suppression de cette règle.

Proposition : chemin exact `/api/conversation-token`, 2 demandes par minute et
par adresse IP, fenêtre fixe, action de refus HTTP `429`. Ne pas limiter la règle
aux appels déjà authentifiés : les mauvaises tentatives doivent aussi être comptées.
Vérifier qu’elle couvre tous les domaines et déploiements utilisés pour les essais.

La documentation publique consultée le 8 novembre 2026 indique une règle de
limitation incluse sur Hobby. Les conditions effectivement affichées dans le
compte, la disponibilité de cette règle et l’absence de paiement à activer devront
être vérifiées avant configuration. Aucun service ou SDK de limitation ajouté.

Cette règle évite un compteur en mémoire propre à chaque instance et n’ajoute
pas de base distante. Elle ne garantit pas un plafond global de dépenses : les
compteurs sont régionaux, une fenêtre fixe permet des rafales à sa frontière et
plusieurs adresses IP ont des compteurs distincts. Elle limite les demandes de
jetons, pas les minutes consommées par une conversation. Le quota, le coût LLM
et l’absence de dépassement autorisé restent à vérifier côté ElevenLabs avant essai.

Ordre avant toute activation réelle : configurer et vérifier la règle Vercel
avec un fournisseur simulé, contrôler les conditions de facturation ElevenLabs,
préparer les secrets et l’origine exacte, puis ouvrir explicitement le verrou
après explication et accord. Garder le verrou fermé si la protection est retirée.

## Réponses et erreurs

| Statut | Signification |
| --- | --- |
| `200` | Jeton non vide reçu ; réponse `{ token }` |
| `405` | Méthode différente de POST ; en-tête `Allow: POST` |
| `503` | Accès désactivé ou configuration absente/invalide |
| `403` | En-tête Origin absent ou différent de l’origine autorisée |
| `401` | En-tête Bearer absent, format du code invalide ou empreinte différente |
| `502` | Échec HTTP du fournisseur, réponse JSON/jeton invalide, panne ou expiration |

Les refus locaux ne contactent pas ElevenLabs. Un appel amont a une limite de
10 secondes ; les redirections sont refusées et aucune nouvelle tentative n’est
lancée automatiquement. Une erreur `429` du fournisseur devient elle aussi un
`502` générique ; le `429` de la règle Vercel sera produit avant la fonction.

Toutes les réponses du gestionnaire portent `Cache-Control: no-store`. Les
erreurs n’exposent ni réponse brute du fournisseur, ni cause technique, ni clé.
Le gestionnaire ne journalise pas le code ni les jetons. Ne pas ajouter ces valeurs
aux logs de débogage lors du futur branchement.

## Vérification locale

```bash
npm test
node tests/routeJeton.test.js
npm run build
```

Les onze scénarios de la route utilisent des valeurs fictives et une fonction
`demander` simulée. Ils couvrent les refus, l’origine, le code, l’agent fixé côté
serveur, la confidentialité des réponses, le JSON invalide, les pannes et une
expiration simulée. Ils ne mesurent pas une attente réelle de dix secondes et
ne vérifient pas le pare-feu, la facturation ni un déploiement Vercel.

`npm run dev` démarre Vite uniquement : il ne sert pas cette route et ne charge
pas son environnement serveur pour les tests Node. Une future étape présentera
`vercel dev`, son installation et l’exécution locale de l’interface et des fonctions
ensemble, avec le port réellement utilisé. Aucune CLI Vercel n’a été ajoutée ici.
La compilation Vite vérifie l’interface ; elle ne valide pas le runtime serveur
Vercel. Le module d’entrée est importé et exercé directement dans les tests Node.

## Sources officielles consultées le 8 novembre 2026

- [Jeton WebRTC ElevenLabs](https://elevenlabs.io/docs/eleven-agents/api-reference/conversations/get-webrtc-token)
- [Runtime Node.js Vercel](https://vercel.com/docs/functions/runtimes/node-js)
- [Limitation Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
- [Exécution locale avec vercel dev](https://vercel.com/docs/cli/dev)
