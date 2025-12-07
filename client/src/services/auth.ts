import { getErrorMessage } from "@/Utils/error";
import { store } from "../store";
import type { AuthResponse, RegisterData } from "../types/AuthTypes";
import api from "./axios";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}



export interface GoogleAuthData {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  }
    
   catch (error: unknown) {   
    throw new Error(getErrorMessage(error,"שגיאה בהתחברות"));
  }
};

// פונקציית הרשמה
export const register = async (
  data: RegisterData & Partial<{ category: string; regions: string; kashrut: string; description: string }>,
  role: string
): Promise<AuthResponse> => {
  try {

    const route = role === "supplier" ? "suppliers/register" : "auth/register";

    const payload =
      role === "supplier"
        ? { ...data, role: "supplier" } 
        : data; 

    const response = await api.post(route, payload);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "שגיאה בהרשמה"));
  }
};



// פונקציית התנתקות
export const logout = async() => {
  await api.post("/auth/logout");

};



// בדיקה סינכרונית - בודק אם יש טוקן
export const isAuthenticated = (): boolean => {
  const state = store.getState();
  return !!state.auth.token;
};

// בדיקה אסינכרונית - אם צריך לוודא מול השרת
export const isAuthenticatedAsync = async (): Promise<boolean> => {
  try {
    await api.get("/users/me"); 
    return true;
  } catch {
    return false;
  }
};

// פונקציה סינכרונית לקבלת תפקיד המשתמש מה-Redux store
export const getUserRole = (): string | null => {
  const state = store.getState();
  return state.auth.user?.role || null;
};

// פונקציה אסינכרונית לקבלת תפקיד המשתמש מהשרת
export const getUserRoleAsync = async () => {
  const res = await api.get("/users/me");  
  return res.data.role;
};

// פונקציית התחברות עם Google
export const googleAuth = async (data: GoogleAuthData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/google', data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error,'שגיאה בהתחברות עם Google. אנא נסה שוב.'))
  }
};
