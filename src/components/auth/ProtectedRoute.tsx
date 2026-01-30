
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthCheck } from '../../hooks/auth/useAuthCheck';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const location = useLocation();
  const { isAuthenticated, isChecking } = useAuthCheck();
  const permissions = useAuthStore((state) => state.permissions);

  // Show nothing while checking authentication
  if (isChecking) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check required permission if specified
  if (requiredPermission && permissions && !permissions[requiredPermission]) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
