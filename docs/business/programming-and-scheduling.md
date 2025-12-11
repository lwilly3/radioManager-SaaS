# Programmation & conducteurs

## Diagramme de flux
```mermaid
flowchart TD
    A[Créateur de conducteur] -->|JWT| B[Frontend]
    B -->|GET /shows/owned| API[(API Shows)]
    API -->|ShowPlan[]| B
    B -->|PATCH /shows/detail/{id}| API
    API -->|ShowPlan| B
    B -->|PATCH /shows/status/{id}| API
    API -->|HTTP 204| B
    B -->|Projection| UI[Pages ShowPlans / Rundowns]
```

## Tableau des opérations métiers
| Fonction | Fichier | Endpoint | Description |
| --- | --- | --- | --- |
| `showsApi.getAll_production` | `src/services/api/shows.ts` | `GET /shows/production` | Récupère les conducteurs prêts à la diffusion |
| `showsApi.getAll_Owned` | `GET /shows/owned` | Liste des conducteurs appartenant à l'utilisateur |
| `showsApi.getById` | `GET /shows/x/{id}` | Détail complet d'un conducteur |
| `showsApi.create` | `POST /shows/detail` | Création d'un conducteur |
| `showsApi.update` | `PATCH /shows/detail/{id}` | Mise à jour des métadonnées + segments |
| `showsApi.deleteDel` | `DELETE /shows/del/{id}` | Suppression logique d'un conducteur |
| `statusApi.update` | `PATCH /shows/status/{id}` | Transition d'état (draft, ready, live, etc.) |

## Fonctions métiers détaillées

### Préparer un conducteur de diffusion
- **Description** : Créer un conducteur structuré (segments, invités, présentateurs) pour une émission donnée.
- **Responsabilités**
  - Collecter les informations d'émission (titre, date, description, statut).
  - Décomposer en segments (`ShowSegment`) avec durée, type (`intro`, `interview`, etc.) et invités associés.
  - Associer des présentateurs (`Presenter[]`) et l'émission de rattachement (`emission_id`).
  - Envoyer la structure via `showsApi.create`.
- **Données manipulées**
  - **Entrée** : Payload JSON libre (`data`), aligné sur le modèle backend (segments, presenters, guests).
  - **Sortie** : Objet JSON renvoyé par l'API (souvent `ShowPlan`).
- **Règles métiers**
  - Authentification obligatoire (header `Authorization: Bearer token`).
  - La durée totale doit respecter la durée définie de l'émission (contrôle côté métier à prévoir).
  - Les segments doivent conserver un ordre strict (index ou champ `position`).
- **Dépendances**
  - `showsApi.create`, `useShowPlanStore` (stockage local), composants d'édition (`src/components/rundowns/*`).
- **Cas d'usage**
  1. Construction d'un conducteur hebdomadaire par le producteur.
  2. Création rapide d'un conducteur spécial (breaking news).

### Mettre à jour un conducteur existant
- **Description** : Modifier les métadonnées ou le contenu d'un conducteur.
- **Responsabilités**
  - Charger la version courante via `showsApi.getById`.
  - Permettre l'édition segment par segment (ajout, suppression, réordonnancement).
  - Propulser les modifications par `showsApi.update`.
- **Données manipulées**
  - **Entrée** : Patch partiel `data` (typiquement segments + status + presenters).
  - **Sortie** : `ShowPlan` recalculé (`mapApiShowToShowPlan`).
- **Règles métiers**
  - Les identifiants internes sont normalisés en string (`segment.id.toString()`).
  - Le type de segment est converti en minuscule pour correspondre au type `SegmentType`.
- **Dépendances**
  - `showsApi.update`, store `useShowPlanStore`, composants `ArchiveDetailDialog`, `ShowPlanDetail`.
- **Cas d'usage**
  1. Ajuster un conducteur pendant la conférence de rédaction.
  2. Modifier les invités juste avant le direct.

### Gérer les transitions de statut
- **Description** : Piloter le cycle de vie des conducteurs (draft → ready → live → archived).
- **Responsabilités**
  - Exposer dans l'UI la liste des statuts autorisés (mapping dans `statusApi`).
  - Appeler `statusApi.update` pour chaque changement.
- **Données manipulées**
  - **Entrée** : `showId: string`, `statusName: string`.
  - **Sortie** : vide (`void`), mais l'UI doit rafraîchir la liste.
- **Règles métiers**
  - La transition est validée côté API; gérer les erreurs (ex. interdiction de passer un conducteur archivé en live).
  - Les permissions (`can_changestatus_showplan`) déterminent si l'action est visible.
- **Dépendances**
  - `statusApi.update`, composants `ShowStatusBadge`, `ShowActions`.
- **Cas d'usage**
  1. Mettre en "Ready" les conducteurs validés.
  2. Signaler la fin de diffusion en passant en "Archived".

### Consulter les conducteurs de la grille
- **Description** : Afficher les conducteurs accessibles à l'utilisateur selon ses droits.
- **Responsabilités**
  - Appeler `showsApi.getAll_production` pour la vision globale.
  - Appeler `showsApi.getAll_Owned` pour les conducteurs appartenant au journaliste connecté.
  - Aligner la pagination / filtrage via `useShowPlanStore` (`filters`).
- **Données manipulées**
  - **Entrée** : token utilisateur.
  - **Sortie** : `ShowPlan[]` mappés pour l'UI.
- **Règles métiers**
  - Les permissions `can_viewAll_showplan` / `can_acces_showplan_section` conditionnent l'accès.
  - La vue peut combiner les deux listes en fonction des attentes produit (proposer un toggle).
- **Dépendances**
  - `showsApi.getAll_production`, `showsApi.getAll_Owned`, store `useShowPlanStore`.
- **Cas d'usage**
  1. Morning meeting : visualiser tous les conducteurs du jour.
  2. Journaliste qui consulte uniquement ses propres sujets.
