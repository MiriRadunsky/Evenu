export interface User {
  _id: string;
  token: string;
  name: string;
  email: string;
  phone: string;
 role?: "user" | "supplier" | "admin";
   social?: {
    googleId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}