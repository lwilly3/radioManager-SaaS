# 🎯 Agent Skill: Project Overview

## Rôle
Fournir une compréhension complète et contextualisée du projet RadioManager SaaS à l'agent IA pour orienter toutes ses décisions de développement.

## Quand utiliser ce skill

### Déclencheurs automatiques
- L'utilisateur commence une nouvelle conversation ou session
- L'utilisateur demande "c'est quoi ce projet ?" ou "explique-moi le projet"
- L'utilisateur pose une question générale sur la vision ou les objectifs
- L'agent doit prendre une décision architecturale majeure
- Avant de proposer des changements structurels importants

### Contexte d'utilisation
- Au démarrage de toute tâche complexe impliquant plusieurs modules
- Lors de l'intégration de nouvelles fonctionnalités majeures
- Quand l'agent a besoin de comprendre les priorités métier
- Pour vérifier la cohérence d'une implémentation avec la vision globale

---

## Ce que l'agent DOIT faire

### 1. Comprendre le domaine métier

**RadioManager SaaS** est une plateforme de gestion de stations de radio en mode SaaS, destinée à :
- **Programmateurs** : Planification des émissions, conducteurs, grilles de programme
- **Animateurs** : Préparation et gestion de contenu, citations, invités
- **Équipes techniques** : Archives, diffusion, tâches opérationnelles
- **Directeurs** : Vue d'ensemble, statistiques, gestion d'équipe

### 2. Connaître l'architecture globale

```
Technologie Frontend: React 18 + TypeScript + Vite
State Management: Zustand (stores globaux)
Backend: Firebase (Firestore, Auth, Storage)
UI Framework: Tailwind CSS + Headless UI
Routing: React Router v6
Validation: Zod + React Hook Form
```

### 3. Identifier les modules principaux

| Module | Priorité | Statut | Responsable |
|--------|----------|--------|-------------|
| **Authentication** | Critique | Stable | Auth Firebase + JWT |
| **Show Plans (Conducteurs)** | Critique | Stable | Planification émissions |
| **Quotes (Citations)** | Haute | En développement | Module v1.2.0 |
| **Guests (Invités)** | Haute | Stable | Gestion contacts |
| **Chat** | Moyenne | Stable | Communication équipe |
| **Tasks** | Moyenne | Stable | Gestion tâches |
| **Archives** | Moyenne | En cours | Stockage contenus |
| **Dashboard** | Haute | Stable | Vue d'ensemble |

### 4. Respecter les conventions du projet

**Structure de fichiers:**
```
src/
├── components/       # Composants React organisés par module
├── pages/           # Pages principales (routes)
├── hooks/           # Hooks personnalisés par module
├── store/           # Stores Zustand
├── api/             # Services API (Firebase)
├── schemas/         # Schémas Zod de validation
├── types/           # Types TypeScript
└── utils/           # Utilitaires transverses
```

**Naming conventions:**
- Composants: `PascalCase.tsx`
- Hooks: `use[Feature]Name.ts`
- Types: `PascalCase` dans fichiers `.ts`
- Stores: `use[Feature]Store.ts`
- API: `[feature].ts` dans `api/firebase/`

### 5. Consulter la documentation existante

**Avant toute modification majeure, TOUJOURS consulter:**
- `AGENT.md` : Guide complet pour les agents IA (1069 lignes)
- `docs/VERSIONING.md` : Gestion des versions (Semantic Versioning)
- `docs/ARCHITECTURE_ANALYSIS.md` : Analyse architecture
- `docs/modules/[module].md` : Documentation technique par module
- `docs/business/` : Documentation métier et processus
- `CHANGELOG.md` : Historique des modifications

### 6. Comprendre les permissions et rôles

**Système de permissions granulaire:**
```typescript
Rôles: 'super-admin' | 'admin' | 'producer' | 'presenter' | 'technician'

Permissions principales:
- quotes_view, quotes_create, quotes_edit, quotes_delete
- showplans_view, showplans_create, showplans_edit, showplans_delete
- users_manage, team_manage
- archives_access
```

**Règle:** Toute nouvelle fonctionnalité doit intégrer la vérification des permissions.

---

## Ce que l'agent NE DOIT PAS faire

### ❌ Anti-patterns à éviter

1. **Ne JAMAIS créer de fichiers redondants**
   - Vérifier l'existence avant de créer un nouveau fichier
   - Utiliser les composants existants plutôt que recréer

2. **Ne PAS ignorer la structure établie**
   - Respecter l'organisation par module
   - Placer les fichiers dans les bons dossiers

3. **Ne PAS modifier sans comprendre**
   - Lire la documentation du module avant modification
   - Comprendre les dépendances et impacts

4. **Ne PAS créer de nouvelles dépendances sans validation**
   - Utiliser les bibliothèques déjà présentes
   - Demander validation pour tout nouveau package

5. **Ne PAS casser les conventions de versioning**
   - Suivre Semantic Versioning (SemVer)
   - Mettre à jour CHANGELOG.md pour toute modification

6. **Ne PAS négliger les permissions**
   - Toujours vérifier les permissions utilisateur
   - Implémenter les contrôles d'accès

---

## Exemples de requêtes utilisateur

### Déclencheurs directs
```
✅ "Explique-moi le projet"
✅ "C'est quoi RadioManager SaaS ?"
✅ "Donne-moi une vue d'ensemble"
✅ "Quels sont les modules principaux ?"
✅ "Comment est organisé le projet ?"
```

### Déclencheurs contextuels
```
✅ "Je veux ajouter une fonctionnalité de [X]" → Consulter project-overview pour cohérence
✅ "Où dois-je créer ce nouveau composant ?" → Référence à la structure
✅ "Comment fonctionne l'authentification ici ?" → Documentation module Auth
```

---

## Checklist de l'agent

Avant toute action majeure, l'agent DOIT vérifier:

- [ ] La fonctionnalité demandée est cohérente avec le domaine métier
- [ ] Le module concerné existe ou sa création est justifiée
- [ ] La documentation du module a été consultée
- [ ] La structure de fichiers sera respectée
- [ ] Les permissions seront gérées correctement
- [ ] Le CHANGELOG sera mis à jour
- [ ] Les conventions de code sont connues
- [ ] Aucune duplication de code n'est créée

---

## Métadonnées

- **Version:** 1.0.0
- **Dernière mise à jour:** 2026-01-30
- **Priorité:** Critique
- **Dépendances:** Aucune
- **Utilisé par:** coding-standards, architecture, workflow-git
