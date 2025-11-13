import api from "../api/axios";
import type { Supplier } from "../types/Supplier";
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
export interface SupplierState {
  suppliersList: Supplier[];
  selectedSupplier: Supplier | null;
  loadingList: boolean;
  loadingOne: boolean;
  error?: string;
}
export interface SupplierListResponse {
  suppliers: Supplier[];
  pagination: {
    total: number,
    page: number,
    limit: number,
    pages: number
  }
}


// --- getAll ---
export const fetchSuppliers = createAsyncThunk<Supplier[], Record<string, any> | undefined>(
  'suppliers/fetchAll',
  async (filters) => {
    const { data } = await api.get<SupplierListResponse>('/suppliers', { params: filters });
    console.log(data);
    
    return data.suppliers;

  }
);

// --- getOne ---
export const fetchSupplierById = createAsyncThunk<Supplier, string>(
  'suppliers/fetchById',
  async (id) => {
    const { data } = await api.get<{ supplier: Supplier }>(`/suppliers/${id}`);
    return data.supplier;
  }
);

const initialState: SupplierState = {
  suppliersList: [],
  selectedSupplier: null,
  loadingList: false,
  loadingOne: false,
};

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- getAll ---
      .addCase(fetchSuppliers.pending, (state) => {
        state.loadingList = true;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action: PayloadAction<Supplier[]>) => {
        state.loadingList = false;
        state.suppliersList = action.payload;        
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.error.message;
      })

      // --- getOne ---
      .addCase(fetchSupplierById.pending, (state) => {
        state.loadingOne = true;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.loadingOne = false;
        state.selectedSupplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loadingOne = false;
        state.error = action.error.message;
      });
  },
});

export const { clearSelectedSupplier } = suppliersSlice.actions;
export default suppliersSlice.reducer;
