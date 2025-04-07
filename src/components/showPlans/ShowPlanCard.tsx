import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  Radio,
  Calendar,
  ChevronRight,
  Play,
  Edit,
  Trash,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useStatusUpdate } from '../../hooks/status/useStatusUpdate';
import { useDeleteShow } from '../../hooks/shows/useDeleteShow';
import SpinnerButton from '../util/SpinnerButton';
import StatusTransition from './StatusTransition';
import type { ShowPlan, Status } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

interface ShowPlanCardProps {
  showPlan: ShowPlan;
  onStatusChange: (showPlanId: string, newStatus: string) => void;
}

const ShowPlanCard: React.FC<ShowPlanCardProps> = ({
  showPlan,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const { updateStatus, isUpdating } = useStatusUpdate();
  const userPermissions = useAuthStore((state) => state.permissions);
  const { deleteShow, isDeleting, error } = useDeleteShow();

  const handleDelete = async (id: string) => {
    const success = await deleteShow(id);
    if (success) {
      alert('Show supprimé avec succès');
      navigate('/show-plans');
    }
  };

  const totalDuration = showPlan.segments.reduce(
    (acc, segment) => acc + segment.duration,
    0
  );
  const date = new Date(showPlan.date);
  const endTime = new Date(date.getTime() + totalDuration * 60000);
  const isLive = showPlan.status === 'en-cours';

  const handleStatusChange = async (newStatus: string) => {
    const success = await updateStatus(showPlan.id, newStatus);
    if (success) {
      onStatusChange(showPlan.id, newStatus);
    }
  };

  const generateKey = (id: string) =>
    `${id}-${Math.random().toString(36).substr(2, 9)}`;

  const isLocked = !['termine', 'archive', 'en-cours'].includes(
    showPlan.status
  );

  return (
    <div className={`relative ${isLive ? 'live-show-border' : ''}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex justify-end items-start mb-4">
            <div className="flex items-center gap-2">
              {userPermissions?.can_delete_showplan &&
                isLocked &&
                (isDeleting ? (
                  <SpinnerButton />
                ) : (
                  <button
                    onClick={() => handleDelete(showPlan.id)}
                    disabled={isDeleting || isLocked}
                    className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                    aria-label="Modifier le conducteur"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                ))}
              {isLocked && (
                <button
                  onClick={() => {
                    navigate(`/show-plans/${showPlan.id}/edit`, {
                      state: { show: showPlan },
                    });
                  }}
                  className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                  aria-label="Modifier le conducteur"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              {showPlan.status === 'attente-diffusion' && (
                <button
                  onClick={() => handleStatusChange('en-cours')}
                  disabled={isUpdating}
                  className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center"
                  title="Démarrer l'émission"
                >
                  <Play className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {showPlan.emission}
            </h3>
          </div>
          <div className="mt-2">
            <StatusTransition
              currentStatus={showPlan.status}
              onStatusChange={handleStatusChange}
              isDisabled={isUpdating}
            />
          </div>

          <div className="space-y-3 mb-4 mt-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {format(date, "d MMM yyyy 'à' HH:mm", { locale: fr })}
                {' - '}
                {format(endTime, 'HH:mm', { locale: fr })}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{totalDuration} min</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Radio className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{showPlan.segments.length} segments</span>
              </div>
              {showPlan.guests.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{showPlan.guests.length} invité{showPlan.guests.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            {showPlan.title && (
              <div className="line-clamp-1 text-sm text-gray-600">
                {showPlan.title}
              </div>
            )}

            {showPlan.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {showPlan.description}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex -space-x-2">
              {showPlan.guests.slice(0, 3).map((guest) => (
                <div
                  key={generateKey(guest.id)}
                  className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                  title={guest.name}
                >
                  {guest.avatar ? (
                    <img
                      src={guest.avatar}
                      alt={guest.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-gray-600">
                      {guest.name.charAt(0)}
                    </span>
                  )}
                </div>
              ))}
              {showPlan.guests.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{showPlan.guests.length - 3}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() =>
                navigate(`/show-plans/${showPlan.title}`, {
                  state: { show: showPlan },
                })
              }
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <span className="hidden sm:inline">Voir les détails</span>
              <span className="sm:hidden">Détails</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowPlanCard;