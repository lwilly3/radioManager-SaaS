import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStatusStore } from '../../store/useStatusStore';
import StatusBadge from './StatusBadge';
import { useWindowSize } from '../../hooks/useWindowSize';

interface StatusTransitionProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  isDisabled?: boolean;
}

// Mapping des noms courts pour mobile
const shortStatusNames: Record<string, string> = {
  'preparation': 'Prép.',
  'attente-diffusion': 'Attente',
  'en-cours': 'Direct',
  'termine': 'Terminé',
  'archive': 'Archive',
};

const StatusTransition: React.FC<StatusTransitionProps> = ({
  currentStatus,
  onStatusChange,
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const getNextStatus = useStatusStore((state) => state.getNextStatus);
  const getStatusById = useStatusStore((state) => state.getStatusById);
  const statuses = useStatusStore((state) => state.statuses);
  const { width } = useWindowSize();
  const isMobile = width < 640; // Breakpoint pour mobile

  // Récupérer le statut actuel
  const currentStatusObj = getStatusById(currentStatus);

  // Récupérer le prochain statut possible
  const nextStatus = getNextStatus(currentStatus);

  // Fonction pour gérer le changement de statut
  const handleStatusChange = (newStatus: string) => {
    if (isDisabled) return;
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  // Fermer le menu déroulant quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {currentStatusObj ? (
          <StatusBadge status={currentStatusObj.name} />
        ) : (
          <StatusBadge status={currentStatus} />
        )}

        {nextStatus && (
          <button
            onClick={() => handleStatusChange(nextStatus.id)}
            disabled={isDisabled}
            className={`text-xs text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isDisabled ? (
              <span className="hidden sm:inline">Changement en cours...</span>
            ) : (
              <>
                <span className="hidden sm:inline">Passer à "{nextStatus.name}"</span>
                <span className="sm:hidden">→ {isMobile ? shortStatusNames[nextStatus.id] || nextStatus.name : nextStatus.name}</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          disabled={isDisabled}
          className={`p-1 text-gray-400 hover:text-gray-600 rounded ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          {statuses.map((status) => (
            <button
              key={status.id}
              onClick={() => handleStatusChange(status.id)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center"
            >
              <StatusBadge status={status.name} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusTransition;