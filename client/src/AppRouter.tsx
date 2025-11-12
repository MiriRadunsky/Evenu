import { Routes, Route, useNavigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import FileUploader from "./components/FileUploader";
import A from "./components/a";

export default function AppRouter() {
  const navigate = useNavigate();

  const handleNavigate = (page: 'landing' | 'login' | 'register') => {
    if (page === 'landing') navigate('/');
    else if (page === 'login') navigate('/login');
    else if (page === 'register') navigate('/register');
  };

  const handleLogin = () => {
    // TODO: Add login logic here
    console.log('User logged in');
    navigate('/dashboard');
  };

  const handleRegister = () => {
    // TODO: Add registration logic here
    console.log('User registered');
    navigate('/dashboard');
  };

  return (
    <Routes>
      {/* <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} /> */}
      {/* <Route path="/" element={ <FileUploader getPresignedUrlEndpoint="http://localhost:3000/api/contracts/upload-url" />} /> */}
      <Route path="/" element={ <A/>} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />} />
      <Route path="/register" element={<RegisterPage onRegister={handleRegister} onNavigate={handleNavigate} />} />
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
    </Routes>
  );
}
