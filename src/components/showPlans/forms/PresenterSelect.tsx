import React, { useState } from 'react';
import { usePresenters } from '../../../hooks/presenters/usePresenters';
import { User, Search, X } from 'lucide-react';
import FormField from '../../common/FormField';
import type { Presenter } from '../../../types';
import { generateKey } from '../../../utils/keyGenerator';

interface PresenterSelectProps {
  selectedPresenters: Presenter[];
  onSelectPresenter: (presenter: Presenter) => void;
  onRemovePresenter: (presenterId: string) => void;
  onSetMainPresenter: (presenterId: string) => void;
}

const PresenterSelect: React.FC<PresenterSelectProps> = ({
  selectedPresenters,
  onSelectPresenter,
  onRemovePresenter,
  onSetMainPresenter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: presenters = [], isLoading, error } = usePresenters();

  // Filter presenters based on search query and exclude already selected ones
  const filteredPresenters = presenters
    .filter(presenter => 
      !selectedPresenters.some(selected => selected.id === presenter.id) &&
      (
        presenter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (presenter.contact?.email && presenter.contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );

  return (
    <div className="space-y-4">
      <FormField label="Présentateurs" error={error}>
        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un présentateur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Selected presenters */}
          {selectedPresenters.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Présentateurs sélectionnés</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPresenters.map(presenter => (
                  <div 
                    key={generateKey(presenter.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                      presenter.isMainPresenter 
                        ? 'bg-indigo-50 border-indigo-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {presenter.profilePicture ? (
                        <img
                          src={presenter.profilePicture}
                          alt={presenter.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <span className={`text-sm ${presenter.isMainPresenter ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}>
                        {presenter.name}
                        {presenter.isMainPresenter && (
                          <span className="ml-1 text-xs">(Principal)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSetMainPresenter(presenter.id)}
                        className="text-xs text-gray-500 hover:text-indigo-600"
                        title="Définir comme présentateur principal"
                      >
                        ★
                      </button>
                      <button
                        onClick={() => onRemovePresenter(presenter.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Presenter suggestions */}
          {searchQuery.length > 0 && filteredPresenters.length > 0 && (
            <div className="border rounded-lg overflow-y-auto max-h-48">
              {filteredPresenters.map(presenter => (
                <button
                  key={generateKey(presenter.id)}
                  onClick={() => {
                    onSelectPresenter(presenter);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b last:border-b-0"
                >
                  <div className="flex-shrink-0">
                    {presenter.profilePicture ? (
                      <img
                        src={presenter.profilePicture}
                        alt={presenter.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{presenter.name}</p>
                    {presenter.contact?.email && (
                      <p className="text-sm text-gray-500">{presenter.contact.email}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length > 0 && filteredPresenters.length === 0 && !isLoading && (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Aucun présentateur trouvé</p>
            </div>
          )}
        </div>
      </FormField>
    </div>
  );
};

export default PresenterSelect;