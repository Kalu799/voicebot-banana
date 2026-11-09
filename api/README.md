# Route serveur de jetons de conversation

Implémentation ajoutée le 8 novembre 2026, **désactivée par défaut**. Les tests
utilisent un fournisseur simulé. La route est déployée depuis le 9 novembre 2026
avec le verrou fermé ; aucun accès réel à ElevenLabs ni secret réel ajouté.

## Fichiers et flux

| Fichier | Responsabilité |
| --- | --- |
| `conversation-token.js` | Entrée Vercel utilisant les objets Web `Request` et `Response` |
| `../server/routeJeton.js` | Vérifications locales et demande du jeton au fournisseur |
| `../.env.example` | Variables documentées sans secret, accès désactivé |
| `../tests/routeJeton.test.js` | Scénarios Node sans réseau ni données réelles |

Flux cible : navigateur → pare-feu Vercel → `POST /api/conversation-token` →
contrôle du code d’accès → ElevenLabs → jeton WebRTC → navigateur.
Le SDK et le panneau de saisie du code sont préparés depuis le 9 novembre 2026,
sans conversation réelle validée. Le panneau utilise `src/services/conversationAccess.js`
pour demander le jeton ; il n’ouvre la connexion WebRTC qu’après une réponse valide.

Le navigateur envoie `Authorization: Bearer <code-personnel>` et doit utiliser
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

## Limitation avant activation

La limitation n’est **pas implémentée dans cette fonction** : une règle Vercel
est publiée devant la route depuis le 9 novembre 2026, vérifiée séparément.
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
avec la voix désactivée, contrôler les conditions de facturation ElevenLabs,
préparer les secrets et l’origine exacte, puis ouvrir explicitement le verrou
après explication et accord. Garder le verrou fermé si la protection est retirée.

### Préparation théorique et essais reportés — 8 novembre 2026

Le projet `voicebot-banana` a été créé dans l’espace Vercel `Ouais`, dont
l’offre Hobby a été constatée. Aucun déploiement ni règle de limitation appliqué.
L’import direct de `feature/integration-elevenlabs` a été refusé par l’interface ;
le projet a été créé vide. Aucun dépôt Git connecté pendant cette préparation.

À la demande de l’utilisateur, la configuration et les essais distants sont
reportés au moment de la pull request vers `dev`. La procédure reste théorique :

1. Déployer la révision contenant la route, avec `VOICEBOT_VOIX_ACTIVE=false`
   et sans clé ElevenLabs ; vérifier la branche et le commit effectivement servis.
2. Vérifier les conditions gratuites affichées puis appliquer la règle : chemin
   exact `/api/conversation-token`, fenêtre fixe de 60 secondes, deux demandes
   par IP, action `429`, sans condition sur le code d’accès.
3. Vérifier d’abord un POST en `503` avec le message de verrou fermé, puis des
   POST rapprochés déclenchant `429` et un retour à `503` après expiration de la
   fenêtre. Contrôler les événements du pare-feu et les domaines réellement utilisés,
   y compris le déploiement de prévisualisation s’il sert aux essais.

Le pare-feu intervient avant la fonction : ce contrôle ne nécessite ni fournisseur
simulé dans le déploiement ni accès réel à ElevenLabs. Il valide uniquement la
limitation distante ; les tests Node conservent le fournisseur simulé pour la route.
Une PR seule ne prouve ni le déploiement de la bonne révision ni la protection.
Maintenir le verrou fermé jusqu’à ces vérifications.

### Déploiement verrouillé vérifié — 9 novembre 2026

Après fusion de la PR n° 3, le dépôt `Kalu799/voicebot-banana` est connecté au
projet Vercel existant, sur Hobby. Déploiement manuel depuis `dev`, commit
`71ba461d948a2cf51f330071e84efd6ce1f5e61c`, identifié `GhNXoPtnAkPcpYrykBSc5yAS74Hg`.
Le formulaire proposait une prévisualisation ; Vercel a finalement classé ce premier
déploiement dans l’environnement **Production**. La branche Git `main` est inchangée.

Réglages : preset Vite, racine du dépôt (champ vide), build `npm run build`, sortie
`dist`, machine Basic et concurrence à la demande désactivée. Variable non secrète
`VOICEBOT_VOIX_ACTIVE=false` enregistrée pour Production, Preview et Development.
Aucune clé ElevenLabs, empreinte de code ou origine réelle ajoutée.

Le réglage Node 24.x est supplanté par `engines.node: ">=22.12.0"` : Vercel
annonce Node 26.x pour ce déploiement. Le build réussit, avec avertissements sur
cette plage ouverte, le poids du bundle et l’outillage npm. La CLI locale du projet
est ignorée ; le build distant utilise la CLI Vercel 65.11.0. Aucun correctif de
dépendances ni modification de `package.json` appliqué pendant cette étape.
Un alignement explicite de la version Node reste à proposer séparément.

Contrôles HTTP sans authentification sur [l’adresse principale](https://project-bxwwf.vercel.app) :

| Demande | Résultat constaté |
| --- | --- |
| GET `/` | `200`, interface et panneau vocal affichés |
| GET `/api/conversation-token` | `405`, `Allow: POST`, JSON « Méthode non autorisée. », `Cache-Control: no-store` |
| POST `/api/conversation-token` | `503`, JSON « L’accès vocal est désactivé. », `Cache-Control: no-store` |

Dans l’interface, un code fictif au format valide affiche « L’accès vocal est
désactivé ou indisponible. » et le champ est effacé, sans démarrer de session.
Aucune note créée pendant ces contrôles. L’alias
`voicebot-banana-git-dev-ouais.vercel.app` redirige les contrôles non authentifiés
en `302` vers Vercel Authentication ; cette protection est conservée.

À la demande de l’utilisateur, aucun pare-feu de limitation n’est configuré ni
testé pendant ce déploiement. La vérification `429` reste à faire avant activation
de la voix, ainsi que les contrôles du compte gratuit et des secrets côté serveur.
Le succès de ce déploiement verrouillé ne valide pas une conversation réelle.

### Limitation publiée et vérifiée — 9 novembre 2026

Règle `Limiter les jetons BananaNavy`, identifiant
`rule_limiter_les_jetons_banana_navy_3FGISp`, publiée sur le projet Hobby :
Request Path Equals `/api/conversation-token`, fenêtre fixe de 60 secondes,
deux demandes par adresse IP, action Too Many Requests (`429`). Aucune condition
de méthode, de domaine ou d’authentification ajoutée. La fiche rouverte confirme
les valeurs et le tableau de bord affiche une règle active, un événement limité.
Aucun abonnement, option payante ou paiement activé pendant cette configuration.

Contrôles sur `https://project-bxwwf.vercel.app`, sans code personnel ni clé :
trois POST rapprochés donnent `503`, `503`, puis `429` (région d’entrée `cdg1`).
Un POST plus d’une minute après donne à nouveau `503` et le message de verrou
fermé ; GET `/` reste en `200`. Les demandes refusées ne créent pas de conversation.
Ce résultat vérifie le domaine et la région exercés, sans prouver un plafond
global ni la couverture effective de tous les alias de prévisualisation protégés.
Le lien détaillé « View Traffic » de la fiche a renvoyé `404` ; le compteur de
l’aperçu et les réponses HTTP ont permis de vérifier le blocage sans poursuivre
le diagnostic de ce lien d’interface.

Compte ElevenLabs contrôlé en lecture seule : Free, 6 299 crédits restants,
recharge automatique désactivée ; la FAQ indique que le coût LLM est déduit des
crédits. Les limites de l’agent sont publiées à cinq appels par jour et un appel
simultané. La voix reste fermée, sans secrets réels ni appel fournisseur.

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
pas son environnement serveur pour les tests Node. La compilation Vite vérifie
l’interface ; le module serveur est exercé directement dans les tests Node.

### Interface et fonction avec Vercel local

La CLI officielle `vercel` **65.12.1** est installée dans les dépendances de
développement, avec version exacte dans `package.json` et dépendances résolues
dans le lockfile. Après `npm ci`, lancer depuis la racine de `voicebot` :

```bash
npm run dev:api
```

La commande ajoutée est :

```bash
VOICEBOT_VOIX_ACTIVE=false vercel dev --local --listen 127.0.0.1:3000
```

La syntaxe de variable en début de commande est destinée à l’environnement Linux
du projet. La CLI n’est pas installée globalement. À son premier lancement, elle
crée son dossier de configuration utilisateur. `--local` permet de démarrer sans
connexion au compte, création ou liaison de projet Vercel ; aucune variable
distante n’est récupérée. La CLI détecte Vite, lance son serveur et sert aussi
les fonctions du dossier `api/`. Elle affiche également des ports de ressources
locales (Queues, Schedules, Runtime Cache) ; ils ne correspondent pas à des
services distants créés ou utilisés par notre route.

Le serveur principal écoute sur la boucle locale uniquement. Ouvrir
`http://127.0.0.1:3000` ; conserver cette origine pour retrouver les mêmes notes.
L’application utilise IndexedDB propre à l’origine : changer d’hôte ou de port
ne transfère pas les notes. Cette commande maintient volontairement le verrou
vocal fermé. Aucune clé réelle n’est nécessaire pour les contrôles ci-dessous.
Le futur lancement de sessions réelles nécessitera une étape distincte, après
vérification de la protection et des coûts. Le pare-feu Vercel distant n’est pas
reproduit ou validé par ce lancement local.

Contrôles effectués le 8 novembre 2026 :

| Demande | Résultat constaté |
| --- | --- |
| GET `/` | `200`, interface React affichée dans le navigateur, notes et simulateur accessibles |
| GET `/api/conversation-token` | `405`, JSON « Méthode non autorisée. », `Allow: POST`, `Cache-Control: no-store` |
| POST `/api/conversation-token` | `503`, JSON « L’accès vocal est désactivé. », `Cache-Control: no-store` |

Le `503` confirme ici que Vercel local reconnaît le module d’entrée et exécute le
verrou du gestionnaire, sans demander de jeton à ElevenLabs. Le parcours autorisé
avec un fournisseur simulé reste couvert par les tests Node. Aucun déploiement,
appel vocal ou clé réelle utilisé. Ces résultats ne valident pas un déploiement
Vercel en production.

Pour arrêter un serveur lancé dans son terminal : `Ctrl+C`. Arrêter l’instance
précédente avant de relancer la commande sur le même port.

### Audit de l’outillage ajouté

Décision du 8 novembre 2026 : suspendre les corrections exhaustives des dépendances
de développement pour privilégier la V1 démontrable. Le dernier relevé consigné
est de 29 signalements (10 modérés, 19 élevés, zéro critique), zéro en production ;
ce n’est pas un audit actuel ni une garantie d’absence de risque. Les avis restants
et le réexamen des overrides constituent une dette ; ne traiter immédiatement que
ce qui affecte directement notre usage ou bloque le parcours.

Lors de l’installation le 8 novembre 2026, `npm audit` signalait **38 vulnérabilités** dans l’arbre de
dépendances de développement introduit par la CLI : 16 modérées, 21 élevées et
une critique. `npm audit --omit=dev` ne signale aucune vulnérabilité dans les
dépendances de production. Ce résultat ne constitue pas une garantie de sécurité
générale ; il décrit les avis connus au moment du contrôle.

La suggestion npm pour certains avis rétrograde la CLI vers 65.2.0. Aucun
`npm audit fix`, rétrogradation ou remplacement forcé de dépendance n’a été
appliqué automatiquement. La résolution des avis de la CLI reste un point ouvert.
La commande locale est limitée à `127.0.0.1`. La CLI est un outil de développement,
distinct du code livré dans le navigateur ; elle n’est pas importée par la route.

### Correction ciblée de tar — 8 novembre 2026

Après explication et accord, `package.json` contient cette substitution limitée
aux descendants de la CLI Vercel :

```json
"overrides": {
  "vercel": {
    "tar": "7.5.22"
  }
}
```

Le lockfile remplace `tar@7.5.11` par `7.5.22` et retire la copie imbriquée
désormais redondante sous `@vercel/fun`. `npm ls tar --all` confirme que
`@vercel/container`, `@mapbox/node-pre-gyp` et `@vercel/fun` utilisent tous cette
version. La CLI reste en 65.12.1 ; React, Vite et le code applicatif sont inchangés.

Cette règle remplace notamment la version exacte demandée par
`@vercel/container` : il s’agit d’une substitution du projet, pas d’une mise à
jour validée par tous les mainteneurs des composants Vercel. Les contrôles locaux
vérifient notre parcours ; ils ne couvrent pas toutes les fonctions de la CLI.
Réexaminer l’override lors d’une future mise à jour de Vercel, puis le retirer
si ses dépendances corrigées le rendent inutile.

Nouvel audit : **37 signalements** (16 modérés, 21 élevés, zéro critique),
aucun signalement pour `tar`. L’audit des seules dépendances de production
reste à zéro. Les autres avis ne sont pas corrigés par cette substitution.
Les tests, la compilation et le redémarrage Vercel local réussissent ; l’interface
répond `200`, la route refuse GET en `405` et POST en `503` avec le verrou fermé.
Aucun accès ElevenLabs réel utilisé.

Sources de cette décision : [overrides npm](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides)
et [avis tar corrigé à partir de 7.5.21](https://github.com/advisories/GHSA-r292-9mhp-454m).

### Correction ciblée des lecteurs et validateurs — 8 novembre 2026

Après présentation et accord, trois substitutions complètent celle de tar :

```json
"overrides": {
  "vercel": {
    "tar": "7.5.22",
    "ajv": "8.18.0",
    "js-yaml": "4.3.2",
    "smol-toml": "1.9.0"
  }
}
```

`npm ls ajv js-yaml smol-toml --all` confirme ces versions sous Vercel. Ajv passe
de 8.6.3 à 8.18.0, js-yaml de 4.1.1 à 4.3.2 et smol-toml de 1.5.2 à 1.9.0.
Le lockfile actualise aussi les dépendances d’Ajv : `fast-uri` remplace
`uri-js` et son ancien descendant `punycode` devenu inutile. La CLI reste en
65.12.1 et les versions directes React/Vite sont conservées.

Nouvel audit : **29 signalements** (10 modérés, 19 élevés, zéro critique).
Ajv, js-yaml et smol-toml ne figurent plus parmi les bibliothèques signalées.
La baisse dépasse trois entrées car le rapport signale aussi des paquets parents
affectés par leurs dépendances. Les dépendances de production restent à zéro.

Tests, compilation, arbre npm et redémarrage Vercel local réussis. Contrôles HTTP :
interface `200`, route GET `405` avec `Allow: POST`, POST `503` avec verrou fermé,
réponses de route sans cache. Contrôles ponctuels supplémentaires : validation
Ajv d’un objet valide et refus de types/champs incorrects, lecture YAML simple,
aller-retour de valeurs TOML avec conservation des objets sans prototype.
Ces essais ne couvrent pas tous les usages de ces bibliothèques dans la CLI.
Les overrides restent à réexaminer lors des mises à jour de Vercel ; les 29 autres
signalements restent ouverts. Aucun appel ElevenLabs réel effectué.

Sources des versions corrigées : [Ajv](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6),
[js-yaml](https://github.com/advisories/GHSA-2883-xcg3-v3hh),
[smol-toml](https://github.com/advisories/GHSA-r4xh-jqrq-34v2).

## Sources officielles consultées le 8 novembre 2026

- [Jeton WebRTC ElevenLabs](https://elevenlabs.io/docs/eleven-agents/api-reference/conversations/get-webrtc-token)
- [Runtime Node.js Vercel](https://vercel.com/docs/functions/runtimes/node-js)
- [Limitation Vercel](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
- [Exécution locale avec vercel dev](https://vercel.com/docs/cli/dev)
