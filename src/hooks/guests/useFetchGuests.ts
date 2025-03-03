import { useState, useEffect } from 'react';
import api from '../../api/api'; // Assurez-vous que le chemin est correct

export const useFetchGuests = (token: string | null) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchGuests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('guests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGuests(response.data);
      } catch (error: any) {
        console.error('Erreur lors de la récupération des invités', error);
        setError(error.response?.data?.message || 'Erreur de récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [token]);

  return { guests, loading, error };
};
