import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import {
  X,
  Clock,
  Users,
  Calendar,
  Radio,
  Check,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateKey } from '../../utils/keyGenerator';
import PdfGenerator from '../common/PdfGenerator';

interface Presenter {
  id: number;
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}

interface Show {
  id: string;
  emission: string;
  title: string;
  broadcast_date: string;
  duration: number;
  presenters: Presenter[];
  status: string;
  description?: string;
  guests?: { id: number; name: string; role: string; avatar?: string | null }[];
  segments?: {
    id: number;
    title: string;
    type: string;
    duration: number;
    description?: string;
    guests?: {
      id: number;
      name: string;
      role: string;
      avatar?: string | null;
    }[];
    technical_notes?: string | null;
  }[];
}

interface ArchiveDetailDialogProps {
  show: Show;
  isOpen: boolean;
  onClose: () => void;
}

const ArchiveDetailDialog: React.FC<ArchiveDetailDialogProps> = ({
  show,
  isOpen,
  onClose,
}) => {
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(
    new Set()
  );
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const toggleSegment = (index: number) => {
    setExpandedSegments((prev) => {
      const next = new Set(prev);
      if (next.has(index.toString())) {
        next.delete(index.toString());
      } else {
        next.add(index.toString());
      }
      return next;
    });
  };

  const handleExportSuccess = () => {
    setNotification({
      type: 'success',
      message: 'PDF généré avec succès',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportError = (errorMessage: string) => {
    setNotification({
      type: 'error',
      message: `Erreur lors de l'export: ${errorMessage}`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
            <div>
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {show.title}
              </Dialog.Title>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-indigo-600 font-medium">
                  {show.emission}
                </p>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                  {show.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PdfGenerator 
                data={show}
                type="archive"
                buttonText=""
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg"
                onSuccess={handleExportSuccess}
                onError={handleExportError}
              />
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {notification && (
            <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {notification.type === 'success' ? (
                <Check className="h-5 w-5 flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 flex-shrink-0" />
              )}
              <p>{notification.message}</p>
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-6">
            {/* Informations de diffusion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Diffusion
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(
                        new Date(show.broadcast_date),
                        'dd MMMM yyyy à HH:mm',
                        {
                          locale: fr,
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{show.duration} minutes</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Équipe
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {show.presenters.length > 0
                        ? show.presenters.map((p) => p.name).join(', ')
                        : 'Aucun présentateur'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {show.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600">{show.description}</p>
              </div>
            )}

            {/* Présentateurs */}
            {show.presenters && show.presenters.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Présentateurs ({show.presenters.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {show.presenters.map((presenter) => (
                    <div
                      key={generateKey(presenter.id.toString())}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {presenter.name}
                          {presenter.isMainPresenter && (
                            <span className="ml-2 text-xs text-indigo-600 font-medium">
                              (Principal)
                            </span>
                          )}
                        </h4>
                        {presenter.biography && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {presenter.biography}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des invités */}
            {show.guests && show.guests.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Invités ({show.guests.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {show.guests.map((guest) => (
                    <div
                      key={generateKey(guest.id)}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        {guest.avatar ? (
                          <img
                            src={guest.avatar}
                            alt={guest.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {guest.name}
                        </h4>
                        <p className="text-sm text-gray-600">{guest.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Segments */}
            {show.segments && show.segments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Segments ({show.segments.length})
                </h3>
                <div className="space-y-3">
                  {show.segments.map((segment, index) => (
                    <div
                      key={segment.id || index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSegment(index)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">
                                {segment.title}
                              </h4>
                              {segment.guests && segment.guests.length > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 rounded text-xs font-medium text-indigo-600">
                                  <Users className="h-3 w-3" />
                                  <span>{segment.guests.length}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{segment.duration} min</span>
                              <span className="text-gray-400">•</span>
                              <span className="capitalize">{segment.type}</span>
                            </div>
                          </div>
                        </div>
                        {expandedSegments.has(index.toString()) ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>

                      {expandedSegments.has(index.toString()) && (
                        <div className="p-3 border-t border-gray-200">
                          {segment.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {segment.description}
                            </p>
                          )}

                          {segment.guests && segment.guests.length > 0 && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                Invités du segment
                              </h5>
                              <div className="space-y-2">
                                {segment.guests.map((guest) => (
                                  <div
                                    key={guest.id}
                                    className="flex items-center gap-2 p-2 bg-white rounded border border-gray-100"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      {guest.avatar ? (
                                        <img
                                          src={guest.avatar}
                                          alt={guest.name}
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        <User className="w-4 h-4 text-gray-500" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {guest.name}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {guest.role}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {segment.technical_notes && (
                            <div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-700 mb-1">
                                Notes techniques
                              </h5>
                              <p className="text-sm text-gray-600">
                                {segment.technical_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 rounded-b-lg">
            <PdfGenerator 
              data={show}
              type="archive"
              buttonText="Exporter en PDF"
              onSuccess={handleExportSuccess}
              onError={handleExportError}
            />
            <button onClick={onClose} className="btn btn-secondary">
              Fermer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ArchiveDetailDialog;