# Déploiement du Frontend Radio Manager sur Dokploy

## 📋 Pré-requis

- Accès à votre serveur Dokploy : http://cloud.audace.ovh:3000/
- Backend déjà déployé sur : https://api.cloud.audace.ovh
- Repository GitHub : https://github.com/lwilly3/radioManager-SaaS

## 🌍 Environnements

Le projet est configuré pour fonctionner avec deux environnements distincts :

### 🧪 Environnement de Test (Développement Local)

- **URL Backend** : `https://api.audace.ovh`
- **Utilisation** : Développement local et tests
- **Configuration** :
  1. Créez un fichier `.env.local` à la racine du projet
  2. Ajoutez la ligne : `VITE_API_BASE_URL=https://api.audace.ovh`
  3. Lancez l'application avec `npm run dev`

### 🚀 Environnement de Production (Docker)

- **URL Backend** : `https://api.cloud.audace.ovh`
- **URL Frontend** : `https://app.cloud.audace.ovh`
- **Utilisation** : Production sur Dokploy
- **Configuration** : Variables définies dans `docker-compose.yml`

> ⚠️ **Important** : Le fichier `.env.local` est ignoré par Git (dans `.gitignore`) et ne sera pas inclus dans le build Docker. Cela garantit que chaque environnement utilise sa propre configuration.

## 🚀 Instructions de déploiement sur Dokploy

### 1. Créer un nouveau service dans Dokploy

1. Connectez-vous à votre Dokploy : http://cloud.audace.ovh:3000/
2. Accédez à votre projet
3. Cliquez sur **"Add Service"** ou **"Ajouter un service"**
4. Sélectionnez **"Docker Compose"**

### 2. Configuration du service

**Nom du service** : `radioaudace-frontend` (ou votre choix)

**Repository** : `https://github.com/lwilly3/radioManager-SaaS`

**Branche** : `main`

**Docker Compose File Path** : `docker/docker-compose.yml`

### 3. Variables d'environnement à configurer dans Dokploy

Dans la section "Environment Variables" de Dokploy, ajoutez :

```env
# ⚠️ IMPORTANT : Modifier cette URL selon votre environnement
# Production : https://api.cloud.audace.ovh
# Test : https://api.audace.ovh
VITE_API_BASE_URL=https://api.cloud.audace.ovh
NODE_ENV=production
```

Si vous utilisez Firebase, ajoutez également :
```env
VITE_FIREBASE_API_KEY=votre_clé
VITE_FIREBASE_AUTH_DOMAIN=votre_domaine
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

### 4. Configuration du domaine

Dans les paramètres Traefik de Dokploy :

- **Domaine** : `app.cloud.audace.ovh` _(⚠️ Modifier selon votre domaine)_
- **Port interne** : `80`
- **HTTPS** : Activé (Let's Encrypt)

### 5. Réseau Docker

Les réseaux Docker sont automatiquement gérés :

- **audace_network** : Créé par le service backend, partagé avec le frontend
- **dokploy-network** : Créé par Dokploy pour Traefik

Aucune action manuelle n'est nécessaire si le backend est déjà déployé.

### 6. Déploiement

1. Cliquez sur **"Deploy"** ou **"Déployer"**
2. Dokploy va :
   - Cloner le repository
   - Builder l'image Docker (étape de build Node.js + Nginx)
   - Démarrer le conteneur
   - Configurer Traefik pour le reverse proxy

### 7. Vérification

Une fois le déploiement terminé :

1. Accédez à votre domaine : `https://app.cloud.audace.ovh`
2. Vérifiez que l'application se charge correctement
3. Testez la connexion avec le backend

## 🔧 Architecture du déploiement

### Vue d'ensemble

```
┌────────────────────────────────────────────────────────────────┐
│                  Dokploy (cloud.audace.ovh:3000)               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   dokploy-network                        │ │
│  │              (Traefik Reverse Proxy + SSL)              │ │
│  └──────────────────────────────────────────────────────────┘ │
│           │                              │                     │
│           │ HTTPS                        │ HTTPS               │
│           ▼                              ▼                     │
│  ┌─────────────────────┐      ┌──────────────────────┐        │
│  │    Frontend         │      │     Backend API      │        │
│  │  (React + Nginx)    │      │     (FastAPI)        │        │
│  │ app.cloud.audace.ovh│      │ api.cloud.audace.ovh │        │
│  │  Port interne: 80   │      │  Port interne: 8000  │        │
│  └──────────┬──────────┘      └──────────┬───────────┘        │
│             │                            │                     │
│             │  Appels API HTTPS          │                     │
│             └────────────────────────────┘                     │
│                                          │                     │
│  ┌──────────────────────────────────────┴──────────────────┐  │
│  │                   audace_network                         │  │
│  │            (Communication interne services)              │  │
│  └──────────────────────────────────────┬──────────────────┘  │
│                                          │                     │
│                                          ▼                     │
│                                 ┌────────────────┐             │
│                                 │   PostgreSQL   │             │
│                                 │  Port: 5432    │             │
│                                 └────────────────┘             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Réseaux Docker

1. **dokploy-network** (externe)
   - Géré par Traefik
   - Gère le routing HTTP/HTTPS
   - Certificats SSL via Let's Encrypt
   - Les deux services (frontend et backend) y sont connectés

2. **audace_network** (externe)
   - Réseau partagé entre tous les services
   - Permet la communication interne entre frontend, backend et PostgreSQL
   - Créé automatiquement par le service backend

### Flux de communication

1. **Utilisateur → Frontend**
   - `https://app.cloud.audace.ovh` → Traefik → Frontend (Nginx)
   - Nginx sert les fichiers React buildés

2. **Frontend → Backend**
   - L'application React fait des appels API à `https://api.cloud.audace.ovh`
   - Via `dokploy-network` et Traefik
   - Variable d'environnement : `VITE_API_BASE_URL`

3. **Backend → Database**
   - FastAPI se connecte à PostgreSQL via `audace_network`
   - Communication interne (non exposée publiquement)

## 🔧 Structure du déploiement (ancienne version simplifiée)

```
┌─────────────────────────────────────┐
│     Dokploy (cloud.audace.ovh)      │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Frontend (Nginx)           │   │
│  │  app.cloud.audace.ovh       │   │
│  │  Port: 80 (interne)         │   │
│  └─────────────┬───────────────┘   │
│                │                    │
│                │ Appels API         │
│                ▼                    │
│  ┌─────────────────────────────┐   │
│  │  Backend API                │   │
│  │  api.cloud.audace.ovh       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 📁 Fichiers créés

- **Dockerfile** : Build multi-stage (Node + Nginx)
- **docker-compose.yml** : Configuration du service pour Dokploy
- **nginx.conf** : Configuration Nginx optimisée pour React SPA
- **.dockerignore** : Optimisation du contexte Docker
- **.env.example** : Documentation des variables d'environnement
- **.env.local** : Configuration pour le développement local (non commité)

## 🔍 Dépannage

### Le build échoue

- Vérifiez les logs de build dans Dokploy
- Assurez-vous que toutes les dépendances sont dans `package.json`

### L'application ne se charge pas

- Vérifiez que le port 80 est bien exposé
- Consultez les logs du conteneur dans Dokploy

### Erreurs API

- Vérifiez que `VITE_API_BASE_URL` est correctement définie _(⚠️ Doit correspondre à l'environnement : api.cloud.audace.ovh pour production, api.audace.ovh pour test)_
- Testez l'accès au backend : `curl https://api.cloud.audace.ovh` _(⚠️ Modifier l'URL selon l'environnement)_
- Vérifiez les CORS sur le backend

### Problèmes de routage React

- Le fichier `nginx.conf` gère déjà le routage SPA
- Toutes les routes renvoient vers `index.html`

## 🔄 Redéploiement

Pour redéployer après un push sur `main` :

1. Les webhooks GitHub devraient déclencher un redéploiement automatique
2. Ou cliquez manuellement sur "Redeploy" dans Dokploy

## 📞 Support

- Backend : https://github.com/lwilly3/api.audace
- Frontend : https://github.com/lwilly3/radioManager-SaaS
