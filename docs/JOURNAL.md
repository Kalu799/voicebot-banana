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

## 8 novembre 2026 — Route serveur de jetons, désactivée par défaut

- Préparation : branche `feature/integration-elevenlabs` propre, route et code
  expliqués avant le go. Transport cible WebRTC, code personnel vérifié côté
  serveur, limitation Vercel proposée sans base distante ni compteur en mémoire.
- Réalisation : `server/routeJeton.js`, entrée `api/conversation-token.js`,
  `.env.example` sans secrets et onze scénarios dans `tests/routeJeton.test.js`.
  Aucune dépendance ajoutée et aucun secret réel créé ou renseigné.
- Accès : POST uniquement, verrou fermé sauf valeur explicite `true`, origine
  exacte, code Bearer long comparé par empreinte SHA-256 en temps constant.
  Agent fixé côté serveur, clé dans l’en-tête amont, seul jeton renvoyé au client.
  Réponses sans cache, erreurs génériques, redirections et tentatives automatiques
  refusées, attente amont limitée à dix secondes.
- Limitation : règle Vercel proposée à deux demandes par minute et IP, à configurer
  et vérifier avant activation. Le verrou est manuel et ne vérifie pas la règle.
  Pas de plafond global de minutes garanti ; conditions du compte à vérifier.
- Vérifications réussies : `npm test`, onze scénarios de route exécutés directement
  avec Node et `npm run build`. Refus locaux sans appel fournisseur, isolation des
  secrets, agent imposé, réponse valide, JSON invalide, erreurs HTTP et pannes testés.
  Expiration simulée, sans attendre réellement dix secondes ; aucun appel réel.
- Contrôles complémentaires : 48 liens locaux valides dans 13 documents,
  `git diff --check` réussi, `.env.local` ignoré et `.env.example` versionnable.
  Marqueurs de la clé serveur, de son en-tête et de l’empreinte du code absents
  du JavaScript client compilé.
- Documentation : guide API réécrit, README, guide agent et suivi actualisés.
- Limites : route non déployée, pare-feu non configuré, runtime Vercel non vérifié,
  SDK et saisie du code absents. Vite seul ne sert pas la fonction. Aucun essai
  vocal ni activation payante effectué.
- Suite : expliquer l’exécution locale de la route et la vérification de la
  limitation sur Vercel avec un fournisseur simulé, avant tout accès ElevenLabs réel.

## 8 novembre 2026 — Exécution de la route avec Vercel local

- Préparation : commit `8d67d3b` confirmé, branche propre. Installation de la CLI,
  commande locale avec verrou fermé et contrôles HTTP expliqués puis autorisés.
- Réalisation : CLI Vercel 65.12.1 en dépendance de développement exacte,
  `dev:api` lançant `vercel dev --local --listen 127.0.0.1:3000` avec
  `VOICEBOT_VOIX_ACTIVE=false`. Écoute limitée à la boucle locale, sans liaison
  de projet ni connexion au compte Vercel et sans déploiement.
- Environnement : téléchargement npm et première création du dossier utilisateur
  de la CLI autorisés après blocage du bac à sable. Écoute et contrôles HTTP
  locaux également autorisés après refus de permission du bac à sable.
- Vérifications HTTP : interface `200`, GET de la route `405` avec `Allow: POST`,
  POST `503` avec message de verrou fermé. `Cache-Control: no-store` sur les deux
  réponses de route. Interface React observée dans le navigateur, sans mutation
  des notes ni appel du simulateur.
- Non-régression : `npm test`, `npm run build` et `npm ls --depth=0` réussis.
  Versions directes React et Vite conservées ; aucune clé ni conversation réelle.
- Audit npm : 38 avis dans l’arbre de développement de la CLI (16 modérés,
  21 élevés, un critique), zéro dans les dépendances de production selon
  `npm audit --omit=dev`. Pas de correction automatique ni rétrogradation vers
  la version 65.2.0 suggérée par npm ; résolution de ces avis encore ouverte.
- Documentation : README, guide API, suivi et journal actualisés. Le lancement
  local ne valide ni le pare-feu ni le déploiement distant, ni un plafond de coût.
- Suite : expliquer la préparation du projet Vercel et le contrôle de la règle
  de limitation avec fournisseur simulé, puis attendre le go ; traiter également
  les avis de dépendances de la CLI avant d’élargir son usage.

## 8 novembre 2026 — Correction ciblée de tar dans la CLI Vercel

- Préparation : commit `66f4b2b` confirmé et arbre propre. Audit en lecture seule,
  chaîne des dépendances et correction ciblée expliqués avant accord.
- Réalisation : override `vercel` → `tar: 7.5.22` dans `package.json`, puis
  `npm install` pour actualiser le lockfile. Aucune correction automatique globale
  ni rétrogradation de Vercel ; code applicatif et versions directes conservés.
- Résolution : tar 7.5.22 pour `@vercel/container`, `@mapbox/node-pre-gyp` et
  `@vercel/fun`, sans copie 7.5.11 restante. Copie imbriquée redondante retirée.
  Cette substitution devra être réexaminée lors des mises à jour de la CLI.
- Audit : de 38 à 37 signalements, 16 modérés et 21 élevés, zéro critique ;
  aucune entrée tar dans le rapport. `npm audit --omit=dev` reste à zéro.
- Vérifications : `npm test`, `npm run build`, `npm ls tar --all` et
  `npm ls --depth=0` réussis. Ancien serveur local arrêté puis redémarré avec
  les dépendances corrigées ; interface `200`, route GET `405` et POST `503`,
  en-têtes de méthode et absence de cache contrôlés. Verrou vocal fermé.
- Documentation : guide API, suivi et journal actualisés. Aucun déploiement ni
  appel ElevenLabs réel. Les 37 autres signalements restent ouverts ; les
  vérifications ne couvrent pas toutes les fonctions de la CLI.
- Suite : examiner les autres dépendances concernées et distinguer les correctifs
  compatibles des changements de version majeure, avant de proposer une nouvelle
  modification après explication et go.

## 8 novembre 2026 — Correction ciblée d’Ajv, js-yaml et smol-toml

- Préparation : commit `27d6d7c` confirmé, branche propre. Rôle, versions corrigées,
  substitutions limitées à Vercel et vérifications présentés avant le go.
- Réalisation : overrides `ajv: 8.18.0`, `js-yaml: 4.3.2`, `smol-toml: 1.9.0`
  ajoutés sous Vercel, puis installation et actualisation du lockfile.
  Override tar conservé, CLI 65.12.1, versions directes et code applicatif inchangés.
- Audit : de 37 à 29 signalements, 10 modérés, 19 élevés, zéro critique.
  Les trois bibliothèques ne figurent plus dans le rapport. Les dépendances de
  production restent à zéro ; les autres signalements ne sont pas résolus.
- Vérifications : tests, compilation, arbre npm et versions résolues réussis.
  Ancien serveur arrêté puis redémarré avec les nouvelles dépendances ; interface
  `200`, route GET `405`, POST `503`, méthode autorisée et absence de cache contrôlées.
- Contrôles ponctuels : validation Ajv, lecture YAML et valeurs d’un aller-retour
  TOML vérifiées. La première assertion TOML supposait à tort un prototype ordinaire ;
  le contrôle a été corrigé pour vérifier explicitement le prototype nul et les
  valeurs produites. Aucun changement du code de l’application nécessaire.
- Documentation : guide API, suivi et journal actualisés. Verrou vocal fermé,
  aucun déploiement ni appel ElevenLabs réel. Les contrôles ne valident pas tous
  les usages de ces bibliothèques dans la CLI ; overrides à réexaminer à sa mise à jour.
- Suite : examiner les avis restants, notamment les deux familles de versions de
  `path-to-regexp`, avant de proposer une correction distincte après explication et go.

## 8 novembre 2026 — Reprise V1 et préparation Vercel

- Inspection en lecture seule : cadrage, suivi, journal, guides API et agent,
  code et Git vérifiés. Branche `feature/integration-elevenlabs`, commit `efc86f7`,
  arbre propre. SDK absent ; sauvegarde attendue avant résultat des outils.
- Vérifications : `npm test` réussi (trois fichiers), `git diff --check` réussi,
  puis `npm run build` réussi après accord pour l’étape Vercel. Aucun nouvel audit.
- Périmètre retenu : environ 8 à 9 heures disponibles pour une V1 démontrable,
  sans garantie ; première note vocale persistante prioritaire et point de contrôle
  après environ trois heures. Interface conservée, vérifications centrées sur le
  parcours principal. Corrections exhaustives de la CLI suspendues ; dette
  historique de 29 signalements de développement, zéro en production au dernier
  relevé, à réexaminer si notre usage est affecté ou bloqué.
- Après go, connexion Vercel réalisée par l’utilisateur ; espace `Ouais` sur
  Hobby constaté. Import direct de la branche refusé (« Could not access the
  repository »). Projet vide créé puis renommé `voicebot-banana`, sans connexion
  Git, déploiement, règle de limitation ni secret ajouté. Aucun paiement activé.
- Ajustement demandé : reporter configuration et essais distants au moment de la
  PR vers `dev`. Procédure théorique consignée dans le guide API : voix fermée,
  deux demandes par minute et IP, contrôle `503`, puis `429`, puis retour à `503`.
  Aucun mode simulé à ajouter au serveur déployé pour vérifier le pare-feu.
- Suite : présenter le branchement SDK, d’abord `creer_note`, avec code commenté
  avant nouveau go. Préparer localement sans connexion réelle ; activation vocale
  conditionnée à la protection distante vérifiée et au contrôle du compte gratuit.

## 9 novembre 2026 — SDK React et déclaration de creer_note

- Préparation : branche `feature/integration-elevenlabs` vérifiée ; les trois
  documents modifiés lors de l’étape précédente sont conservés. Code présenté
  puis go explicite reçu pour cette seule étape.
- Réalisation : installation exacte de `@elevenlabs/react@1.21.1`, lockfile
  actualisé, `ConversationNotesProvider.jsx` ajouté et intégré dans `main.jsx`
  sous `NotesProvider`. `creer_note` utilise la couche d’outils existante et renvoie
  son résultat JSON après sauvegarde. Aucun autre outil ni démarrage ajouté.
- Environnement : installation initialement bloquée par la résolution réseau du
  bac à sable, puis réussie après autorisation. Serveur Vite local autorisé sur
  `127.0.0.1:4175` après refus d’écoute dans le bac à sable.
- Vérifications : exports réels du SDK contrôlés ; `npm ls --depth=0`, `npm test`
  (trois fichiers) et `npm run build` réussis. Interface observée dans le navigateur,
  sans mutation des notes, session ni demande de microphone. Le parcours vocal
  et l’exécution du gestionnaire par le SDK restent à valider.
- Limites : bundle principal de 846,62 kB (233,40 kB gzip), avertissement Vite
  au-delà de 500 kB ; optimisation reportée. Installation : 29 signalements npm
  (10 modérés, 19 élevés), sans correction automatique ; pas de nouvel audit
  séparé des dépendances de production pendant cette étape.
- Documentation : suivi et guide agent actualisés. Prochaine étape à expliquer
  avant nouveau go : demande du jeton depuis le navigateur pour préparer les
  commandes de démarrage et d’arrêt. La route reste verrouillée ; vérification
  distante et contrôle du compte gratuit requis avant tout essai vocal réel.

## 9 novembre 2026 — Service client de demande du jeton

- Préparation : go explicite reçu pour le code présenté ; branche
  `feature/integration-elevenlabs` et modifications existantes vérifiées et conservées.
- Réalisation : `src/services/conversationAccess.js` ajouté. Format du code validé
  avant envoi, POST relatif avec Bearer, cache et redirections refusés, délai de
  quinze secondes par défaut ou signal d’annulation fourni. Messages adaptés aux
  refus importants ; corps brut et détails de panne non exposés. Aucune relance,
  sauvegarde de code/jeton ou clé ElevenLabs côté client.
- Vérifications : sept scénarios ajoutés dans `tests/conversationAccess.test.js`,
  sans réseau, avec valeurs fictives. Validation sans requête, jeton valide, refus
  HTTP, JSON/jeton invalide, panne/expiration simulée, annulation et délai configuré
  vérifiés. `npm test` réussi (quatre fichiers), `npm run build` réussi.
- Limites : délai vérifié sans attente réelle ; aucun HTTP réel, démarrage SDK,
  microphone ou appel ElevenLabs. Service non appelé par l’interface à ce stade.
  Avertissement de poids du bundle inchangé ; aucune dépendance supplémentaire.
- Documentation : guide agent et suivi actualisés. Suite à présenter avant nouveau
  go : panneau vocal avec code en mémoire, demande annulable, démarrage/arrêt,
  durée et fermeture automatique. Route verrouillée jusqu’à validation distante.

## 9 novembre 2026 — Panneau de conversation préparé

- Préparation : commit utilisateur `e2a9048` confirmé sur
  `feature/integration-elevenlabs`, arbre propre. Code expliqué puis go explicite reçu.
- Réalisation : `ConversationPanel.jsx` ajouté avant les sauvegardes dans `App.jsx`.
  Code personnel en mémoire et champ effacé, jeton avant WebRTC/microphone,
  confirmation via événements SDK, démarrage/arrêt et refus des retours obsolètes.
  Durée et quarante derniers messages temporaires affichés.
- Fermeture : annulation de la demande, préparation limitée à trente secondes,
  conversation à deux minutes, arrêt après trente secondes sans message/audio reçu,
  au masquage, à la sortie de page et au démontage. Minuteries locales approximatives,
  complémentaires aux protections distantes et non assimilables à un plafond de coût.
- Vérifications : compilation et `npm test` réussis (quatre fichiers). Banc React
  temporaire hors dépôt, sous StrictMode, avec SDK et jeton simulés : refus, attente
  de connexion, message reçu, délais accélérés, arrêt et jeton tardif ignoré,
  erreur SDK générique, sortie et démontage vérifiés. Aucune dépendance ajoutée.
  Le banc n’est pas intégré à la suite Node. Application réelle observée localement :
  panneau affiché et code invalide refusé sans microphone ni réseau ElevenLabs.
- Limites : aucun essai vocal réel, aucun accès distant activé. Masquage réel sur
  mobile, libération du microphone et fermeture effective à vérifier ultérieurement.
  Bundle de 852,19 kB (235,48 kB gzip) : avertissement Vite inchangé dans sa nature,
  optimisation reportée.
- Documentation : README, guide API, guide agent et suivi actualisés. Commit à
  proposer à l’utilisateur ; prochaine étape : préparer sa PR vers `dev` et le
  contrôle Vercel verrouillé avant le premier essai de création vocale persistante.

## 9 novembre 2026 — Déploiement Vercel avec la voix désactivée

- Préparation : commit utilisateur `b957b20`, puis PR n° 3 fusionnée par
  l’utilisateur. Branche courante `dev`, commit `71ba461`, arbre propre avant
  intervention. Étape expliquée puis go reçu ; pare-feu explicitement reporté.
- Réalisation distante : dépôt GitHub connecté au projet `voicebot-banana`
  sur Hobby, preset Vite, sortie `dist`, racine du dépôt. Variable Config
  `VOICEBOT_VOIX_ACTIVE=false` pour Production, Preview et Development ; aucun
  secret réel ajouté. Déploiement manuel de `dev`, révision exacte confirmée.
- Résultat : déploiement `GhNXoPtnAkPcpYrykBSc5yAS74Hg` Ready. Vercel classe le
  premier déploiement en Production malgré le formulaire de prévisualisation ;
  cela ne modifie pas la branche Git `main`. Adresse principale :
  https://project-bxwwf.vercel.app.
- Vérifications : build distant réussi ; interface HTTP `200` et affichage réel
  vérifiés ; GET API `405` avec `Allow: POST`, POST API `503` avec message de
  désactivation, deux réponses API sans cache. Code fictif saisi dans le panneau :
  refus vocal affiché et champ effacé. Aucune note créée, aucun microphone,
  appel ElevenLabs ou session réelle. Contrôles réseau autorisés après échec DNS
  dans le bac à sable.
- Protection existante conservée : l’alias de branche dev redirige en `302`
  vers Vercel Authentication sans authentification. Les contrôles applicatifs
  sont faits sur le domaine principal ; aucun contournement ni désactivation.
- Écart constaté : réglage Node 24.x supplanté par la plage `>=22.12.0` du
  manifeste, Node 26.x utilisé ; CLI distante 65.11.0, CLI locale ignorée.
  Avertissements Node, npm et poids du bundle consignés, sans correction globale.
- Documentation : README, guide API et suivi actualisés. Limitation `429`, compte
  gratuit et secrets à vérifier avant activation vocale. Alignement de Node à
  proposer séparément. Aucun commit, push ou merge réalisé par l’assistant.

## 9 novembre 2026 — Limites du premier essai vocal

- Préparation : PR documentaire n° 4 fusionnée par l’utilisateur, `dev` propre au
  commit `244d95c`. Alignement Node reporté pour préserver les six heures restantes.
  Inspection distante en lecture seule, réglages expliqués et go reçu. Branche
  `feature/validation-vocale` créée avant toute modification documentaire.
- Compte : Free, 6 299 crédits restants, recharge automatique désactivée ; coûts
  LLM déduits des crédits selon la FAQ du compte. Aucun paiement ni réglage de
  facturation modifié. Authentification, bursting désactivé, 120 secondes maximum
  et 30 secondes de silence confirmés. Modèle et voix conservés pour le premier essai.
- ElevenLabs : diff limité à deux valeurs, puis publication sur `Main` distante :
  cinq appels/jour et une conversation simultanée. Rechargement : valeurs conservées,
  aucune publication en attente. File d’attente héritée inchangée à 180 secondes.
- Vercel : règle `Limiter les jetons BananaNavy` publiée, chemin exact de l’API,
  fenêtre fixe 60 secondes, deux demandes par IP, refus `429`, sans filtre
  d’authentification/méthode/domaine. Aucun abonnement ou service payant activé.
- Vérifications HTTP autorisées, sans secrets : à 09:50:53–54 (Paris), trois POST
  donnent `503`, `503`, `429` ; à 09:52:24, POST de nouveau `503`, interface `200`.
  Région d’entrée `cdg1`, règle rouverte avec valeurs exactes et compteur Vercel
  « Rate Limited 1 ». Lien « View Traffic » renvoyant `404`, sans investigation
  supplémentaire puisque le compteur global et le contrôle HTTP confirment le refus.
- Portée : domaine principal testé ; autres alias/régions non exercés. Aucune
  session, demande ElevenLabs ou consommation vocale ; verrou toujours fermé.
- Documentation : README, guide API, guide agent et suivi actualisés. Aucun code
  applicatif modifié, tests locaux non relancés pour cette configuration distante.
  Suite à expliquer avant nouveau go : préparation du code personnel, de son
  empreinte et de la clé serveur, puis activation pour un premier essai court.

## 9 novembre 2026 — Préparation privée des secrets serveur

- Préparation : commit utilisateur `824f531` confirmé sur `feature/validation-vocale`,
  arbre propre. Go reçu pour les secrets seulement, sans activation.
- Local : `.env.local` absent créé avec exclusion Git, mode `600` et écriture
  exclusive. Code aléatoire 32 octets en base64url et empreinte SHA-256 ; valeurs
  jamais affichées dans les sorties d’outil. Origine HTTPS du domaine principal,
  agent fixé et verrou `false`. L’utilisateur renseigne la clé directement ;
  présence, permissions du fichier et cohérence de l’empreinte vérifiées.
- ElevenLabs : formulaire de clé dédiée restreinte préparé, ElevenAgents Lire,
  limite 2 000 crédits et expiration un jour. Création finale et copie privée par
  l’utilisateur ; droit exact encore à valider lors de la demande réelle de jeton.
- Vercel : agent et origine préremplis ; l’utilisateur saisit clé et empreinte puis
  enregistre. Les quatre variables sont présentes en Secret, Production uniquement.
  Aucune valeur secrète révélée. La lecture du verrou Config demande une vérification
  par email : annulation de cette lecture sans envoi, valeur initiale non modifiée.
- Limites : aucun redéploiement, appel fournisseur ou session. Variables à prendre
  en compte au prochain déploiement ; clé d’essai à renouveler après expiration.
- Documentation actualisée ; aucune modification du code applicatif. Suite à
  expliquer avant go : activation en Production, redéploiement et premier essai
  court, avec vérification de la sauvegarde après rechargement.

## 9 novembre 2026 — Activation protégée et droit du jeton corrigé

- Préparation : commit utilisateur `57a17c2`, branche `feature/validation-vocale`
  propre. Go reçu pour activer Production et essayer une première note.
- Activation : vérification email Vercel effectuée par l’utilisateur ; verrou
  séparé en `true` pour Production et `false` hors Production. Redéploiement
  `CfSaJTjgtszz5ZT4j1T9bY4bjU1A` Ready, code `71ba461`. POST sans code et avec
  bonne origine : `401` sans cache. Limitation et secrets conservés.
- Premier essai : refus avant connexion, durée affichée 0:00, aucune note créée.
  Diagnostic direct autorisé : fournisseur `401`, `missing_permissions`,
  `convai_write` absent. Le droit Lire proposé initialement est insuffisant.
- Correction après go ciblé : ElevenAgents Lire → Écrire sur la même clé,
  autres accès fermés, plafond 2 000 et expiration conservés. Aucun nouveau secret
  ni redéploiement pour cette modification de permission.
- Vérifications sans sortie sensible : endpoint fournisseur `200` avec jeton,
  puis route Vercel avec origine et code valides `200`, jeton présent et sans
  cache. Aucun jeton affiché, aucune session audio ouverte par ces diagnostics.
- L’utilisateur est invité à reprendre le même essai court ; première note et
  persistance non encore validées. Aucun changement du code applicatif.
- Calendrier : objectif 16 h 30, limite absolue 17 h 30, jalon première note visé
  avant 11 h 30. À 10 h 43, environ 5 h 47 restantes jusqu’à l’objectif ; blocage
  d’authentification résolu, parcours audio restant à confirmer.

## 9 novembre 2026 — Première note vocale persistante validée

- Essai repris par l’utilisateur après correction de la permission. Dans le
  navigateur, accueil de l’agent, transcription de la demande et confirmation de
  création observés. Note « Test vocale Banana Navy », contenu « Présenter le
  projet », créée à 10 h 48. Variation du titre due à la transcription conservée.
- Vérification : conversation arrêtée, durée affichée 17 secondes ; une note
  visible. Rechargement effectué par l’assistant : même titre et contenu toujours
  présents, conversation arrêtée, durée 0:00 et transcription vidée. Aucune
  création manuelle ou simulation exécutée pendant cette vérification.
- Premier jalon atteint à 10 h 49. Cette preuve concerne l’origine principale et
  le navigateur utilisé ; les cinq autres outils, le mobile et le scénario final
  restent à valider. Aucun code applicatif changé pour atteindre ce jalon.
- Documentation actualisée sur `feature/validation-vocale`. À 10 h 49, 5 h 41
  jusqu’à l’objectif 16 h 30, une heure supplémentaire au maximum en secours.
  Prochaine étape à présenter avant go : déclarer les cinq autres outils dans
  le provider en réutilisant les validations et actions existantes.

## 9 novembre 2026 — Six outils déclarés dans le SDK

- Préparation : commit utilisateur `88b56fc` confirmé, branche
  `feature/validation-vocale` propre. Code de remplacement présenté puis go reçu.
- Réalisation : `OutilsConversationNotes` remplace `OutilCreationNote` dans le
  provider. Les six hooks sont explicites et inconditionnels ; `resultatPourAgent`
  attend chaque outil existant puis sérialise son résultat en JSON. Validations,
  actions du store, sauvegarde et définitions distantes conservées.
- Vérifications : `npm test` réussi (quatre fichiers), `npm run build` réussi,
  interface locale montée dans le navigateur avec les six déclarations. Aucun
  outil exécuté, microphone ou appel ElevenLabs pendant ce contrôle local.
  Aucune dépendance ajoutée ; avertissement de poids du bundle conservé.
- Portée : seule la création est encore validée sur le déploiement existant ;
  cinq nouveaux branchements à publier après les opérations Git de l’utilisateur,
  puis scénario vocal complet à effectuer. Documentation actualisée.

## 9 novembre 2026 — Parcours vocal principal et largeur mobile vérifiés

- Après commit utilisateur `52399ba` et fusion de la PR n° 5, `dev` est propre
  au commit `798641d`. Go reçu, branche `feature/validation-demo` créée avant
  toute modification. Aucun commit, push, PR ni merge réalisé par l’assistant.
- Vercel : aperçu de `798641d` déjà Ready, reconstruit explicitement en Production
  avec les réglages existants. Vérification email réalisée par l’utilisateur.
  Déploiement `484mptLNMJ8Ydt4whB1XXETBcoC1` Ready à 11 h 04 sur le domaine
  principal ; variables, accès hors Production et protections conservés.
- Essai utilisateur de 50 secondes : recherche et lecture de la note existante,
  ajout de trente secondes sans perte du texte, remplacement par une minute.
  Transcription et contenu observés ; après rechargement, « Présenter le projet »
  puis « Durée prévue une minute. » toujours présents.
- Essai utilisateur suivant de 30 secondes : mise en corbeille puis recherche et
  restauration. Les deux transitions de compteurs sont confirmées par l’utilisateur ;
  transcription de l’échange et retour de la note observés. Après rechargement :
  une note active, zéro en corbeille, titre et contenu inchangés.
- Les six outils ont ainsi été exercés vocalement, création comprise au jalon
  précédent. Le parcours utilise la note de test existante au lieu d’une nouvelle
  idée de vidéo ; aucune nouvelle création pour reproduire exactement le titre.
- Contrôle 390 × 844 px : panneau vocal, champs, boutons et simulateur inspectés,
  une colonne sans débordement horizontal. Édition ouverte puis annulée sans
  modification, largeur par défaut rétablie. Code court refusé localement puis
  code fictif au format valide refusé par le serveur ; aucune session ouverte.
- Captures ordinateur et mobile ajoutées ; README, suivi, guide agent et guide
  API actualisés. Aucun code applicatif, dépendance ou réglage distant modifié
  pendant la finition documentaire. Pas de nouveau test vocal consommé.
- Limites : téléphone physique et microphone mobile, ambiguïtés entre plusieurs
  notes, classement vocal, contenu hostile et panne réelle restent à vérifier.
  Clé d’essai expirante à renouveler pour une démonstration après son échéance.

## 9 novembre 2026 — Guide de démonstration et report du téléphone

- PR n° 6 fusionnée par l’utilisateur, `dev` propre au commit `882e6e5`.
  Après go, branche `feature/recette-v1` créée avant les changements.
- Ajout de `DEMONSTRATION.md` : préparation privée de l’accès, phrases à prononcer,
  résultats attendus, preuves réelles distinctes des essais prévus, dépannage et
  secours par formulaire ou simulateur. Liens ajoutés dans le README et le suivi.
- L’utilisateur dispose d’un téléphone mais demande de reporter le test audio
  pour préserver les crédits ElevenLabs. Report consigné explicitement ; aucune
  validation du microphone mobile annoncée et aucun nouvel appel vocal lancé.
- Guide du simulateur actualisé : les six outils sont déjà intégrés à l’agent,
  leur déduplication reste une limite. Aucun code applicatif ou réglage modifié.

## 9 novembre 2026 — Conversation et notes en deux espaces

- Avant la PR vers `main`, l’utilisateur demande une optimisation de l’interface.
  Disposition et code présentés, go reçu ; branche `feature/interface-deux-colonnes`
  créée depuis `dev` avant toute modification.
- `App` sépare conversation/transcription et espace de notes. Navigation à quatre
  boutons avec vues maintenues par `hidden`, simulateur dans un dépliant à gauche.
  Après création, retour aux notes et focus sur leur bouton via le callback existant.
- Styles : en-tête compact, deux colonnes au-delà de 900 px, navigation sur deux
  lignes sous 1200 px, transcription défilante avec zone vide explicite.
- Vérifications locales sur la compilation : brouillons de création/édition
  conservés à la navigation, formulaire vidé après succès, modification, corbeille,
  restauration et rechargement. Export téléchargé puis réimporté sans doublon.
  Simulateur déplié et recherche exécutée, état du code fictif conservé après
  navigation puis effacé sans démarrer de session.
- Largeurs 320, 390, 900, 1024 et 1440 px : pas de débordement, points de rupture
  conformes, identifiants DOM uniques. Captures ordinateur et mobile ajoutées.
- Tests existants et build réussis, avertissement connu sur le bundle conservé.
  Aucun changement des outils, du store, de la route, des secrets ou des dépendances.
  Aucun crédit vocal consommé. Documentation actualisée, publication en attente.

## 9 novembre 2026 — Interface publiée et préparation de la livraison stable

- Commit utilisateur `5eb11b9`, PR n° 8 fusionnée sur `dev`, commit `1667550`.
  Build Preview Ready constaté, puis go pour reconstruire en Production.
- Environnement Production et domaine habituel sélectionnés ; vérification email
  effectuée par l’utilisateur. Déploiement `2KQfJsLR3D7FDwZPUtQS292qH6zE` Ready
  à 11 h 50, même commit et variables existantes, aucune protection modifiée.
- Sur le domaine public : Mes notes, Corbeille, Ajouter une note et Sauvegarde
  s’affichent correctement. Retour aux notes et rechargement : « Test vocale
  Banana Navy » toujours présente, contenu « Présenter le projet » et « Durée
  prévue une minute. ». Aucun appel vocal, création ou modification pour ce contrôle.
- Après go de finalisation, branche `docs/livraison-v1` créée depuis `dev` propre.
  README, suivi, guides interface/démonstration/agent/API actualisés avec le commit
  publié et la distinction entre les essais vocaux antérieurs et le contrôle visuel.
  Capture du site public ajoutée ; limites et livraison Git `main` encore à venir
  conservées explicitement. Aucun code applicatif ni réglage distant modifié.
- Reprise à 13 h 10 Paris : environ 3 h 20 jusqu’à l’objectif 16 h 30, limite
  absolue 17 h 30. Étapes suivantes réservées à l’utilisateur : commit, PR vers
  `dev`, puis PR `dev` vers `main` ; contrôler ensuite le déploiement automatique.
