import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../api/axios';
import type { SupplierRequest } from '../types/type';

export interface SupplierRequestsState {
  requestsList: SupplierRequest[];
  loading: boolean;
  error?: string;
}

const initialState: SupplierRequestsState = {
  requestsList: [],
  loading: false,
  error: undefined,
};

export const fetchSupplierRequests = createAsyncThunk<SupplierRequest[], { clientEmail?: string } | void>(
  'supplierRequests/fetchAll',
  async (params) => {
    // try to follow existing conventions: server may accept clientEmail query param
    const res = await api.get('/requests', { params });
    // API might return { data: [...] } or raw array
    return (res.data?.data ?? res.data) as SupplierRequest[];
  }
);

const supplierRequestsSlice = createSlice({
  name: 'supplierRequests',
  initialState,
  reducers: {
    clearRequests: (state) => {
      state.requestsList = [];
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplierRequests.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchSupplierRequests.fulfilled, (state, action: PayloadAction<SupplierRequest[]>) => {
        state.loading = false;
        state.requestsList = action.payload;
      })
      .addCase(fetchSupplierRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearRequests } = supplierRequestsSlice.actions;
export default supplierRequestsSlice.reducer;
