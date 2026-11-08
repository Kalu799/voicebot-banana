# ElevenLabs — application au voicebot de notes

Étude du 5 novembre 2026. Tarifs publics en USD hors taxes, hors promotions. Aucun abonnement ou service payant activé. Il s'agit d'un cadrage : aucun code applicatif n'est présent dans ce dossier au moment de l'étude.

## Projet retenu

Cadrage repris du chat « Définir l’assistant vocal de notes » : React + Vite, Context/useReducer, IndexedDB, agent ElevenLabs avec SDK React et client tools, fonction Vercel pour fournir un jeton de conversation. Création, recherche, lecture, modification, corbeille et restauration des notes. Pas de stockage audio original dans le premier périmètre.

## Les unités à distinguer

- Le jeton de connexion authentifie une session : ce n'est pas une unité de facturation.
- Les tokens LLM correspondent au texte traité par le modèle : consignes, historique, définitions/résultats des outils, réponses. Les entrées et sorties ont des tarifs propres au modèle.
- ElevenCreative conserve une présentation en crédits ; ne pas convertir son quota en minutes d'agent à partir du nombre de caractères TTS.
- La page ElevenAPI présente désormais une facturation en dollars selon le produit, et ElevenAgents des minutes de conversation avec le LLM en supplément. Certaines pages d'aide parlent encore de crédits ou d'abonnements historiques : vérifier les conditions effectivement affichées dans le compte.

## Option retenue : agent conversationnel

La page ElevenAgents affiche 15 minutes gratuites, Starter à 6 USD/mois pour 75 minutes, Creator à 22 USD/mois pour 275 minutes. Le tarif additionnel annoncé est de 0,08 USD/minute, avec coûts LLM séparés. STT et TTS font partie de la prestation agent : ne pas les additionner une deuxième fois pour cette même conversation.

Source : https://elevenlabs.io/pricing/agents

La durée correspond à la connexion, pas seulement à la parole de l'utilisateur. L'aide annonce une remise de 95 % sur les périodes de silence de plus de dix secondes ; ne pas en dépendre pour le budget initial.

Source : https://elevenlabs.io/docs/help-center/product/eleven-agents/how-much-does-eleven-agents-cost

Le coût LLM est transmis séparément, sans majoration annoncée. Il dépend des tokens réellement traités et du modèle choisi.

Source : https://elevenlabs.io/docs/eleven-agents/customization/llm

### Simulations personnelles

Hypothèse : 30 jours d'utilisation, sans remise de silence, avec achat des dépassements autorisé. Le coût LLM, les taxes et l'hébergement sont exclus.

| Usage | Minutes/mois | Exemple de budget voix |
|---|---:|---:|
| 2 min/jour | 60 | Starter : 6 USD |
| 5 min/jour | 150 | Starter + 75 min : 12 USD |
| 10 min/jour | 300 | Creator + 25 min : 24 USD |

Formule : abonnement + max(0, minutes utilisées − minutes incluses) × tarif additionnel + coût LLM. Les dépassements ne sont pas à supposer automatiquement actifs.

Pour chiffrer le LLM après sélection : tokens d'entrée / 1 000 000 × prix d'entrée + tokens de sortie / 1 000 000 × prix de sortie, avec traitement distinct du cache si applicable. Relever les coûts réels sur une dizaine de conversations représentatives avant de fixer le budget mensuel.

## Variante pour la dictée longue

Les tarifs API affichés sont : Scribe v2 à 0,22 USD/heure d'audio, Scribe v2 Realtime à 0,39 USD/heure et Flash/Turbo à 0,04 USD pour 1 000 caractères de voix générée. Les options de transcription peuvent ajouter des frais.

Source : https://elevenlabs.io/pricing/api

La transcription facture aussi les silences contenus dans l'audio transmis. Le VAD qui déclenche une transcription finale ne constitue pas une économie automatique sur la durée envoyée.

Sources :
- https://elevenlabs.io/docs/overview/capabilities/speech-to-text
- https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/transcripts-and-commit-strategies

Exemple calculé : 100 notes de trois minutes = cinq heures. Transcription seule : 1,10 USD en différé, 1,95 USD en direct. Une confirmation générée de 100 caractères par note ajoute 0,40 USD avec Flash/Turbo. Ajouter le LLM de classement/résumé et les éventuels frais fixes du compte. Ce mode exige notre propre orchestration ; il ne remplace pas à lui seul l'assistant qui recherche et modifie les notes à l'oral.

## Application au développement

1. Garder ElevenAgents pour le premier jalon déjà choisi : créer une note par conversation et la retrouver après rechargement. Tester avec le quota gratuit, puis Starter si les essais conviennent.
2. Démarrer la connexion uniquement sur action explicite et la fermer avec le bouton Arrêter, à la fermeture de la vue et après une période d'inactivité adaptée. Afficher la durée de session.
3. Demander des confirmations orales courtes. Lire le contenu intégral seulement à la demande.
4. Faire les recherches dans IndexedDB. Retourner quelques identifiants, titres et extraits ; charger le contenu d'une note seulement via lire_note. Ne pas envoyer toute la bibliothèque à chaque tour.
5. Attendre la réussite des client tools avant de confirmer une sauvegarde. Éviter les appels répétés et rendre les créations résistantes aux répétitions d'une requête.
6. Garder la clé côté serveur, protéger la route de jetons et limiter sa fréquence. Distinguer le compteur local indicatif du relevé de facturation fournisseur.
7. Relever durée, modèle, consommation LLM et coût réel sur les premiers essais. Configurer les limites de dépenses disponibles dans le compte avant d'autoriser les dépassements.
8. Envisager ensuite un mode Dictée séparé pour les notes longues, connecté à Scribe puis à un seul traitement de structuration. Ne pas payer simultanément Scribe et une session agent ouverte pour ce même enregistrement.

Décision proposée : conserver l'architecture conversationnelle validée, prévoir une enveloppe initiale de 6 à 15 USD/mois pour usage léger, à confirmer avec les coûts LLM observés. Le mode dictée économique reste une extension ultérieure.
