# 💬 Module Citations & Contenus

> Documentation technique complète pour l'implémentation du module de gestion des citations avec transcription en direct du stream radio.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Structure des données](#structure-des-données)
4. [Backend (Firestore)](#backend-firestore)
5. [Frontend (React)](#frontend-react)
6. [Workflows utilisateur](#workflows-utilisateur)
7. [Intégrations](#intégrations)
8. [Guide d'implémentation](#guide-dimplémentation)
9. [Permissions](#permissions)
10. [Tests](#tests)

---

## 🎯 Vue d'ensemble

### Objectif du module

Le module Citations permet de :
- **Capturer** des citations marquantes pendant les émissions en direct
- **Transcrire** automatiquement le stream radio en temps réel
- **Créer** des citations manuellement ou depuis la transcription
- **Générer** du contenu visuel pour les réseaux sociaux
- **Publier** sur multiples plateformes (Facebook, Twitter, Instagram)
- **Analyser** les performances des citations

### Cas d'usage principaux

1. **Pendant l'émission** : Animateur/producteur capture une citation en 1 clic depuis la transcription live
2. **Après l'émission** : Community manager crée une citation manuelle et génère une image pour Instagram
3. **Publication programmée** : Planification d'une campagne "citation du jour" sur 1 mois

### Technologies utilisées

| Technologie | Usage | Coût |
|-------------|-------|------|
| **Firestore** | Base de données temps réel | Gratuit (tier free) |
| **Firebase Storage** | Stockage fichiers audio | Gratuit (5GB) |
| **Web Speech API** | Transcription temps réel | Gratuit (natif navigateur) |
| **Web Audio API** | Capture du stream radio | Gratuit (natif navigateur) |
| **React + TypeScript** | Interface utilisateur | - |
| **Zustand** | State management | - |
| **html2canvas** | Génération d'images | - |

---

## 🏗️ Architecture

### Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                      ARCHITECTURE MODULE CITATIONS              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  UTILISATEUR     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────────────────┐│
│  │  Pages             │  │  Components                    ││
│  │  - QuotesList      │  │  - QuoteCard                   ││
│  │  - CreateQuote     │  │  - QuoteForm                   ││
│  │  - QuoteDetails    │  │  - StreamTranscriber           ││
│  │  - GenerateContent │  │  - LiveTranscriptDisplay       ││
│  └────────────────────┘  └────────────────────────────────┘│
│                                                              │
│  ┌────────────────────┐  ┌────────────────────────────────┐│
│  │  Hooks             │  │  Stores (Zustand)              ││
│  │  - useQuotes       │  │  - useQuoteStore               ││
│  │  - useTranscription│  │  - useAuthStore (existant)     ││
│  └────────────────────┘  └────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Services                                                ││
│  │  - quotes.ts (Firestore CRUD)                            ││
│  │  - transcriptions.ts (Gestion transcriptions)            ││
│  │  - storage.ts (Upload audio)                             ││
│  └──────────────────────────────────────────────────────────┘│
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    FIREBASE                                  │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────────────────┐│
│  │  Firestore         │  │  Storage                       ││
│  │  - quotes/         │  │  - audio/                      ││
│  │  - transcriptions/ │  │  - images/                     ││
│  │  - templates/      │  │                                ││
│  └────────────────────┘  └────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Security Rules                                          ││
│  │  - Permissions par rôle                                  ││
│  │  - Validation des données                                ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              SERVICES EXTERNES (Optionnel)                   │
│  - Hugging Face (IA post-traitement gratuit)                │
│  - Meta API (Publication Facebook/Instagram)                 │
│  - Twitter API (Publication tweets)                          │
└──────────────────────────────────────────────────────────────┘
```

### Architecture des données (Firestore)

```
radioManager/
├── quotes/                                  # Collection principale
│   └── {quoteId}/                          # Document citation
│       ├── id: string
│       ├── content: string
│       ├── author: {
│       │   id: string
│       │   name: string
│       │   role: 'guest' | 'presenter' | 'other'
│       │   avatarUrl?: string
│       │ }
│       ├── context: {
│       │   showPlanId?: string
│       │   emissionId?: string
│       │   date: timestamp
│       │   timestamp?: string
│       │ }
│       ├── source: {
│       │   type: 'manual' | 'stream_transcription' | 'audio_file'
│       │   transcriptionId?: string
│       │   segmentId?: string
│       │   streamTimestamp?: number
│       │   audioUrl?: string
│       │ }
│       ├── metadata: {
│       │   category: 'statement' | 'position' | 'quote' | 'fact'
│       │   tags: string[]
│       │   language: 'fr' | 'en'
│       │   isVerified: boolean
│       │   capturedBy?: string
│       │   capturedAt?: timestamp
│       │ }
│       ├── media?: {
│       │   audioClipUrl?: string
│       │   imageUrl?: string
│       │ }
│       ├── publications: Publication[]
│       ├── status: 'draft' | 'approved' | 'published' | 'archived'
│       ├── createdBy: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── streamTranscriptions/                    # Collection transcriptions
│   └── {transcriptionId}/
│       ├── emissionId: string
│       ├── emissionName: string
│       ├── startTime: timestamp
│       ├── endTime?: timestamp
│       ├── status: 'live' | 'completed' | 'paused'
│       ├── segments: StreamTranscriptionSegment[]
│       ├── metadata: {
│       │   totalDuration: number
│       │   wordCount: number
│       │   language: string
│       │ }
│       └── createdAt: timestamp
│
└── quoteTemplates/                          # Collection templates
    └── {templateId}/
        ├── name: string
        ├── platform: string[]
        ├── layout: 'card' | 'banner' | 'story' | 'post'
        ├── backgroundColor: string
        ├── textColor: string
        ├── logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
        ├── fontFamily: string
        └── previewUrl: string
```

---

## 📊 Structure des données

### Types TypeScript principaux

```typescript
// src/types/quote.ts

export interface Quote {
  id: string;
  content: string;
  author: Author;
  context: Context;
  source: Source;
  metadata: Metadata;
  media?: Media;
  publications: Publication[];
  status: 'draft' | 'approved' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  role: 'guest' | 'presenter' | 'other';
  avatarUrl?: string;
}

export interface Context {
  showPlanId?: string;
  emissionId?: string;
  date: string;
  timestamp?: string;
}

export interface Source {
  type: 'manual' | 'stream_transcription' | 'audio_file';
  transcriptionId?: string;
  segmentId?: string;
  streamTimestamp?: number;
  audioUrl?: string;
  audioDuration?: number;
}

export interface Metadata {
  category: 'statement' | 'position' | 'quote' | 'fact';
  tags: string[];
  language: 'fr' | 'en';
  isVerified: boolean;
  capturedBy?: string;
  capturedAt?: Date;
}

export interface Media {
  audioClipUrl?: string;
  imageUrl?: string;
}

export interface Publication {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'website' | 'linkedin';
  publishedAt: string;
  postUrl?: string;
  status: 'pending' | 'published' | 'failed';
  template: string;
  generatedContent: string;
  imageUrl?: string;
}

export interface StreamTranscription {
  id: string;
  emissionId: string;
  emissionName: string;
  startTime: Date;
  endTime?: Date;
  status: 'live' | 'completed' | 'paused';
  segments: StreamTranscriptionSegment[];
  metadata: {
    totalDuration: number;
    wordCount: number;
    language: string;
  };
}

export interface StreamTranscriptionSegment {
  id: string;
  text: string;
  timestamp: number;
  absoluteTime: Date;
  confidence: number;
  isFinal: boolean;
}

export interface ContentTemplate {
  id: string;
  name: string;
  platform: string[];
  layout: 'card' | 'banner' | 'story' | 'post';
  backgroundColor: string;
  textColor: string;
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  fontFamily: string;
  preview: string;
}
```

---

## 🔥 Backend (Firestore)

### Service quotes.ts

```typescript
// src/api/firebase/quotes.ts

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Quote, CreateQuoteData } from '../../types/quote';

const QUOTES_COLLECTION = 'quotes';

// Créer une citation
export const createQuote = async (
  data: CreateQuoteData,
  userId: string
): Promise<string> => {
  const quoteRef = await addDoc(collection(db, QUOTES_COLLECTION), {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'draft',
  });
  return quoteRef.id;
};

// Lire une citation
export const getQuote = async (quoteId: string): Promise<Quote | null> => {
  const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
  const quoteSnap = await getDoc(quoteRef);
  
  if (!quoteSnap.exists()) return null;
  
  return {
    id: quoteSnap.id,
    ...quoteSnap.data(),
  } as Quote;
};

// Lister les citations avec filtres
export const getQuotes = async (filters?: {
  status?: string;
  emissionId?: string;
  authorId?: string;
  sourceType?: string;
  limitCount?: number;
}): Promise<Quote[]> => {
  let q = query(collection(db, QUOTES_COLLECTION));
  
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  
  if (filters?.emissionId) {
    q = query(q, where('context.emissionId', '==', filters.emissionId));
  }
  
  if (filters?.authorId) {
    q = query(q, where('author.id', '==', filters.authorId));
  }
  
  if (filters?.sourceType) {
    q = query(q, where('source.type', '==', filters.sourceType));
  }
  
  q = query(q, orderBy('createdAt', 'desc'));
  
  if (filters?.limitCount) {
    q = query(q, limit(filters.limitCount));
  }
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Quote[];
};

// Écouter les citations en temps réel
export const subscribeToQuotes = (
  callback: (quotes: Quote[]) => void,
  filters?: { status?: string; emissionId?: string }
) => {
  let q = query(
    collection(db, QUOTES_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  
  if (filters?.emissionId) {
    q = query(q, where('context.emissionId', '==', filters.emissionId));
  }
  
  return onSnapshot(q, (snapshot) => {
    const quotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Quote[];
    callback(quotes);
  });
};

// Mettre à jour une citation
export const updateQuote = async (
  quoteId: string,
  data: Partial<Quote>
): Promise<void> => {
  const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
  await updateDoc(quoteRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Supprimer une citation
export const deleteQuote = async (quoteId: string): Promise<void> => {
  const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
  await deleteDoc(quoteRef);
};
```

### Règles de sécurité Firestore

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper pour vérifier si l'utilisateur est admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Collection quotes
    match /quotes/{quoteId} {
      // Lecture : tous les utilisateurs authentifiés
      allow read: if request.auth != null;
      
      // Création : utilisateurs authentifiés avec permission
      allow create: if request.auth != null
                    && request.resource.data.createdBy == request.auth.uid
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.quotes_create == true;
      
      // Mise à jour : créateur ou admin
      allow update: if request.auth != null
                    && (resource.data.createdBy == request.auth.uid || isAdmin())
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.quotes_edit == true;
      
      // Suppression : créateur ou admin uniquement
      allow delete: if request.auth != null
                    && (resource.data.createdBy == request.auth.uid || isAdmin())
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.quotes_delete == true;
    }
    
    // Collection streamTranscriptions
    match /streamTranscriptions/{transcriptionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.stream_transcription_create == true;
    }
    
    // Collection templates
    match /quoteTemplates/{templateId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

### Indexes Firestore requis

```
// Indexes à créer dans Firestore

Collection: quotes
- status (Ascending) + createdAt (Descending)
- context.emissionId (Ascending) + createdAt (Descending)
- source.type (Ascending) + createdAt (Descending)
- author.id (Ascending) + createdAt (Descending)
- metadata.tags (Array-contains) + createdAt (Descending)

Collection: streamTranscriptions
- emissionId (Ascending) + startTime (Descending)
- status (Ascending) + startTime (Descending)
```

---

## ⚛️ Frontend (React)

### Structure des fichiers

```
src/
├── pages/
│   └── Quotes/
│       ├── QuotesList.tsx              # Liste des citations
│       ├── CreateQuote.tsx             # Page de création (sélecteur de mode)
│       ├── CreateQuoteManual.tsx       # Mode création manuelle
│       ├── CreateQuoteFromStream.tsx   # Mode capture depuis stream
│       ├── QuoteDetails.tsx            # Détails d'une citation
│       └── GenerateContent.tsx         # Générateur de contenu social
│
├── components/
│   ├── quotes/
│   │   ├── QuoteCard.tsx               # Carte d'affichage citation
│   │   ├── QuoteForm.tsx               # Formulaire universel
│   │   ├── QuoteModeSelector.tsx       # Sélecteur de mode création
│   │   ├── AudioUploader.tsx           # Upload fichier audio
│   │   ├── SocialPreview.tsx           # Aperçu réseaux sociaux
│   │   ├── ImageGenerator.tsx          # Générateur d'images
│   │   └── TemplateSelector.tsx        # Sélection de templates
│   │
│   └── transcription/
│       ├── StreamTranscriber.tsx       # Composant principal transcription
│       ├── LiveTranscriptDisplay.tsx   # Affichage transcription live
│       ├── QuoteCaptureTool.tsx        # Outil de capture (modal)
│       └── TranscriptTimeline.tsx      # Timeline des segments
│
├── hooks/
│   ├── quotes/
│   │   ├── useQuotes.ts                # Hook principal CRUD
│   │   ├── useQuoteTemplates.ts        # Hook templates
│   │   └── usePublications.ts          # Hook publications
│   │
│   └── transcription/
│       ├── useStreamTranscription.ts   # Hook transcription stream
│       ├── useAudioCapture.ts          # Hook capture audio
│       └── useQuoteDetection.ts        # Hook détection citations (IA)
│
├── store/
│   ├── useQuoteStore.ts                # Store Zustand pour citations
│   └── useTranscriptionStore.ts        # Store pour transcriptions
│
├── services/
│   └── api/
│       ├── quotes.ts                   # Service Firestore quotes
│       ├── transcriptions.ts           # Service transcriptions
│       ├── storage.ts                  # Service Firebase Storage
│       └── imageGenerator.ts           # Service génération d'images
│
└── types/
    ├── quote.ts                        # Types citations
    └── transcription.ts                # Types transcriptions
```

### Hook principal : useQuotes.ts

```typescript
// src/hooks/quotes/useQuotes.ts

import { useState, useEffect } from 'react';
import {
  subscribeToQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
} from '../../api/firebase/quotes';
import type { Quote, CreateQuoteData } from '../../types/quote';
import { useAuthStore } from '../../store/useAuthStore';

export const useQuotes = (filters?: {
  status?: string;
  emissionId?: string;
}) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  // Écoute temps réel
  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = subscribeToQuotes(
      (updatedQuotes) => {
        setQuotes(updatedQuotes);
        setIsLoading(false);
      },
      filters
    );

    return () => unsubscribe();
  }, [filters?.status, filters?.emissionId]);

  // Créer
  const create = async (data: CreateQuoteData) => {
    try {
      if (!user) throw new Error('Non authentifié');
      const quoteId = await createQuote(data, user.id);
      return quoteId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  // Mettre à jour
  const update = async (quoteId: string, data: Partial<Quote>) => {
    try {
      await updateQuote(quoteId, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  // Supprimer
  const remove = async (quoteId: string) => {
    try {
      await deleteQuote(quoteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  return {
    quotes,
    isLoading,
    error,
    create,
    update,
    remove,
  };
};
```

---

## 📱 Workflows utilisateur

### Workflow 1 : Création manuelle

```
1. Utilisateur clique sur "Nouvelle citation"
   └─ Navigation vers /quotes/create

2. Sélection du mode "Création manuelle"
   └─ Affichage du formulaire CreateQuoteManual

3. Remplissage du formulaire
   ├─ Texte de la citation (obligatoire)
   ├─ Auteur et rôle (obligatoire)
   ├─ Émission/Conducteur (optionnel)
   ├─ Upload audio (optionnel)
   └─ Tags et catégorie

4. Validation et enregistrement
   ├─ Validation côté client
   ├─ Upload audio vers Firebase Storage (si présent)
   ├─ Création document Firestore
   └─ Status = 'draft'

5. Redirection vers la liste
   └─ Citation apparaît immédiatement (temps réel)
```

### Workflow 2 : Capture depuis stream

```
1. Utilisateur clique sur "Nouvelle citation"
   └─ Navigation vers /quotes/create

2. Sélection du mode "Depuis le stream radio"
   └─ Affichage de StreamTranscriber

3. Démarrage de la transcription
   ├─ Capture du stream audio (Web Audio API)
   ├─ Démarrage Web Speech API
   └─ Affichage des segments en temps réel

4. Capture d'une citation
   ├─ Utilisateur survole un segment
   ├─ Clic sur bouton "Capturer"
   └─ Ouverture du QuoteCaptureTool (modal)

5. Validation et enregistrement
   ├─ Citation pré-remplie avec texte du segment
   ├─ Timestamp automatique enregistré
   ├─ Lien vers transcriptionId et segmentId
   ├─ Utilisateur complète auteur/tags
   └─ Sauvegarde dans Firestore

6. Fermeture modal
   └─ Retour à la transcription (peut capturer d'autres citations)
```

### Workflow 3 : Génération de contenu social

```
1. Depuis QuotesList, clic sur "Générer contenu"
   └─ Navigation vers /quotes/{id}/generate

2. Sélection du template visuel
   ├─ Aperçu de différents templates
   ├─ Sélection plateforme(s) cible
   └─ Personnalisation (couleurs, logo, etc.)

3. Génération de l'image
   ├─ Rendu HTML avec les styles
   ├─ Conversion en image (html2canvas)
   └─ Prévisualisation

4. Génération de la légende
   ├─ Texte de base : citation + auteur
   ├─ Hashtags automatiques depuis tags
   ├─ Adaptation par plateforme
   └─ Édition possible

5. Téléchargement ou publication
   ├─ Option : Télécharger PNG
   └─ Option : Publier maintenant (si API configurée)
```

---

## 🔗 Intégrations

### Intégration avec module Émissions

```typescript
// Lien bidirectionnel entre citations et émissions

// Depuis une émission, voir toutes les citations
const emissionQuotes = await getQuotes({ emissionId: 'emission-123' });

// Depuis une citation, accéder à l'émission
const quote = await getQuote('quote-456');
const emission = await getEmission(quote.context.emissionId);
```

### Intégration avec module Conducteurs

```typescript
// Lien avec conducteurs (show plans)

// Depuis un conducteur, voir les citations associées
const showPlanQuotes = await getQuotes({
  filters: { 'context.showPlanId': 'showplan-789' }
});

// Ajouter une citation directement depuis un conducteur
<button onClick={() => createQuoteFromShowPlan(showPlanId)}>
  💬 Créer une citation
</button>
```

### Intégration avec RadioPlayer existant

```typescript
// src/components/audio/RadioPlayer.tsx

import { StreamTranscriber } from '../transcription/StreamTranscriber';

export const RadioPlayer: React.FC = () => {
  const [showTranscriber, setShowTranscriber] = useState(false);

  return (
    <div>
      <audio controls src={streamUrl} />
      
      <button onClick={() => setShowTranscriber(!showTranscriber)}>
        {showTranscriber ? 'Masquer' : 'Afficher'} la transcription
      </button>

      {showTranscriber && (
        <StreamTranscriber
          streamUrl={streamUrl}
          emissionId={currentEmissionId}
        />
      )}
    </div>
  );
};
```

---

## 🛠️ Guide d'implémentation

> ⚠️ **Stratégie d'implémentation par étapes** : Ce module sera développé en deux grandes phases. D'abord, la **fonctionnalité manuelle** (création, édition, suppression de citations) sera implémentée et stabilisée. Une fois cette base solide, la **fonctionnalité de transcription** sera ajoutée.

---

## 📦 PARTIE 1 : Fonctionnalités Manuelles (MVP)

### Phase 1.1 : Types et structure de base (Manuel uniquement)

```bash
# Créer les types essentiels
touch src/types/quote.ts

# Créer la structure de dossiers (manuel uniquement)
mkdir -p src/pages/Quotes
mkdir -p src/components/quotes
mkdir -p src/hooks/quotes
mkdir -p src/api/firebase

# Note : Les dossiers transcription seront créés en Partie 2
```

### Phase 1.2 : Backend Firestore (Manuel uniquement)

```bash
# Créer les services Firebase pour citations manuelles
touch src/api/firebase/quotes.ts
touch src/api/firebase/storage.ts

# Configurer les règles de sécurité Firestore
# Éditer firestore.rules (voir section Backend)
# Focus : Collection quotes uniquement

# Créer les indexes Firestore pour citations
# Via console Firebase ou CLI
```

**Configuration Firestore initiale :**
```javascript
// firestore.rules (Version MVP - Manuel)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Collection quotes (manuel uniquement pour MVP)
    match /quotes/{quoteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.createdBy == request.auth.uid
                    && request.resource.data.source.type == 'manual'; // Restriction MVP
      allow update: if request.auth != null
                    && (resource.data.createdBy == request.auth.uid || isAdmin());
      allow delete: if request.auth != null
                    && (resource.data.createdBy == request.auth.uid || isAdmin());
    }
  }
}
```

### Phase 1.3 : Hooks et stores (Manuel uniquement)

```bash
# Créer le hook principal pour citations manuelles
touch src/hooks/quotes/useQuotes.ts
touch src/hooks/quotes/useQuoteTemplates.ts

# Créer le store Zustand
touch src/store/useQuoteStore.ts
```

### Phase 1.4 : Composants UI (Manuel uniquement)

```bash
# Créer les pages essentielles
touch src/pages/Quotes/QuotesList.tsx
touch src/pages/Quotes/CreateQuoteManual.tsx
touch src/pages/Quotes/QuoteDetails.tsx
touch src/pages/Quotes/GenerateContent.tsx

# Créer les composants de base
touch src/components/quotes/QuoteCard.tsx
touch src/components/quotes/QuoteForm.tsx
touch src/components/quotes/AudioUploader.tsx
touch src/components/quotes/SocialPreview.tsx
touch src/components/quotes/ImageGenerator.tsx
touch src/components/quotes/TemplateSelector.tsx
```

**Structure simplifiée pour MVP :**
- ❌ Pas de `CreateQuote.tsx` (sélecteur de mode) - non nécessaire pour MVP
- ❌ Pas de `QuoteModeSelector.tsx` - sera ajouté en Partie 2
- ✅ Accès direct à `CreateQuoteManual.tsx`

### Phase 1.5 : Routes et navigation (Manuel uniquement)

```typescript
// src/App.tsx (Version MVP)

import { QuotesList } from './pages/Quotes/QuotesList';
import { CreateQuoteManual } from './pages/Quotes/CreateQuoteManual';
import { QuoteDetails } from './pages/Quotes/QuoteDetails';
import { GenerateContent } from './pages/Quotes/GenerateContent';

<Routes>
  {/* Liste des citations */}
  <Route
    path="/quotes"
    element={
      <ProtectedRoute requiredPermission="quotes_view">
        <QuotesList />
      </ProtectedRoute>
    }
  />
  
  {/* Création manuelle directe (pas de sélecteur de mode) */}
  <Route
    path="/quotes/create"
    element={
      <ProtectedRoute requiredPermission="quotes_create">
        <CreateQuoteManual />
      </ProtectedRoute>
    }
  />
  
  {/* Détails d'une citation */}
  <Route
    path="/quotes/:id"
    element={
      <ProtectedRoute requiredPermission="quotes_view">
        <QuoteDetails />
      </ProtectedRoute>
    }
  />
  
  {/* Génération de contenu social */}
  <Route
    path="/quotes/:id/generate"
    element={
      <ProtectedRoute requiredPermission="quotes_publish">
        <GenerateContent />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Phase 1.6 : Permissions (MVP - Réduites)

```typescript
// src/types/auth.ts (Permissions MVP)

export interface Permissions {
  // ...permissions existantes...
  
  // Permissions pour citations MANUELLES uniquement
  quotes_view: boolean;
  quotes_create: boolean;
  quotes_edit: boolean;
  quotes_delete: boolean;
  quotes_publish: boolean;
  
  // Les permissions de transcription seront ajoutées en Partie 2:
  // stream_transcription_view: boolean;
  // stream_transcription_create: boolean;
  // quotes_capture_live: boolean;
}
```

### Phase 1.7 : Tests MVP

```bash
# Tests pour fonctionnalités manuelles uniquement
touch src/hooks/quotes/useQuotes.test.ts
touch src/components/quotes/QuoteForm.test.tsx
touch tests/integration/quotes-manual-workflow.test.ts
```

### Phase 1.8 : Stabilisation et validation

**Critères de stabilité avant Phase 2 :**
- ✅ CRUD complet fonctionnel (Create, Read, Update, Delete)
- ✅ Upload d'audio optionnel fonctionnel
- ✅ Génération d'images pour réseaux sociaux
- ✅ Permissions correctement appliquées
- ✅ Tests unitaires et d'intégration passent
- ✅ Pas de bugs majeurs après 1 semaine d'utilisation
- ✅ Performance acceptable (< 2s pour créer une citation)
- ✅ Documentation utilisateur complète

---

## 🎤 PARTIE 2 : Fonctionnalités de Transcription (Avancé)

> 🚧 **Cette partie ne sera implémentée qu'après stabilisation de la Partie 1**

### Phase 2.1 : Types pour transcription

```bash
# Ajouter les types de transcription
touch src/types/transcription.ts

# Mettre à jour quote.ts pour source.type = 'stream_transcription'
```

### Phase 2.2 : Backend transcription

```bash
# Créer les services de transcription
touch src/api/firebase/transcriptions.ts

# Mettre à jour firestore.rules pour collection streamTranscriptions
```

**Règles Firestore étendues :**
```javascript
// Ajouter à firestore.rules

match /streamTranscriptions/{transcriptionId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null
               && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.stream_transcription_create == true;
}
```

### Phase 2.3 : Hooks de transcription

```bash
# Créer la structure transcription
mkdir -p src/hooks/transcription
mkdir -p src/components/transcription

# Créer les hooks
touch src/hooks/transcription/useStreamTranscription.ts
touch src/hooks/transcription/useAudioCapture.ts

# Créer le store
touch src/store/useTranscriptionStore.ts
```

### Phase 2.4 : Composants de transcription

```bash
# Créer les composants de transcription
touch src/components/transcription/StreamTranscriber.tsx
touch src/components/transcription/LiveTranscriptDisplay.tsx
touch src/components/transcription/QuoteCaptureTool.tsx
touch src/components/transcription/TranscriptTimeline.tsx

# Créer la page de sélection de mode
touch src/pages/Quotes/CreateQuote.tsx
touch src/pages/Quotes/CreateQuoteFromStream.tsx
touch src/components/quotes/QuoteModeSelector.tsx
```

### Phase 2.5 : Mise à jour des routes

```typescript
// src/App.tsx (Version complète avec transcription)

import { CreateQuote } from './pages/Quotes/CreateQuote'; // Nouveau : sélecteur de mode

<Routes>
  {/* ... routes existantes ... */}
  
  {/* Remplacer la route /quotes/create */}
  <Route
    path="/quotes/create"
    element={
      <ProtectedRoute requiredPermission="quotes_create">
        <CreateQuote /> {/* Maintenant avec sélecteur manuel/transcription */}
      </ProtectedRoute>
    }
  />
  
  {/* Nouvelle route pour mode manuel spécifique */}
  <Route
    path="/quotes/create/manual"
    element={
      <ProtectedRoute requiredPermission="quotes_create">
        <CreateQuoteManual />
      </ProtectedRoute>
    }
  />
  
  {/* Nouvelle route pour mode transcription */}
  <Route
    path="/quotes/create/stream"
    element={
      <ProtectedRoute requiredPermission="stream_transcription_create">
        <CreateQuoteFromStream />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Phase 2.6 : Ajout des permissions de transcription

```typescript
// Ajouter dans src/types/auth.ts

export interface Permissions {
  // ... permissions existantes (Partie 1) ...
  
  // NOUVELLES permissions pour transcription
  stream_transcription_view: boolean;
  stream_transcription_create: boolean;
  quotes_capture_live: boolean;
}
```

### Phase 2.7 : Intégration avec RadioPlayer

```bash
# Mettre à jour le RadioPlayer existant
# Ajouter le bouton de transcription dans l'interface
```

### Phase 2.8 : Tests de transcription

```bash
# Tests spécifiques à la transcription
touch src/hooks/transcription/useStreamTranscription.test.ts
touch tests/integration/quotes-stream-workflow.test.ts
```

---

## 📊 Résumé des phases

### Partie 1 : Fonctionnalités Manuelles (MVP)
**Objectif :** Permettre la création, édition, suppression de citations manuellement  
**Durée estimée :** 2-3 semaines  
**Livrables :**
- Collection Firestore `quotes` fonctionnelle
- CRUD complet avec permissions
- Interface de création manuelle
- Génération d'images pour réseaux sociaux
- Tests unitaires et d'intégration

### Partie 2 : Fonctionnalités de Transcription (Avancé)
**Objectif :** Ajouter la capture automatique depuis le stream radio  
**Prérequis :** Partie 1 stable et validée  
**Durée estimée :** 3-4 semaines  
**Livrables :**
- Collection Firestore `streamTranscriptions`
- Web Speech API intégrée
- Composants de transcription live
- Capture de citations depuis transcription
- Sélecteur de mode (manuel/transcription)

### Phase 6 : Permissions

```typescript
// src/types/auth.ts

export interface Permissions {
  // ...permissions existantes...
  
  // Nouvelles permissions pour citations
  quotes_view: boolean;
  quotes_create: boolean;
  quotes_edit: boolean;
  quotes_delete: boolean;
  quotes_publish: boolean;
  stream_transcription_view: boolean;
  stream_transcription_create: boolean;
  quotes_capture_live: boolean;
}
```

---

## 🔐 Permissions

### Liste des permissions

Le module Citations nécessite **8 nouvelles permissions** à ajouter au système d'authentification :

| Permission | Description | Usage |
|------------|-------------|-------|
| `quotes_view` | Visualiser les citations | Liste, détails, recherche |
| `quotes_create` | Créer de nouvelles citations | Formulaire création manuelle ou depuis stream |
| `quotes_edit` | Modifier les citations existantes | Édition contenu, métadonnées, tags |
| `quotes_delete` | Supprimer des citations | Suppression définitive (attention aux cascades) |
| `quotes_publish` | Publier sur réseaux sociaux | Génération contenu, publication Facebook/Twitter/Instagram |
| `stream_transcription_view` | Voir les transcriptions en direct | Accès au composant de transcription live |
| `stream_transcription_create` | Démarrer une transcription | Bouton "Transcrire le stream" |
| `quotes_capture_live` | Capturer depuis transcription live | Bouton capture pendant transcription active |

### Matrice des permissions par rôle

| Rôle | quotes_view | quotes_create | quotes_edit | quotes_delete | quotes_publish | stream_transcription_view | stream_transcription_create | quotes_capture_live |
|------|-------------|---------------|-------------|---------------|----------------|---------------------------|----------------------------|---------------------|
| **Admin** | ✅ | ✅ | ✅ Toutes | ✅ Toutes | ✅ | ✅ | ✅ | ✅ |
| **Éditeur** | ✅ | ✅ | ✅ Siennes | ✅ Siennes | ✅ | ✅ | ✅ | ✅ |
| **Animateur** | ✅ | ✅ | ✅ Siennes | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Community Manager** | ✅ | ✅ | ✅ Toutes | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Invité** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Implémentation Backend (API FastAPI)

#### 1. Modèles de permissions

```python
# app/models/permissions.py

from enum import Enum
from typing import List

class QuotePermission(str, Enum):
    """Permissions pour le module Citations"""
    QUOTES_VIEW = "quotes_view"
    QUOTES_CREATE = "quotes_create"
    QUOTES_EDIT = "quotes_edit"
    QUOTES_DELETE = "quotes_delete"
    QUOTES_PUBLISH = "quotes_publish"
    STREAM_TRANSCRIPTION_VIEW = "stream_transcription_view"
    STREAM_TRANSCRIPTION_CREATE = "stream_transcription_create"
    QUOTES_CAPTURE_LIVE = "quotes_capture_live"

# Permissions par rôle
ROLE_PERMISSIONS = {
    "admin": [
        QuotePermission.QUOTES_VIEW,
        QuotePermission.QUOTES_CREATE,
        QuotePermission.QUOTES_EDIT,
        QuotePermission.QUOTES_DELETE,
        QuotePermission.QUOTES_PUBLISH,
        QuotePermission.STREAM_TRANSCRIPTION_VIEW,
        QuotePermission.STREAM_TRANSCRIPTION_CREATE,
        QuotePermission.QUOTES_CAPTURE_LIVE,
    ],
    "editor": [
        QuotePermission.QUOTES_VIEW,
        QuotePermission.QUOTES_CREATE,
        QuotePermission.QUOTES_EDIT,
        QuotePermission.QUOTES_PUBLISH,
        QuotePermission.STREAM_TRANSCRIPTION_VIEW,
        QuotePermission.STREAM_TRANSCRIPTION_CREATE,
        QuotePermission.QUOTES_CAPTURE_LIVE,
    ],
    "presenter": [
        QuotePermission.QUOTES_VIEW,
        QuotePermission.QUOTES_CREATE,
        QuotePermission.QUOTES_EDIT,
        QuotePermission.STREAM_TRANSCRIPTION_VIEW,
        QuotePermission.STREAM_TRANSCRIPTION_CREATE,
        QuotePermission.QUOTES_CAPTURE_LIVE,
    ],
    "community_manager": [
        QuotePermission.QUOTES_VIEW,
        QuotePermission.QUOTES_CREATE,
        QuotePermission.QUOTES_EDIT,
        QuotePermission.QUOTES_PUBLISH,
        QuotePermission.STREAM_TRANSCRIPTION_VIEW,
    ],
    "guest": [
        QuotePermission.QUOTES_VIEW,
    ],
}
```

#### 2. Dépendances de vérification des permissions

```python
# app/dependencies/permissions.py

from fastapi import HTTPException, Depends, status
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.permissions import QuotePermission, ROLE_PERMISSIONS

def has_permission(required_permission: QuotePermission):
    """
    Dependency pour vérifier si l'utilisateur a une permission spécifique
    """
    async def permission_checker(current_user: User = Depends(get_current_user)):
        user_role = current_user.role
        user_permissions = ROLE_PERMISSIONS.get(user_role, [])
        
        if required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Permission refusée",
                    "required_permission": required_permission.value,
                    "user_role": user_role,
                }
            )
        
        return current_user
    
    return permission_checker

def has_any_permission(required_permissions: List[QuotePermission]):
    """
    Dependency pour vérifier si l'utilisateur a AU MOINS UNE des permissions
    """
    async def permission_checker(current_user: User = Depends(get_current_user)):
        user_role = current_user.role
        user_permissions = ROLE_PERMISSIONS.get(user_role, [])
        
        if not any(perm in user_permissions for perm in required_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Permission refusée",
                    "required_permissions": [p.value for p in required_permissions],
                    "user_role": user_role,
                }
            )
        
        return current_user
    
    return permission_checker

def check_quote_ownership(user: User, quote_created_by: str) -> bool:
    """
    Vérifie si l'utilisateur est propriétaire de la citation
    ou s'il a le rôle admin
    """
    return user.role == "admin" or user.id == quote_created_by
```

#### 3. Routes protégées

```python
# app/routers/quotes.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.models.user import User
from app.models.quote import Quote, CreateQuoteRequest, UpdateQuoteRequest
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import has_permission, check_quote_ownership
from app.models.permissions import QuotePermission
from app.services import quote_service

router = APIRouter(prefix="/quotes", tags=["Citations"])

@router.get(
    "/",
    response_model=List[Quote],
    dependencies=[Depends(has_permission(QuotePermission.QUOTES_VIEW))]
)
async def list_quotes(
    status: Optional[str] = None,
    emission_id: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """
    Liste toutes les citations avec filtres optionnels
    Permission requise: quotes_view
    """
    return await quote_service.get_quotes(
        status=status,
        emission_id=emission_id,
        limit=limit
    )

@router.post(
    "/",
    response_model=Quote,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(has_permission(QuotePermission.QUOTES_CREATE))]
)
async def create_quote(
    quote_data: CreateQuoteRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Crée une nouvelle citation
    Permission requise: quotes_create
    """
    return await quote_service.create_quote(
        quote_data=quote_data,
        user_id=current_user.id
    )

@router.get(
    "/{quote_id}",
    response_model=Quote,
    dependencies=[Depends(has_permission(QuotePermission.QUOTES_VIEW))]
)
async def get_quote(
    quote_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Récupère une citation par son ID
    Permission requise: quotes_view
    """
    quote = await quote_service.get_quote_by_id(quote_id)
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Citation introuvable"
        )
    return quote

@router.put(
    "/{quote_id}",
    response_model=Quote,
    dependencies=[Depends(has_permission(QuotePermission.QUOTES_EDIT))]
)
async def update_quote(
    quote_id: str,
    quote_data: UpdateQuoteRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Met à jour une citation
    Permission requise: quotes_edit
    Restriction: Seul le créateur ou un admin peut modifier
    """
    # Récupérer la citation existante
    existing_quote = await quote_service.get_quote_by_id(quote_id)
    if not existing_quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Citation introuvable"
        )
    
    # Vérifier la propriété
    if not check_quote_ownership(current_user, existing_quote.created_by):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez modifier que vos propres citations"
        )
    
    return await quote_service.update_quote(quote_id, quote_data)

@router.delete(
    "/{quote_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_permission(QuotePermission.QUOTES_DELETE))]
)
async def delete_quote(
    quote_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Supprime une citation
    Permission requise: quotes_delete
    Restriction: Seul le créateur ou un admin peut supprimer
    """
    # Récupérer la citation existante
    existing_quote = await quote_service.get_quote_by_id(quote_id)
    if not existing_quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Citation introuvable"
        )
    
    # Vérifier la propriété
    if not check_quote_ownership(current_user, existing_quote.created_by):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez supprimer que vos propres citations"
        )
    
    await quote_service.delete_quote(quote_id)

@router.post(
    "/{quote_id}/publish",
    response_model=Quote,
    dependencies=[Depends(has_permission(QuotePermission.QUOTES_PUBLISH))]
)
async def publish_quote(
    quote_id: str,
    platforms: List[str],
    current_user: User = Depends(get_current_user)
):
    """
    Publie une citation sur les réseaux sociaux
    Permission requise: quotes_publish
    """
    return await quote_service.publish_quote(
        quote_id=quote_id,
        platforms=platforms,
        user_id=current_user.id
    )
```

#### 4. Routes pour les transcriptions

```python
# app/routers/transcriptions.py

from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.models.transcription import Transcription, StartTranscriptionRequest
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import has_permission
from app.models.permissions import QuotePermission
from app.services import transcription_service

router = APIRouter(prefix="/transcriptions", tags=["Transcriptions"])

@router.post(
    "/start",
    response_model=Transcription,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(has_permission(QuotePermission.STREAM_TRANSCRIPTION_CREATE))]
)
async def start_transcription(
    transcription_data: StartTranscriptionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Démarre une nouvelle session de transcription
    Permission requise: stream_transcription_create
    """
    return await transcription_service.start_transcription(
        emission_id=transcription_data.emission_id,
        emission_name=transcription_data.emission_name,
        user_id=current_user.id
    )

@router.get(
    "/{transcription_id}",
    response_model=Transcription,
    dependencies=[Depends(has_permission(QuotePermission.STREAM_TRANSCRIPTION_VIEW))]
)
async def get_transcription(
    transcription_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Récupère une transcription par son ID
    Permission requise: stream_transcription_view
    """
    transcription = await transcription_service.get_transcription_by_id(transcription_id)
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription introuvable"
        )
    return transcription

@router.post(
    "/{transcription_id}/stop",
    response_model=Transcription,
    dependencies=[Depends(has_permission(QuotePermission.STREAM_TRANSCRIPTION_CREATE))]
)
async def stop_transcription(
    transcription_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Arrête une session de transcription
    Permission requise: stream_transcription_create
    """
    return await transcription_service.stop_transcription(transcription_id)
```

#### 5. Enregistrement des routes

```python
# app/main.py

from fastapi import FastAPI
from app.routers import quotes, transcriptions

app = FastAPI(title="Radio Manager API")

# Enregistrer les routers
app.include_router(quotes.router, prefix="/api")
app.include_router(transcriptions.router, prefix="/api")
```

### Implémentation Frontend (React)

#### 1. Types TypeScript

```typescript
// src/types/auth.ts

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  email: string;
  family_name: string;
  name: string;
  phone_number: null;

  permissions: {
    user_id: number;
    // ...permissions existantes...
    
    // NOUVELLES PERMISSIONS MODULE CITATIONS
    quotes_view: boolean;
    quotes_create: boolean;
    quotes_edit: boolean;
    quotes_delete: boolean;
    quotes_publish: boolean;
    stream_transcription_view: boolean;
    stream_transcription_create: boolean;
    quotes_capture_live: boolean;
    
    granted_at: string;
  };
}
```

#### 2. Hook de vérification des permissions

```typescript
// src/hooks/permissions/usePermissions.ts

import { useAuthStore } from '../../store/useAuthStore';

export const usePermissions = () => {
  const { user } = useAuthStore();

  const hasPermission = (permission: keyof typeof user.permissions): boolean => {
    return user?.permissions?.[permission] ?? false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p as any));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p as any));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    // Raccourcis pour le module Citations
    canViewQuotes: hasPermission('quotes_view'),
    canCreateQuotes: hasPermission('quotes_create'),
    canEditQuotes: hasPermission('quotes_edit'),
    canDeleteQuotes: hasPermission('quotes_delete'),
    canPublishQuotes: hasPermission('quotes_publish'),
    canViewTranscriptions: hasPermission('stream_transcription_view'),
    canCreateTranscriptions: hasPermission('stream_transcription_create'),
    canCaptureLive: hasPermission('quotes_capture_live'),
  };
};
```

#### 3. Composant ProtectedRoute

```typescript
// src/components/common/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/unauthorized',
}) => {
  const { user } = useAuthStore();

  if (!user?.permissions[requiredPermission]) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
```

#### 4. Composant ConditionalRender

```typescript
// src/components/common/ConditionalRender.tsx

import { usePermissions } from '../../hooks/permissions/usePermissions';

interface ConditionalRenderProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallback?: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  requiredPermission,
  fallback = null,
}) => {
  const { hasPermission } = usePermissions();

  return hasPermission(requiredPermission as any) ? <>{children}</> : <>{fallback}</>;
};
```

#### 5. Utilisation dans les composants

```typescript
// src/pages/Quotes/QuotesList.tsx

import { ConditionalRender } from '../../components/common/ConditionalRender';
import { usePermissions } from '../../hooks/permissions/usePermissions';

export const QuotesList: React.FC = () => {
  const { canCreateQuotes, canEditQuotes, canDeleteQuotes } = usePermissions();

  return (
    <div>
      <h1>Citations</h1>

      {/* Bouton visible uniquement si permission create */}
      <ConditionalRender requiredPermission="quotes_create">
        <button onClick={handleCreate}>
          ➕ Nouvelle citation
        </button>
      </ConditionalRender>

      {/* Liste des citations */}
      {quotes.map(quote => (
        <QuoteCard
          key={quote.id}
          quote={quote}
          showEditButton={canEditQuotes}
          showDeleteButton={canDeleteQuotes}
        />
      ))}
    </div>
  );
};
```

#### 6. Routes protégées

```typescript
// src/App.tsx

import { ProtectedRoute } from './components/common/ProtectedRoute';

<Routes>
  {/* Liste des citations - Lecture seule */}
  <Route
    path="/quotes"
    element={
      <ProtectedRoute requiredPermission="quotes_view">
        <QuotesList />
      </ProtectedRoute>
    }
  />

  {/* Création de citation */}
  <Route
    path="/quotes/create"
    element={
      <ProtectedRoute requiredPermission="quotes_create">
        <CreateQuote />
      </ProtectedRoute>
    }
  />

  {/* Détails et édition */}
  <Route
    path="/quotes/:id"
    element={
      <ProtectedRoute requiredPermission="quotes_view">
        <QuoteDetails />
      </ProtectedRoute>
    }
  />

  {/* Génération de contenu social */}
  <Route
    path="/quotes/:id/generate"
    element={
      <ProtectedRoute requiredPermission="quotes_publish">
        <GenerateContent />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Validation des permissions côté composant

```typescript
// Exemple dans QuoteForm.tsx

const handleSubmit = async (data: CreateQuoteData) => {
  const { hasPermission } = usePermissions();
  
  // Vérification avant action critique
  if (!hasPermission('quotes_create')) {
    toast.error('Vous n\'avez pas la permission de créer des citations');
    return;
  }

  try {
    await createQuote(data);
    toast.success('Citation créée avec succès');
  } catch (error) {
    toast.error('Erreur lors de la création');
  }
};
```

### Migration et déploiement

#### Commandes à exécuter

```bash
# Backend (FastAPI)
# Vérifier que les permissions sont bien définies
python -m app.models.permissions

# Tester les endpoints avec les permissions
pytest tests/test_quote_permissions.py -v

# Démarrer le serveur
uvicorn app.main:app --reload

# Frontend (React)
# Les types TypeScript seront automatiquement mis à jour
npm run build
```

### Tests des permissions

```python
# tests/test_quote_permissions.py

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.permissions import QuotePermission

client = TestClient(app)

def test_admin_has_all_permissions():
    """Admin devrait avoir toutes les permissions"""
    admin_token = get_admin_token()
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test création
    response = client.post(
        "/api/quotes",
        json={"content": "Test quote", "author": {"name": "Test"}},
        headers=headers
    )
    assert response.status_code == 201
    
    # Test suppression
    quote_id = response.json()["id"]
    response = client.delete(f"/api/quotes/{quote_id}", headers=headers)
    assert response.status_code == 204

def test_guest_only_view_permission():
    """Invité ne devrait avoir que la permission de visualisation"""
    guest_token = get_guest_token()
    headers = {"Authorization": f"Bearer {guest_token}"}
    
    # Test lecture (devrait fonctionner)
    response = client.get("/api/quotes", headers=headers)
    assert response.status_code == 200
    
    # Test création (devrait échouer)
    response = client.post(
        "/api/quotes",
        json={"content": "Test quote", "author": {"name": "Test"}},
        headers=headers
    )
    assert response.status_code == 403
    assert "Permission refusée" in response.json()["detail"]["error"]

def test_presenter_can_edit_own_quotes_only():
    """Animateur peut éditer seulement ses propres citations"""
    presenter_token = get_presenter_token()
    headers = {"Authorization": f"Bearer {presenter_token}"}
    
    # Créer une citation
    response = client.post(
        "/api/quotes",
        json={"content": "Test quote", "author": {"name": "Presenter"}},
        headers=headers
    )
    assert response.status_code == 201
    own_quote_id = response.json()["id"]
    
    # Éditer sa propre citation (devrait fonctionner)
    response = client.put(
        f"/api/quotes/{own_quote_id}",
        json={"content": "Updated quote"},
        headers=headers
    )
    assert response.status_code == 200
    
    # Essayer d'éditer la citation d'un autre (devrait échouer)
    other_quote_id = create_quote_as_other_user()
    response = client.put(
        f"/api/quotes/{other_quote_id}",
        json={"content": "Trying to update"},
        headers=headers
    )
    assert response.status_code == 403

def test_community_manager_can_publish():
    """Community Manager devrait pouvoir publier"""
    cm_token = get_community_manager_token()
    headers = {"Authorization": f"Bearer {cm_token}"}
    
    # Créer une citation
    response = client.post(
        "/api/quotes",
        json={"content": "Quote to publish", "author": {"name": "CM"}},
        headers=headers
    )
    quote_id = response.json()["id"]
    
    # Publier la citation (devrait fonctionner)
    response = client.post(
        f"/api/quotes/{quote_id}/publish",
        json={"platforms": ["facebook", "twitter"]},
        headers=headers
    )
    assert response.status_code == 200

def test_transcription_permissions():
    """Test des permissions de transcription"""
    # Animateur peut démarrer une transcription
    presenter_token = get_presenter_token()
    headers = {"Authorization": f"Bearer {presenter_token}"}
    
    response = client.post(
        "/api/transcriptions/start",
        json={"emission_id": "test-emission", "emission_name": "Test Show"},
        headers=headers
    )
    assert response.status_code == 201
    
    # Community Manager ne peut PAS démarrer une transcription
    cm_token = get_community_manager_token()
    headers = {"Authorization": f"Bearer {cm_token}"}
    
    response = client.post(
        "/api/transcriptions/start",
        json={"emission_id": "test-emission-2", "emission_name": "Test Show 2"},
        headers=headers
    )
    assert response.status_code == 403
```

---

## 🧪 Tests

### Tests unitaires recommandés

```typescript
// src/hooks/quotes/useQuotes.test.ts

describe('useQuotes', () => {
  it('devrait charger les citations au montage', async () => {
    // Test
  });

  it('devrait créer une citation avec succès', async () => {
    // Test
  });

  it('devrait filtrer par statut', async () => {
    // Test
  });

  it('devrait mettre à jour en temps réel', async () => {
    // Test
  });
});

// src/components/quotes/QuoteForm.test.tsx

describe('QuoteForm', () => {
  it('devrait valider les champs obligatoires', () => {
    // Test
  });

  it('devrait pré-remplir les données initiales', () => {
    // Test
  });

  it('devrait gérer l\'upload audio', async () => {
    // Test
  });
});
```

### Tests d'intégration

```typescript
// tests/integration/quotes-workflow.test.ts

describe('Workflow création citation manuelle', () => {
  it('devrait créer une citation de bout en bout', async () => {
    // 1. Naviguer vers /quotes/create
    // 2. Sélectionner mode manuel
    // 3. Remplir formulaire
    // 4. Soumettre
    // 5. Vérifier dans Firestore
    // 6. Vérifier affichage dans liste
  });
});

describe('Workflow capture depuis stream', () => {
  it('devrait capturer une citation depuis transcription', async () => {
    // 1. Démarrer transcription
    // 2. Simuler segment
    // 3. Capturer
    // 4. Valider
    // 5. Vérifier sauvegarde
  });
});
```

---

## 📝 Checklist d'implémentation

> 🎯 **Ordre d'implémentation** : Suivre l'ordre des sections (Partie 1 puis Partie 2)

---

### 🟢 PARTIE 1 : MVP - Fonctionnalités Manuelles

#### Backend Firestore (Partie 1)

- [ ] Créer collection `quotes` dans Firestore
- [ ] Créer collection `quoteTemplates` dans Firestore
- [ ] Configurer règles de sécurité Firestore (quotes uniquement)
- [ ] Créer indexes Firestore pour citations
- [ ] Configurer Firebase Storage pour audios
- [ ] Tester permissions par rôle (5 permissions MVP)

#### Frontend - Services (Partie 1)

- [ ] Créer `src/types/quote.ts`
- [ ] Créer `src/api/firebase/quotes.ts`
- [ ] Créer `src/api/firebase/storage.ts`
- [ ] Implémenter CRUD complet pour citations manuelles
- [ ] Implémenter temps réel (onSnapshot)
- [ ] Gestion d'erreurs et retry

#### Frontend - Hooks (Partie 1)

- [ ] Créer `src/hooks/quotes/useQuotes.ts`
- [ ] Créer `src/hooks/quotes/useQuoteTemplates.ts`
- [ ] Créer `src/store/useQuoteStore.ts`
- [ ] Tests unitaires des hooks

#### Frontend - Composants (Partie 1)

- [ ] Créer `QuotesList.tsx`
- [ ] Créer `CreateQuoteManual.tsx` (accès direct, pas de sélecteur)
- [ ] Créer `QuoteDetails.tsx`
- [ ] Créer `GenerateContent.tsx`
- [ ] Créer `QuoteCard.tsx`
- [ ] Créer `QuoteForm.tsx`
- [ ] Créer `AudioUploader.tsx`
- [ ] Créer `SocialPreview.tsx`
- [ ] Créer `ImageGenerator.tsx`
- [ ] Créer `TemplateSelector.tsx`

#### Frontend - Routes (Partie 1)

- [ ] Ajouter routes dans `App.tsx` (4 routes MVP)
- [ ] Configurer ProtectedRoute avec permissions MVP
- [ ] Ajouter navigation dans sidebar
- [ ] Tester navigation complète

#### Permissions (Partie 1)

- [ ] Ajouter 5 permissions MVP dans `types/auth.ts`
  - quotes_view
  - quotes_create
  - quotes_edit
  - quotes_delete
  - quotes_publish
- [ ] Configurer permissions par défaut par rôle
- [ ] Tester matrice de permissions MVP

#### Tests (Partie 1)

- [ ] Tests unitaires hooks (useQuotes)
- [ ] Tests unitaires composants (QuoteForm, QuoteCard)
- [ ] Tests d'intégration workflow manuel
- [ ] Tests E2E création/édition/suppression

#### Stabilisation (Partie 1)

- [ ] ✅ CRUD complet fonctionnel
- [ ] ✅ Upload audio optionnel OK
- [ ] ✅ Génération d'images OK
- [ ] ✅ Permissions appliquées correctement
- [ ] ✅ Tests passent (>90% couverture)
- [ ] ✅ Pas de bugs critiques
- [ ] ✅ Performance acceptable (< 2s création)
- [ ] ✅ Documentation utilisateur MVP complète
- [ ] ✅ Validation utilisateurs réels (1 semaine)

---

### 🔵 PARTIE 2 : Fonctionnalités de Transcription

> ⚠️ **NE PAS DÉMARRER avant stabilisation complète de la Partie 1**

#### Backend Transcription (Partie 2)

- [ ] Créer collection `streamTranscriptions` dans Firestore
- [ ] Mettre à jour règles de sécurité (ajouter streamTranscriptions)
- [ ] Créer indexes Firestore pour transcriptions
- [ ] Tester règles de sécurité transcription

#### Frontend - Services (Partie 2)

- [ ] Créer `src/types/transcription.ts`
- [ ] Créer `src/api/firebase/transcriptions.ts`
- [ ] Mettre à jour `quote.ts` pour source.type stream_transcription
- [ ] Implémenter CRUD transcriptions

#### Frontend - Hooks (Partie 2)

- [ ] Créer `src/hooks/transcription/useStreamTranscription.ts`
- [ ] Créer `src/hooks/transcription/useAudioCapture.ts`
- [ ] Créer `src/store/useTranscriptionStore.ts`
- [ ] Tests unitaires hooks transcription

#### Frontend - Composants (Partie 2)

- [ ] Créer `CreateQuote.tsx` (sélecteur de mode)
- [ ] Créer `CreateQuoteFromStream.tsx`
- [ ] Créer `QuoteModeSelector.tsx`
- [ ] Créer `StreamTranscriber.tsx`
- [ ] Créer `LiveTranscriptDisplay.tsx`
- [ ] Créer `QuoteCaptureTool.tsx`
- [ ] Créer `TranscriptTimeline.tsx`

#### Frontend - Routes (Partie 2)

- [ ] Mettre à jour route `/quotes/create` (sélecteur)
- [ ] Ajouter route `/quotes/create/manual`
- [ ] Ajouter route `/quotes/create/stream`
- [ ] Tester navigation entre modes

#### Frontend - Intégrations (Partie 2)

- [ ] Intégrer avec RadioPlayer existant
- [ ] Intégrer avec module Émissions
- [ ] Intégrer avec module Conducteurs
- [ ] Ajouter bouton transcription dans RadioPlayer

#### Permissions (Partie 2)

- [ ] Ajouter 3 permissions transcription dans `types/auth.ts`
  - stream_transcription_view
  - stream_transcription_create
  - quotes_capture_live
- [ ] Mettre à jour matrice de permissions
- [ ] Tester nouvelles permissions

#### Tests (Partie 2)

- [ ] Tests unitaires hooks transcription
- [ ] Tests unitaires composants transcription
- [ ] Tests d'intégration workflow stream
- [ ] Tests E2E capture depuis stream
- [ ] Tests Web Speech API (mocks)

#### Documentation (Partie 2)

- [ ] Mettre à jour README.md
- [ ] Guide utilisateur transcription
- [ ] Troubleshooting Web Speech API
- [ ] Vidéos démo transcription

---

### 📚 Documentation (Transverse)

- [ ] Compléter README.md du module
- [ ] Guide utilisateur complet (parties 1 et 2)
- [ ] Documentation API complète
- [ ] Diagrammes architecture à jour

---

### ✅ Validation finale

- [ ] Tous les tests passent (Partie 1 + 2)
- [ ] Performance globale OK
- [ ] Sécurité validée (audit)
- [ ] Accessibilité vérifiée (WCAG AA)
- [ ] Documentation complète
- [ ] Formation équipe effectuée
- [ ] Déploiement en production validé

---

## 🚀 Déploiement

### Prérequis

- Firebase projet configuré
- Firestore activé
- Storage activé
- Authentication activée
- Node.js 18+
- npm ou yarn

### Étapes de déploiement

```bash
# 1. Installer dépendances
npm install

# 2. Configurer variables d'environnement
cp .env.example .env
# Éditer .env avec les clés Firebase

# 3. Build
npm run build

# 4. Déployer règles Firestore
firebase deploy --only firestore:rules

# 5. Déployer Storage rules
firebase deploy --only storage

# 6. Déployer application
npm run deploy
```

---

## 🐛 Dépannage

### Problème : Web Speech API ne fonctionne pas

**Solution :**
- Vérifier la compatibilité navigateur (Chrome/Edge recommandés)
- Vérifier les permissions micro dans le navigateur
- Vérifier que le site est en HTTPS (requis pour l'API)

### Problème : Transcription se coupe régulièrement

**Solution :**
- Ajouter logique de redémarrage automatique dans `onend`
- Gérer l'erreur `no-speech` et relancer
- Vérifier la connexion internet

### Problème : Citations non sauvegardées

**Solution :**
- Vérifier les règles Firestore
- Vérifier les permissions utilisateur
- Vérifier la console pour erreurs
- Vérifier que l'utilisateur est authentifié

---

## 📚 Ressources

### Documentation officielle

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

### Modules connexes

- [Authentication](./authentication.md)
- [Émissions](./emissions.md)
- [Conducteurs](./show-plans.md)
- [Permissions](../business/user-and-permissions.md)

---

## 🤝 Contribution

Pour contribuer à ce module :

1. Consulter cette documentation
2. Consulter [AGENT.md](../../AGENT.md) pour les conventions
3. Consulter [VERSIONING.md](../VERSIONING.md) pour le versioning
4. Créer une branche feature depuis `develop`
5. Implémenter avec tests
6. Créer PR vers `develop`

---

**Dernière mise à jour :** 2026-01-07  
**Version du module :** 1.2.0 (Prévue)  
**Responsable :** Agent IA Backend/Frontend
