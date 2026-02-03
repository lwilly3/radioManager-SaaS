# 🔥 Agent Skill: Firebase

## Rôle
Guider l'agent dans l'utilisation correcte de Firebase (Firestore, Storage, Auth) pour les modules temps réel du projet RadioManager SaaS : Chat, Tasks et Quotes.

## Quand utiliser ce skill

### Déclencheurs automatiques
- L'agent travaille sur les modules Chat, Tasks ou Quotes
- Création ou modification d'opérations Firestore
- Upload/download de fichiers (Firebase Storage)
- Gestion de listeners temps réel (onSnapshot)
- Configuration ou règles de sécurité Firebase
- Debug d'erreurs Firebase

### Contexte d'utilisation
- **Systématique** : Toute opération sur les données temps réel
- Lors de la création de nouveaux stores Zustand utilisant Firebase
- Pour les opérations CRUD sur Firestore
- Quand on manipule des fichiers audio/images

---

## 📋 Architecture Firebase du Projet

### Configuration

```typescript
// src/api/firebase/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### Collections Firestore

| Collection | Module | Description | Documents |
|------------|--------|-------------|-----------|
| `rooms` | Chat | Salons de discussion | ChatRoom |
| `rooms/{id}/messages` | Chat | Messages d'un salon | Message |
| `tasks` | Tasks | Tâches Kanban | Task |
| `quotes` | Quotes | Citations | Quote |
| `versions` | System | Historique versions | Version |
| `userPreferences` | System | Préférences utilisateur | UserPrefs |

---

## 🔧 Ce que l'agent DOIT faire

### 1. Imports Firestore Corrects

```typescript
// ✅ BON : Imports spécifiques (tree-shaking)
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../api/firebase/firebase';

// ❌ MAUVAIS : Import global
import firebase from 'firebase/app';
```

### 2. Pattern CRUD Firestore

#### Créer un document

```typescript
// ✅ BON : Avec addDoc (ID auto-généré)
const createQuote = async (data: CreateQuoteData): Promise<Quote> => {
  try {
    const docRef = await addDoc(collection(db, 'quotes'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Erreur création:', error);
    throw new Error('Impossible de créer la citation');
  }
};

// ✅ BON : Avec setDoc (ID personnalisé)
const createRoom = async (room: ChatRoom): Promise<void> => {
  const roomRef = doc(db, 'rooms', room.id);
  await setDoc(roomRef, {
    ...room,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
```

#### Lire des documents

```typescript
// ✅ BON : Lecture unique
const getQuote = async (id: string): Promise<Quote | null> => {
  const docRef = doc(db, 'quotes', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return { id: docSnap.id, ...docSnap.data() } as Quote;
};

// ✅ BON : Lecture avec filtres
const getQuotesByStatus = async (status: QuoteStatus): Promise<Quote[]> => {
  const q = query(
    collection(db, 'quotes'),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));
};
```

#### Mettre à jour un document

```typescript
// ✅ BON : Update partiel avec updateDoc
const updateQuote = async (id: string, updates: Partial<Quote>): Promise<void> => {
  const docRef = doc(db, 'quotes', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ✅ BON : Remplacement complet avec setDoc + merge
const replaceQuote = async (id: string, data: Quote): Promise<void> => {
  const docRef = doc(db, 'quotes', id);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
```

#### Supprimer un document

```typescript
// ✅ BON : Suppression simple
const deleteQuote = async (id: string): Promise<void> => {
  const docRef = doc(db, 'quotes', id);
  await deleteDoc(docRef);
};

// ✅ BON : Soft delete (recommandé)
const archiveQuote = async (id: string): Promise<void> => {
  const docRef = doc(db, 'quotes', id);
  await updateDoc(docRef, {
    status: 'archived',
    archivedAt: serverTimestamp(),
  });
};
```

### 3. Listeners Temps Réel (onSnapshot)

```typescript
// ✅ BON : Pattern avec unsubscribe dans Zustand store
export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  unsubscribe: null as (() => void) | null,

  subscribeToTasks: () => {
    // Désabonner l'ancien listener s'il existe
    const currentUnsub = get().unsubscribe;
    if (currentUnsub) currentUnsub();

    const q = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task));
        set({ tasks, isLoading: false });
      },
      (error) => {
        console.error('Erreur subscription:', error);
        set({ error: error.message, isLoading: false });
      }
    );

    set({ unsubscribe });
  },

  // ✅ IMPORTANT : Nettoyer à la déconnexion
  cleanup: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();
    set({ unsubscribe: null });
  },
}));
```

### 4. Sous-collections (Messages dans Rooms)

```typescript
// ✅ BON : Accès sous-collection
const getMessages = async (roomId: string): Promise<Message[]> => {
  const messagesRef = collection(db, `rooms/${roomId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
};

// ✅ BON : Ajouter à une sous-collection
const addMessage = async (roomId: string, message: Message): Promise<void> => {
  const messagesRef = collection(db, `rooms/${roomId}/messages`);
  await addDoc(messagesRef, {
    ...message,
    timestamp: serverTimestamp(),
  });
};

// ✅ BON : Listener sur sous-collection
const subscribeToMessages = (roomId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(db, `rooms/${roomId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    callback(messages);
  });
};
```

### 5. Opérations Batch (Transactions)

```typescript
// ✅ BON : Batch pour opérations multiples
import { writeBatch } from 'firebase/firestore';

const deleteRoomWithMessages = async (roomId: string): Promise<void> => {
  const batch = writeBatch(db);
  
  // 1. Récupérer tous les messages
  const messagesRef = collection(db, `rooms/${roomId}/messages`);
  const messagesSnapshot = await getDocs(messagesRef);
  
  // 2. Ajouter chaque message au batch de suppression
  messagesSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // 3. Ajouter la room au batch
  batch.delete(doc(db, 'rooms', roomId));
  
  // 4. Exécuter tout en une fois
  await batch.commit();
};

// ✅ BON : Transaction pour lecture-écriture atomique
import { runTransaction } from 'firebase/firestore';

const incrementUnreadCount = async (roomId: string, userId: string): Promise<void> => {
  const roomRef = doc(db, 'rooms', roomId);
  
  await runTransaction(db, async (transaction) => {
    const roomDoc = await transaction.get(roomRef);
    if (!roomDoc.exists()) throw new Error('Room not found');
    
    const currentCount = roomDoc.data().unreadCount?.[userId] || 0;
    transaction.update(roomRef, {
      [`unreadCount.${userId}`]: currentCount + 1,
    });
  });
};
```

### 6. Firebase Storage (Fichiers)

```typescript
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../api/firebase/firebase';

// ✅ BON : Upload de fichier
const uploadAudioFile = async (file: File, quoteId: string): Promise<string> => {
  // Validation du fichier
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
  
  if (file.size > maxSize) {
    throw new Error('Fichier trop volumineux (max 10MB)');
  }
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Type de fichier non autorisé');
  }
  
  // Upload
  const fileName = `quotes/${quoteId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, fileName);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};

// ✅ BON : Supprimer un fichier
const deleteAudioFile = async (fileUrl: string): Promise<void> => {
  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error) {
    // Ignorer si fichier n'existe pas
    console.warn('Fichier non trouvé:', error);
  }
};
```

### 7. Conversion des Timestamps

```typescript
import { Timestamp } from 'firebase/firestore';

// ✅ BON : Helper de conversion
const timestampToISO = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  
  // Timestamp Firestore
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  
  // Objet avec méthode toDate (snapshot)
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  
  // Déjà une string
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  // Date JavaScript
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  return new Date().toISOString();
};

// ✅ BON : Utilisation dans conversion
const firestoreToQuote = (id: string, data: any): Quote => ({
  ...data,
  id,
  createdAt: timestampToISO(data.createdAt),
  updatedAt: timestampToISO(data.updatedAt),
});
```

### 8. Gestion des Erreurs Firebase

```typescript
// ✅ BON : Gestion d'erreurs complète
const handleFirebaseError = (error: any): string => {
  const code = error?.code || '';
  
  const errorMessages: Record<string, string> = {
    'permission-denied': 'Vous n\'avez pas la permission d\'effectuer cette action',
    'not-found': 'Document non trouvé',
    'already-exists': 'Ce document existe déjà',
    'resource-exhausted': 'Quota Firebase dépassé',
    'unavailable': 'Service Firebase temporairement indisponible',
    'cancelled': 'Opération annulée',
    'invalid-argument': 'Données invalides',
    'failed-precondition': 'Opération impossible dans l\'état actuel',
  };
  
  return errorMessages[code] || 'Une erreur est survenue';
};

// Utilisation
try {
  await createQuote(data);
} catch (error) {
  const message = handleFirebaseError(error);
  toast.error(message);
}
```

---

## 🚫 Ce que l'agent NE DOIT PAS faire

### ❌ Anti-patterns critiques

#### 1. Ne JAMAIS oublier de désabonner les listeners

```typescript
// ❌ MAUVAIS : Fuite mémoire
useEffect(() => {
  onSnapshot(collection(db, 'tasks'), (snapshot) => {
    // ...
  });
}, []); // Pas de cleanup !

// ✅ BON : Cleanup dans useEffect
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
    // ...
  });
  
  return () => unsubscribe(); // Cleanup !
}, []);
```

#### 2. Ne PAS stocker de données sensibles sans chiffrement

```typescript
// ❌ MAUVAIS : Données sensibles en clair
await setDoc(doc(db, 'users', id), {
  password: 'secret123',  // JAMAIS !
  creditCard: '4111...',  // JAMAIS !
});

// ✅ BON : Pas de données sensibles dans Firestore
// Les mots de passe sont gérés par Firebase Auth
// Les paiements par Stripe/autre service externe
```

#### 3. Ne PAS ignorer les limites Firestore

```typescript
// ❌ MAUVAIS : Query sans limite
const getAllQuotes = async () => {
  const snapshot = await getDocs(collection(db, 'quotes'));
  return snapshot.docs; // Peut retourner 10000+ docs !
};

// ✅ BON : Toujours limiter
import { limit } from 'firebase/firestore';

const getRecentQuotes = async (count = 50) => {
  const q = query(
    collection(db, 'quotes'),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs;
};
```

#### 4. Ne PAS faire de queries composées invalides

```typescript
// ❌ MAUVAIS : Firestore ne supporte pas
const q = query(
  collection(db, 'quotes'),
  where('status', '==', 'published'),
  where('category', '!=', 'sport'),  // != avec autre where
  orderBy('createdAt')  // Erreur : doit d'abord orderBy 'category'
);

// ✅ BON : Respecter les limitations Firestore
// - Un seul != ou not-in par query
// - orderBy sur le champ du where si inégalité
// - Index composés nécessaires pour certaines queries
```

#### 5. Ne PAS mettre undefined dans Firestore

```typescript
// ❌ MAUVAIS : undefined cause une erreur
await setDoc(docRef, {
  title: 'Ma citation',
  category: undefined,  // Erreur Firestore !
});

// ✅ BON : Nettoyer les undefined
const removeUndefined = <T extends object>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
};

await setDoc(docRef, removeUndefined({
  title: 'Ma citation',
  category: undefined,  // Sera supprimé
}));
```

#### 6. Ne PAS créer de listeners multiples identiques

```typescript
// ❌ MAUVAIS : Nouveau listener à chaque appel
const subscribeToTasks = () => {
  onSnapshot(collection(db, 'tasks'), (snapshot) => {
    // Crée un NOUVEAU listener à chaque appel !
  });
};

// ✅ BON : Vérifier et désabonner l'ancien
let currentUnsubscribe: (() => void) | null = null;

const subscribeToTasks = () => {
  if (currentUnsubscribe) {
    currentUnsubscribe();  // Désabonner l'ancien
  }
  
  currentUnsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
    // ...
  });
};
```

---

## 📊 Structure des Documents

### Quote (citations)

```typescript
interface QuoteDocument {
  // Identifiant (auto-généré)
  id: string;
  
  // Contenu
  content: string;
  source: {
    type: 'live' | 'archive' | 'external' | 'manual';
    audioUrl?: string;
    timestamp?: string;
  };
  
  // Auteur
  author: {
    id?: string;
    name: string;
    role?: string;
    avatar?: string;
  };
  
  // Contexte
  context?: {
    emissionId?: string;
    showPlanId?: string;
    showName?: string;
    date?: Timestamp;
  };
  
  // Métadonnées
  metadata?: {
    category?: string;
    tags?: string[];
    importance?: 'low' | 'medium' | 'high';
  };
  
  // Statut
  status: 'draft' | 'published' | 'archived';
  
  // Audit
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

### Task (tâches)

```typescript
interface TaskDocument {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeIds: string[];
  dueDate?: string;
  tags: string[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### ChatRoom (salon)

```typescript
interface ChatRoomDocument {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  participants: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Timestamp;
  };
  unreadCount: Record<string, number>;
}
```

### Message (sous-collection de rooms)

```typescript
interface MessageDocument {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
  type: 'text' | 'file' | 'image' | 'system';
  fileUrl?: string;
  fileName?: string;
  reactions?: Record<string, string[]>;  // { "👍": ["user1", "user2"] }
  editedAt?: Timestamp;
  replyTo?: string;
}
```

---

## 🔒 Règles de Sécurité Firestore

### Exemple de règles recommandées

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fonction helper : utilisateur authentifié
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Fonction helper : propriétaire du document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Quotes
    match /quotes/{quoteId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() 
        && request.resource.data.createdBy == request.auth.uid;
      allow update: if isAuthenticated() 
        && (resource.data.createdBy == request.auth.uid 
            || request.auth.token.role == 'admin');
      allow delete: if isAuthenticated() 
        && request.auth.token.role == 'admin';
    }
    
    // Tasks
    match /tasks/{taskId} {
      allow read, write: if isAuthenticated();
    }
    
    // Chat Rooms
    match /rooms/{roomId} {
      allow read: if isAuthenticated() 
        && request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() 
        && request.auth.uid in resource.data.participants;
      
      // Messages (sous-collection)
      match /messages/{messageId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() 
          && request.resource.data.senderId == request.auth.uid;
        allow update, delete: if isAuthenticated() 
          && resource.data.senderId == request.auth.uid;
      }
    }
    
    // User Preferences
    match /userPreferences/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }
  }
}
```

---

## ✅ Checklist Firebase

### Configuration
- [ ] Variables d'environnement Firebase configurées
- [ ] `firebase.ts` exporte db, auth, storage
- [ ] Règles de sécurité Firestore déployées

### Opérations CRUD
- [ ] serverTimestamp() pour createdAt/updatedAt
- [ ] Conversion Timestamp → ISO string pour le frontend
- [ ] Gestion des erreurs avec messages user-friendly
- [ ] Pas de undefined dans les documents

### Temps Réel
- [ ] Listeners désabonnés au cleanup
- [ ] Pas de listeners dupliqués
- [ ] Gestion des erreurs de subscription

### Storage
- [ ] Validation taille fichier avant upload
- [ ] Validation type MIME
- [ ] Suppression fichiers orphelins

### Performance
- [ ] Queries avec limit()
- [ ] Index composés créés si nécessaire
- [ ] Batch pour opérations multiples

---

## 🚀 Exemples de requêtes utilisateur

```
✅ "Ajoute un listener sur les tasks"
✅ "Comment uploader un fichier audio ?"
✅ "Crée une fonction pour supprimer une room et ses messages"
✅ "Convertis ce timestamp Firestore"
✅ "Ajoute une citation dans Firestore"
✅ "Comment gérer les erreurs Firebase ?"
✅ "Crée un batch pour supprimer plusieurs documents"
```

---

## 📚 Ressources

- **Firebase Console** : https://console.firebase.google.com/
- **Documentation Firestore** : https://firebase.google.com/docs/firestore
- **Documentation Storage** : https://firebase.google.com/docs/storage
- **Règles de sécurité** : https://firebase.google.com/docs/firestore/security/get-started

---

## 📝 Métadonnées

- **Version:** 1.0.0
- **Dernière mise à jour:** 2026-02-03
- **Priorité:** Haute
- **Dépendances:** project-overview, coding-standards, security
- **Utilisé par:** Modules Chat, Tasks, Quotes, UserPreferences, Versions
- **Collections:** rooms, tasks, quotes, userPreferences, versions
