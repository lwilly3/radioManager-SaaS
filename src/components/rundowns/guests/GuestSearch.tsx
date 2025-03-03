import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import type { Guest } from '../../../types';

interface GuestSearchProps {
  onSelect: (guest: Guest) => void;
  onAddNew: () => void;
}

const GuestSearch: React.FC<GuestSearchProps> = ({ onSelect, onAddNew }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Guest[]>([]);

  // Simuler une recherche dans la base de données
  const handleSearch = (value: string) => {
    setQuery(value);
    // TODO: Implémenter la recherche réelle dans la base de données
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher un invité..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={onAddNew}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvel invité</span>
        </button>
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
          {results.map((guest) => (
            <button
              key={guest.id}
              onClick={() => onSelect(guest)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50"
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