import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminUser, AdminRole } from '@/types/admin.types';
import { INITIAL_ADMIN_TEAM } from '@/lib/constants';

interface TeamState {
  members: AdminUser[];
  filterRole: 'all' | AdminRole;
  searchQuery: string;
}

const initialState: TeamState = {
  members: INITIAL_ADMIN_TEAM,
  filterRole: 'all',
  searchQuery: '',
};

export const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeamSearch: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setTeamRoleFilter: (state, action: PayloadAction<'all' | AdminRole>) => {
      state.filterRole = action.payload;
    },
    addAdminMember: (state, action: PayloadAction<Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>>) => {
      const newAdmin: AdminUser = {
        ...action.payload,
        id: `ADM-${Math.floor(100 + Math.random() * 900)}`,
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
      };
      state.members.unshift(newAdmin);
    },
    removeAdminMember: (state, action: PayloadAction<string>) => {
      state.members = state.members.filter((m) => m.id !== action.payload);
    },
    updateAdminRole: (
      state,
      action: PayloadAction<{ id: string; role: AdminRole }>
    ) => {
      const member = state.members.find((m) => m.id === action.payload.id);
      if (member) {
        member.role = action.payload.role;
      }
    },
    toggleAdminStatus: (state, action: PayloadAction<string>) => {
      const member = state.members.find((m) => m.id === action.payload);
      if (member) {
        member.status = member.status === 'active' ? 'suspended' : 'active';
      }
    },
  },
});

export const {
  setTeamSearch,
  setTeamRoleFilter,
  addAdminMember,
  removeAdminMember,
  updateAdminRole,
  toggleAdminStatus,
} = teamSlice.actions;

export default teamSlice.reducer;
