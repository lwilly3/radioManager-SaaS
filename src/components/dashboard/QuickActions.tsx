import React from 'react';
import { MessageSquare, Bell, Calendar, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../../store/useTaskStore';
import { useAuthStore } from '../../store/useAuthStore';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const { user, permissions } = useAuthStore();
  
  // Count tasks assigned to current user
  const assignedTasksCount = tasks.filter(task => 
    task.assignees.includes(user?.id || '') && 
    task.status !== 'completed'
  ).length;


  // Vérifier les permissions (valeurs par défaut à false si non définies)
  const canAccessTasks = permissions?.can_view_tasks ?? false;
  const canAccessChat = permissions?.can_view_messages ?? false;
  const canAccessProgram = permissions?.can_acces_showplan_section ?? false;
  const canAccessNotifications = permissions?.can_view_notifications ?? false;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <button
        onClick={() => canAccessTasks && navigate('/tasks')} // Désactive la navigation si pas de permission
        className={`flex items-center gap-3 p-4 bg-white rounded-lg shadow transition-colors ${
          canAccessTasks ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
        }`}
        disabled={!canAccessTasks} // Désactive le bouton
        title={!canAccessTasks ? "Vous n'avez pas la permission d'accéder aux tâches" : undefined}
      >
        <div className="p-2 bg-indigo-50 rounded-lg">
          <CheckSquare className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex flex-col items-start">
          <span className="font-medium">Mes tâches</span>
          <span className="text-sm text-gray-500">{assignedTasksCount} en attente</span>
        </div>
      </button>

      <button
        onClick={() => canAccessChat && navigate('/chat')}
        className={`flex items-center gap-3 p-4 bg-white rounded-lg shadow transition-colors ${
          canAccessChat ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
        }`}
        disabled={!canAccessChat}
        title={!canAccessChat ? "Vous n'avez pas la permission d'accéder au chat" : undefined}
      >
        <div className="p-2 bg-green-50 rounded-lg">
          <MessageSquare className="w-5 h-5 text-green-600" />
        </div>
        <span className="font-medium">Discussion d'équipe</span>
      </button>

      <button
        onClick={() => canAccessProgram && navigate('/full-program')}
        className={`flex items-center gap-3 p-4 bg-white rounded-lg shadow transition-colors ${
          canAccessProgram ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
        }`}
        disabled={!canAccessProgram}
        title={!canAccessProgram ? "Vous n'avez pas la permission d'accéder au planning" : undefined}
      >
        <div className="p-2 bg-blue-50 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <span className="font-medium">Planning</span>
      </button>

      <button
        onClick={() => canAccessNotifications && console.log('Notifications clicked')} // À remplacer par une navigation si nécessaire
        className={`flex items-center gap-3 p-4 bg-white rounded-lg shadow transition-colors ${
          canAccessNotifications ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
        }`}
        disabled={!canAccessNotifications}
        title={
          !canAccessNotifications
            ? "Vous n'avez pas la permission d'accéder aux notifications"
            : undefined
        }
      >
        <div className="p-2 bg-purple-50 rounded-lg">
          <Bell className="w-5 h-5 text-purple-600" />
        </div>
        <span className="font-medium">Notifications</span>
      </button>
    </div>
  );
};

export default QuickActions;