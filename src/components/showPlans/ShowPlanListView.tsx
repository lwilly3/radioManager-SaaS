import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Calendar, Radio, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StatusTransition from './StatusTransition';
import { useDeleteShow } from '../../hooks/shows/useDeleteShow';
import SpinnerButton from '../util/SpinnerButton';
import { useAuthStore } from '../../store/useAuthStore';
import type { ShowPlan } from '../../types';
import { generateKey } from '../../utils/keyGenerator';
import { useStatusUpdate } from '../../hooks/status/useStatusUpdate';


interface ShowPlanListViewProps {
  showPlan: ShowPlan;
  onStatusChange: (showPlanId: string, newStatus: string) => void;
}

const ShowPlanListView: React.FC<ShowPlanListViewProps> = ({
  showPlan,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const { updateStatus, isUpdating } = useStatusUpdate();
  const userPermissions = useAuthStore((state) => state.permissions);
  const { deleteShow, isDeleting } = useDeleteShow();

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

  const isLocked = !['termine', 'archive', 'en-cours'].includes(
    showPlan.status
  );

  return (
    <div className={`relative ${isLive ? 'live-show-border' : ''}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {showPlan.emission}
                </h3>
                <p className="text-sm text-indigo-600 font-medium line-clamp-1">
                  {showPlan.title}
                </p>
              </div>
              <div className="self-start sm:self-center">
                <StatusTransition
                  currentStatus={showPlan.status}
                  onStatusChange={handleStatusChange}
                  isDisabled={isUpdating}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">
                  {format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
                <span className="sm:hidden">
                  {format(date, "dd/MM/yy HH'h'mm", { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{totalDuration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Radio className="h-4 w-4 flex-shrink-0" />
                <span>{showPlan.segments.length}</span>
              </div>
              {showPlan.guests.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {showPlan.guests.length} invité
                    {showPlan.guests.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {showPlan.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2 hidden sm:block">
                {showPlan.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {userPermissions?.can_delete_showplan &&
              isLocked &&
              (isDeleting ? (
                <SpinnerButton />
              ) : (
                <button
                  onClick={() => handleDelete(showPlan.id)}
                  disabled={isDeleting || !isLocked}
                  className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                  aria-label="Supprimer le conducteur"
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
            <button
              onClick={() =>
                navigate(`/show-plans/${showPlan.id}`, {
                  state: { show: showPlan },
                })
              }
              className="btn btn-primary"
            >
              <span className="hidden sm:inline">Voir les détails</span>
              <span className="sm:hidden">Détails</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
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
        </div>
      </div>
    </div>
  );
};

export default ShowPlanListView;