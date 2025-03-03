
import React from 'react';
import { Trash2, Edit2, User } from 'lucide-react';
import type { Guest } from '../../../types';

interface GuestListProps {
  guests: Guest[];
  onDelete: (guestId: string) => void;
  onEdit: (guest: Guest) => void;
}

const GuestList: React.FC<GuestListProps> = ({ guests, onDelete, onEdit }) => {
  if (guests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">
        Invités sélectionnés ({guests.length})
      </h3>
      <div className="space-y-2">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {guest.avatar ? (
                  <img
                    src={guest.avatar}
                    alt={guest.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{guest.name}</h4>
                <p className="text-sm text-gray-600">{guest.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(guest)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Modifier l'invité"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(guest.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Retirer l'invité"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestList;
