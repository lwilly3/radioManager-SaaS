# 🌿 Guide de Workflow Git - Stratégie de Branches

> Ce document définit la stratégie de branches Git pour gérer les déploiements sur les deux environnements : **Production** et **Test**.

---

## 📋 Table des matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Les environnements](#-les-environnements)
3. [Les branches](#-les-branches)
4. [Workflow de développement](#-workflow-de-développement)
5. [Exemples pratiques](#-exemples-pratiques)
6. [Configuration des déploiements](#-configuration-des-déploiements)
7. [Commandes Git essentielles](#-commandes-git-essentielles)
8. [FAQ et cas d'usage](#-faq-et-cas-dusage)
9. [Instructions pour les agents IA](#-instructions-pour-les-agents-ia)

---

## 🎯 Vue d'ensemble

### Pourquoi cette stratégie ?

Nous avons **deux serveurs** avec des rôles différents :

| Serveur | Rôle | Stabilité requise |
|---------|------|-------------------|
| Docker/Dokploy | **Production** - Utilisateurs finaux | 🔴 Critique |
| VPS/venv | **Test** - Validation avant prod | 🟡 Moyenne |

### Principe de base

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUX DE CODE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Développeur    ──►    Test          ──►    Production         │
│   (feature/*)          (develop)            (main)              │
│                                                                  │
│   "Je code"           "Je valide"          "Je déploie"         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Les environnements

### 1. Production (Docker/Dokploy)

| Propriété | Valeur |
|-----------|--------|
| **URL Frontend** | `https://app.cloud.audace.ovh` |
| **URL API** | `https://api.cloud.audace.ovh` |
| **Branche Git** | `main` |
| **Déploiement** | Automatique (Dokploy autodeploy) |
| **Infrastructure** | Docker sur VPS Dokploy |

**Caractéristiques :**
- ✅ Code stable et testé
- ✅ Utilisé par les utilisateurs finaux
- ✅ Pas d'expérimentation
- ⚠️ Tout bug impacte les utilisateurs

### 2. Test (VPS venv)

| Propriété | Valeur |
|-----------|--------|
| **URL Frontend** | `https://app.radio.audace.ovh` (ou similaire) |
| **URL API** | `https://api.radio.audace.ovh` |
| **Branche Git** | `develop` |
| **Déploiement** | Automatique (GitHub Actions) |
| **Infrastructure** | VPS avec venv |

**Caractéristiques :**
- ✅ Tester les nouvelles fonctionnalités
- ✅ Détecter les bugs avant la production
- ✅ Expérimentation autorisée
- ⚠️ Peut être instable

---

## 🌿 Les branches

### Schéma des branches

```
                                    PRODUCTION
                                    (Utilisateurs)
                                         │
                    ┌────────────────────▼────────────────────┐
                    │              main                        │
                    │  • Code stable uniquement                │
                    │  • Déploie sur Docker/Dokploy            │
                    │  • URL: api.cloud.audace.ovh             │
                    └────────────────────▲────────────────────┘
                                         │
                                    Pull Request
                                    (après validation)
                                         │
                    ┌────────────────────┴────────────────────┐
                    │            develop                       │
                    │  • Code en cours de validation           │
                    │  • Déploie sur VPS/venv                  │
                    │  • URL: api.radio.audace.ovh             │
                    └────────────────────▲────────────────────┘
                                         │
                                    Pull Request
                                    (feature terminée)
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
    ┌─────────▼─────────┐    ┌───────────▼───────────┐    ┌─────────▼─────────┐
    │  feature/chat     │    │  feature/dashboard    │    │    fix/login      │
    │  Nouvelle feature │    │  Nouvelle feature     │    │  Correction bug   │
    └───────────────────┘    └───────────────────────┘    └───────────────────┘
              │                          │                          │
              └──────────────────────────┴──────────────────────────┘
                                         │
                                    Développement
                                    (local)
```

### Description des branches

| Branche | Usage | Déploiement | Protection |
|---------|-------|-------------|------------|
| `main` | Production stable | Docker/Dokploy | ✅ Protégée (PR requise) |
| `develop` | Intégration/Test | VPS venv | ⚠️ Semi-protégée |
| `feature/*` | Nouvelles fonctionnalités | Aucun | ❌ Non protégée |
| `fix/*` | Corrections de bugs | Aucun | ❌ Non protégée |
| `hotfix/*` | Corrections urgentes prod | Direct → main | ❌ Non protégée |

---

## 🔄 Workflow de développement

### Cycle de vie d'une fonctionnalité

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CYCLE DE VIE D'UNE FONCTIONNALITÉ                    │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
    │ ÉTAPE 1 │ ──► │ ÉTAPE 2 │ ──► │ ÉTAPE 3 │ ──► │ ÉTAPE 4 │
    │ Créer   │     │ Coder   │     │ Tester  │     │ Déployer│
    │ branche │     │         │     │ staging │     │ prod    │
    └─────────┘     └─────────┘     └─────────┘     └─────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
    feature/X      commits sur     merge dans      merge dans
    depuis         feature/X       develop         main
    develop
```

### Étape 1 : Créer une branche feature

```bash
# Se placer sur develop (toujours à jour)
git checkout develop
git pull origin develop

# Créer la branche feature
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### Étape 2 : Développer et commiter

```bash
# Faire des modifications...
git add .
git commit -m "✨ feat(module): Description de la modification"

# Pousser régulièrement
git push origin feature/ma-nouvelle-fonctionnalite
```

### Étape 3 : Merger dans develop (Test)

```bash
# Mettre à jour develop
git checkout develop
git pull origin develop

# Merger la feature
git merge feature/ma-nouvelle-fonctionnalite
git push origin develop

# ➡️ Le VPS venv se met à jour automatiquement
# ➡️ Tester sur https://api.radio.audace.ovh
```

### Étape 4 : Merger dans main (Production)

```bash
# Après validation sur staging
git checkout main
git pull origin main

# Merger develop
git merge develop
git push origin main

# ➡️ Docker/Dokploy se met à jour automatiquement
# ➡️ Vérifier sur https://api.cloud.audace.ovh
```

---

## 📝 Exemples pratiques

### Exemple 1 : Ajouter une nouvelle page

```bash
# 1. Créer la branche
git checkout develop
git pull origin develop
git checkout -b feature/page-statistiques

# 2. Développer (plusieurs commits possibles)
# ... créer src/pages/Statistics.tsx
git add .
git commit -m "✨ feat(stats): Créer la page statistiques"

# ... ajouter le routing
git add .
git commit -m "✨ feat(stats): Ajouter route /statistics"

# ... ajouter les composants
git add .
git commit -m "✨ feat(stats): Ajouter graphiques et filtres"

# 3. Pousser la feature
git push origin feature/page-statistiques

# 4. Merger dans develop pour tester
git checkout develop
git merge feature/page-statistiques
git push origin develop
# ➡️ Attendre le déploiement sur VPS venv
# ➡️ Tester sur staging

# 5. Si tout est OK, merger dans main
git checkout main
git merge develop
git push origin main
# ➡️ Déployé en production !

# 6. Supprimer la branche feature
git branch -d feature/page-statistiques
git push origin --delete feature/page-statistiques
```

### Exemple 2 : Corriger un bug non urgent

```bash
# 1. Créer la branche fix
git checkout develop
git pull origin develop
git checkout -b fix/login-token-expiry

# 2. Corriger le bug
# ... modifications
git add .
git commit -m "🐛 fix(auth): Corriger expiration token"

# 3. Tester sur staging
git checkout develop
git merge fix/login-token-expiry
git push origin develop
# ➡️ Tester sur staging

# 4. Déployer en production
git checkout main
git merge develop
git push origin main
```

### Exemple 3 : Hotfix urgent en production

```bash
# ⚠️ UNIQUEMENT pour les bugs critiques en production

# 1. Créer hotfix depuis main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Corriger rapidement
git add .
git commit -m "🚨 hotfix(security): Corriger faille XSS"

# 3. Merger directement dans main
git checkout main
git merge hotfix/critical-security-fix
git push origin main
# ➡️ Déployé immédiatement en production

# 4. Backporter dans develop
git checkout develop
git merge hotfix/critical-security-fix
git push origin develop

# 5. Supprimer la branche hotfix
git branch -d hotfix/critical-security-fix
```

### Exemple 4 : Travail collaboratif sur une feature

```bash
# Développeur A crée la feature
git checkout develop
git checkout -b feature/chat-v2

# Développeur A pousse ses modifications
git push origin feature/chat-v2

# Développeur B récupère la feature
git fetch origin
git checkout feature/chat-v2

# Développeur B fait ses modifications
git add .
git commit -m "✨ feat(chat): Ajouter emojis"
git push origin feature/chat-v2

# Développeur A récupère les modifications de B
git pull origin feature/chat-v2
```

---

## ⚙️ Configuration des déploiements

### Fichiers de workflow GitHub Actions

```
.github/workflows/
└── deploy-staging.yml   # Test (develop → VPS venv)
```

> **Note :** Le déploiement en production (branche `main`) est géré par **Dokploy** avec autodeploy, pas par GitHub Actions.

### Test : `.github/workflows/deploy-staging.yml`

Ce fichier déploie automatiquement la branche `develop` sur le serveur de test :

```yaml
name: Deploy to Test Server (VPS venv)

# ┌─────────────────────────────────────────────────────────────┐
# │  DÉPLOIEMENT SERVEUR TEST                                   │
# │  Branche: develop                                           │
# │  Serveur: VPS venv (api.radio.audace.ovh)                   │
# │  Usage: Test et validation avant mise en production         │
# └─────────────────────────────────────────────────────────────┘

on:
  push:
    branches:
      - develop  # ⚠️ Uniquement la branche develop

jobs:
  deploy_test:
    runs-on: ubuntu-latest

    steps:
      - name: Pull Git Repository
        uses: actions/checkout@v2

      - name: Deploy to Test Server (VPS venv)
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USERNAME }}
          password: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/app-radioaudace-test
            sudo git fetch origin develop
            sudo git reset --hard origin/develop
            sudo /usr/local/bin/update_frontend_test.sh
```

### Production : Dokploy (autodeploy)

La branche `main` est déployée automatiquement via **Dokploy** :

```
Dans Dokploy → Application → Settings :
─────────────────────────────────────────
Repository: lwilly3/radioManager-SaaS
Branch: main
Auto Deploy: ON ✅
```

### Secrets GitHub (existants)

Les secrets sont déjà configurés et utilisés pour le déploiement test :

| Secret | Description | Utilisé par |
|--------|-------------|-------------|
| `SERVER_IP` | IP du serveur VPS | deploy-staging.yml |
| `SERVER_USERNAME` | Utilisateur SSH | deploy-staging.yml |
| `SSH_PRIVATE_KEY` | Mot de passe SSH | deploy-staging.yml |
### Variables d'environnement par branche

| Variable | develop (test) | main (production) |
|----------|----------------|-------------------|
| `VITE_API_BASE_URL` | `https://api.radio.audace.ovh` | `https://api.cloud.audace.ovh` |
| `VITE_ENV` | `test` | `production` |
| `VITE_DEBUG` | `true` | `false` |

---

## 💻 Commandes Git essentielles

### Commandes quotidiennes

```bash
# Voir sur quelle branche je suis
git branch

# Voir toutes les branches (locales + remote)
git branch -a

# Changer de branche
git checkout nom-branche

# Créer et changer de branche
git checkout -b nouvelle-branche

# Mettre à jour la branche actuelle
git pull origin nom-branche

# Voir l'état des fichiers
git status

# Voir l'historique
git log --oneline -10
```

### Commandes de merge

```bash
# Merger une branche dans la branche actuelle
git merge nom-branche

# Annuler un merge en cours
git merge --abort

# Voir les conflits
git diff --name-only --diff-filter=U
```

### Commandes de nettoyage

```bash
# Supprimer une branche locale
git branch -d nom-branche

# Supprimer une branche remote
git push origin --delete nom-branche

# Nettoyer les références aux branches supprimées
git fetch --prune
```

### Commandes de synchronisation

```bash
# Récupérer les changements sans merger
git fetch origin

# Voir les différences avec remote
git diff origin/main

# Forcer la mise à jour (⚠️ ATTENTION)
git reset --hard origin/main
```

---

## ❓ FAQ et cas d'usage

### Q1 : Sur quelle branche dois-je travailler ?

```
┌─────────────────────────────────────────────────────────────┐
│ QUESTION : Que voulez-vous faire ?                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🆕 Nouvelle fonctionnalité ?                                │
│    → Créer feature/* depuis develop                         │
│                                                             │
│ 🐛 Corriger un bug ?                                        │
│    → Créer fix/* depuis develop                             │
│                                                             │
│ 🚨 Corriger un bug URGENT en production ?                   │
│    → Créer hotfix/* depuis main                             │
│                                                             │
│ 📝 Modifier la documentation ?                              │
│    → Commiter directement sur develop                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Q2 : Comment savoir si mon code est en production ?

```bash
# Vérifier si un commit est dans main
git branch --contains <commit-hash>

# Si "main" apparaît → le commit est en production
```

### Q3 : J'ai fait un commit sur la mauvaise branche, que faire ?

```bash
# Si pas encore poussé
git reset HEAD~1  # Annuler le commit (garder les fichiers)
git stash         # Mettre de côté les modifications
git checkout bonne-branche
git stash pop     # Récupérer les modifications
git add .
git commit -m "..."
```

### Q4 : Il y a des conflits lors du merge, que faire ?

```bash
# 1. Identifier les fichiers en conflit
git status

# 2. Ouvrir chaque fichier et résoudre les conflits
#    Chercher les marqueurs : <<<<<<<, =======, >>>>>>>

# 3. Marquer comme résolu
git add fichier-resolu.ts

# 4. Terminer le merge
git commit -m "🔀 merge: Résoudre conflits"
```

### Q5 : Comment annuler un déploiement en production ?

```bash
# 1. Identifier le commit stable précédent
git log --oneline main

# 2. Revenir à ce commit
git checkout main
git revert HEAD  # Crée un nouveau commit qui annule le précédent
git push origin main

# Ou pour revenir à un commit spécifique (plus radical)
git reset --hard <commit-hash>
git push --force origin main  # ⚠️ ATTENTION : Force push
```

---

## 🤖 Instructions pour les agents IA

### Règles générales

1. **Toujours demander** sur quelle branche travailler si pas précisé
2. **Par défaut**, créer une branche `feature/*` ou `fix/*` depuis `develop`
3. **Ne jamais** commiter directement sur `main` sans validation explicite
4. **Toujours** expliquer les implications du merge vers `main`

### ⚠️ IMPORTANT : Où pousser le code ?

```
┌─────────────────────────────────────────────────────────────────────┐
│  RÈGLE PRINCIPALE : TOUJOURS POUSSER SUR "develop" PAR DÉFAUT       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Quand l'utilisateur dit :              L'agent doit :              │
│  ─────────────────────────────────────────────────────────────────  │
│  "pousse le code"                  →    git push origin develop     │
│  "push"                            →    git push origin develop     │
│  "envoie sur git"                  →    git push origin develop     │
│  "commit et push"                  →    git push origin develop     │
│                                                                     │
│  SAUF si l'utilisateur dit explicitement :                          │
│  ─────────────────────────────────────────────────────────────────  │
│  "pousse sur main"                 →    git push origin main        │
│  "pousse en production"            →    git push origin main        │
│  "déploie en prod"                 →    git push origin main        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Commande de push standard pour les agents

```bash
# ═══════════════════════════════════════════════════════════════════
# COMMANDE STANDARD - À utiliser quand l'utilisateur demande de pousser
# ═══════════════════════════════════════════════════════════════════

# 1. Vérifier qu'on est sur develop (ou y aller)
git checkout develop

# 2. Ajouter les modifications
git add -A

# 3. Commit avec message conventionnel
git commit -m "📝 type(scope): Description"

# 4. Pousser sur develop (serveur TEST)
git push origin develop

# ═══════════════════════════════════════════════════════════════════
```

### Quand pousser sur main (production) ?

L'agent ne doit pousser sur `main` **QUE SI** :
1. L'utilisateur dit explicitement "pousse sur main" ou "en production"
2. L'utilisateur a validé les tests sur le serveur de test
3. L'agent a demandé confirmation : "Cela va déployer en production. Confirmer ?"

```bash
# UNIQUEMENT après confirmation explicite de l'utilisateur
git checkout main
git merge develop
git push origin main
```

### Avant de faire un commit

```markdown
Checklist agent IA :
- [ ] Suis-je sur la bonne branche ?
- [ ] La branche est-elle à jour avec son origine ?
- [ ] Le message de commit suit-il les conventions ?
- [ ] Les modifications sont-elles testables ?
```

### Messages de commit par type

```bash
# Nouvelle fonctionnalité
git commit -m "✨ feat(module): Description"

# Correction de bug
git commit -m "🐛 fix(module): Description"

# Documentation
git commit -m "📝 docs: Description"

# Refactoring
git commit -m "♻️ refactor(module): Description"

# Hotfix urgent
git commit -m "🚨 hotfix(module): Description"
```

### Workflow recommandé pour les agents

```bash
# 1. Toujours vérifier la branche actuelle
git branch

# 2. Toujours mettre à jour avant de travailler
git pull origin $(git branch --show-current)

# 3. Pour une nouvelle tâche, créer une branche
git checkout develop
git checkout -b feature/nom-descriptif

# 4. Après les modifications, proposer le merge
# Demander à l'utilisateur : "Voulez-vous merger dans develop pour tester ?"
```

### Détection de l'environnement cible

Si l'utilisateur mentionne :
- "production", "prod", "live", "cloud.audace" → Branche `main`
- "test", "staging", "dev", "radio.audace" → Branche `develop`
- "nouvelle fonctionnalité", "feature" → Créer `feature/*`
- "bug", "fix", "correction" → Créer `fix/*`

---

## 📊 Résumé visuel

```
┌─────────────────────────────────────────────────────────────────────┐
│                      RÉSUMÉ DU WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  feature/* ──┬──► develop ──────────────► main                      │
│  fix/*     ──┘         │                    │                       │
│                        ▼                    ▼                       │
│                   VPS/venv            Docker/Dokploy                │
│                    (Test)             (Production)                  │
│                        │                    │                       │
│                        ▼                    ▼                       │
│              api.radio.audace.ovh   api.cloud.audace.ovh            │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  🟢 main     = Stable, testé, pour les utilisateurs                 │
│  🟡 develop  = En cours de test, peut avoir des bugs                │
│  🔵 feature  = Travail en cours, local uniquement                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Documents liés

- [AGENT.md](../AGENT.md) - Guide pour les agents IA
- [CHANGELOG.md](../CHANGELOG.md) - Historique des modifications
- [API_MIGRATION_GUIDE.md](API_MIGRATION_GUIDE.md) - Guide de migration API
- [DOCKER_INFO.md](../DOCKER_INFO.md) - Configuration Docker/Dokploy

---

> **Dernière mise à jour :** 12 décembre 2025
> **Auteur :** Documentation générée pour RadioManager SaaS
