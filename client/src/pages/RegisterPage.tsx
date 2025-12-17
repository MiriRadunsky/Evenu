import { useEffect, useState } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { UserRegisterForm } from "../components/UserRegisterForm";
import { SupplierRegisterForm } from "../components/SupplierRegisterForm";
import { logout } from "../services/auth";

interface RegisterPageProps {
  onRegister: () => void;
  onNavigate: (page: "landing" | "login") => void;
}


export function RegisterPage({ onRegister, onNavigate }: RegisterPageProps) {
  const [role, setRole] = useState<"user" | "supplier">("user");
  useEffect(() => {
    logout();
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-6 sm:py-12 relative bg-gradient-to-br from-[#faf8f3] to-white">
      {/* Logo */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8">
        <img 
          src="/logo.png" 
          alt="Évenu לוגו" 
          className="h-10 sm:h-14 w-auto drop-shadow-md" 
        />
      </div>
      
      {/* Decorative background elements */}
      <div className="hidden sm:block absolute top-20 left-20 w-64 h-64 bg-[#d4a960]/10 rounded-full blur-3xl"></div>
      <div className="hidden sm:block absolute bottom-20 right-20 w-96 h-96 bg-[#2d2d35]/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-[95%] sm:max-w-md mx-auto">
        {/* Back button */}
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 text-[#6d6d78] hover:text-[#2d2d35] mb-4 sm:mb-8 transition-colors group font-light text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
          <span>חזרה לדף הבית</span>
        </button>

        {/* Forms */}
        {role === "user" && <UserRegisterForm onRegister={onRegister} onRoleChange={setRole} currentRole={role} />}
        {role === "supplier" && <SupplierRegisterForm onRegister={onRegister} onRoleChange={setRole} currentRole={role} />}

        {/* Security info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#d4a960]/20">
            <Shield className="w-4 h-4 text-[#d4a960]" />
            <p className="text-[#6d6d78] text-sm font-light">
              הנתונים שלך מאובטחים ומוגנים בהצפנה מלאה
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
