import { useState, useEffect } from "react";
import { User, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import MediaUploader from "../components/supplier/MediaUploader";
import { register } from "../services/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from "../Utils/validations/RegisterForms.validations";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchCategories } from "../store/categoriesSlice";
import { useKashrutList } from "../hooks/useKashrutList";
import { getErrorMessage } from "@/Utils/error";
import { Button } from "./ui/button";
import { useRegionsList } from "@/hooks/use-region";

interface Props {
  onRegister: () => void;
  onRoleChange: (role: "user" | "supplier") => void;
  currentRole: "user" | "supplier";
}

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  category: string;
  regions: string;
  kashrut: string;
  description: string;
  baseBudget: string;
  agreedTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  category?: string;
  general?: string;
}

export function SupplierRegisterForm({ onRegister, onRoleChange, currentRole }: Props) {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    category: "",
    regions: "",
    kashrut: "",
    description: "",
    baseBudget: "",
    agreedTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [kashrutOpen, setKashrutOpen] = useState(false);
  const [kashrutSearch, setKashrutSearch] = useState("");
  const { regionsList, loading: loadingRegions } = useRegionsList();
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [regionsSearch, setRegionsSearch] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { list: categories, loading: loadingCategories } = useSelector(
    (state: RootState) => state.categories
  );
  const { kashrutList, loading: loadingKashrut } = useKashrutList();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasLowercase: /[a-z]/.test(formData.password),
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  };

  const updateField = (field: keyof SupplierFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    const validators: Record<string, (v: string) => string> = {
      name: validateName,
      email: validateEmail,
      phone: validatePhone,
      password: validatePassword,
      confirmPassword: v => validateConfirmPassword(formData.password, v),
    };

    if (typeof value === "string" && validators[field]) {
      setErrors(prev => ({ ...prev, [field]: validators[field](value) }));
    }

    if (field === "password") {
      setErrors(prev => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value as string, formData.confirmPassword),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, phone, password, confirmPassword, category, kashrut, regions, description, baseBudget, agreedTerms } = formData;

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirmPassword);

    if (!agreedTerms) {
      setErrors({ general: "יש לאשר את תנאי השימוש" });
      return;
    }

    if (nameError || emailError || phoneError || passwordError || confirmError) {
      setErrors({ name: nameError, email: emailError, phone: phoneError, password: passwordError, confirmPassword: confirmError });
      return;
    }

    setLoading(true);

    try {
      // הכנה של הנתונים לפי מבנה שהשרת מצפה לו
      // המרת regions ממחרוזת למערך (מפריד לפי פסיק)
      const regionsArray = regions ? regions.split(',').map(r => r.trim()).filter(r => r) : [];

      await register(
        {
          name,
          email,
          phone,
          password,
          category,
          regions: regionsArray,
          kashrut,
          description,
          baseBudget: Number(baseBudget || 0),
        },
        "supplier"
      );

      setStep(2); 
    } catch (err) {
      setErrors({
        general: getErrorMessage(err, "שגיאה בהרשמה"),
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) return <MediaUploader onRegister={onRegister} baseBudget={Number(formData.baseBudget || 0)} />;

  return (
    <form onSubmit={handleSubmit} className="w-full p-4 space-y-3 shadow-xl sm:p-6 md:p-10 bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl sm:space-y-5">
      {/* כותרת ואייקון */}
      <div className="text-center">
        <div className="relative inline-block mb-3 sm:mb-4">
          <div className="flex items-center justify-center w-16 h-16 shadow-md sm:w-20 sm:h-20 gradient-gold rounded-3xl">
            <User className="w-8 h-8 text-white sm:w-10 sm:h-10" />
          </div>
          <div className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-md -top-1 -left-1 sm:w-8 sm:h-8">
            <Sparkles className="w-3 h-3 text-yellow-500 sm:w-4 sm:h-4" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">הרשמה כספק</h1>
      </div>

      {/* Role selection */}
      <div className="flex justify-center gap-2 mb-6 sm:gap-4">
        <button type="button" onClick={() => onRoleChange("user")} className={`flex-1 sm:flex-none sm:px-6 py-2.5 rounded-xl border text-xs sm:text-sm font-light transition-all ${currentRole === "user" ? "bg-[#d4a960] text-white border-[#d4a960] shadow-sm" : "border-[#d4a960] text-[#2d2d35] hover:bg-[#d4a960]/10"}`}>משתמש רגיל</button>
        <button type="button" onClick={() => onRoleChange("supplier")} className={`flex-1 sm:flex-none sm:px-6 py-2.5 rounded-xl border text-xs sm:text-sm font-light transition-all ${currentRole === "supplier" ? "bg-[#d4a960] text-white border-[#d4a960] shadow-sm" : "border-[#d4a960] text-[#2d2d35] hover:bg-[#d4a960]/10"}`}>ספק</button>
      </div>

      {errors.general && <p className="text-sm text-center text-red-500">{errors.general}</p>}

      <div>
        <input type="text" placeholder="שם מלא" value={formData.name} onChange={e => updateField("name", e.target.value)} className="w-full px-4 h-14 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2d2d35]" />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>
      <div>
        <input type="email" placeholder="example@email.com" value={formData.email} onChange={e => updateField("email", e.target.value)} className="w-full px-4 h-14 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2d2d35]" />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>
      <div>
        <input type="tel" placeholder="0501234567" value={formData.phone} onChange={e => updateField("phone", e.target.value)} className="w-full px-4 h-14 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2d2d35]" />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
      </div>
      <div>
        <input type="password" placeholder="סיסמה" value={formData.password} onFocus={() => setPasswordFocus(true)} onBlur={() => setPasswordFocus(false)} onChange={e => updateField("password", e.target.value)} className="w-full px-4 h-14 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2d2d35]" />
        {passwordFocus && (
          <div className="mt-1 text-xs text-orange-500">
            {!passwordRequirements.minLength && <p>לפחות 8 תווים</p>}
            {!passwordRequirements.hasLowercase && <p>לפחות אות קטנה</p>}
            {!passwordRequirements.hasUppercase && <p>לפחות אות גדולה</p>}
            {!passwordRequirements.hasNumber && <p>לפחות מספר</p>}
          </div>
        )}
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>
      <div>
        <input type="password" placeholder="אימות סיסמה" value={formData.confirmPassword} onChange={e => updateField("confirmPassword", e.target.value)} className="w-full px-4 h-14 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2d2d35]" />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>

      {/* קטגוריה */}
      <div>
        {loadingCategories ? (
          <div className="flex items-center w-full h-12 px-3 text-xs text-gray-500 border sm:h-14 rounded-2xl sm:px-4 sm:text-sm">טוען קטגוריות...</div>
        ) : categories.length === 0 ? (
          <div className="flex items-center w-full h-12 px-3 text-xs text-red-500 border sm:h-14 rounded-2xl sm:px-4 sm:text-sm">לא נמצאו קטגוריות.</div>
        ) : (
          <Select value={formData.category} onValueChange={v => updateField("category", v)} required>
            <SelectTrigger className="w-full h-12 sm:h-14 border rounded-2xl px-3 sm:px-4 text-sm sm:text-base focus:ring-2 focus:ring-[#2d2d35]">
              <SelectValue placeholder="בחר קטגוריה" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] sm:max-h-[300px]">
              {categories.map(cat => (
                <SelectItem key={cat._id} value={cat._id} className="text-sm sm:text-base">{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
      </div>

      {/* אזורי פעילות – בחירה מרובה */}
      <div>
        {loadingRegions ? (
          <div className="flex items-center w-full h-12 px-3 text-xs text-gray-500 border sm:h-14 rounded-2xl sm:px-4 sm:text-sm">
            טוען אזורים...
          </div>
        ) : regionsList.length === 0 ? (
          <input
            placeholder="אזורי פעילות"
            value={formData.regions}
            onChange={e => updateField("regions", e.target.value)}
            className="w-full h-14 px-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2d2d35]"
          />
        ) : (
          <Popover open={regionsOpen} onOpenChange={setRegionsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={regionsOpen}
                className="w-full h-12 sm:h-14 border rounded-2xl px-3 sm:px-4 text-sm sm:text-base flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2d2d35]"
              >
                <span className={formData.regions ? "" : "text-gray-400"}>
                  {formData.regions || "בחר אזורי פעילות"}
                </span>
                <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
              </button>
            </PopoverTrigger>

            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
              side="bottom"
            >
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="חפש אזור..."
                  value={regionsSearch}
                  onValueChange={setRegionsSearch}
                  className="h-9"
                />

                <CommandList className="max-h-[200px] sm:max-h-[300px]">
                  <CommandEmpty>לא נמצאו אזורים</CommandEmpty>

                  <CommandGroup>
                    {regionsList
                      .filter(r => !regionsSearch || r.includes(regionsSearch))
                      .map(r => (
                        <CommandItem
                          key={r}
                          value={r}
                          onSelect={() => {
                            updateField("regions", r);
                            setRegionsOpen(false);
                            setRegionsSearch("");
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.regions === r ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {r}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>


      {/* כשרות */}
      <div>
        {loadingKashrut ? (
          <div className="flex items-center w-full h-12 px-3 text-xs text-gray-500 border sm:h-14 rounded-2xl sm:px-4 sm:text-sm">טוען כשרויות...</div>
        ) : kashrutList.length === 0 ? (
          <input placeholder="כשרות" value={formData.kashrut} onChange={e => updateField("kashrut", e.target.value)} className="w-full h-14 px-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2d2d35]" />
        ) : (
          <Popover open={kashrutOpen} onOpenChange={setKashrutOpen}>
            <PopoverTrigger asChild>
              <button type="button" role="combobox" aria-expanded={kashrutOpen} className="w-full h-12 sm:h-14 border rounded-2xl px-3 sm:px-4 text-sm sm:text-base flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2d2d35]">
                <span className={formData.kashrut ? "" : "text-gray-400"}>{formData.kashrut || "בחר כשרות"}</span>
                <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" side="bottom">
              <Command shouldFilter={false}>
                <CommandInput placeholder="חפש כשרות..." value={kashrutSearch} onValueChange={setKashrutSearch} className="h-9" />
                <CommandList className="max-h-[200px] sm:max-h-[300px]">
                  <CommandEmpty>לא נמצאה כשרות</CommandEmpty>
                  <CommandGroup>
                    {kashrutList.filter(k => !kashrutSearch || k.includes(kashrutSearch)).map(k => (
                      <CommandItem key={k} value={k} onSelect={() => { updateField("kashrut", k); setKashrutOpen(false); setKashrutSearch(""); }} className="cursor-pointer">
                        <Check className={cn("mr-2 h-4 w-4", formData.kashrut === k ? "opacity-100" : "opacity-0")} />
                        {k}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <textarea placeholder="תיאור קצר על השירותים שלך" value={formData.description} onChange={e => updateField("description", e.target.value)} className="w-full px-4 py-3 border rounded-2xl h-24 focus:outline-none focus:ring-2 focus:ring-[#2d2d35]" />

      <div>
        <input type="number" placeholder="מחיר בסיסי (₪)" value={formData.baseBudget} onChange={e => updateField("baseBudget", e.target.value)} className="w-full px-4 h-14 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2d2d35]" />
      </div>

      {/* תנאים */}
      <div className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 rounded-lg border-[#cfcfd4] text-[#d4a960] focus:ring-[#d4a960] w-5 h-5 accent-[#d4a960] cursor-pointer" onChange={e => updateField("agreedTerms", e.target.checked)} />
        <span className="text-[#6d6d78] text-sm leading-relaxed font-light">
          מאשר את <Link to="/terms-of-service" className="text-[#d4a960] hover:text-[#c89645]" target="_blank">תנאי השימוש</Link> ו-<Link to="/privacy-policy" className="text-[#d4a960] hover:text-[#c89645]" target="_blank">מדיניות הפרטיות</Link>
        </span>
      </div>

      {/* כפתור הרשמה */}
      <Button type="submit" disabled={loading} className="w-full h-14 bg-[#d4a960] hover:bg-[#c89645] text-white rounded-xl font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
        {loading ? "נרשם..." : "הירשם כספק"}
      </Button>
    </form>
  );
}
