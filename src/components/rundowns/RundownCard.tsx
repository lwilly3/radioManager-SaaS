import React from 'react';
import { Clock, Users, Radio, Calendar, ChevronRight, Play } from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ShowRundown, ShowType, ShowTitle } from '../../types';

interface RundownCardProps {
  rundown: ShowRundown;
}

const showTitleLabels: Record<ShowTitle, string> = {
  'matinale': 'La Matinale',
  'midi-info': 'Midi Info',
  'journal': 'Le Journal',
  'club-sport': 'Club Sport',
  'culture-mag': 'Culture Mag',
  'debat-soir': 'Le Grand Débat du Soir',
  'musique-live': 'Musique Live',
  'interview': "L'Interview",
  'chronique': 'La Chronique',
  'autre': 'Autre',
};

const showTypeLabels: Record<ShowType, string> = {
  'morning-show': 'Matinale',
  'news': 'Journal',
  'talk-show': 'Talk-show',
  'music-show': 'Émission musicale',
  'cultural': 'Magazine culturel',
  'sports': 'Sport',
  'documentary': 'Documentaire',
  'entertainment': 'Divertissement',
  'debate': 'Débat',
  'other': 'Autre',
};

const RundownCard: React.FC<RundownCardProps> = ({ rundown }) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    live: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    draft: 'Brouillon',
    scheduled: 'Planifié',
    live: 'En direct',
    completed: 'Terminé',
  };

  const totalDuration = rundown.segments.reduce((acc, segment) => acc + segment.duration, 0);
  const date = new Date(rundown.date);
  const endTime = new Date(date.getTime() + totalDuration * 60000);

  const isLive = rundown.status === 'live';
  const timeRemaining = isLive ? formatDistance(endTime, new Date(), { locale: fr, addSuffix: true }) : null;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {showTitleLabels[rundown.title]}
              </h3>
              <span className="text-sm text-gray-600">
                ({showTypeLabels[rundown.showType]})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusColors[rundown.status]}`}>
                {statusLabels[rundown.status]}
              </span>
              {isLive && (
                <span className="text-sm text-gray-600">
                  {timeRemaining}
                </span>
              )}
            </div>
          </div>
          {rundown.status === 'scheduled' && (
            <button className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
              <Play className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              {' - '}
              {format(endTime, 'HH:mm', { locale: fr })}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{totalDuration} minutes</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Radio className="h-4 w-4 mr-2" />
              <span>{rundown.segments.length} segments</span>
            </div>
            {rundown.guests.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{rundown.guests.length} invité{rundown.guests.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {rundown.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {rundown.description}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex -space-x-2">
            {rundown.guests.slice(0, 3).map((guest, index) => (
              <div
                key={guest.id}
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
            {rundown.guests.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  +{rundown.guests.length - 3}
                </span>
              </div>
            )}
          </div>

          <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Voir les détails
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RundownCard;