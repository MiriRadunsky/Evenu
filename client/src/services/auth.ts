// import { useToken } from "../hooks/useToken";
import { store } from "../store";
import { clearToken, setToken } from "../store/authSlice";
import api from "./axios";

// Interface עבור נתוני משתמש
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Interface עבור תשובת התחברות/הרשמה
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// Interface עבור נתוני התחברות
export interface LoginData {
  email: string;
  password: string;
}

// Interface עבור נתוני הרשמה
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Interface עבור נתוני Google Auth
export interface GoogleAuthData {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

// פונקציית התחברות
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/login", data);
    console.log(response);
     
    // שמירת רק הטוקן ב-localStorage
    if (response.data.token) {
      store.dispatch(setToken(response.data.token));
      // localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error: any) {
    // טיפול בשגיאות
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.status === 401 || error.response?.status === 404) {
      throw new Error("אימייל או סיסמה שגויים");
    }
    throw new Error("שגיאה בהתחברות. אנא נסה שוב.");
  }
};

// פונקציית הרשמה
export const register = async (data: RegisterData,role:string): Promise<AuthResponse> => {
  try {
    console.log("Sending registration data:", data);
    // if(d)
    const route=role==='supplier'?'suppliers/register':'auth/register';
    const response = await api.post(route, data);
    console.log("Server response:", response.data);

    // שמירת רק הטוקן ב-localStorage
    if (response.data.token) {
      console.log("Saving token to localStorage:", response.data.token);
      store.dispatch(setToken(response.data.token));
      // localStorage.setItem("token", response.data.token);
      console.log("Token saved! Check localStorage now.");
    } else {
      console.error("No token in response!", response.data);
    }

    return response.data;
  } catch (error: any) {
    console.error("Registration error:", error);

    // טיפול בשגיאות מהשרת
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // טיפול בשגיאות validation
    if (error.response?.status === 400) {
      throw new Error(
        "נתונים לא תקינים. ודא שהטלפון מתחיל ב-05 והסיסמה מכילה אות גדולה, אות קטנה ומספר."
      );
    }

    if (error.response?.status === 409) {
      throw new Error("משתמש עם אימייל זה כבר קיים במערכת");
    }

    throw new Error("שגיאה בהרשמה. אנא נסה שוב.");
  }
};

// פונקציית התנתקות
export const logout = (): void => {
  store.dispatch(clearToken());

};

export const isAuthenticated = (): boolean => {

  const token = store.getState().auth.token;
  console.log(token);
  if (!token) return false;
  return true;
};

// פונקציית התחברות עם Google
export const googleAuth = async (data: GoogleAuthData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/google', data);
    
    // שמירת הטוקן ב-localStorage
    if (response.data.token) {
      store.dispatch(setToken(response.data.token));
    }
    
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('שגיאה בהתחברות עם Google. אנא נסה שוב.');
  }
};
