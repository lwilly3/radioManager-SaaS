import React from 'react';
import { Radio, Users, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInSeconds } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Presenter {
  id: number;
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}

interface LiveShowProps {
  currentShow: {
    id: number;
    title: string;
    broadcast_date: string;
    duration: number;
    presenters: Presenter[];
    status: string;
  };
}

const LiveShowBanner: React.FC<LiveShowProps> = ({ currentShow }) => {
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = React.useState('00:00:00');
  
  React.useEffect(() => {
    if (!currentShow) return;
    
    const startTime = new Date(currentShow.broadcast_date);
    
    const updateElapsedTime = () => {
      const now = new Date();
      const diffInSeconds = differenceInSeconds(now, startTime);
      
      if (diffInSeconds < 0) return '00:00:00';
      
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;
      
      return [hours, minutes, seconds]
        .map(val => val.toString().padStart(2, '0'))
        .join(':');
    };
    
    setElapsedTime(updateElapsedTime());
    
    const interval = setInterval(() => {
      setElapsedTime(updateElapsedTime());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentShow]);
  
  if (!currentShow || currentShow.status !== 'en-cours') {
    return null;
  }

  const handleViewDetails = () => {
    navigate(`/show-plans/${currentShow.id}`, {
      state: { show: currentShow }
    });
  };

  return (
    <div className="bg-red-50 border border-red-100 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full" />
            <span className="text-red-600 font-medium">EN DIRECT</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{currentShow.title}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{elapsedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>
              {currentShow.presenters.length > 0 
                ? currentShow.presenters.map(p => p.name).join(', ')
                : 'Aucun présentateur'}
            </span>
          </div>
          <button 
            onClick={handleViewDetails}
            className="btn btn-primary flex items-center gap-1"
          >
            Voir le conducteur
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveShowBanner;