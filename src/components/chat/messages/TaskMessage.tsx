import React from 'react';
import { CheckCircle, Clock, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TaskInfo } from '../../../types';
import { usePresenters } from '../../../hooks/presenters/usePresenters';

interface TaskMessageProps {
  task: TaskInfo;
}

const TaskMessage: React.FC<TaskMessageProps> = ({ task }) => {
  const { data: presenters = [] } = usePresenters();

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  const priorityColors = {
    low: 'text-gray-600',
    medium: 'text-orange-600',
    high: 'text-red-600',
  };

  const priorityIcons = {
    low: <AlertCircle className="h-4 w-4 text-gray-600" />,
    medium: <AlertCircle className="h-4 w-4 text-orange-600" />,
    high: <AlertCircle className="h-4 w-4 text-red-600" />,
  };
  //////////////////////////////////////////////// p.id remplace par p.user_id
  const getAssigneeName = (assigneeId: string) => {
    const presenter = presenters.find((p) => p.id === assigneeId);
    return presenter?.name || 'Présentateur inconnu';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-indigo-600" />
          <h3 className="font-medium">{task.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {priorityIcons[task.priority]}
          <span
            className={`text-sm font-medium ${priorityColors[task.priority]}`}
          >
            {task.priority === 'low'
              ? 'Basse'
              : task.priority === 'medium'
              ? 'Moyenne'
              : 'Haute'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[task.status]
            }`}
          >
            {task.status === 'in-progress'
              ? 'En cours'
              : task.status === 'completed'
              ? 'Terminé'
              : 'En attente'}
          </span>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
        )}

        {task.assignees.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <div className="flex flex-wrap gap-1">
              {task.assignees.map((assigneeId) => (
                <span
                  key={assigneeId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                >
                  {getAssigneeName(assigneeId)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskMessage;
