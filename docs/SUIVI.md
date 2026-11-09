# Suivi des tâches et jalons

| Étape | État | Critère de réussite |
| --- | --- | --- |
| 1. Initialiser React + Vite et préparer le dossier API | Terminé | Installation et compilation réussies, page accessible localement (HTTP vérifié) |
| 2. Définir le modèle de note | Terminé | Champs, règles et exemples documentés ; création, valeurs initiales et refus des titres vides vérifiés avec Node |
| 3. Stockage IndexedDB et export/import | Terminé | Services et commandes d'interface vérifiés : persistance, JSON téléchargé, restauration, validation et conflits |
| 4. Store Context + useReducer | Terminé | Chargement, création, modification, corbeille et import avec actualisation vérifiés ; erreurs et besoin de rechargement gérés |
| 5. Interface minimale et simulation | Terminé | Gestion manuelle, export/import et six outils depuis le simulateur vérifiés ; paramètres invalides et persistance contrôlés |
| 6. Agent ElevenLabs français | Parcours principal validé | Consignes françaises, voix et outils exercés ; ambiguïtés et cas limites encore à vérifier |
| 7. Client tools | Terminé pour le parcours principal | Six outils déployés et exercés vocalement ; persistance après modification et restauration vérifiée |
| 8. Route serveur protégée | Terminé sur le domaine principal | Refus `401`, limitation `429`, jeton `200` et connexion audio réels vérifiés ; clé côté serveur |
| 9. Parcours complets et mobile | En cours | Parcours vocal principal et disposition à 390 px vérifiés ; ambiguïtés, pannes réelles et téléphone physique à faire |
| 10. Déploiement Vercel | Version de test validée | Commit `1667550` Ready en Production, quatre vues et note conservée vérifiées ; six outils vocaux exercés avant la refonte ; livraison sur `main` à préparer |

Le [guide agent](AGENT-ELEVENLABS.md) conserve les réglages, le contrat des outils,
les scénarios et les limites. Les six définitions distantes sont associées à l’agent
et déclarées dans `@elevenlabs/react@1.21.1`.

Le 9 novembre 2026, le parcours principal est exercé sur
[le domaine de test](https://project-bxwwf.vercel.app) :

- Première création : « Test vocale Banana Navy », contenu « Présenter le projet »,
  conversation arrêtée après 17 secondes, note conservée après rechargement.
- Après PR n° 5 et déploiement du commit `798641d` à 11 h 04, conversation de
  50 secondes : recherche, lecture, ajout de trente secondes puis remplacement
  par une minute. Texte initial préservé, persistance après rechargement vérifiée.
- Nouvelle conversation de 30 secondes : mise en corbeille puis restauration,
  compteurs confirmés par l’utilisateur. Note restaurée et contenu conservés
  après rechargement, Mes notes (1), Corbeille (0).
- Disposition à 390 × 844 px inspectée : une colonne sans débordement horizontal,
  formulaire d’édition ouvert puis annulé. Code mal formé et code fictif au bon
  format refusés, sans session vocale. Cela ne valide pas un téléphone physique.

Le scénario reprend les actions prévues sur la note de test existante, avec un
titre différent de l’idée de vidéo initiale. Aucun nouveau test de création pour
changer ce titre. Captures conservées dans `docs/images/validation-vocale-*.jpg`.

La [route protégée](../api/README.md) a été contrôlée : `401` sans code,
`429` par le pare-feu, jeton `200` avec code valide puis conversation WebRTC réelle.
Limitation Vercel : deux demandes/minute/IP ; agent : cinq appels/jour, un simultané,
120 secondes maximum. Compte Free et recharge automatique désactivée contrôlés
avant les essais ; plafond de clé 2 000 crédits et expiration après un jour.
La clé nécessite ElevenAgents Écrire (`convai_write`). Secrets exclusivement
serveur, Production ouverte, Preview/Development et fichier local fermés.

Tests existants et compilation réussis pour le code livré ; aucun code applicatif
modifié pendant cette validation. Avertissement Vite sur le poids du bundle,
écart Node local/Vercel et signalements des dépendances de développement restent
documentés, avec traitement exhaustif reporté. Les contrôles SDK de délais et
interruptions sur banc temporaire restent distincts des tests Node du dépôt.

Pour clôturer la livraison : intégrer cette documentation dans `dev`, puis
fusionner `dev` vers `main` et contrôler le déploiement automatique. Le guide de
démonstration et le secours par simulateur sont prêts. Prévoir le renouvellement
de la clé d’essai pour conserver la voix après expiration.

Essais complémentaires non tous réalisés : ambiguïtés entre notes, classement
vocal, contenu hostile, panne réelle pendant une conversation, microphone et
interruptions sur téléphone physique. Ils restent des limites documentées de
cette V1 de démonstration ; le test audio mobile est reporté pour préserver les crédits.

Le [guide de démonstration](DEMONSTRATION.md) propose les consignes, critères de
réussite, preuves et secours sans voix. Le 9 novembre, le test audio sur téléphone
physique est reporté à la demande de l’utilisateur pour préserver les crédits.
Seule la disposition mobile est vérifiée ; aucun nouvel appel vocal pour ce guide.

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
rechargement. **Jalon atteint le 9 novembre 2026 à 10 h 49**, avant le point de
contrôle de 11 h 30. Objectif de livraison 16 h 30, limite absolue 17 h 30.

## Nouvelle disposition — validation locale puis publication

Branche `feature/interface-deux-colonnes` : conversation et transcription à gauche,
notes et navigation à droite (Mes notes, Corbeille, Ajouter une note, Sauvegarde).
Simulateur replié sous la conversation. Brouillons, retour aux notes après création,
corbeille, export/import et persistance vérifiés ; cinq largeurs de 320 à 1440 px
contrôlées sans débordement. Tests et build réussis, aucune nouvelle conversation
ElevenLabs. Après fusion de la PR n° 8, reconstruction en Production du commit
`1667550`, déploiement `2KQfJsLR3D7FDwZPUtQS292qH6zE` Ready à 11 h 50.
Les quatre vues et la conservation de « Test vocale Banana Navy », contenu
« Présenter le projet » puis « Durée prévue une minute. », sont vérifiées sur
le domaine principal après rechargement. Aucun appel vocal, aucune note modifiée
pendant ce contrôle. Voir [le guide](INTERFACE.md).

## Contrôle avant livraison — 9 novembre 2026

Revue du code et recette locale approfondie réalisées avant la refonte : 32 scénarios
Node réussis, compilation réussie, export/import sans écrasement, fichiers invalides
refusés, conflit d’édition sans perte de brouillon, texte HTML affiché comme texte,
corbeille et restauration persistantes. Banc SDK simulé : annulation et jeton tardif,
connexion trop longue, inactivité, durée maximale, erreur et sortie vérifiées.
Aucun crédit vocal consommé. Audit npm du même jour : zéro avis sur les dépendances
de production ; secrets locaux absents du bundle, des fichiers suivis et des 233
versions de fichiers examinées dans l’historique Git accessible à ce moment.

Après la refonte, tests et compilation à nouveau réussis, parcours de navigation,
brouillons, corbeille et sauvegardes vérifiés sur la compilation locale. Aucun
problème bloquant identifié pour le périmètre démonstration. Cela ne valide pas
les essais complémentaires listés plus haut. Poids du bundle, alignement Node et
avis des dépendances de développement restent différés.
