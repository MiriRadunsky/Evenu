import api from './axios';

export interface AdminStats {
  totalUsers: number;
  totalSuppliers: number;
  pendingSuppliers: number;
  totalEvents: number;
  activeContracts: number;
  totalRevenue: number;
  activeSuppliers: number;
}

export interface PendingSupplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  createdAt: string;
  profileImage?: { url: string; alt?: string } | null;
}

export interface ActiveSupplier {
  _id: string;
  name: string;
  email: string;
  category: string;
  status: 'active' | 'blocked';
  eventsCount: number;
  joinedAt: string;
  profileImage?: { url: string; alt?: string } | null;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get('/dashboard/summaryAdmin');
  return response.data;
};

export const getPendingSuppliers = async (): Promise<PendingSupplier[]> => {
  const response = await api.get('/admin/suppliers/pending');
  return response.data.data;
};

export const getActiveSuppliers = async (): Promise<ActiveSupplier[]> => {
  const response = await api.get('/admin/suppliers/active');
  return response.data.data;
};

export const approveSupplier = async (id: string): Promise<void> => {
  await api.put(`/admin/suppliers/${id}/approve`);
};

export const rejectSupplier = async (id: string): Promise<void> => {
  await api.put(`/admin/suppliers/${id}/reject`);
};

export const blockSupplier = async (id: string): Promise<void> => {
  await api.put(`/admin/suppliers/${id}/block`);
};

export const unblockSupplier = async (id: string): Promise<void> => {
  await api.put(`/admin/suppliers/${id}/unblock`);
};

export interface SupplierDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  status: string;
  description: string;
  regions: string[];
  kashrut: string;
  portfolio: Array<{ url: string; alt?: string }>;
  profileImage: { url: string; alt?: string } | null;
  isActive: boolean;
  eventsCount: number;
  createdAt: string;
  updatedAt: string;
}

export const getSupplierDetails = async (id: string): Promise<SupplierDetails> => {
  const response = await api.get(`/admin/suppliers/${id}`);
  return response.data.data;
};
