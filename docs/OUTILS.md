# Couche commune des outils de notes

## Objectif et fichiers

`src/services/notesTools.js` expose `creerOutilsNotes(store)`. Cette fonction
construit les six outils utilisés par le simulateur puis les futurs client
tools ElevenLabs. Elle ne dépend ni du SDK ni du microphone et ne réalise aucun
appel réseau. Le panneau est documenté dans [SIMULATION.md](SIMULATION.md).

`src/utils/rechercheNotes.js` contient la recherche et la lecture pures. Le provider
expose désormais `obtenirNotes()` : cette action attend les opérations précédentes
et renvoie une copie des dernières notes sauvegardées. Les outils évitent ainsi
une capture périmée de `store.notes` avant le prochain rendu React.

## Contrat des six outils

| Outil | Paramètres |
| --- | --- |
| `creer_note` | `titre` obligatoire ; `contenu`, `categorie`, `projet` facultatifs, tous textuels |
| `chercher_notes` | `texte`, `categorie`, `projet` facultatifs ; `corbeille` booléen ; `limite` entier de 1 à 20 |
| `lire_note` | `id` textuel non vide |
| `modifier_note` | `id` et objet `changements` contenant uniquement les champs éditables |
| `supprimer_note` | `id` textuel non vide |
| `restaurer_note` | `id` textuel non vide |

Les paramètres doivent être un objet simple. Les champs inconnus, valeurs de
mauvais type, titres vides à la création et identifiants vides sont refusés avant
tout appel au store. Les champs protégés (`id`, dates, état de corbeille) ne
peuvent pas être fournis dans `changements`. Un titre modifié doit rester non vide.
Une modification vide conserve le comportement sans effet du store.

Les autres règles métier restent celles du store : identifiant introuvable,
modification en corbeille refusée et sauvegarde avant confirmation. Les outils
ne recherchent jamais une cible par titre pour effectuer une mutation. Si une
recherche retourne plusieurs notes possibles, le futur agent devra demander
une précision et utiliser un identifiant.

## Recherche et lecture

Par défaut, `chercher_notes` sélectionne les notes actives et renvoie au maximum
cinq résultats. Avec `corbeille: true`, il sélectionne uniquement les notes
supprimées. Il renvoie aussi `total`, le nombre de correspondances avant limitation.

La recherche retire les accents et ignore la casse ainsi que les espaces
périphériques. Tous les termes de `texte` doivent apparaître dans l'ensemble
titre/contenu/catégorie/projet, éventuellement dans des champs différents. Il
s'agit d'une recherche de sous-chaînes, sans interprétation par un modèle.

Les filtres catégorie et projet sont exacts après normalisation, cumulables avec
le texte. Un filtre vide ou composé d'espaces est ignoré. Les résultats sont
triés par `updatedAt` décroissant, sans modifier l'ordre du store.

Chaque résultat contient `id`, `titre`, un `extrait` limité aux 160 premières
unités UTF-16 du contenu, le classement et les dates utiles. Le contenu intégral
est réservé à `lire_note`. La lecture par identifiant peut également consulter
une note en corbeille, identifiable par son `deletedAt` non nul. Elle renvoie une
copie indépendante de la note.

## Résultats

Un résultat réussi commence par `succes: true`. Les mutations renvoient un résumé :

```js
{
  succes: true,
  note: { id, titre, categorie, projet, updatedAt, deletedAt },
}
```

La recherche renvoie `{ succes: true, total, notes }`, et la lecture
`{ succes: true, note }` avec tous les champs de la note. Aucun contenu complet
n'est renvoyé par une mutation.

Une erreur de paramètres, de règle métier ou de stockage devient :

```js
{ succes: false, erreur: 'Message compréhensible' }
```

Les outils attendent la fin des actions du store avant de renvoyer un succès.
Les erreurs techniques non standard conservent un message générique ; la cause
et la pile ne sont pas incluses dans le résultat destiné au futur agent.

## Branchement au simulateur

Dans un composant React, le point d'accès sera :

```jsx
const store = useNotes()
const outils = creerOutilsNotes(store)

// À appeler depuis un événement du simulateur.
const resultat = await outils.creer_note({
  titre: 'Idée de vidéo BananaNavy',
  contenu: 'Durée : trente secondes.',
})
```

Cette couche est branchée à `ToolsSimulator.jsx`. Les
identifiants d'appel et la déduplication des créations répétées par l'agent seront
à traiter lors de l'intégration vocale : deux appels distincts à `creer_note`
créent actuellement deux notes.

## Vérifier

```bash
npm test
npm run build
```

Les tests persistants `tests/notesTools.test.js` utilisent le lanceur Node intégré,
sans dépendance ajoutée. Ils couvrent huit scénarios : recherche normalisée,
limites/extraits, lecture indépendante, parcours des six outils, titres identiques,
validation des enveloppes, validation des champs et confirmation après sauvegarde.
Le store y est contrôlé en mémoire ; ces tests n'utilisent pas IndexedDB.

Des essais d'intégration ponctuels ont aussi été exécutés dans le navigateur
intégré sur une origine locale dédiée, avec les modules réels, React en mode
développement et IndexedDB. Le scénario vérifie les six outils, la lecture via
un accès au store capturé avant création, les copies indépendantes, les filtres,
la corbeille et la restauration. Une transaction d'écriture annulée donne un
échec structuré sans changement de contenu, puis la lecture suivante fonctionne.
La relecture après rechargement retrouve les données. Les anciens parcours du
store ont aussi été exécutés par ce banc temporaire.

Deux corrections ont été obtenues grâce aux tests : ignorer un filtre composé
d'espaces et garantir un message d'erreur même pour un rejet non standard.
La voix et le SDK ElevenLabs restent à intégrer ; le panneau de simulation est présent.
