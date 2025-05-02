import React, { useEffect, useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ShowPlanList from '../components/showPlans/ShowPlanList';
import ShowPlanFilters from '../components/showPlans/ShowPlanFilters';
import Notification from '../components/common/Notification';
import { useShows } from '../hooks/shows/useShows';
import { useShowPlanStore } from '../store/useShowPlanStore';
import { useUserPreferencesStore } from '../store/useUserPreferencesStore';
import { filterShowPlansByDate } from '../utils/dateFilters';
import { filterShowPlansBySearch } from '../utils/searchFilters';

interface ShowPlansProps {
  title?: string;
  description?: string;
  baseUrl?: string;
}

const ShowPlans: React.FC<ShowPlansProps> = ({ 
  title = "Conducteurs Prêts à Diffuser",
  description = "Gérez les conducteurs en attente de diffusion",
  baseUrl = "/show-plans"
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { shows, isLoading, error } = useShows();
  const setShowPlans = useShowPlanStore((state) => state.setShowPlans);
  const showPlans = useShowPlanStore((state) => state.showPlans);
  const { preferences, setViewMode } = useUserPreferencesStore();
  const [viewMode, setLocalViewMode] = useState<'grid' | 'list'>(preferences.viewMode);
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sync local view mode with store
  useEffect(() => {
    setLocalViewMode(preferences.viewMode);
  }, [preferences.viewMode]);

  useEffect(() => {
    if (shows) {
      setShowPlans(shows);
    }
  }, [shows, setShowPlans]);

  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      window.history.replaceState({}, document.title);
      setTimeout(() => setNotification(null), 3000);
    }
  }, [location.state]);

  // Appliquer les filtres dans l'ordre: d'abord la recherche, puis le filtre de date
  const filteredBySearch = filterShowPlansBySearch(showPlans, searchQuery);
  const filteredShowPlans = filterShowPlansByDate(filteredBySearch, dateFilter);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setLocalViewMode(mode);
    setViewMode(mode); // This will also save to Firebase
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Une erreur est survenue lors du chargement des conducteurs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {description}
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
          <button
            onClick={() => navigate(`${baseUrl}/create`)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nouveau conducteur</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <ShowPlanFilters 
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <ShowPlanList 
              viewMode={viewMode} 
              showPlans={filteredShowPlans}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowPlans;