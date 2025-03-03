import React, { useState } from 'react';
import { useStatusStore } from '../../store/useStatusStore';
import StatusBadge from './StatusBadge';
import type { Status } from '../../types';
import { generateKey } from '../../utils/keyGenerator'; // Import de la fonction utilitaire

interface StatusSelectProps {
  selectedStatus: Status | null;
  onStatusSelect: (status: Status) => void;
}

const StatusSelect: React.FC<StatusSelectProps> = ({
  selectedStatus,
  onStatusSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const statuses = useStatusStore((state) => state.statuses);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedStatus ? (
          <StatusBadge status={selectedStatus.name} />
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Sélectionner un statut
          </button>
        )}
        {selectedStatus && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Modifier
          </button>
        )}
      </div>

      {isOpen && (
        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="space-y-1">
            {statuses.map((status) => (
              <button
                key={generateKey(status.id)}
                onClick={() => {
                  onStatusSelect(status);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${
                  selectedStatus?.id === status.id ? 'bg-gray-50' : ''
                }`}
              >
                <StatusBadge status={status.name} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusSelect;
