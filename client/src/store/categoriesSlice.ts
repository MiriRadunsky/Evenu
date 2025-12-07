import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/axios";

// Thunk לטעינת כל הקטגוריות מהשרת
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories"); // endpoint בשרת
      console.log("Categories response:", response.data);
      
      return response.data; // רשימת קטגוריות
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      return rejectWithValue(err.response?.data || "שגיאה בטעינת הקטגוריות");
    }
  }
);

interface CategoryState {
  list: { _id: string; label: string; isActive: boolean }[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  list: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default categoriesSlice.reducer;
