import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import verificationReducer from './slices/verificationSlice';
import escrowReducer from './slices/escrowSlice';
import cmsReducer from './slices/cmsSlice';
import teamReducer from './slices/teamSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  verification: verificationReducer,
  escrow: escrowReducer,
  cms: cmsReducer,
  team: teamReducer,
});
