import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import RundownList from '../components/rundowns/RundownList';
import RundownFilters from '../components/rundowns/RundownFilters';
import Notification from '../components/common/Notification';

const Rundowns: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      // Nettoyer l'état de navigation
      window.history.replaceState({}, document.title);
      // Masquer la notification après 3 secondes
      setTimeout(() => setNotification(null), 3000);
    }
  }, [location.state]);

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conducteurs</h1>
          <p className="text-gray-600">Gérez vos émissions et leurs segments</p>
        </div>
        <button 
          onClick={() => navigate('/rundowns/create')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nouveau conducteur
        </button>
      </header>

      <RundownFilters />
      <RundownList />
    </div>
  );
};

export default Rundowns;