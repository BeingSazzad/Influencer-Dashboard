import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EscrowDispute } from '@/types/admin.types';
import { INITIAL_DISPUTES } from '@/lib/constants';

interface EscrowState {
  disputes: EscrowDispute[];
  filterStatus: 'all' | 'open' | 'resolved';
  selectedDisputeId: string | null;
  totalEscrowHeldEur: number;
  totalVolumeArbitratedEur: number;
}

const initialState: EscrowState = {
  disputes: INITIAL_DISPUTES,
  filterStatus: 'all',
  selectedDisputeId: null,
  totalEscrowHeldEur: 148500,
  totalVolumeArbitratedEur: 38200,
};

export const escrowSlice = createSlice({
  name: 'escrow',
  initialState,
  reducers: {
    setDisputeFilter: (state, action: PayloadAction<'all' | 'open' | 'resolved'>) => {
      state.filterStatus = action.payload;
    },
    setSelectedDisputeId: (state, action: PayloadAction<string | null>) => {
      state.selectedDisputeId = action.payload;
    },
    arbitrateDispute: (
      state,
      action: PayloadAction<{
        disputeId: string;
        decision: 'resolved_creator' | 'resolved_brand' | 'resolved_split';
        splitRatio?: string;
      }>
    ) => {
      const dispute = state.disputes.find((d) => d.id === action.payload.disputeId);
      if (dispute) {
        dispute.status = action.payload.decision;
        if (action.payload.splitRatio) {
          dispute.splitRatio = action.payload.splitRatio;
        }
        state.totalVolumeArbitratedEur += dispute.amountEur;
      }
    },
  },
});

export const { setDisputeFilter, setSelectedDisputeId, arbitrateDispute } =
  escrowSlice.actions;

export default escrowSlice.reducer;
