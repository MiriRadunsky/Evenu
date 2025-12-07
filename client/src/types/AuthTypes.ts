import type { Supplier } from "./Supplier";
import type { User } from "./User";

// סוגי נתונים לרישום
export interface SupplierData {
  category: string;
  regions: string;
  kashrut: string;
  description: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  supplierData?: SupplierData;
}

// תשובת הרשמה
export interface AuthResponse {
  message: string;
  user: User;
  supplier?: Supplier;
  token?: string;
}
