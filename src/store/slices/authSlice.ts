import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminUser } from '@/types/admin.types';
import { INITIAL_ADMIN_USER } from '@/lib/constants';

interface AuthState {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  currentUser: INITIAL_ADMIN_USER,
  isAuthenticated: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginAdmin: (state, action: PayloadAction<{ email: string }>) => {
      if (state.currentUser) {
        state.currentUser.email = action.payload.email;
      }
      state.isAuthenticated = true;
    },
    logoutAdmin: (state) => {
      state.isAuthenticated = false;
    },
    updateAdminProfile: (state, action: PayloadAction<{ name: string; avatar: string; email: string }>) => {
      if (state.currentUser) {
        state.currentUser.name = action.payload.name;
        state.currentUser.avatar = action.payload.avatar;
        state.currentUser.email = action.payload.email;
      }
    },
    toggleTwoFactor: (state) => {
      if (state.currentUser) {
        state.currentUser.twoFactorEnabled = !state.currentUser.twoFactorEnabled;
      }
    },
  },
});

export const { loginAdmin, logoutAdmin, updateAdminProfile, toggleTwoFactor } = authSlice.actions;
export default authSlice.reducer;
