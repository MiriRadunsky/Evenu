import { useState, useEffect } from "react";
import { User, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { register } from "../services/auth";
import { GoogleLoginButton } from "../components/shared/GoogleLoginButton";
import MediaUploader from "../components/supplier/MediaUploader";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from "../Utils/validations/RegisterForms.validations";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { fetchCategories } from "../store/categoriesSlice";
import type { AppDispatch } from "../store";

interface Props {
  onRegister: () => void;
}

export function SupplierRegisterForm({ onRegister }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    category: "",
    regions: "",
    kashrut: "",
    description: "",
    agreedTerms: false,
  });

  const dispatch = useDispatch();
  const { list: categories, loading: loadingCategories } = useSelector(
    (state: RootState) => state.categories
  );

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasLowercase: /[a-z]/.test(formData.password),
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const validators: any = {
      name: validateName,
      email: validateEmail,
      phone: validatePhone,
      password: validatePassword,
      confirmPassword: (v: string) =>
        validateConfirmPassword(formData.password, v),
    };

    if (validators[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: validators[field](value),
      }));
    }

    if (field === "password") {
      setErrors((prev: any) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(
          value,
          formData.confirmPassword
        ),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      category,
      kashrut,
      regions,
      description,
    } = formData;

    // ולידציות
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirmPassword);    

    if (!formData.agreedTerms) {
      setErrors({ general: "יש לאשר את תנאי השימוש" });
      return;
    }

    if (
      nameError ||
      emailError ||
      phoneError ||
      passwordError ||
      confirmError 
    ) {
      setErrors({
        name: nameError,
        email: emailError,
        phone: phoneError,
        password: passwordError,
        confirmPassword: confirmError,
      });
      return;
    }

    setLoading(true);

    try {
      // הכנה של הנתונים לפי מבנה שהשרת מצפה לו
  

await register(
  {
    name,
    email,
    phone,
    password,   // חובה כאן
    category,
    regions,
    kashrut,
    description
  },
  "supplier"
);

      setStep(2); // עבור ספקים עוברים לשלב הבא
    } catch (err: any) {
      setErrors({
        general: err?.response?.data?.message || "שגיאה בהרשמה",
      });
    } finally {
      setLoading(false);
    }
  };


  if (step === 2) return <MediaUploader onRegister={onRegister} />;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 md:p-10 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl max-w-lg mx-auto space-y-6"
    >
      {/* כותרת ואייקון */}
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className="flex items-center justify-center w-20 h-20 shadow-md gradient-gold rounded-3xl">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-1 -left-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-gray-800">הרשמה כספק</h1>
      </div>

      {errors.general && <p className="text-red-500 text-sm text-center">{errors.general}</p>}

      {/* שם מלא */}
      <div>
        <input
          type="text"
          placeholder="שם מלא"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="w-full px-4 h-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* אימייל */}
      <div>
        <input
          type="email"
          placeholder="example@email.com"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="w-full px-4 h-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      {/* טלפון */}
      <div>
        <input
          type="tel"
          placeholder="0501234567"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className="w-full px-4 h-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>

      {/* סיסמה */}
      <div>
        <input
          type="password"
          placeholder="סיסמה"
          value={formData.password}
          onFocus={() => setPasswordFocus(true)}
          onBlur={() => setPasswordFocus(false)}
          onChange={(e) => updateField("password", e.target.value)}
          className="w-full px-4 h-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {passwordFocus && (
          <div className="text-xs text-orange-500 mt-1 space-y-1">
            {!passwordRequirements.minLength && <p>לפחות 8 תווים</p>}
            {!passwordRequirements.hasLowercase && <p>לפחות אות קטנה</p>}
            {!passwordRequirements.hasUppercase && <p>לפחות אות גדולה</p>}
            {!passwordRequirements.hasNumber && <p>לפחות מספר</p>}
          </div>
        )}
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      {/* אימות סיסמה */}
      <div>
        <input
          type="password"
          placeholder="אימות סיסמה"
          value={formData.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          className="w-full px-4 h-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
      </div>

      {/* קטגוריה */}
      <div>
        {loadingCategories ? (
          <p className="text-gray-500 text-sm">טוען קטגוריות...</p>
        ) : (
          <select
            value={formData.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full h-12 border rounded-xl px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="" disabled hidden>בחר קטגוריה</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.label}
              </option>
            ))}
          </select>
        )}
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </div>

      {/* שדות נוספים */}
      <div>
        <input
          placeholder="אזורי פעילות"
          value={formData.regions}
          onChange={(e) => updateField("regions", e.target.value)}
          className="w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div>
        <input
          placeholder="כשרות"
          value={formData.kashrut}
          onChange={(e) => updateField("kashrut", e.target.value)}
          className="w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div>
        <textarea
          placeholder="תיאור קצר על השירותים שלך"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="w-full px-4 border rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* תנאים */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
          onChange={(e) => updateField("agreedTerms", e.target.checked)}
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          אני מאשר/ת את{" "}
          <Link to="/terms-of-service" className="text-yellow-500 hover:text-yellow-600">
            תנאי השימוש
          </Link>{" "}
          ו
          <Link to="/privacy-policy" className="text-yellow-500 hover:text-yellow-600">
            מדיניות הפרטיות
          </Link>
        </span>
      </div>

      {/* כפתור הרשמה */}
      <Button type="submit" disabled={loading} className="w-full h-14 gradient-gold">
        {loading ? "נרשם..." : "הירשם כספק"}
      </Button>

      {/* או התחברות עם Google */}
      <div className="text-center text-gray-400 my-4">או</div>

      <GoogleLoginButton
        onSuccess={onRegister}
        onError={(err) => setErrors({ general: err })}
        mode="register"
      />
    </form>
  );
}
