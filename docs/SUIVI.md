# Suivi des tâches et jalons

| Étape | État | Critère de réussite |
| --- | --- | --- |
| 1. Initialiser React + Vite et préparer le dossier API | Terminé | Installation et compilation réussies, page accessible localement (HTTP vérifié) |
| 2. Définir le modèle de note | Terminé | Champs, règles et exemples documentés ; création, valeurs initiales et refus des titres vides vérifiés avec Node |
| 3. Stockage IndexedDB et export/import | Terminé (services) | Persistance, aller-retour JSON, validation, conflits et annulation complète vérifiés dans Chrome ; boutons à intégrer à l'étape 5 |
| 4. Store Context + useReducer | Terminé | Chargement, création, modification, corbeille et import avec actualisation vérifiés ; erreurs et besoin de rechargement gérés |
| 5. Interface minimale et simulation | En cours | Création et lecture des notes actives vérifiées sur ordinateur/mobile ; commandes de modification, corbeille, sauvegarde et simulation à faire |
| 6. Agent ElevenLabs français | À faire | Consignes et voix configurées |
| 7. Client tools | À faire | Actions vocales reliées au store |
| 8. Route serveur protégée | À faire | Jetons obtenus sans exposer la clé, accès contrôlé et demandes limitées |
| 9. Parcours complets et mobile | À faire | Persistance, ambiguïtés, erreurs et interactions vérifiées |
| 10. Déploiement Vercel | À faire | Adresse stable et démonstration reproductible |

Les essais vocaux dépendront de la route serveur protégée, même si sa finalisation
figure à l'étape 8 du cadrage.

Premier jalon fonctionnel : créer une note par conversation et la retrouver après
rechargement. Ce jalon n'est pas encore atteint.
