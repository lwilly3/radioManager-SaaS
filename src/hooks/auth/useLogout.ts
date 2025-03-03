
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    // Clear auth state
    logout();
    
    // Redirect to login page
    navigate('/login');
  };

  return handleLogout;
};
