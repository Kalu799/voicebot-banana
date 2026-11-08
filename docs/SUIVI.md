# Suivi des tâches et jalons

| Étape | État | Critère de réussite |
| --- | --- | --- |
| 1. Initialiser React + Vite et préparer le dossier API | Terminé | Installation et compilation réussies, page accessible localement (HTTP vérifié) |
| 2. Définir le modèle de note | Terminé | Champs, règles et exemples documentés ; création, valeurs initiales et refus des titres vides vérifiés avec Node |
| 3. Stockage IndexedDB et export/import | Terminé | Services et commandes d'interface vérifiés : persistance, JSON téléchargé, restauration, validation et conflits |
| 4. Store Context + useReducer | Terminé | Chargement, création, modification, corbeille et import avec actualisation vérifiés ; erreurs et besoin de rechargement gérés |
| 5. Interface minimale et simulation | Terminé | Gestion manuelle, export/import et six outils depuis le simulateur vérifiés ; paramètres invalides et persistance contrôlés |
| 6. Agent ElevenLabs français | En cours | Agent créé, consignes françaises et authentification enregistrées ; voix et LLM provisoires, comportement à valider |
| 7. Client tools | En cours | Définitions distantes de création, recherche et lecture configurées ; trois autres outils et connexion au store via le SDK à faire |
| 8. Route serveur protégée | À faire | Jetons obtenus sans exposer la clé, accès contrôlé et demandes limitées |
| 9. Parcours complets et mobile | À faire | Persistance, ambiguïtés, erreurs et interactions vérifiées |
| 10. Déploiement Vercel | À faire | Adresse stable et démonstration reproductible |

La [préparation de l’agent](AGENT-ELEVENLABS.md) décrit les réglages proposés et
les scénarios à valider ainsi que la configuration distante initiale réalisée.
`creer_note`, `chercher_notes` et `lire_note` sont configurés et associés à l’agent
côté ElevenLabs ; les trois autres définitions restent à créer.
Aucun SDK ni endpoint de jetons n’est implémenté.
Aucun essai vocal n’a été lancé.

Les essais vocaux dépendront de la route serveur protégée, même si sa finalisation
figure à l'étape 8 du cadrage.

Premier jalon fonctionnel : créer une note par conversation et la retrouver après
rechargement. Ce jalon n'est pas encore atteint.
