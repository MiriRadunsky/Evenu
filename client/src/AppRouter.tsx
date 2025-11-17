import { Routes, Route, useNavigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./components/Dashboard";
import MyEvents from "./pages/MyEvents";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import Suppliers from "./pages/Suppliers";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { PendingSuppliersPage } from "./pages/admin/PendingSuppliersPage";
import { ActiveSuppliersPage } from "./pages/admin/ActiveSuppliersPage";
import { SupplierDetailsPage } from "./pages/admin/SupplierDetailsPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { getUserRole } from "./services/auth";
import Requests from "./pages/Request";

export default function AppRouter() {
  const navigate = useNavigate();

  const handleNavigate = (page: "landing" | "login" | "register") => {
    console.log('handleNavigate', page);
    if (page === "landing") navigate("/");
    else if (page === "login") navigate("/login");
    else if (page === "register") navigate("/register");
  };

  const handleLogin = () => {
    console.log("User logged in");
    
    // בדיקת תפקיד המשתמש והפניה לדשבורד המתאים
    const userRole = getUserRole();
    if (userRole === 'admin') {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleRegister = () => {
    console.log("User registered");
    
    // בדיקת תפקיד המשתמש והפניה לדשבורד המתאים
    const userRole = getUserRole();
    if (userRole === 'admin') {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
      <Route
        path="/login"
        element={<LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />}
      />
      <Route
        path="/register"
        element={<RegisterPage onRegister={handleRegister} onNavigate={handleNavigate} />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>

        }
      />
      <Route
        path="/SuppliersPage"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suppliers />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-events"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MyEvents />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Requests />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pending-suppliers"
        element={
          <ProtectedRoute requiredRole="admin">
            <PendingSuppliersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/active-suppliers"
        element={
          <ProtectedRoute requiredRole="admin">
            <ActiveSuppliersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/suppliers/:id"
        element={
          <ProtectedRoute requiredRole="admin">
            <SupplierDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <UsersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
