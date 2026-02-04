# 🎓 Agent Skills - RadioManager SaaS

> Système de compétences pour améliorer la qualité et la cohérence du code généré par l'agent IA.

## 📋 Vue d'ensemble

Les **Agent Skills** sont des guides spécialisés qui orientent l'agent IA dans différents aspects du développement. Chaque skill définit précisément :
- Le rôle et la responsabilité du skill
- Quand l'agent doit l'utiliser
- Ce qu'il doit faire (bonnes pratiques)
- Ce qu'il ne doit pas faire (anti-patterns)
- Des exemples concrets et checklists

## 🎯 Skills disponibles

### Phase 1 - Fondations ✅

| Skill | Priorité | Description | Quand l'utiliser |
|-------|----------|-------------|------------------|
| [**project-overview**](./project-overview/SKILL.md) | Critique | Vision globale du projet, domaine métier, architecture générale | Au démarrage, décisions majeures, nouvelles fonctionnalités |
| [**coding-standards**](./coding-standards/SKILL.md) | Critique | Standards de code TypeScript/React, conventions, qualité | À chaque écriture/modification de code |
| [**architecture**](./architecture/SKILL.md) | Critique | Patterns architecturaux, organisation code, performance | Nouvelles fonctionnalités, refactoring, décisions techniques |
| [**workflow-git**](./workflow-git/SKILL.md) | Critique | Workflow Git, versioning, conventions commit | Commit, push, release, gestion branches |

### Phase 2 - Qualité ✅

| Skill | Priorité | Description | Quand l'utiliser |
|-------|----------|-------------|------------------|
| [**testing**](./testing/SKILL.md) | Haute | Tests unitaires, intégration, E2E, stratégie de test | Création de composants, hooks, corrections de bugs |
| [**security**](./security/SKILL.md) | Critique | Sécurité, authentification, validation, protection données | Manipulation données sensibles, auth, uploads |
| [**performance**](./performance/SKILL.md) | Haute | Optimisation React, bundle, requêtes, Core Web Vitals | Listes volumineuses, problèmes de lenteur, optimisation |

### Phase 3 - API & Intégration ✅

| Skill | Priorité | Description | Quand l'utiliser |
|-------|----------|-------------|------------------|
| [**api-consumer**](./api-consumer/SKILL.md) | Critique | Documentation complète de l'API backend (~85 routes) | Intégration API, création services, debug requêtes |
| [**firebase**](./firebase/SKILL.md) | Haute | Firebase/Firestore pour Chat, Tasks, Quotes | Modules temps réel, CRUD Firestore, Storage |
| [**quotes-integration**](./quotes-integration/SKILL.md) | Haute | Intégration citations sur segments de conducteurs | Citations, segments, recherche, publication |

Le skill **api-consumer** inclut une documentation détaillée par module :
- [routes/auth.md](./api-consumer/routes/auth.md) - Authentification JWT, invitations, reset password
- [routes/users.md](./api-consumer/routes/users.md) - Gestion utilisateurs, recherche
- [routes/shows.md](./api-consumer/routes/shows.md) - Conducteurs, segments, recherche
- [routes/emissions.md](./api-consumer/routes/emissions.md) - Gestion des émissions
- [routes/presenters.md](./api-consumer/routes/presenters.md) - Gestion des présentateurs
- [routes/guests.md](./api-consumer/routes/guests.md) - Gestion des invités
- [routes/permissions.md](./api-consumer/routes/permissions.md) - Permissions, rôles, templates
- [routes/notifications.md](./api-consumer/routes/notifications.md) - Notifications utilisateur
- [routes/setup-version.md](./api-consumer/routes/setup-version.md) - Setup, version, dashboard
- [routes/quotes.md](./api-consumer/routes/quotes.md) - Citations (Firebase)

## 🔄 Relations entre skills

```
┌──────────────────────────────────────────────────────────────┐
│                     project-overview                         │
│            (Base : Comprendre le projet)                     │
└────────────────────┬─────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┬────────────┐
         │           │           │            │
         ▼           ▼           ▼            ▼
┌─────────────┐ ┌──────────┐ ┌─────────────┐ ┌────────────┐
│   coding-   │ │   archi- │ │  workflow-  │ │  security  │
│  standards  │ │  tecture │ │     git     │ │ (Critique) │
└─────────────┘ └──────────┘ └─────────────┘ └────────────┘
     (Code)      (Structure)   (Versioning)      (Sécurité)
         │           │              │               │
         │           │              │               │
         └───────┬───┴──────┬───────┴───────────────┘
                 │          │
                 ▼          ▼
         ┌──────────┐  ┌──────────────┐
         │ testing  │  │ performance  │
         │ (Haute)  │  │   (Haute)    │
         └──────────┘  └──────────────┘
           (Tests)       (Optimisation)
                 │
                 ▼
         ┌──────────────┐
         │ api-consumer │
         │ (Critique)   │
         └──────────────┘
          (Intégration API)
                 │
                 ▼
         ┌──────────────┐
         │   firebase   │
         │   (Haute)    │
         └──────────────┘
          (Temps réel)
```

**Ordre d'activation recommandé:**
1. **project-overview** → Comprendre le contexte
2. **api-consumer** → Connaître les endpoints disponibles
3. **firebase** → Connaître les patterns Firestore
4. **architecture** → Décider de la structure
5. **coding-standards** → Écrire le code
6. **security** → Sécuriser le code (auth, validation, XSS/CSRF)
7. **testing** → Tester le code (unitaire, intégration, E2E)
8. **performance** → Optimiser si nécessaire (memoization, lazy loading)
9. **workflow-git** → Commiter et versionner

## 🚀 Utilisation par l'agent

### Activation automatique

L'agent active automatiquement les skills selon le contexte :

| Action utilisateur | Skills activés |
|-------------------|----------------|
| "Explique le projet" | `project-overview` |
| "Crée un composant X" | `project-overview` → `architecture` → `coding-standards` → `testing` |
| "Ajoute une fonctionnalité Y" | `project-overview` → `architecture` → `coding-standards` → `security` → `testing` |
| "Commit le code" | `workflow-git` |
| "Crée une version" | `project-overview` → `workflow-git` |
| "Refactorise ce code" | `architecture` → `coding-standards` → `performance` |
| "Teste cette fonctionnalité" | `testing` → `coding-standards` |
| "Optimise ce composant" | `performance` → `coding-standards` |
| "Sécurise cette route" | `security` → `architecture` |
| "Intègre l'API shows" | `api-consumer` → `coding-standards` → `security` |
| "Appelle l'endpoint X" | `api-consumer` → `coding-standards` |
| "Liste les routes API" | `api-consumer` |
| "Ajoute un listener Firestore" | `firebase` → `coding-standards` |
| "Crée un chat en temps réel" | `firebase` → `architecture` → `coding-standards` |
| "Upload un fichier audio" | `firebase` → `security` |
| "Ajoute une citation sur un segment" | `quotes-integration` → `firebase` → `coding-standards` |
| "Recherche des citations" | `quotes-integration` → `firebase` |
| "Intègre les citations sur les conducteurs" | `quotes-integration` → `architecture` → `firebase` |

### Exemples de déclencheurs

#### Scenario 1 : Nouvelle fonctionnalité
```
Utilisateur : "Crée un module de gestion des archives"

Agent active :
1. project-overview → Comprendre où cela s'insère
2. architecture → Décider de la structure (hooks, stores, API)
3. coding-standards → Écrire le code selon les conventions
4. security → Vérifier les permissions et validations
5. testing → Écrire les tests unitaires et d'intégration
6. workflow-git → Commiter avec le bon format
```

#### Scenario 2 : Correction de bug
```
Utilisateur : "Corrige le bug de l'authentification"

Agent active :
1. project-overview → Identifier le module Auth
2. coding-standards → Corriger selon les standards
3. security → Vérifier les failles de sécurité
4. testing → Ajouter des tests de non-régression
5. workflow-git → Commit avec 🐛 fix(auth): ...
```

#### Scenario 3 : Optimisation de performance
```
Utilisateur : "Optimise le chargement de la liste des émissions"

Agent active :
1. performance → Analyser les problèmes (re-renders, données volumineuses)
2. architecture → Décider des optimizations (memoization, virtualization)
3. coding-standards → Implémenter selon les conventions
4. testing → Vérifier que tout fonctionne toujours
```

#### Scenario 4 : Release
```
Utilisateur : "Crée une nouvelle version"

Agent active :
1. project-overview → Vérifier les changements
2. workflow-git → Mettre à jour CHANGELOG, package.json, tag
```

## 📐 Structure d'un skill

Chaque skill suit cette structure standardisée :

```markdown
# 🎯 Agent Skill: [Nom]

## Rôle
[Description du rôle du skill]

## Quand utiliser ce skill
[Déclencheurs automatiques et contexte d'utilisation]

## Ce que l'agent DOIT faire
[Règles, exemples, bonnes pratiques]

## Ce que l'agent NE DOIT PAS faire
[Anti-patterns, erreurs à éviter]

## Checklist
[Points de vérification avant validation]

## Exemples de requêtes utilisateur
[Exemples concrets de déclencheurs]

## Métadonnées
[Version, dépendances, priorité]
```

## ✅ Validation et qualité

### Critères de qualité d'un skill

Un bon skill doit être :
- ✅ **Spécifique** : Rôle clairement défini, pas d'ambiguïté
- ✅ **Actionnable** : Instructions concrètes, exemples pratiques
- ✅ **Complet** : Couvre tous les cas d'usage du domaine
- ✅ **Maintenable** : Facile à mettre à jour, bien structuré
- ✅ **Indépendant** : Peut être utilisé seul (avec ses dépendances)

### Checklist de validation d'un skill

- [ ] Le rôle est clairement défini
- [ ] Les déclencheurs sont explicites
- [ ] Les bonnes pratiques sont illustrées par des exemples
- [ ] Les anti-patterns sont documentés
- [ ] Une checklist de validation est fournie
- [ ] Des exemples de requêtes utilisateur sont donnés
- [ ] Les métadonnées sont complètes
- [ ] Le formatage Markdown est correct
- [ ] Les liens vers autres skills/docs fonctionnent

## 🔧 Maintenance des skills

### Quand mettre à jour un skill ?

- ✏️ Nouvelle pratique ou pattern adoptée dans le projet
- 🐛 Correction d'une instruction erronée
- 📝 Ajout d'exemples ou clarification
- 🔄 Évolution de l'architecture ou des outils
- ➕ Nouveau module ou fonctionnalité majeure

### Processus de mise à jour

1. Identifier le skill à mettre à jour
2. Modifier le fichier `SKILL.md` correspondant
3. Mettre à jour la version et date dans les métadonnées
4. Mettre à jour ce README.md si nécessaire
5. Commiter avec le format : `📝 docs(skills): mettre à jour [nom-skill]`

## 📊 Métriques de performance

### Indicateurs de qualité

- **Cohérence du code** : Le code généré suit-il les standards ?
- **Respect de l'architecture** : Les patterns sont-ils respectés ?
- **Qualité des commits** : Les messages suivent-ils les conventions ?
- **Versions cohérentes** : Les releases sont-elles correctement gérées ?

### Feedback et amélioration

Si l'agent ne respecte pas un skill :
1. Identifier quelle partie du skill n'est pas suivie
2. Vérifier si le skill est clair et précis
3. Améliorer le skill avec plus d'exemples ou d'explications
4. Ajouter des anti-patterns si nécessaire

## 🎓 Recommandations d'évolution

### Skills à considérer pour l'avenir

| Skill | Priorité | Description | Bénéfices attendus |
|-------|----------|-------------|-------------------|
| **testing** | Haute | Tests unitaires, E2E, stratégie de test | Meilleure couverture de tests |
| **performance** | Moyenne | Optimisation, profiling, best practices | Code plus performant |
| **security** | Haute | Sécurité, authentification, données sensibles | Application plus sécurisée |
| **accessibility** | Moyenne | A11y, WCAG, composants accessibles | Meilleure accessibilité |
| **i18n** | Basse | Internationalisation, traductions | Support multilingue |
| **deployment** | Moyenne | CI/CD, Docker, déploiement | Déploiement automatisé |

### Roadmap des skills

**Phase 1 (Actuelle) - Fondations** ✅
- project-overview
- coding-standards
- architecture
- workflow-git

**Phase 2 - Qualité**
- testing
- security
- performance

**Phase 3 - Expérience**
- accessibility
- i18n
- error-handling

**Phase 4 - Opérations**
- deployment
- monitoring
- debugging

## 📚 Ressources complémentaires

### Documentation projet
- [AGENT.md](../../../AGENT.md) - Guide complet pour agents IA
- [docs/VERSIONING.md](../../../docs/VERSIONING.md) - Gestion des versions
- [docs/ARCHITECTURE_ANALYSIS.md](../../../docs/ARCHITECTURE_ANALYSIS.md) - Analyse architecture
- [docs/modules/](../../../docs/modules/) - Documentation par module

### Standards externes
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Outils recommandés
- **ESLint** : Linting TypeScript/React
- **Prettier** : Formatage automatique
- **Husky** : Git hooks
- **Commitlint** : Validation des messages de commit

## 🤝 Contribution

### Comment améliorer un skill ?

1. Identifier une amélioration ou correction nécessaire
2. Modifier le fichier SKILL.md concerné
3. Suivre la structure et le format existant
4. Ajouter des exemples concrets
5. Mettre à jour les métadonnées (version, date)
6. Commiter avec message descriptif

### Guidelines de rédaction

- **Clarté** : Instructions précises et sans ambiguïté
- **Exemples** : Illustrer avec des cas concrets du projet
- **Anti-patterns** : Montrer ce qu'il ne faut PAS faire
- **Cohérence** : Suivre le format des autres skills
- **Maintenance** : Facile à mettre à jour et à comprendre

## 📞 Support

Pour toute question sur les skills :
1. Consulter d'abord le SKILL.md concerné
2. Vérifier la documentation projet (AGENT.md, docs/)
3. Consulter les exemples dans le code existant

---

## 📝 Changelog des skills

### Version 1.3.0 - 2026-02-04

**Ajout du skill quotes-integration**

✨ **Nouveau skill :**
- `quotes-integration` : Intégration complète des citations sur les segments de conducteurs

📝 **Documentation :**
- Structure de données Quote avec liaison segment
- Service Firebase CRUD complet avec recherche avancée
- Composant SegmentQuoteForm avec pré-remplissage automatique
- Composant QuoteSearchBar avec filtres multiples
- Hook useQuotes avec React Query
- Horodatage optionnel (non bloquant)
- Index Firestore recommandés
- Intégration sur la page conducteur

🎯 **Fonctionnalités couvertes :**
- Ajout de citations sur chaque segment
- Métadonnées (intervenant, horodatage optionnel, type de contenu)
- Base éditoriale consultable et réutilisable
- Recherche full-text et filtres avancés
- Génération de contenu pour plateformes

---

### Version 1.2.0 - 2026-02-03

**Ajout du skill Firebase**

✨ **Nouveau skill :**
- `firebase` : Patterns Firebase/Firestore pour modules temps réel

📝 **Documentation :**
- CRUD Firestore avec exemples complets
- Listeners temps réel (onSnapshot)
- Firebase Storage (upload/download fichiers)
- Sous-collections (messages dans rooms)
- Batch et transactions
- Gestion des erreurs Firebase
- Règles de sécurité Firestore
- Structure des documents (Quote, Task, ChatRoom, Message)

🎯 **Modules couverts :**
- Chat (rooms, messages)
- Tasks (tâches Kanban)
- Quotes (citations)
- UserPreferences
- Versions

---

### Version 1.1.0 - 2026-02-03

**Ajout du skill api-consumer**

✨ **Nouveau skill :**
- `api-consumer` : Documentation complète API backend (~85 routes)

📝 **Documentation :**
- 10 fichiers de routes détaillées
- Authentification, Users, Shows, Emissions, etc.
- Exemples d'intégration avec hooks existants
- Gestion d'erreurs standardisée

---

### Version 1.0.0 - 2026-01-30

**Création initiale du système d'Agent Skills**

✨ **Skills créés :**
- `project-overview` : Vue d'ensemble du projet
- `coding-standards` : Standards de code TypeScript/React
- `architecture` : Patterns architecturaux et organisation
- `workflow-git` : Workflow Git et versioning

📝 **Documentation :**
- README.md principal des skills
- Structure standardisée pour tous les skills
- Exemples concrets et checklists
- Métadonnées et dépendances

🎯 **Objectifs atteints :**
- ✅ Système complet et cohérent
- ✅ Compatible avec chat.useAgentSkills
- ✅ Indépendant et maintenable
- ✅ Orienté production

---

**Dernière mise à jour** : 2026-02-04  
**Version** : 1.3.0  
**Auteur** : Équipe RadioManager SaaS
