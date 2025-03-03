import { useState, useEffect } from 'react';
import { showsApi } from '../../services/api/shows';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocation } from 'react-router-dom';

export const useShows = () => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  const [shows, setShows] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchShows = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        
        // Déterminer quelle API appeler en fonction du chemin
        if (location.pathname.startsWith('/my-show-plans')) {
          response = await showsApi.getAll_Owned(token);
        } else if (location.pathname.startsWith('/show-plans')) {
          response = await showsApi.getAll_production(token);
        }

        setShows(response || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || 'Erreur de récupération des émissions'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [token, location.pathname]);

  return { shows, isLoading, error };
};