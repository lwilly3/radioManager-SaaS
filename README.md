# 📻 RadioManager SaaS

> Application de gestion de radio professionnelle - Planification d'émissions, conducteurs, équipes et contenus.

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.5-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/lwilly3/radioManager-SaaS)

## 🎯 Présentation

RadioManager SaaS est une plateforme complète de gestion pour les radios, permettant de :

- 📅 **Planifier les émissions** avec des conducteurs détaillés
- 👥 **Gérer les équipes** : animateurs, techniciens, invités
- 💬 **Communiquer en temps réel** via le chat intégré
- ✅ **Organiser les tâches** en mode Kanban
- 📊 **Visualiser les statistiques** du tableau de bord
- 🔐 **Contrôler les accès** avec un système de permissions granulaire

## 🖼️ Aperçu

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 📻 5     │ │ 👥 12    │ │ ⏱️ 8h    │ │ 📅 15    │           │
│  │ Émissions│ │ Équipe   │ │ Direct   │ │ Planifiées│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│  Programme du jour                                              │
│  ├── 07:00 - Matinale Info (180 min)                           │
│  ├── 10:00 - Magazine Culture (60 min)                         │
│  └── 12:00 - Journal de midi (30 min)                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Accès à l'API backend (FastAPI)

### Installation

```bash
# Cloner le repository
git clone https://github.com/lwilly3/radioManager-SaaS.git
cd radioManager-SaaS

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Lancer en développement
npm run dev
```

### Variables d'environnement

```env
# API Backend
VITE_API_BASE_URL=https://api.cloud.audace.ovh

# Firebase (pour le chat et les tâches)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 🏗️ Architecture

```
radioManager-SaaS/
├── src/
│   ├── api/                 # Configuration Axios
│   ├── components/          # Composants React réutilisables
│   │   ├── archives/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── showPlans/
│   │   ├── tasks/
│   │   └── ui/              # Composants UI génériques
│   ├── hooks/               # Hooks React personnalisés
│   ├── pages/               # Pages de l'application
│   ├── services/api/        # Services d'appels API
│   ├── store/               # Stores Zustand
│   ├── types/               # Types TypeScript
│   └── utils/               # Utilitaires
├── docs/
│   ├── business/            # Documentation métier
│   └── modules/             # Documentation technique
└── docker/                  # Configuration Docker
```

## 📦 Stack technique

| Catégorie | Technologies |
|-----------|--------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS, Lucide Icons |
| **State** | Zustand (avec persist) |
| **Data Fetching** | Axios, React Query |
| **Real-time** | Firebase Firestore |
| **Forms** | React Hook Form, Zod |
| **Routing** | React Router v6 |
| **Build** | Vite, ESBuild |

## 🔐 Système de permissions

L'application utilise **46 permissions granulaires** organisées par domaine :

| Domaine | Permissions |
|---------|-------------|
| Conducteurs | 13 (créer, éditer, archiver, statuts...) |
| Utilisateurs | 7 (voir, éditer, désactiver, rôles...) |
| Invités | 4 (CRUD) |
| Animateurs | 4 (CRUD) |
| Émissions | 6 (CRUD + gestion) |
| Messages | 6 (chat, fichiers) |
| Système | 5 (audit, paramètres, notifications) |

## 📖 Documentation

| Documentation | Description |
|---------------|-------------|
| 📘 [Documentation métier](./docs/business/README.md) | Vue fonctionnelle de l'application |
| 📗 [Documentation technique](./docs/modules/README.md) | Guide développeur par module |
| 🐳 [Déploiement Docker](./docker/README.md) | Instructions Dokploy |

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev          # Lancer le serveur de dev (port 5173)

# Build
npm run build        # Build de production
npm run preview      # Prévisualiser le build

# Qualité
npm run lint         # Vérifier le code avec ESLint
npm run type-check   # Vérifier les types TypeScript
```

## 🐳 Déploiement Docker

```bash
# Build et lancement
docker-compose up -d --build

# Avec Dokploy
# Voir docker/DOKPLOY_DEPLOYMENT.md
```

### URLs de production

| Service | URL |
|---------|-----|
| Frontend | https://app.cloud.audace.ovh |
| API | https://api.cloud.audace.ovh |
| Dokploy | https://cloud.audace.ovh:3000 |

## 📊 Modules principaux

| Module | Description | Route |
|--------|-------------|-------|
| Dashboard | Tableau de bord | `/dashboard` |
| Conducteurs | Plans d'émission | `/show-plans` |
| Mes conducteurs | Conducteurs personnels | `/my-show-plans` |
| Archives | Émissions archivées | `/archives` |
| Chat | Messagerie temps réel | `/chat` |
| Tâches | Kanban | `/tasks` |
| Invités | Gestion invités | `/guests` |
| Équipe | Membres | `/team` |
| Utilisateurs | Administration | `/users` |
| Paramètres | Configuration | `/settings` |
| Profil | Compte utilisateur | `/profile` |

## 🔄 Workflow de développement

1. **Créer une branche** depuis `main`
2. **Développer** la fonctionnalité
3. **Tester** localement
4. **Push** et créer une PR
5. **Review** et merge
6. **Déploiement** automatique via Dokploy

### Conventions

| Type | Convention | Exemple |
|------|------------|---------|
| Commits | Messages en français | `feat: ajout du chat` |
| Branches | Préfixes | `feature/`, `fix/`, `docs/` |
| Components | PascalCase | `ShowPlanCard.tsx` |
| Hooks | Prefix `use` | `useShows.ts` |
| Stores | Suffix `Store` | `useAuthStore.ts` |

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit (`git commit -m 'feat: ajout de ma fonctionnalité'`)
4. Push (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 Changelog

### v1.1.3 (Janvier 2025)
- 🐛 Fix: Réinitialisation mot de passe
- ✨ Amélioration: Affichage version dans le footer
- 🔧 Fix: Centralisation URL API

### v1.1.2 (Janvier 2025)
- ✨ Feature: Export PDF archives
- 🐛 Fix: Erreur 401 sur refresh

### v1.1.0 (Janvier 2025)
- ✨ Feature: Système de chat temps réel
- ✨ Feature: Gestion des tâches Kanban

## 📄 Licence

Ce projet est propriétaire. Tous droits réservés © Audace Digital.

## 👤 Auteur

**Audace Digital** - [audace.ovh](https://audace.ovh)

---

<p align="center">
  Made with ❤️ for radio professionals
</p>