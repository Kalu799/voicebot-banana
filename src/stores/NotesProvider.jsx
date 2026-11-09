import { useEffect, useReducer, useRef } from 'react'
import {
  creerNote,
  preparerModification,
  preparerSuppression,
  preparerRestauration,
} from '../utils/note.js'
import { enregistrerNote, recupererNotes, effacerNotesEnCorbeille } from '../services/notesStorage.js'
import { importerNotes } from '../services/notesBackup.js'
import { NotesContext } from './NotesContext.js'
import { etatInitialNotes, notesReducer } from './notesReducer.js'

/**
 * Coordonne l’état partagé et la persistance pour toute l’application.
 * Les écritures sont séquentielles et précèdent les mises à jour React. Les refs
 * conservent la dernière version sauvegardée entre deux rendus ; le reducer
 * fournit la version affichée. La file ne synchronise pas plusieurs onglets.
 */
export function NotesProvider({ children }) {
  const [etat, dispatch] = useReducer(notesReducer, etatInitialNotes)
  const chargementReussi = useRef(false)
  // Dernière version sauvegardée, disponible même avant le prochain rendu React.
  const notesCourantes = useRef([])
  // Chaque nouvelle opération attend cette promesse : pas de chevauchement
  // entre les actions de ce provider, qu’elles viennent de la voix ou de l’interface.
  const fileActions = useRef(Promise.resolve())

  useEffect(() => {
    let ignore = false

    /**
     * Lit toutes les notes au montage. Ignore le résultat si cet effet a été nettoyé
     * entre-temps ; un échec laisse les actions bloquées jusqu’au rechargement.
     */
    async function charger() {
      try {
        const notes = await recupererNotes()

        if (!ignore) {
          notesCourantes.current = notes
          chargementReussi.current = true
          dispatch({ type: 'NOTES_CHARGEES', notes })
        }
      } catch (cause) {
        if (!ignore) {
          dispatch({ type: 'CHARGEMENT_ECHOUE', message: cause.message })
        }
      }
    }

    charger()

    // Ignore une lecture devenue obsolète, notamment avec StrictMode.
    return () => {
      ignore = true
      chargementReussi.current = false
    }
  }, [])

  /**
   * Refuse les opérations avant une lecture initiale réussie ou après une relecture
   * échouée. Évite de travailler sur une bibliothèque vide ou périmée par erreur.
   */
  function verifierDisponibilite() {
    if (!chargementReussi.current) {
      throw new Error(
        'Les notes ne sont pas disponibles. Rechargez la page pour les charger.',
      )
    }
  }

  /**
   * Ajoute une opération à la file et renvoie sa promesse au demandeur.
   * Revérifie la disponibilité au moment de l’exécution, affiche les erreurs dans
   * le store et les propage aussi à l’appelant. La file continue après un échec.
   */
  async function executerAction(operation) {
    verifierDisponibilite()

    const execution = fileActions.current.then(async () => {
      verifierDisponibilite()
      dispatch({ type: 'ERREUR_EFFACEE' })

      try {
        return await operation()
      } catch (cause) {
        if (chargementReussi.current) {
          dispatch({ type: 'ERREUR_ACTION', message: cause.message })
        }

        throw cause
      }
    })

    // Une action échouée ne bloque pas les tentatives suivantes.
    fileActions.current = execution.catch(() => {})
    return execution
  }

  /**
   * Renvoie une promesse de copies des dernières notes sauvegardées, corbeille
   * comprise, après les opérations déjà en file. Les outils évitent ainsi de lire
   * un ancien rendu React ou de modifier directement les objets du store.
   */
  function obtenirNotes() {
    // La lecture attend les actions précédentes et renvoie des objets indépendants.
    return executerAction(() =>
      notesCourantes.current.map(note => ({ ...note })),
    )
  }

  /**
   * Construit et sauvegarde une note, puis l’ajoute à l’état affiché.
   * Renvoie la note complète ; si IndexedDB échoue, aucune carte n’est ajoutée.
   */
  function ajouterNote(champs) {
    return executerAction(async () => {
      const note = creerNote(champs)
      await enregistrerNote(note)

      // La sauvegarde précède la mise à jour de l'état partagé.
      if (chargementReussi.current) {
        notesCourantes.current = [...notesCourantes.current, note]
        dispatch({ type: 'NOTE_AJOUTEE', note })
      }

      return note
    })
  }

  /**
   * Mécanisme commun aux modifications et à la corbeille : retrouve la note par id,
   * applique la fonction métier preparer, sauvegarde puis remplace la note du store.
   * Si preparer renvoie le même objet, l’opération est sans effet : pas d’écriture.
   */
  function changerNote(id, preparer) {
    return executerAction(async () => {
      if (typeof id !== 'string' || !id.trim()) {
        throw new Error('L’identifiant de la note est obligatoire.')
      }

      const note = notesCourantes.current.find(note => note.id === id)
      if (!note) throw new Error('Note introuvable.')

      const resultat = preparer(note)
      if (resultat === note) return note

      await enregistrerNote(resultat)

      if (chargementReussi.current) {
        notesCourantes.current = notesCourantes.current.map(note =>
          note.id === id ? resultat : note,
        )
        dispatch({ type: 'NOTE_MISE_A_JOUR', note: resultat })
      }

      return resultat
    })
  }

  /**
   * Modifie uniquement les champs transmis. valeursInitiales, fourni par le
   * formulaire, permet de refuser les conflits sur ces champs ; l’outil vocal
   * n’en fournit pas et travaille sur la dernière note connue du provider.
   */
  function modifierNote(id, changements, valeursInitiales) {
    return changerNote(id, note =>
      preparerModification(note, changements, valeursInitiales),
    )
  }

  /**
   * Place une note en corbeille par son id, sans effacer son contenu ni son identité.
   */
  function supprimerNote(id) {
    return changerNote(id, preparerSuppression)
  }

  /**
   * Réactive une note par son id et attend sa sauvegarde avant confirmation.
   */
  function restaurerNote(id) {
    return changerNote(id, preparerRestauration)
  }

  /**
   * Actions réservées à l’interface. Les ids viennent de la confirmation et sont
   * revérifiés après les actions en file, pour préserver les notes restaurées.
   */
  function supprimerDefinitivementNotes(ids) {
    const cibles = [...ids]
    return executerAction(async () => {
      for (const id of cibles) {
        const note = notesCourantes.current.find(note => note.id === id)
        if (note && note.deletedAt === null) {
          throw new Error('Seules les notes en corbeille peuvent être supprimées définitivement.')
        }
      }
      await effacerNotesEnCorbeille(cibles)
      if (chargementReussi.current) {
        notesCourantes.current = notesCourantes.current.filter(note => !cibles.includes(note.id))
        dispatch({ type: 'NOTES_EFFACEES', ids: cibles })
      }
    })
  }

  /**
   * Importe puis relit la base dans une seule opération de la file.
   * Si l’écriture réussit mais pas la relecture, expose les compteurs sur l’erreur
   * et bloque le store : l’utilisateur doit recharger pour retrouver un état fiable.
   */
  function importerSauvegarde(fichier) {
    return executerAction(async () => {
      const resultat = await importerNotes(fichier)

      let notes
      try {
        notes = await recupererNotes()
      } catch (cause) {
        const erreur = new Error(
          'L’import est enregistré, mais l’actualisation des notes a échoué. Rechargez la page avant de continuer.',
          { cause },
        )

        // Permet à l'appelant de reconnaître un import déjà terminé.
        erreur.importEnregistre = true
        erreur.resultatImport = resultat

        if (chargementReussi.current) {
          chargementReussi.current = false
          dispatch({ type: 'CHARGEMENT_ECHOUE', message: erreur.message })
        }

        throw erreur
      }

      if (chargementReussi.current) {
        notesCourantes.current = notes
        dispatch({ type: 'NOTES_CHARGEES', notes })
      }

      return resultat
    })
  }

  return (
    <NotesContext.Provider value={{
      ...etat,
      obtenirNotes,
      ajouterNote,
      modifierNote,
      supprimerNote,
      restaurerNote,
      supprimerDefinitivementNotes,
      importerSauvegarde,
    }}>
      {children}
    </NotesContext.Provider>
  )
}
