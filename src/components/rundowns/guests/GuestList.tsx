import React from 'react';
import { Trash2, Edit2, User } from 'lucide-react';
import type { Guest, GuestRole } from '../../../types';

interface GuestListProps {
  guests: Guest[];
  onDelete: (guestId: string) => void;
  onEdit: (guest: Guest) => void;
}

const guestRoleLabels: Record<GuestRole, string> = {
  journalist: 'Journaliste',
  expert: 'Expert',
  artist: 'Artiste',
  politician: 'Politique',
  athlete: 'Athlète',
  writer: 'Écrivain',
  scientist: 'Scientifique',
  other: 'Autre',
};

const GuestList: React.FC<GuestListProps> = ({ guests, onDelete, onEdit }) => {
  if (guests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {guests.map((guest) => (
        <div
          key={guest.id}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex-shrink-0">
            {guest.avatar ? (
              <img
                src={guest.avatar}
                alt={guest.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900">{guest.name}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{guestRoleLabels[guest.role]}</span>
              {guest.contact?.email && (
                <span className="text-gray-400">•</span>
              )}
              {guest.contact?.email && (
                <span>{guest.contact.email}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(guest)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Modifier l'invité"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(guest.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              aria-label="Supprimer l'invité"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuestList;