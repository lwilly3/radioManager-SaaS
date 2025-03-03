
import React from 'react';
import { Search } from 'lucide-react';

interface GuestSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

const GuestSearchBar: React.FC<GuestSearchBarProps> = ({ value, onChange, onSearch }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Rechercher un invité..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <button
        onClick={onSearch}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Rechercher
      </button>
    </div>
  );
};

export default GuestSearchBar;
