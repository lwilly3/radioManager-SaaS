import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Clock, Users, Calendar, Radio, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import type { Show } from '../../types';

interface ShowDetailDialogProps {
  show: Show;
  isOpen: boolean;
  onClose: () => void;
}

const ShowDetailDialog: React.FC<ShowDetailDialogProps> = ({
  show,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const showTypeLabels: Record<string, string> = {
    'morning-show': 'Matinale',
    news: 'Journal',
    'talk-show': 'Talk-show',
    'music-show': 'Émission musicale',
    cultural: 'Magazine culturel',
    sports: 'Sport',
    documentary: 'Documentaire',
    entertainment: 'Divertissement',
    debate: 'Débat',
    other: 'Autre',
  };

  const frequencyLabels: Record<string, string> = {
    daily: 'Quotidienne',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuelle',
    special: 'Spéciale',
  };

  const handleEdit = () => {
    onClose();
    navigate(`/shows/${show.id}/edit`, {
      state: { show }, // Transmission des données
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div>
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {show.title}
              </Dialog.Title>
              <p className="mt-1 text-sm text-gray-600">
                {showTypeLabels[show.type]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg"
                title="Modifier l'émission"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Durée</span>
                <div className="flex items-center gap-1 text-gray-900">
                  <Clock className="h-4 w-4" />
                  <span>{show.duration} min</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Fréquence</span>
                <div className="flex items-center gap-1 text-gray-900">
                  <Calendar className="h-4 w-4" />
                  <span>{frequencyLabels[show.frequency]}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Présentateurs</span>
                <div className="flex items-center gap-1 text-gray-900">
                  <Users className="h-4 w-4" />
                  <span>{show.presenters?.length || ""}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Créée le</span>
                <div className="flex items-center gap-1 text-gray-900">
                  <Radio className="h-4 w-4" />
                  <span>
                    {format(new Date(show.created_at), 'dd/MM/yyyy', {
                      locale: fr,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Synopsis
              </h3>
              <p className="text-gray-600">{show.synopsis}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-600">{show.description}</p>
            </div>

            {/* {show.presenters.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Présentateurs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {show.presenters.map((presenter) => (
                    <div
                      key={presenter.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {presenter.profilePicture ? (
                        <img
                          src={presenter.profilePicture}
                          alt={presenter.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {presenter.name}
                          {presenter.isMainPresenter && (
                            <span className="ml-2 text-xs text-indigo-600">
                              (Principal)
                            </span>
                          )}
                        </p>
                        {presenter.contact?.email && (
                          <p className="text-sm text-gray-600">
                            {presenter.contact.email}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </div>

          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 rounded-b-lg">
            <button onClick={onClose} className="btn btn-secondary">
              Fermer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ShowDetailDialog;