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

## 8 novembre 2026 — Interface de création et de lecture

- Préparation : commit précédent effectué par l'utilisateur, branche
  `feature/gestion-notes` propre ; code présenté avant modification.
- Réalisation : composants `NoteForm`, `NotesList`, `NoteCard`, assemblage dans
  `App`, styles adaptatifs et messages de chargement, confirmation et erreur.
- Décisions : brouillon local au formulaire, store pour les notes enregistrées,
  formulaire vidé après succès uniquement, verrou de double soumission, corbeille
  masquée et tri décroissant sans mutation du store. Reprise par bouton de
  rechargement si les notes sont indisponibles. Aucun service distant ajouté.
- Vérifications réussies : compilation et essais Chrome sur la compilation réelle,
  avec profil isolé. Création, validation, contenu exact, persistance, corbeille
  masquée, erreurs de stockage sans perte de saisie, reprise, attente de transaction,
  double soumission, texte échappé, tri et récupération après échec de lecture.
- Présentation : rendu contrôlé à 1280, 390 et 320 px, captures ordinateur/mobile
  inspectées et conservées dans `docs/images`. Aperçu Vite vérifié dans le
  navigateur intégré. Aucun test n'utilise les données du navigateur habituel.
- Documentation : README, guide `INTERFACE.md`, démarche, store et suivi actualisés.
- Limites : modification, corbeille et export/import pas encore disponibles dans
  l'interface ; simulation et voix à venir. Autres navigateurs, lecteur d'écran et
  quota réel non vérifiés.
- Prochaine action : présenter les commandes de modification et de corbeille dans
  l'interface, puis attendre le go.

## 8 novembre 2026 — Interface de modification et de corbeille

- Préparation : commit précédent effectué par l'utilisateur, branche
  `feature/gestion-notes` propre ; code présenté avant intégration.
- Réalisation : `NoteForm` partagé entre création et modification, identifiants
  `useId`, commandes d'édition/annulation et corbeille/restauration dans les cartes.
  Vues avec compteurs, confirmations partagées et styles des groupes d'actions.
- Décisions : garder les listes montées pour préserver les brouillons lors d'un
  changement de vue ; attendre la sauvegarde avant confirmation et déplacement.
  Aucune suppression définitive. Store et services conservés.
- Vérifications réussies : compilation et parcours via le navigateur intégré sur
  une origine de test dédiée. Préremplissage, annulation sans changement, refus
  d'un titre vide avec brouillon conservé, navigation entre vues sans perte du
  brouillon, modification retrouvée après rechargement.
- Corbeille : compteurs, date, confirmation, persistance de la suppression et de la
  restauration après rechargement. Champs à identifiants uniques, navigation Tab
  et rendu à 1280/390 px contrôlés, absence de débordement à 320 px.
- Captures d'édition et de corbeille sur ordinateur/mobile ajoutées et inspectées.
  Les erreurs IndexedDB forcées n'ont pas été réinjectées dans les composants ;
  les essais antérieurs du store restent la référence pour ces erreurs.
- Documentation : README, guides, démarche et suivi actualisés.
- Prochaine action : présenter les boutons d'export/import, puis attendre le go.

## 8 novembre 2026 — Commandes d'export/import

- Préparation : commit précédent effectué par l'utilisateur ; branche
  `feature/gestion-notes` propre et code présenté avant intégration.
- Réalisation : `NotesBackup` au-dessus du formulaire et des listes, téléchargement
  du fichier JSON, sélecteur natif, compteurs d'import, messages et verrou d'opération.
- Décisions : réutiliser les services et le store, réinitialiser le sélecteur,
  libérer les URL temporaires, annoncer le téléchargement comme demandé. Conserver
  les compteurs connus si l'import est enregistré mais la relecture échoue.
- Correction observée : le style commun des champs rendait visible l'input masqué.
  Ajouter `input[hidden]` pour respecter le masquage du sélecteur.
- Vérifications réussies : compilation finale et parcours via le navigateur intégré
  sur des origines de test distinctes. Import valide, réimport, JSON invalide avec
  une seule alerte, import vide, conservation d'une modification locale et
  réutilisation des commandes après refus.
- Téléchargement réellement reçu et JSON inspecté : version 1 et deux notes,
  corbeille comprise, identiques aux données attendues. Ce même fichier restauré
  dans une origine vide ; notes et corbeille conservées après rechargement.
- Présentation : captures ordinateur/mobile inspectées, absence de débordement
  à 320 et 390 px. Documents et suivi mis à jour.
- Limites : erreurs transactionnelles couvertes par les essais antérieurs du store,
  sans nouvelle injection dans le panneau ; annulation du sélecteur, refus de
  téléchargement et autres navigateurs non vérifiés.
- Prochaine action : présenter le mode de simulation des outils vocaux et attendre le go.

## 8 novembre 2026 — Couche commune des outils

- Préparation : commit précédent effectué par l'utilisateur, branche
  `feature/gestion-notes` propre ; code présenté avant intégration.
- Réalisation : recherche et lecture dans `utils/rechercheNotes.js`, six outils
  validés dans `services/notesTools.js`, action `obtenirNotes` du provider.
  Résultats réussis/échoués structurés et confirmation après sauvegarde.
- Décisions : recherche active ou corbeille, casse/accents ignorés, filtres exacts,
  cinq résultats par défaut et vingt au maximum, extraits plutôt que contenus
  complets. Les mutations ciblent un identifiant ; la lecture renvoie une copie.
- Vérifications persistantes : `npm test` ajouté avec huit scénarios Node couvrant
  règles, validation avant appel au store, limites, six parcours et attente de
  sauvegarde. Corrections : filtres composés d'espaces et rejets non standard.
- Intégration ponctuelle : banc temporaire avec vrai provider, React en mode
  développement et IndexedDB dans le navigateur intégré. Six outils vérifiés,
  lecture immédiate via un accès capturé avant création, copies indépendantes,
  recherche, modification, corbeille, restauration et transaction annulée sans
  faux succès. Données retrouvées après rechargement, anciens parcours du store
  réexécutés. Compilation réussie.
- Documentation : guide `OUTILS.md`, README, store, démarche et suivi actualisés.
- Limites : pas de panneau de simulation ni de connexion vocale. Déduplication
  des créations par identifiant d'appel à prévoir avec l'intégration de l'agent.
- Prochaine action : présenter le panneau de simulation, puis attendre le go.

## 8 novembre 2026 — Panneau de simulation

- Préparation : commit précédent effectué par l'utilisateur, branche
  `feature/gestion-notes` propre ; code présenté avant intégration.
- Réalisation : `ToolsSimulator` sous les listes, sélection parmi les six outils,
  exemples de paramètres JSON et dernier résultat structuré. Styles du sélecteur,
  code et résultat, étiquettes et annonces d'état.
- Décisions : aucun microphone ni appel ElevenLabs, mais effets réels sur les
  notes. JSON lu sans exécution de code, identifiants renseignés manuellement,
  contrôles bloqués pendant l'appel et verrou de soumission simultanée. Résultat
  conservé avec le nom de son outil lors d'un changement de sélection.
- Vérifications réussies : tests Node et compilation. Six outils exercés depuis
  le panneau dans le navigateur intégré sur une origine de démonstration dédiée.
  Listes et compteurs actualisés ; modification et corbeille retrouvées après
  rechargement, restauration puis lecture de la note active sauvegardée.
- Erreurs contrôlées : JSON mal formé, identifiant non textuel ou inconnu, champ
  protégé. Saisie conservée et résultats d'échec explicites. Présentation inspectée
  sur ordinateur/mobile, sans débordement à 320/390 px ; contrôles à identifiants
  uniques et navigation Tab jusqu'au bouton.
- Documentation : guide `SIMULATION.md`, README, guides, démarche et suivi
  actualisés, captures conservées dans `docs/images`.
- État : gestion locale et simulation terminées. La conversation vocale et le
  premier jalon vocal restent à réaliser. Les appels répétés après réussite ne
  sont pas dédupliqués, et les autres navigateurs restent à vérifier.
- Prochaine action : revue de la fonctionnalité locale et pull request vers `dev`
  par l'utilisateur, puis préparation de l'intégration ElevenLabs après explication
  et nouveau go.

## 8 novembre 2026 — Correction des conflits d'édition

- Préparation : revue globale après intégration sur `dev`, puis branche
  `fix/revue-gestion-notes` créée depuis `dev`. Correction expliquée avant application.
- Problème reproduit : un formulaire ancien renvoyait tous ses champs et écrasait
  un contenu récemment modifié par le simulateur, même en ne changeant que le titre.
- Correction : référence aux champs d'ouverture dans `NoteForm`, extraction des
  changements réels et troisième argument facultatif de `modifierNote` pour
  vérifier les valeurs initiales dans la file du store.
- Comportement : préserver les changements sur des champs distincts ; refuser
  toute écriture en cas de conflit sur le même champ et conserver le brouillon.
  Les outils restent compatibles avec leur signature à deux arguments.
- Vérifications : six scénarios de non-régression ajoutés dans
  `tests/noteEdition.test.js`. Tests Node et compilation réussis. Scénario original
  corrigé dans le navigateur de production, avec conservation après rechargement.
  Conflit sur le contenu sans enregistrement partiel du titre, brouillon conservé,
  absence de changement après rechargement et reprise après réouverture vérifiés.
- Documentation : README, guides du store et de l'interface actualisés.
- Limite conservée : aucune synchronisation entre onglets.
- Prochaine action : présenter la correction des liens vers les documents situés
  hors du dépôt et attendre le go avant de l'appliquer.

## 8 novembre 2026 — Documentation autonome dans le dépôt

- Préparation : correction des conflits d'édition commitée par l'utilisateur ;
  branche `fix/revue-gestion-notes` propre au début de cette étape.
- Problème : README et démarche dépendaient de deux documents du dossier parent,
  absents lors d'un clonage du seul dépôt `voicebot`.
- Réalisation : copie du cadrage dans `docs/CADRAGE.md` et de l'étude dans
  `docs/ELEVENLABS-COUTS.md`, liens du README et de la démarche corrigés, chemin
  du suivi adapté dans le cadrage. Les versions incluses dans le dépôt deviennent
  les références pour sa documentation.
- Conservation : originaux de BananaNavy inchangés ; étude copiée à l'identique,
  avec sa date du 5 novembre 2026. Aucun tarif réévalué lors de cette opération.
- Vérification réussie : 37 liens locaux contrôlés dans 12 documents Markdown,
  tous présents dans une copie isolée de 47 fichiers du projet, sans documents
  du dossier parent. `git diff --check` réussi. Aucun code applicatif modifié.
- Prochaine action : commit et pull request des corrections vers `dev` par
  l'utilisateur, puis préparation de l'intégration vocale après explication et go.

## 8 novembre 2026 — Préparation de l’agent français

- Reprise : fusion des deux corrections confirmée dans l’historique local de
  `dev`, merge `4adac56` de la PR nº 2. Arbre de travail propre ; aucun contact
  avec le dépôt distant pour cette vérification.
- Préparation : branche `feature/integration-elevenlabs` créée depuis `dev`
  après accord. Consignes, contrat et fichiers présentés avant le go documentaire.
- Réalisation : guide `AGENT-ELEVENLABS.md`, lien du README et suivi actualisés.
  Aucun agent distant créé ou configuré, aucune dépendance ajoutée et aucun
  changement du code applicatif.
- Décisions : français, six client tools avec attente de réponse, identifiants
  exacts, clarification des ambiguïtés, lecture complète avant ajout au contenu,
  confirmation après succès et textes des notes traités comme données.
- Sources : documentation officielle ElevenLabs des client tools, SDK React,
  authentification et tarifs consultée. Offre publique affichant 15 minutes
  gratuites et coût LLM séparé ; conditions du compte à vérifier avant les essais.
  Étude historique du 5 novembre conservée sans modification.
- Limites : pas de connexion vocale validée, de déduplication des créations ni
  de protection atomique entre lecture et modification ultérieure. Route serveur
  protégée et limitée indispensable avant les essais ; aucun paiement autorisé.
- Vérifications : 42 liens locaux valides dans les 12 documents Markdown du
  README et de `docs/`, sept exemples JSON valides et `git diff --check` réussi.
  Tests applicatifs et compilation non relancés pour cette étape documentaire.
- Prochaine action : présenter la configuration distante de l’agent français et
  de ses outils, puis attendre le go avant sa réalisation. Le choix de voix et
  de modèle dépendra des options et conditions effectivement accessibles au compte.

## 8 novembre 2026 — Configuration distante initiale de l’agent

- Préparation : commit documentaire `1332293` confirmé, branche
  `feature/integration-elevenlabs` propre. Configuration générale expliquée et
  autorisée ; connexion au compte réalisée par l’utilisateur.
- Adaptation : aucun modèle vide visible dans la galerie, constat partagé par
  l’utilisateur. Création depuis « Voice Reading Companion », sans intégration
  affichée, puis remplacement complet des consignes de lecture dans l’éditeur.
  L’aperçu avant création est en lecture seule.
- Réalisation : agent BananaNavy créé, consignes et accueil français enregistrés,
  français seul, authentification activée, bursting désactivé, pièces jointes
  désactivées, durée maximale de 120 secondes et arrêt après 30 secondes de silence.
  Remplacements de voix et de langue par le client désactivés. Publication des
  réglages sur la branche distante ElevenLabs `Main`, distincte du Git du projet.
- Vérifications UI : publications terminées, bouton Publier désactivé sans
  changement en attente, authentification toujours active après navigation,
  aucun outil personnalisé associé ni procédure. Deux outils système actifs :
  fin de conversation et détection de langue.
- Choix provisoires : voix Eric, famille Flash (`eleven_flash_v2_5` après choix
  du français), Gemini 3.5 Flash avec secours par défaut hérités du modèle. Aucune
  qualité vocale, coût réel ou aptitude aux six outils encore validé.
- Compte : offre Free constatée ; solde en crédits non converti en minutes.
  Aucun paiement ni dépassement global activé. Enregistrement audio déjà désactivé,
  transcriptions conservées 30 jours ; conditions du compte à vérifier avant essai.
- Documentation : guide agent, README et suivi actualisés. Aucun SDK, endpoint,
  clé API ou code applicatif ajouté. Aucun essai vocal lancé.
- Suite : expliquer puis configurer les six client tools après go ; contrôler
  aussi les variables et le workflow hérités, puis finaliser voix, LLM et budget
  avant les essais via une route serveur protégée.

## 8 novembre 2026 — Contrôle des variables et du workflow

- Préparation : commit `cf892b0` confirmé sur la branche
  `feature/integration-elevenlabs`, contrôle en lecture seule autorisé.
- Variables : huit valeurs de remplacement héritées du modèle de lecture restent
  visibles, dont le titre et un extrait de *Dracula*. Les consignes BananaNavy et
  le message d’accueil français ne les référencent plus.
- Workflow : seul nœud « Démarrer », sans connexion. L’interface indique qu’un
  nœud d’entrée doit être connecté pour activer le workflow ; aucun parcours de
  lecture actif constaté. Aucune modification distante ni publication effectuée.
- Documentation : constat ajouté au guide de l’agent et au journal. Aucun code
  applicatif modifié et aucune conversation lancée.
- Suite : proposer le nettoyage des valeurs de test inutilisées, puis présenter
  la configuration de `creer_note` avant application après go.

## 8 novembre 2026 — Nettoyage des variables de démonstration

- Préparation : commit `619489c` confirmé, branche propre. Nettoyage des huit
  valeurs de test expliqué et autorisé avant modification.
- Réalisation : absence de bouton de suppression dans le panneau Variables.
  Copie JSON via le menu de l’agent, objet `dynamic_variable_placeholders` vidé,
  comparaison en mémoire limitée au retrait des huit entrées, puis import dans
  le brouillon et publication sur la branche distante ElevenLabs `Main`.
- Vérification : aperçu synthétique affichant « Aucun changement », mais diff
  JSON brut montrant uniquement le retrait du bloc des variables devenu vide.
  Après rechargement, panneau Variables vide, consignes et véritable message
  d’accueil français conservés, aucune publication en attente.
- Documentation : guide de l’agent et journal actualisés. Aucun code applicatif,
  workflow ou outil modifié ; aucune conversation lancée.
- Suite : présenter les champs du client tool `creer_note`, puis attendre le go
  avant sa configuration distante.

## 8 novembre 2026 — Définition distante du client tool creer_note

- Préparation : commit `20662df` confirmé, branche
  `feature/integration-elevenlabs` propre. Nom, description, quatre paramètres
  et attente du résultat présentés puis autorisés avant configuration.
- Réalisation : outil de type Client `creer_note`, textes `titre` obligatoire,
  `contenu`, `categorie`, `projet` facultatifs, extraits par le LLM. Attente de
  réponse activée, sans mock ni affectation de variable dynamique.
- Ajustement expliqué : délai par défaut d’une seconde porté à 10 secondes
  pour laisser répondre une sauvegarde retardée. Ce délai ne garantit pas une
  réussite et ne rend pas sûre une répétition automatique de création.
- Enregistrement : outil créé, délai enregistré dans sa fiche, association à
  l’agent publiée sur la branche distante ElevenLabs `Main`.
- Vérifications : formulaire et JSON examinés, publication terminée, outil
  associé et paramètres conservés après rechargement, dont le délai de
  10 secondes et le seul titre obligatoire. Aucun appel de l’outil lancé.
- Documentation : guide agent, suivi et journal actualisés. Aucun code applicatif
  modifié. Le SDK et la route serveur restent absents ; la création vocale de
  notes n’est donc pas encore disponible. Aucun essai vocal effectué.
- Suite : présenter `chercher_notes` et `lire_note`, puis attendre le go avant
  leur configuration distante.

## 8 novembre 2026 — Définitions distantes de recherche et de lecture

- Préparation : commit `6d3a70a` confirmé sur une branche propre. Descriptions,
  paramètres, attente du résultat et délais de 10 secondes expliqués puis autorisés.
- Réalisation : client tool `chercher_notes`, cinq paramètres facultatifs :
  trois textes, `corbeille` booléen et `limite` entier. Client tool `lire_note`,
  seul `id` textuel obligatoire. Attente de réponse activée et délai de 10 secondes
  pour chacun, sans mock ni affectation de variable dynamique.
- Décision : type `integer` disponible dans ElevenLabs. Bornes de 1 à 20 et
  valeurs par défaut décrites ; leur validation effective reste dans le code local.
  Recherche avec extraits distincte de la lecture du contenu complet.
- Vérifications : formulaires contrôlés, associations publiées, rechargement et
  synchronisation de la vue avec la version publiée, fiches rouvertes confirmant
  types, champs requis, attente et délais. Trois outils associés à l’agent,
  aucune publication en attente. Aucun appel d’outil ni essai vocal lancé.
- Documentation : guide agent, suivi et journal actualisés. Aucun code applicatif
  ou SDK ajouté ; les définitions distantes ne valident pas encore un parcours vocal.
- Suite : présenter `modifier_note`, `supprimer_note` et `restaurer_note`, puis
  attendre le go avant leur configuration distante.

## 8 novembre 2026 — Définitions distantes de modification et de corbeille

- Préparation : commit `7f20956` confirmé, branche propre. Descriptions,
  paramètres imbriqués de modification, identifiants de corbeille/restauration,
  attente du résultat et délais expliqués puis autorisés.
- Réalisation : trois client tools, attente de réponse et délai de 10 secondes.
  `modifier_note` reçoit `id` et `changements` obligatoires ; les quatre propriétés
  textuelles éditables de `changements` sont facultatives. `supprimer_note` et
  `restaurer_note` reçoivent uniquement `id` textuel obligatoire.
- Consignes : préserver les champs absents, lire avant de compléter un contenu,
  préciser la cible en cas d’ambiguïté, suppression réversible, recherche dans la
  corbeille avant restauration. Validations effectives conservées dans le code local.
- Vérifications : formulaires contrôlés, diff ajoutant trois associations et
  conservant les trois précédentes, publication et rechargement, fiches rouvertes
  confirmant paramètres, champs requis, attentes et délais. Six outils associés,
  aucune publication en attente. Aucun appel d’outil ni essai vocal lancé.
- Documentation : guide agent, suivi, journal et état du README actualisés.
  Aucun code applicatif ni SDK ajouté. Les définitions distantes sont terminées,
  mais leur exécution depuis le navigateur reste à implémenter et vérifier.
- Suite : présenter la préparation du branchement SDK et le chemin sécurisé
  d’obtention des jetons, avant installation ou code et après nouveau go.
