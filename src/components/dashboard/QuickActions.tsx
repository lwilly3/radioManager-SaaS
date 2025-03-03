import React from 'react';
import { Plus, MessageSquare, Bell, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <button 
        onClick={() => navigate('/shows/create')}
        className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
      >
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Plus className="w-5 h-5 text-indigo-600" />
        </div>
        <span className="font-medium">Nouvelle émission</span>
      </button>
      
      <button 
        onClick={() => navigate('/chat')}
        className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
      >
        <div className="p-2 bg-green-50 rounded-lg">
          <MessageSquare className="w-5 h-5 text-green-600" />
        </div>
        <span className="font-medium">Discussion d'équipe</span>
      </button>
      
      <button 
        onClick={() => navigate('/full-program')}
        className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
      >
        <div className="p-2 bg-blue-50 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <span className="font-medium">Planning</span>
      </button>
      
      <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Bell className="w-5 h-5 text-purple-600" />
        </div>
        <span className="font-medium">Notifications</span>
      </button>
    </div>
  );
};

export default QuickActions;