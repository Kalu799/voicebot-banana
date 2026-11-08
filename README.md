# Voicebot — BananaNavy

Application web personnelle pour gérer ses notes en parlant : création, recherche,
lecture, modification, classement, corbeille et restauration.

**État actuel :** base React + Vite, page d'accueil, modèle de note et service
IndexedDB pour enregistrer et récupérer les notes. La gestion des notes dans
l'interface, l'export/import, la simulation et la conversation vocale restent à développer.

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
à cette étape. Ne jamais enregistrer de secrets dans Git.

## Vérifier et compiler

```bash
npm run build
npm run preview
```

`build` compile le projet dans `dist/`. `preview` sert cette compilation localement ;
ce n'est pas un serveur de production. Dans le navigateur, vérifier que le titre et
l'encadré de progression apparaissent, puis recharger la page.

## Comprendre les fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Document HTML français, point d'entrée et élément `root` |
| `src/main.jsx` | Monte l'application React dans `root` |
| `src/App.jsx` | Premier composant de l'interface |
| `src/styles.css` | Styles communs et adaptation à la largeur de l'écran |
| `src/utils/note.js` | Construit une note avec ses valeurs initiales |
| `src/services/notesStorage.js` | Ouvre IndexedDB, enregistre et récupère les notes |
| `vite.config.js` | Active le plugin React de Vite |
| `package.json` | Commandes et dépendances |
| `package-lock.json` | Versions résolues pour une installation reproductible |
| `api/` | Emplacement documenté de la future fonction Vercel |
| `docs/` | Démarche, journal et suivi des tâches |

Pour le moment : `index.html` → `main.jsx` → `App.jsx` → affichage.

L'organisation reprend les habitudes des projets Vue de l'utilisateur :
`components`, `data`, `services`, `stores`, `utils`, et selon les besoins de
navigation `pages`, `views`, `router`. Les dossiers sont créés lorsqu'ils deviennent
utiles. `utils/note.js` contient la fonction de création d'une note ; aucun dossier
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
| `deletedAt` | `null` pour une note active ; accueillera la date de mise en corbeille |

Les valeurs fournies sont des chaînes de caractères. Deux notes peuvent avoir
le même titre ; leur identifiant les distingue. Les règles de modification et de
mise en corbeille seront implémentées aux étapes suivantes.

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

Les deux dernières fonctions ouvrent et ferment elles-mêmes leur connexion.
Les erreurs sont propagées à l'appelant, qui pourra les afficher dans l'interface.
Une ouverture bloquée signale de fermer les autres onglets ; une connexion ouverte
est libérée lorsqu'un autre onglet demande un changement de version.

Le service reçoit des notes complètes construites avec `creerNote`. Il ne valide
pas encore les données externes et ne modifie pas `updatedAt` ou `deletedAt` : les
règles métier seront gérées par le store, et l'import aura sa propre validation.

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
Ces essais créent de vraies notes locales. L'interface actuelle ne les affiche pas.

Vérifications effectuées le 8 novembre 2026 dans un profil Chrome temporaire :
création, remplacement sans doublon, conservation des notes de la corbeille,
persistance après redémarrage du navigateur et rechargement, erreurs de lecture
et d'écriture lors de transactions annulées, changement de version. Voir le
[journal](docs/JOURNAL.md) pour le détail et les limites des essais.

## Architecture prévue

- React + Vite : interface et outils de développement.
- Context + useReducer : centralisation des notes et des actions.
- IndexedDB : persistance locale, sans base distante.
- SDK React ElevenLabs et client tools : conversation et actions dans le navigateur.
- Vercel : hébergement et fonction serveur pour les jetons de conversation.

Flux cible : parole → agent → client tool → store → IndexedDB → confirmation à l'agent.
La confirmation de réussite devra attendre la sauvegarde effective.

La configuration ElevenLabs, le mode de simulation et le déploiement seront
documentés lorsqu'ils seront implémentés. Aucun service payant n'est activé.

## Démarche et présentation

Voir [la démarche](docs/DEMARCHE.md), [le journal](docs/JOURNAL.md) et
[le suivi](docs/SUIVI.md). Le [cadrage initial](../PROJET.md) et
[l'étude ElevenLabs](../ELEVENLABS-COUTS.md) restent les références.

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

## Limites et suite

La page actuelle est statique. Aucun microphone n'est sollicité. Le modèle et le
service de stockage ne sont pas encore utilisés par l'interface : les notes sont
manipulables via les modules, mais pas encore depuis la page. La prochaine étape
concerne l'export/import.
La démonstration guidée, les captures et le lien public seront ajoutés plus tard.

À terme, les notes resteront propres au navigateur et à l'appareil, sans
synchronisation. L'export/import permettra de les sauvegarder. Les informations
transmises à l'agent vocal passeront par ElevenLabs.
