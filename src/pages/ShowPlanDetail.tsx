import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Radio,
  Users,
  Menu,
  X,
  StopCircle,
  Check,
  Quote,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useShowPlanStore } from '../store/useShowPlanStore';
import StatusBadge from '../components/showPlans/StatusBadge';
import DetailedSegmentList from '../components/showPlans/segments/DetailedSegmentList';
import ShowPlanSidebar from '../components/showPlans/detail/ShowPlanSidebar';
import ShowPlanTimer from '../components/showPlans/detail/ShowPlanTimer';
import PresenterBadge from '../components/showPlans/presenters/PresenterBadge';
import { generateKey } from '../utils/keyGenerator';
import { useStatusUpdate } from '../hooks/status/useStatusUpdate';
import { useDashboard } from '../hooks/dashbord/useDashboard';
import PdfGenerator from '../components/common/PdfGenerator';
import { useAuthStore } from '../store/useAuthStore';
import { showsApi } from '../services/api/shows';
import { useQuotesByShowPlan } from '../hooks/quotes/useQuotesByShowPlan';

const ShowPlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { show: locationShowPlan } = location.state || {};
  const { updateStatus, isUpdating } = useStatusUpdate();
  const { dashboardData } = useDashboard();
  const { permissions, token } = useAuthStore();

  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPlan, setShowPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Récupérer les citations de ce conducteur (requête optimisée)
  const { quotes: showPlanQuotes, count: quotesCount, isLoading: quotesLoading } = useQuotesByShowPlan(id);

  // Try to find the show plan from different sources
  useEffect(() => {
    const loadShowPlan = async () => {
      setIsLoading(true);
      setLoadError(null);

      // 1. Essayer depuis location.state
      if (locationShowPlan) {
        setShowPlan(locationShowPlan);
        setIsLoading(false);
        return;
      }

      // 2. Essayer depuis le dashboard
      if (dashboardData?.programme_du_jour) {
        const foundShow = dashboardData.programme_du_jour.find(
          (show: any) => show.id.toString() === id
        );
        if (foundShow) {
          setShowPlan(foundShow);
          setIsLoading(false);
          return;
        }
      }

      // 3. Charger depuis l'API
      if (id && token) {
        try {
          console.log('Chargement conducteur via API, ID:', id);
          const fetchedShowPlan = await showsApi.getById(token, id);
          console.log('Conducteur chargé:', fetchedShowPlan);
          setShowPlan(fetchedShowPlan);
        } catch (error: any) {
          console.error('Erreur chargement conducteur:', error);
          const statusCode = error.response?.status;
          const errorMsg = error.response?.data?.detail || error.message;
          
          if (statusCode === 404) {
            setLoadError(`Le conducteur #${id} n'existe pas ou a été supprimé.`);
          } else if (statusCode === 403) {
            setLoadError(`Vous n'avez pas les droits d'accès au conducteur #${id}.`);
          } else {
            setLoadError(`Erreur lors du chargement (${statusCode || 'réseau'}): ${errorMsg}`);
          }
        }
      } else if (!token) {
        setLoadError('Session expirée. Veuillez vous reconnecter.');
      }
      
      setIsLoading(false);
    };

    loadShowPlan();
  }, [id, locationShowPlan, dashboardData, token]);

  // État de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Chargement du conducteur...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!showPlan) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Chargement du conducteur...</p>
      </div>
    );
  }

  // Ensure segments exist and are an array
  const segments = Array.isArray(showPlan.segments) ? showPlan.segments : [];
  
  const totalDuration = segments.reduce(
    (acc: number, segment: any) => acc + (segment.duration || 0),
    0
  );
  
  // Safely parse the date
  let date;
  try {
    date = new Date(showPlan.broadcast_date || showPlan.date);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      date = new Date(); // Fallback to current date if invalid
    }
  } catch (e) {
    date = new Date(); // Fallback to current date if parsing fails
  }
  
  const endTime = new Date(date.getTime() + totalDuration * 60000);
  const isLive = showPlan.status === 'en-cours';

  // Ensure presenters exist and are an array
  const presenters = Array.isArray(showPlan.presenters) ? showPlan.presenters : [];
  const mainPresenter = presenters.find((p: any) => p.isMainPresenter);
  const otherPresenters = presenters.filter((p: any) => !p.isMainPresenter);

  const handleEndBroadcast = async () => {
    if (!showPlan.id) return;
    
    const success = await updateStatus(showPlan.id.toString(), 'termine');
    if (success) {
      navigate('/show-plans', {
        replace: true,
        state: {
          notification: {
            type: 'success',
            message: 'La diffusion a été terminée avec succès',
          },
        },
      });
    }
  };

  const handleExportSuccess = () => {
    setNotification({
      type: 'success',
      message: 'PDF généré avec succès',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportError = (errorMessage: string) => {
    setNotification({
      type: 'error',
      message: `Erreur lors de l'export: ${errorMessage}`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // Format date safely
  const formatDate = (dateToFormat: Date, formatString: string) => {
    try {
      return format(dateToFormat, formatString, { locale: fr });
    } catch (e) {
      return "Date invalide";
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/show-plans')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Retour aux conducteurs</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Notification */}
              {notification && (
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  notification.type === 'success' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {notification.message}
                </div>
              )}
              
              {/* Bouton Créer Citation */}
              {permissions?.quotes_create && (
                <button
                  onClick={() => navigate('/quotes/create', { 
                    state: { showPlan } 
                  })}
                  className="btn bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                  title="Créer une citation depuis ce conducteur"
                >
                  <Quote className="h-5 w-5" />
                  <span className="hidden sm:inline">Nouvelle citation</span>
                </button>
              )}

              {/* Export PDF Button */}
              <PdfGenerator
                data={showPlan}
                type="showPlan"
                buttonText={isLive ? "Exporter" : "Exporter PDF"}
                onSuccess={handleExportSuccess}
                onError={handleExportError}
              />

              {/* End Broadcast Button */}
              {isLive && (
                <button
                  onClick={handleEndBroadcast}
                  disabled={isUpdating}
                  className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <StopCircle className="h-5 w-5" />
                  {isUpdating ? 'Fin en cours...' : 'Fin de Diffusion'}
                </button>
              )}

              {/* Mobile Sidebar Toggle */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Show Info */}
            <div>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {showPlan.title || "Sans titre"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {formatDate(date, "d MMMM yyyy 'à' HH:mm")}
                      </span>
                      <span className="sm:hidden">
                        {formatDate(date, 'dd/MM/yy HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{totalDuration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Radio className="h-4 w-4" />
                      <span>{segments.length} segments</span>
                    </div>
                    {showPlan.guests && showPlan.guests.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{showPlan.guests.length} invité(s)</span>
                      </div>
                    )}
                    {/* Lien discret vers les citations */}
                    <Link
                      to={`/quotes?showPlanId=${id}`}
                      className={`flex items-center gap-1 transition-colors ${
                        quotesCount > 0 
                          ? 'text-indigo-600 hover:text-indigo-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={quotesCount > 0 ? `Voir les ${quotesCount} citation(s)` : 'Aucune citation'}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{quotesCount} citation{quotesCount !== 1 ? 's' : ''}</span>
                    </Link>
                  </div>
                </div>

                <StatusBadge status={showPlan.status} />
              </div>

              {showPlan.description && (
                <p className="mt-4 text-gray-600">{showPlan.description}</p>
              )}

              {/* Presenters */}
              {presenters.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {mainPresenter && (
                    <PresenterBadge presenter={mainPresenter} isMain />
                  )}
                  {otherPresenters.map((presenter: any) => (
                    <PresenterBadge
                      key={generateKey(presenter.id ? presenter.id.toString() : `presenter-${Math.random()}`)}
                      presenter={presenter}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Timer for live show */}
            {isLive && (
              <ShowPlanTimer
                startTime={date}
                endTime={endTime}
                segments={segments}
                activeSegmentId={activeSegmentId}
              />
            )}

            {/* Segments */}
            <DetailedSegmentList
              segments={segments}
              activeSegmentId={activeSegmentId}
              onSegmentClick={setActiveSegmentId}
              showPlanId={id}
              showPlanTitle={showPlan?.title}
              emissionId={showPlan?.emission_id?.toString()}
              emissionName={showPlan?.emission}
              broadcastDate={showPlan?.date}
            />
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-80 border-l border-gray-200">
        <ShowPlanSidebar showPlan={showPlan} />
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-0 bg-black/30 lg:hidden transition-opacity ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl lg:hidden transform transition-transform ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Détails</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          <ShowPlanSidebar showPlan={showPlan} />
        </div>
      </div>
    </div>
  );
};

export default ShowPlanDetail;