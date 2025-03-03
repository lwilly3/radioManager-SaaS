import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ScheduleItemProps {
  time: string;
  title: string;
  host: string;
  status: 'live' | 'upcoming' | 'completed';
  id?: number;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ time, title, host, status, id }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (id) {
      navigate(`/show-plans/${id}`);
    }
  };
  
  return (
    <div 
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4 ${id ? 'cursor-pointer hover:bg-gray-100' : ''}`}
      onClick={id ? handleClick : undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="text-sm text-gray-600">{time}</div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Animateur: {host}</p>
        </div>
      </div>
      <div>
        {status === 'live' ? (
          <span className="inline-flex px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">
            En direct
          </span>
        ) : status === 'completed' ? (
          <span className="inline-flex px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
            Terminé
          </span>
        ) : (
          <span className="inline-flex px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
            À venir
          </span>
        )}
      </div>
    </div>
  );
};

export default ScheduleItem;