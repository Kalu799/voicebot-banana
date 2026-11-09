# Préparer la présentation de BananaNavy

Support de travail pour l’oral et les futures slides. Hypothèse de départ :
**8 à 10 minutes, dont environ 2 minutes de démonstration**, puis questions.
Le mail ne fixe ni durée ni format : adapter ce minutage si une consigne arrive.
Les formulations à la première personne sont proposées ; les garder seulement
si elles correspondent à ce que tu as réellement fait et compris.

## Le message à faire passer

> J’ai choisi un besoin simple : garder et retrouver des idées à la voix.
> J’ai construit une application qui relie une conversation à de vraies actions
> sur les notes, avec sauvegarde locale, contrôles d’erreur et démonstration de secours.
> Je peux expliquer mes choix, ce que j’ai vérifié et ce qui reste à améliorer.

Le mail demande un projet libre et cherche surtout à évaluer la démarche.
Aucun barème technique précis n’est fourni. Les liens ci-dessous sont une
interprétation de ces attentes, pas une grille officielle.

| Attente citée | Ce que tu peux montrer | Preuve concrète |
| --- | --- | --- |
| Autonomie | Transformer le sujet libre en périmètre et jalons vérifiables | Cadrage, suivi, premier jalon de note vocale persistante |
| Débrouillardise | Continuer à développer avec un quota vocal limité | Simulateur utilisant les mêmes outils que la voix |
| Curiosité technique | Comprendre conversation, outils exécutés côté client et accès serveur | Parcours d’une demande expliqué dans CODE.md |
| Structuration | Séparer interface, règles métier, état, stockage et intégration | Organisation des fichiers et tests ciblés |
| Implication personnelle | S’approprier les choix, vérifier et identifier ses apprentissages | Démo, exemple de problème résolu, bilan personnel honnête |

## Déroulé proposé

| Temps indicatif | Slide future | À afficher | À expliquer |
| --- | --- | --- | --- |
| 0:00–0:45 | 1. Le besoin | Une phrase et une capture | Capturer et retrouver des idées, public personnel, périmètre choisi |
| 0:45–1:45 | 2. Ma démarche | Besoin → notes locales → outils → voix → validation | Pourquoi avoir avancé dans cet ordre et comment le quota a influencé les tests |
| 1:45–3:00 | 3. Le fonctionnement | Parole → outil → store → IndexedDB → résultat | Frontière entre l’IA qui interprète et le code qui valide/exécute |
| 3:00–5:00 | 4. Démonstration | Application ouverte | Créer, corriger, arrêter, recharger ; recherche/corbeille si le temps le permet |
| 5:00–6:15 | 5. Les choix | Trois choix, trois raisons | Stockage local, outils partagés, clé côté serveur |
| 6:15–7:30 | 6. Un problème concret | Exemple d’édition concurrente ou confirmation après sauvegarde | Problème, solution, vérification et limites |
| 7:30–8:30 | 7. Bilan et suite | Acquis, limites, trois priorités | Ce que tu sais expliquer, ce qui reste non vérifié et prochain travail utile |

Pour un format de cinq minutes : besoin, fonctionnement, démo courte, bilan.
Ne pas dérouler tous les fichiers ni lire des blocs de code à l’écran.

## Notes de parole proposées

### 1. Le besoin

« Le sujet était libre autour d’un voicebot IA. J’ai retenu un assistant personnel
de notes : dicter une idée, la compléter et la retrouver. C’est un périmètre
facile à démontrer, mais qui oblige à traiter une vraie chaîne complète :
comprendre une demande, agir sur les données et conserver le résultat. »

À personnaliser : pourquoi ce besoin t’intéresse personnellement. Ne pas inventer
une étude utilisateur ou des entretiens qui n’ont pas eu lieu.

### 2. La démarche

« J’ai commencé par la gestion des notes et la sauvegarde. Ensuite, j’ai défini
six outils pour les actions. Un simulateur m’a permis de les exercer sans
consommer de minutes vocales. Enfin, j’ai relié ces mêmes outils à ElevenLabs
et vérifié le parcours vocal. »

Appuis : [cadrage](CADRAGE.md), [démarche](DEMARCHE.md), [suivi](SUIVI.md).
L’historique montre le premier jalon atteint le 9 novembre 2026 : création vocale
et note retrouvée après rechargement. Ne pas transformer une estimation de temps
en durée de travail exacte ; les heures réelles sont à préciser personnellement.

### 3. Le fonctionnement

« ElevenLabs prend en charge la conversation. Quand l’agent veut créer une note,
il appelle un outil avec des paramètres. Mon application les contrôle puis passe
par le store. Le store attend la fin de la transaction IndexedDB avant de renvoyer
un succès. L’agent n’a donc pas d’accès direct et libre à la base. »

Ajouter : « Une fonction serveur obtient le jeton de conversation. Elle garde la
clé API hors du navigateur. Les notes restent stockées localement, mais leur
contenu est transmis à ElevenLabs lorsqu’un outil le renvoie à l’agent. »

### 4. La démonstration

Version courte pour maîtriser la durée :

1. Présenter l’écran : conversation à gauche, notes à droite.
2. Démarrer avec le code saisi en privé.
3. Demander : « Crée une note Démo présentation, contenu : présenter mon voicebot. »
4. Demander : « Ajoute que la démonstration dure une minute. »
5. Arrêter explicitement, recharger et montrer la note conservée.
6. Si temps et quota disponibles : retrouver/lire, mettre en corbeille et restaurer.

Les six outils ont déjà été exercés dans les essais consignés ; cette séquence
courte ne prétend pas les redémontrer tous. Les sessions s’arrêtent au masquage
de la page : arrêter avant de retourner aux slides. En cas d’échec de la voix,
annoncer le passage au simulateur et montrer une action réelle sur les notes.

Avant l’oral : vérifier accès, échéance de la clé, quota, permissions micro et
origine du navigateur. Exporter les notes utiles et ouvrir les captures de secours.
Voir [DEMONSTRATION.md](DEMONSTRATION.md) pour le parcours complet.

### 5. Les choix

« IndexedDB me permet de démontrer une vraie persistance sans créer un backend
de notes ou des comptes. En échange, les notes ne sont pas synchronisées entre
appareils. Context et useReducer suffisent pour cet état partagé. Enfin, un
adaptateur d’outils commun garantit que la simulation et la voix passent par
les mêmes validations et actions. »

Préciser que la fonction serveur reste nécessaire pour protéger la clé :
stockage local ne signifie pas application entièrement sans serveur.

### 6. Un problème concret à expliquer

Choisir un seul exemple et le comprendre jusqu’au bout.

**Exemple A — ne pas annoncer un faux succès.** Une requête IndexedDB peut avoir
réussi avant que sa transaction entière soit validée. L’application attend la
fin de la transaction, puis actualise l’état et renvoie le résultat. Si l’écriture
échoue, le contrat d’outil retourne `succes: false`.

**Exemple B — préserver les modifications récentes.** Pendant qu’un formulaire
est ouvert, une commande vocale peut changer une note. Le formulaire n’envoie
que les champs réellement édités ; le store vérifie leurs valeurs d’ouverture.
Un conflit sur le même champ est refusé au lieu d’écraser silencieusement la
modification. Ce contrôle ne couvre pas plusieurs onglets indépendants.

Appuis : commentaires dans `NotesProvider.jsx`, `note.js` et tests d’édition.
Ce sont des problèmes traités par le code ; décrire un incident personnel précis
seulement si tu te rappelles l’avoir réellement rencontré.

### 7. Le bilan

« Le parcours principal fonctionne sur ordinateur et les notes persistent.
Le projet m’a permis de travailler sur la relation entre IA et code applicatif,
la coordination asynchrone et la validation. Mes prochaines priorités seraient
les cas vocaux ambigus, les essais audio sur téléphone et le renforcement de
l’accès si l’application devait être ouverte à plusieurs utilisateurs. »

À adapter à tes acquis : ce que tu connaissais déjà, ce que tu as appris,
ce que tu peux refaire seul et ce que tu dois encore approfondir.

## Questions probables et réponses à travailler

### Pourquoi ce projet plutôt qu’un chatbot classique ?

La voix répond au besoin de capturer une idée sans la saisir. L’intérêt technique
est aussi de passer d’une conversation à des actions vérifiables et persistantes.
Le formulaire reste utile pour corriger précisément. Aucun gain de productivité
n’a été mesuré par une étude utilisateur.

### Qu’as-tu fait personnellement ? Quelle place a eu l’IA ?

Le projet a été développé avec une aide IA pour proposer, expliquer et revoir
du code et de la documentation. Ne pas prétendre avoir tout écrit seul.
Préparer trois exemples réels de décisions, retours, tests ou corrections que
tu as portés. Expliquer comment tu as vérifié et compris les propositions ;
ne pas revendiquer des tâches dont tu ne peux pas expliquer le fonctionnement.
Le mail évalue l’autonomie : montrer ta capacité à décider, vérifier et apprendre.

### Pourquoi ElevenLabs ? As-tu comparé d’autres solutions ?

Le mail invitait à l’explorer et la plateforme permet de relier une conversation
à des outils côté navigateur. Le projet utilise cette intégration et documente
ses contraintes. Les documents ne prouvent pas de benchmark exhaustif : ne pas
inventer des tests de concurrents. Une étude comparative serait un travail futur.

### As-tu créé ou entraîné le modèle d’IA ?

Non. Le projet intègre un service de conversation et configure un agent avec
consignes et outils. La contribution applicative concerne l’interface, la logique
des notes, la persistance, les contrôles et l’intégration. Ne pas citer de modèle
ou voix précis sans revérifier la configuration distante retenue.

### Qui fait quoi entre reconnaissance vocale, LLM et application ?

La plateforme prend en charge la chaîne de conversation vocale, l’interprétation
et la réponse. Le modèle demande un outil ; l’application valide les paramètres
et exécute une fonction locale. Les notes ne sont pas écrites directement par
le modèle. Le SDK relie la conversation aux fonctions enregistrées.

### Pourquoi React et JavaScript ? Pourquoi pas Vue ou TypeScript ?

La stack retenue utilise React et le SDK React ElevenLabs. JavaScript/JSX a permis
de commencer avec des composants simples et moins de notions à introduire.
Il n’y a pas de comparaison expérimentale Vue/React ou JavaScript/TypeScript
consignée. TypeScript pourrait mieux décrire les contrats, mais ne remplacerait
pas la validation des paramètres réellement reçus à l’exécution.

### Pourquoi Context/useReducer plutôt qu’une bibliothèque de store ?

Le périmètre est réduit et les opérations passent par un provider unique.
Context distribue l’accès, useReducer rend les transitions explicites et le
provider coordonne les effets. Cela évite une dépendance supplémentaire.
La file de promesses et les refs règlent la fraîcheur des actions asynchrones ;
le reducer seul ne règle pas ce problème.

### Pourquoi IndexedDB ? Pourquoi pas localStorage ou une base distante ?

IndexedDB stocke des objets et permet des transactions asynchrones, utiles pour
les notes et un import atomique. Le stockage local limite le backend du prototype.
En contrepartie, aucune synchronisation ni sauvegarde distante automatique.
Le projet n’établit pas que les alternatives seraient impossibles ou moins bonnes
pour tous les usages.

### Que se passe-t-il si la voix et le formulaire changent la même note ?

Les actions du même provider sont exécutées dans une file. Le formulaire envoie
uniquement ses champs changés et leurs valeurs d’ouverture. Une évolution du même
champ est refusée si elle entre en conflit. Les autres champs récents sont gardés.
Les onglets distincts ne partagent pas cette file.

### Comment sais-tu que la note est vraiment sauvegardée ?

L’écriture attend la fin de la transaction IndexedDB, puis le store et le résultat
d’outil sont actualisés. Les essais consignés incluent un rechargement après
création, modification et restauration. Cela ne garantit pas la conservation
si l’utilisateur efface les données de son navigateur : d’où l’export.

### L’IA peut-elle inventer une note ou supprimer la mauvaise ?

Le code n’agit que via les outils prévus et des paramètres validés. Les mutations
ciblent un id obtenu par création/recherche, pas un titre seul. L’agent doit
clarifier les ambiguïtés selon ses consignes ; ce comportement reste à vérifier
sur les cas vocaux ambigus. La validation du format ne garantit pas que le modèle
a compris la bonne intention. La corbeille rend la suppression réversible.

### Est-ce sécurisé ? Où est la clé ?

La clé est dans l’environnement serveur. La route vérifie POST, activation,
configuration, origine et code personnel via son empreinte SHA-256 ; elle retourne
seulement un jeton. Une limitation Vercel a été vérifiée dans les essais consignés.
Cela protège le périmètre de démonstration, sans constituer une authentification
multi-utilisateur ni un audit de sécurité complet. Le contrôle Origin seul
n’est pas une authentification.

### Les notes sont-elles privées ? Tout reste-t-il sur l’ordinateur ?

La base des notes est locale, mais le contenu retourné à l’agent et les échanges
vocaux passent par ElevenLabs. La transcription affichée n’est pas sauvegardée
par l’application. Cela ne prouve pas l’absence de conservation chez le fournisseur :
ses réglages doivent être vérifiés. Utiliser des données fictives pour la démo.

### Et si une note contient « ignore tes instructions » ?

Une note doit être traitée comme une donnée, pas comme une consigne. Les outils
bornent les actions possibles mais ne suffisent pas à garantir ce comportement
conversationnel. Le scénario hostile n’a pas encore été validé vocalement ;
le tester et renforcer les consignes font partie des suites utiles.

### Combien ça coûte ? Pourquoi un simulateur ?

Le développement a été organisé autour d’un quota gratuit limité. Le simulateur
permet de vérifier la logique sans conversation payante. Les coûts exacts dépendent
des tarifs, réglages et usages ; l’étude du dépôt est datée et ne constitue pas
un devis actuel. Avant d’annoncer un chiffre, revérifier les tarifs et le compte.
Les arrêts locaux ne sont pas un plafond global de dépenses côté fournisseur.

### Quels tests as-tu faits ? Est-ce suffisant ?

Les tests Node couvrent recherche/outils, conflits d’édition et accès client/serveur
au jeton, avec fournisseurs simulés. Des contrôles navigateur et essais vocaux
sont consignés séparément. Le parcours ordinateur principal a été exercé.
Il manque notamment des essais vocaux ambigus, le microphone sur téléphone et
une panne réelle de stockage pendant la voix. Ne pas présenter le build ou
les tests Node comme une validation complète de l’expérience vocale.

### Que fais-tu si Internet ou ElevenLabs tombe pendant la présentation ?

J’arrête la conversation et je passe au simulateur en le signalant. Il utilise
les mêmes fonctions et modifie réellement les notes. La gestion locale reste
utilisable sur la page déjà chargée ; le site n’est pas une PWA avec garantie
de chargement hors ligne. Les captures documentent les essais vocaux passés.

### Qu’as-tu laissé de côté et pourquoi ?

Comptes, synchronisation distante, conservation audio et suppression définitive
ne font pas partie du périmètre retenu. Cela permet de finir un parcours cohérent.
Le téléphone audio et certains cas vocaux difficiles restent à valider : les
présenter comme tels plutôt que comme des fonctionnalités achevées.

### Que changerais-tu pour en faire un produit public ?

D’abord vérifier le besoin avec de vrais utilisateurs. Puis ajouter une identité
utilisateur, l’isolation des données, une persistance distante si nécessaire,
des limites serveur adaptées et une observation des erreurs. Définir précisément
les règles de confidentialité, sauvegarde et suppression avant ouverture.
Ces évolutions sont des propositions, pas des réalisations du prototype.

### Quelle est la difficulté principale et qu’as-tu appris ?

Choisir un exemple que tu sais expliquer dans le code : transaction avant succès,
file d’actions ou conflit d’édition. Expliquer le besoin, le mécanisme et comment
il est vérifié. Pour le bilan personnel, distinguer connaissances antérieures,
notions découvertes et aide reçue ; il n’est pas nécessaire de prétendre tout maîtriser.

## Répétition avant de créer les slides

- Savoir raconter le parcours `creer_note` sans lire le code.
- Expliquer avec ses mots : outil, store, reducer, ref, transaction, jeton.
- Choisir un problème technique et trois contributions personnelles vérifiables.
- Chronométrer une démo courte, prévoir le simulateur et arrêter avant de changer d’onglet.
- Préparer une réponse honnête sur chaque limite connue.

La mise en forme des slides vient après appropriation de ce récit. Le mail ne
demande pas le plus grand nombre de fonctionnalités ; il donne surtout du poids
à la façon d’aborder le projet et d’argumenter les choix.
