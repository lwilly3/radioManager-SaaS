import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Clock, Trash2, Users } from 'lucide-react';
import { ShowSegment } from '../../../types';

interface SegmentListProps {
  segments: ShowSegment[];
  onReorder: (segments: ShowSegment[]) => void;
  onDelete: (segmentId: string) => void;
}

const SegmentList: React.FC<SegmentListProps> = ({ segments, onReorder, onDelete }) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(segments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  const getSegmentTypeColor = (type: ShowSegment['type']) => {
    const colors = {
      intro: 'bg-blue-100 text-blue-700',
      interview: 'bg-purple-100 text-purple-700',
      music: 'bg-green-100 text-green-700',
      ad: 'bg-yellow-100 text-yellow-700',
      outro: 'bg-red-100 text-red-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[type];
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="segments">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {segments.map((segment, index) => (
              <Draggable
                key={segment.id}
                draggableId={segment.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="text-gray-400 hover:text-gray-600 touch-manipulation"
                    >
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                          {segment.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSegmentTypeColor(
                            segment.type
                          )}`}
                        >
                          {segment.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{segment.duration} min</span>
                        </div>
                        {segment.guests && segment.guests.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{segment.guests.length}</span>
                          </div>
                        )}
                        {segment.description && (
                          <p className="hidden sm:block truncate">{segment.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDelete(segment.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Supprimer le segment"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SegmentList;