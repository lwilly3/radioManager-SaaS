# 🔄 Agent Skill: Git Workflow

## Rôle
Guider l'agent dans l'utilisation correcte de Git, la gestion des versions, les conventions de commit et le workflow de développement pour maintenir un historique propre et traçable.

## Quand utiliser ce skill

### Déclencheurs automatiques
- L'agent termine une tâche de développement
- L'utilisateur demande de "commit" ou "push" du code
- L'agent doit créer une nouvelle version
- L'utilisateur demande de créer une branche
- Lors de merge ou résolution de conflits
- Avant de déployer du code

### Contexte d'utilisation
- Après chaque fonctionnalité complétée
- Après correction de bug
- Lors de création de version (release)
- Pour synchroniser avec le repository distant
- Avant de partager du code avec l'équipe

---

## Ce que l'agent DOIT faire

### 1. Comprendre la stratégie de branches

```
main (production)
  │
  └── develop (développement)
       │
       ├── feature/quotes-module
       ├── feature/archives-system
       ├── bugfix/auth-loop
       └── hotfix/critical-error
```

**Branches principales:**
- `main` : Code en production, stable, déployé
- `develop` : Code de développement, intégration continue

**Branches temporaires:**
- `feature/*` : Nouvelles fonctionnalités
- `bugfix/*` : Corrections de bugs
- `hotfix/*` : Corrections urgentes en production
- `refactor/*` : Refactoring de code

### 2. Convention de nommage des branches

```bash
# ✅ BON : Noms descriptifs et clairs
feature/quotes-create-manual
feature/show-plans-pdf-export
bugfix/firestore-undefined-values
bugfix/auth-infinite-loop
hotfix/critical-database-error
refactor/components-structure

# ❌ MAUVAIS : Noms vagues
feature/new-stuff
bugfix/fix
test-branch
```

**Règles de nommage:**
- Préfixe selon le type : `feature/`, `bugfix/`, `hotfix/`, `refactor/`
- Kebab-case (tirets, pas d'espaces)
- Descriptif et concis
- Pas de caractères spéciaux

### 3. Conventions de commit (Conventional Commits)

#### Format standard
```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

#### Types de commits

| Emoji | Type | Description | Exemple |
|-------|------|-------------|---------|
| ✨ | `feat` | Nouvelle fonctionnalité | `✨ feat(quotes): ajouter création manuelle` |
| 🐛 | `fix` | Correction de bug | `🐛 fix(auth): corriger boucle infinie` |
| 🔧 | `chore` | Maintenance, config | `🔧 chore: mise à jour dépendances` |
| 📝 | `docs` | Documentation | `📝 docs: ajouter guide Citations` |
| ♻️ | `refactor` | Refactoring | `♻️ refactor(components): restructurer QuoteCard` |
| ⚡ | `perf` | Performance | `⚡ perf(api): optimiser requêtes Firestore` |
| 💄 | `style` | Style/UI | `💄 style(quotes): ajuster spacing` |
| ✅ | `test` | Tests | `✅ test(quotes): ajouter tests unitaires` |
| 🚀 | `release` | Release/Version | `🚀 release: v1.2.0` |
| 🔥 | `remove` | Suppression code | `🔥 remove: supprimer ancien module` |

#### Scopes principaux
- `quotes` : Module Citations
- `showPlans` : Module Conducteurs
- `auth` : Authentification
- `guests` : Module Invités
- `chat` : Module Chat
- `tasks` : Module Tâches
- `dashboard` : Tableau de bord
- `api` : Services API
- `ui` : Composants UI
- `config` : Configuration

#### Exemples de bons commits

```bash
# ✅ Fonctionnalité
✨ feat(quotes): ajouter formulaire de création manuelle
✨ feat(quotes): implémenter upload audio Firebase Storage
✨ feat(showPlans): ajouter bouton création citation depuis conducteur

# ✅ Corrections
🐛 fix(quotes): corriger erreur Firestore valeurs undefined
🐛 fix(auth): résoudre boucle infinie useAuthCheck
🐛 fix(showPlans): corriger persistance formulaire segments

# ✅ Refactoring
♻️ refactor(quotes): extraire logique dans useQuotes hook
♻️ refactor(components): séparer présentation et logique

# ✅ Documentation
📝 docs(quotes): ajouter guide intégration conducteurs
📝 docs: créer VERSIONING.md guide complet

# ✅ Configuration
🔧 chore: mettre à jour package.json vers 1.2.0
🔧 chore(deps): mise à jour React 18.3

# ✅ Performance
⚡ perf(quotes): optimiser rendu liste avec React.memo
⚡ perf(api): ajouter pagination requêtes

# ✅ Style
💄 style(quotes): ajuster design QuoteCard
💄 style: corriger responsive mobile

# ❌ MAUVAIS : Trop vague
fix: bug
update: changes
commit
wip
```

### 4. Workflow de développement complet

#### Créer une nouvelle fonctionnalité

```bash
# 1. Partir de develop
git checkout develop
git pull origin develop

# 2. Créer une branche feature
git checkout -b feature/quotes-create-manual

# 3. Développer (commits réguliers)
git add src/components/quotes/QuoteForm.tsx
git commit -m "✨ feat(quotes): créer composant QuoteForm"

git add src/pages/Quotes/CreateQuote.tsx
git commit -m "✨ feat(quotes): créer page CreateQuote"

git add src/api/firebase/quotes.ts
git commit -m "✨ feat(quotes): ajouter API createQuote"

# 4. Finaliser et pousser
git push origin feature/quotes-create-manual

# 5. Créer Pull Request
# Via GitHub UI: feature/quotes-create-manual → develop
```

#### Corriger un bug

```bash
# 1. Créer branche bugfix
git checkout develop
git checkout -b bugfix/auth-infinite-loop

# 2. Corriger le bug
git add src/hooks/auth/useAuthCheck.ts
git commit -m "🐛 fix(auth): corriger boucle infinie useAuthCheck

- Extraction logout avec sélecteurs Zustand
- Suppression logout des dépendances useEffect
- Ajout tests unitaires"

# 3. Pousser et PR
git push origin bugfix/auth-infinite-loop
```

#### Hotfix urgent en production

```bash
# 1. Partir de main
git checkout main
git pull origin main

# 2. Créer branche hotfix
git checkout -b hotfix/critical-database-error

# 3. Corriger rapidement
git add src/api/firebase/config.ts
git commit -m "🚑 hotfix: corriger erreur critique connexion database"

# 4. Merge dans main ET develop
git checkout main
git merge hotfix/critical-database-error
git push origin main

git checkout develop
git merge hotfix/critical-database-error
git push origin develop

# 5. Tag version
git tag -a v1.2.1 -m "Hotfix: erreur critique database"
git push origin v1.2.1
```

### 5. Gestion des versions (Semantic Versioning)

#### Créer une nouvelle version

```bash
# 1. S'assurer d'être sur develop
git checkout develop
git pull origin develop

# 2. Mettre à jour CHANGELOG.md et package.json
# (L'agent le fait automatiquement ou via script)
npm run generate-versions

# 3. Commit de version
git add CHANGELOG.md package.json src/store/defaultVersions.ts
git commit -m "🚀 release: v1.2.0 - Module Citations complet

✨ Fonctionnalités:
- Module Citations - Slice 2: Création manuelle
- Formulaire avec upload audio Firebase
- Création depuis conducteur avec pré-remplissage

🐛 Corrections:
- Fix erreur Firestore valeurs undefined
- Fix boucle infinie Auth

🔧 Technique:
- Types Quote flexibles
- Route /quotes/create avec permissions
- Script generate-versions"

# 4. Pousser
git push origin develop

# 5. Merger dans main (production)
git checkout main
git merge develop
git push origin main

# 6. Créer tag Git
git tag -a v1.2.0 -m "Release v1.2.0 - Module Citations"
git push origin v1.2.0

# 7. Créer release GitHub
# Via GitHub UI ou API
```

#### Format de commit pour release

```bash
# Format pour MINOR version (1.1.0 → 1.2.0)
🚀 release: v1.2.0 - [Titre descriptif]

[Description détaillée avec sections]:
✨ Fonctionnalités:
- [Liste des nouvelles fonctionnalités]

🐛 Corrections:
- [Liste des bugs corrigés]

🔧 Technique:
- [Améliorations techniques]

# Format pour PATCH version (1.2.0 → 1.2.1)
🚀 release: v1.2.1 - Corrections et améliorations

🐛 Corrections:
- [Bugs corrigés]

# Format pour MAJOR version (1.2.0 → 2.0.0)
🚀 release: v2.0.0 - Refonte majeure [Module]

💥 Breaking Changes:
- [Changements incompatibles]

✨ Fonctionnalités:
- [Nouvelles fonctionnalités]
```

### 6. Bonnes pratiques Git

#### Commits atomiques
```bash
# ✅ BON : Un commit = une unité logique
git add src/components/quotes/QuoteForm.tsx
git commit -m "✨ feat(quotes): créer composant QuoteForm"

git add src/schemas/quoteSchema.ts
git commit -m "✨ feat(quotes): ajouter schéma validation Zod"

# ❌ MAUVAIS : Tout dans un commit
git add .
git commit -m "add stuff"
```

#### Messages descriptifs
```bash
# ✅ BON : Message explicite
🐛 fix(quotes): corriger erreur Firestore valeurs undefined

Ajout fonction removeUndefined pour nettoyer les données
avant envoi à Firestore. Utilisation de spread operator
conditionnel pour éviter champs vides.

Fixes #123

# ❌ MAUVAIS : Message vague
fix bug
```

#### Vérifications avant commit

```bash
# 1. Vérifier les fichiers modifiés
git status

# 2. Voir les changements
git diff

# 3. Ajouter sélectivement
git add src/components/quotes/QuoteForm.tsx

# 4. Vérifier ce qui sera commité
git diff --staged

# 5. Commiter avec message descriptif
git commit -m "✨ feat(quotes): créer QuoteForm"
```

#### Utilisation de .gitignore

```bash
# ✅ TOUJOURS ignorer
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store

# ✅ Fichiers temporaires
*.swp
*.swo
.vscode/
.idea/

# ⚠️ NE PAS ignorer
src/
public/
package.json
tsconfig.json
README.md
docs/
```

### 7. Résolution de conflits

```bash
# 1. Mettre à jour develop
git checkout develop
git pull origin develop

# 2. Rebaser sa branche
git checkout feature/my-feature
git rebase develop

# 3. Si conflits
# Éditer les fichiers avec conflits
# Rechercher les marqueurs: <<<<<<<, =======, >>>>>>>

# 4. Résoudre et continuer
git add [fichiers-résolus]
git rebase --continue

# 5. Pousser (force si déjà pushé)
git push origin feature/my-feature --force-with-lease
```

### 8. Annulation et corrections

```bash
# Annuler dernier commit (garde les changements)
git reset --soft HEAD~1

# Annuler dernier commit (supprime les changements)
git reset --hard HEAD~1

# Modifier le dernier commit
git commit --amend -m "Nouveau message"

# Annuler des changements non commités
git checkout -- fichier.ts
git restore fichier.ts  # Git 2.23+

# Annuler tous les changements non commités
git reset --hard HEAD
```

---

## Ce que l'agent NE DOIT PAS faire

### ❌ Anti-patterns Git critiques

1. **Ne JAMAIS commiter directement sur main**
   ```bash
   # ❌ INTERDIT
   git checkout main
   git add .
   git commit -m "changes"
   
   # ✅ FAIRE : Passer par develop ou feature branch
   git checkout develop
   git checkout -b feature/my-feature
   ```

2. **Ne JAMAIS commiter des secrets ou credentials**
   ```bash
   # ❌ INTERDIT : Commiter .env
   git add .env
   git commit -m "add config"
   
   # ✅ FAIRE : Ajouter .env à .gitignore
   echo ".env" >> .gitignore
   ```

3. **Ne PAS faire de commits "WIP" ou vagues**
   ```bash
   # ❌ INTERDIT
   git commit -m "wip"
   git commit -m "fix"
   git commit -m "update"
   
   # ✅ FAIRE : Messages descriptifs
   git commit -m "✨ feat(quotes): créer QuoteForm"
   ```

4. **Ne PAS commiter node_modules ou fichiers build**
   ```bash
   # ❌ INTERDIT
   git add node_modules/
   git add dist/
   git add build/
   
   # ✅ FAIRE : Vérifier .gitignore
   ```

5. **Ne PAS oublier de pull avant push**
   ```bash
   # ❌ RISQUÉ
   git push origin develop  # Sans pull avant
   
   # ✅ FAIRE
   git pull origin develop
   git push origin develop
   ```

6. **Ne PAS forcer un push sans précaution**
   ```bash
   # ❌ DANGEREUX
   git push --force
   
   # ✅ FAIRE : Utiliser force-with-lease
   git push --force-with-lease
   ```

---

## Checklist avant commit/push

- [ ] Les fichiers ajoutés sont corrects (`git status`)
- [ ] Les changements sont revus (`git diff --staged`)
- [ ] Pas de secrets/credentials dans les fichiers
- [ ] Pas de node_modules ou fichiers build
- [ ] Le message de commit suit les conventions
- [ ] Le code compile sans erreur
- [ ] Les tests passent (si applicables)
- [ ] La documentation est à jour (CHANGELOG.md)
- [ ] Le numéro de version est correct (si release)

## Checklist avant release

- [ ] CHANGELOG.md mis à jour avec la nouvelle version
- [ ] package.json mis à jour avec le nouveau numéro
- [ ] Script generate-versions exécuté
- [ ] Tous les commits de fonctionnalités sont mergés
- [ ] Les tests passent
- [ ] Le build fonctionne
- [ ] La branche develop est à jour
- [ ] Message de commit de release est descriptif
- [ ] Tag Git sera créé après merge dans main

---

## Exemples de requêtes utilisateur

```
✅ "Commit ce code"
✅ "Push le code sur GitHub"
✅ "Crée une nouvelle version"
✅ "Crée une branche pour la fonctionnalité X"
✅ "Merge cette branche dans develop"
✅ "Crée un tag pour la version 1.2.0"
✅ "Annule le dernier commit"
✅ "Résous les conflits Git"
```

---

## Références et documentation

- **Conventional Commits** : https://www.conventionalcommits.org/
- **Semantic Versioning** : https://semver.org/
- **Git Flow** : https://nvie.com/posts/a-successful-git-branching-model/
- **Gitmoji** : https://gitmoji.dev/
- **Documentation projet** : `docs/VERSIONING.md`, `docs/GIT_WORKFLOW.md`

---

## Métadonnées

- **Version:** 1.0.0
- **Dernière mise à jour:** 2026-01-30
- **Priorité:** Critique
- **Dépendances:** project-overview
- **Utilisé par:** Toutes les opérations Git et versioning
