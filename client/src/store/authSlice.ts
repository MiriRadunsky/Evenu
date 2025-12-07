import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/User';
import api from '../services/axios';
import { getErrorMessage } from '@/Utils/error';

interface AuthState {
  token: string | null;
  user:User|null,
  loading:boolean,
  error:string
}

// פונקציה לטעינת המשתמש מ-localStorage
const loadUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  token: localStorage.getItem('token') || null,
  user: loadUserFromStorage(),
  loading:false,
  error:''
  
};
export const fetchUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/users/me");
    
    return data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, "Failed to fetch user"));
  }
})






const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = '';
        // שומר את המשתמש ב-localStorage
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload||"Failed to fetch user";
      })
},
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
