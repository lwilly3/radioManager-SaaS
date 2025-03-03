import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Mail, Phone, Radio, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Guest } from '../../types';

interface GuestDetailDialogProps {
  guest: Guest;
  isOpen: boolean;
  onClose: () => void;
}

const guestRoleLabels: Record<string, string> = {
  journalist: 'Journaliste',
  expert: 'Expert',
  artist: 'Artiste',
  politician: 'Politique',
  athlete: 'Athlète',
  writer: 'Écrivain',
  scientist: 'Scientifique',
  other: 'Autre',
};

const GuestDetailDialog: React.FC<GuestDetailDialogProps> = ({ guest, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    onClose();
    navigate(`/guests/${guest.id}/edit`, {
      state: { guest }, // Transmission des données
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div className="flex items-center gap-4">
              {guest.avatar ? (
                <img
                  src={guest.avatar}
                  alt={guest.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-600">
                    {guest.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  {guest.name}
                </Dialog.Title>
                <p className="mt-1 text-sm text-gray-600">
                  {guestRoleLabels[guest.role]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg"
                title="Modifier l'invité"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {guest.biography && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Biographie</h3>
                <p className="text-gray-600">{guest.biography}</p>
              </div>
            )}

            {guest.contact && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Contact</h3>
                <div className="space-y-2">
                  {guest.contact.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{guest.contact.email}</span>
                    </div>
                  )}
                  {guest.contact.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{guest.contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Participations</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Radio className="h-4 w-4" />
                <span>12 émissions</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Fermer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default GuestDetailDialog;