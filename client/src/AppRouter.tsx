import { Routes, Route, useNavigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./components/Dashboard";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import Suppliers from "./pages/Suppliers";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function AppRouter() {
  const navigate = useNavigate();

  const handleNavigate = (page: "landing" | "login" | "register") => {
    console.log('handleNavigate', page); 
    if (page === "landing") navigate("/");
    else if (page === "login") navigate("/login");
    else if (page === "register") navigate("/register");
  };

  const handleLogin = () => {
    // TODO: Add login logic here
    console.log("User logged in");
    navigate("/dashboard");
  };

  const handleRegister = () => {
    // TODO: Add registration logic here
    console.log("User registered");
    navigate("/dashboard");
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
    </Routes>
  );
}
