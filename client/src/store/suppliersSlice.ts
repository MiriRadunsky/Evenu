import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Supplier } from "../types/Supplier";
import { getErrorMessage } from "@/Utils/error";

export interface SupplierState {
  suppliersList: Supplier[];
  selectedSupplier: Supplier | null;
  loadingList: boolean;
  loadingOne: boolean;
  error?: string;
  // pagination
  page: number;
  total: number;
  limit: number;
  pages: number;
}

export interface SupplierListResponse {
  suppliers: Supplier[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// אפשר, אם תרצי, להחמיר את הטיפוסים פה, אבל זה כבר עדיף על any
export type SupplierFilters = Record<string, string | number | boolean | undefined>;

// --- getAll ---
export const fetchSuppliers = createAsyncThunk<
  SupplierListResponse,
  SupplierFilters | undefined,
  { rejectValue: string }
>("suppliers/fetchAll", async (filters, { rejectWithValue }) => {
  try {
    const { data } = await api.get<SupplierListResponse>("/suppliers", {
      params: filters,
    });
    return data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, "שגיאה בטעינת ספקים"));
  }
});

// --- getOne ---
export const fetchSupplierById = createAsyncThunk<
  Supplier,
  string,
  { rejectValue: string }
>("suppliers/fetchById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ supplier: Supplier }>(
      `/suppliers/${id}`
    );
    console.log("supp",data);
    
    return data.supplier;
  } catch (err: unknown) {
    return rejectWithValue(
      getErrorMessage(err, "שגיאה בטעינת ספק")
    );
  }
});

const initialState: SupplierState = {
  suppliersList: [],
  selectedSupplier: null,
  loadingList: false,
  loadingOne: false,
  error: undefined,
  page: 1,
  total: 0,
  limit: 20,
  pages: 1,
};

const suppliersSlice = createSlice({
  name: "suppliers",
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
        state.error = undefined;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action: PayloadAction<SupplierListResponse>) => {
        state.loadingList = false;
        state.suppliersList = action.payload.suppliers;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
        state.pages = action.payload.pagination.pages;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loadingList = false;
        state.error =
          action.payload ||
          action.error.message ||
          "שגיאה בטעינת ספקים";
      })

      // --- getOne ---
      .addCase(fetchSupplierById.pending, (state) => {
        state.loadingOne = true;
        state.error = undefined;
      })
      .addCase(
        fetchSupplierById.fulfilled,
        (state, action: PayloadAction<Supplier>) => {
          state.loadingOne = false;
          state.selectedSupplier = action.payload;
        }
      )
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.loadingOne = false;
        state.error =
          action.payload ||
          action.error.message ||
          "שגיאה בטעינת ספק";
      });
  },
});

export const { clearSelectedSupplier } = suppliersSlice.actions;
export default suppliersSlice.reducer;
