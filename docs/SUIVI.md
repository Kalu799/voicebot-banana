# Suivi des tâches et jalons

| Étape | État | Critère de réussite |
| --- | --- | --- |
| 1. Initialiser React + Vite et préparer le dossier API | Terminé | Installation et compilation réussies, page accessible localement (HTTP vérifié) |
| 2. Définir le modèle de note | Terminé | Champs, règles et exemples documentés ; création, valeurs initiales et refus des titres vides vérifiés avec Node |
| 3. Stockage IndexedDB et export/import | Terminé | Services et commandes d'interface vérifiés : persistance, JSON téléchargé, restauration, validation et conflits |
| 4. Store Context + useReducer | Terminé | Chargement, création, modification, corbeille et import avec actualisation vérifiés ; erreurs et besoin de rechargement gérés |
| 5. Interface minimale et simulation | Terminé | Gestion manuelle, export/import et six outils depuis le simulateur vérifiés ; paramètres invalides et persistance contrôlés |
| 6. Agent ElevenLabs français | En cours | Agent créé, consignes françaises et authentification enregistrées ; voix et LLM provisoires, comportement à valider |
| 7. Client tools | En cours | SDK et panneau de conversation préparés, `creer_note` déclaré ; cinq autres branchements et parcours vocaux réels à faire |
| 8. Route serveur protégée | En cours | Route verrouillée et limitation Vercel `429` vérifiées ; secrets et intégration réelle à préparer |
| 9. Parcours complets et mobile | À faire | Persistance, ambiguïtés, erreurs et interactions vérifiées |
| 10. Déploiement Vercel | En cours | Version verrouillée de `dev` (`71ba461`) publiée et vérifiée ; démonstration vocale à valider |

La [préparation de l’agent](AGENT-ELEVENLABS.md) décrit les réglages proposés et
les scénarios à valider ainsi que la configuration distante initiale réalisée.
Les six outils sont configurés et associés à l’agent côté ElevenLabs.
Le SDK `@elevenlabs/react@1.21.1` est installé depuis le 9 novembre 2026 et
`creer_note` est déclaré via un provider, sans démarrage de session ni essai vocal.
Le service client de jeton est raccordé au panneau : code en mémoire, démarrage/arrêt,
durée, messages temporaires et fermetures automatiques. Les parcours de commande
sont vérifiés avec SDK/jeton simulés ; seul le refus local d’un code invalide et
l’affichage sont vérifiés avec le SDK installé. Aucun essai vocal réel.
Tests existants, compilation et affichage local vérifiés. Avertissement Vite sur
le poids du bundle consigné dans le guide agent, optimisation reportée.
La [route de jetons](../api/README.md) est ajoutée et
testée avec un fournisseur simulé, désactivée par défaut. La règle de limitation
Vercel est publiée depuis le 9 novembre 2026 : deux demandes/minute/IP ; contrôle
`503`, `503`, `429`, puis `503` après expiration réussi sur le domaine principal.
Déploiement verrouillé vérifié le 9 novembre 2026 sur
[project-bxwwf.vercel.app](https://project-bxwwf.vercel.app) : interface `200`,
route GET `405`, POST `503`, refus vocal affiché avec code fictif. Dépôt connecté,
preset Vite, voix désactivée pour tous les environnements. Aucun secret ElevenLabs
ajouté. Agent limité à cinq appels/jour et un simultané ; compte Free et recharge
automatique désactivée confirmés. Secrets et essais réels restent à faire.
Vercel utilise Node 26.x malgré
le réglage 24.x, à cause de la plage ouverte du manifeste ; écart consigné au guide API.
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
