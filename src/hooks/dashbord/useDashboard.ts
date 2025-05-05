import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

// Interface pour typer les données du tableau de bord
interface DashboardData {
  emissions_du_jour: number;
  membres_equipe: number;
  heures_direct: number;
  emissions_planifiees: number;
  en_direct_et_a_venir: number;
  programme_du_jour: ProgrammeItem[];
}

// Interface pour les éléments du programme
interface ProgrammeItem {
  id: number;
  emission: string;
  emission_id: number;
  title: string;
  type: string;
  broadcast_date: string;
  duration: number;
  frequency: string;
  description: string;
  status: string;
  presenters: Presenter[];
  segments: Segment[];
  animateur?: string;
}

interface Presenter {
  id: number;
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}

interface Segment {
  id: number;
  title: string;
  type: string;
  duration: number;
  description: string;
  startTime: string | null;
  position: number;
  technical_notes: string | null;
  guests: any[];
}

export const useDashboard = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore((state) => ({
    token: state.token,
    logout: state.logout
  }));
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) {
        setError("Aucun token d'authentification disponible");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get('dashbord', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.data && typeof response.data === 'object') {
          setDashboardData(response.data as DashboardData);
        } else {
          throw new Error("Réponse de l'API invalide");
        }
      } catch (err: any) {
        console.error(
          'Erreur lors de la récupération des données du tableau de bord:',
          err
        );
        
        // Handle 401 Unauthorized error
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
          setError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setError(
            err.response?.data?.detail ||
            'Erreur lors de la récupération des données'
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [token, navigate, logout]);

  return { dashboardData, isLoading, error };
};