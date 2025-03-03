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

// Mock data pour le développement
const mockDashboardData: DashboardData = {
  emissions_du_jour: 3,
  membres_equipe: 12,
  heures_direct: 24,
  emissions_planifiees: 15,
  en_direct_et_a_venir: 4,
  programme_du_jour: [
    {
      id: 11,
      emission: "emission 1",
      emission_id: 1,
      title: "emission de jeudi",
      type: "news",
      broadcast_date: "2025-02-27T17:35:00",
      duration: 5,
      frequency: "Daily",
      description: "descripton",
      status: "attente-diffusion",
      presenters: [],
      segments: [
        {
          id: 21,
          title: "titre du sujet",
          type: "intro",
          duration: 5,
          description: "description exemple",
          startTime: null,
          position: 1,
          technical_notes: null,
          guests: []
        }
      ],
      animateur: "Aucun animateur principal"
    },
    {
      id: 14,
      emission: "emission 1",
      emission_id: 1,
      title: "La Matinale",
      type: "morning-show",
      broadcast_date: "2025-02-27T08:00:00",
      duration: 120,
      frequency: "Daily",
      description: "Le réveil en douceur avec toute l'actualité du jour",
      status: "en-cours",
      presenters: [
        {
          id: 1,
          name: "Sarah Johnson",
          contact_info: null,
          biography: "Journaliste expérimentée avec 10 ans d'expérience",
          isMainPresenter: true
        }
      ],
      segments: [
        {
          id: 22,
          title: "Les titres de l'actualité",
          type: "intro",
          duration: 15,
          description: "Présentation des principales actualités",
          startTime: null,
          position: 1,
          technical_notes: null,
          guests: []
        }
      ],
      animateur: "Sarah Johnson"
    },
    {
      id: 15,
      emission: "emission 2",
      emission_id: 2,
      title: "Tech Talk",
      type: "talk-show",
      broadcast_date: "2025-02-27T10:00:00",
      duration: 60,
      frequency: "Weekly",
      description: "Toute l'actualité tech et numérique",
      status: "attente-diffusion",
      presenters: [
        {
          id: 2,
          name: "Mike Peters",
          contact_info: null,
          biography: "Expert en technologies",
          isMainPresenter: true
        }
      ],
      segments: [],
      animateur: "Mike Peters"
    },
    {
      id: 16,
      emission: "emission 3",
      emission_id: 3,
      title: "Pause Déjeuner",
      type: "music-show",
      broadcast_date: "2025-02-27T12:00:00",
      duration: 120,
      frequency: "Daily",
      description: "Détente musicale pendant la pause déjeuner",
      status: "attente-diffusion",
      presenters: [
        {
          id: 3,
          name: "DJ Maxwell",
          contact_info: null,
          biography: "DJ et animateur musical",
          isMainPresenter: true
        }
      ],
      segments: [],
      animateur: "DJ Maxwell"
    }
  ]
};

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
        // Commenté pour utiliser les données mock pendant le développement
        // const response = await api.get('/dashboard', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setDashboardData(response.data);
        
        // Utilisation des données mock pour le développement
        // Simuler un délai de chargement
        setTimeout(() => {
          setDashboardData(mockDashboardData);
          setIsLoading(false);
        }, 500);
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