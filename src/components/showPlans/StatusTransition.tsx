import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStatusStore } from '../../store/useStatusStore';
import StatusBadge from './StatusBadge';

interface StatusTransitionProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  isDisabled?: boolean;
}

const StatusTransition: React.FC<StatusTransitionProps> = ({
  currentStatus,
  onStatusChange,
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const getNextStatus = useStatusStore((state) => state.getNextStatus);
  const getStatusById = useStatusStore((state) => state.getStatusById);
  const statuses = useStatusStore((state) => state.statuses);

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
            className={`text-xs text-indigo-600 hover:text-indigo-700 font-medium ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isDisabled ? 'Changement en cours...' : `Passer à "${nextStatus.name}"`}
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
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
              className="w-full px-3 py-2 text-left hover:bg-gray-50"
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