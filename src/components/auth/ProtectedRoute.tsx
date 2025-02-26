import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while loading
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  // Render the children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;