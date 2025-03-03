import React from 'react';
import { Calendar, Clock, Users, Radio, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import ScheduleItem from '../components/dashboard/ScheduleItem';
import LiveShowBanner from '../components/dashboard/LiveShowBanner';
import QuickActions from '../components/dashboard/QuickActions';
import { useDashboard } from '../hooks/dashbord/useDashboard';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { dashboardData, isLoading, error } = useDashboard();
  const navigate = useNavigate();

  // Trouver l'émission en direct (si elle existe)
  const liveShow = dashboardData?.programme_du_jour.find(
    (show: any) => show.status === 'en-cours'
  );

  const handleViewFullProgram = () => {
    navigate('/full-program');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur RadioManager</p>
        </div>
        <button 
          onClick={() => navigate('/shows/create')}
          className="btn btn-primary">
          Créer une émission
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          {/* Live Show Banner */}
          {liveShow && <LiveShowBanner currentShow={liveShow} />}

          {/* Quick Actions */}
          <QuickActions />

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              icon={<Radio className="h-6 w-6 text-indigo-600" />}
              title="Émissions du jour"
              value={dashboardData?.emissions_du_jour.toString() || '0'}
              description="En direct et à venir"
            />
            <StatCard
              icon={<Users className="h-6 w-6 text-green-600" />}
              title="Membres de l'équipe"
              value={(dashboardData?.membres_equipe || 0).toString()}
              description="Actuellement actifs"
            />
            <StatCard
              icon={<Clock className="h-6 w-6 text-blue-600" />}
              title="Heures en direct"
              value={(dashboardData?.heures_direct || 0).toString()}
              description="7 derniers jours"
            />
            <StatCard
              icon={<Calendar className="h-6 w-6 text-purple-600" />}
              title="Émissions planifiées"
              value={dashboardData?.emissions_planifiees.toString() || '0'}
              description="7 prochains jours"
            />
          </div>

          {/* Programme du jour */}
          <section className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Programme du jour
              </h2>
              <button 
                onClick={handleViewFullProgram}
                className="btn btn-secondary flex items-center gap-1"
              >
                Voir le programme complet
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData?.programme_du_jour.map((show: any) => {
                const showDate = new Date(show.broadcast_date);
                const formattedTime = format(showDate, 'HH:mm', { locale: fr });
                const endTime = format(
                  new Date(showDate.getTime() + show.duration * 60000),
                  'HH:mm',
                  { locale: fr }
                );

                return (
                  <ScheduleItem
                    key={show.id}
                    id={show.id}
                    time={`${formattedTime} - ${endTime}`}
                    title={show.title}
                    host={show.animateur || 'Non assigné'}
                    status={
                      show.status === 'en-cours'
                        ? 'live'
                        : show.status === 'termine'
                        ? 'completed'
                        : 'upcoming'
                    }
                  />
                );
              })}
              {(!dashboardData?.programme_du_jour ||
                dashboardData.programme_du_jour.length === 0) && (
                <p className="text-center py-4 text-gray-500">
                  Aucune émission programmée aujourd'hui
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;