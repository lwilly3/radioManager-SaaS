# Stage 1: Build de l'application React
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci --legacy-peer-deps

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Stage 2: Serveur Nginx pour servir l'application
FROM nginx:alpine

# Copie de la configuration Nginx personnalisée
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers buildés depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposition du port 80
EXPOSE 80

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]
