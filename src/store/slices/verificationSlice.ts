import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VerificationRequest } from '@/types/admin.types';
import { INITIAL_VERIFICATIONS } from '@/lib/constants';

interface VerificationState {
  requests: VerificationRequest[];
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected';
  selectedRequestId: string | null;
}

const loadSavedVerifications = (): VerificationRequest[] => {
  try {
    const raw = localStorage.getItem('influverse_verifications');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_VERIFICATIONS;
};

const saveVerifications = (requests: VerificationRequest[]) => {
  try {
    localStorage.setItem('influverse_verifications', JSON.stringify(requests));
  } catch (e) {
    // ignore
  }
};

const initialState: VerificationState = {
  requests: loadSavedVerifications(),
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
        saveVerifications(state.requests);
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
        saveVerifications(state.requests);
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
