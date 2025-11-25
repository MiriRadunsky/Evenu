import { Routes, Route, useNavigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
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
import { getUserRole } from "./api/auth";
import ContractsPage from "./pages/ContractsPage";
import { RequestPage } from "./pages/RequestPage";
import SupplierDashboard from "./pages/Supplier/SupplierDashboard";
import type { AppRoute } from "./types/AppRouter";
import { Calendar, FileText, LayoutDashboard, Send, Store } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import SupplierRequestPage from "./pages/Supplier/SupplierRequestPage";
import SupplierContractsPage from "./pages/Supplier/SupplierContractsPage";

export default function AppRouter() {



 const userRoutes = [
    { title: "לוח בקרה", path: "/dashboard", element: < Dashboard /> ,icon: LayoutDashboard },
    { title: "האירועים שלי", path: "/my-events", element: <MyEvents /> ,icon: Calendar },
    { title: "ספקים", path: "/suppliers", element: <Suppliers />, icon: Store },
    { title: "בקשות", path: "/requests", element: <RequestPage />, icon: Send },
    { title: "חוזים ותשלומים", path: "/contracts-payments", element: <ContractsPage />, icon: FileText },
  ];
 const supplierRoutes = [
    { title: "לוח בקרה ספק", path: "/supplier/dashboard", element: <SupplierDashboard /> ,icon: LayoutDashboard },
    {title: "בקשות", path: "/supplier/requests", element:<SupplierRequestPage /> , icon: Send },
    {title: "חוזים ותשלומים", path: "/supplier/contracts", element: <SupplierContractsPage/>, icon: FileText },
  ];
  //  const adminRoutes = [
  //   { path: "/admin/dashboard", element: <AdminDashboard /> },
  //   { path: "/admin/pending-suppliers", element: <PendingSuppliersPage /> },
  //   { path: "/admin/active-suppliers", element: <ActiveSuppliersPage /> },
  //   { path: "/admin/users", element: <UsersPage /> },
  // ];
  const renderRoutes = (routes:AppRoute[]) =>
    routes.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={
          <ProtectedRoute>
            <AppLayout navigationItems={routes}>{route.element}</AppLayout>
          </ProtectedRoute>
        }
      />
    ));
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
    } else if (userRole === 'supplier') {
      navigate("/supplier/dashboard");
    }
    else {
      navigate("/dashboard");
    }
  };

  const handleRegister = () => {
    console.log("User registered");
     const userRole = getUserRole();
    if (userRole === 'admin') {
      navigate("/admin/dashboard");
    } else if (userRole === 'supplier') {
      navigate("/supplier/dashboard");
    }
    else {
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
      {renderRoutes(userRoutes)}
      {renderRoutes(supplierRoutes)}
      {/* <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardRouter />
            </AppLayout>
          </ProtectedRoute>
              
        }
      />

      <Route
        path="/suppliers"
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
              <RequestPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts-payments"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ContractsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      /> */}

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
