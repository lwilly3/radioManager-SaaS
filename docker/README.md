# 🐳 Documentation Docker

Ce dossier contient tous les fichiers nécessaires pour le déploiement Docker de l'application.

## 📁 Structure

```
docker/
├── README.md                    # Ce fichier
├── Dockerfile                   # Image Docker multi-stage (Node + Nginx)
├── docker-compose.yml           # Configuration pour Dokploy
├── nginx.conf                   # Configuration Nginx pour React SPA
├── .dockerignore               # Fichiers à exclure du build
└── DOKPLOY_DEPLOYMENT.md       # Guide complet de déploiement sur Dokploy
```

## 🚀 Déploiement

Pour déployer l'application, consultez le guide complet : **[DOKPLOY_DEPLOYMENT.md](./DOKPLOY_DEPLOYMENT.md)**

## 🔧 Utilisation locale

### Build de l'image Docker
```bash
docker build -t radioaudace-frontend -f docker/Dockerfile .
```

### Lancer le conteneur localement
```bash
docker run -p 3001:80 \
  -e VITE_API_BASE_URL=https://api.audace.ovh \
  radioaudace-frontend
```

### Utiliser docker-compose
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## 📝 Fichiers

### `Dockerfile`
- Build multi-stage optimisé
- Stage 1 : Build de l'application avec Node.js
- Stage 2 : Serveur Nginx pour la production

### `docker-compose.yml`
- Configuration pour Dokploy
- Variables d'environnement
- Labels Traefik pour le reverse proxy
- Réseau Docker

### `nginx.conf`
- Configuration Nginx optimisée pour React SPA
- Gestion du routage client-side
- Compression Gzip
- Cache des assets statiques
- Headers de sécurité

### `.dockerignore`
- Optimisation du contexte de build
- Exclusion des fichiers inutiles (node_modules, .git, etc.)

## 🌍 Environnements

Les variables d'environnement sont définies dans :
- **Développement local** : `.env.local` à la racine du projet
- **Production (Docker)** : `docker-compose.yml`

Voir `.env.example` à la racine pour la liste complète des variables.

## 📞 Support

- Backend : https://github.com/lwilly3/api.audace
- Frontend : https://github.com/lwilly3/radioManager-SaaS
