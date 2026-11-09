# Voicebot — BananaNavy

Application web personnelle pour gérer ses notes en parlant : création, recherche,
lecture, modification, classement, corbeille et restauration.

**État actuel :** base React + Vite, page d'accueil, modèle de note et service
IndexedDB pour enregistrer et récupérer les notes, export/import JSON validé.
Le store Context + useReducer charge les notes au démarrage et permet de les créer,
modifier, mettre en corbeille et restaurer après sauvegarde réussie. L'import via
le store actualise aussi la liste sans rechargement. L'interface permet de créer
des notes, de les consulter et modifier, de les mettre en corbeille et de les
restaurer, ainsi que de télécharger et importer une sauvegarde JSON. Le panneau
de simulation permet d'exécuter les six outils locaux sans microphone ni appel
ElevenLabs. Le panneau vocal et le SDK déclarent les six outils, avec démarrage/arrêt
et transcription temporaire. Première création vocale
réelle validée le 9 novembre 2026 : note visible, conversation arrêtée et note
retrouvée après rechargement. L’accès vocal est activé en Production uniquement,
avec code personnel et limitation Vercel. Les six outils ont été exercés vocalement : création, recherche, lecture,
modification, mise en corbeille et restauration. Les modifications et la restauration
sont conservées après rechargement.

[Version de test avec accès vocal protégé](https://project-bxwwf.vercel.app)
— commit `798641d`, déployé en Production le 9 novembre 2026 à 11 h 04 avec les
variables serveur de Production.
POST sans code refusé en `401`, jeton réel reçu en `200` avec le code valide,
six outils vocaux et persistance vérifiés sur une note de démonstration. Cette adresse
possède ses propres notes locales, distinctes de celles de localhost.

![Note restaurée par la voix et conservée après rechargement](docs/images/validation-vocale-ordinateur.jpg)

Voir aussi [le contrôle à une largeur mobile de 390 px](docs/images/validation-vocale-mobile.jpg).
Il vérifie la disposition, sans valider le microphone sur un téléphone physique.
Le [guide du simulateur](docs/SIMULATION.md) propose un scénario reproductible
avec les six outils et des notes de démonstration.

## Démarrer

Prérequis : Node.js 22.12 ou plus récent et npm. Environnement initial : Node 24.16.0,
npm 11.13.0.

Depuis ce dossier :

```bash
npm ci
npm run dev
```

Ouvrir l'adresse indiquée par Vite dans le terminal. Pour arrêter : `Ctrl+C`.
Aucune clé API, aucun compte et aucune variable d'environnement ne sont nécessaires
pour la gestion locale et le simulateur. La connexion vocale utilise la
route serveur décrite dans [le guide API](api/README.md), désactivée par défaut en local.
Ne jamais enregistrer de secrets dans Git.

Pour démarrer aussi la route serveur dans l’environnement Vercel local :

```bash
npm run dev:api
```

Ouvrir `http://127.0.0.1:3000`. Cette commande Linux utilise la CLI Vercel
65.12.1 installée dans le projet, sans connexion au compte ni liaison distante,
et force `VOICEBOT_VOIX_ACTIVE=false`. L’interface fonctionne, mais un POST vers
la route de jetons renvoie volontairement `503` : aucun accès vocal n’est ouvert.
Voir [le guide API](api/README.md) pour les contrôles et les limites de l’outillage.
`npm run dev` reste disponible pour Vite seul. Arrêter le serveur précédent avant
de réutiliser son port. Les notes de `127.0.0.1:3000` sont distinctes de celles
d’une autre origine, par exemple `localhost:5173`.

## Vérifier et compiler

```bash
npm test
npm run build
npm run preview
```

`build` compile le projet dans `dist/`. `preview` sert cette compilation localement ;
ce n'est pas un serveur de production. Dans le navigateur, créer une note avec
le formulaire, vérifier qu'elle apparaît dans la liste puis recharger la page :
la note doit être toujours visible. Voir [le guide de l'interface](docs/INTERFACE.md).

## Comprendre les fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Document HTML français, point d'entrée et élément `root` |
| `src/main.jsx` | Monte l'application React dans `root` |
| `src/App.jsx` | Assemble formulaire, liste et messages d'état |
| `src/components/NoteForm.jsx` | Champs partagés pour la création et la modification |
| `src/components/NotesList.jsx` | Liste de notes ou état vide adapté à la vue |
| `src/components/NoteCard.jsx` | Présentation, édition, mise en corbeille et restauration |
| `src/components/NotesBackup.jsx` | Téléchargement, sélection de fichier et résultat de l'import |
| `src/components/ToolsSimulator.jsx` | Appels locaux des six outils avec paramètres et résultats JSON |
| `src/styles.css` | Styles communs et adaptation à la largeur de l'écran |
| `src/utils/note.js` | Création, règles de modification et de corbeille |
| `src/services/notesStorage.js` | Ouvre IndexedDB, enregistre et récupère les notes |
| `src/services/notesBackup.js` | Prépare un fichier JSON et valide les notes à importer |
| `src/services/notesTools.js` | Six outils locaux avec validation et résultats structurés |
| `src/components/ConversationPanel.jsx` | Code personnel en mémoire, démarrage/arrêt, durée et messages temporaires |
| `src/components/ConversationNotesProvider.jsx` | Provider SDK et déclaration des six outils de notes |
| `src/services/conversationAccess.js` | Demande du jeton au serveur, erreurs et annulation |
| `src/utils/rechercheNotes.js` | Recherche normalisée, extraits et lecture par identifiant |
| `tests/notesTools.test.js` | Tests automatisés de la recherche et des six outils |
| `src/stores/` | État partagé, chargement et actions de gestion des notes |
| `vite.config.js` | Active le plugin React de Vite |
| `package.json` | Commandes et dépendances |
| `package-lock.json` | Versions résolues pour une installation reproductible |
| `api/conversation-token.js` | Entrée de la route Vercel de jetons, désactivée par défaut |
| `server/routeJeton.js` | Contrôle de l’accès et demande serveur du jeton ElevenLabs |
| `tests/routeJeton.test.js` | Tests de la route avec fournisseur simulé, sans appel réel |
| `docs/` | Démarche, journal et suivi des tâches |

Pour le moment : `index.html` → `main.jsx` → `NotesProvider` →
`ConversationNotesProvider` → `App` → affichage.
Le provider charge les notes depuis IndexedDB ; `App` sélectionne les notes
actives et les affiche des plus récentes aux plus anciennes.

L'organisation reprend les habitudes des projets Vue de l'utilisateur :
`components`, `data`, `services`, `stores`, `utils`, et selon les besoins de
navigation `pages`, `views`, `router`. Les dossiers sont créés lorsqu'ils deviennent
utiles. `utils/note.js` contient les fonctions métier des notes ; aucun dossier
`models` n'est utilisé.

## Modèle de note

La fonction `creerNote` de `src/utils/note.js` construit un objet en mémoire.
Elle est indépendante de React et ne réalise aucune sauvegarde.

| Champ | Règle à la création |
| --- | --- |
| `id` | UUID généré automatiquement, indépendant du titre |
| `titre` | Texte obligatoire, espaces de début et de fin retirés ; titre vide refusé |
| `contenu` | Texte conservé tel quel, vide par défaut |
| `categorie` | Texte facultatif, espaces de début et de fin retirés |
| `projet` | Texte facultatif, espaces de début et de fin retirés |
| `createdAt` | Date de création au format ISO en UTC |
| `updatedAt` | Même date que `createdAt` à la création |
| `deletedAt` | `null` pour une note active ; date de mise en corbeille sinon |

Les valeurs fournies sont des chaînes de caractères. Deux notes peuvent avoir
le même titre ; leur identifiant les distingue. Les fonctions de préparation de
modification, suppression et restauration préservent `id` et `createdAt`, et
actualisent `updatedAt` uniquement pour une opération qui change réellement la note.

Exemple à exécuter depuis ce dossier, sans interface ni service externe :

```bash
node --input-type=module <<'JS'
import { creerNote } from './src/utils/note.js'

const note = creerNote({
  titre: '  Idée de vidéo BananaNavy  ',
  contenu: 'Présenter le projet en trente secondes.',
  categorie: 'Idée',
  projet: 'BananaNavy',
})

console.log(note)
JS
```

Le titre affiché doit être nettoyé, les deux dates identiques et `deletedAt` égal
à `null`. Un titre composé uniquement d'espaces provoque l'erreur
« Le titre de la note est obligatoire. ».

## Stockage local IndexedDB

`src/services/notesStorage.js` utilise directement l'API du navigateur, sans
bibliothèque supplémentaire. La base `voicebot`, version 1, contient un magasin
`notes` dont la clé est le champ `id`.

- `ouvrirBase()` crée la structure à la première ouverture et renvoie une connexion.
  Si vous l'appelez directement, fermez cette connexion avec `base.close()`.
- `enregistrerNote(note)` ajoute ou remplace une note complète selon son `id`.
  La promesse est résolue uniquement après la fin réussie de la transaction.
- `recupererNotes()` renvoie toutes les notes, y compris celles de la future
  corbeille, sans tri de présentation. Une base vide renvoie `[]`.
- `fusionnerNotes(notes)` ajoute un ensemble de notes préalablement validées dans
  une seule transaction et conserve toutes les notes dont l'identifiant existe
  déjà localement. Cette fonction est utilisée par le service d'import.

Les deux dernières fonctions ouvrent et ferment elles-mêmes leur connexion.
Les erreurs sont propagées à l'appelant, qui pourra les afficher dans l'interface.
Une ouverture bloquée signale de fermer les autres onglets ; une connexion ouverte
est libérée lorsqu'un autre onglet demande un changement de version.

Le service reçoit des notes complètes construites avec `creerNote`. Il ne valide
pas encore les données externes et ne modifie pas `updatedAt` ou `deletedAt` : les
règles métier sont gérées par les utilitaires appelés par le store, et l'import
possède sa propre validation.

### Vérification manuelle dans le navigateur

Démarrer `npm run dev`, ouvrir l'application puis la console des outils de
développement. Exécuter sur une ligne ou en un seul bloc :

```js
const { creerNote } = await import('/src/utils/note.js')
const { enregistrerNote, recupererNotes } = await import('/src/services/notesStorage.js')
const note = creerNote({ titre: 'Essai de persistance BananaNavy' })
await enregistrerNote(note)
await enregistrerNote({ ...note, contenu: 'Toujours présente après rechargement.' })
console.table(await recupererNotes())
```

La note doit apparaître une seule fois, avec le contenu ajouté. Recharger la page,
puis exécuter :

```js
const { recupererNotes } = await import('/src/services/notesStorage.js')
console.table(await recupererNotes())
```

La même note doit être présente. Les imports de `/src/` ci-dessus sont destinés au
serveur de développement Vite. On peut aussi consulter `voicebot` → `notes` dans
le panneau de stockage IndexedDB des outils de développement.

Garder exactement la même origine (protocole, hôte et port) pour les deux essais :
`localhost` et `127.0.0.1`, ou deux ports différents, ont des stockages distincts.
Ces essais créent de vraies notes locales. Recharger la page après une écriture
directe par le service pour les relire et les afficher dans l'interface.

Vérifications effectuées le 8 novembre 2026 dans un profil Chrome temporaire :
création, remplacement sans doublon, conservation des notes de la corbeille,
persistance après redémarrage du navigateur et rechargement, erreurs de lecture
et d'écriture lors de transactions annulées, changement de version. Voir le
[journal](docs/JOURNAL.md) pour le détail et les limites des essais.

## Export et import JSON

`src/services/notesBackup.js` expose deux fonctions :

- `exporterNotes()` renvoie un objet `File` JSON en mémoire, nommé
  `voicebot-notes-AAAA-MM-JJ.json`. Il contient la version 1 du format, la date
  d'export et toutes les notes, corbeille comprise. Il ne déclenche pas de
  téléchargement automatique.
- `importerNotes(fichier)` lit un `File` ou `Blob`, valide le JSON et toutes les
  notes, puis ajoute uniquement les identifiants absents de la base. Le résultat
  est `{ importees, ignorees }`. Les notes locales sont conservées intégralement,
  même si le fichier porte une autre version de leur contenu.

Un fichier invalide est refusé avant toute ouverture de la base. Les identifiants
répétés dans le même fichier sont refusés. Une erreur pendant la transaction
annule l'ensemble des ajouts. Identifiants, textes, dates et état de corbeille sont
préservés ; seuls les champs connus sont retenus.

Le panneau Sauvegardes propose « Exporter les notes » pour télécharger le fichier,
et « Importer une sauvegarde » pour choisir un JSON puis actualiser le store.
Le résultat indique le nombre de notes ajoutées et ignorées. La sélection est
réinitialisée pour permettre de choisir à nouveau le même fichier après un refus.
Les commandes sont bloquées pendant leur opération, le chargement ou lorsqu'un
rechargement est requis.

Le téléchargement est annoncé comme demandé : sa finalisation dépend du navigateur.
Les erreurs d'export sont affichées dans le panneau ; celles d'import sont
affichées par `App` depuis le store. Si un import est enregistré mais sa relecture
échoue, le panneau conserve les compteurs connus et `App` demande un rechargement.
Voir [le guide des sauvegardes](docs/SAUVEGARDES.md) pour les règles, les exemples
et les vérifications effectuées.

## Architecture

La couche commune au simulateur et aux client tools vocaux est documentée dans
[OUTILS.md](docs/OUTILS.md). `creerOutilsNotes(store)` expose `creer_note`,
`chercher_notes`, `lire_note`, `modifier_note`, `supprimer_note` et `restaurer_note`.
Les mutations passent par le store ; les lectures utilisent `obtenirNotes()` pour
attendre les opérations précédentes et consulter les dernières notes sauvegardées.
Le format est `{ succes: true, ... }` ou `{ succes: false, erreur }`.

La recherche retourne cinq résultats par défaut (maximum vingt), avec extraits,
sans envoyer toute la bibliothèque. Le simulateur appelle cette couche depuis
l'interface ; les six outils vocaux réutilisent les mêmes fonctions. Aucun appel
ElevenLabs n'est effectué directement par cette couche locale.

- React + Vite : interface et outils de développement.
- Context + useReducer : centralisation des notes et des actions.
- IndexedDB : persistance locale, sans base distante.
- SDK React ElevenLabs et client tools : conversation et actions dans le navigateur.
- Vercel : hébergement et fonction serveur pour les jetons de conversation.

Flux : parole → agent → client tool → store → IndexedDB → confirmation à l'agent.
La confirmation de réussite attend la sauvegarde effective.

La [préparation de l’agent français](docs/AGENT-ELEVENLABS.md) décrit les consignes
proposées, le contrat des six outils et les prérequis aux essais vocaux. La
configuration distante initiale est enregistrée ; voix et LLM restent provisoires.
Les six outils sont définis côté ElevenLabs, déclarés dans le SDK, déployés et
exercés en conversation réelle sur le navigateur de test. Le panneau vocal demande le jeton
avant de solliciter le microphone. `npm run dev:api` permet de servir cette route,
avec le verrou fermé ; Vite seul ne la sert pas. Le code personnel est effacé du
champ au démarrage ou à l’arrêt. Sessions limitées localement à deux minutes,
avec arrêt après trente secondes sans message/audio reçu, au masquage de la page
ou au démontage. Ces contrôles ne constituent pas un plafond global de dépenses.
La [route serveur de jetons](api/README.md) est implémentée et testée
avec un fournisseur simulé, désactivée par défaut. Un déploiement verrouillé est
vérifié ; la limitation Vercel est publiée et son refus `429` vérifié sur le domaine
principal. Secrets enregistrés et activation limitée à Production ; création vocale
persistante, recherche, lecture, modification et aller-retour en corbeille validés. La clé nécessite
ElevenAgents Écrire (`convai_write`). Aucun service
payant n'est activé.

## Store des notes

`NotesProvider`, installé dans `main.jsx`, rend le store accessible à tous ses
composants enfants. Le hook `useNotes()` expose :

- `notes` : toutes les notes chargées, corbeille comprise ;
- `chargement` : vrai pendant la lecture initiale, faux après réussite ou échec ;
- `erreur` : message de la dernière erreur gérée, ou `null` ;
- `rechargementRequis` : vrai si une lecture a échoué et que les actions sont
  bloquées jusqu'au rechargement de l'application ;
- `ajouterNote(champs)` : construit une note, attend sa sauvegarde puis demande
  au reducer de l'ajouter en mémoire. Renvoie la note sauvegardée ou rejette
  la promesse en cas d'erreur.
- `modifierNote(id, changements)` : modifie uniquement `titre`, `contenu`,
  `categorie` ou `projet` sur une note active.
- `supprimerNote(id)` : place la note en corbeille sans la retirer du stockage.
- `restaurerNote(id)` : remet une note de la corbeille à l'état actif.
- `importerSauvegarde(fichier)` : importe le fichier puis relit IndexedDB et
  actualise le store dans la même file d'actions. Renvoie `{ importees, ignorees }`.

Les actions sont refusées avant un chargement réussi. Si la lecture initiale
échoue, recharger la page après avoir résolu le problème. Une erreur d'action
conserve les notes existantes et permet de réessayer. Les actions sont exécutées
dans l'ordre pour préserver les changements de demandes rapprochées.

Si l'import est enregistré mais que sa relecture échoue, l'erreur l'indique
explicitement, conserve les compteurs dans `resultatImport` avec
`importEnregistre: true`, et impose un rechargement avant toute autre action.
Un fichier refusé ou une transaction d'import annulée ne bloque pas le store.

Un identifiant introuvable, un titre vide ou un champ non autorisé provoque une
erreur. Une note en corbeille doit être restaurée avant modification. Supprimer
une note déjà supprimée, restaurer une note active ou appliquer une modification
équivalente ne provoque ni écriture ni changement de date.

Le formulaire envoie uniquement les champs modifiés depuis son ouverture. Si un
outil change un autre champ pendant la saisie, sa nouvelle valeur est conservée.
Si le même champ a changé, le store refuse l'enregistrement et le brouillon reste
disponible. Copier la saisie utile avant d'annuler et de rouvrir la dernière version.
Cette protection concerne les changements connus du provider ; elle n'ajoute pas
de synchronisation entre onglets.

Le reducer est indépendant de React et du stockage : il calcule les nouveaux
états sans modifier les précédents. Voir [le guide du store](docs/STORE.md) pour
les responsabilités des fichiers, le flux et les vérifications.

## Démarche et présentation

Voir [la démarche](docs/DEMARCHE.md), [le journal](docs/JOURNAL.md) et
[le suivi](docs/SUIVI.md). Le [cadrage initial](docs/CADRAGE.md) et
[l'étude ElevenLabs](docs/ELEVENLABS-COUTS.md) sont inclus dans le dépôt.

L'IA accompagne les propositions de code et la documentation ; l'utilisateur
s'approprie les choix et vérifie les résultats pour pouvoir présenter le projet.

Pour chaque étape, le code est expliqué avant modification et mis en place
uniquement après le **go de l'utilisateur**. Les vérifications et leur résultat
sont ensuite expliqués.

Lorsqu'un ensemble cohérent est prêt, proposer un message de commit au format
**VERBE EN MAJUSCULES + description en français**, par exemple
`ADD sauvegarde locale des notes avec IndexedDB`.

Le dépôt Git est à la racine de `voicebot`. Chaque grosse fonctionnalité est
développée sur une branche `feature/...` issue de `dev`, avec plusieurs étapes
et éventuellement plusieurs commits. L'utilisateur réalise les commits, les push,
les pull requests et les merges. Les fonctionnalités terminées et testées sont
intégrées dans `dev`, puis une V1 acceptable dans `main` pour la présentation.
La branche `feature/gestion-notes` regroupe le modèle, le stockage et le store.

## Interface de gestion des notes

Le formulaire propose titre, contenu, catégorie et projet. Seul le titre est
obligatoire. Les champs sont conservés localement dans `NoteForm` pendant la
saisie ; une soumission appelle `ajouterNote` du store. Après sauvegarde réussie,
la nouvelle note apparaît, les champs sont vidés et une confirmation est affichée.
En cas d'erreur, la saisie reste disponible et le message du store est affiché.

Le formulaire est désactivé pendant le chargement, la sauvegarde ou lorsqu'un
rechargement est requis. Un verrou empêche les soumissions simultanées. Une erreur
de lecture affiche un bouton de rechargement. Les retours à la ligne des notes
sont préservés.

Chaque note active propose « Modifier » et « Mettre en corbeille ». L'édition
ouvre le formulaire prérempli dans la carte ; « Annuler » abandonne la saisie sans
modifier la note. Un échec garde le formulaire et son brouillon. Les identifiants
des champs sont propres à chaque formulaire grâce à `useId`.

Les boutons « Mes notes » et « Corbeille » affichent leurs compteurs et changent
la vue. Les notes en corbeille proposent uniquement « Restaurer » et affichent
leur date de mise en corbeille. Les actions attendent la sauvegarde avant de
déplacer les cartes et d'annoncer leur réussite. Aucune suppression définitive
n'est proposée. Les listes restent montées : un brouillon d'édition est conservé
lors d'un aller-retour entre les vues, tant que la page n'est pas rechargée.

La disposition utilise deux colonnes sur ordinateur et une seule jusqu'à 760 px.
Les champs sont étiquetés, le focus clavier est visible et les confirmations et
erreurs utilisent des régions accessibles. Voir [le guide de l'interface](docs/INTERFACE.md)
pour le scénario de vérification et les limites.

## Mode de simulation locale

Le panneau « Simulation des outils », sous les listes, propose les six outils,
des exemples de paramètres JSON et un bouton d'exécution. Les appels sont simulés,
mais leurs effets sur IndexedDB sont réels. Le panneau le précise explicitement.
Il ne sollicite ni microphone, ni SDK, ni minutes ElevenLabs.

Choisir l'outil prépare un exemple ; renseigner l'identifiant obtenu par création
ou recherche pour cibler une note. Le résultat reste associé au nom de l'outil
exécuté, même après changement de sélection. Un JSON invalide n'appelle aucun
outil. Les contrôles sont désactivés pendant l'exécution ou si le store est indisponible.

Voir [SIMULATION.md](docs/SIMULATION.md) pour le parcours complet, les règles et
les limites. Les paramètres et le dernier résultat ne sont pas conservés après
rechargement ; les notes enregistrées le sont.

## Limites et suite

Les six outils sont accessibles par la voix sur la version de test protégée. Le
parcours a été effectué sur la note « Test vocale Banana Navy » : création,
recherche et lecture, ajout de trente secondes, remplacement par une minute,
rechargement, puis mise en corbeille et restauration dans une nouvelle conversation.
Le titre diffère de celui du scénario initial ; aucune création supplémentaire
n’a été faite pour la démonstration. Voir le [guide agent](docs/AGENT-ELEVENLABS.md).

Les notes sont propres au navigateur, à l’appareil et à l’origine du site, sans
synchronisation entre onglets ou appareils. L’export/import permet une sauvegarde
manuelle. Les échanges et notes transmis à l’agent passent par ElevenLabs.

La disposition à 390 px et les refus de codes invalides sont vérifiés ; un essai
sur téléphone physique avec microphone reste à faire. Ambiguïtés entre plusieurs
notes, classement vocal, contenu hostile et panne réelle de stockage pendant une
conversation restent à valider. Les tests locaux ne remplacent pas ces essais.
La clé serveur d’essai expire après un jour : le maintien de la voix après cette
échéance demandera son renouvellement. Aucun secret n’est inclus dans ce dépôt.
