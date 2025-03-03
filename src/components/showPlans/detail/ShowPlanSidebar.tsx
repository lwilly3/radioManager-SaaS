import React from 'react';
import { Users, MessageSquare, Download } from 'lucide-react';
import type { ShowPlan } from '../../../types';
import { generateKey } from '../../../utils/keyGenerator';

interface ShowPlanSidebarProps {
  showPlan: ShowPlan;
}

const ShowPlanSidebar: React.FC<ShowPlanSidebarProps> = ({ showPlan }) => {
  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Actions</h3>
          <div className="space-y-2">
            <button className="w-full btn btn-primary flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Exporter en PDF
            </button>
            <button className="w-full btn btn-secondary flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Ouvrir le chat
            </button>
          </div>
        </div>

        {/* Guests */}
        {showPlan.guests && showPlan.guests.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">
              Invités ({showPlan.guests.length})
            </h3>
            <div className="space-y-2">
              {showPlan.guests.map((guest) => (
                <div
                  key={generateKey(guest.id.toString())}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex-shrink-0">
                    {guest.avatar ? (
                      <img
                        src={guest.avatar}
                        alt={guest.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {guest.name}
                    </p>
                    {guest.contact && guest.contact.email && (
                      <p className="text-xs text-gray-500 truncate">
                        {guest.contact.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">
            Notes techniques
          </h3>
          <textarea
            className="w-full h-32 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ajouter des notes techniques..."
          />
        </div>
      </div>
    </div>
  );
};

export default ShowPlanSidebar;