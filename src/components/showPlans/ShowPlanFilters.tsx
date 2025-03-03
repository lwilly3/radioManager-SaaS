import React, { useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import { useStatusStore } from '../../store/useStatusStore';
import StatusBadge from './StatusBadge';

interface ShowPlanFiltersProps {
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ShowPlanFilters: React.FC<ShowPlanFiltersProps> = ({ 
  dateFilter, 
  onDateFilterChange,
  searchQuery,
  onSearchChange
}) => {
  const statuses = useStatusStore((state) => state.statuses);
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchChange(inputValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un conducteur..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleSearch}
            onBlur={() => onSearchChange(inputValue)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1 min-w-[220px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
            >
              <option value="today">Aujourd'hui</option>
              <option value="this-week-full">Cette semaine</option>
              <option value="weekend">Ce weekend</option>
              <option value="this-week">Plus tard cette semaine</option>
              <option value="last-week">Il y a plus d'une semaine</option>
              <option value="this-month">Ce mois-ci</option>
              <option value="past-months">Il y a plusieurs mois</option>
              <option value="next-month">Le mois prochain</option>
              <option value="future-months">Les mois prochains</option>
              <option value="all">Toutes les dates</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
        {statuses.map((status) => (
          <StatusBadge
            key={status.id}
            status={status}
            onClick={() => {}}
            className="cursor-pointer hover:opacity-80 whitespace-nowrap"
          />
        ))}
      </div>
    </div>
  );
};

export default ShowPlanFilters;