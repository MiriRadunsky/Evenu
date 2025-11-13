import { useState } from 'react';
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

type Page = 'landing' | 'login' | 'register' | 'dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleLogin = () => {
    // TODO: Add login logic here
    console.log('User logged in');
    setCurrentPage('dashboard');
  };

  const handleRegister = () => {
    // TODO: Add registration logic here
    console.log('User registered');
    setCurrentPage('dashboard');
  };

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage onNavigate={handleNavigate} />
      )}
      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />
      )}
      {currentPage === 'register' && (
        <RegisterPage onRegister={handleRegister} onNavigate={handleNavigate} />
      )}
      {currentPage === 'dashboard' && (
        <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-3xl font-light">Dashboard - בקרוב!</h1>
        </div>
      )}
      
    </>

  );
}
