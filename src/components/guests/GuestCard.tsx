
import React from 'react';
import { User } from 'lucide-react';
import type { Guest } from '../../types';

interface GuestCardProps {
  guest: Guest;
  onSelect: (guest: Guest) => void;
}

const GuestCard: React.FC<GuestCardProps> = ({ guest, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {guest.avatar ? (
            <img
              src={guest.avatar}
              alt={guest.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{guest.name}</h3>
            <p className="text-sm text-gray-600">{guest.role}</p>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {guest.contact?.email && (
            <p className="text-sm text-gray-600 truncate">{guest.contact.email}</p>
          )}
        </div>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <button
          onClick={() => onSelect(guest)}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Voir les détails
        </button>
      </div>
    </div>
  );
};

export default GuestCard;
