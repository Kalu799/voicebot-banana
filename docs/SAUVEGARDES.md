# Sauvegardes JSON

## Responsabilités

- `src/services/notesBackup.js` prépare et lit les fichiers, puis valide leur contenu.
- `src/services/notesStorage.js` accède à IndexedDB. Sa fonction `fusionnerNotes`
  vérifie les identifiants locaux et ajoute les notes absentes dans une transaction.
- L'interface permettra plus tard de télécharger le fichier et de choisir celui
  à importer. Le service peut déjà être utilisé depuis la console du navigateur.

La version du format de sauvegarde est indépendante de la version de la base.
Le fichier inclut les notes actives et celles de la corbeille.

## Format et règles

```json
{
  "version": 1,
  "exportedAt": "2026-11-08T12:00:00.000Z",
  "notes": [
    {
      "id": "1aa591dc-271a-42ab-859e-ef63d67c393d",
      "titre": "Idée de vidéo",
      "contenu": "Présenter BananaNavy.",
      "categorie": "Idée",
      "projet": "BananaNavy",
      "createdAt": "2026-11-08T11:00:00.000Z",
      "updatedAt": "2026-11-08T11:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

`version` doit être le nombre `1`. `exportedAt` doit être une date ISO UTC au
format produit par `toISOString()` ; `notes` doit être un tableau, éventuellement
vide.

Pour chaque note :

- `id`, `titre`, `contenu`, `categorie` et `projet` doivent être des chaînes.
- `id` et `titre` ne doivent pas être vides ou composés uniquement d'espaces.
- `createdAt` et `updatedAt` doivent être des dates ISO UTC canoniques.
- `deletedAt` doit être `null` ou une date au même format.
- Un identifiant ne doit pas apparaître plusieurs fois dans le fichier.

Les valeurs sont conservées sans recréer la note via `creerNote` : cela préserve
son identifiant, ses dates et son texte. Les propriétés supplémentaires sont
écartées. La même validation est appliquée à l'export pour éviter de produire
un fichier impossible à réimporter si la base contient une note mal formée.

## Fusion sans écrasement

Si un identifiant existe déjà dans IndexedDB, la note locale est conservée dans
son intégralité, qu'elle soit active ou dans la corbeille. Aucune comparaison
automatique des dates n'est effectuée. Un même titre avec un autre identifiant
correspond à une autre note et peut être ajouté.

Le résultat `{ importees: 2, ignorees: 1 }` signifie que deux notes ont été ajoutées
et qu'une note du fichier existait déjà localement. Réimporter le même fichier
n'ajoute pas de doublons. Un import vide renvoie deux compteurs à zéro.

La validation de toutes les notes précède l'accès à la base. La vérification des
identifiants locaux et les ajouts sont ensuite effectués dans la même transaction
`readwrite`. Aucun succès n'est renvoyé avant sa fin. Une erreur annule tous les
ajouts de l'import, en conservant les notes précédemment présentes.

## Essayer dans la console

Démarrer `npm run dev` et ouvrir l'application dans le navigateur. Les chemins
`/src/` ci-dessous fonctionnent avec le serveur Vite de développement.

Créer le fichier en mémoire et consulter son contenu :

```js
const { exporterNotes, importerNotes } = await import('/src/services/notesBackup.js')
const fichierSauvegarde = await exporterNotes()
console.log(fichierSauvegarde.name)
console.log(await fichierSauvegarde.text())
```

Pour le télécharger manuellement depuis cette console :

```js
const urlSauvegarde = URL.createObjectURL(fichierSauvegarde)
const lienSauvegarde = document.createElement('a')
lienSauvegarde.href = urlSauvegarde
lienSauvegarde.download = fichierSauvegarde.name
document.body.append(lienSauvegarde)
lienSauvegarde.click()
lienSauvegarde.remove()
setTimeout(() => URL.revokeObjectURL(urlSauvegarde), 1000)
```

Vérifier la réimportation du même fichier en mémoire :

```js
console.log(await importerNotes(fichierSauvegarde))
```

Comme les notes existent déjà, le résultat doit indiquer zéro note importée et
autant de notes ignorées que de notes exportées. L'export vide est aussi valide.
Pour une restauration depuis le disque, le futur sélecteur de fichier fournira
un objet `File` à cette même fonction `importerNotes`.

## Vérifications du 8 novembre 2026

Essais automatisés ponctuels dans Chrome sans interface, avec un profil isolé,
une origine locale temporaire et une copie des modules du projet :

- Fichier JSON avec nom daté, métadonnées et export vide valides.
- Export puis réimport dans une base vidée pour l'essai : contenu avec accents
  et retours à la ligne, identifiants, dates et corbeille conservés.
- Réimport sans doublon et conservation d'une modification locale.
- Fichiers JSON invalides, versions inconnues, champs manquants ou de mauvais
  type, dates invalides et identifiants répétés refusés avant ouverture de la base.
- Erreur de lecture du fichier propagée avec sa cause.
- Import vide accepté et propriétés inconnues écartées.
- Échecs synchrones, erreur de contrainte IndexedDB et annulation après des ajouts
  réussis : aucun ajout partiel conservé et notes locales inchangées.
- Deux imports simultanés du même fichier sans doublon.
- Notes importées retrouvées après fermeture/réouverture du navigateur et
  rechargement ; nouvel export identique aux notes attendues.

La compilation et la syntaxe des modules ont aussi été vérifiées. Ces essais
n'utilisent pas les données du navigateur habituel. Le téléchargement depuis
un bouton, le sélecteur de fichier, l'épuisement réel du quota et les autres
navigateurs restent à vérifier.
