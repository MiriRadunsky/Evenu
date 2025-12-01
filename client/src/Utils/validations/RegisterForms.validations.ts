export const validateName = (name: string) => {
  if (!name) return "חובה למלא שם מלא";
  if (name.length < 3) return "שם מלא חייב להכיל לפחות 3 תווים";
  return "";
};

export const validateEmail = (email: string) => {
  if (!email) return "חובה למלא אימייל";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) ? "" : "כתובת האימייל אינה תקינה";
};

export const validatePhone = (phone: string) => {
  if (!phone) return "חובה למלא מספר טלפון";
  const regex = /^05\d{8}$/;
  return regex.test(phone) ? "" : "מספר טלפון חייב להתחיל ב-05 ולהכיל 10 ספרות";
};

export const validatePassword = (password: string) => {
  if (!password) return "חובה למלא סיסמה";
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password)
    ? ""
    : "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר";
};

export const validateConfirmPassword = (password: string, confirm: string) => {
  if (!confirm) return "חובה לאשר סיסמה";
  return password === confirm ? "" : "הסיסמאות אינן זהות";
};

export const validateCategory = (category: string) => {
  const validCategories = ["צלם", "להקה", "אולם", "קייטרינג", "עיצוב", "אחר"];
  if (!validCategories.includes(category)) return "לא קיימת קטגוריה זו";
  return "";
};
