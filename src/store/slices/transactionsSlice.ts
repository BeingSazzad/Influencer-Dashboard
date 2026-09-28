import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  MarketplaceTransaction,
  TransactionType,
  TransactionStatus,
} from '@/types/admin.types';
import { INITIAL_TRANSACTIONS } from '@/lib/constants';

interface TransactionsState {
  transactions: MarketplaceTransaction[];
  searchQuery: string;
  typeFilter: 'all' | TransactionType;
  statusFilter: 'all' | TransactionStatus;
  selectedTransactionId: string | null;
}

const initialState: TransactionsState = {
  transactions: INITIAL_TRANSACTIONS,
  searchQuery: '',
  typeFilter: 'all',
  statusFilter: 'all',
  selectedTransactionId: null,
};

export const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactionSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setTransactionTypeFilter: (
      state,
      action: PayloadAction<'all' | TransactionType>
    ) => {
      state.typeFilter = action.payload;
    },
    setTransactionStatusFilter: (
      state,
      action: PayloadAction<'all' | TransactionStatus>
    ) => {
      state.statusFilter = action.payload;
    },
    setSelectedTransactionId: (state, action: PayloadAction<string | null>) => {
      state.selectedTransactionId = action.payload;
    },
    addTransaction: (state, action: PayloadAction<MarketplaceTransaction>) => {
      state.transactions.unshift(action.payload);
    },
  },
});

export const {
  setTransactionSearchQuery,
  setTransactionTypeFilter,
  setTransactionStatusFilter,
  setSelectedTransactionId,
  addTransaction,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
