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
