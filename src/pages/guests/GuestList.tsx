// import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import GuestDetailDialog from '../../components/guests/GuestDetailDialog';
import GuestSearchBar from '../../components/guests/GuestSearchBar';
import GuestCard from '../../components/guests/GuestCard';
import { useGuestSearch } from '../../hooks/guests/useGuestSearch';
import type { Guest } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';


const GuestList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');

  const {
    data: guests = [],
    isLoading,
    isError,
    error,
  } = useGuestSearch(query);
  console.log('Guests to render:', guests);

  const {  permissions } = useAuthStore();

      
    
    
  // if (!permissions?.can_acces_guests_section) {
  //   navigate('/404'); // Rediriger vers la page 404

  //   }

    // Vérifier la permission et rediriger vers 404 si elle manque
    useEffect(() => {
      if (!isLoading && !error && permissions && !permissions.can_acces_guests_section) {
        navigate('/404'); // Rediriger vers la page 404
      }
    }, [permissions, isLoading, error, navigate]);

  const handleSearch = () => {
    // Lancer la recherche avec la valeur actuelle de searchInput
    setQuery(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Invités
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez vos invités et leurs participations
          </p>
        </div>
        <button
          onClick={() => navigate('/guests/create')}
          className="w-full sm:w-auto btn btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Nouvel invité</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </header>

      <GuestSearchBar
        value={searchInput}
        onChange={setSearchInput} // Met à jour uniquement la valeur de la barre de recherche
        onSearch={handleSearch} // Lance la recherche en appuyant sur le bouton
      />

      {error ? (
        <div className="text-center py-12 text-red-600">
          Une erreur est survenue lors de la recherche
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guests.length > 0 ? (
            guests.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                onSelect={setSelectedGuest}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">Aucun invité trouvé</p>
              <button
                onClick={() => navigate('/guests/create')}
                className="btn btn-primary"
              >
                Créer un invité
              </button>
            </div>
          )}
        </div>
      )}

      {selectedGuest && (
        <GuestDetailDialog
          guest={selectedGuest}
          isOpen={Boolean(selectedGuest)}
          onClose={() => setSelectedGuest(null)}
        />
      )}
    </div>
  );
};

export default GuestList;
