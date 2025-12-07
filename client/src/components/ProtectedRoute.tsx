import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isAuthenticated, getUserRole } from '../services/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user' | 'supplier';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole) {
    const userRole = getUserRole();
    
    if (userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on user's actual role
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === 'supplier') {
        return <Navigate to="/supplier/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
}
