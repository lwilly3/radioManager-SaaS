import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Users, Calendar } from 'lucide-react';
import { generateKey } from '../../utils/keyGenerator';

interface ArchiveListProps {
  shows: any[];
  onShowDetail: (show: any) => void;
}

const ArchiveList: React.FC<ArchiveListProps> = ({ shows, onShowDetail }) => {
  return (
    <div className="space-y-2">
      {shows.map((show) => (
        <div
          key={generateKey(show.id)}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-2 mb-1">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {show.title}
                  </h3>
                  <p className="text-sm text-indigo-600 font-medium">
                    {show.emission}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                  {show.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
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
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{show.duration} minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {Array.isArray(show.presenters) 
                      ? show.presenters.map(presenter => presenter.name).join(', ')
                      : 'No Presenters'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onShowDetail(show)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Voir les détails
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArchiveList;