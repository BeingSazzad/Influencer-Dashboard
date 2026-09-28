import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VerificationRequest } from '@/types/admin.types';
import { INITIAL_VERIFICATIONS } from '@/lib/constants';

interface VerificationState {
  requests: VerificationRequest[];
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected';
  selectedRequestId: string | null;
}

const initialState: VerificationState = {
  requests: INITIAL_VERIFICATIONS,
  filterStatus: 'all',
  selectedRequestId: null,
};

export const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    setVerificationFilter: (
      state,
      action: PayloadAction<'all' | 'pending' | 'approved' | 'rejected'>
    ) => {
      state.filterStatus = action.payload;
    },
    setSelectedRequest: (state, action: PayloadAction<string | null>) => {
      state.selectedRequestId = action.payload;
    },
    approveRequest: (state, action: PayloadAction<string>) => {
      const item = state.requests.find((r) => r.id === action.payload);
      if (item) {
        item.status = 'approved';
      }
    },
    rejectRequest: (
      state,
      action: PayloadAction<{ id: string; reason: string }>
    ) => {
      const item = state.requests.find((r) => r.id === action.payload.id);
      if (item) {
        item.status = 'rejected';
        item.rejectionReason = action.payload.reason;
      }
    },
  },
});

export const {
  setVerificationFilter,
  setSelectedRequest,
  approveRequest,
  rejectRequest,
} = verificationSlice.actions;

export default verificationSlice.reducer;
