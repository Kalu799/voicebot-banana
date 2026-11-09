# Assistant vocal de notes — cadrage retenu

Décisions validées le 5 novembre 2026. Ce document conserve le cadrage du projet ; le suivi courant se trouve dans [SUIVI.md](SUIVI.md).

Document intégré au dépôt le 8 novembre 2026 depuis le cadrage du dossier BananaNavy. Les étapes ci-dessous décrivent le périmètre cible ; le suivi distingue ce qui est réalisé et ce qui reste à faire.

## Objectif

Une petite application web personnelle où l’utilisateur gère ses notes en parlant à un agent ElevenLabs : créer, rechercher, lire, compléter, corriger, classer, supprimer et restaurer des notes.

## Pédagogie et qualité de présentation

Ce projet est important pour l’utilisateur : il devra être présenté et pourra devenir un projet vitrine de son portfolio. La compréhension du code, la documentation et la qualité de démonstration font partie des objectifs dès le début du développement.

- Adopter une démarche très pédagogique : avancer par étapes compréhensibles, expliquer le rôle des fichiers, les choix techniques et le cheminement des données. L’utilisateur doit pouvoir comprendre, modifier et expliquer lui-même le projet lors d’une présentation.
- Écrire un code clair, précis et cohérent : noms explicites, fonctions ciblées, composants lisibles et responsabilités distinctes entre interface, store, stockage et intégration vocale. Privilégier les solutions simples et éviter les abstractions inutiles.
- Commenter le code en français pour expliquer les intentions, les décisions et les mécanismes moins évidents, notamment le reducer, IndexedDB, les client tools, la connexion sécurisée et la gestion des erreurs. Garder les commentaires à jour et éviter de simplement paraphraser chaque ligne.
- Rédiger un README propre et pédagogique dès les premières étapes, puis le maintenir avec le code : présentation du besoin, fonctionnalités, stack et raisons des choix, prérequis, installation, variables d’environnement sans secrets, lancement local, mode de simulation, configuration ElevenLabs, architecture et flux de données, vérifications, déploiement, limites et pistes d’évolution.
- Préparer une démonstration reproductible avec un scénario guidé, des exemples de notes sans données personnelles et un mode de simulation utilisable lorsque le quota vocal est épuisé. Identifier clairement les échanges simulés.
- Soigner la présentation : interface cohérente et utilisable sur mobile, états de chargement et erreurs compréhensibles, captures d’écran et lien de démonstration dans le README lorsqu’ils seront disponibles.
- Avant présentation, vérifier les parcours essentiels, la persistance après rechargement et la gestion des erreurs ; documenter honnêtement ce qui fonctionne, les limites connues et ce qui reste à développer.

### Déroulement de chaque étape de développement

Méthode précisée le 8 novembre 2026 : avancer ensemble, étape par étape, en suivant systématiquement cet ordre.

1. **Annoncer ce qu’on va faire** : expliquer l’objectif de l’étape, le résultat attendu et les fichiers ou dossiers concernés.
2. **Présenter le code et l’expliquer** : fournir le code de l’étape avant sa mise en place, expliquer son fonctionnement et les choix effectués, avec les commentaires en français prévus ci-dessus.
3. **Attendre le go, puis mettre le code en place** : aucune modification avant l’accord explicite de l’utilisateur pour l’étape présentée. Après accord, créer ou modifier les fichiers dans les dossiers prévus, en précisant où chaque morceau de code doit aller et comment il s’intègre au reste du projet.
4. **Faire les vérifications nécessaires** : expliquer comment vérifier le résultat, effectuer les contrôles adaptés à l’étape et corriger les problèmes rencontrés.
5. **Présenter l’étape suivante** : une fois les vérifications réussies et les explications données, présenter le prochain objectif en reprenant ce même déroulement, puis attendre un nouveau go avant les modifications.

### Organisation Git

- Le dépôt Git est initialisé dans `voicebot`.
- `main` conserve la version stable destinée à la présentation ; `dev` intègre les fonctionnalités terminées et testées.
- Créer une branche `feature/...` depuis `dev` pour chaque grosse fonctionnalité. Une même branche peut regrouper plusieurs étapes et plusieurs commits.
- L’utilisateur réalise les commits, les push, les pull requests et les merges. L’assistant intervient sur le code, la documentation et les vérifications, et crée la branche convenue après accord.
- L’utilisateur ouvre la pull request de la fonctionnalité vers `dev` lorsqu’elle est terminée et testée, puis celle de `dev` vers `main` lorsqu’une V1 acceptable est prête.

## Documenter la démarche de bout en bout

La vitrine doit aussi montrer la capacité de l’utilisateur à gérer un petit projet du début à la fin : identifier un besoin, rechercher des solutions, faire des choix argumentés, organiser le travail, développer, vérifier et livrer. La démarche commence avant la première ligne de code et constitue un livrable du projet.

### Parcours à raconter

1. **Recherche d’une idée** : présenter le point de départ, les pistes réellement envisagées, le besoin retenu et les raisons du choix d’un assistant vocal de notes. Expliquer le public visé et les limites du premier périmètre.
2. **Découverte du voicebot et recherche d’outils** : expliquer les notions apprises pour ce premier projet vocal (transcription, synthèse vocale, modèle de langage, conversation et appels d’outils). Conserver les solutions étudiées, leurs avantages et limites, les sources consultées et les raisons du choix ElevenLabs. Inclure les contraintes de coût et la stratégie de développement avec l’offre gratuite.
3. **Recherche des technologies** : expliquer le rôle de chaque élément de la stack, les options réellement comparées et les raisons des choix selon le besoin, les connaissances de l’utilisateur, la simplicité, la persistance, la sécurité et le déploiement. Distinguer les éléments déjà maîtrisés de ceux appris pendant le projet.
4. **Cadrage et organisation** : montrer comment les besoins deviennent des fonctionnalités, un modèle de données, des outils pour l’agent et des étapes de réalisation. Définir des jalons vérifiables et suivre les tâches à faire, en cours et terminées, ainsi que les contraintes et ajustements de périmètre.
5. **Réalisation et résolution de problèmes** : documenter progressivement les étapes terminées, les difficultés rencontrées, les essais, les décisions et les corrections. Conserver des exemples concrets permettant d’expliquer le cheminement d’une demande vocale jusqu’à la sauvegarde d’une note.
6. **Vérification, livraison et bilan** : présenter les parcours vérifiés, les résultats, la démonstration, le déploiement, les limites et les prochaines améliorations. Expliquer ce qui a été appris et ce qui serait organisé différemment sur un prochain projet.

### Supports à construire progressivement

- Le **README** sera la porte d’entrée : présentation synthétique, aperçu du résultat, lancement et liens vers les explications détaillées.
- Un **dossier de démarche** regroupera la recherche d’idée, l’étude des outils vocaux, les choix techniques, l’organisation et le bilan. Réutiliser notamment [l’étude ElevenLabs](ELEVENLABS-COUTS.md).
- Un **journal de bord daté** conservera pour chaque étape l’objectif, le travail effectué, les difficultés, les décisions, les vérifications et la prochaine action.
- Un **suivi des tâches et jalons** rendra l’avancement lisible, avec des critères de réussite concrets.
- Des **preuves de réalisation** (captures, schémas utiles, exemples, résultats de vérification et démonstration) appuieront les explications lorsqu’elles seront disponibles.

Pour chaque décision importante, préciser la question posée, les options réellement étudiées, les critères, le choix et ses conséquences. Conserver les liens des sources et leur date de consultation, notamment pour les tarifs susceptibles d’évoluer.

Reconstituer les recherches déjà faites à partir des échanges et documents existants, puis tenir la documentation à jour au fil du développement. Ne pas inventer de comparaisons, d’essais ou de résultats : distinguer ce qui est envisagé, documenté, essayé et validé. Présenter avec transparence l’aide de l’IA, les contributions personnelles et la manière dont l’utilisateur vérifie et s’approprie les propositions.

## Stack

- React + Vite pour l’interface.
- React Context + useReducer pour le store, sans Zustand ni autre bibliothèque de gestion d’état.
- IndexedDB pour la persistance locale.
- SDK React ElevenLabs et client tools pour la conversation et les actions.
- Vercel pour l’hébergement et une fonction serveur qui fournit les jetons de conversation.
- Clé ElevenLabs uniquement côté serveur : `.env.local` exclu de Git en développement, variables d’environnement Vercel en production, sans préfixe `NEXT_PUBLIC_` ou `VITE_` pour les secrets.
- Aucune base de données distante. Pas de système de comptes complet pour le prototype personnel ; protéger néanmoins l’accès à la génération de jetons et limiter les demandes.

## Fonctionnement

Parole → agent ElevenLabs → client tool dans le navigateur → action du store → sauvegarde IndexedDB → résultat renvoyé à l’agent.

Le store recharge les notes au démarrage. L’agent attend la confirmation de sauvegarde avant d’annoncer la réussite. Les modifications ciblent un identifiant de note, et les paramètres des outils sont validés dans l’app. En cas d’ambiguïté, l’agent demande une précision à l’oral.

## Note

Champs : `id`, `titre`, `contenu`, `categorie`, `projet`, `createdAt`, `updatedAt`, `deletedAt`.

La suppression place la note dans une corbeille, avec restauration possible.

## Outils de l’agent

- `creer_note`
- `chercher_notes`
- `lire_note`
- `modifier_note`
- `supprimer_note`
- `restaurer_note`

## Interface initiale

Un écran avec bouton de démarrage/arrêt de conversation, état de connexion/écoute/réponse, transcription de l’échange et liste des notes mise à jour. Prévoir correction manuelle, corbeille et export/import.

## Étapes

### Budget et stratégie de test

- Utiliser l’offre gratuite ElevenLabs pour le prototype : 15 minutes de conversation par mois selon les tarifs vérifiés le 5 novembre 2026. Voir [l’étude des coûts](ELEVENLABS-COUTS.md) et [les tarifs officiels](https://elevenlabs.io/pricing/agents).
- Aucun abonnement payant ni dépassement payant activé pour cette phase.
- Développer et vérifier les notes, le classement, le store et la sauvegarde IndexedDB sans connexion vocale.
- Prévoir un mode de simulation des appels aux client tools pour tester création, recherche, lecture, modification, suppression et restauration sans consommer de minutes ElevenLabs.
- Réserver le quota aux essais vocaux courts et aux parcours complets indispensables.
- Afficher la durée de session, démarrer la connexion uniquement sur action explicite et la fermer dès la fin du test, à la fermeture de la vue ou après inactivité.
- Si le quota est épuisé, poursuivre avec les simulations et les fonctions locales jusqu’à son renouvellement. Le fonctionnement du projet ne dépend pas de la création de comptes supplémentaires.

### Ordre de réalisation

1. Initialiser React + Vite et la structure de la fonction Vercel.
2. Définir le modèle de note.
3. Construire le stockage IndexedDB et l’export/import.
4. Construire le store Context + useReducer et ses actions.
5. Créer l’interface minimale.
6. Configurer la voix française et les consignes de l’agent ElevenLabs.
7. Connecter les client tools aux actions du store.
8. Protéger la route serveur de génération des jetons.
9. Tester les parcours complets, les ambiguïtés, les erreurs et le mobile.
10. Déployer sur une adresse Vercel stable et vérifier le fonctionnement.

## Premier jalon

Une conversation crée une vraie note, visible à l’écran et toujours présente après rechargement. Ajouter ensuite recherche, lecture, modification et corbeille.

Scénario final : créer une idée de vidéo BananaNavy, ajouter une durée de trente secondes, la remplacer par une minute, recharger, retrouver/lire la note dans une nouvelle conversation, la supprimer puis la restaurer.

## Limites connues

- Les notes sont propres à l’appareil, au navigateur et à l’origine du site ; pas de synchronisation.
- Effacer les données du navigateur peut supprimer les notes : export/import nécessaire.
- L’app doit être ouverte pour que l’agent accède aux notes locales.
- La voix nécessite Internet. Les conversations et les notes renvoyées à l’agent passent par ElevenLabs ; vérifier les réglages de conservation.
- La transcription affichée et les notes organisées sont prévues ; conserver l’audio original n’est pas inclus dans le premier périmètre.
- Tester la fluidité sur téléphone, les interruptions et les échecs de sauvegarde.
