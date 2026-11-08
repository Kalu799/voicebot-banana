# Journal de bord

## 8 novembre 2026 — Initialisation

- Objectif : disposer d'une base React + Vite compréhensible et compilable.
- Préparation : dossier `voicebot` vide ; Node 24.16.0 et npm 11.13.0 disponibles.
- Réalisation : point d'entrée HTML, montage React, page d'accueil, styles,
  configuration Vite, emplacement documenté de l'API et documentation pédagogique.
- Décision : JavaScript avec JSX ; aucune dépendance vocale à ce stade.
- Environnement : le dossier BananaNavy n'est pas actuellement un dépôt Git.
  Le fichier `.gitignore` prépare les exclusions pour une future initialisation.
- Difficultés : le bac à sable bloquait l'accès au registre npm et l'ouverture du
  port local. L'installation et le serveur ont été relancés avec autorisation.
- Vérifications réussies : dépendances installées (React 19.3.1, Vite 8.3.6),
  compilation de production avec `npm run build`, démarrage Vite et réponse HTTP
  de la page sur `http://127.0.0.1:5173/`. Aucun contrôle visuel dans un navigateur
  n'a encore été effectué ; le rendu mobile reste à vérifier.
- Prochaine action : définir le modèle de note et ses règles.

## 8 novembre 2026 — Modèle de note

- Objectif : définir une structure commune avant de développer le stockage.
- Préparation : dépôt Git initialisé par l'utilisateur dans `voicebot`, branches
  `main` et `dev` publiées. Arbre de travail propre sur `dev` à la reprise.
- Organisation : branche `feature/gestion-notes` créée depuis `dev` après accord.
  Les commits, push, pull requests et merges restent à la charge de l'utilisateur.
- Réalisation : fonction `creerNote` dans `src/utils/note.js`, titre obligatoire
  nettoyé, UUID automatique, champs facultatifs initialisés, dates ISO identiques
  à la création et `deletedAt` à `null`.
- Décision : fonction indépendante de React qui construit uniquement un objet en
  mémoire ; le contenu conserve ses espaces et retours à la ligne.
- Documentation : modèle, exemple d'utilisation, méthode avec go avant chaque
  étape et organisation Git ajoutés aux documents du projet.
- Vérifications réussies : exécution ponctuelle du module avec Node et des
  assertions sur le nettoyage, le refus des titres vides (y compris espaces et
  retours à la ligne), la conservation du contenu, les valeurs par défaut,
  les UUID distincts pour deux titres identiques, les dates ISO cohérentes et
  `deletedAt` à `null`. Compilation `npm run build` réussie.
- Limite : aucune sauvegarde ni intégration à l'interface à cette étape.
- Prochaine action : présenter le stockage IndexedDB et l'export/import avant
  toute nouvelle modification.

## 8 novembre 2026 — Organisation des dossiers

- À la demande de l'utilisateur, conserver ses conventions de dossiers issues
  de Vue et déplacer `src/models/note.js` vers `src/utils/note.js`.
- Le code de `creerNote` reste identique ; seuls son emplacement et les chemins
  documentés changent. Le dossier vide `models` est retiré.
- Les autres dossiers seront créés progressivement selon les besoins.

## 8 novembre 2026 — Stockage IndexedDB

- Préparation : commit précédent effectué par l'utilisateur, branche
  `feature/gestion-notes` propre au début de l'étape.
- Objectif : enregistrer une note et la retrouver après rechargement.
- Réalisation : service `src/services/notesStorage.js`, base `voicebot` version 1,
  magasin `notes` identifié par `id`. Trois fonctions : `ouvrirBase`,
  `enregistrerNote` et `recupererNotes`.
- Décisions : API native sans dépendance, promesses pour `async/await`, confirmation
  après la transaction complète, connexions fermées après usage. Les notes de la
  future corbeille restent incluses dans la lecture.
- Vérifications réussies : compilation `npm run build` et erreur explicite en
  environnement Node sans IndexedDB.
- Essais ponctuels dans Chrome sans interface avec un profil temporaire isolé et
  une copie des modules : base initialement vide, création, mise à jour sans
  doublon, notes distinctes portant le même titre et inclusion de la corbeille.
  Notes retrouvées après fermeture et réouverture de Chrome, puis rechargement.
- Erreurs vérifiées dans Chrome : note sans identifiant, annulation forcée d'une
  transaction d'écriture (sans modification conservée), annulation d'une lecture,
  fermeture de connexion lors d'un changement de version et refus d'une version
  incompatible avec conservation de la cause technique.
- Difficulté de vérification : le premier outil de capture du DOM terminait avant
  les opérations IndexedDB. La relance avec attente explicite du résultat via le
  protocole de débogage Chrome a permis de terminer les contrôles.
- Non vérifié : quota disque réellement épuisé et comportement des autres
  navigateurs. La gestion d'une ouverture bloquée est prévue mais ce cas n'a pas
  été reproduit lors des essais.
- Limites : pas encore d'interface reliée au stockage ni d'export/import.
- Prochaine action : présenter l'export/import et attendre le go avant de l'ajouter.

## 8 novembre 2026 — Export/import JSON

- Préparation : commit du stockage effectué par l'utilisateur ; branche
  `feature/gestion-notes` propre au début de l'étape. Code présenté avant intégration.
- Réalisation : `notesBackup.js` produit un fichier JSON en mémoire et valide
  intégralement les sauvegardes à importer. `fusionnerNotes` dans `notesStorage.js`
  ajoute les notes absentes dans une transaction et renvoie les compteurs.
- Décisions : format version 1, dates ISO UTC canoniques, identifiants et contenu
  conservés, notes locales prioritaires, identifiants répétés dans un fichier
  refusés, propriétés inconnues écartées. Aucune dépendance ajoutée.
- Vérifications réussies : syntaxe des modules, compilation `npm run build` et
  essais Chrome isolés. Aller-retour export/import sans perte, export/import vide,
  corbeille, conflits locaux, erreurs de format et de lecture du fichier vérifiés.
  Aucun accès à la base pendant la validation des fichiers refusés.
- Intégrité vérifiée : erreurs synchrones et asynchrones, y compris après des
  ajouts réussis dans la transaction, sans ajout partiel conservé. Deux imports
  simultanés du même fichier sans doublon. Persistance après redémarrage du
  navigateur et rechargement, puis export final cohérent.
- Documentation : guide `SAUVEGARDES.md`, README, démarche et suivi mis à jour.
- Limites : téléchargement et sélection de fichier à relier à l'interface ;
  quota réellement épuisé et autres navigateurs non testés.
- Prochaine action : présenter le store Context + useReducer, puis attendre le go.

## 8 novembre 2026 — Store : chargement et création

- Préparation : commit précédent effectué par l'utilisateur, branche
  `feature/gestion-notes` propre ; code présenté avant intégration.
- Réalisation : reducer, contexte, provider et hook dans `src/stores` ; provider
  intégré dans `main.jsx`, sans modification de l'écran d'accueil.
- Décisions : reducer pur, lecture IndexedDB au montage, lectures obsolètes ignorées,
  création autorisée seulement après chargement réussi. Sauvegarder avant d'ajouter
  en mémoire ; exposer les erreurs de création et rejeter la promesse de l'action.
- Vérifications : assertions Node sur le reducer et compilation réussies.
  Essais Chrome isolés avec React en développement et StrictMode : chargement,
  ancienne lecture retardée sans écrasement, création après transaction complète,
  titre invalide et sauvegarde annulée sans note fantôme, reprise après erreur,
  créations concurrentes et hook hors provider. Échec initial de lecture signalé
  et création refusée. Persistance après redémarrage du navigateur et rechargement.
- Documentation : README, guide `STORE.md`, démarche et suivi mis à jour.
- Limites : pas encore d'actions de modification/corbeille, d'import intégré au
  store ou d'interface de notes. Une lecture initiale échouée nécessite de recharger.
- Prochaine action : présenter la suite des actions du store et attendre le go.

## 8 novembre 2026 — Modification et corbeille

- Préparation : commit du store effectué par l'utilisateur ; branche
  `feature/gestion-notes` propre. Code présenté avant intégration après le go.
- Réalisation : règles métier dans `utils/note.js`, transition `NOTE_MISE_A_JOUR`
  du reducer et actions `modifierNote`, `supprimerNote`, `restaurerNote` du provider.
- Décisions : conserver l'identité et `createdAt`, actualiser les dates uniquement
  pour une opération effective, refuser les champs protégés et la modification
  en corbeille. Les opérations répétées sans effet ne déclenchent pas d'écriture.
- Fiabilité : référence aux dernières notes sauvegardées et file de promesses
  commune aux actions pour éviter les pertes lors de demandes rapprochées.
  Une action échouée ne bloque pas les suivantes. Aucun changement d'interface.
- Vérifications réussies : règles et reducer avec Node, compilation, anciens
  parcours du store et nouveaux essais dans Chrome isolé avec StrictMode.
  Modifications, identité, dates, corbeille, erreurs, opérations sans effet et
  absence de changement après échec de sauvegarde contrôlées.
- Concurrence contrôlée : ancien accès au hook, modifications rapprochées d'une
  note, suppression puis restauration et poursuite de file après échec.
  Versions modifiées et corbeille retrouvées après redémarrage et rechargement.
- Documentation : README, guide du store, démarche et suivi mis à jour.
- Prochaine action : présenter l'intégration de l'import au store et attendre le go.

## 8 novembre 2026 — Import intégré au store

- Préparation : commit précédent effectué par l'utilisateur, branche
  `feature/gestion-notes` propre ; code présenté avant intégration.
- Réalisation : action `importerSauvegarde` du provider, import puis relecture
  IndexedDB dans la même file, actualisation de la référence et du reducer,
  compteurs renvoyés à l'appelant. Indicateur `rechargementRequis` ajouté à l'état.
- Décision : un fichier refusé ou un import annulé reste réessayable. Si l'import
  est enregistré mais la relecture échoue, l'erreur l'indique et contient les
  compteurs ainsi que la cause ; les actions sur l'état périmé sont bloquées
  jusqu'au rechargement. Le même indicateur couvre l'échec du chargement initial.
- Vérifications réussies : reducer avec Node, compilation et essais Chrome
  isolés. Import actualisé sans rechargement, conflits, corbeille, réimport et
  import vide contrôlés. Fichier invalide et transaction annulée sans blocage
  durable. Modification immédiate d'une note importée et création suivie d'import
  sans perte. Anciens parcours du store toujours vérifiés.
- Cas après sauvegarde vérifié : import réellement présent en base malgré la
  relecture annulée, liste mémoire conservée, erreur avec compteurs et cause,
  actions en attente et suivantes bloquées. Remontage du provider réactivant les
  actions, persistance après redémarrage de Chrome et rechargement.
- Documentation : README, guides du store et des sauvegardes, démarche et suivi
  mis à jour. Étape du store terminée ; interface encore statique.
- Prochaine action : présenter l'interface minimale de gestion des notes et
  attendre le go avant les modifications.
