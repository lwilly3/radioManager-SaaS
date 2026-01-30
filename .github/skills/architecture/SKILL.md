# 🏗️ Agent Skill: Architecture

## Rôle
Guider l'agent dans les décisions architecturales, les patterns de conception et l'organisation du code pour maintenir une architecture cohérente, scalable et maintenable.

## Quand utiliser ce skill

### Déclencheurs automatiques
- L'agent doit créer un nouveau module ou fonctionnalité majeure
- L'utilisateur demande de restructurer du code
- L'agent doit choisir entre plusieurs approches techniques
- Création de nouveaux stores, services ou API
- Intégration de nouvelles dépendances ou bibliothèques
- Refactoring de composants complexes

### Contexte d'utilisation
- Lors de la conception de nouvelles fonctionnalités
- Pour résoudre des problèmes de performance
- Quand le code devient difficile à maintenir
- Avant d'introduire de nouveaux patterns
- Pour évaluer l'impact architectural d'un changement

---

## Ce que l'agent DOIT faire

### 1. Architecture en couches (Layers Architecture)

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │  ← React Components, Pages
│  (Components, Pages, UI)                │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Business Logic Layer           │  ← Hooks, Stores
│  (Hooks, Stores, State Management)      │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Data Access Layer              │  ← API Services
│  (API Services, Firebase)               │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          External Services              │  ← Firebase, Backend
│  (Firebase, Cloud Functions)            │
└─────────────────────────────────────────┘
```

**Règle fondamentale:** Les dépendances doivent toujours pointer vers le bas. Un composant peut utiliser un hook, mais un hook ne doit jamais importer un composant.

### 2. Organisation par fonctionnalité (Feature-based)

```typescript
// ✅ BON : Organisation par module/fonctionnalité
src/
├── components/
│   ├── quotes/               // Composants du module Citations
│   │   ├── QuoteCard.tsx
│   │   ├── QuoteForm.tsx
│   │   └── QuoteList.tsx
│   ├── showPlans/            // Composants du module Conducteurs
│   └── common/               // Composants partagés
│       ├── Button.tsx
│       └── Modal.tsx
├── hooks/
│   ├── quotes/               // Hooks spécifiques aux citations
│   │   ├── useQuotes.ts
│   │   └── useQuoteForm.ts
│   └── common/               // Hooks partagés
├── api/
│   └── firebase/
│       ├── quotes.ts         // API Citations
│       └── showPlans.ts      // API Conducteurs

// ❌ MAUVAIS : Tout mélangé
src/
├── components/
│   ├── QuoteCard.tsx
│   ├── ShowPlanCard.tsx
│   ├── Button.tsx
│   └── ...
```

**Principe:** Regrouper les fichiers par fonctionnalité métier, pas par type technique.

### 3. Patterns de State Management

#### Pattern 1: Local State (useState)
**Quand utiliser:**
- État utilisé uniquement dans un composant
- Données UI temporaires (expanded, selected)
- Pas besoin de partager avec d'autres composants

```typescript
// ✅ BON : État local simple
const QuoteCard = ({ quote }: QuoteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div>
      {/* UI */}
    </div>
  );
};
```

#### Pattern 2: Zustand Store (Global State)
**Quand utiliser:**
- État partagé entre plusieurs composants
- Données persistantes dans l'application
- État complexe avec actions multiples

```typescript
// ✅ BON : Store Zustand pour état global
interface QuoteState {
  quotes: Quote[];
  filters: QuoteFilters;
  selectedQuote: Quote | null;
  
  // Actions
  setQuotes: (quotes: Quote[]) => void;
  updateFilters: (filters: Partial<QuoteFilters>) => void;
  selectQuote: (quote: Quote | null) => void;
}

export const useQuoteStore = create<QuoteState>()((set) => ({
  quotes: [],
  filters: { category: 'all', status: 'all' },
  selectedQuote: null,
  
  setQuotes: (quotes) => set({ quotes }),
  updateFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  selectQuote: (quote) => set({ selectedQuote: quote }),
}));
```

#### Pattern 3: React Query (Server State)
**Quand utiliser:**
- Données serveur (API, Firebase)
- Besoin de cache, refresh automatique
- Loading et error states automatiques

```typescript
// ✅ BON : React Query pour données serveur
export const useQuotes = () => {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: () => getQuotes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
};
```

**Décision tree pour le state:**
```
Est-ce des données serveur ? 
  ├─ Oui → React Query
  └─ Non → Est-ce partagé entre composants ?
      ├─ Oui → Zustand Store
      └─ Non → useState
```

### 4. Separation of Concerns (SoC)

#### Composant UI pur
```typescript
// ✅ BON : Composant UI pur, sans logique métier
interface QuoteCardProps {
  quote: Quote;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ 
  quote, 
  onEdit, 
  onDelete,
  isLoading 
}) => {
  return (
    <div className="quote-card">
      <h3>{quote.content}</h3>
      <div className="actions">
        <button onClick={() => onEdit(quote.id)} disabled={isLoading}>
          Éditer
        </button>
        <button onClick={() => onDelete(quote.id)} disabled={isLoading}>
          Supprimer
        </button>
      </div>
    </div>
  );
};
```

#### Container Component (avec logique)
```typescript
// ✅ BON : Container qui gère la logique
export const QuoteCardContainer = ({ quoteId }: { quoteId: string }) => {
  const { data: quote, isLoading } = useQuote(quoteId);
  const { mutate: deleteQuote } = useDeleteQuote();
  const navigate = useNavigate();
  
  const handleEdit = (id: string) => {
    navigate(`/quotes/${id}/edit`);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette citation ?')) {
      deleteQuote(id);
    }
  };
  
  if (!quote) return null;
  
  return (
    <QuoteCard
      quote={quote}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
};
```

### 5. Composition over Inheritance

```typescript
// ✅ BON : Composition de composants
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="card-header">{children}</div>
);

export const CardBody = ({ children }: { children: React.ReactNode }) => (
  <div className="card-body">{children}</div>
);

// Utilisation
<Card>
  <CardHeader>
    <h2>Titre</h2>
  </CardHeader>
  <CardBody>
    <p>Contenu</p>
  </CardBody>
</Card>

// ❌ MAUVAIS : Héritage complexe
class BaseCard extends Component { /* ... */ }
class QuoteCard extends BaseCard { /* ... */ }
class ShowPlanCard extends BaseCard { /* ... */ }
```

### 6. Dependency Injection Pattern

```typescript
// ✅ BON : Injection de dépendances
interface QuoteServiceProps {
  apiClient: ApiClient;
  storage: StorageService;
}

export class QuoteService {
  constructor(
    private apiClient: ApiClient,
    private storage: StorageService
  ) {}
  
  async createQuote(data: QuoteFormData): Promise<Quote> {
    // Upload audio si présent
    if (data.audioFile) {
      const audioUrl = await this.storage.upload(data.audioFile);
      data.audioUrl = audioUrl;
    }
    
    // Créer la citation
    return this.apiClient.post('/quotes', data);
  }
}

// ❌ MAUVAIS : Dépendances hardcodées
export class QuoteService {
  async createQuote(data: QuoteFormData) {
    // Dépendance directe difficile à tester
    const storage = new FirebaseStorage();
    const api = new ApiClient();
    // ...
  }
}
```

### 7. Error Boundaries et Error Handling

```typescript
// ✅ BON : Error Boundary pour capturer les erreurs React
export class QuoteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Quote module error:', error, errorInfo);
    // Log to monitoring service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Une erreur est survenue</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Réessayer
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Utilisation
<QuoteErrorBoundary>
  <QuotesList />
</QuoteErrorBoundary>
```

### 8. Performance Patterns

#### Memoization
```typescript
// ✅ BON : Utiliser React.memo pour composants coûteux
export const QuoteCard = React.memo<QuoteCardProps>(({ quote, onEdit }) => {
  return <div>{/* UI */}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.quote.id === nextProps.quote.id &&
         prevProps.quote.updatedAt === nextProps.quote.updatedAt;
});

// ✅ BON : useMemo pour calculs coûteux
const filteredQuotes = useMemo(() => {
  return quotes.filter(q => 
    q.category === selectedCategory &&
    q.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [quotes, selectedCategory, searchTerm]);

// ✅ BON : useCallback pour fonctions passées en props
const handleQuoteEdit = useCallback((id: string) => {
  navigate(`/quotes/${id}/edit`);
}, [navigate]);
```

#### Code Splitting
```typescript
// ✅ BON : Lazy loading de routes
const QuotesList = lazy(() => import('@/pages/Quotes/QuotesList'));
const CreateQuote = lazy(() => import('@/pages/Quotes/CreateQuote'));

// Dans le Router
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/quotes" element={<QuotesList />} />
    <Route path="/quotes/create" element={<CreateQuote />} />
  </Routes>
</Suspense>
```

### 9. API Layer Abstraction

```typescript
// ✅ BON : Abstraction Firebase avec interface claire
// src/api/firebase/quotes.ts

import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Quote, QuoteFormData } from '@/types/quote';

const quotesCollection = collection(db, 'quotes');

export const getQuotes = async (): Promise<Quote[]> => {
  const snapshot = await getDocs(quotesCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Quote));
};

export const createQuote = async (data: QuoteFormData): Promise<Quote> => {
  const docRef = await addDoc(quotesCollection, {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return {
    id: docRef.id,
    ...data,
  } as Quote;
};

export const getQuotesByShowPlan = async (showPlanId: string): Promise<Quote[]> => {
  const q = query(quotesCollection, where('showPlanId', '==', showPlanId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));
};
```

**Avantages:**
- Facilite le changement de backend (Firebase → autre)
- Testable facilement (mock des fonctions)
- API claire et documentée
- Typage strict

### 10. Permissions et Authorization Pattern

```typescript
// ✅ BON : HOC pour vérification de permissions
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: Permission
) => {
  return (props: P) => {
    const { user, hasPermission } = useAuth();
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (!hasPermission(requiredPermission)) {
      return <AccessDenied />;
    }
    
    return <Component {...props} />;
  };
};

// Utilisation
export const CreateQuotePage = withPermission(
  CreateQuoteComponent,
  'quotes_create'
);

// ✅ BON : Hook pour permissions
export const usePermission = (permission: Permission) => {
  const { user, permissions } = useAuthStore();
  
  return useMemo(() => {
    if (!user) return false;
    if (user.role === 'super-admin') return true;
    return permissions.includes(permission);
  }, [user, permissions, permission]);
};

// Utilisation dans composant
const CreateQuoteButton = () => {
  const canCreate = usePermission('quotes_create');
  
  if (!canCreate) return null;
  
  return <button>Créer une citation</button>;
};
```

---

## Ce que l'agent NE DOIT PAS faire

### ❌ Anti-patterns architecturaux critiques

1. **Ne JAMAIS créer de dépendances circulaires**
   ```typescript
   // ❌ INTERDIT
   // fileA.ts
   import { functionB } from './fileB';
   
   // fileB.ts
   import { functionA } from './fileA';
   ```

2. **Ne PAS mélanger les responsabilités**
   ```typescript
   // ❌ INTERDIT : Composant qui fait tout
   const QuoteCard = () => {
     const [quotes, setQuotes] = useState([]);
     
     // Logique Firebase directement
     useEffect(() => {
       getDocs(collection(db, 'quotes')).then(/* ... */);
     }, []);
     
     // Logique métier complexe
     const processQuote = () => { /* ... */ };
     
     return <div>{/* UI */}</div>;
   };
   ```

3. **Ne PAS ignorer la structure de dossiers**
   ```typescript
   // ❌ INTERDIT : Créer des fichiers n'importe où
   src/myComponent.tsx
   src/utils/QuoteCard.tsx
   src/api/useQuotes.ts  // Hook dans api/
   ```

4. **Ne PAS créer de stores pour tout**
   ```typescript
   // ❌ INTERDIT : Store pour état local simple
   const useModalStore = create((set) => ({
     isOpen: false,
     setIsOpen: (isOpen) => set({ isOpen }),
   }));
   
   // ✅ FAIRE : useState pour état local
   const [isOpen, setIsOpen] = useState(false);
   ```

5. **Ne PAS ignorer la performance**
   ```typescript
   // ❌ INTERDIT : Re-render inutiles
   const ExpensiveList = ({ items }) => {
     // Recalculé à chaque render
     const processedItems = items.map(/* expensive operation */);
     
     return <div>{/* ... */}</div>;
   };
   
   // ✅ FAIRE : Memoization
   const ExpensiveList = ({ items }) => {
     const processedItems = useMemo(() => 
       items.map(/* expensive operation */),
       [items]
     );
     
     return <div>{/* ... */}</div>;
   };
   ```

6. **Ne PAS dupliquer la logique**
   - Créer des hooks personnalisés pour logique réutilisée
   - Créer des utilitaires pour fonctions communes
   - Utiliser la composition de composants

---

## Diagramme de décision architecturale

```
Nouvelle fonctionnalité ?
├─ Simple UI component ?
│  └─ Créer dans components/[module]/[Component].tsx
├─ Logique métier réutilisable ?
│  └─ Créer hook dans hooks/[module]/use[Feature].ts
├─ État global nécessaire ?
│  └─ Créer store dans store/use[Feature]Store.ts
├─ Accès données serveur ?
│  └─ Créer API dans api/firebase/[feature].ts
└─ Nouvelle page/route ?
   └─ Créer dans pages/[Feature]/[Page].tsx
```

---

## Checklist architecturale

Avant d'implémenter une fonctionnalité majeure:

- [ ] La fonctionnalité respecte la séparation en couches
- [ ] Les fichiers sont dans les bons dossiers (par module)
- [ ] La logique est séparée de la présentation
- [ ] Le state management approprié est utilisé
- [ ] Les dépendances pointent dans la bonne direction
- [ ] Aucune dépendance circulaire n'est créée
- [ ] Les permissions sont vérifiées si nécessaire
- [ ] Les erreurs sont gérées correctement
- [ ] La performance est considérée (memo, lazy loading)
- [ ] Le code est testable (dependency injection)
- [ ] La documentation est à jour (AGENT.md, modules/)

---

## Exemples de requêtes utilisateur

```
✅ "Crée un nouveau module pour gérer les archives"
✅ "Comment structurer le module de gestion des invités ?"
✅ "Refactorise ce composant qui est devenu trop complexe"
✅ "Où dois-je mettre cette nouvelle fonctionnalité ?"
✅ "Comment gérer l'état global de ce module ?"
✅ "Optimise ce composant qui est lent"
```

---

## Documentation complémentaire

Consulter également:
- `docs/ARCHITECTURE_ANALYSIS.md` : Analyse approfondie de l'architecture
- `AGENT.md` : Règles générales pour les agents
- `docs/modules/` : Documentation par module

---

## Métadonnées

- **Version:** 1.0.0
- **Dernière mise à jour:** 2026-01-30
- **Priorité:** Critique
- **Dépendances:** project-overview, coding-standards
- **Utilisé par:** Toutes les décisions architecturales
