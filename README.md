# BananaNavy — Assistant vocal de notes

Une application web pour capturer une idée à la voix, la retrouver et la faire
évoluer. L’agent peut créer, rechercher, lire, modifier, mettre en corbeille et
restaurer une note. Les mêmes actions sont disponibles au clavier ou depuis
un simulateur local.

Projet test libre de voicebot IA : montrer une démarche complète, du besoin
à une démonstration utilisable, avec des choix techniques expliqués.

[Ouvrir la version de démonstration](https://project-bxwwf.vercel.app)
— gestion locale libre ; conversation protégée par un code personnel.
La disponibilité vocale dépend de la clé serveur, du quota et de la configuration.

![Interface de gestion des notes et conversation](docs/images/interface-deux-colonnes-ordinateur.jpg)

## Ce qui fonctionne

- Six outils partagés entre le simulateur et l’agent vocal.
- Création et édition manuelles, classement par catégorie et projet.
- Corbeille réversible et conservation après rechargement grâce à IndexedDB.
- Export/import JSON validé, sans écrasement des notes déjà présentes.
- Conversation en français, transcription temporaire et arrêt de session.
- Interface adaptée aux petites largeurs, messages d’état et commandes clavier.

Le parcours des six outils a été exercé vocalement sur ordinateur le
9 novembre 2026, avec persistance après rechargement. Les preuves et les essais
encore à réaliser sont dans le [guide de démonstration](docs/DEMONSTRATION.md).
L’audio sur téléphone physique reste à vérifier.

## Lancer le projet

Prérequis : Node.js **22.12 ou plus récent**, npm.

```bash
npm ci
npm run dev
```

Ouvrir l’adresse indiquée par Vite. La gestion locale et le simulateur ne demandent
ni clé API, ni compte, ni variable d’environnement.

```bash
npm test
npm run build
npm run preview
```

Les tests utilisent le lanceur Node. Le build produit `dist/` ; preview permet
de consulter cette compilation localement.

Pour servir aussi la route API en local :

```bash
npm run dev:api
```

Cette commande Linux utilise Vercel sur `http://127.0.0.1:3000` et force la voix
à rester désactivée (`503` attendu sur un POST vers la route de jeton).
Vite seul ne sert pas cette API. La configuration vocale et les variables serveur
sont décrites dans le [guide API](api/README.md) et [.env.example](.env.example).
Ne jamais préfixer un secret par `VITE_` ni l’ajouter à Git.

Un mode démo sans code est préparé sur `feature/acces-demo-sans-code`.
Il reste désactivé par défaut : seule la variable serveur
`VOICEBOT_ACCES_PUBLIC=true` l’active. Les tests locaux sont décrits dans le
[guide API](api/README.md#mode-démo-sans-code--10-novembre-2026).
Cette modification n’est pas encore déployée.

## Comment une demande devient une note

```text
Parole → agent ElevenLabs → outil exécuté dans le navigateur
       → validation des paramètres → action du store → transaction IndexedDB
       → mise à jour de l’interface → résultat renvoyé à l’agent
```

L’IA choisit un outil et ses paramètres. Le code local valide et réalise l’action.
Une réussite n’est renvoyée qu’après la sauvegarde. Le simulateur commence à
l’appel d’outil et réutilise le même parcours, sans consommer de minutes vocales.

Une route serveur distincte contrôle l’accès et demande le jeton de conversation :
la clé ElevenLabs reste côté serveur. Cette route ne transporte ni notes ni audio.
Les échanges et les notes transmis à l’agent passent par ElevenLabs via le SDK.

## Choix techniques

| Élément | Rôle et raison du choix |
| --- | --- |
| React + Vite, JavaScript/JSX | Construire une interface en composants et avancer avec un outillage simple |
| Context + useReducer | Partager les notes et séparer les transitions d’état des opérations asynchrones |
| IndexedDB native | Conserver des données structurées dans le navigateur, sans base distante |
| SDK React ElevenLabs | Gérer la conversation et brancher les six outils locaux |
| Fonction serveur Vercel | Obtenir un jeton sans exposer la clé API dans le navigateur |
| Tests Node | Vérifier logique métier, contrats des outils et accès au jeton sans réseau réel |

Le [dossier de démarche](docs/DEMARCHE.md) explique les décisions réellement
prises. Il ne prétend pas à des comparaisons ou essais qui n’ont pas eu lieu.

## Lire le code et préparer l’oral

| Besoin | Document |
| --- | --- |
| Comprendre les fichiers et les fonctions | [Guide du code](docs/CODE.md) |
| Préparer le récit, le minutage et les questions | [Préparation de présentation](docs/PRESENTATION.md) |
| Faire la démo et prévoir un secours | [Démonstration](docs/DEMONSTRATION.md) |
| Comprendre les six outils | [Contrats des outils](docs/OUTILS.md) |
| Configurer et protéger la voix | [Guide API](api/README.md), [agent ElevenLabs](docs/AGENT-ELEVENLABS.md) |
| Approfondir le fonctionnement local | [Store](docs/STORE.md), [sauvegardes](docs/SAUVEGARDES.md), [interface](docs/INTERFACE.md) |
| Suivre les décisions et validations | [Démarche](docs/DEMARCHE.md), [journal](docs/JOURNAL.md), [suivi](docs/SUIVI.md) |
| Retrouver les explications détaillées de l’ancien README | [Référence technique](docs/REFERENCE-TECHNIQUE.md) |

## Limites à expliquer

Les notes appartiennent au navigateur, à l’appareil et à l’origine du site :
aucune synchronisation entre appareils ou onglets. Effacer les données du
navigateur peut les supprimer ; l’export fournit une sauvegarde manuelle.
L’application doit être ouverte pour exécuter les outils locaux.

La voix nécessite Internet et un accès ElevenLabs disponible. Les arrêts locaux
(deux minutes, inactivité, page masquée) limitent les sessions, sans constituer
un plafond global de dépenses. Le code personnel protège une démonstration
privée ; il ne remplace pas un système de comptes pour un produit public.

Ambiguïtés entre notes, classement vocal, contenu hostile et panne réelle de
stockage pendant une conversation restent à valider vocalement. Les tests
automatisés et les contrôles de largeur ne couvrent pas tous ces cas.

Les commits, push, PR et fusions restent réalisés par le porteur du projet.
Les modifications se préparent sur une branche dédiée, puis sont intégrées
selon le circuit du projet : branche de travail → `dev` → `main`.

### Suppression définitive

Dans la corbeille, l’utilisateur peut supprimer une note définitivement ou vider
la corbeille entière. Chaque action demande confirmation et efface les notes du
stockage local ; elle est irréversible. Les notes actives restent conservées.
Ces commandes sont réservées à l’interface : le voicebot peut uniquement mettre
en corbeille et restaurer. Une sauvegarde JSON déjà exportée reste inchangée.
