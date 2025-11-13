import { useState } from 'react';
import { Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { login } from '../api/auth';
import { GoogleLoginButton } from '../components/shared/GoogleLoginButton';

interface LoginPageProps {
  onLogin: () => void;
  onNavigate: (page: 'landing' | 'register') => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();
    setError('');
    setLoading(true);


    

    try {
      await login({ email, password });
      onLogin(); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'שגיאה בהתחברות. אנא נסה שוב.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative bg-gradient-to-br from-[#faf8f3] to-white">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-[#d4a960]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#2d2d35]/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-[#6d6d78] hover:text-[#2d2d35] mb-8 transition-colors group font-light"
        >
          <ArrowLeft className="w-5 h-5 transition-transform rotate-180 group-hover:translate-x-1" />
          <span>חזרה לדף הבית</span>
        </button>

        {/* Login Card */}
        <div className="p-10 border border-gray-100 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl">
          <div className="mb-10 text-center">
            <div className="relative inline-block mb-6">
              <div className="flex items-center justify-center w-20 h-20 shadow-md gradient-gold rounded-3xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 opacity-50 gradient-gold rounded-3xl blur-2xl"></div>
            </div>
            <h1 className="text-[#2d2d35] mb-3 text-3xl font-light">התחברות למערכת</h1>
            <p className="text-[#6d6d78] text-base font-light">ברוכים השבים! היכנסו לחשבון שלכם</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-[#fef2f2] border border-[#fca5a5] text-[#ef4444] px-4 py-3 rounded-xl text-sm font-light flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#ef4444] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">!</span>
                </div>
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="email" className="text-[#2d2d35] text-sm font-light block">כתובת אימייל</label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a95] group-focus-within:text-[#d4a960] transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full pr-12 h-14 rounded-2xl border border-[#e3e3e6] focus:border-[#d4a960] focus:ring-2 focus:ring-[#d4a960]/20 bg-white/50 backdrop-blur-sm text-[#2d2d35] transition-all duration-300 outline-none px-4 font-light"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="text-[#2d2d35] text-sm font-light block">סיסמה</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a95] group-focus-within:text-[#d4a960] transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12 h-14 rounded-2xl border border-[#e3e3e6] focus:border-[#d4a960] focus:ring-2 focus:ring-[#d4a960]/20 bg-white/50 backdrop-blur-sm text-[#2d2d35] transition-all duration-300 outline-none px-4 font-light"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded-lg border-[#cfcfd4] text-[#d4a960] focus:ring-[#d4a960] w-5 h-5 transition-all" 
                />
                <span className="text-[#6d6d78] group-hover:text-[#2d2d35] transition-colors text-sm font-light">זכור אותי</span>
              </label>
              <button 
                type="button" 
                className="text-[#d4a960] hover:text-[#c89645] transition-colors text-sm font-light"
              >
                שכחתי סיסמה
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold hover:opacity-90 text-white h-14 rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.02] text-base font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e3e3e6]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-[#6d6d78] font-light">או</span>
            </div>
          </div>

          {/* Google Login Button */}
          <GoogleLoginButton
            onSuccess={onLogin}
            onError={setError}
            mode="login"
          />

          <div className="mt-10 text-center">
            <p className="text-[#6d6d78] font-light">
              עדיין אין לך חשבון?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-[#d4a960] hover:text-[#c89645] transition-colors font-normal"
              >
                הירשם עכשיו
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#d4a960]/20">
            <Lock className="w-4 h-4 text-[#d4a960]" />
            <p className="text-[#6d6d78] text-sm font-light">המערכת מאובטחת ומוגנת בהצפנה מלאה</p>
          </div>
        </div>
      </div>
    </div>
  );
}
