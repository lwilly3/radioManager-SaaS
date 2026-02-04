
import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useGuestSearch } from '../../../hooks/guests/useGuestSearch';
import type { Guest } from '../../../types';

interface GuestSearchProps {
  onSelect: (guest: Guest) => void;
  onAddNew: () => void;
}

const GuestSearch: React.FC<GuestSearchProps> = ({ onSelect, onAddNew }) => {
  const [query, setQuery] = useState('');
  const { data: guests = [], isLoading } = useGuestSearch(query);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un invité..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          onClick={onAddNew}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvel invité</span>
        </button>
      </div>

      {query.length > 2 && guests.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
          {guests.map((guest) => (
            <button
              key={guest.id}
              onClick={() => {
                onSelect(guest);
                setQuery('');
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium">{guest.name}</div>
              <div className="text-sm text-gray-600">{guest.role}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestSearch;
