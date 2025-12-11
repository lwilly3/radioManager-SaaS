# 📚 Module Archives

> Recherche et consultation des émissions archivées avec filtres avancés et export PDF.

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Page** | `Archives.tsx` |
| **Permission** | `can_archive_showplan`, `can_archiveStatusChange_showplan` |
| **Fonctionnalités** | Recherche, filtres, pagination, export PDF |

## 🎯 Fonctionnalités

### 1. Recherche avancée

| Filtre | Type | Description |
|--------|------|-------------|
| **Mots-clés** | Texte | Recherche dans titre et description |
| **Date début** | Date | Émissions après cette date |
| **Date fin** | Date | Émissions avant cette date |
| **Statut** | Select | Filtrer par statut d'archive |
| **Animateur** | Select | Filtrer par présentateur |
| **Invité** | Select | Filtrer par invité |

### 2. Affichage des résultats

- Tableau paginé avec métadonnées
- Aperçu rapide au survol
- Actions : voir détail, télécharger PDF

### 3. Export PDF

- Génération de PDF pour impression
- Contient toutes les informations du conducteur
- Segments et invités inclus

## 📁 Structure des fichiers

```
src/
├── pages/
│   └── Archives.tsx               # Page principale
├── components/
│   └── archives/
│       ├── ArchiveFilters.tsx     # Formulaire de filtres
│       ├── ArchiveList.tsx        # Liste des résultats
│       ├── ArchiveCard.tsx        # Card d'archive
│       └── ArchivePdfExport.tsx   # Export PDF
└── utils/
    └── dateFilters.ts             # Utilitaires de filtrage date
```

## 🔒 Contraintes et règles métier

### Permissions requises

| Action | Permission |
|--------|------------|
| Accéder aux archives | `can_acces_showplan_section` |
| Voir les archives | `can_archive_showplan` |
| Changer statut archive | `can_archiveStatusChange_showplan` |

### Règles de filtrage

| Règle | Description |
|-------|-------------|
| Statut `archived` | Seuls les conducteurs archivés sont affichés |
| Date début ≤ Date fin | Validation côté client |
| Pagination | 20 éléments par page par défaut |
| Cache | Résultats mis en cache 5 minutes |

## 📊 Types TypeScript

### ArchiveFilters

```typescript
interface ArchiveFilters {
  keywords?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  presenterId?: number;
  guestId?: number;
}
```

### ArchiveSearchResult

```typescript
interface ArchiveSearchResult {
  id: number;
  title: string;
  emission: string;
  broadcast_date: string;
  duration: number;
  status: string;
  presenters: Presenter[];
  segments_count: number;
  archived_at: string;
}
```

## 🎨 Interface utilisateur

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Archives                                        [Export PDF]   │
├─────────────────────────────────────────────────────────────────┤
│  Filtres                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Mots-clés    │ │ Date début   │ │ Date fin     │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Statut       │ │ Animateur    │ │ Invité       │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                          [Rechercher] [Reset]   │
├─────────────────────────────────────────────────────────────────┤
│  Résultats (42 archives)                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Date     │ Titre              │ Émission    │ Durée│Actions ││
│  ├──────────┼───────────────────┼─────────────┼──────┼────────┤│
│  │ 01/01/25 │ Matinale Nouvel An│ Matinale    │ 180m │ 👁️ 📄  ││
│  │ 31/12/24 │ Réveillon spécial │ Soirée      │ 240m │ 👁️ 📄  ││
│  └─────────────────────────────────────────────────────────────┘│
│  [< Précédent] Page 1 sur 3 [Suivant >]                        │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Exemple d'implémentation

### Page Archives

```tsx
const Archives = () => {
  const { permissions } = useAuthStore();
  const [filters, setFilters] = useState<ArchiveFilters>({});
  const [results, setResults] = useState<ArchiveSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await archiveApi.search(token, filters, page);
      setResults(response.data);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Erreur recherche archives', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = async (archiveId: number) => {
    const pdfBlob = await archiveApi.exportPdf(token, archiveId);
    // Télécharger le fichier
    downloadBlob(pdfBlob, `archive-${archiveId}.pdf`);
  };

  return (
    <Layout>
      <h1>Archives</h1>
      
      <ArchiveFilters 
        filters={filters}
        onChange={setFilters}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <ArchiveList 
            results={results}
            onExportPdf={handleExportPdf}
          />
          <Pagination 
            current={page}
            total={totalPages}
            onChange={setPage}
          />
        </>
      )}
    </Layout>
  );
};
```

## 🔌 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/archives/search` | Recherche avec filtres |
| `GET` | `/archives/{id}` | Détail d'une archive |
| `GET` | `/archives/{id}/pdf` | Export PDF |

## 🧪 Points de test

- [ ] Filtres appliqués correctement
- [ ] Pagination fonctionne
- [ ] Export PDF génère fichier valide
- [ ] Validation dates (début ≤ fin)
- [ ] Résultats vides affiche message
- [ ] Permission requise respectée
