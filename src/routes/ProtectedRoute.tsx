import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = useSelector((s: RootState) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
