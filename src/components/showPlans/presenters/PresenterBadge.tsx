import React from 'react';
import { User } from 'lucide-react';
import type { Presenter } from '../../../types';

interface PresenterBadgeProps {
  presenter: Presenter;
  isMain?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

const PresenterBadge: React.FC<PresenterBadgeProps> = ({
  presenter,
  isMain,
  onClick,
  onDelete,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
        isMain ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'
      } ${onClick ? 'cursor-pointer hover:bg-opacity-80' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {presenter.profilePicture ? (
          <img
            src={presenter.profilePicture}
            alt={presenter.name}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <div className="truncate">
          <div className={`text-sm ${isMain ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}>
            {presenter.name}
            {isMain && (
              <span className="ml-1 text-xs hidden sm:inline">(Principal)</span>
            )}
          </div>
          {presenter.contact?.email && (
            <div className="text-xs text-gray-500 truncate hidden sm:block">
              {presenter.contact.email}
            </div>
          )}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-1 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Supprimer le présentateur"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default PresenterBadge;