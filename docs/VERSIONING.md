# 🏷️ Guide de Gestion des Versions - RadioManager SaaS

> Ce document définit la stratégie de versioning du projet, les conventions à suivre, et le processus de mise à jour des versions.

---

## 📚 Table des matières

1. [Semantic Versioning (SemVer)](#-semantic-versioning-semver)
2. [Quand changer la version](#-quand-changer-la-version)
3. [Processus de mise à jour](#-processus-de-mise-à-jour)
4. [Fichiers impactés](#-fichiers-impactés)
5. [Format du CHANGELOG](#-format-du-changelog)
6. [Exemples pratiques](#-exemples-pratiques)
7. [Workflow complet](#-workflow-complet)
8. [FAQ](#-faq)

---

## 📦 Semantic Versioning (SemVer)

Le projet utilise **Semantic Versioning 2.0.0** ([semver.org](https://semver.org/)).

### Format de version

```
MAJOR.MINOR.PATCH

Exemple : 1.2.3
         │ │ │
         │ │ └── PATCH : Corrections de bugs (rétrocompatible)
         │ └──── MINOR : Nouvelles fonctionnalités (rétrocompatible)
         └────── MAJOR : Changements incompatibles (breaking changes)
```

### Les trois composants

| Composant | Quand l'incrémenter | Exemple |
|-----------|---------------------|---------|
| **MAJOR** | Changement incompatible avec les versions précédentes | `1.0.0` → `2.0.0` |
| **MINOR** | Nouvelle fonctionnalité rétrocompatible | `1.0.0` → `1.1.0` |
| **PATCH** | Correction de bug rétrocompatible | `1.0.0` → `1.0.1` |

### Règles de reset

- Quand **MAJOR** augmente → **MINOR** et **PATCH** reviennent à `0`
- Quand **MINOR** augmente → **PATCH** revient à `0`

```
1.2.3 + breaking change = 2.0.0
1.2.3 + new feature     = 1.3.0
1.2.3 + bug fix         = 1.2.4
```

---

## 🔄 Quand changer la version

### 🟢 PATCH (+0.0.1) - Corrections mineures

Incrémenter PATCH pour :

| Type | Emoji | Description | Exemple |
|------|-------|-------------|---------|
| Bug fix | 🐛 | Correction d'un bug | Fix du formulaire qui se réinitialise |
| Hotfix | 🚑 | Correction urgente en production | Fix d'un crash critique |
| Performance | ⚡ | Amélioration de performance | Optimisation d'une requête |
| Refactor | ♻️ | Refactorisation sans changement fonctionnel | Réorganisation du code |
| Style | 🎨 | Changement de style/CSS | Ajustement de couleurs |
| Typo | ✏️ | Correction de fautes | Correction texte UI |
| Chore | 🔧 | Maintenance technique | Mise à jour dépendances |

**Exemples de commits PATCH :**
```
🐛 fix(showPlan): Corriger la persistance des champs formulaire
⚡ perf(api): Optimiser le chargement des conducteurs
♻️ refactor(auth): Simplifier la logique de connexion
🎨 style(button): Ajuster le padding des boutons
```

### 🟡 MINOR (+0.1.0) - Nouvelles fonctionnalités

Incrémenter MINOR pour :

| Type | Emoji | Description | Exemple |
|------|-------|-------------|---------|
| Feature | ✨ | Nouvelle fonctionnalité | Système de notifications |
| New | 🆕 | Nouveau module/page | Page d'archives |
| Enhancement | 💄 | Amélioration UX significative | Nouveau design du dashboard |
| API | 🔌 | Nouvelle API/endpoint | API d'export PDF |

**Exemples de commits MINOR :**
```
✨ feat(notifications): Ajouter le système de notifications temps réel
🆕 feat(archives): Créer le module de gestion des archives
💄 feat(dashboard): Refonte du tableau de bord
🔌 feat(api): Ajouter l'export PDF des conducteurs
```

### 🔴 MAJOR (+1.0.0) - Breaking changes

Incrémenter MAJOR pour :

| Type | Emoji | Description | Exemple |
|------|-------|-------------|---------|
| Breaking | 💥 | Changement incompatible | Refonte de l'API |
| Migration | 🗃️ | Migration de données requise | Nouveau schéma de base |
| Rewrite | 🔨 | Réécriture majeure | Refonte complète d'un module |

**Exemples de commits MAJOR :**
```
💥 breaking(api): Refonte complète de l'API d'authentification
🗃️ migration(db): Nouveau schéma de données pour les conducteurs
🔨 rewrite(showPlan): Réécriture complète du module conducteurs
```

### 📝 Pas de changement de version

Ne PAS changer la version pour :

| Type | Emoji | Description |
|------|-------|-------------|
| Docs | 📝 | Documentation uniquement |
| Comments | 💬 | Ajout de commentaires |
| Tests | ✅ | Ajout/modification de tests |
| CI/CD | 👷 | Configuration CI/CD |
| Git | 🙈 | Fichiers .gitignore |

---

## 🔧 Processus de mise à jour

### Étape 1 : Identifier le type de changement

```
Question : Quel est l'impact de mon changement ?

→ Bug corrigé ?                    → PATCH
→ Nouvelle fonctionnalité ?        → MINOR  
→ Changement incompatible ?        → MAJOR
→ Juste de la doc/tests ?          → Pas de changement
```

### Étape 2 : Calculer la nouvelle version

```bash
# Version actuelle
cat package.json | grep '"version"'
# "version": "1.2.3"

# Calculer selon le type :
# PATCH : 1.2.3 → 1.2.4
# MINOR : 1.2.3 → 1.3.0
# MAJOR : 1.2.3 → 2.0.0
```

### Étape 3 : Mettre à jour les fichiers

1. **package.json** - Changer le numéro de version
2. **CHANGELOG.md** - Ajouter une entrée

### Étape 4 : Committer avec la version

```bash
git add -A
git commit -m "🐛 fix(module): Description - v1.2.4"
# ou
git commit -m "✨ feat(module): Description - v1.3.0"
```

---

## 📁 Fichiers impactés

### package.json

```json
{
  "name": "radio-manager-saas",
  "version": "1.2.4",  // ← Mettre à jour ici
  "private": true,
  ...
}
```

### CHANGELOG.md

Le fichier `CHANGELOG.md` à la racine du projet contient l'historique de toutes les versions.

---

## 📋 Format du CHANGELOG

### Structure globale

```markdown
# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]
- Changements en cours de développement

## [1.3.0] - 2025-12-15
### ✨ Ajouté
- Système de notifications en temps réel
- Export PDF des conducteurs

### 🐛 Corrigé
- Problème de déconnexion intempestive

## [1.2.4] - 2025-12-12
### 🐛 Corrigé
- Persistance des champs formulaire ShowPlan lors de l'ajout de segments
```

### Catégories standard

| Catégorie | Emoji | Usage |
|-----------|-------|-------|
| Ajouté | ✨ | Nouvelles fonctionnalités |
| Modifié | 🔄 | Changements dans les fonctionnalités existantes |
| Déprécié | ⚠️ | Fonctionnalités bientôt supprimées |
| Supprimé | 🗑️ | Fonctionnalités supprimées |
| Corrigé | 🐛 | Corrections de bugs |
| Sécurité | 🔒 | Corrections de vulnérabilités |

### Exemple d'entrée complète

```markdown
## [1.3.0] - 2025-12-15

### ✨ Ajouté
- Système de notifications en temps réel (#123)
  - Notifications push pour les nouveaux messages
  - Badge de compteur sur l'icône
  - Préférences utilisateur pour activer/désactiver
- Export PDF des conducteurs (#124)
  - Bouton d'export sur la page de détail
  - Mise en page professionnelle
  - Inclusion du logo de la radio

### 🔄 Modifié
- Amélioration du design du dashboard (#125)
  - Nouveaux widgets de statistiques
  - Graphique de diffusion en temps réel

### 🐛 Corrigé
- Fix du problème de déconnexion après 1h d'inactivité (#126)
- Correction de l'affichage des dates sur Safari (#127)

### 🔒 Sécurité
- Mise à jour de la dépendance axios (CVE-2025-XXXX)
```

---

## 💡 Exemples pratiques

### Exemple 1 : Correction de bug simple

**Situation :** Le formulaire de création de conducteur perd ses données

```bash
# Version actuelle : 1.2.3

# 1. Corriger le bug dans le code
# 2. Tester que ça fonctionne
# 3. Mettre à jour package.json : "version": "1.2.4"
# 4. Ajouter dans CHANGELOG.md :

## [1.2.4] - 2025-12-12
### 🐛 Corrigé
- Persistance des champs formulaire lors de l'ajout de segments
  - Création du store useShowPlanFormStore
  - Connexion directe au store Zustand

# 5. Committer
git add -A
git commit -m "🐛 fix(showPlan): Corriger la persistance des champs formulaire - v1.2.4"
git push origin develop
```

### Exemple 2 : Nouvelle fonctionnalité

**Situation :** Ajout d'un système de notifications

```bash
# Version actuelle : 1.2.4

# 1. Développer la fonctionnalité
# 2. Tester complètement
# 3. Mettre à jour package.json : "version": "1.3.0"
# 4. Ajouter dans CHANGELOG.md :

## [1.3.0] - 2025-12-15
### ✨ Ajouté
- Système de notifications en temps réel
  - Notifications pour les nouveaux messages
  - Notifications pour les changements de statut
  - Préférences utilisateur

# 5. Committer
git add -A
git commit -m "✨ feat(notifications): Ajouter le système de notifications - v1.3.0"
git push origin develop
```

### Exemple 3 : Breaking change

**Situation :** Refonte de l'API d'authentification

```bash
# Version actuelle : 1.3.0

# 1. Implémenter les changements
# 2. Documenter la migration
# 3. Mettre à jour package.json : "version": "2.0.0"
# 4. Ajouter dans CHANGELOG.md :

## [2.0.0] - 2025-12-20
### 💥 Breaking Changes
- Refonte complète de l'API d'authentification
  - Nouveau format de token JWT
  - Nouveaux endpoints /api/v2/auth/*
  - Migration requise (voir docs/MIGRATION_V2.md)

### ✨ Ajouté
- Support OAuth2 (Google, Microsoft)
- Authentification 2FA

# 5. Committer
git add -A
git commit -m "💥 breaking(auth): Refonte de l'authentification - v2.0.0"
git push origin develop
```

---

## 🔄 Workflow complet

### Diagramme de décision

```
                    ┌─────────────────┐
                    │ Modification du │
                    │     code        │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Type de change- │
                    │     ment ?      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │  Bug    │         │ Feature │         │Breaking │
   │  Fix    │         │   New   │         │ Change  │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ PATCH   │         │  MINOR  │         │  MAJOR  │
   │ +0.0.1  │         │  +0.1.0 │         │  +1.0.0 │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                   ┌────────▼────────┐
                   │ 1. package.json │
                   │ 2. CHANGELOG.md │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │ git commit -m   │
                   │ "emoji message  │
                   │  - vX.Y.Z"      │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │   git push      │
                   └─────────────────┘
```

### Checklist avant release

- [ ] Code testé et fonctionnel
- [ ] Build passe sans erreur (`npm run build`)
- [ ] Version calculée selon SemVer
- [ ] `package.json` mis à jour
- [ ] `CHANGELOG.md` mis à jour avec la date
- [ ] Commit avec message formaté et version
- [ ] Push sur la bonne branche

---

## ❓ FAQ

### Q: Dois-je changer la version pour chaque commit ?

**R:** Non, seulement pour les commits qui apportent une valeur visible aux utilisateurs ou qui modifient le comportement de l'application. Les commits de documentation pure, de tests, ou de configuration CI ne nécessitent pas de changement de version.

### Q: Que faire si j'ai plusieurs fixes dans un même commit ?

**R:** Un seul changement de version PATCH suffit. Listez tous les fixes dans le CHANGELOG.

```markdown
## [1.2.4] - 2025-12-12
### 🐛 Corrigé
- Fix du formulaire de conducteur
- Fix de l'affichage des dates
- Fix du menu mobile
```

### Q: Comment gérer plusieurs features en parallèle ?

**R:** Chaque feature peut être développée dans sa branche. Au moment du merge dans `develop`, la version MINOR est incrémentée une seule fois avec toutes les features listées.

### Q: Qui est responsable de la mise à jour de la version ?

**R:** L'agent IA ou le développeur qui effectue le commit doit s'assurer que la version est mise à jour selon les règles définies.

### Q: Peut-on revenir à une version précédente ?

**R:** Non, les versions sont toujours incrémentales. Si un bug est introduit, on le corrige avec un nouveau PATCH.

### Q: Version de développement vs production ?

**R:** 
- **develop** : La version reflète les derniers changements
- **main** : La version est celle déployée en production
- Lors du merge develop → main, la version de develop est celle qui sera en production

---

## 📎 Ressources

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [AGENT.md](../AGENT.md) - Guide pour les agents IA

---

> **Note :** Ce guide doit être consulté par tout développeur ou agent IA avant de faire un commit qui modifie le comportement de l'application.
