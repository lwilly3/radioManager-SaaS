# 🔒 Agent Skill: Security

## Rôle
Guider l'agent dans l'implémentation de pratiques de sécurité robustes pour protéger l'application RadioManager SaaS, les données utilisateurs et prévenir les vulnérabilités.

## Quand utiliser ce skill

### Déclencheurs automatiques
- L'agent implémente l'authentification ou les permissions
- L'agent manipule des données sensibles (mots de passe, tokens, données personnelles)
- L'agent crée des endpoints API ou services
- L'agent gère des uploads de fichiers
- L'utilisateur demande des fonctionnalités liées à la sécurité
- Lors de manipulation de variables d'environnement

### Contexte d'utilisation
- Gestion de l'authentification et autorisation
- Manipulation de données utilisateur
- Communication avec des API externes
- Stockage de données sensibles
- Validation des inputs utilisateur
- Gestion des sessions

---

## Ce que l'agent DOIT faire

### 1. Authentification et autorisation

#### Gestion sécurisée des tokens

```typescript
// ✅ BON : Stockage sécurisé avec httpOnly cookies ou secure storage
// Utiliser Firebase Auth qui gère les tokens de manière sécurisée

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export const login = async (email: string, password: string) => {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Firebase gère automatiquement les tokens de manière sécurisée
    const token = await userCredential.user.getIdToken();
    
    // ❌ NE JAMAIS stocker en localStorage pour les tokens sensibles
    // localStorage.setItem('token', token); // DANGEREUX
    
    // ✅ Utiliser httpOnly cookies ou laisser Firebase gérer
    return userCredential.user;
  } catch (error) {
    throw new Error('Échec de l\'authentification');
  }
};
```

#### Vérification des permissions

```typescript
// ✅ BON : Vérification stricte des permissions
export const usePermissionCheck = (requiredPermission: Permission) => {
  const { user, permissions } = useAuthStore();
  
  const hasPermission = useMemo(() => {
    if (!user) return false;
    
    // Super admin a toutes les permissions
    if (user.role === 'super-admin') return true;
    
    // Vérification explicite de la permission
    return permissions.includes(requiredPermission);
  }, [user, permissions, requiredPermission]);
  
  return hasPermission;
};

// ✅ BON : Protection des routes sensibles
export const ProtectedRoute = ({ 
  children, 
  requiredPermission 
}: ProtectedRouteProps) => {
  const { user } = useAuthStore();
  const hasPermission = usePermissionCheck(requiredPermission);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredPermission && !hasPermission) {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
};
```

### 2. Validation et sanitization des inputs

#### Validation stricte avec Zod

```typescript
// ✅ BON : Schéma Zod avec validation stricte
import { z } from 'zod';

export const quoteSchema = z.object({
  content: z.string()
    .min(10, 'Le contenu doit contenir au moins 10 caractères')
    .max(5000, 'Le contenu ne peut pas dépasser 5000 caractères')
    .trim()
    .refine(
      (val) => !/<script|javascript:/i.test(val),
      'Le contenu contient des scripts interdits'
    ),
  
  author: z.object({
    name: z.string()
      .min(1, 'Le nom est requis')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères')
      .trim()
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides'),
    
    email: z.string()
      .email('Email invalide')
      .optional()
      .transform(val => val?.toLowerCase()),
  }),
  
  category: z.enum(['politique', 'sport', 'culture', 'divers'], {
    errorMap: () => ({ message: 'Catégorie invalide' })
  }),
  
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags')
    .optional()
    .transform(tags => tags?.filter(t => t.length > 0)),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
```

#### Sanitization des données

```typescript
// ✅ BON : Nettoyer les données avant stockage
import DOMPurify from 'dompurify';

export const sanitizeHtmlContent = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
};

export const sanitizeUserInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Utilisation
const createQuote = async (data: QuoteFormData) => {
  const sanitizedData = {
    ...data,
    content: sanitizeUserInput(data.content),
    author: {
      ...data.author,
      name: sanitizeUserInput(data.author.name),
    },
  };
  
  return await addQuote(sanitizedData);
};
```

### 3. Protection contre les vulnérabilités courantes

#### XSS (Cross-Site Scripting)

```typescript
// ✅ BON : Échapper les données utilisateur
import { escapeHtml } from '@/utils/security';

// Dans les composants
export const QuoteDisplay = ({ content }: { content: string }) => {
  // React échappe automatiquement le texte
  return <p>{content}</p>;
  
  // ❌ DANGEREUX : dangerouslySetInnerHTML sans sanitization
  // return <div dangerouslySetInnerHTML={{ __html: content }} />;
  
  // ✅ BON : Si HTML nécessaire, utiliser DOMPurify
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: DOMPurify.sanitize(content) 
      }} 
    />
  );
};
```

#### CSRF (Cross-Site Request Forgery)

```typescript
// ✅ BON : Utiliser des tokens CSRF pour les requêtes sensibles
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Envoyer les cookies
});

// Intercepteur pour ajouter le token CSRF
api.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken(); // Récupéré du cookie ou meta tag
  
  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  
  return config;
});
```

#### SQL Injection / NoSQL Injection

```typescript
// ✅ BON : Utiliser les requêtes paramétrées de Firebase
import { collection, query, where, getDocs } from 'firebase/firestore';

// ❌ MAUVAIS : Concaténation de strings (si vous construisiez des requêtes SQL)
// const sql = `SELECT * FROM users WHERE email = '${userEmail}'`; // DANGEREUX

// ✅ BON : Requêtes paramétrées Firebase
export const getUserByEmail = async (email: string) => {
  // Firebase utilise automatiquement des requêtes paramétrées
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ BON : Validation supplémentaire
export const getUserByEmailSafe = async (email: string) => {
  // Valider l'email d'abord
  const emailSchema = z.string().email();
  const validatedEmail = emailSchema.parse(email);
  
  return getUserByEmail(validatedEmail);
};
```

### 4. Gestion sécurisée des variables d'environnement

```typescript
// ✅ BON : .env.example (committé)
VITE_API_BASE_URL=https://api.cloud.audace.ovh
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

// ✅ BON : .env.local (NON committé, dans .gitignore)
VITE_API_BASE_URL=https://api.cloud.audace.ovh
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=radioManager.firebaseapp.com

// ✅ BON : Validation des variables d'environnement
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
});

const validateEnv = () => {
  try {
    envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('❌ Variables d\'environnement invalides:', error);
    throw new Error('Configuration environnement invalide');
  }
};

validateEnv();

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  },
};
```

```bash
# ✅ BON : .gitignore
.env
.env.local
.env.*.local
.env.production
.env.development

# ❌ MAUVAIS : Commiter des fichiers .env
# Ne JAMAIS ajouter .env dans git !
```

### 5. Upload de fichiers sécurisé

```typescript
// ✅ BON : Validation stricte des uploads
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadFile = async (
  file: File,
  userId: string
): Promise<string> => {
  // Validation du type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Type de fichier non autorisé');
  }
  
  // Validation de la taille
  if (file.size > MAX_SIZE) {
    throw new Error('Fichier trop volumineux (max 5MB)');
  }
  
  // Générer un nom de fichier sécurisé
  const fileExtension = file.name.split('.').pop();
  const safeFileName = `${userId}/${crypto.randomUUID()}.${fileExtension}`;
  
  // Upload avec path sécurisé
  const storageRef = ref(storage, `uploads/${safeFileName}`);
  
  try {
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Erreur upload:', error);
    throw new Error('Échec de l\'upload du fichier');
  }
};

// ✅ BON : Validation côté composant
export const FileUpload = () => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Double vérification côté client
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Type de fichier non autorisé');
      return;
    }
    
    if (file.size > MAX_SIZE) {
      toast.error('Fichier trop volumineux');
      return;
    }
    
    uploadFile(file, userId);
  };
  
  return (
    <input
      type="file"
      accept={ALLOWED_TYPES.join(',')}
      onChange={handleFileChange}
    />
  );
};
```

### 6. Logging et monitoring sécurisés

```typescript
// ✅ BON : Logger sans exposer de données sensibles
export const secureLog = (message: string, data?: Record<string, any>) => {
  const sanitizedData = data ? sanitizeLogData(data) : {};
  
  if (import.meta.env.DEV) {
    console.log(message, sanitizedData);
  } else {
    // En production, envoyer à un service de monitoring
    sendToMonitoring(message, sanitizedData);
  }
};

const sanitizeLogData = (data: Record<string, any>) => {
  const SENSITIVE_KEYS = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
  
  return Object.keys(data).reduce((acc, key) => {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
      acc[key] = '***REDACTED***';
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as Record<string, any>);
};

// Utilisation
secureLog('User login', { 
  email: 'user@example.com', 
  password: 'secret123', // Sera masqué
  timestamp: new Date(),
});
```

### 7. Rate limiting et protection contre les abus

```typescript
// ✅ BON : Rate limiting côté client (complément du backend)
class RateLimiter {
  private attempts = new Map<string, number[]>();
  
  canAttempt(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Supprimer les tentatives hors de la fenêtre
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// Utilisation pour le login
export const loginWithRateLimit = async (email: string, password: string) => {
  const canAttempt = rateLimiter.canAttempt(email, 5, 15 * 60 * 1000); // 5 tentatives / 15 min
  
  if (!canAttempt) {
    throw new Error('Trop de tentatives de connexion. Réessayez dans 15 minutes.');
  }
  
  return await login(email, password);
};
```

### 8. Headers de sécurité

```typescript
// ✅ BON : Configuration Axios avec headers sécurisés
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token d'auth de manière sécurisée
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

---

## Ce que l'agent NE DOIT PAS faire

### ❌ Pratiques dangereuses interdites

1. **NE JAMAIS commiter des secrets**
   ```typescript
   // ❌ INTERDIT
   const API_KEY = 'sk_live_123456789';
   const PASSWORD = 'admin123';
   
   // ✅ FAIRE
   const API_KEY = import.meta.env.VITE_API_KEY;
   ```

2. **NE JAMAIS stocker de mots de passe en clair**
   ```typescript
   // ❌ INTERDIT
   localStorage.setItem('password', password);
   
   // ✅ FAIRE : Utiliser Firebase Auth qui gère le hashing
   await signInWithEmailAndPassword(auth, email, password);
   ```

3. **NE JAMAIS faire confiance aux données utilisateur**
   ```typescript
   // ❌ INTERDIT : Utiliser directement sans validation
   const createUser = (data: any) => {
     return addDoc(collection(db, 'users'), data);
   };
   
   // ✅ FAIRE : Toujours valider
   const createUser = (data: unknown) => {
     const validatedData = userSchema.parse(data);
     return addDoc(collection(db, 'users'), validatedData);
   };
   ```

4. **NE JAMAIS exposer d'informations sensibles dans les logs**
   ```typescript
   // ❌ INTERDIT
   console.log('Login attempt:', { email, password });
   
   // ✅ FAIRE
   secureLog('Login attempt', { email });
   ```

5. **NE JAMAIS utiliser eval() ou innerHTML sans sanitization**
   ```typescript
   // ❌ INTERDIT
   eval(userInput);
   element.innerHTML = userInput;
   
   // ✅ FAIRE
   element.textContent = userInput;
   element.innerHTML = DOMPurify.sanitize(userInput);
   ```

---

## Checklist de sécurité

Avant chaque fonctionnalité sensible :

- [ ] Les inputs utilisateur sont validés avec Zod
- [ ] Les données sont sanitizées avant stockage/affichage
- [ ] Les permissions sont vérifiées
- [ ] Les tokens/credentials ne sont jamais exposés
- [ ] Les fichiers sensibles sont dans .gitignore
- [ ] Les variables d'environnement sont validées
- [ ] Les uploads de fichiers sont sécurisés
- [ ] Le logging ne contient pas de données sensibles
- [ ] Les headers de sécurité sont configurés
- [ ] Rate limiting implémenté pour les endpoints sensibles
- [ ] Protection XSS/CSRF en place
- [ ] Dépendances à jour (pas de CVE connues)

---

## Exemples de requêtes utilisateur

```
✅ "Sécurise le formulaire de login"
✅ "Ajoute la validation des permissions pour cette route"
✅ "Implémente l'upload sécurisé d'avatar"
✅ "Protège contre les injections XSS"
✅ "Ajoute du rate limiting au login"
```

---

## Ressources

- **OWASP Top 10** : https://owasp.org/www-project-top-ten/
- **Firebase Security Rules** : https://firebase.google.com/docs/rules
- **DOMPurify** : https://github.com/cure53/DOMPurify
- **Zod** : https://zod.dev/

---

## Métadonnées

- **Version:** 1.0.0
- **Dernière mise à jour:** 2026-02-01
- **Priorité:** Critique
- **Dépendances:** coding-standards, architecture
- **Utilisé par:** Toutes les fonctionnalités manipulant des données sensibles
