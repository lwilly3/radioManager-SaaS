import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Clock, Users, Calendar, Edit, Trash2, Eye, LayoutGrid, List } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { emissionApi } from '../../services/api/emissions';
import ShowDetailDialog from '../../components/shows/ShowDetailDialog';
import ShowSearchBar from '../../components/shows/ShowSearchBar';
import ShowTypeFilter from '../../components/shows/ShowTypeFilter';
import { filterShows } from '../../utils/showFilters';
import type { Emission } from '../../types/emission';
import Notification from '../../components/common/Notification';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ShowList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, permissions } = useAuthStore();
  const [shows, setShows] = useState<Emission[]>([]);
  const [selectedShow, setSelectedShow] = useState<Emission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showType, setShowType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!isLoading && !error && permissions && !permissions.can_acces_emissions_section) {
      navigate('/404');
    }
  }, [permissions, isLoading, error, navigate]);

  useEffect(() => {
    const fetchShows = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const data = await emissionApi.getAllEmissions(token);
        setShows(data);
      } catch (err) {
        setError('Erreur lors du chargement des émissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShows();
  }, [token]);

  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      window.history.replaceState({}, document.title);
      setTimeout(() => setNotification(null), 3000);
    }
  }, [location.state]);

  const handleDelete = async (id: number) => {
    if (!token || !permissions?.can_delete_emissions) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette émission ?')) {
      return;
    }

    try {
      await emissionApi.delete(token, id);
      setShows(shows.filter(show => show.id !== id));
      setNotification({
        type: 'success',
        message: 'Émission supprimée avec succès'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: "Erreur lors de la suppression de l'émission"
      });
    }
  };

  const filteredShows = filterShows(shows, searchQuery, showType);

  // Function to get show type label
  const getShowTypeLabel = (type: string): string => {
    const showTypeLabels: Record<string, string> = {
      'morning-show': 'Matinale',
      'news': 'Journal',
      'talk-show': 'Talk-show',
      'music-show': 'Émission musicale',
      'cultural': 'Magazine culturel',
      'sports': 'Sport',
      'documentary': 'Documentaire',
      'entertainment': 'Divertissement',
      'debate': 'Débat',
      'other': 'Autre',
    };
    return showTypeLabels[type] || type;
  };

  // Function to get frequency label
  const getFrequencyLabel = (frequency: string): string => {
    const frequencyLabels: Record<string, string> = {
      'daily': 'Quotidienne',
      'weekly': 'Hebdomadaire',
      'monthly': 'Mensuelle',
      'special': 'Spéciale',
    };
    return frequencyLabels[frequency] || frequency;
  };

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
            Émissions
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez vos émissions et leurs détails
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg shadow p-1">
            <button
              onClick={() => setViewMode('grid')}
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
              onClick={() => setViewMode('list')}
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
          {permissions?.can_create_emissions && (
            <button
              onClick={() => navigate('/shows/create')}
              className="w-full sm:w-auto btn btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Nouvelle émission</span>
              <span className="sm:hidden">Nouvelle</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <ShowSearchBar 
          onSearch={setSearchQuery} 
          initialQuery={searchQuery}
        />
        <ShowTypeFilter 
          selectedType={showType} 
          onChange={setShowType}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredShows.length > 0 ? (
                filteredShows.map((show) => (
                  <div
                    key={show.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {show.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                          {getShowTypeLabel(show.type)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {show.synopsis}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{show.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{getFrequencyLabel(show.frequency)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                      <button
                        onClick={() => setSelectedShow(show)}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Détails</span>
                      </button>
                      
                      <div className="flex gap-2">
                        {permissions?.can_edit_emissions && (
                          <button
                            onClick={() => navigate(`/shows/${show.id}/edit`, { state: { show } })}
                            className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        
                        {permissions?.can_delete_emissions && (
                          <button
                            onClick={() => handleDelete(show.id)}
                            className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-500">
                    {searchQuery || showType 
                      ? "Aucune émission ne correspond à votre recherche" 
                      : "Aucune émission trouvée"}
                  </p>
                  {permissions?.can_create_emissions && (
                    <button
                      onClick={() => navigate('/shows/create')}
                      className="mt-4 btn btn-primary"
                    >
                      Créer une émission
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredShows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Émission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durée
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fréquence
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredShows.map((show) => (
                        <tr key={show.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">{show.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{show.synopsis}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                              {getShowTypeLabel(show.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{show.duration} min</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{getFrequencyLabel(show.frequency)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedShow(show)}
                                className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Voir les détails"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              
                              {permissions?.can_edit_emissions && (
                                <button
                                  onClick={() => navigate(`/shows/${show.id}/edit`, { state: { show } })}
                                  className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title="Modifier"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                              )}
                              
                              {permissions?.can_delete_emissions && (
                                <button
                                  onClick={() => handleDelete(show.id)}
                                  className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {searchQuery || showType 
                      ? "Aucune émission ne correspond à votre recherche" 
                      : "Aucune émission trouvée"}
                  </p>
                  {permissions?.can_create_emissions && (
                    <button
                      onClick={() => navigate('/shows/create')}
                      className="mt-4 btn btn-primary"
                    >
                      Créer une émission
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedShow && (
        <ShowDetailDialog
          show={selectedShow}
          isOpen={Boolean(selectedShow)}
          onClose={() => setSelectedShow(null)}
        />
      )}
    </div>
  );
};

export default ShowList;