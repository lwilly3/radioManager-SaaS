import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { EventInfo } from '../../../types';

interface EventMessageProps {
  event: EventInfo;
}

const EventMessage: React.FC<EventMessageProps> = ({ event }) => {
  if (!event) {
    return (
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-gray-500">Événement invalide ou supprimé</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-5 w-5 text-indigo-600" />
        <h3 className="font-medium">{event.title}</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            {format(new Date(event.startDate), 'dd MMMM yyyy HH:mm', {
              locale: fr,
            })}
            {' - '}
            {format(new Date(event.endDate), 'HH:mm', { locale: fr })}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <div className="flex -space-x-2">
              {event.attendees.map((attendee, index) => (
                <div
                  key={`${attendee}-${index}`}
                  className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
                >
                  <span className="text-xs font-medium text-indigo-600">
                    {attendee.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventMessage;