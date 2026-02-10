// Filtres d'équipements
import React from 'react';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
  color?: string;
}

interface EquipmentFiltersProps {
  // Recherche
  searchQuery: string;
  onSearchChange: (query: string) => void;
  
  // Filtres
  categories: FilterOption[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  
  statuses: FilterOption[];
  selectedStatus: string | null;
  onStatusChange: (statusId: string | null) => void;
  
  companies: FilterOption[];
  selectedCompany: string | null;
  onCompanyChange: (companyId: string | null) => void;
  
  // Options
  showArchived?: boolean;
  onShowArchivedChange?: (show: boolean) => void;
  
  // Tri
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
  
  // Réinitialisation
  onReset?: () => void;
}

export const EquipmentFilters: React.FC<EquipmentFiltersProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  statuses,
  selectedStatus,
  onStatusChange,
  companies,
  selectedCompany,
  onCompanyChange,
  showArchived = false,
  onShowArchivedChange,
  sortBy = 'name',
  sortOrder = 'asc',
  onSortChange,
  onReset,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  
  const hasActiveFilters = selectedCategory || selectedStatus || selectedCompany || showArchived;

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres rapides */}
      <div className="flex flex-wrap gap-3">
        {/* Recherche */}
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, référence, numéro de série..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Catégorie */}
        <select
          value={selectedCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Toutes catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Statut */}
        <select
          value={selectedStatus || ''}
          onChange={(e) => onStatusChange(e.target.value || null)}
          className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tous statuts</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>

        {/* Société */}
        <select
          value={selectedCompany || ''}
          onChange={(e) => onCompanyChange(e.target.value || null)}
          className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Toutes sociétés</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        {/* Bouton filtres avancés */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
            showAdvanced ? 'bg-blue-50 border-blue-200 text-blue-600' : 'hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres avancés
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Réinitialiser */}
        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="h-4 w-4" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Archivés */}
            {onShowArchivedChange && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => onShowArchivedChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Afficher les équipements archivés</span>
              </label>
            )}

            {/* Tri */}
            {onSortChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Trier par:</span>
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value, sortOrder)}
                  className="px-3 py-1.5 text-sm border rounded-lg bg-white"
                >
                  <option value="name">Nom</option>
                  <option value="reference">Référence</option>
                  <option value="createdAt">Date de création</option>
                  <option value="acquisitionDate">Date d'acquisition</option>
                  <option value="purchasePrice">Prix d'achat</option>
                </select>
                <button
                  onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 border rounded-lg hover:bg-white"
                >
                  {sortOrder === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags des filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Catégorie: {categories.find(c => c.id === selectedCategory)?.name}
              <button onClick={() => onCategoryChange(null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Statut: {statuses.find(s => s.id === selectedStatus)?.name}
              <button onClick={() => onStatusChange(null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCompany && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              Société: {companies.find(c => c.id === selectedCompany)?.name}
              <button onClick={() => onCompanyChange(null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {showArchived && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
              Équipements archivés inclus
              {onShowArchivedChange && (
                <button onClick={() => onShowArchivedChange(false)}>
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentFilters;
