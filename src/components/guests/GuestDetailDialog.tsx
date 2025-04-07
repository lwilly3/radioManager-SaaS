import React from 'react';
import { Dialog } from '@headlessui/react';
import {
  X,
  Mail,
  Phone,
  Radio,
  Edit,
  Calendar,
  Briefcase,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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

const GuestDetailDialog: React.FC<GuestDetailDialogProps> = ({
  guest,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    onClose();
    navigate(`/guests/${guest.id}/edit`, {
      state: { guest }, // Transmission des données (id non présent dans l'exemple, supposé disponible)
    });
  };

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b bg-white">
            <div className="flex items-center gap-4 overflow-hidden">
              {guest.avatar ? (
                <img
                  src={guest.avatar}
                  alt={guest.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                </div>
              )}
              <div className="min-w-0">
                <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {guest.name}
                </Dialog.Title>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                    {guestRoleLabels[guest.role] || guest.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
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
            {/* Biographie */}
            {guest.biography && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Biographie
                </h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {guest.biography}
                </p>
              </div>
            )}

            {/* Informations de contact */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Informations de contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {guest.email && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <a
                        href={`mailto:${guest.email}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm truncate block"
                      >
                        {guest.email}
                      </a>
                    </div>
                  </div>
                )}

                {guest.phone && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Téléphone
                      </p>
                      <a
                        href={`tel:${guest.phone}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        {guest.phone}
                      </a>
                    </div>
                  </div>
                )}

                {guest.contact_info && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Autres contacts
                      </p>
                      <p className="text-gray-600 text-sm">
                        {guest.contact_info}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!guest.email && !guest.phone && !guest.contact_info && (
                <p className="text-gray-500 italic">
                  Aucune information de contact disponible
                </p>
              )}
            </div>

            {/* Participations */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Participations
              </h3>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Radio className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Émissions</p>
                  <p className="text-gray-600 text-sm">
                    {guest.appearances.length} participations
                  </p>
                </div>
              </div>
            </div>

            {/* Dernières apparitions */}
            {guest.appearances.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Dernières apparitions
                </h3>
                <div className="space-y-3">
                  {guest.appearances.map((appearance, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {appearance.show_title}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {formatDate(appearance.broadcast_date)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/shows/${appearance.show_id}`)}
                        className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 self-end sm:self-center"
                      >
                        Voir le conducteur
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations supplémentaires (statiques pour l'exemple) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Spécialités */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Spécialités
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Remplacer par des données réelles si disponibles */}
                  {['Expertise générale'].map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Réseaux sociaux (statiques car non fournis dans l'exemple) */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Réseaux sociaux
                  </h4>
                </div>
                <p className="text-gray-500 italic">Non spécifiés</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 rounded-b-lg">
            <button onClick={onClose} className="btn btn-secondary">
              Fermer
            </button>
            <button
              onClick={handleEdit}
              className="btn btn-primary flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Modifier</span>
              <span className="sm:hidden">Éditer</span>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default GuestDetailDialog;
