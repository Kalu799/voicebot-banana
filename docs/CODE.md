# Comprendre le code de BananaNavy

Ce guide accompagne les commentaires français dans les fichiers. Lire d’abord
le parcours ci-dessous, puis les fonctions concernées ; le journal conserve
l’historique, ce document décrit les responsabilités actuelles.

## Ordre de lecture conseillé

1. `src/main.jsx` puis `src/App.jsx` : démarrage, providers et interface.
2. `src/utils/note.js` : règles d’une note, sans React ni stockage.
3. `src/services/notesStorage.js` : transactions IndexedDB.
4. `src/stores/NotesProvider.jsx` et `notesReducer.js` : coordination et état partagé.
5. `src/services/notesTools.js` : contrat commun de l’agent et du simulateur.
6. `ConversationNotesProvider.jsx`, `ConversationPanel.jsx` puis la route serveur.

## Trois sortes de données à distinguer

| Donnée | Emplacement | Durée et usage |
| --- | --- | --- |
| Brouillon, vue, confirmations, transcription | État local des composants React | Temporaire ; disparaît au rechargement |
| Notes affichées | État du reducer dans NotesProvider | Partagé par l’interface ; reconstruit depuis IndexedDB |
| Dernières notes sauvegardées | Ref `notesCourantes` du provider | Lisibles immédiatement par les actions, avant le rendu suivant |
| Notes persistantes | IndexedDB, base `voicebot`, magasin `notes` | Conservées pour cette origine et ce navigateur |
| Clé API et empreinte du code | Environnement serveur | Utilisées uniquement par la route de jeton |
| Code saisi et jeton de conversation | Mémoire du parcours de connexion | Pas de stockage durable dans l’application |

Une ref reste disponible entre deux rendus sans provoquer elle-même un rendu.
Le state sert à afficher. Le reducer calcule un nouvel état ; `dispatch` lui
transmet une action. Une promesse permet d’attendre la fin d’une opération avec
`await`. Une transaction regroupe des opérations de base qui réussissent ou
sont annulées ensemble.

## Exemple complet : « Crée une note Idée de vidéo »

1. `demarrer` demande un jeton à la route serveur, puis ouvre la conversation SDK.
2. L’agent interprète la demande et appelle `creer_note` avec un titre.
3. Le hook enregistré par `OutilsConversationNotes` reçoit cet appel.
4. `resultatPourAgent` appelle l’outil de `creerOutilsNotes`.
5. L’enveloppe `outil` vérifie les clés ; le traitement vérifie les textes.
6. `ajouterNote` entre dans la file `executerAction` du store.
7. `creerNote` construit l’objet avec UUID et dates ; `enregistrerNote` fait le `put`.
8. La transaction IndexedDB se termine : l’état courant puis le reducer sont mis à jour.
9. L’outil renvoie un résumé avec `succes: true`, sérialisé pour l’agent.
10. L’agent peut annoncer le résultat ; React affiche la note lors du rendu.

La sauvegarde précède à la fois la mise à jour de l’état et le résultat de succès.
L’affichage effectif et la réponse vocale dépendent ensuite de React et du SDK.
Si l’écriture échoue, le store propage l’erreur ; l’outil retourne `succes: false`.

## Règles métier — `src/utils/note.js`

Ces fonctions calculent des objets ; elles ne sauvegardent rien.

| Fonction | Entrée → résultat | Règle importante |
| --- | --- | --- |
| `creerNote` | Champs texte → note complète | Titre obligatoire nettoyé ; contenu préservé ; UUID ; deux dates identiques ; active |
| `preparerChangementsEdition` | Valeurs d’ouverture + brouillon → champs changés | N’envoie pas les champs intacts, pour ne pas écraser une mise à jour récente |
| `preparerModification` | Note courante + changements + valeurs initiales facultatives → note | Refuse champs interdits, titre vide, corbeille et conflits détectés |
| `preparerSuppression` | Note → note en corbeille | Renseigne deletedAt ; conserve identité et contenu |
| `preparerRestauration` | Note → note active | Efface deletedAt ; conserve contenu et identité |

Une opération sans changement réel renvoie le même objet : le store reconnaît
qu’il peut éviter une écriture et conserver updatedAt.

Exemple de conflit : j’ouvre un formulaire, la voix change ensuite le contenu,
puis je modifie seulement le titre. Seul le titre est envoyé, le nouveau contenu
reste intact. Si je modifie aussi l’ancien contenu, le store refuse le conflit
et le brouillon reste disponible. Cette protection concerne les actions de ce
provider ; elle ne constitue pas une synchronisation entre onglets.

## Recherche — `src/utils/rechercheNotes.js`

| Fonction | Rôle |
| --- | --- |
| `normaliser` | Retire les accents, uniformise la casse et nettoie les extrémités pour comparer |
| `chercherNotes` | Exige tous les termes, applique catégorie/projet exacts et choix actif/corbeille, trie par modification récente |
| `lireNote` | Retourne une copie complète par id ou lève une erreur si absente |

La recherche renvoie `total` avant limitation et une liste d’extraits de
160 caractères. Cinq résultats par défaut, vingt au maximum via les outils.
C’est une recherche textuelle, pas une recherche sémantique par embeddings.

## Persistance — `src/services/notesStorage.js`

| Fonction | Rôle et résultat |
| --- | --- |
| `ouvrirBase` | Ouvre/crée la base et renvoie sa connexion ; l’appelant doit la fermer |
| `enregistrerNote` | Ajoute/remplace une note entière avec `put`, attend la transaction ; pas de valeur de retour utile |
| `recupererNotes` | Lit toutes les notes, corbeille incluse, sans tri |
| `fusionnerNotes` | Ajoute seulement les ids absents dans une transaction ; renvoie les compteurs |
| `annuler` (interne à la fusion) | Annule la transaction et conserve la cause d’une erreur synchrone |

Les services ouvrent puis ferment leurs connexions dans un `finally`.
`onupgradeneeded` prépare le magasin lors de la première ouverture ; `onblocked`
signale un autre onglet bloquant une évolution ; `onversionchange` libère une
connexion devenue ancienne. Le succès d’une requête ne suffit pas : la transaction
entière doit se terminer avant de confirmer.

## Sauvegardes — `src/services/notesBackup.js`

| Fonction | Rôle |
| --- | --- |
| `estObjet` | Vérifie la forme objet non nul/non tableau |
| `estDateISO` | Vérifie une date ISO canonique, au format de toISOString |
| `validerSauvegarde` | Vérifie version, enveloppe, notes, dates et ids uniques ; retourne les seuls champs connus |
| `exporterNotes` | Lit et valide la base, renvoie un File JSON en mémoire, corbeille comprise |
| `importerNotes` | Lit un Blob/File, parse et valide tout le JSON avant fusion |

La version du format JSON est indépendante de la version IndexedDB. Un id déjà
présent localement est conservé intégralement ; l’import ne remplace jamais sa note.
Le composant, et non le service, déclenche le téléchargement.

## État partagé — `src/stores/`

`NotesContext` fournit le canal de partage ; `useNotes` expose le contexte et
refuse un appel hors provider. `NotesProvider` porte les effets asynchrones ;
`notesReducer` traite seulement les transitions d’état sans accès extérieur.

| Fonction du provider | Rôle |
| --- | --- |
| `charger` | Lecture initiale ; ignore les résultats après nettoyage de l’effet |
| `verifierDisponibilite` | Bloque une opération si les notes ne sont pas fiables/disponibles |
| `executerAction` | Sérialise les opérations, signale les erreurs, maintient la file après un échec |
| `obtenirNotes` | Attend les opérations précédentes et retourne des copies des dernières notes |
| `ajouterNote` | Construit, sauvegarde puis ajoute à l’état |
| `changerNote` | Factorise recherche par id, préparation métier, écriture et remplacement |
| `modifierNote` | Applique les champs transmis et les contrôles de conflit facultatifs |
| `supprimerNote` / `restaurerNote` | Appellent les préparations de corbeille via changerNote |
| `importerSauvegarde` | Importe puis relit dans la même file, actualise ou impose un rechargement |

`fileActions` est une chaîne de promesses. Deux commandes rapprochées travaillent
dans l’ordre sur la dernière note sauvegardée. La promesse renvoyée au demandeur
reste rejetée en cas d’erreur ; seule celle conservée pour poursuivre la file
absorbe ce rejet. Le système évite ainsi de bloquer les actions suivantes.

`rechargementRequis` signifie que l’état en mémoire ne peut plus être tenu pour
fiable. Cas important : import écrit mais relecture échouée. L’erreur porte alors
`importEnregistre` et `resultatImport` ; l’interface affiche les compteurs et
invite à recharger au lieu de prétendre que l’import a été annulé.

## Contrat des outils — `src/services/notesTools.js`

`validerObjet` refuse les clés non prévues et les objets non simples.
`validerTextes` vérifie types et champs requis. `resumerNote` limite les données
renvoyées après mutation. `outil` transforme le résultat ou l’exception en contrat
commun. `creerOutilsNotes(store)` injecte les actions du store dans six fonctions :

| Outil | Paramètres | Résultat utile si succès |
| --- | --- | --- |
| `creer_note` | titre requis ; contenu/categorie/projet facultatifs | Résumé de la note sauvegardée |
| `chercher_notes` | texte/categorie/projet/corbeille/limite facultatifs | total et liste d’extraits |
| `lire_note` | id requis | Note complète |
| `modifier_note` | id et objet changements | Résumé après modification |
| `supprimer_note` | id requis | Résumé après mise en corbeille |
| `restaurer_note` | id requis | Résumé après restauration |

Toutes renvoient `{ succes: true, ... }` ou `{ succes: false, erreur }`.
Une erreur métier est donc un résultat explicite pour l’agent, pas une exception
non gérée. Les mutations ciblent l’id : un titre n’est pas une identité unique.
Le contenu complet est accessible via la lecture, pas systématiquement retransmis.

## Composants — `src/components/` et `src/App.jsx`

| Composant / fonctions | Responsabilité |
| --- | --- |
| `App` ; `afficherVue`, `terminerCreation` | Trie les vues, garde la conversation montée, affiche erreurs/confirmations et replace le focus après création |
| `NoteForm` ; `changerChamp`, `soumettre` | Garde brouillon et valeurs d’ouverture, appelle création/édition, ne vide qu’après succès |
| `NoteCard` ; `changerCorbeille` | Affiche une note, ouvre son édition, attend suppression/restauration |
| `NotesList` | Affiche une liste préparée ou le message vide ; garde des clés id stables |
| `NotesBackup` ; `commencer`, `terminer`, `exporter`, `importer`, `decrireImport` | Verrouille les opérations, demande un téléchargement, sélectionne un fichier et explique les compteurs |
| `ToolsSimulator` ; `changerOutil`, `executer` | Prépare l’exemple, parse le JSON et appelle les mêmes outils que la voix |

Les verrous refs empêchent des doubles clics avant même le prochain rendu.
Les flags state désactivent visuellement les commandes. `hidden` conserve les
panneaux montés et leurs brouillons ; le rechargement de page les efface.

## Conversation — pont SDK et panneau

Dans `ConversationNotesProvider`, `OutilsConversationNotes` enregistre les six
hooks avec les noms distants exacts. `resultatPourAgent` attend puis sérialise le
résultat. Le provider SDK entoure panneau et enregistrement pour partager la session.

Dans `ConversationPanel` :

| Fonction / callback | Rôle |
| --- | --- |
| `demarrer` | Verrouille la tentative, obtient le jeton puis appelle startSession |
| `arreter` | Invalide la tentative, annule la requête, ferme le SDK et efface le code |
| `onConnect` | Confirme la connexion et démarre les horloges |
| `onDisconnect` | Annule la tentative et revient au repos |
| `onError` | Arrête avec un message générique |
| `onMessage` | Ajoute au plus 40 messages temporaires et actualise l’activité |
| `onAudio` | Compte l’audio reçu comme activité |
| Effet de surveillance ; `quitter`, `masquer` | Arrête à la sortie, au masquage ou aux limites de temps et nettoie les écouteurs |

La demande de jeton a un délai de 15 s ; la phase de connexion est surveillée
à 30 s ; une session connectée est limitée localement à 120 s ou 30 s sans
message/audio reçu, avec vérification toutes les 500 ms. Ce mécanisme ne mesure
pas toute la parole de l’utilisateur et ne garantit pas un plafond de facturation.
L’identité de la tentative évite qu’un jeton reçu après un arrêt ouvre une session.

## Accès serveur — client, route et entrée Vercel

| Fonction | Responsabilité |
| --- | --- |
| `obtenirJetonConversation` (client) | Valide le format du code, POST de même origine avec Bearer, respecte l’annulation, extrait token et traduit les erreurs |
| `repondre` | Réponse JSON HTTP avec Cache-Control: no-store |
| `empreinte` | SHA-256 du code reçu |
| `accesAutorise` | Format Bearer strict et comparaison d’empreintes à temps constant |
| `creerRouteJeton` | Fabrique une route avec environnement et transport injectables pour les tests |
| `traiterDemande` | Vérifie méthode, activation, configuration, origine, code puis demande un jeton à ElevenLabs |
| `api/conversation-token.js` | Expose ce gestionnaire au runtime Vercel |

L’agent est fixé par le serveur. Le code personnel et la clé API sont deux choses
différentes : le navigateur fournit le premier ; seul le serveur emploie la seconde.
Le contrôle Origin est complémentaire, il ne prouve pas à lui seul une identité.
La règle de limitation Vercel est extérieure au code ; les tests de route ne
prouvent pas qu’une règle distante est actuellement appliquée.

## Où vérifier et où changer

| Besoin | Premier fichier à consulter |
| --- | --- |
| Modifier les règles d’une note | `src/utils/note.js` |
| Modifier la recherche | `src/utils/rechercheNotes.js` |
| Changer le contrat d’un outil | `src/services/notesTools.js` et configuration ElevenLabs à garder cohérente |
| Changer la coordination ou les erreurs | `src/stores/NotesProvider.jsx` |
| Faire évoluer le format JSON | `src/services/notesBackup.js` et guide SAUVEGARDES |
| Changer les limites locales de session | `src/components/ConversationPanel.jsx` |
| Modifier la protection du jeton | `server/routeJeton.js` et configuration Vercel |

Les tests Node du dépôt vérifient l’édition, les outils/recherche et les accès
client/serveur au jeton avec transports simulés. Le provider, IndexedDB réel,
l’interface et la conversation réelle demandent les contrôles navigateur décrits
dans les guides. Une compilation réussie ne remplace pas ces essais.
