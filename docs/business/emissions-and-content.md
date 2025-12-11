# Émissions & catalogue de contenus

## Schéma d'architecture fonctionnelle
```mermaid
graph LR
    Producteur -->|Token| Front[Frontend React]
    Front -->|GET /emissions| API
    API -->|Emission[]| Front
    Front -->|POST /emissions/| API
    Front -->|PUT /emissions/upd/{id}| API
    Front -->|DELETE /emissions/softDel/{id}| API
    Front --> UI[Section Paramètres > Émissions]
```

## Tableau des opérations
| Fonction | Fichier | Endpoint | Description |
| --- | --- | --- | --- |
| `emissionApi.getAllEmissions` | `src/services/api/emissions.ts` | `GET /emissions` | Récupère l'inventaire des émissions |
| `emissionApi.create` | `POST /emissions/` | Crée une émission récurrente |
| `emissionApi.update` | `PUT /emissions/upd/{id}` | Met à jour les métadonnées |
| `emissionApi.delete` | `DELETE /emissions/softDel/{id}` | Suppression logique d'une émission |

## Fonctions métiers détaillées

### Maintenir le catalogue d'émissions
- **Description** : Centraliser les émissions (programmes) qui serviront de base aux conducteurs.
- **Responsabilités**
  - Fournir une vue complète aux équipes (titre, synopsis, fréquence, durée).
  - Garantir la cohérence des identifiants (`emission_id`) utilisés dans les conducteurs.
- **Données manipulées**
  - **Entrée** : Token utilisateur avec droits `can_view_emissions`.
  - **Sortie** : `Emission[]` (voir `src/types/emission.ts`).
- **Règles métiers**
  - Les émissions inactives peuvent rester en base (`softDel`) pour conserver l'historique.
  - Une émission supprimée ne doit plus être référencée lors de la création d'un conducteur.
- **Dépendances**
  - `emissionApi.getAllEmissions`, composants de paramétrage (`Settings` > `Emissions`).
- **Cas d'usage**
  1. Visualiser la grille hebdomadaire.
  2. Exporter la liste pour un support papier.

### Créer une émission récurrente
- **Description** : Enregistrer une nouvelle émission avec ses caractéristiques éditoriales.
- **Responsabilités**
  - Collecter les informations via formulaire (titre, synopsis, type, durée, fréquence, description).
  - Publier le payload attendu par l'API (`emissionApi.create`).
- **Données manipulées**
  - **Entrée** : `CreateEmissionData` (structure typée).
  - **Sortie** : Objet `Emission` renvoyé par le backend.
- **Règles métiers**
  - Champs requis : `title`, `type`, `duration`, `frequency`.
  - Permissions : `can_create_emissions` nécessaires.
- **Dépendances**
  - `emissionApi.create`, validations formulaires (yup/zod si ajout).
- **Cas d'usage**
  1. Lancement d'une nouvelle chronique quotidienne.
  2. Création d'une émission spéciale pour un événement.

### Mettre à jour une émission existante
- **Description** : Ajuster les métadonnées d'une émission sans impacter l'historique.
- **Responsabilités**
  - Préremplir le formulaire avec les valeurs actuelles.
  - Envoyer `UpdateEmissionData` via `emissionApi.update`.
- **Données manipulées**
  - **Entrée** : `{ emissionId: number, data: UpdateEmissionData }`.
  - **Sortie** : `Emission` mise à jour.
- **Règles métiers**
  - `can_edit_emissions` requis.
  - Les conducteurs existants doivent récupérer la nouvelle description automatiquement (via jointure côté API ou loader front).
- **Dépendances**
  - `emissionApi.update`, notifications UI (toast).
- **Cas d'usage**
  1. Augmenter la durée de l'émission pour la saison prochaine.
  2. Changer le synopsis suite à un repositionnement éditorial.

### Archiver ou supprimer une émission
- **Description** : Retirer une émission de la grille opérationnelle tout en conservant l'historique.
- **Responsabilités**
  - Vérifier que l'émission n'est pas utilisée par un conducteur actif.
  - Appeler `emissionApi.delete` (soft delete côté API).
- **Données manipulées**
  - **Entrée** : `emissionId`.
  - **Sortie** : aucune (204 attendu).
- **Règles métiers**
  - Autorisation `can_delete_emissions` nécessaire.
  - L'interface doit mettre à jour la liste locale (`setEmissions`).
- **Dépendances**
  - `emissionApi.delete`, store local si mis en place.
- **Cas d'usage**
  1. Arrêt définitif d'une émission.
  2. Mise en pause en attendant validation de nouvelle saison.
