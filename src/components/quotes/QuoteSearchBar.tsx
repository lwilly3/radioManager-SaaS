import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
import type { QuoteFilters, QuoteContentType } from '../../types/quote';
import { usePopularTags } from '../../hooks/quotes/useSegmentQuotes';

// ════════════════════════════════════════════════════════════════
// HOOK DEBOUNCE
// ════════════════════════════════════════════════════════════════

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface Emission {
  id: string;
  name: string;
}

interface QuoteSearchBarProps {
  filters: QuoteFilters;
  onFiltersChange: (filters: QuoteFilters) => void;
  emissions?: Emission[];
  recentSearches?: string[];
  onSaveSearch?: (query: string) => void;
  loading?: boolean;
  className?: string;
}

// ════════════════════════════════════════════════════════════════
// COMPOSANT
// ════════════════════════════════════════════════════════════════

/**
 * Barre de recherche avancée pour les citations
 * Avec suggestions de tags populaires et recherches récentes
 */
export const QuoteSearchBar: React.FC<QuoteSearchBarProps> = ({
  filters,
  onFiltersChange,
  emissions = [],
  recentSearches = [],
  onSaveSearch,
  loading = false,
  className = '',
}) => {
  const [query, setQuery] = useState(filters.query || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  const { data: popularTags = [] } = usePopularTags(8);
  
  // Mettre à jour les filtres quand la recherche change
  useEffect(() => {
    onFiltersChange({ ...filters, query: debouncedQuery || undefined });
  }, [debouncedQuery]);
  
  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleFilterChange = (key: keyof QuoteFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };
  
  const clearFilters = () => {
    setQuery('');
    onFiltersChange({});
  };
  
  const handleSearchSubmit = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowSuggestions(false);
    if (onSaveSearch && searchQuery.trim()) {
      onSaveSearch(searchQuery);
    }
  };
  
  const handleTagClick = (tag: string) => {
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tag)) {
      handleFilterChange('tags', [...currentTags, tag]);
    }
    setShowSuggestions(false);
  };
  
  // Compter les filtres actifs
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'query') return false; // Ne pas compter la recherche texte
    if (value === undefined || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }).length;
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* ════════════════════════════════════════════════════════════ */}
      {/* BARRE DE RECHERCHE PRINCIPALE */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="flex gap-3" ref={searchRef}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Rechercher dans les citations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          )}
          
          {/* Suggestions dropdown */}
          {showSuggestions && !query && (popularTags.length > 0 || recentSearches.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-3">
              {recentSearches.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">🕐 Recherches récentes</p>
                  <div className="flex flex-wrap gap-1">
                    {recentSearches.slice(0, 5).map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSearchSubmit(search)}
                        className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {popularTags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">🏷️ Tags populaires</p>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="text-sm px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Bouton Filtres */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
            showAdvanced || activeFiltersCount > 0
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {/* Bouton Effacer */}
        {(query || activeFiltersCount > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X className="h-5 w-5" />
            Effacer
          </button>
        )}
      </div>
      
      {/* Tags actifs */}
      {filters.tags && filters.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
            >
              #{tag}
              <button
                onClick={() => {
                  const newTags = filters.tags?.filter(t => t !== tag);
                  handleFilterChange('tags', newTags?.length ? newTags : undefined);
                }}
                className="hover:text-indigo-900 dark:hover:text-indigo-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* FILTRES AVANCÉS */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showAdvanced && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Émission */}
            {emissions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Émission</label>
                <select
                  value={filters.emissionId || ''}
                  onChange={(e) => handleFilterChange('emissionId', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Toutes</option>
                  {emissions.map((em) => (
                    <option key={em.id} value={em.id}>{em.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Type de contenu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de contenu</label>
              <select
                value={filters.contentType || ''}
                onChange={(e) => handleFilterChange('contentType', e.target.value as QuoteContentType)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Tous</option>
                <option value="quote">💬 Citation exacte</option>
                <option value="key_idea">💡 Idée clé</option>
                <option value="statement">📢 Déclaration</option>
                <option value="fact">📊 Fait</option>
              </select>
            </div>
            
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Toutes</option>
                <option value="politique">Politique</option>
                <option value="economie">Économie</option>
                <option value="culture">Culture</option>
                <option value="sport">Sport</option>
                <option value="societe">Société</option>
                <option value="humour">Humour</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            {/* Importance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Importance</label>
              <select
                value={filters.importance || ''}
                onChange={(e) => handleFilterChange('importance', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Toutes</option>
                <option value="high">⬆️ Haute</option>
                <option value="medium">➡️ Moyenne</option>
                <option value="low">⬇️ Faible</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Intervenant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <User className="inline-block w-4 h-4 mr-1" />
                Intervenant
              </label>
              <input
                type="text"
                value={filters.authorName || ''}
                onChange={(e) => handleFilterChange('authorName', e.target.value)}
                placeholder="Nom..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            
            {/* Type de segment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type segment</label>
              <select
                value={filters.segmentType || ''}
                onChange={(e) => handleFilterChange('segmentType', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Tous</option>
                <option value="intro">Intro</option>
                <option value="interview">Interview</option>
                <option value="debate">Débat</option>
                <option value="chronicle">Chronique</option>
                <option value="news">Actualités</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Du
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            
            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Au
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
          
          {/* Statut */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Statut :</span>
            {[
              { value: 'draft', label: 'Brouillon' },
              { value: 'validated', label: 'Validé' },
              { value: 'archived', label: 'Archivé' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFilterChange('status', 
                  filters.status === value ? undefined : value
                )}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.status === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteSearchBar;
