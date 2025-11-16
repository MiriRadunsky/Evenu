import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isAuthenticated, getUserRole } from '../api/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user' | 'supplier';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  console.log("isAuthenticated:", isAuthenticated());
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole) {
    const userRole = getUserRole();
    console.log("User role:", userRole, "Required role:", requiredRole);
    
    if (userRole !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
