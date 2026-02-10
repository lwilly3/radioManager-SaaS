import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
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
  const token = useAuthStore((state) => state.token);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) {
        setError("Aucun token d'authentification disponible");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Appel API réel au backend (endpoint avec typo 'dashbord')
        const response = await api.get('dashbord/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des données');
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  return { dashboardData, isLoading, error };
};