
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthCheck } from '../../hooks/auth/useAuthCheck';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isChecking } = useAuthCheck();

  // Show nothing while checking authentication
  if (isChecking) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
