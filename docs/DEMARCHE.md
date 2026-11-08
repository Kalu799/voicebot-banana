# Démarche du projet

## Besoin retenu

Créer une application personnelle de notes pilotée à la voix, utilisable comme
projet de présentation et de portfolio. Les décisions initiales sont conservées
dans [PROJET.md](../../PROJET.md). Les autres idées et comparaisons ne sont pas
reconstituées sans traces disponibles.

## Décisions de départ

La stack React, Vite, Context/useReducer, IndexedDB, ElevenLabs et Vercel est retenue
dans le cadrage. L'étude vocale existante est accessible dans
[ELEVENLABS-COUTS.md](../../ELEVENLABS-COUTS.md).

Le 8 novembre 2026, la base est initialisée en JavaScript avec JSX. Ce choix permet
de commencer avec des composants simples et de limiter les notions à introduire.
TypeScript n'a pas fait l'objet d'un essai comparatif à cette étape.

La logique de notes et un mode de simulation seront développés avant les essais
vocaux pour limiter l'utilisation du quota gratuit.

## Méthode

Pour chaque étape : annoncer l'objectif et les fichiers, présenter et expliquer
le code avant sa mise en place, l'intégrer, vérifier et corriger, puis poursuivre.
Commenter en français les intentions et les mécanismes moins évidents.

Mettre à jour le README, le journal et le suivi au fil de l'avancement. Distinguer
ce qui est prévu, documenté, essayé et validé. Garder des exemples sans données
personnelles pour la démonstration.

## Source consultée

- [Guide officiel Vite](https://vite.dev/guide/), consulté le 8 novembre 2026 :
  structure de projet, commandes et prérequis Node.js.
