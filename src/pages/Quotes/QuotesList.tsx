// Page Liste des Citations
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, RefreshCw } from 'lucide-react';
import QuoteCard from '../../components/quotes/QuoteCard';
import { useQuotes } from '../../hooks/quotes/useQuotes';
import type { Quote, QuoteFilters } from '../../types/quote';
import { useAuthStore } from '../../store/useAuthStore';

const QuotesList: React.FC = () => {
  const navigate = useNavigate();
  const { permissions } = useAuthStore();
  
  const [filters, setFilters] = useState<QuoteFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { quotes, isLoading, error, refresh } = useQuotes(filters);

  // Vérifier la permission d'accès
  useEffect(() => {
    if (!isLoading && permissions && !permissions.quotes_view) {
      navigate('/404');
    }
  }, [permissions, isLoading, navigate]);

  // Gestion de la sélection d'une citation
  const handleSelectQuote = (quote: Quote) => {
    navigate(`/quotes/${quote.id}`);
  };

  // Gestion des filtres
  const handleStatusFilter = (status: Quote['status'] | 'all') => {
    if (status === 'all') {
      setFilters(prev => ({ ...prev, status: undefined }));
    } else {
      setFilters(prev => ({ ...prev, status }));
    }
  };

  // Compteurs par statut
  const counts = {
    all: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    approved: quotes.filter(q => q.status === 'approved').length,
    published: quotes.filter(q => q.status === 'published').length,
    archived: quotes.filter(q => q.status === 'archived').length,
  };

  // Vérifier la permission de création
  const canCreate = permissions?.quotes_create;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Citations
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez vos citations et générez du contenu social
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
              onClick={() => navigate('/quotes/create')}
              className="w-full sm:w-auto btn btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Nouvelle citation</span>
              <span className="sm:hidden">Nouvelle</span>
            </button>
          )}
        </div>
      </header>

      {/* Filtres rapides par statut */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Filtres</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Masquer' : 'Afficher'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !filters.status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({counts.all})
          </button>
          <button
            onClick={() => handleStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.status === 'draft'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Brouillons ({counts.draft})
          </button>
          <button
            onClick={() => handleStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.status === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approuvées ({counts.approved})
          </button>
          <button
            onClick={() => handleStatusFilter('published')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.status === 'published'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Publiées ({counts.published})
          </button>
          <button
            onClick={() => handleStatusFilter('archived')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filters.status === 'archived'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Archivées ({counts.archived})
          </button>
        </div>
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
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onSelect={handleSelectQuote}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">
                {filters.status
                  ? `Aucune citation avec le statut "${filters.status}"`
                  : 'Aucune citation trouvée'}
              </p>
              {canCreate && (
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
      )}
    </div>
  );
};

export default QuotesList;
