# ⚡ Agent Skill: Performance

## Rôle
Guider l'agent dans l'optimisation des performances de l'application RadioManager SaaS pour garantir une expérience utilisateur fluide et réactive.

## Quand utiliser ce skill

### Déclencheurs automatiques
- L'agent crée des listes volumineuses ou tableaux
- L'agent implémente des calculs complexes ou transformations de données
- L'agent travaille sur le chargement initial de l'application
- L'utilisateur rapporte des problèmes de lenteur
- L'agent crée des composants avec beaucoup de re-renders
- Lors d'intégration d'images ou médias volumineux

### Contexte d'utilisation
- Optimisation de composants React
- Amélioration du temps de chargement
- Réduction de la taille du bundle
- Optimisation des requêtes API/Firestore
- Amélioration de la réactivité de l'UI
- Gestion de grandes quantités de données

---

## Ce que l'agent DOIT faire

### 1. Optimisation React - Memoization

#### React.memo pour composants purs

```typescript
// ✅ BON : Memo pour composants avec props complexes
import React, { memo } from 'react';
import type { Quote } from '@/types/quote';

interface QuoteCardProps {
  quote: Quote;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const QuoteCard = memo<QuoteCardProps>(({ quote, onEdit, onDelete }) => {
  return (
    <div className="quote-card">
      <p>{quote.content}</p>
      <div className="actions">
        <button onClick={() => onEdit(quote.id)}>Éditer</button>
        <button onClick={() => onDelete(quote.id)}>Supprimer</button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison : ne re-render que si quote change
  return (
    prevProps.quote.id === nextProps.quote.id &&
    prevProps.quote.updatedAt === nextProps.quote.updatedAt
  );
});

QuoteCard.displayName = 'QuoteCard';
```

#### useMemo pour calculs coûteux

```typescript
// ✅ BON : Memoization de calculs complexes
export const QuotesList = ({ quotes, filters }: QuotesListProps) => {
  // Filtrage et tri memoizés
  const filteredAndSortedQuotes = useMemo(() => {
    return quotes
      .filter(quote => {
        if (filters.category && quote.category !== filters.category) {
          return false;
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            quote.content.toLowerCase().includes(searchLower) ||
            quote.author.name.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date') {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return a.content.localeCompare(b.content);
      });
  }, [quotes, filters.category, filters.search, filters.sortBy]);

  // Statistiques memoizées
  const stats = useMemo(() => ({
    total: filteredAndSortedQuotes.length,
    byCategory: filteredAndSortedQuotes.reduce((acc, quote) => {
      acc[quote.category] = (acc[quote.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [filteredAndSortedQuotes]);

  return (
    <div>
      <QuoteStats stats={stats} />
      <div className="quotes-grid">
        {filteredAndSortedQuotes.map(quote => (
          <QuoteCard key={quote.id} quote={quote} />
        ))}
      </div>
    </div>
  );
};
```

#### useCallback pour fonctions stables

```typescript
// ✅ BON : Callback stable pour éviter re-renders
export const QuotesManager = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const navigate = useNavigate();

  // Fonction stable
  const handleEdit = useCallback((id: string) => {
    navigate(`/quotes/${id}/edit`);
  }, [navigate]);

  // Fonction stable avec dépendances
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Supprimer cette citation ?')) return;
    
    try {
      await deleteQuote(id);
      setQuotes(prev => prev.filter(q => q.id !== id));
      toast.success('Citation supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  }, []); // Pas de dépendances car utilise setQuotes avec fonction

  return (
    <div>
      {quotes.map(quote => (
        <QuoteCard
          key={quote.id}
          quote={quote}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
```

### 2. Virtualisation pour listes longues

```typescript
// ✅ BON : Utiliser react-window pour grandes listes
import { FixedSizeList as List } from 'react-window';

interface VirtualizedQuotesListProps {
  quotes: Quote[];
}

export const VirtualizedQuotesList = ({ quotes }: VirtualizedQuotesListProps) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const quote = quotes[index];
    
    return (
      <div style={style}>
        <QuoteCard quote={quote} />
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={quotes.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};

// Installation : npm install react-window @types/react-window
```

### 3. Lazy Loading et Code Splitting

```typescript
// ✅ BON : Lazy loading des routes
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Chargement différé des pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const QuotesList = lazy(() => import('@/pages/Quotes/QuotesList'));
const CreateQuote = lazy(() => import('@/pages/Quotes/CreateQuote'));
const ShowPlanDetail = lazy(() => import('@/pages/ShowPlanDetail'));

export const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/quotes" element={<QuotesList />} />
      <Route path="/quotes/create" element={<CreateQuote />} />
      <Route path="/show-plans/:id" element={<ShowPlanDetail />} />
    </Routes>
  </Suspense>
);

// ✅ BON : Lazy loading conditionnel de composants lourds
const HeavyChart = lazy(() => import('@/components/charts/HeavyChart'));

export const Dashboard = () => {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        Afficher le graphique
      </button>
      
      {showChart && (
        <Suspense fallback={<div>Chargement...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
};
```

### 4. Optimisation des images

```typescript
// ✅ BON : Images optimisées avec lazy loading
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
}: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`image-container ${className}`}>
      {!isLoaded && !error && (
        <div className="skeleton-loader" style={{ width, height }} />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={isLoaded ? 'loaded' : 'loading'}
      />
      
      {error && <div className="image-error">Erreur de chargement</div>}
    </div>
  );
};

// ✅ BON : Utiliser des formats modernes (WebP)
export const ResponsiveImage = ({ src, alt }: { src: string; alt: string }) => (
  <picture>
    <source srcSet={`${src}.webp`} type="image/webp" />
    <source srcSet={`${src}.jpg`} type="image/jpeg" />
    <img src={`${src}.jpg`} alt={alt} loading="lazy" />
  </picture>
);
```

### 5. Optimisation des requêtes Firestore

```typescript
// ✅ BON : Pagination et limitation
export const useQuotesWithPagination = (pageSize = 20) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const quotesRef = collection(db, 'quotes');
      
      let q = query(
        quotesRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
        return;
      }

      const newQuotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Quote));

      setQuotes(prev => [...prev, ...newQuotes]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
    } finally {
      setLoading(false);
    }
  }, [lastDoc, loading, hasMore, pageSize]);

  return { quotes, loadMore, loading, hasMore };
};

// ✅ BON : Indexes composés pour requêtes complexes
// Firestore nécessite des index pour les requêtes multi-champs
export const getFilteredQuotes = async (filters: QuoteFilters) => {
  const quotesRef = collection(db, 'quotes');
  
  // Créer l'index composite dans Firebase Console :
  // category (Ascending), createdAt (Descending)
  const q = query(
    quotesRef,
    where('category', '==', filters.category),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));
};

// ✅ BON : Cache et batching
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useQuotes = () => {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: getQuotes,
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 6. Debouncing et Throttling

```typescript
// ✅ BON : Debounce pour search
import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash-es';

export const SearchQuotes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Quote[]>([]);

  // Debounce la recherche (attendre 300ms après la dernière saisie)
  const debouncedSearch = useMemo(
    () =>
      debounce(async (term: string) => {
        if (term.length < 3) {
          setResults([]);
          return;
        }

        const quotes = await searchQuotes(term);
        setResults(quotes);
      }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Rechercher..."
      />
      <ul>
        {results.map(quote => (
          <li key={quote.id}>{quote.content}</li>
        ))}
      </ul>
    </div>
  );
};

// ✅ BON : Throttle pour scroll
import { throttle } from 'lodash-es';

export const InfiniteScrollQuotes = () => {
  const { quotes, loadMore, hasMore } = useQuotesWithPagination();

  useEffect(() => {
    const handleScroll = throttle(() => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore) {
        loadMore();
      }
    }, 200); // Max 1 fois par 200ms

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, [loadMore, hasMore]);

  return <QuotesList quotes={quotes} />;
};
```

### 7. Bundle optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendors
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['lucide-react', '@headlessui/react'],
          'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
    // Augmenter le warning size si nécessaire
    chunkSizeWarningLimit: 1000,
  },
});
```

### 8. Web Vitals - Core Web Vitals

```typescript
// ✅ BON : Mesurer les performances
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export const initPerformanceMonitoring = () => {
  onCLS(console.log); // Cumulative Layout Shift
  onFID(console.log); // First Input Delay
  onLCP(console.log); // Largest Contentful Paint
  onFCP(console.log); // First Contentful Paint
  onTTFB(console.log); // Time to First Byte

  // Envoyer à un service d'analytics
  const sendToAnalytics = (metric: Metric) => {
    const body = JSON.stringify(metric);
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', body);
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        body,
        keepalive: true,
      });
    }
  };

  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
};

// Appeler dans main.tsx
initPerformanceMonitoring();
```

### 9. Service Worker et Cache

```typescript
// ✅ BON : Configuration PWA avec Vite
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.cloud\.audace\.ovh\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

## Ce que l'agent NE DOIT PAS faire

### ❌ Anti-patterns de performance

1. **Ne PAS optimiser prématurément**
   ```typescript
   // ❌ MAUVAIS : Memoizer tout sans raison
   const MyComponent = memo(() => {
     const value1 = useMemo(() => 1 + 1, []);
     const value2 = useMemo(() => 'hello', []);
     // ...
   });
   
   // ✅ BON : Memoizer seulement si nécessaire (calculs coûteux)
   const MyComponent = () => {
     const value1 = 2;
     const value2 = 'hello';
     // ...
   };
   ```

2. **Ne PAS créer de nouveaux objets/fonctions dans render**
   ```typescript
   // ❌ MAUVAIS : Nouvel objet à chaque render
   <QuoteCard
     quote={quote}
     style={{ color: 'blue', padding: 10 }}
     onClick={() => handleClick(quote.id)}
   />
   
   // ✅ BON : Objets/fonctions stables
   const cardStyle = { color: 'blue', padding: 10 };
   const handleClick = useCallback((id: string) => {
     // ...
   }, []);
   
   <QuoteCard
     quote={quote}
     style={cardStyle}
     onClick={handleClick}
   />
   ```

3. **Ne PAS faire de requêtes dans les boucles**
   ```typescript
   // ❌ MAUVAIS : N+1 queries
   const quotes = await getQuotes();
   for (const quote of quotes) {
     const author = await getAuthor(quote.authorId); // N queries
   }
   
   // ✅ BON : Batch queries ou includes
   const quotes = await getQuotesWithAuthors(); // 1 query avec join
   ```

4. **Ne PAS ignorer les warnings de dépendances**
   ```typescript
   // ❌ MAUVAIS : Désactiver les warnings
   useEffect(() => {
     fetchData(userId);
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);
   
   // ✅ BON : Corriger les dépendances
   useEffect(() => {
     fetchData(userId);
   }, [userId]);
   ```

---

## Checklist de performance

- [ ] Composants lourds sont memoizés avec React.memo
- [ ] Calculs coûteux utilisent useMemo
- [ ] Callbacks utilisent useCallback
- [ ] Listes longues (>100 items) sont virtualisées
- [ ] Images utilisent lazy loading
- [ ] Routes utilisent lazy loading
- [ ] Requêtes API sont paginées
- [ ] Search utilise debouncing
- [ ] Scroll events utilisent throttling
- [ ] Bundle size < 500KB (gzipped)
- [ ] LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Pas de re-renders inutiles (React DevTools Profiler)

---

## Outils de mesure

```bash
# Analyser le bundle
npm run build
npx vite-bundle-visualizer

# Lighthouse audit
npx lighthouse https://localhost:5173 --view

# Bundle size
npx bundlesize

# React DevTools Profiler
# Dans le navigateur avec React DevTools
```

---

## Exemples de requêtes utilisateur

```
✅ "Optimise la performance de la liste de citations"
✅ "Le composant QuotesList est lent, améliore-le"
✅ "Réduis la taille du bundle"
✅ "Implémente le lazy loading des images"
✅ "Ajoute la pagination aux citations"
```

---

## Ressources

- **React Performance** : https://react.dev/learn/render-and-commit
- **Web Vitals** : https://web.dev/vitals/
- **Vite Optimization** : https://vitejs.dev/guide/performance.html
- **React Window** : https://github.com/bvaughn/react-window

---

## Métadonnées

- **Version:** 1.0.0
- **Dernière mise à jour:** 2026-02-01
- **Priorité:** Haute
- **Dépendances:** coding-standards, architecture
- **Utilisé par:** Toutes les fonctionnalités nécessitant des optimisations
