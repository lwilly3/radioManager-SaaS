import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { isTokenExpired } from '../../utils/auth';

export const useAuthCheck = () => {
  const [isChecking, setIsChecking] = useState(true);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // Check token validity
    if (token && isTokenExpired(token)) {
      logout();
    }
    setIsChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Ne pas inclure logout pour éviter la boucle infinie

  return {
    isAuthenticated: Boolean(token && !isTokenExpired(token)),
    isChecking
  };
};
