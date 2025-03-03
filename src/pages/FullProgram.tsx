import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Users, Search, Filter } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDashboard } from '../hooks/dashbord/useDashboard';
import { generateKey } from '../utils/keyGenerator';

const FullProgram: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, isLoading, error } = useDashboard();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Generate dates for the week
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  // Filter shows based on selected date and search query
  const filteredShows = dashboardData?.programme_du_jour.filter(show => {
    const showDate = new Date(show.broadcast_date);
    const isSameDate = showDate.toDateString() === selectedDate.toDateString();
    
    if (!isSameDate) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        show.title.toLowerCase().includes(query) ||
        show.emission.toLowerCase().includes(query) ||
        (show.description && show.description.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Retour au tableau de bord</span>
          </button>
        </div>
      </header>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Programme complet</h1>
        <p className="text-gray-600">Consultez le programme de diffusion complet</p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une émission..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Date selector */}
      <div className="flex overflow-x-auto py-2 space-x-2">
        {weekDates.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`px-4 py-2 rounded-lg flex-shrink-0 ${
              date.toDateString() === selectedDate.toDateString()
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="font-medium">
                {format(date, 'EEEE', { locale: fr })}
              </div>
              <div className="text-sm">
                {format(date, 'd MMM', { locale: fr })}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Program list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </h2>
          
          {filteredShows && filteredShows.length > 0 ? (
            <div className="space-y-4">
              {filteredShows.map((show) => {
                const showDate = new Date(show.broadcast_date);
                const endTime = new Date(showDate.getTime() + show.duration * 60000);
                
                return (
                  <div 
                    key={generateKey(show.id.toString())}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{show.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            show.status === 'en-cours' 
                              ? 'bg-red-100 text-red-700' 
                              : show.status === 'termine' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {show.status === 'en-cours' 
                              ? 'En direct' 
                              : show.status === 'termine' 
                              ? 'Terminé'
                              : 'À venir'}
                          </span>
                        </div>
                        <p className="text-sm text-indigo-600 font-medium">{show.emission}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(showDate, 'HH:mm', { locale: fr })} - {format(endTime, 'HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {show.presenters.length > 0 
                              ? show.presenters.map(p => p.name).join(', ')
                              : 'Aucun présentateur'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {show.description && (
                      <p className="mt-2 text-sm text-gray-600">{show.description}</p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/show-plans/${show.id}`)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Voir le conducteur
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                Aucune émission programmée pour cette date
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FullProgram;