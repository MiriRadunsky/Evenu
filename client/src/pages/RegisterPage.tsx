import { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowLeft, Sparkles, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { register } from '../api/auth';
import { GoogleLoginButton } from '../components/shared/GoogleLoginButton';

interface RegisterPageProps {
  onRegister: () => void;
  onNavigate: (page: 'landing' | 'login') => void;
}

export function RegisterPage({ onRegister, onNavigate }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    general: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  // בדיקת דרישות הסיסמה
  const getPasswordRequirements = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  };

  const passwordRequirements = getPasswordRequirements(formData.password);

  // פונקציות בדיקה
  const validateName = (name: string) => {
    if (!name) return '';
    if (name.length < 3) return 'שם מלא חייב להכיל לפחות 3 תווים';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'כתובת האימייל אינה תקינה';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return '';
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone)) return 'מספר טלפון חייב להתחיל ב-05 ולהכיל 10 ספרות';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return '';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) return 'הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return '';
    if (confirmPassword !== password) return 'הסיסמאות אינן זהות';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // בדיקת כל השדות
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    // אם יש שגיאות, עצור ותציג אותן
    if (nameError || emailError || phoneError || passwordError || confirmPasswordError) {
      setErrors({
        general: '',
        name: nameError,
        email: emailError,
        phone: phoneError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setLoading(true);

    try {
      const { name, email, phone, password } = formData;
      const response = await register({ name, email, phone, password });
      console.log('Registration successful:', response);
      onRegister(); // מעבר ל-Dashboard
    } catch (err) {
      console.error('Registration error:', err);
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      const errorMessage = error.message || error.response?.data?.message || 'שגיאה בהרשמה. אנא נסה שוב.';
      setErrors({ 
        general: errorMessage,
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative bg-gradient-to-br from-[#faf8f3] to-white">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#d4a960]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#2d2d35]/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-[#6d6d78] hover:text-[#2d2d35] mb-8 transition-colors group font-light"
        >
          <ArrowLeft className="w-5 h-5 transition-transform rotate-180 group-hover:translate-x-1" />
          <span>חזרה לדף הבית</span>
        </button>

        {/* Register Card */}
        <div className="p-10 border border-gray-100 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl">
          <div className="mb-10 text-center">
            <div className="relative inline-block mb-6">
              <div className="flex items-center justify-center w-20 h-20 shadow-md gradient-gold rounded-3xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md -top-1 -left-1">
                <Sparkles className="w-4 h-4 text-[#d4a960]" />
              </div>
              <div className="absolute inset-0 opacity-50 gradient-gold rounded-3xl blur-2xl"></div>
            </div>
            <h1 className="text-[#2d2d35] mb-3 text-3xl font-light">הרשמה למערכת</h1>
            <p className="text-[#6d6d78] text-base font-light">צרו חשבון חדש והתחילו לנהל את האירוע שלכם</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="px-4 py-3 text-sm font-light text-[#ef4444] border border-[#fca5a5] bg-[#fef2f2] rounded-xl flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#ef4444] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">!</span>
                </div>
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-[#2d2d35] text-sm font-light block">שם מלא</label>
              <div className="relative group">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a95] group-focus-within:text-[#d4a960] transition-colors" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      setErrors({ ...errors, name: '' });
                    }
                  }}
                  onBlur={(e) => {
                    const error = validateName(e.target.value);
                    setErrors({ ...errors, name: error });
                  }}
                  placeholder="שם פרטי ומשפחה"
                  className="w-full pr-12 h-14 rounded-2xl border border-[#e3e3e6] focus:border-[#d4a960] focus:ring-2 focus:ring-[#d4a960]/20 bg-white/50 backdrop-blur-sm text-[#2d2d35] transition-all duration-300 outline-none px-4 font-light"
                  required
                />
              </div>
              {errors.name && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                  <p className="text-xs text-[#ef4444] font-light">{errors.name}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-[#2d2d35] text-sm font-light block">כתובת אימייל</label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a95] group-focus-within:text-[#d4a960] transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  onBlur={(e) => {
                    const error = validateEmail(e.target.value);
                    setErrors({ ...errors, email: error });
                  }}
                  placeholder="example@email.com"
                  className="w-full pr-12 h-14 rounded-2xl border border-[#e3e3e6] focus:border-[#d4a960] focus:ring-2 focus:ring-[#d4a960]/20 bg-white/50 backdrop-blur-sm text-[#2d2d35] transition-all duration-300 outline-none px-4 font-light"
                  required
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                  <p className="text-xs text-[#ef4444] font-light">{errors.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-[#2d2d35] text-sm font-light block">מספר טלפון</label>
              <div className="relative group">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a95] group-focus-within:text-[#d4a960] transition-colors" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) {
                      setErrors({ ...errors, phone: '' });
                    }
                  }}
                  onBlur={(e) => {
                    const error = validatePhone(e.target.value);
                    setErrors({ ...errors, phone: error });
                  }}
                  placeholder="0501234567"
                  className="w-full pr-12 h-14 rounded-2xl border border-[#e3e3e6] focus:border-[#d4a960] focus:ring-2 focus:ring-[#d4a960]/20 bg-white/50 backdrop-blur-sm text-[#2d2d35] transition-all duration-300 outline-none px-4 font-light"
                  required
                />
              </div>
              {errors.phone && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                  <p className="text-xs text-[#ef4444] font-light">{errors.phone}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[#2d2d35] text-sm font-light block">סיסמה</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a95] group-focus-within:text-[#d4a960] transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                  }}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={(e) => {
                    setPasswordFocus(false);
                    const error = validatePassword(e.target.value);
                    setErrors({ ...errors, password: error });
                  }}
                  placeholder="••••••••"
                  className="w-full pr-12 h-14 rounded-2xl border border-[#e3e3e6] focus:border-[#d4a960] focus:ring-2 focus:ring-[#d4a960]/20 bg-white/50 backdrop-blur-sm text-[#2d2d35] transition-all duration-300 outline-none px-4 font-light"
                  required
                  minLength={8}
                />
              </div>
              {(passwordFocus || formData.password) && (
                <div className="mt-3 space-y-2">
                  {!passwordRequirements.minLength && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">!</span>
                      </div>
                      <p className="text-xs text-[#f59e0b] font-light">לפחות 8 תווים</p>
                    </div>
                  )}
                  {!passwordRequirements.hasLowercase && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">!</span>
                      </div>
                      <p className="text-xs text-[#f59e0b] font-light">לפחות אות קטנה אחת</p>
                    </div>
                  )}
                  {!passwordRequirements.hasUppercase && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">!</span>
                      </div>
                      <p className="text-xs text-[#f59e0b] font-light">לפחות אות גדולה אחת</p>
                    </div>
                  )}
                  {!passwordRequirements.hasNumber && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">!</span>
                      </div>
                      <p className="text-xs text-[#f59e0b] font-light">לפחות מספר אחד</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-[#2d2d35] text-sm font-light block">אימות סיסמה</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a8a95] group-focus-within:text-[#d4a960] transition-colors" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: '' });
                    }
                  }}
                  onBlur={(e) => {
                    const error = validateConfirmPassword(e.target.value, formData.password);
                    setErrors({ ...errors, confirmPassword: error });
                  }}
                  placeholder="••••••••"
                  className="w-full pr-12 h-14 rounded-2xl border border-[#e3e3e6] focus:border-[#d4a960] focus:ring-2 focus:ring-[#d4a960]/20 bg-white/50 backdrop-blur-sm text-[#2d2d35] transition-all duration-300 outline-none px-4 font-light"
                  required
                />
              </div>
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.confirmPassword === formData.password ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center flex-shrink-0 w-4 h-4 bg-green-500 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs font-light text-green-600">הסיסמאות תואמות</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">!</span>
                      </div>
                      <p className="text-xs text-[#ef4444] font-light">הסיסמאות אינן תואמות</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 rounded-lg border-[#cfcfd4] text-[#d4a960] focus:ring-[#d4a960] w-5 h-5 transition-all flex-shrink-0" 
                required 
              />
              <span className="text-[#6d6d78] text-sm leading-relaxed font-light">
                אני מאשר/ת את{' '}
                <button type="button" className="text-[#d4a960] hover:text-[#c89645] transition-colors">
                  תנאי השימוש
                </button>{' '}
                ו
                <button type="button" className="text-[#d4a960] hover:text-[#c89645] transition-colors">
                  מדיניות הפרטיות
                </button>
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold hover:opacity-90 text-white h-14 rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.02] text-base font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'נרשם...' : 'הירשם למערכת'}
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
            onSuccess={onRegister}
            onError={(err) => setErrors(prev => ({ ...prev, general: err }))}
            mode="register"
          />

          <div className="mt-10 text-center">
            <p className="text-[#6d6d78] font-light">
              כבר יש לך חשבון?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-[#d4a960] hover:text-[#c89645] transition-colors font-normal"
              >
                התחבר כאן
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#d4a960]/20">
            <Shield className="w-4 h-4 text-[#d4a960]" />
            <p className="text-[#6d6d78] text-sm font-light">הנתונים שלך מאובטחים ומוגנים בהצפנה מלאה</p>
          </div>
        </div>
      </div>
    </div>
  );
}
