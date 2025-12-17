import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/axios";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface RegionsState {
  list: string[];
  loading: boolean;
  error?: string;
}

const initialState: RegionsState = {
  list: [],
  loading: false,
  error: undefined,
};

export const fetchRegions = createAsyncThunk<string[]>(
  "regions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ regions: string[] }>("/regions");
      return data.regions;
    } catch (err: any) {
      return rejectWithValue("שגיאה בטעינת אזורים");
    }
  }
);

const regionsSlice = createSlice({
  name: "regions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchRegions.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "שגיאה בטעינת אזורים";
      });
  },
});

export default regionsSlice.reducer;
