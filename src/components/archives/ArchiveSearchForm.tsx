import React, { useState } from 'react';
import { Search, X, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import FormField from '../common/FormField';
import { useGuestSearch } from '../../hooks/guests/useGuestSearch';
import type { Guest } from '../../types/guest'; // Assure-toi que ce type est correct
import { useStatusStore } from '../../store/useStatusStore'; // Import du store
import { generateKey } from '../../utils/keyGenerator'; // Import de la fonction utilitaire

interface SearchFilters {
  keywords: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  presenter: number; // À terme, pourrait être number[] si multi-sélection
  guest: number[]; // Changé en tableau d'IDs pour le backend
}

interface ArchiveSearchFormProps {
  filters: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

const ArchiveSearchForm: React.FC<ArchiveSearchFormProps> = ({
  filters,
  onSearch,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [guestQuery, setGuestQuery] = useState('');
  const [showGuestSuggestions, setShowGuestSuggestions] = useState(false);
  const token = useAuthStore((state) => state.token);
  const statusNameById = useStatusStore((state) => state.getstatusNameById());
  const [presenterQuery, setPresenterQuery] = useState(''); // Nouvel état pour la saisie des présentateurs
  const [showPresenterSuggestions, setShowPresenterSuggestions] =
    useState(false); // Nouvel état

  // Récupérer la liste des présentateurs
  const { data: presenterResponse, isLoading: isLoadingPresenters } = useQuery({
    queryKey: ['presenters'],
    queryFn: async () => {
      const response = await api.get('presenters/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // { total: 1, presenters: [...] }
    },
    enabled: !!token,
  });

  // S'assurer que presenters est toujours un tableau
  const presenters = presenterResponse?.presenters || [];

  // const [guestQuery, setGuestQuery] = useState('');

  // Utilisation du hook useGuestSearch pour les invités
  const { data: guestSuggestions = [], isLoading: isLoadingGuests } =
    useGuestSearch(guestQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowGuestSuggestions(false); // Cacher les suggestions après recherche
    setShowPresenterSuggestions(false);
    // Log des paramètres envoyés à l'API
    console.log('Paramètres envoyés par onSearch:', localFilters);
    onSearch(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      keywords: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      presenter: 0,
      guest: [],
    });
    setGuestQuery('');
    setPresenterQuery('');
    setShowGuestSuggestions(false);
    setShowPresenterSuggestions(false);
    onReset();
  };

  const handleGuestSelect = (guest: Guest) => {
    setLocalFilters({ ...localFilters, guest: [guest.id] }); // Stocke l'ID
    setGuestQuery(guest.name); // Affiche le nom dans l'input
    setShowGuestSuggestions(false); // Cacher les suggestions après sélection
  };

  const handlePresenterSelect = (presenter: { id: number; name: string }) => {
    setLocalFilters({ ...localFilters, presenter: presenter.id }); // Stocke l'ID
    setPresenterQuery(presenter.name); // Affiche le nom
    setShowPresenterSuggestions(false);
  };

  // Filtrer les présentateurs en fonction de la saisie
  const filteredPresenters = presenters.filter((presenter) =>
    presenter.name.toLowerCase().includes(presenterQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <FormField label="Mots-clés">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={localFilters.keywords}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, keywords: e.target.value })
              }
              placeholder="Rechercher..."
              className="form-input pl-10"
            />
          </div>
        </FormField>

        <FormField label="Du">
          <input
            type="date"
            value={localFilters.dateFrom}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, dateFrom: e.target.value })
            }
            className="form-input"
          />
        </FormField>

        <FormField label="Au">
          <input
            type="date"
            value={localFilters.dateTo}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, dateTo: e.target.value })
            }
            className="form-input"
          />
        </FormField>
        <FormField label="Statut">
          <select
            value={localFilters.status}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, status: e.target.value })
            }
            className="form-input"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statusNameById).map(([id, [name]]) => (
              <option key={generateKey(id)} value={id}>
                {name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Présentateur">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={presenterQuery}
                onChange={(e) => {
                  setPresenterQuery(e.target.value);
                  setShowPresenterSuggestions(e.target.value.length >= 2);
                }}
                onFocus={() => {
                  if (presenterQuery.length >= 2)
                    setShowPresenterSuggestions(true);
                }}
                placeholder="Rechercher un présentateur..."
                className="form-input pl-10"
              />
              {isLoadingPresenters && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {showPresenterSuggestions && presenterQuery.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {filteredPresenters.map((presenter) => (
                  <button
                    key={generateKey(presenter.id)}
                    type="button"
                    onClick={() => handlePresenterSelect(presenter)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {presenter.profilePicture ? (
                        <img
                          src={presenter.profilePicture}
                          alt={presenter.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {presenter.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {presenter.biography || 'Présentateur'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </FormField>

        <FormField label="Invité">
          <div className="relative">
            <input
              type="text"
              value={guestQuery}
              onChange={(e) => {
                setGuestQuery(e.target.value);
                setShowGuestSuggestions(e.target.value.length >= 2);
              }}
              onFocus={() =>
                guestQuery.length >= 2 && setShowGuestSuggestions(true)
              }
              placeholder="Rechercher un invité..."
              className="form-input"
            />

            {showGuestSuggestions && guestQuery.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {isLoadingGuests ? (
                  <div className="p-2 text-center text-gray-500">
                    Recherche en cours...
                  </div>
                ) : guestSuggestions.length > 0 ? (
                  guestSuggestions.map((guest: Guest) => (
                    <button
                      key={generateKey(guest.id)}
                      type="button"
                      onClick={() => handleGuestSelect(guest)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {guest.avatar ? (
                          <img
                            src={guest.avatar}
                            alt={guest.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {guest.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {guest.role}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-2 text-center text-gray-500">
                    Aucun invité trouvé
                  </div>
                )}
              </div>
            )}
          </div>
        </FormField>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary flex items-center gap-2"
        >
          <X className="h-5 w-5" />
          Réinitialiser
        </button>
        <button
          type="submit"
          className="btn btn-primary flex items-center gap-2"
        >
          <Search className="h-5 w-5" />
          Rechercher
        </button>
      </div>
    </form>
  );
};

export default ArchiveSearchForm;
