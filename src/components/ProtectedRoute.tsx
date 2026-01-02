import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p className="loading-text">Cargando...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has one of them
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Component for role-based rendering (non-forwarding)
interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGate = ({ children, allowedRoles, fallback = null }: RoleGateProps): React.ReactElement | null => {
  const { profile } = useAuth();

  if (!profile || !allowedRoles.includes(profile.role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
