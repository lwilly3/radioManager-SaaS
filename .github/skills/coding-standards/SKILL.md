# 📐 Agent Skill: Coding Standards

## Rôle
Garantir que tout code généré par l'agent respecte les standards de qualité, conventions et bonnes pratiques du projet RadioManager SaaS.

## Quand utiliser ce skill

### Déclencheurs automatiques
- L'agent s'apprête à créer ou modifier du code
- L'utilisateur demande de créer un composant, hook, ou fonction
- L'utilisateur demande un refactoring
- L'agent doit corriger un bug ou ajouter une fonctionnalité
- Lors de toute génération de code TypeScript/React

### Contexte d'utilisation
- **Systématique** : À chaque écriture ou modification de code
- Pendant les revues de code automatiques
- Lors de la création de nouveaux modules ou composants
- Avant de valider des changements importants

---

## Ce que l'agent DOIT faire

### 1. Standards TypeScript

#### Types et interfaces
```typescript
// ✅ BON : Types explicites et précis
interface Quote {
  id: string;
  content: string;
  author: QuoteAuthor;
  createdAt: Date;
  metadata?: QuoteMetadata;
}

type QuoteStatus = 'draft' | 'published' | 'archived';

// ❌ MAUVAIS : any ou types vagues
const data: any = {};
```

**Règles strictes:**
- **JAMAIS** utiliser `any` (utiliser `unknown` si vraiment nécessaire)
- Toujours typer les props des composants
- Typer les retours de fonctions
- Utiliser les types stricts pour les états Zustand
- Préférer `interface` pour les objets, `type` pour les unions/intersections

#### Imports et exports
```typescript
// ✅ BON : Imports organisés
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quote } from '@/types/quote';
import { useQuotes } from '@/hooks/quotes/useQuotes';
import { Button } from '@/components/ui/Button';

// ❌ MAUVAIS : Imports désorganisés
import { Button } from '../../../components/ui/Button';
import React from 'react';
```

**Ordre des imports:**
1. React et bibliothèques externes
2. Routing et navigation
3. Types et interfaces
4. Hooks personnalisés
5. Composants UI
6. Utilitaires et helpers
7. Styles

### 2. Standards React

#### Composants fonctionnels
```typescript
// ✅ BON : Composant bien structuré
interface QuoteCardProps {
  quote: Quote;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ 
  quote, 
  onEdit, 
  onDelete,
  className 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleEdit = () => {
    if (onEdit) onEdit(quote.id);
  };

  return (
    <div className={`quote-card ${className}`}>
      {/* JSX */}
    </div>
  );
};

// ❌ MAUVAIS : Sans types, logique désordonnée
export const QuoteCard = (props) => {
  // ...
};
```

**Règles composants:**
- Toujours typer les props avec une interface dédiée
- Utiliser `React.FC<Props>` ou typer directement les props
- Destructurer les props dans les paramètres
- Nommer les handlers avec le préfixe `handle`
- Séparer la logique du rendu (hooks en haut)

#### Hooks personnalisés
```typescript
// ✅ BON : Hook bien structuré
export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuotes();
      setQuotes(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return { quotes, loading, error, refetch: fetchQuotes };
};

// ❌ MAUVAIS : Sans gestion d'état appropriée
export const useQuotes = () => {
  const [data, setData] = useState();
  // ...
};
```

**Règles hooks:**
- Préfixer avec `use`
- Retourner un objet avec des propriétés nommées
- Gérer les états loading/error
- Utiliser `useCallback` pour les fonctions retournées
- Typer tous les états et retours

### 3. Standards Zustand (State Management)

```typescript
// ✅ BON : Store Zustand typé et structuré
interface QuoteState {
  quotes: Quote[];
  selectedQuote: Quote | null;
  setQuotes: (quotes: Quote[]) => void;
  selectQuote: (quote: Quote | null) => void;
  addQuote: (quote: Quote) => void;
  removeQuote: (id: string) => void;
}

export const useQuoteStore = create<QuoteState>()((set) => ({
  quotes: [],
  selectedQuote: null,
  setQuotes: (quotes) => set({ quotes }),
  selectQuote: (quote) => set({ selectedQuote: quote }),
  addQuote: (quote) => set((state) => ({ 
    quotes: [...state.quotes, quote] 
  })),
  removeQuote: (id) => set((state) => ({ 
    quotes: state.quotes.filter(q => q.id !== id) 
  })),
}));

// ❌ MAUVAIS : Sans types, mutations directes
export const useQuoteStore = create((set) => ({
  quotes: [],
  setQuotes: (quotes) => set({ quotes }),
}));
```

### 4. Validation avec Zod

```typescript
// ✅ BON : Schéma Zod complet
import { z } from 'zod';

export const quoteSchema = z.object({
  content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
  author: z.object({
    name: z.string().min(1, 'Le nom est requis'),
    avatar: z.string().url().optional(),
  }),
  category: z.enum(['politique', 'sport', 'culture', 'divers']),
  tags: z.array(z.string()).optional(),
  context: z.object({
    showName: z.string().optional(),
    showDate: z.date().optional(),
  }).optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

// ❌ MAUVAIS : Validation incomplète
export const quoteSchema = z.object({
  content: z.string(),
  author: z.string(),
});
```

### 5. Gestion des erreurs

```typescript
// ✅ BON : Gestion d'erreur complète
try {
  const response = await createQuote(quoteData);
  toast.success('Citation créée avec succès');
  navigate('/quotes');
} catch (error) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Une erreur est survenue';
  toast.error(errorMessage);
  console.error('Erreur création citation:', error);
}

// ❌ MAUVAIS : Catch vide ou générique
try {
  await createQuote(data);
} catch (e) {
  console.log(e);
}
```

### 6. Styling avec Tailwind CSS

```typescript
// ✅ BON : Classes Tailwind organisées et lisibles
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900">
    {title}
  </h2>
  <p className="text-sm text-gray-600">
    {description}
  </p>
</div>

// ❌ MAUVAIS : Classes désordonnées, inline styles
<div className="p-6 bg-white flex gap-4 shadow-md rounded-lg" style={{ marginTop: '10px' }}>
```

**Règles Tailwind:**
- Organiser par catégories : layout → spacing → colors → typography → effects
- Éviter les styles inline (utiliser Tailwind)
- Utiliser les variants (`hover:`, `focus:`, `active:`)
- Créer des composants réutilisables pour patterns répétés

### 7. Nommage des variables et fonctions

```typescript
// ✅ BON : Noms descriptifs et cohérents
const handleQuoteSubmit = async () => { /* ... */ };
const isQuotePublished = quote.status === 'published';
const filteredQuotes = quotes.filter(q => q.category === category);

// ❌ MAUVAIS : Noms vagues ou incohérents
const submit = () => { /* ... */ };
const flag = quote.status === 'published';
const arr = quotes.filter(q => q.category === category);
```

**Conventions de nommage:**
- Variables: `camelCase` descriptif
- Constantes: `UPPER_SNAKE_CASE` pour valeurs fixes
- Fonctions: `camelCase` avec verbe d'action
- Composants: `PascalCase`
- Hooks: `useCamelCase`
- Types/Interfaces: `PascalCase`
- Booleans: préfixer avec `is`, `has`, `should`

### 8. Commentaires et documentation

```typescript
// ✅ BON : Commentaires utiles et JSDoc
/**
 * Récupère toutes les citations d'un conducteur spécifique
 * @param showPlanId - ID du conducteur
 * @param options - Options de filtrage optionnelles
 * @returns Promise avec tableau de citations
 */
export const getQuotesByShowPlan = async (
  showPlanId: string,
  options?: QuoteQueryOptions
): Promise<Quote[]> => {
  // Construire la requête Firestore avec les filtres
  const q = query(
    quotesCollection,
    where('showPlanId', '==', showPlanId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ❌ MAUVAIS : Commentaires inutiles ou absents
// Get quotes
export const getQuotes = async (id) => {
  const q = query(col, where('id', '==', id));
  return await getDocs(q);
};
```

---

## Ce que l'agent NE DOIT PAS faire

### ❌ Anti-patterns critiques

1. **Ne JAMAIS utiliser `any`**
   ```typescript
   // ❌ INTERDIT
   const data: any = fetchData();
   
   // ✅ FAIRE
   const data: Quote[] = await fetchQuotes();
   ```

2. **Ne PAS créer de composants non typés**
   ```typescript
   // ❌ INTERDIT
   export const MyComponent = (props) => { /* ... */ };
   
   // ✅ FAIRE
   interface MyComponentProps {
     title: string;
     onSubmit: () => void;
   }
   export const MyComponent: React.FC<MyComponentProps> = ({ title, onSubmit }) => {
     /* ... */
   };
   ```

3. **Ne PAS ignorer les erreurs**
   ```typescript
   // ❌ INTERDIT
   try {
     await operation();
   } catch (e) {}
   
   // ✅ FAIRE
   try {
     await operation();
   } catch (error) {
     console.error('Operation failed:', error);
     toast.error('Une erreur est survenue');
   }
   ```

4. **Ne PAS mélanger logique et présentation**
   ```typescript
   // ❌ INTERDIT : Tout dans le composant
   export const QuoteList = () => {
     const [quotes, setQuotes] = useState([]);
     
     useEffect(() => {
       fetch('/api/quotes').then(r => r.json()).then(setQuotes);
     }, []);
     
     return <div>{/* JSX */}</div>;
   };
   
   // ✅ FAIRE : Séparer avec un hook
   export const QuoteList = () => {
     const { quotes, loading, error } = useQuotes();
     
     if (loading) return <Spinner />;
     if (error) return <ErrorMessage error={error} />;
     
     return <div>{/* JSX */}</div>;
   };
   ```

5. **Ne PAS dupliquer du code**
   - Créer des composants réutilisables
   - Extraire la logique commune dans des hooks
   - Utiliser les utilitaires partagés

6. **Ne PAS ignorer les conventions de fichiers**
   ```
   ❌ MAUVAIS :
   src/QuoteComponent.tsx
   src/quoteHook.ts
   
   ✅ BON :
   src/components/quotes/QuoteCard.tsx
   src/hooks/quotes/useQuotes.ts
   ```

---

## Checklist de validation du code

Avant de soumettre du code, l'agent DOIT vérifier:

- [ ] Tous les types TypeScript sont explicites (pas de `any`)
- [ ] Les interfaces/types des props sont définies
- [ ] Les imports sont organisés correctement
- [ ] Les noms de variables/fonctions sont descriptifs
- [ ] Les erreurs sont gérées correctement
- [ ] Les hooks utilisent `useCallback`/`useMemo` si nécessaire
- [ ] Le code suit la structure de fichiers du projet
- [ ] Les composants sont dans les bons dossiers
- [ ] Les classes Tailwind sont organisées
- [ ] Aucune duplication de code n'existe
- [ ] Les commentaires JSDoc sont présents pour fonctions complexes
- [ ] Le code est lisible et maintenable

---

## Exemples de requêtes utilisateur

```
✅ "Crée un composant QuoteCard"
✅ "Ajoute un hook pour gérer les citations"
✅ "Refactorise ce code pour être plus propre"
✅ "Corrige ce bug dans le composant"
✅ "Crée un formulaire de création de citation"
✅ "Améliore la gestion d'erreur de cette fonction"
```

---

## Outils et extensions recommandés

- **ESLint** : Linting automatique
- **Prettier** : Formatage de code
- **TypeScript strict mode** : Activé dans `tsconfig.json`
- **VS Code extensions** :
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Error Lens

---

## Métadonnées

- **Version:** 1.0.0
- **Dernière mise à jour:** 2026-01-30
- **Priorité:** Critique
- **Dépendances:** project-overview
- **Utilisé par:** Toutes les tâches de développement
