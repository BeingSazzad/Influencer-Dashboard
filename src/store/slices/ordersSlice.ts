import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MarketplaceOrder, OrderStatus } from '@/types/admin.types';
import { INITIAL_ORDERS } from '@/lib/constants';

interface OrdersState {
  orders: MarketplaceOrder[];
  searchQuery: string;
  statusFilter: OrderStatus | 'all' | 'active';
  slaFilter: 'all' | 'overdue' | 'at_risk';
  selectedOrderId: string | null;
}

const initialState: OrdersState = {
  orders: INITIAL_ORDERS,
  searchQuery: '',
  statusFilter: 'all',
  slaFilter: 'all',
  selectedOrderId: null,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setOrderStatusFilter: (state, action: PayloadAction<OrderStatus | 'all' | 'active'>) => {
      state.statusFilter = action.payload;
    },
    setOrderSlaFilter: (state, action: PayloadAction<'all' | 'overdue' | 'at_risk'>) => {
      state.slaFilter = action.payload;
    },
    setSelectedOrderId: (state, action: PayloadAction<string | null>) => {
      state.selectedOrderId = action.payload;
    },
    extendOrderDeadline: (
      state,
      action: PayloadAction<{ orderId: string; daysToAdd: number; adminNote?: string }>
    ) => {
      const { orderId, daysToAdd, adminNote } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.deliveryDaysTotal += daysToAdd;
        order.daysRemaining += daysToAdd;
        order.slaWarning = order.daysRemaining < 0;
        order.lastActivity = 'Just now (Deadline Extended)';
        if (adminNote) {
          order.brandNotes = order.brandNotes
            ? `${order.brandNotes} | Admin Note: ${adminNote}`
            : `Admin Note: ${adminNote}`;
        }
        order.milestones.push({
          title: `Admin Extended Delivery Deadline (+${daysToAdd} days)`,
          status: 'completed',
          timestamp: 'Just now',
          notes: adminNote,
        });
      }
    },
    forceDisburseOrderEscrow: (
      state,
      action: PayloadAction<{ orderId: string; adminReason: string }>
    ) => {
      const { orderId, adminReason } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = 'completed';
        order.progressPercent = 100;
        order.daysRemaining = 0;
        order.lastActivity = 'Just now (Force Disbursed by Admin)';
        order.milestones.forEach((m) => {
          m.status = 'completed';
        });
        order.milestones.push({
          title: `Admin Override: Escrow Force-Disbursed (€${order.creatorNetEur.toLocaleString()})`,
          status: 'completed',
          timestamp: 'Just now',
          notes: adminReason,
        });
      }
    },
    escalateOrderToDispute: (
      state,
      action: PayloadAction<{ orderId: string; disputeReason: string }>
    ) => {
      const { orderId, disputeReason } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = 'disputed';
        order.slaWarning = true;
        order.lastActivity = 'Just now (Escalated to Escrow Dispute)';
        order.milestones.push({
          title: 'Order Escalated to Escrow Arbitration Docket',
          status: 'current',
          timestamp: 'Just now',
          notes: disputeReason,
        });
      }
    },
    sendOrderNudge: (
      state,
      action: PayloadAction<{ orderId: string; target: 'brand' | 'creator'; message: string }>
    ) => {
      const { orderId, target, message } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.lastActivity = `Just now (Nudge sent to ${target})`;
        order.milestones.push({
          title: `Admin Nudge Sent to ${target === 'brand' ? order.brandName : order.creatorName}`,
          status: 'completed',
          timestamp: 'Just now',
          notes: message,
        });
      }
    },
  },
});

export const {
  setOrderSearchQuery,
  setOrderStatusFilter,
  setOrderSlaFilter,
  setSelectedOrderId,
  extendOrderDeadline,
  forceDisburseOrderEscrow,
  escalateOrderToDispute,
  sendOrderNudge,
} = ordersSlice.actions;

export const ordersReducer = ordersSlice.reducer;
