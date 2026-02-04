// Page Liste des Citations
// Optimisée pour de grandes quantités de données

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Plus, RefreshCw, ChevronLeft, ChevronRight, Loader2, ArrowLeft, Radio } from 'lucide-react';
import QuoteCard from '../../components/quotes/QuoteCard';
import QuoteSearchBar from '../../components/quotes/QuoteSearchBar';
import { useQuotes } from '../../hooks/quotes/useQuotes';
import type { Quote, QuoteFilters } from '../../types/quote';
import { useAuthStore } from '../../store/useAuthStore';

// ════════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════════

const RECENT_SEARCHES_KEY = 'quotes_recent_searches';
const PAGE_SIZE = 12; // Nombre de citations par page
const VIRTUALIZATION_THRESHOLD = 50; // Activer virtualisation au-delà

const QuotesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { permissions } = useAuthStore();
  
  // Lire les filtres depuis l'URL (ex: ?showPlanId=123)
  const urlShowPlanId = searchParams.get('showPlanId');
  const urlEmissionId = searchParams.get('emissionId');
  
  const [filters, setFilters] = useState<QuoteFilters>(() => ({
    ...(urlShowPlanId && { showPlanId: urlShowPlanId }),
    ...(urlEmissionId && { emissionId: urlEmissionId }),
  }));
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  // Mettre à jour les filtres si l'URL change
  useEffect(() => {
    if (urlShowPlanId || urlEmissionId) {
      setFilters(prev => ({
        ...prev,
        ...(urlShowPlanId && { showPlanId: urlShowPlanId }),
        ...(urlEmissionId && { emissionId: urlEmissionId }),
      }));
    }
  }, [urlShowPlanId, urlEmissionId]);

  // Filtres sans showPlanId/emissionId (on filtre côté client pour ces deux-là)
  const serverFilters = useMemo(() => {
    const { showPlanId, emissionId, ...rest } = filters;
    return rest;
  }, [filters]);

  // Récupérer les citations avec les filtres serveur
  const { quotes: rawQuotes, isLoading, error, refresh } = useQuotes(serverFilters);
  
  // Filtrage côté client pour showPlanId/emissionId (plus flexible sur le format)
  const quotes = useMemo(() => {
    let result = rawQuotes;
    
    if (filters.showPlanId) {
      result = result.filter(q => {
        const quoteShowPlanId = q.context.showPlanId?.toString();
        return quoteShowPlanId === filters.showPlanId?.toString();
      });
    }
    
    if (filters.emissionId) {
      result = result.filter(q => {
        const quoteEmissionId = q.context.emissionId?.toString();
        return quoteEmissionId === filters.emissionId?.toString();
      });
    }
    
    return result;
  }, [rawQuotes, filters.showPlanId, filters.emissionId]);
  
  // Récupérer TOUTES les citations pour les compteurs (sans filtre status)
  const filtersWithoutStatus = useMemo(() => {
    const { status, ...rest } = serverFilters;
    return rest;
  }, [serverFilters]);
  const { quotes: allRawQuotes } = useQuotes(filtersWithoutStatus);
  
  // Appliquer le même filtrage côté client pour les compteurs
  const allQuotes = useMemo(() => {
    let result = allRawQuotes;
    
    if (filters.showPlanId) {
      result = result.filter(q => {
        const quoteShowPlanId = q.context.showPlanId?.toString();
        return quoteShowPlanId === filters.showPlanId?.toString();
      });
    }
    
    if (filters.emissionId) {
      result = result.filter(q => {
        const quoteEmissionId = q.context.emissionId?.toString();
        return quoteEmissionId === filters.emissionId?.toString();
      });
    }
    
    return result;
  }, [allRawQuotes, filters.showPlanId, filters.emissionId]);

  // Debug: afficher les showPlanId des citations
  useEffect(() => {
    if (urlShowPlanId && allRawQuotes.length > 0) {
      console.log('[QuotesList] Recherche showPlanId:', urlShowPlanId);
      console.log('[QuotesList] Citations disponibles:', allRawQuotes.length);
      console.log('[QuotesList] ShowPlanIds dans les citations:', 
        [...new Set(allRawQuotes.map(q => q.context.showPlanId))].filter(Boolean)
      );
    }
  }, [urlShowPlanId, allRawQuotes]);

  // ════════════════════════════════════════════════════════════════
  // PAGINATION ET MÉMORISATION
  // ════════════════════════════════════════════════════════════════

  // Mémoriser les compteurs sur TOUTES les citations (pas les filtrées par status)
  const counts = useMemo(() => ({
    all: allQuotes.length,
    draft: allQuotes.filter(q => q.status === 'draft').length,
    validated: allQuotes.filter(q => q.status === 'validated').length,
    archived: allQuotes.filter(q => q.status === 'archived').length,
  }), [allQuotes]);

  // Pagination des résultats
  const totalPages = Math.ceil(quotes.length / PAGE_SIZE);
  
  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return quotes.slice(startIndex, startIndex + PAGE_SIZE);
  }, [quotes, currentPage]);

  // Reset page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Scroll to top quand la page change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  // ════════════════════════════════════════════════════════════════
  // RECHERCHES RÉCENTES
  // ════════════════════════════════════════════════════════════════

  // Charger les recherches récentes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erreur chargement recherches récentes:', e);
    }
  }, []);

  // Sauvegarder une recherche - mémorisé
  const handleSaveSearch = useCallback((query: string) => {
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ════════════════════════════════════════════════════════════════
  // HANDLERS - MÉMORISÉS
  // ════════════════════════════════════════════════════════════════

  // Vérifier la permission d'accès
  useEffect(() => {
    if (!isLoading && permissions && !permissions.quotes_view) {
      navigate('/404');
    }
  }, [permissions, isLoading, navigate]);

  // Gestion de la sélection - mémorisée
  const handleSelectQuote = useCallback((quote: Quote) => {
    navigate(`/quotes/${quote.id}`);
  }, [navigate]);

  // Gestion filtres - mémorisée pour éviter re-renders
  const handleFiltersChange = useCallback((newFilters: QuoteFilters) => {
    setFilters(newFilters);
  }, []);

  // Filtres rapides par statut - mémorisé
  const handleStatusFilter = useCallback((status: Quote['status'] | undefined) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  // Vérifier la permission de création
  const canCreate = permissions?.quotes_create;

  // ════════════════════════════════════════════════════════════════
  // RENDU
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Bandeau contextuel si on vient d'un conducteur */}
      {urlShowPlanId && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-full">
              <Radio className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-indigo-600 font-medium">
                Citations du conducteur #{urlShowPlanId}
              </p>
              <p className="text-xs text-indigo-500">
                {counts.all} citation{counts.all !== 1 ? 's' : ''} trouvée{counts.all !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/show-plans/${urlShowPlanId}`}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au conducteur
            </Link>
            <button
              onClick={() => {
                setFilters({});
                navigate('/quotes');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:border-gray-400"
            >
              Voir toutes les citations
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {urlShowPlanId ? 'Citations du conducteur' : 'Citations'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {urlShowPlanId 
              ? 'Citations extraites de ce conducteur' 
              : 'Gérez vos citations extraites des émissions'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Bouton rafraîchir */}
          <button
            onClick={refresh}
            className="btn btn-secondary flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Bouton créer */}
          {canCreate && (
            <button
              onClick={() => navigate('/quotes/create', {
                state: urlShowPlanId ? { showPlan: { id: urlShowPlanId } } : undefined
              })}
              className="w-full sm:w-auto btn btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Nouvelle citation</span>
              <span className="sm:hidden">Nouvelle</span>
            </button>
          )}
        </div>
      </header>

      {/* Barre de recherche avancée */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <QuoteSearchBar
          filters={filters}
          onFiltersChange={setFilters}
          recentSearches={recentSearches}
          onSaveSearch={handleSaveSearch}
          loading={isLoading}
        />
      </div>

      {/* Filtres rapides par statut */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilters(prev => ({ ...prev, status: undefined }))}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !filters.status
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Toutes ({counts.all})
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, status: 'draft' }))}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filters.status === 'draft'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Brouillons ({counts.draft})
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, status: 'validated' }))}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filters.status === 'validated'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Validées ({counts.validated})
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, status: 'archived' }))}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filters.status === 'archived'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Archivées ({counts.archived})
        </button>
      </div>

      {/* Liste des citations */}
      {error ? (
        <div className="text-center py-12 text-red-600 bg-white rounded-lg shadow">
          <p>Une erreur est survenue lors du chargement des citations</p>
          <button
            onClick={refresh}
            className="mt-4 btn btn-secondary"
          >
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Info résultats + pagination header */}
          {quotes.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {quotes.length} citation{quotes.length > 1 ? 's' : ''} trouvée{quotes.length > 1 ? 's' : ''}
                {totalPages > 1 && (
                  <span className="ml-1">
                    • Page {currentPage}/{totalPages}
                  </span>
                )}
              </span>
              {totalPages > 1 && (
                <span>
                  Affichage {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, quotes.length)}
                </span>
              )}
            </div>
          )}

          {/* Liste des citations */}
          <div ref={listRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedQuotes.length > 0 ? (
              paginatedQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onSelect={handleSelectQuote}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {filters.query
                    ? `Aucun résultat pour "${filters.query}"`
                    : filters.status
                    ? `Aucune citation avec le statut "${filters.status}"`
                    : 'Aucune citation trouvée'}
                </p>
                {canCreate && !filters.query && (
                  <button
                    onClick={() => navigate('/quotes/create')}
                    className="btn btn-primary"
                  >
                    Créer votre première citation
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>
              
              {/* Numéros de page */}
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              {/* Page courante sur mobile */}
              <span className="sm:hidden px-3 py-2 text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuotesList;
