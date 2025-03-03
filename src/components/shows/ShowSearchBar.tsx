import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface ShowSearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
}

const ShowSearchBar: React.FC<ShowSearchBarProps> = ({ 
  onSearch, 
  initialQuery = '', 
  placeholder = 'Rechercher une émission...' 
}) => {
  const [inputValue, setInputValue] = useState(initialQuery);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(inputValue);
    }
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleSearch}
        onBlur={() => onSearch(inputValue)}
      />
    </div>
  );
};

export default ShowSearchBar;