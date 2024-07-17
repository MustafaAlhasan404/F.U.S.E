import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  jwt: string | null;
  aesKey: string | null;
  role: string | null;
  user: User | null;
}

const initialState: AuthState = {
  jwt: null,
  aesKey: null,
  role: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ jwt: string; role: string; user: User }>) => {
      state.jwt = action.payload.jwt;
      state.role = action.payload.role;
      state.user = action.payload.user;
    },
    setAesKey: (state, action: PayloadAction<{ aesKey: string;}>) => {
      state.aesKey = action.payload.aesKey;
    },
    clearAuthData: (state) => {
      state.jwt = null;
      state.role = null;
      state.user = null;
    },
  },
});

export const { setAuthData, setAesKey, clearAuthData } = authSlice.actions;

export default authSlice.reducer;
