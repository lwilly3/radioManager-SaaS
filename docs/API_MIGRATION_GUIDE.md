# 🔧 Guide de Migration API - Configuration URLs

> Ce document liste tous les fichiers contenant des URLs API hardcodées et explique comment les centraliser vers `https://api.cloud.audace.ovh`.

---

## 📍 Résumé des modifications à effectuer

| Fichier | Ligne(s) | Action requise |
|---------|----------|----------------|
| `src/api/api.ts` | ~3-6 | Modifier l'URL de base + ajouter variable d'environnement |
| `src/api/auth.ts` | ~5 | Supprimer URL hardcodée, utiliser instance `api` |
| `src/services/api/emissions.ts` | ~4 | Supprimer `API_URL` inutilisée |
| `src/services/api/shows.ts` | ~3 | Supprimer `API_URL` inutilisée |

---

## 🎯 URL de production cible

```
https://api.cloud.audace.ovh
```

---

## 📁 Fichier 1 : `src/api/api.ts`

### Localisation
```
src/api/api.ts
```

### État actuel (lignes 1-10)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.radio.audace.ovh/',  // ⚠️ À modifier
});

export default api;
```

### Code corrigé
```typescript
import axios from 'axios';

// URL par défaut - utilise la variable d'environnement si disponible
const DEFAULT_API_BASE_URL = 'https://api.cloud.audace.ovh';

const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, ''); // Supprime le slash final

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Export de l'URL pour usage dans d'autres fichiers si nécessaire
export { API_BASE_URL };
export default api;
```

### Pourquoi cette modification ?
- Centralise la configuration de l'URL API
- Permet de surcharger via variable d'environnement
- Supprime le slash final pour éviter les doubles slashes

---

## 📁 Fichier 2 : `src/api/auth.ts`

### Localisation
```
src/api/auth.ts
```

### État actuel (lignes 1-20)
```typescript
import axios from 'axios';                    // ⚠️ Ne devrait pas utiliser axios directement
import type { LoginCredentials, LoginResponse } from '../types/auth';
import { console } from 'inspector';

const API_URL = 'https://api.radio.audace.ovh';  // ⚠️ À supprimer

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const params = new URLSearchParams();
  
  Object.entries(credentials).forEach(([key, value]) => {
    params.append(key, value);
  });

  console.log('params:', params);
  const response = await axios.post<LoginResponse>(   // ⚠️ Utilise axios.post direct
    `${API_URL}/login`,                               // ⚠️ Utilise API_URL
    params,
    // ...
  );
```

### Code corrigé
```typescript
import api from './api';  // ✅ Utilise l'instance centralisée
import type { LoginCredentials, LoginResponse } from '../types/auth';

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const params = new URLSearchParams();
  
  Object.entries(credentials).forEach(([key, value]) => {
    params.append(key, value);
  });

  const response = await api.post<LoginResponse>(  // ✅ Utilise api.post
    '/login',                                       // ✅ Chemin relatif
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
};
```

### Pourquoi cette modification ?
- Utilise l'instance Axios centralisée au lieu de créer des appels séparés
- Élimine la duplication de l'URL API
- Utilise des chemins relatifs (`/login`) au lieu de chemins absolus

---

## 📁 Fichier 3 : `src/services/api/emissions.ts`

### Localisation
```
src/services/api/emissions.ts
```

### État actuel (lignes 1-10)
```typescript
import api from '../../api/api';
import axios from 'axios';                              // ⚠️ Import inutile

const API_URL = 'https://api.radio.audace.ovh/';       // ⚠️ Variable inutilisée

// ... reste du fichier utilise déjà `api` correctement
```

### Code corrigé
```typescript
import api from '../../api/api';
// Supprimé: import axios from 'axios';
// Supprimé: const API_URL = 'https://api.radio.audace.ovh/';

// ... reste du fichier inchangé
```

### Pourquoi cette modification ?
- L'import `axios` n'est pas utilisé directement
- La variable `API_URL` n'est pas utilisée (le fichier utilise déjà `api`)
- Nettoyage de code mort

---

## 📁 Fichier 4 : `src/services/api/shows.ts`

### Localisation
```
src/services/api/shows.ts
```

### État actuel (lignes 1-10)
```typescript
import api from '../../api/api';

const API_URL = 'https://api.radio.audace.ovh';        // ⚠️ Variable inutilisée

// ... reste du fichier utilise déjà `api` correctement
```

### Code corrigé
```typescript
import api from '../../api/api';
// Supprimé: const API_URL = 'https://api.radio.audace.ovh';

// ... reste du fichier inchangé
```

### Pourquoi cette modification ?
- La variable `API_URL` n'est pas utilisée
- Le fichier utilise déjà l'instance `api` pour tous les appels

---

## ✅ Fichiers déjà corrects (aucune modification nécessaire)

Ces fichiers utilisent déjà correctement l'instance `api` centralisée :

| Fichier | Vérification |
|---------|--------------|
| `src/services/api/guests.ts` | ✅ Utilise `api` |
| `src/services/api/presenters.ts` | ✅ Utilise `api` |
| `src/services/api/users.ts` | ✅ Utilise `api` |
| `src/services/api/roles.ts` | ✅ Utilise `api` |
| `src/services/api/status.ts` | ✅ Utilise `api` |
| `src/services/api/tasks.ts` | ✅ Utilise `api` |
| `src/services/api/archives.ts` | ✅ Utilise `api` |
| `src/services/api/rundowns.ts` | ✅ Utilise `api` |
| `src/services/api/showPlans.ts` | ✅ Utilise `api` |

---

## 🔍 Commandes de vérification

### Trouver toutes les URLs hardcodées
```bash
# Rechercher toutes les occurrences de l'ancienne URL
grep -rn "api.radio.audace.ovh" src/

# Rechercher toutes les URLs API hardcodées
grep -rn "https://api\." src/

# Trouver les imports axios directs (potentiellement problématiques)
grep -rn "from 'axios'" src/services/
```

### Résultat attendu après migration
```bash
# Seul api.ts devrait contenir une URL API
grep -rn "api.cloud.audace.ovh" src/
# Résultat attendu: src/api/api.ts:X:const DEFAULT_API_BASE_URL = 'https://api.cloud.audace.ovh';
```

---

## 🌍 Configuration par environnement

### Fichier `.env.local` (développement local)
```env
VITE_API_BASE_URL=https://api.cloud.audace.ovh
```

### Fichier `.env.production` (production)
```env
VITE_API_BASE_URL=https://api.cloud.audace.ovh
```

### Variable dans Dokploy/Docker
```yaml
environment:
  - VITE_API_BASE_URL=https://api.cloud.audace.ovh
```

---

## 📋 Checklist de migration

### Étape 1 : Modifications du code
- [ ] `src/api/api.ts` - Modifier l'URL de base + variable d'environnement
- [ ] `src/api/auth.ts` - Remplacer axios par api, supprimer API_URL
- [ ] `src/services/api/emissions.ts` - Supprimer imports/variables inutiles
- [ ] `src/services/api/shows.ts` - Supprimer API_URL inutilisée

### Étape 2 : Configuration
- [ ] Créer/modifier `.env.local` avec `VITE_API_BASE_URL`
- [ ] Vérifier `.env.production` si existant

### Étape 3 : Tests
- [ ] Tester la connexion (login/logout)
- [ ] Tester les appels API (lister émissions, shows, invités)
- [ ] Vérifier la console pour les erreurs CORS

### Étape 4 : Déploiement
- [ ] Build de production : `npm run build`
- [ ] Vérifier les URLs dans le build (`dist/`)
- [ ] Déployer sur Dokploy
- [ ] Tester en production

---

## 🛠️ Ordre de modification recommandé

1. **Commencer par `src/api/api.ts`** - C'est la base
2. **Puis `src/api/auth.ts`** - Critique pour le login
3. **Ensuite les services** - Nettoyage
4. **Tester localement** - Avant commit
5. **Commit + Push** - Une fois validé

---

## 📝 Message de commit suggéré

```
🔧 fix(api): Centraliser la configuration API

- Modifier src/api/api.ts avec URL cloud.audace.ovh
- Utiliser instance api dans auth.ts
- Supprimer URLs hardcodées dans les services
- Ajouter support variable d'environnement VITE_API_BASE_URL
```

---

## ⚠️ Points d'attention

1. **CORS** - S'assurer que l'API autorise les requêtes depuis le frontend
2. **HTTPS** - L'URL doit être en HTTPS
3. **Slash final** - Éviter les doubles slashes (`//`) dans les URLs
4. **Cache** - Vider le cache navigateur après modification

---

> **Dernière mise à jour :** 11 décembre 2025
> **À mettre à jour après :** Chaque migration d'URL API
