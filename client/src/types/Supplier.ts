import type { User } from "./User";

export interface PortfolioItem {
  images: [{
    key: string;
    title?: string;
  }];
  videos: [{
    key: string;
  }];
}

export interface ProfileImage {
  key: string;
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
  media: PortfolioItem;
  profileImage?: ProfileImage | null;
  description?: string;
  isActive: boolean;
  status: "בהמתנה" | "מאושר" | "נפסל" | "נחסם";
  createdAt: string;
  updatedAt: string;
  // מחיר בסיסי שהספק מציין
  baseBudget?: number;
  // מחירונים מרובים (קבצים ו/או תמונות)
  priceFiles?: Array<{
    key: string;
    originalName?: string;
    contentType?: string;
    uploadedAt?: string;
  }> | null;
}

// export interface SupplierCategory {
//   _id: string;
//   label: string;
// }

// export interface SupplierUser {
//   _id: string;
//   name: string;
//   email: string;
// }

// export interface SupplierImage {
//   key: string;
//   alt: string;
// }

// export interface Supplier {
//   _id: string;
//   user: SupplierUser;
//   category: SupplierCategory;
//   regions: string[];
//   status: 'בהמתנה' | 'מאושר' | 'נפסל' | 'נחסם';
//   profileImage?: SupplierImage | null;
// }
