import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import verificationReducer from './slices/verificationSlice';
import escrowReducer from './slices/escrowSlice';
import cmsReducer from './slices/cmsSlice';
import teamReducer from './slices/teamSlice';
import transactionsReducer from './slices/transactionsSlice';
import packagesReducer from './slices/packagesSlice';
import { ordersReducer } from './slices/ordersSlice';
import { ticketsReducer } from './slices/ticketsSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  verification: verificationReducer,
  orders: ordersReducer,
  tickets: ticketsReducer,
  escrow: escrowReducer,
  transactions: transactionsReducer,
  packages: packagesReducer,
  cms: cmsReducer,
  team: teamReducer,
});


