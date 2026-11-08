# Démarche du projet

## Besoin retenu

Créer une application personnelle de notes pilotée à la voix, utilisable comme
projet de présentation et de portfolio. Les décisions initiales sont conservées
dans [PROJET.md](../../PROJET.md). Les autres idées et comparaisons ne sont pas
reconstituées sans traces disponibles.

## Décisions de départ

La stack React, Vite, Context/useReducer, IndexedDB, ElevenLabs et Vercel est retenue
dans le cadrage. L'étude vocale existante est accessible dans
[ELEVENLABS-COUTS.md](../../ELEVENLABS-COUTS.md).

Le 8 novembre 2026, la base est initialisée en JavaScript avec JSX. Ce choix permet
de commencer avec des composants simples et de limiter les notions à introduire.
TypeScript n'a pas fait l'objet d'un essai comparatif à cette étape.

La logique de notes et un mode de simulation seront développés avant les essais
vocaux pour limiter l'utilisation du quota gratuit.

## Méthode

Pour chaque étape : annoncer l'objectif et les fichiers, présenter et expliquer
le code, puis attendre le **go de l'utilisateur avant toute modification**.
Après accord, intégrer le code, vérifier et corriger, puis expliquer le résultat.
Présenter ensuite l'étape suivante et attendre un nouvel accord avant de l'appliquer.
Commenter en français les intentions et les mécanismes moins évidents.

## Organisation Git

Le dépôt est initialisé dans `voicebot`. `main` conserve la version stable pour
la présentation ; `dev` reçoit les fonctionnalités terminées et testées.
Une branche `feature/...` est créée depuis `dev` pour chaque grosse fonctionnalité.
Elle peut contenir plusieurs étapes de développement et plusieurs commits.

L'utilisateur réalise les commits, les push, les pull requests et les merges :
d'abord de la branche de fonctionnalité vers `dev`, puis de `dev` vers `main`
lorsqu'une V1 acceptable est prête. L'assistant modifie le code et la documentation,
effectue les vérifications et peut créer la branche convenue après accord.

La première branche, `feature/gestion-notes`, regroupe le modèle de note,
le stockage IndexedDB et le store Context/useReducer.

Proposer un commit lorsqu'un ensemble cohérent de changements est prêt, avec
un verbe en majuscules suivi d'une description en français (`ADD`, `EDIT`,
`REMOVE`, etc.). L'utilisateur exécute lui-même le commit.

## Stockage local — 8 novembre 2026

Utiliser l'API IndexedDB native pour ouvrir la base `voicebot` et son magasin
`notes`, enregistrer une note complète et récupérer l'ensemble des notes.
Ce choix suit le cadrage et évite une dépendance supplémentaire. Aucune
bibliothèque alternative n'a été essayée à cette étape.

Transformer les événements IndexedDB en promesses permet aux futurs appelants
d'utiliser `async/await`. Attendre la fin de la transaction pour confirmer la
sauvegarde, puis fermer la connexion. Séparer le stockage des règles métier et
de l'interface pour permettre les vérifications sans connexion vocale.

## Export/import — 8 novembre 2026

Retenir un format JSON versionné, lisible et indépendant de la version IndexedDB.
Exporter toutes les notes, corbeille comprise, dans un objet `File` en mémoire.
Le déclenchement du téléchargement appartient à la future interface.

Valider le fichier entier avant l'accès au stockage, préserver les identifiants et
les dates, puis fusionner dans une seule transaction. Conserver les notes locales
en cas de conflit d'identifiant pour éviter un écrasement implicite. Refuser les
identifiants répétés dans le fichier, car ils rendent le contenu à retenir ambigu.

Le service `notesBackup.js` gère le format et la validation ; la nouvelle fonction
`fusionnerNotes` du service de stockage gère les écritures atomiques. L'import
renvoie des compteurs pour que l'interface puisse expliquer le résultat.
Voir [le guide des sauvegardes](SAUVEGARDES.md) pour les règles et les essais.

## Store — 8 novembre 2026

Commencer par le chargement initial et la création pour garder une étape limitée.
Utiliser Context et useReducer comme prévu au cadrage : le reducer pur calcule
l'état, le provider effectue les opérations IndexedDB et le hook expose l'accès
aux composants. Aucune bibliothèque de store supplémentaire n'est ajoutée.

Attendre la sauvegarde avant d'ajouter une note en mémoire et propager l'erreur
à l'appelant. Refuser la création avant un chargement réussi. Ignorer les lectures
obsolètes lors du nettoyage d'un effet, notamment avec StrictMode. L'interface
reste identique ; son raccordement aux actions sera une étape distincte.
Voir [le guide du store](STORE.md) pour les flux, les limites et les vérifications.

Compléter ensuite la modification et la corbeille avec des fonctions métier dans
`utils/note.js`. Conserver l'identité, refuser les champs non éditables et les
modifications en corbeille, rendre les opérations sans effet sans écriture ni
changement de date. Les trois actions partagent une transition de remplacement
dans le reducer.

Conserver une référence à la dernière version sauvegardée et traiter les actions
dans l'ordre avec une file de promesses. Cela préserve les changements rapprochés
d'une même note, même avant un nouveau rendu. Une action échouée reste signalée
à son appelant tout en laissant passer la suivante.

Compléter le store avec `importerSauvegarde`, qui conserve l'import et sa relecture
dans la même file d'actions. Réutiliser les transitions de chargement pour
actualiser la liste. Distinguer un import refusé d'un import enregistré dont la
relecture échoue : exposer les compteurs dans l'erreur et bloquer les actions sur
l'état périmé via `rechargementRequis` jusqu'au rechargement.

## Interface — 8 novembre 2026

Commencer par la création et la lecture des notes actives. Séparer le formulaire,
la liste et la carte dans `components`, avec assemblage et messages d'état dans
`App`. Conserver les brouillons dans l'état local du formulaire et les notes
sauvegardées dans le store. Ne vider les champs qu'après réussite de la sauvegarde.

Conserver la palette initiale et adapter les deux colonnes à une seule sur mobile.
Prévoir les étiquettes, le focus clavier, les annonces d'erreur et de confirmation,
ainsi qu'un bouton de récupération après erreur de lecture. Documenter les
vérifications avec des captures sans données personnelles.

Étendre ensuite le formulaire avec une note facultative pour partager les champs
entre création et édition. Initialiser le brouillon à l'ouverture et employer
`useId` pour éviter les collisions d'étiquettes. Piloter l'édition depuis la carte,
et les vues actives/corbeille depuis `App`. Conserver les deux listes montées pour
préserver les brouillons lors d'un changement de vue. Annoncer les confirmations
dans `App`, où elles restent visibles après le déplacement d'une carte.

Compléter la gestion manuelle avec `NotesBackup` : produire et télécharger le
fichier du service, utiliser le sélecteur natif pour fournir un `File` au store,
afficher les compteurs et distinguer les erreurs d'export de celles d'import.
Libérer l'URL de téléchargement, réinitialiser le sélecteur et annoncer le
téléchargement comme demandé, sans promettre son enregistrement sur le disque.

Préparer le simulateur avec une couche d'outils indépendante de React et du SDK :
valider les paramètres, appeler les actions du store et normaliser les résultats.
Séparer la recherche pure, borner ses résultats et réserver le contenu complet à
la lecture d'une note. Ajouter une lecture en file dans le store pour éviter les
captures périmées. Conserver des tests Node reproductibles, complétés par des
essais ponctuels avec le vrai provider et IndexedDB avant de créer le panneau.

Assembler le panneau `ToolsSimulator` avec un sélecteur, des exemples de JSON et
le dernier résultat associé à son outil. Lire les paramètres avec `JSON.parse`,
réutiliser l'adaptateur commun et signaler clairement que la simulation n'utilise
pas la voix, tout en appliquant de vraies modifications. Conserver les paramètres
après erreur et préparer une démonstration reproductible des six outils.

## Organisation des dossiers

Reprendre les conventions déjà utilisées par l'utilisateur dans ses projets Vue :
`components` pour les composants, `data` pour les données d'exemple, `services`
pour le stockage et les échanges externes, `stores` pour l'état partagé et `utils`
pour les fonctions utilitaires indépendantes de l'interface. Les dossiers `pages`,
`views` et `router` pourront être utilisés selon les besoins des futurs écrans ;
ne pas créer de dossiers vides par anticipation.

La fonction `creerNote` est placée dans `src/utils/note.js`. Le dossier `models`
n'est pas retenu : son nom est moins parlant pour l'utilisateur à ce stade.

## Documentation continue

Mettre à jour le README, le journal et le suivi au fil de l'avancement. Distinguer
ce qui est prévu, documenté, essayé et validé. Garder des exemples sans données
personnelles pour la démonstration.

## Source consultée

- [Guide officiel Vite](https://vite.dev/guide/), consulté le 8 novembre 2026 :
  structure de projet, commandes et prérequis Node.js.
- [Spécification IndexedDB du W3C](https://www.w3.org/TR/IndexedDB/) et
  [guide IndexedDB de Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB),
  consultés le 8 novembre 2026 : transactions, création de structure et gestion
  des connexions bloquées ou concernées par un changement de version.
- [Reducer et contexte](https://react.dev/learn/scaling-up-with-reducer-and-context)
  et [useEffect](https://react.dev/reference/react/useEffect), documentation React
  consultée le 8 novembre 2026 : état partagé et nettoyage des lectures asynchrones.
- [Champs contrôlés React](https://react.dev/reference/react-dom/components/input),
  consulté le 8 novembre 2026 : synchronisation de la saisie via `value` et `onChange`.
- [useId](https://react.dev/reference/react/useId), consulté le 8 novembre 2026 :
  identifiants distincts pour les champs de plusieurs instances du formulaire.
