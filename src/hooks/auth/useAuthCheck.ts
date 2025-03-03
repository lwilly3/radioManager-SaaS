import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { isTokenExpired } from '../../utils/auth';

export const useAuthCheck = () => {
  const [isChecking, setIsChecking] = useState(true);
  const { token, logout } = useAuthStore();

  useEffect(() => {
    // Check token validity
    if (token && isTokenExpired(token)) {
      logout();
    }
    setIsChecking(false);
  }, [token, logout]);

  return {
    isAuthenticated: Boolean(token && !isTokenExpired(token)),
    isChecking
  };
};
