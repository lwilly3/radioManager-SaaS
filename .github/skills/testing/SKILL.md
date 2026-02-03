# ✅ Agent Skill: Testing

## Rôle
Guider l'agent dans la mise en place et l'écriture de tests de qualité pour garantir la fiabilité et la stabilité du code RadioManager SaaS.

## Quand utiliser ce skill

### Déclencheurs automatiques
- L'agent crée un nouveau composant ou hook
- L'agent ajoute une nouvelle fonctionnalité
- L'agent corrige un bug critique
- L'utilisateur demande d'ajouter des tests
- L'utilisateur demande "teste ce composant/cette fonction"
- Avant de valider une Pull Request importante

### Contexte d'utilisation
- Après création de composants critiques
- Pour valider la logique métier complexe
- Lors de refactoring majeur
- Pour prévenir les régressions
- Dans le cadre de CI/CD

---

## Ce que l'agent DOIT faire

### 1. Stratégie de test (Testing Pyramid)

```
        /\
       /  \      E2E Tests
      /────\     (Peu, lents, coûteux)
     /      \
    /────────\   Integration Tests
   /          \  (Moyennement nombreux)
  /────────────\
 /              \ Unit Tests
/________________\ (Nombreux, rapides, isolés)
```

**Répartition recommandée :**
- **70%** Tests unitaires (composants, hooks, utils)
- **20%** Tests d'intégration (flux utilisateur)
- **10%** Tests E2E (scénarios critiques)

### 2. Configuration de test pour React + Vite

#### Installation des dépendances

```json
// package.json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitest/ui": "^1.0.0",
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0",
    "@testing-library/react-hooks": "^8.0.1"
  }
}
```

#### Configuration Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Setup de test

```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

// Mock Firebase
vi.mock('@/config/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});
```

### 3. Tests unitaires de composants

#### Pattern de test pour composants UI

```typescript
// src/components/quotes/QuoteCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteCard } from './QuoteCard';
import type { Quote } from '@/types/quote';

describe('QuoteCard', () => {
  const mockQuote: Quote = {
    id: '1',
    content: 'Test quote content',
    author: {
      name: 'John Doe',
      role: 'Expert',
    },
    category: 'politique',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('devrait afficher le contenu de la citation', () => {
    render(<QuoteCard quote={mockQuote} />);
    
    expect(screen.getByText('Test quote content')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('devrait appeler onEdit quand on clique sur éditer', () => {
    const handleEdit = vi.fn();
    render(<QuoteCard quote={mockQuote} onEdit={handleEdit} />);
    
    const editButton = screen.getByRole('button', { name: /éditer/i });
    fireEvent.click(editButton);
    
    expect(handleEdit).toHaveBeenCalledWith('1');
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('devrait afficher un placeholder si pas de contenu', () => {
    const emptyQuote = { ...mockQuote, content: '' };
    render(<QuoteCard quote={emptyQuote} />);
    
    expect(screen.getByText(/aucun contenu/i)).toBeInTheDocument();
  });

  it('devrait être accessible (a11y)', () => {
    const { container } = render(<QuoteCard quote={mockQuote} />);
    
    // Vérifier les attributs ARIA
    const card = container.firstChild;
    expect(card).toHaveAttribute('role', 'article');
  });
});
```

### 4. Tests unitaires de hooks

```typescript
// src/hooks/quotes/useQuotes.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useQuotes } from './useQuotes';
import * as quotesApi from '@/api/firebase/quotes';

vi.mock('@/api/firebase/quotes');

describe('useQuotes', () => {
  const mockQuotes = [
    { id: '1', content: 'Quote 1', category: 'politique' },
    { id: '2', content: 'Quote 2', category: 'sport' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait charger les citations au montage', async () => {
    vi.spyOn(quotesApi, 'getQuotes').mockResolvedValue(mockQuotes);

    const { result } = renderHook(() => useQuotes());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.quotes).toEqual(mockQuotes);
    expect(quotesApi.getQuotes).toHaveBeenCalledTimes(1);
  });

  it('devrait gérer les erreurs de chargement', async () => {
    const error = new Error('Network error');
    vi.spyOn(quotesApi, 'getQuotes').mockRejectedValue(error);

    const { result } = renderHook(() => useQuotes());

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    expect(result.current.quotes).toEqual([]);
  });

  it('devrait permettre de refetch les données', async () => {
    vi.spyOn(quotesApi, 'getQuotes').mockResolvedValue(mockQuotes);

    const { result } = renderHook(() => useQuotes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.refetch();

    expect(quotesApi.getQuotes).toHaveBeenCalledTimes(2);
  });
});
```

### 5. Tests de fonctions utilitaires

```typescript
// src/utils/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatRelativeTime } from './formatDate';

describe('formatDate', () => {
  it('devrait formater une date en format français', () => {
    const date = new Date('2026-01-15');
    expect(formatDate(date)).toBe('15/01/2026');
  });

  it('devrait gérer les dates invalides', () => {
    expect(formatDate(null)).toBe('Date invalide');
    expect(formatDate(undefined)).toBe('Date invalide');
  });
});

describe('formatRelativeTime', () => {
  it('devrait afficher "à l\'instant" pour moins d\'une minute', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('à l\'instant');
  });

  it('devrait afficher "il y a X minutes"', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('il y a 5 minutes');
  });
});
```

### 6. Tests d'intégration

```typescript
// src/pages/Quotes/CreateQuote.integration.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CreateQuote } from './CreateQuote';
import * as quotesApi from '@/api/firebase/quotes';

vi.mock('@/api/firebase/quotes');

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('CreateQuote - Integration', () => {
  it('devrait créer une citation complète avec workflow complet', async () => {
    const createQuoteSpy = vi.spyOn(quotesApi, 'createQuote')
      .mockResolvedValue({ id: 'new-quote-id', ...mockQuoteData });

    renderWithRouter(<CreateQuote />);

    // Remplir le formulaire
    const contentInput = screen.getByLabelText(/contenu/i);
    await userEvent.type(contentInput, 'Nouvelle citation test');

    const authorInput = screen.getByLabelText(/auteur/i);
    await userEvent.type(authorInput, 'John Doe');

    const categorySelect = screen.getByLabelText(/catégorie/i);
    await userEvent.selectOptions(categorySelect, 'politique');

    // Soumettre
    const submitButton = screen.getByRole('button', { name: /créer/i });
    fireEvent.click(submitButton);

    // Vérifications
    await waitFor(() => {
      expect(createQuoteSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Nouvelle citation test',
          author: expect.objectContaining({ name: 'John Doe' }),
          category: 'politique',
        })
      );
    });

    expect(screen.getByText(/citation créée/i)).toBeInTheDocument();
  });

  it('devrait afficher les erreurs de validation', async () => {
    renderWithRouter(<CreateQuote />);

    const submitButton = screen.getByRole('button', { name: /créer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/le contenu est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/l'auteur est requis/i)).toBeInTheDocument();
    });
  });
});
```

### 7. Tests E2E avec Playwright (optionnel)

```typescript
// e2e/quotes.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Module Citations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('devrait créer une nouvelle citation', async ({ page }) => {
    await page.goto('/quotes/create');

    await page.fill('[name="content"]', 'Citation E2E test');
    await page.fill('[name="author.name"]', 'Test Author');
    await page.selectOption('[name="category"]', 'sport');

    await page.click('button:has-text("Créer")');

    await expect(page.locator('text=Citation créée avec succès')).toBeVisible();
    await expect(page).toHaveURL('/quotes');
  });
});
```

### 8. Mocks et fixtures

```typescript
// src/tests/mocks/quotes.mock.ts
import type { Quote } from '@/types/quote';

export const mockQuote: Quote = {
  id: 'mock-quote-1',
  content: 'Ceci est une citation de test',
  author: {
    name: 'John Doe',
    role: 'Expert',
    avatar: 'https://example.com/avatar.jpg',
  },
  category: 'politique',
  tags: ['test', 'mock'],
  status: 'published',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  metadata: {
    views: 100,
    likes: 25,
  },
};

export const mockQuotes: Quote[] = [
  mockQuote,
  {
    ...mockQuote,
    id: 'mock-quote-2',
    content: 'Deuxième citation',
    category: 'sport',
  },
  {
    ...mockQuote,
    id: 'mock-quote-3',
    content: 'Troisième citation',
    category: 'culture',
  },
];

export const mockQuoteFormData = {
  content: 'Nouvelle citation',
  author: {
    name: 'Jane Smith',
    role: 'Journaliste',
  },
  category: 'politique',
  tags: ['actualité'],
};
```

### 9. Scripts de test dans package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Ce que l'agent NE DOIT PAS faire

### ❌ Anti-patterns de test

1. **Ne PAS tester les détails d'implémentation**
   ```typescript
   // ❌ MAUVAIS : Tester l'état interne
   expect(component.state.count).toBe(5);
   
   // ✅ BON : Tester le comportement visible
   expect(screen.getByText('Compteur: 5')).toBeInTheDocument();
   ```

2. **Ne PAS faire de tests trop couplés**
   ```typescript
   // ❌ MAUVAIS : Mock de tout
   vi.mock('./QuoteCard');
   vi.mock('./QuoteList');
   vi.mock('./QuoteForm');
   
   // ✅ BON : Mock uniquement les dépendances externes
   vi.mock('@/api/firebase/quotes');
   ```

3. **Ne PAS ignorer les tests qui échouent**
   ```typescript
   // ❌ INTERDIT
   it.skip('ce test échoue', () => { /* ... */ });
   
   // ✅ FAIRE : Corriger ou documenter pourquoi skip
   it.skip('ce test nécessite Firebase local - TODO: configurer emulator', () => {
     // ...
   });
   ```

4. **Ne PAS créer de tests fragiles**
   ```typescript
   // ❌ MAUVAIS : Sélecteur fragile
   const button = container.querySelector('.button-class-xyz-123');
   
   // ✅ BON : Sélecteur sémantique
   const button = screen.getByRole('button', { name: /créer/i });
   ```

5. **Ne PAS oublier le cleanup**
   ```typescript
   // ❌ MAUVAIS : Timers non nettoyés
   it('test avec timer', () => {
     setTimeout(() => {}, 1000);
   });
   
   // ✅ BON : Cleanup des timers
   afterEach(() => {
     vi.clearAllTimers();
   });
   ```

---

## Bonnes pratiques de test

### Arrange-Act-Assert (AAA)

```typescript
it('devrait ajouter une citation aux favoris', () => {
  // Arrange (Préparer)
  const quote = mockQuote;
  const handleFavorite = vi.fn();
  render(<QuoteCard quote={quote} onFavorite={handleFavorite} />);
  
  // Act (Agir)
  const favoriteButton = screen.getByRole('button', { name: /favori/i });
  fireEvent.click(favoriteButton);
  
  // Assert (Vérifier)
  expect(handleFavorite).toHaveBeenCalledWith(quote.id);
});
```

### Couverture de code

**Objectifs minimums :**
- **Branches** : 80%
- **Functions** : 80%
- **Lines** : 80%
- **Statements** : 80%

**Composants critiques** (authentification, paiements) : 95%+

### Tests accessibles

```typescript
// ✅ BON : Utiliser les rôles ARIA
screen.getByRole('button', { name: /créer/i });
screen.getByRole('textbox', { name: /contenu/i });
screen.getByRole('combobox', { name: /catégorie/i });

// ✅ BON : Utiliser getByLabelText pour les forms
screen.getByLabelText(/contenu de la citation/i);
```

---

## Checklist de test

Avant de considérer un composant/feature comme terminé :

- [ ] Tests unitaires du composant principal
- [ ] Tests des cas limites (edge cases)
- [ ] Tests des erreurs
- [ ] Tests des états de chargement
- [ ] Tests d'accessibilité (a11y)
- [ ] Tests des hooks personnalisés
- [ ] Tests d'intégration du flux complet
- [ ] Couverture de code > 80%
- [ ] Tous les tests passent
- [ ] Pas de tests skip sans justification
- [ ] Mocks nettoyés après chaque test

---

## Exemples de requêtes utilisateur

```
✅ "Ajoute des tests pour le composant QuoteCard"
✅ "Teste le hook useQuotes"
✅ "Crée des tests d'intégration pour la création de citation"
✅ "Vérifie la couverture de code du module Citations"
✅ "Ajoute des tests E2E pour le workflow de citation"
```

---

## Ressources

- **Testing Library** : https://testing-library.com/
- **Vitest** : https://vitest.dev/
- **Playwright** : https://playwright.dev/
- **React Testing Best Practices** : https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

## Métadonnées

- **Version:** 1.0.0
- **Dernière mise à jour:** 2026-02-01
- **Priorité:** Haute
- **Dépendances:** coding-standards, architecture
- **Utilisé par:** Toutes les fonctionnalités nécessitant des tests
