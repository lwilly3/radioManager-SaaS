import React from 'react';
import { ChevronDown, ChevronUp, Clock, Users } from 'lucide-react';
import type { ShowSegment } from '../../../types';
import { generateKey } from '../../../utils/keyGenerator'; // Import de la fonction utilitaire

interface SegmentDetailsProps {
  segment: ShowSegment;
  isExpanded: boolean;
  onToggle: () => void;
  isActive?: boolean;
}

const SegmentDetails: React.FC<SegmentDetailsProps> = ({
  segment,
  isExpanded,
  onToggle,
  isActive = false,
}) => {
  const getSegmentTypeColor = (type: ShowSegment['type']) => {
    const colors = {
      intro: 'bg-blue-100 text-blue-700 border-blue-200',
      interview: 'bg-purple-100 text-purple-700 border-purple-200',
      music: 'bg-green-100 text-green-700 border-green-200',
      ad: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      outro: 'bg-red-100 text-red-700 border-red-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[type] || colors.other;
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        isActive
          ? 'bg-indigo-50 border-indigo-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-medium text-gray-900">
              {segment.title || "Sans titre"}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSegmentTypeColor(
                segment.type || 'other'
              )}`}
            >
              {segment.type || "autre"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{segment.duration || 0} min</span>
            </div>
            {segment.guests && segment.guests.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{segment.guests.length} invité(s)</span>
              </div>
            )}
          </div>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {segment.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Description
              </h4>
              <p className="text-sm text-gray-600">{segment.description}</p>
            </div>
          )}

          {segment.technicalNotes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Notes techniques
              </h4>
              <p className="text-sm text-gray-600">{segment.technicalNotes}</p>
            </div>
          )}

          {segment.guests && segment.guests.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Invités
              </h4>
              <div className="space-y-2">
                {segment.guests.map((guestId) => (
                  <div
                    key={generateKey(guestId ? guestId.toString() : `guest-${Math.random()}`)}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-700">{guestId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SegmentDetails;