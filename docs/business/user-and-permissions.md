# Utilisateurs & rôles

## Diagramme de gestion
```mermaid
flowchart TD
    Admin -->|Bearer| Front
    Front -->|GET /users/users| APIU[Users API]
    Front -->|GET /roles/all| APIR[Roles API]
    Front -->|POST /roles/assign/{userId}| APIR
    Front -->|POST /auth/generate-reset-token| APIU
    Front -->|POST /auth/reset-password| APIU
    APIR -->|Rôles| Front
    APIU -->|Comptes| Front
```

## Tableau des opérations
| Fonction | Fichier | Endpoint | Description |
| --- | --- | --- | --- |
| `usersApi.getAll` | `src/services/api/users.ts` | `GET /users/users` | Liste des comptes |
| `usersApi.getNonPresenters` | `GET /users/non-presenters` | Comptes disponibles pour affectation |
| `usersApi.create` | `POST /users/users` | Création d'un utilisateur |
| `usersApi.update` | `PUT /users/updte/{id}` | Mise à jour des informations |
| `usersApi.delete` | `DELETE /users/del/{id}` | Suppression logique |
| `usersApi.generateResetToken` | `POST /auth/generate-reset-token` | Génération jeton de réinitialisation |
| `usersApi.validateResetToken` | `GET /auth/reset-token/validate` | Vérification jeton |
| `usersApi.resetPassword` | `POST /auth/reset-password` | Réinitialisation mot de passe |
| `rolesApi.getAll` | `src/services/api/roles.ts` | `GET /roles/all` | Catalogue des rôles |
| `rolesApi.create` | `POST /roles/` | Création d'un rôle |
| `rolesApi.update` | `PUT /roles/update/{id}` | Renommage |
| `rolesApi.delete` | `DELETE /roles/del/{id}` | Suppression |
| `rolesApi.assignRoles` | `POST /roles/assign/{userId}` | Affectation de rôles |
| `rolesApi.unassignRoles` | `POST /roles/unassign/{userId}` | Retrait de rôles |
| `rolesApi.getUserRoles` | `GET /roles/all_assigned/{userId}` | Consultation des rôles |

## Fonctions métiers détaillées

### Administrer les comptes utilisateurs
- **Description** : Créer, modifier et supprimer les comptes d'accès à la plateforme.
- **Responsabilités**
  - Collecter les informations nécessaires (`CreateUserData`).
  - Vérifier les doublons et l'existence d'un utilisateur (`usersApi.getById`).
  - Gérer les mises à jour (ex. changement d'adresse e-mail, numéro de téléphone).
- **Données manipulées**
  - **Entrée** : `CreateUserData`, `UpdateUserData`.
  - **Sortie** : `Users` (cf. `src/types/user.ts`).
- **Règles métiers**
  - Permissions requises : `can_view_users`, `can_edit_users`, `can_delete_users` selon l'action.
  - Suppression via `usersApi.delete` est logique : l'utilisateur peut être réactivé via API backend.
- **Dépendances**
  - `usersApi`, interface `Users` (Zustand ou React Query selon implémentation).
- **Cas d'usage**
  1. Onboarding d'un nouveau technicien.
  2. Mise à jour des coordonnées suite à un changement de service.

### Gérer les rôles et les permissions
- **Description** : Définir la granularité des droits applicatifs.
- **Responsabilités**
  - Maintenir la liste des rôles (ex. "Producteur", "Journaliste", "Technicien") via `rolesApi.create/update/delete`.
  - Affecter plusieurs rôles à un utilisateur (`assignRoles`) ou retirer (`unassignRoles`).
  - Consulter les rôles attribués (`getUserRoles`) et synchroniser avec l'interface de gestion.
- **Données manipulées**
  - **Entrée** : `roleIds: number[]`, `userId: number`.
  - **Sortie** : liste de rôles (`Role[]`).
- **Règles métiers**
  - Les rôles sont des ensembles de permissions prédéfinies (mapping backend). La plateforme n'édite pas directement les flags `can_*` mais passe par les rôles.
  - Les appels doivent être authentifiés avec un utilisateur disposant de `can_manage_roles`.
- **Dépendances**
  - `rolesApi`, pages `Settings` ou `Team`.
- **Cas d'usage**
  1. Accorder temporairement l'accès à la section ShowPlan à un pigiste.
  2. Nettoyer les rôles obsolètes suite à une réorganisation.

### Réinitialiser un mot de passe (processus administrateur)
- **Description** : Gérer la remise à zéro sécurisée des accès.
- **Responsabilités**
  - Générer un jeton (`generateResetToken`) et le transmettre au collaborateur par canal sécurisé.
  - Permettre la validation du jeton (`validateResetToken`) via l'interface publique.
  - Finaliser la réinitialisation (`resetPassword`).
- **Données manipulées**
  - **Entrée** : `user_id`, `reset_token`, `new_password`.
  - **Sortie** : message de confirmation ou statut `valid`.
- **Règles métiers**
  - Les jetons expirent selon la politique backend (`expires_at`).
  - Aucun token admin n'est requis pour `validateResetToken`/`resetPassword` (flux end-user).
- **Dépendances**
  - `usersApi.generateResetToken`, `usersApi.validateResetToken`, `usersApi.resetPassword`.
- **Cas d'usage**
  1. Réinitialisation proactive lors d'une suspicion de compromission.
  2. Onboarding : imposer un premier changement de mot de passe.
