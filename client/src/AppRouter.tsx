import { Routes, Route, useNavigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import MyEvents from "./pages/MyEvents";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import Suppliers from "./pages/Suppliers";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Chat from "./pages/Chat";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { PendingSuppliersPage } from "./pages/admin/PendingSuppliersPage";
import { ActiveSuppliersPage } from "./pages/admin/ActiveSuppliersPage";
import { SupplierDetailsPage } from "./pages/admin/SupplierDetailsPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { getUserRole } from "./services/auth";
import type { AppRoute } from "./types/AppRouter";
import SupplierDashboard from "./pages/Supplier/SupplierDashboard";
import { RequestPage } from "./pages/RequestPage";
import { Calendar, LayoutDashboard, Send, Store ,Wallet,BellIcon,MessageSquare} from "lucide-react";
import SupplierRequestPage from "./pages/Supplier/SupplierRequestPage";
import SupplierContractsPage from "./pages/Supplier/SupplierContractsPage";
import ContractsPage from "./pages/ContractsPage";
import { TermsOfService } from "./pages/TermsOfService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import NotificationsPage from "./pages/NotificationsPage";
import DashboardUser from "./pages/DashboardUser";
import ContractsPaymentsPage from "./pages/ContractsPaymentsPage";
import BudgetManagementPage from "./pages/BudgetManagementPage";
import { useDispatch } from "react-redux";
import { fetchUser } from "./store/authSlice";
import type { AppDispatch } from "./store";
import { useEffect } from "react";

export default function AppRouter() {
  const dispatch: AppDispatch = useDispatch();

  // מעדכן את פרטי המשתמש מהשרת אם יש token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  const userRoutes = [
    { title: "לוח בקרה", path: "/dashboard", element: < DashboardUser />, icon: LayoutDashboard },
    { title: "האירועים שלי", path: "/my-events", element: <MyEvents />, icon: Calendar },
    { title: "ספקים", path: "/suppliers", element: <Suppliers />, icon: Store },
    { title: "בקשות", path: "/requests", element: <RequestPage />, icon: Send },
    {title: "צ'אט", path:"/chat", element: <Chat/>, icon: MessageSquare},
    { title: "חוזים", path: "/contracts-payments", element: <ContractsPage />, icon: Wallet },
    { title: "התראות", path: "/notifications", element: <NotificationsPage />, icon: BellIcon },
    {title:'תשלומים',path:'/payments',element:<ContractsPaymentsPage/>,icon:Wallet},
    {title:'ניהול תקציב',path:'/budget',element:<BudgetManagementPage/>,icon:Wallet}
  ];
  const supplierRoutes = [
    { title: "לוח בקרה ספק", path: "/supplier/dashboard", element: <SupplierDashboard />, icon: LayoutDashboard },
    { title: "בקשות", path: "/supplier/requests", element: <SupplierRequestPage />, icon: Send },
    { title: "חוזים", path: "/supplier/contracts", element: <SupplierContractsPage />, icon: Wallet },
    { title: "צ'אט", path: "/supplier/chat", element: <Chat/>, icon: MessageSquare },
    { title: "התראות", path: "/supplier/notifications", element: <NotificationsPage />, icon: BellIcon },
    {title:'תשלומים',path:'/supplier/payments',element:<ContractsPaymentsPage/>,icon:Wallet},

  ];
  //  const adminRoutes = [
  //   { path: "/admin/dashboard", element: <AdminDashboard /> },
  //   { path: "/admin/pending-suppliers", element: <PendingSuppliersPage /> },
  //   { path: "/admin/active-suppliers", element: <ActiveSuppliersPage /> },
  //   { path: "/admin/users", element: <UsersPage /> },
  // ];
  const renderRoutes = (routes: AppRoute[], requiredRole?: 'admin' | 'user' | 'supplier') =>
    routes.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={
          <ProtectedRoute requiredRole={requiredRole}>
            <AppLayout navigationItems={routes}>{route.element}</AppLayout>
          </ProtectedRoute>
        }
      />
    ));
  const navigate = useNavigate();

  const handleNavigate = (page: "landing" | "login" | "register") => {
    if (page === "landing") navigate("/");
    else if (page === "login") navigate("/login");
    else if (page === "register") navigate("/register");
  };

  const handleLoginAndRegister = async () => {

    
    // טוען את פרטי המשתמש לפני ניווט
    await dispatch(fetchUser());
    
    // מקבל את ה-role מהשרת
    const userRole =  getUserRole();
    
    if (userRole === 'admin') {
      navigate("/admin/dashboard");
    } else if (userRole === 'supplier') {      
      navigate("/supplier/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
      <Route
        path="/login"
        element={<LoginPage onLogin={handleLoginAndRegister} onNavigate={handleNavigate} />}
      />
      <Route
        path="/register"
        element={<RegisterPage onRegister={handleLoginAndRegister} onNavigate={handleNavigate} />}
      />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      {/* Protected Routes */}
      {renderRoutes(userRoutes, 'user')}
      {renderRoutes(supplierRoutes, 'supplier')}
    
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
