# 📜 Changelog - RadioManager SaaS

> Historique des modifications du projet pour donner du contexte aux agents IA et aux développeurs.

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## 🤖 Instructions pour les agents IA

### Mise à jour du changelog
Après chaque modification significative, ajouter une entrée dans la section `[Non publié]`.

### ⚠️ Gestion de la taille du fichier
**Quand ce fichier dépasse 300 lignes**, l'agent doit :

1. **Archiver les anciennes versions** dans `docs/changelog/` :
   ```
   docs/changelog/
   ├── CHANGELOG-2025.md    # Versions de 2025
   ├── CHANGELOG-2024.md    # Versions de 2024 (si applicable)
   └── ...
   ```

2. **Résumer les versions archivées** ici avec un lien :
   ```markdown
   ## 📦 Versions archivées
   - [Versions 2025 (1.0.0 - 1.5.x)](docs/changelog/CHANGELOG-2025.md)
   ```

3. **Garder dans ce fichier** :
   - Les 5 dernières versions majeures/mineures
   - La section "Non publié"
   - La Roadmap
   - Les décisions techniques importantes

### Format de résumé pour les versions archivées
```markdown
## [1.x.x] - YYYY-MM-DD (Archivé)
Résumé : [Description en 1-2 lignes des changements majeurs]
Détails : [docs/changelog/CHANGELOG-YYYY.md](docs/changelog/CHANGELOG-YYYY.md#1xx)
```

---

## [Non publié] - En cours de développement

### 🔄 En cours
- Migration de l'URL API de `api.radio.audace.ovh` vers `api.cloud.audace.ovh`
- Voir [`docs/API_MIGRATION_GUIDE.md`](docs/API_MIGRATION_GUIDE.md) pour les détails

---

## [1.1.3] - 2025-12-11

### 📝 Documentation
- Ajout de `AGENT.md` - Guide complet pour les agents IA (1069 lignes)
- Ajout de `docs/API_MIGRATION_GUIDE.md` - Guide de migration des URLs API
- Ajout de documentation technique pour tous les modules (`docs/modules/`)
  - archives.md, authentication.md, chat.md, dashboard.md
  - emissions.md, guests.md, presenters.md, profile.md
  - settings.md, show-plans.md, tasks.md, team.md, users.md
- Ajout de documentation métier (`docs/business/`)
  - authentication-and-access.md
  - emissions-and-content.md
  - programming-and-scheduling.md
  - talent-and-collaboration.md
  - user-and-permissions.md
- Mise à jour du `README.md` avec documentation complète du projet

### 🔧 Technique
- Modifications temporaires des URLs API (à corriger)

---

## [1.1.2] - 2025-12 (estimé)

### ✨ Fonctionnalités
- Système de chat temps réel avec Firebase
- Gestion des tâches avec vue Kanban
- Lecteur audio radio intégré
- Système de notifications

### 🐛 Corrections
- Corrections diverses de l'interface utilisateur
- Amélioration de la gestion des erreurs API

---

## [1.1.0] - 2025-11 (estimé)

### ✨ Fonctionnalités
- Module de gestion des conducteurs (show plans)
- Module de gestion des émissions
- Module de gestion des invités
- Module de gestion des animateurs
- Système de permissions (46 permissions)
- Authentification JWT avec refresh token

### 🏗️ Architecture
- Migration vers React Query pour le data fetching
- Mise en place de Zustand pour le state management
- Configuration Firebase pour le temps réel

---

## [1.0.0] - 2025-10 (estimé)

### 🎉 Version initiale
- Setup initial du projet avec Vite + React + TypeScript
- Configuration TailwindCSS
- Structure de base des composants
- Routing avec React Router
- Authentification de base

---

## 📋 Légende des types de changements

| Emoji | Type | Description |
|-------|------|-------------|
| ✨ | `Added` | Nouvelles fonctionnalités |
| 🔄 | `Changed` | Changements dans les fonctionnalités existantes |
| ⚠️ | `Deprecated` | Fonctionnalités qui seront supprimées |
| 🗑️ | `Removed` | Fonctionnalités supprimées |
| 🐛 | `Fixed` | Corrections de bugs |
| 🔒 | `Security` | Corrections de sécurité |
| 📝 | `Docs` | Documentation |
| 🏗️ | `Architecture` | Changements d'architecture |
| 🔧 | `Technical` | Changements techniques |

---

## 🗺️ Roadmap (Fonctionnalités prévues)

### Version 1.2.0 (Prévue)
- [ ] Export PDF des conducteurs
- [ ] Historique des modifications des conducteurs
- [ ] Système de templates pour les conducteurs
- [ ] Amélioration du module archives

### Version 1.3.0 (Prévue)
- [ ] Application mobile (React Native)
- [ ] Mode hors-ligne
- [ ] Synchronisation multi-appareils

### Version 2.0.0 (Long terme)
- [ ] Multi-tenant (plusieurs radios)
- [ ] Statistiques et analytics
- [ ] Intégration calendrier externe
- [ ] API publique documentée

---

## 🔍 Décisions techniques importantes

### Pourquoi Zustand plutôt que Redux ?
- **Date :** Octobre 2025
- **Décision :** Utiliser Zustand pour le state management global
- **Raison :** Plus léger, moins de boilerplate, TypeScript natif
- **Impact :** Tous les stores dans `src/store/`

### Pourquoi Firebase pour le temps réel ?
- **Date :** Novembre 2025
- **Décision :** Firebase Realtime Database pour chat et tâches
- **Raison :** Simplicité d'intégration, temps réel natif, scalabilité
- **Impact :** Configuration dans `src/api/firebase/`

### Pourquoi React Query ?
- **Date :** Novembre 2025
- **Décision :** React Query pour le data fetching et caching
- **Raison :** Gestion du cache, refetch automatique, états de loading/error
- **Impact :** Hooks dans `src/hooks/` utilisant `useQuery`/`useMutation`

### Architecture des permissions
- **Date :** Novembre 2025
- **Décision :** 46 permissions granulaires stockées côté serveur
- **Raison :** Contrôle fin des accès par fonctionnalité
- **Impact :** Vérification via `usePermissions()` hook

---

## 📊 Statistiques du projet

| Métrique | Valeur | Date |
|----------|--------|------|
| Lignes de code | ~15,000+ | Dec 2025 |
| Composants React | ~100+ | Dec 2025 |
| Hooks personnalisés | ~30+ | Dec 2025 |
| Services API | ~15 | Dec 2025 |
| Stores Zustand | ~10 | Dec 2025 |

---

## 🔗 Liens utiles

- [AGENT.md](AGENT.md) - Guide pour les agents IA
- [README.md](README.md) - Documentation générale
- [docs/](docs/) - Documentation détaillée
- [DOCKER_INFO.md](DOCKER_INFO.md) - Configuration Docker/Dokploy

---

> **Note pour les agents IA :** Ce fichier doit être mis à jour à chaque modification significative du projet. Consultez-le pour comprendre l'historique et le contexte des décisions.
