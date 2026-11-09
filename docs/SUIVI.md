# Suivi des tâches et jalons

| Étape | État | Critère de réussite |
| --- | --- | --- |
| 1. Initialiser React + Vite et préparer le dossier API | Terminé | Installation et compilation réussies, page accessible localement (HTTP vérifié) |
| 2. Définir le modèle de note | Terminé | Champs, règles et exemples documentés ; création, valeurs initiales et refus des titres vides vérifiés avec Node |
| 3. Stockage IndexedDB et export/import | Terminé | Services et commandes d'interface vérifiés : persistance, JSON téléchargé, restauration, validation et conflits |
| 4. Store Context + useReducer | Terminé | Chargement, création, modification, corbeille et import avec actualisation vérifiés ; erreurs et besoin de rechargement gérés |
| 5. Interface minimale et simulation | Terminé | Gestion manuelle, export/import et six outils depuis le simulateur vérifiés ; paramètres invalides et persistance contrôlés |
| 6. Agent ElevenLabs français | En cours | Agent créé, consignes françaises et authentification enregistrées ; voix et LLM provisoires, comportement à valider |
| 7. Client tools | En cours | Six définitions distantes configurées ; SDK installé et `creer_note` déclaré ; démarrage de session, cinq autres branchements et parcours vocaux à faire |
| 8. Route serveur protégée | En cours | Contrôles d’accès testés avec fournisseur simulé et route désactivée vérifiée sous Vercel local ; limitation distante et intégration réelle à vérifier |
| 9. Parcours complets et mobile | À faire | Persistance, ambiguïtés, erreurs et interactions vérifiées |
| 10. Déploiement Vercel | À faire | Adresse stable et démonstration reproductible |

La [préparation de l’agent](AGENT-ELEVENLABS.md) décrit les réglages proposés et
les scénarios à valider ainsi que la configuration distante initiale réalisée.
Les six outils sont configurés et associés à l’agent côté ElevenLabs.
Le SDK `@elevenlabs/react@1.21.1` est installé depuis le 9 novembre 2026 et
`creer_note` est déclaré via un provider, sans démarrage de session ni essai vocal.
Le service client de demande du jeton est ajouté et vérifié avec transport simulé ;
il n’est pas encore appelé par l’interface. Saisie du code et commandes vocales à faire.
Tests existants, compilation et affichage local vérifiés. Avertissement Vite sur
le poids du bundle consigné dans le guide agent, optimisation reportée.
La [route de jetons](../api/README.md) est ajoutée et
testée avec un fournisseur simulé, désactivée par défaut. La règle de limitation
Vercel n’est pas encore configurée et doit être vérifiée avant activation.
La commande `npm run dev:api` sert l’interface et la route avec le verrou fermé,
sans compte lié. Les avis npm des dépendances de développement de la CLI sont
documentés dans le [guide API](../api/README.md). Une correction ciblée impose
`tar@7.5.22`, `ajv@8.18.0`, `js-yaml@4.3.2` et `smol-toml@1.9.0` sous Vercel ;
il reste 29 signalements de développement, sans critique, et zéro pour les
dépendances de production selon l’audit du 8 novembre 2026.
Aucun essai vocal n’a été lancé.

Reprise du 8 novembre 2026 : inspection du dépôt propre sur
`feature/integration-elevenlabs`, commit `efc86f7` ; tests et compilation réussis.
Projet Vercel `voicebot-banana` créé vide dans l’espace `Ouais` (Hobby constaté),
sans déploiement, connexion Git ni règle de limitation appliquée. À la demande de
l’utilisateur, configuration et vérifications distantes reportées au moment de la
PR vers `dev` ; [procédure théorique](../api/README.md) consignée. Voix désactivée
jusqu’à validation effective. Les corrections exhaustives de dépendances CLI sont
suspendues ; les chiffres d’audit ci-dessus sont historiques. Objectif de périmètre :
V1 démontrable dans environ 8 à 9 heures disponibles, estimation sans garantie,
avec contrôle après environ trois heures sur une note vocale persistante.

Les essais vocaux dépendront de la route serveur protégée, même si sa finalisation
figure à l'étape 8 du cadrage.

Premier jalon fonctionnel : créer une note par conversation et la retrouver après
rechargement. Ce jalon n'est pas encore atteint.
