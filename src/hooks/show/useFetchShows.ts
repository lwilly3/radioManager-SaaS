// src/hooks/useFetchShows.ts
import { useState, useEffect } from 'react';
import api from '../../api/api'; // Assurez-vous que le chemin est correct

export const useFetchShows = (token:  string | null) => {
  // const [shows, setShows] = useState<Show[]>([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchShows = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/emissions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShows(response.data || []); // Ensure data is always an array
        // setLoading(false);
      } catch (error: any) {
        setError(
          error.response?.data?.message || 'Erreur de récupération des données'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, [token]);

  return { shows, loading, error };
};

// export default useFetchShows;
