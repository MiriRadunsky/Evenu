import { useState } from "react";
import { User, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { register } from "../services/auth";
import { GoogleLoginButton } from "../components/shared/GoogleLoginButton";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from "../Utils/validations/RegisterForms.validations";
import { Link } from "react-router-dom";

interface Props {
  onRegister: () => void;
}

export function UserRegisterForm({ onRegister }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreedTerms: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasLowercase: /[a-z]/.test(formData.password),
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // ולידציה בזמן אמת
    let errorMsg = "";
    switch (field) {
      case "name":
        errorMsg = validateName(value as string);
        break;
      case "email":
        errorMsg = validateEmail(value as string);
        break;
      case "phone":
        errorMsg = validatePhone(value as string);
        break;
      case "password":
        errorMsg = validatePassword(value as string);
        // עדכון גם של confirmPassword אם כבר מלא
        if (formData.confirmPassword) {
          setErrors((prev: any) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(value as string, formData.confirmPassword),
          }));
        }
        break;
      case "confirmPassword":
        errorMsg = validateConfirmPassword(formData.password, value as string);
        break;
      case "agreedTerms":
        errorMsg = !(value as boolean) ? "יש לאשר את תנאי השימוש" : "";
        break;
    }

    setErrors((prev: any) => ({ ...prev, [field]: errorMsg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: any = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
      agreedTerms: !formData.agreedTerms ? "יש לאשר את תנאי השימוש" : "",
    };

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const formDataServer = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password   
    }
    try {
      await register(formDataServer, "user");
      onRegister();
    } catch (err: any) {
      setErrors({ general: err?.response?.data?.message || "שגיאה בהרשמה" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-10 border border-gray-100 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl space-y-5"
    >
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <div className="flex items-center justify-center w-20 h-20 shadow-md gradient-gold rounded-3xl">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md -top-1 -left-1">
            <Sparkles className="w-4 h-4 text-[#d4a960]" />
          </div>
        </div>
        <h1 className="text-[#2d2d35] text-3xl font-light">הרשמה למערכת</h1>
      </div>

      {errors.general && <p className="text-red-500 text-sm mb-2">{errors.general}</p>}

      {/* שם */}
      <input
        placeholder="שם מלא"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        className={`w-full h-14 border rounded-2xl px-4 ${errors.name ? "border-red-500" : ""}`}
      />
      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}

      {/* אימייל */}
      <input
        placeholder="example@email.com"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        className={`w-full h-14 border rounded-2xl px-4 ${errors.email ? "border-red-500" : ""}`}
      />
      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}

      {/* טלפון */}
      <input
        placeholder="0501234567"
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        className={`w-full h-14 border rounded-2xl px-4 ${errors.phone ? "border-red-500" : ""}`}
      />
      {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}

      {/* סיסמה */}
      <input
        type="password"
        placeholder="סיסמה"
        value={formData.password}
        onFocus={() => setPasswordFocus(true)}
        onBlur={() => setPasswordFocus(false)}
        onChange={(e) => handleChange("password", e.target.value)}
        className={`w-full h-14 border rounded-2xl px-4 ${errors.password ? "border-red-500" : ""}`}
      />
      {passwordFocus && (
        <div className="text-xs text-orange-500">
          {!passwordRequirements.minLength && <p>לפחות 8 תווים</p>}
          {!passwordRequirements.hasLowercase && <p>לפחות אות קטנה</p>}
          {!passwordRequirements.hasUppercase && <p>לפחות אות גדולה</p>}
          {!passwordRequirements.hasNumber && <p>לפחות מספר</p>}
        </div>
      )}
      {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}

      {/* אימות סיסמה */}
      <input
        type="password"
        placeholder="אימות סיסמה"
        value={formData.confirmPassword}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
        className={`w-full h-14 border rounded-2xl px-4 ${errors.confirmPassword ? "border-red-500" : ""}`}
      />
      {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}

      {/* תנאי שימוש */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={formData.agreedTerms}
          onChange={(e) => handleChange("agreedTerms", e.target.checked)}
          className="mt-1 rounded-lg border-[#cfcfd4] text-[#d4a960] focus:ring-[#d4a960] w-5 h-5"
        />
        <span className="text-[#6d6d78] text-sm leading-relaxed font-light">
          אני מאשר/ת את{" "}
          <Link to="/terms-of-service" className="text-[#d4a960] hover:text-[#c89645]" target="_blank">
            תנאי השימוש
          </Link>{" "}
          ו
          <Link to="/privacy-policy" className="text-[#d4a960] hover:text-[#c89645]" target="_blank">
            מדיניות הפרטיות
          </Link>
        </span>
      </div>
      {errors.agreedTerms && <p className="text-xs text-red-500">{errors.agreedTerms}</p>}

      <Button type="submit" disabled={loading} className="w-full h-14 gradient-gold">
        {loading ? "נרשם..." : "הירשם למערכת"}
      </Button>

      <div className="my-6 text-center">או</div>

      <GoogleLoginButton onSuccess={onRegister} onError={(err) => setErrors({ general: err })} mode="register" />
    </form>
  );
}
