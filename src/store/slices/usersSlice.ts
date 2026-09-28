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

const initialState: UsersState = {
  users: INITIAL_USERS,
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
        user.status = action.payload.actionType === 'permanent' ? 'banned' : 'suspended';
        user.banActionType = action.payload.actionType;
        user.banReason = action.payload.reason;
        user.escrowDisposition = action.payload.escrowDisposition || 'hold';
        user.notes = action.payload.notes;
      }
    },
    reactivateUser: (state, action: PayloadAction<string>) => {
      const user = state.users.find((u) => u.id === action.payload);
      if (user) {
        user.status = 'active';
        user.banActionType = undefined;
        user.banReason = undefined;
        user.escrowDisposition = undefined;
      }
    },
    addUser: (state, action: PayloadAction<MarketplaceUser>) => {
      state.users.unshift(action.payload);
    },
    updateUser: (state, action: PayloadAction<MarketplaceUser>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
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
} = usersSlice.actions;

export default usersSlice.reducer;
