import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isAuthenticated } from '../api/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  console.log("iaathor", isAuthenticated());
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
