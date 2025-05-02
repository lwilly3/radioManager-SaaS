import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Search, Filter, X, LayoutGrid, List, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ArchiveSearchForm from '../components/archives/ArchiveSearchForm';
import ArchiveCard from '../components/archives/ArchiveCard';
import ArchiveList from '../components/archives/ArchiveList';
import ArchiveDetailDialog from '../components/archives/ArchiveDetailDialog';
import Pagination from '../components/archives/Pagination';
import { useAuthStore } from '../store/useAuthStore';
import { useUserPreferencesStore } from '../store/useUserPreferencesStore';
import api from '../api/api';
import { generateKey } from '../utils/keyGenerator';
import { useNavigate } from 'react-router-dom';
import PdfGenerator from '../components/common/PdfGenerator';

interface Presenter {
  id: number;
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}

interface Show {
  id: string;
  emission: string;
  title: string;
  broadcast_date: string;
  duration: number;
  presenters: Presenter[];
  status: string;
  description?: string;
  guests?: { id: number; name: string; role: string; avatar?: string | null }[];
  segments?: {
    id: number;
    title: string;
    type: string;
    duration: number;
    description?: string;
    guests?: {
      id: number;
      name: string;
      role: string;
      avatar?: string | null;
    }[];
    technical_notes?: string | null;
  }[];
}

interface ApiResponse {
  total: number;
  data: Show[];
}

interface SearchFilters {
  keywords: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  presenter: number;
  guest: number[];
}

const Archives: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { preferences, setViewMode } = useUserPreferencesStore();
  const [viewMode, setLocalViewMode] = useState<'grid' | 'list'>(preferences.viewMode);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    presenter: 0,
    guest: [],
  });
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const token = useAuthStore((state) => state.token);
  const { permissions } = useAuthStore();

  // Sync local view mode with store
  useEffect(() => {
    setLocalViewMode(preferences.viewMode);
  }, [preferences.viewMode]);

  const { data, isLoading, isError, error } = useQuery<ApiResponse>({
    queryKey: ['archives', filters, currentPage],
    queryFn: async () => {
      const skip = (currentPage - 1) * 20;
      const params = {
        keywords: filters.keywords || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        status: filters.status || undefined,
        presenter: filters.presenter > 0 ? filters.presenter : undefined,
        guest: filters.guest.length > 0 ? filters.guest : undefined,
        skip,
        limit: 20,
      };

      const response = await api.get('search_shows', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return response.data;
    },
    enabled: !!token && isSearchTriggered,
  });

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsSearchTriggered(true);
  };

  const handleExportSuccess = () => {
    setNotification({
      type: 'success',
      message: 'PDF généré avec succès',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportError = (errorMessage: string) => {
    setNotification({
      type: 'error',
      message: `Erreur lors de l'export: ${errorMessage}`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleResetFilters = () => {
    setFilters({
      keywords: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      presenter: 0,
      guest: [],
    });
    setCurrentPage(1);
    setIsSearchTriggered(false);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setLocalViewMode(mode);
    setViewMode(mode); // This will also save to Firebase
  };

  React.useEffect(() => {
    if (!isLoading && !error && permissions && !permissions.can_view_archives) {
      navigate('/404');
    }
  }, [permissions, isLoading, error, navigate]);

  // Vérifier s'il y a des résultats à afficher
  const hasSearchResults = isSearchTriggered && data?.data && data.data.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Archives</h1>
          <p className="text-gray-600">
            Recherchez dans les émissions archivées
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg shadow p-1">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vue en grille"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vue en liste"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          
          {/* Afficher les boutons d'exportation uniquement s'il y a des résultats de recherche */}
          {hasSearchResults && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Logique d'export CSV
                  try {
                    const headers = ['ID', 'Émission', 'Titre', 'Date de diffusion', 'Durée', 'Présentateurs', 'Statut'];
                    const rows = data.data.map((show: Show) => [
                      show.id,
                      show.emission,
                      show.title,
                      format(new Date(show.broadcast_date), 'dd/MM/yyyy HH:mm'),
                      show.duration,
                      show.presenters.map(p => p.name).join(', '),
                      show.status
                    ]);

                    const csvContent = [
                      headers.join(','),
                      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
                    ].join('\n');

                    // Create and download the CSV file
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `archives_${format(new Date(), 'yyyy-MM-dd')}.csv`);
                    document.body.appendChild(link);
                    link.click();

                    // Cleanup
                    window.URL.revokeObjectURL(url);
                    link.remove();
                    
                    handleExportSuccess();
                  } catch (error: any) {
                    handleExportError(error.message || 'Une erreur inconnue est survenue');
                  }
                }}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                CSV
              </button>
              
              {data?.data && (
                <PdfGenerator
                  data={data.data}
                  type="archive"
                  filters={filters}
                  totalCount={data.total}
                  onSuccess={handleExportSuccess}
                  onError={handleExportError}
                />
              )}
            </div>
          )}
        </div>
      </header>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-5 w-5 flex-shrink-0" />
          ) : (
            <X className="h-5 w-5 flex-shrink-0" />
          )}
          <p>{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <ArchiveSearchForm
        filters={filters}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

      {isSearchTriggered ? (
        isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : isError ? (
          (error as any)?.response?.status === 404 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                Aucune émission trouvée pour ces filtres
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-red-600">
              Une erreur est survenue lors de la recherche:{' '}
              {(error as any)?.message}
            </div>
          )
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data?.data?.map((show) => (
                  <ArchiveCard
                    key={generateKey(show.id)}
                    show={show}
                    onShowDetail={() => setSelectedShow(show)}
                  />
                ))}
              </div>
            ) : (
              <ArchiveList
                shows={data?.data || []}
                onShowDetail={(show) => setSelectedShow(show)}
              />
            )}

            {data?.data?.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Aucune émission trouvée</p>
              </div>
            )}

            {data?.total > 20 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(data.total / 20)}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            Veuillez effectuer une recherche pour voir les résultats
          </p>
        </div>
      )}

      {selectedShow && (
        <ArchiveDetailDialog
          show={selectedShow}
          isOpen={!!selectedShow}
          onClose={() => setSelectedShow(null)}
        />
      )}
    </div>
  );
};

export default Archives;