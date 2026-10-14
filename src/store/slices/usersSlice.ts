import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MarketplaceUser, UserStatus } from '@/types/admin.types';
import { INITIAL_USERS } from '@/lib/constants';

interface UsersState {
  users: MarketplaceUser[];
  searchQuery: string;
  roleFilter: 'all' | 'creator' | 'brand';
  statusFilter: 'all' | UserStatus;
  selectedUserId: string | null;
}

const loadSavedUsers = (): MarketplaceUser[] => {
  try {
    const raw = localStorage.getItem('influverse_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_USERS;
};

const saveUsers = (users: MarketplaceUser[]) => {
  try {
    localStorage.setItem('influverse_users', JSON.stringify(users));
  } catch (e) {
    // ignore
  }
};

const initialState: UsersState = {
  users: loadSavedUsers(),
  searchQuery: '',
  roleFilter: 'all',
  statusFilter: 'all',
  selectedUserId: null,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setRoleFilter: (state, action: PayloadAction<'all' | 'creator' | 'brand'>) => {
      state.roleFilter = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<'all' | UserStatus>) => {
      state.statusFilter = action.payload;
    },
    setSelectedUserId: (state, action: PayloadAction<string | null>) => {
      state.selectedUserId = action.payload;
    },
    banOrSuspendUser: (
      state,
      action: PayloadAction<{
        userId: string;
        actionType: 'warning' | 'temporary' | 'permanent';
        reason: string;
        escrowDisposition?: 'refund' | 'hold';
        notes?: string;
      }>
    ) => {
      const user = state.users.find((u) => u.id === action.payload.userId);
      if (user) {
        user.status = 'suspended';
        user.banActionType = action.payload.actionType;
        user.banReason = action.payload.reason;
        user.escrowDisposition = action.payload.escrowDisposition || 'hold';
        user.notes = action.payload.notes;
        saveUsers(state.users);
      }
    },
    reactivateUser: (state, action: PayloadAction<string>) => {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) {
        user.status = 'active';
        user.banActionType = undefined;
        user.banReason = undefined;
        user.escrowDisposition = undefined;
        saveUsers(state.users);
      }
    },
    addUser: (state, action: PayloadAction<MarketplaceUser>) => {
      state.users.unshift(action.payload);
      saveUsers(state.users);
    },
    updateUser: (state, action: PayloadAction<MarketplaceUser>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
        saveUsers(state.users);
      }
    },
    setCreatorVerified: (
      state,
      action: PayloadAction<{ handle?: string; creatorId?: string; isVerified: boolean }>
    ) => {
      const user = state.users.find(
        (u) =>
          (action.payload.creatorId && u.id === action.payload.creatorId) ||
          (action.payload.handle &&
            u.handle.toLowerCase().replace('@', '') ===
              action.payload.handle.toLowerCase().replace('@', ''))
      );
      if (user) {
        user.isVerified = action.payload.isVerified;
        if (action.payload.isVerified && user.status === 'pending_verification') {
          user.status = 'active';
        }
        saveUsers(state.users);
      }
    },
  },
});

export const {
  setSearchQuery,
  setRoleFilter,
  setStatusFilter,
  setSelectedUserId,
  banOrSuspendUser,
  reactivateUser,
  addUser,
  updateUser,
  setCreatorVerified,
} = usersSlice.actions;

export default usersSlice.reducer;
