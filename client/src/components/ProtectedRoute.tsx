import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

interface Props {
  children: ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles = [] }: Props) => {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50">
        <div className="rounded-2xl bg-white px-6 py-5 shadow">
          <p className="text-sm text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};