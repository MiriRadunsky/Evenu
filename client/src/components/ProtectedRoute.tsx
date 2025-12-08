import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getUserRole, isAuthenticatedAsync } from '../services/auth';

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
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // בדיקת הרשאה אסינכרונית
  useEffect(() => {
    const verify = async () => {
      const isAuth = await isAuthenticatedAsync();
      if (!isAuth) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      if (requiredRole) {
        const role = await getUserRole();
        setUserRole(role);
      }

      setLoading(false);
    };

    verify();
  }, [requiredRole]);

  // בזמן טעינה
  if (loading) return <div>Loading...</div>;

  // אם לא מחובר — שלח ללוגין
  if (!isAuthenticatedAsync()) {
    return <Navigate to="/login" replace />;
  }

  // אם צריך רול ספציפי והרול לא תואם
  if (requiredRole && userRole && userRole !== requiredRole) {

    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (userRole === 'supplier') {
      return <Navigate to="/supplier/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
