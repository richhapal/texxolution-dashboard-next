// slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  name?: string;
  userType: string;
  permissions?: any[];
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } =
  userSlice.actions;
export default userSlice.reducer;
