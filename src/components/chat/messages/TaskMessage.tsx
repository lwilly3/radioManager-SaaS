import React from 'react';
import { CheckCircle, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TaskInfo } from '../../../types';

interface TaskMessageProps {
  task: TaskInfo;
}

const TaskMessage: React.FC<TaskMessageProps> = ({ task }) => {
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

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-indigo-600" />
          <h3 className="font-medium">{task.title}</h3>
        </div>
        <span className={`text-sm ${priorityColors[task.priority]}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
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
            <div className="flex -space-x-2">
              {task.assignees.map((assignee, index) => (
                <div
                  key={assignee}
                  className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
                >
                  <span className="text-xs font-medium text-indigo-600">
                    {assignee.charAt(0)}
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

export default TaskMessage;