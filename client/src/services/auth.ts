import { getErrorMessage } from "@/Utils/error";
import api from "./axios";
import type { AuthResponse, RegisterData } from "../types/AuthTypes";

// -----------------------------
// Interfaces
// -----------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
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



// -----------------------------
// Login
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  }
    
   catch (error: unknown) {   
    throw new Error(getErrorMessage(error,"שגיאה בהתחברות"));
  }
};

// -----------------------------
// Register
// -----------------------------
export const register = async (
  data: RegisterData & Partial<{ category: string; regions: string[]; kashrut: string; description: string ; baseBudget: number }>,
  role: string
): Promise<AuthResponse> => {
  try {
    const route = role === "supplier" ? "/suppliers/register" : "/auth/register";
    // Do not send `role` from the client. The server determines role for supplier registration.
    const payload = data;
    const response = await api.post(route, payload);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "שגיאה בהרשמה"));
  }
};

// -----------------------------
// Logout
// -----------------------------
export const logout = async() => {
  await api.post("/auth/logout");
};



// -----------------------------
// Fetch Current User
// -----------------------------
export const fetchUser = async (): Promise<User> => {
  const res = await api.get("/users/me", { withCredentials: true });
  return res.data;
};

// -----------------------------
// Authentication Checks
// -----------------------------


export const isAuthenticatedAsync = async (): Promise<boolean> => {
  try {
    await api.get("/users/me");
    return true;
  } catch {
    return false;
  }
};

// -----------------------------
// Get User Role
// -----------------------------
export const getUserRole = async () => {
  const res = await api.get("/users/me");  
  return res.data.role;
};


// -----------------------------
// Google Auth
// -----------------------------
export const googleAuth = async (data: GoogleAuthData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/google', data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error,'שגיאה בהתחברות עם Google. אנא נסה שוב.'))
  }
};