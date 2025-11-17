import type { User } from "./type";

export interface PortfolioItem {
  url: string;
  title?: string;
}

export interface ProfileImage {
  url: string;
  alt?: string;
}

export interface Supplier {
  _id: string;
  user: User; 
  category: {
    _id: string;
    label: string;
  };
  regions: string[];
  kashrut?: string;
  portfolio: PortfolioItem[];
  profileImage?: ProfileImage | null;
  description?: string;
  isActive: boolean;
  status: 'בהמתנה' | 'מאושר' | 'נפסל' | 'נחסם';
  createdAt: string;
  updatedAt: string;
}
