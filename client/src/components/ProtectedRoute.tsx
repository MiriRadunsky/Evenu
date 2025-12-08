import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticatedAsync, getUserRole } from "../services/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user" | "supplier";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(false);

  useEffect(() => {
    const verify = async () => {
      const auth = await isAuthenticatedAsync();
      setIsAuth(auth);

      if (auth && requiredRole) {
        const r = await getUserRole();
        setRole(r);
      }

      setLoading(false);
    };

    verify();
  }, [requiredRole]);

  if (loading) return <div>Loading...</div>;

  // לא מחובר
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // מחובר אבל לא מתאים לו רול
  if (requiredRole && role !== requiredRole) {
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === "supplier") {
      return <Navigate to="/supplier/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
