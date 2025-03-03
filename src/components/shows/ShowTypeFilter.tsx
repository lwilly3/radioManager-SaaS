import React from 'react';

interface ShowTypeFilterProps {
  selectedType: string;
  onChange: (type: string) => void;
}

const ShowTypeFilter: React.FC<ShowTypeFilterProps> = ({ selectedType, onChange }) => {
  const showTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'morning-show', label: 'Matinale' },
    { value: 'news', label: 'Journal' },
    { value: 'talk-show', label: 'Talk-show' },
    { value: 'music-show', label: 'Émission musicale' },
    { value: 'cultural', label: 'Magazine culturel' },
    { value: 'sports', label: 'Sport' },
    { value: 'documentary', label: 'Documentaire' },
    { value: 'entertainment', label: 'Divertissement' },
    { value: 'debate', label: 'Débat' },
    { value: 'other', label: 'Autre' },
  ];

  return (
    <select 
      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      value={selectedType}
      onChange={(e) => onChange(e.target.value)}
    >
      {showTypes.map(type => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </select>
  );
};

export default ShowTypeFilter;