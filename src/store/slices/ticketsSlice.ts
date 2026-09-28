import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SupportTicket, TicketStatus, TicketType, TicketPriority, TicketMessage } from '@/types/admin.types';
import { INITIAL_TICKETS } from '@/lib/constants';

interface TicketsState {
  tickets: SupportTicket[];
  searchQuery: string;
  statusFilter: TicketStatus | 'all';
  typeFilter: TicketType | 'all';
  selectedTicketId: string | null;
}

const initialState: TicketsState = {
  tickets: INITIAL_TICKETS,
  searchQuery: '',
  statusFilter: 'all',
  typeFilter: 'all',
  selectedTicketId: null,
};

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTicketSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setTicketStatusFilter: (state, action: PayloadAction<TicketStatus | 'all'>) => {
      state.statusFilter = action.payload;
    },
    setTicketTypeFilter: (state, action: PayloadAction<TicketType | 'all'>) => {
      state.typeFilter = action.payload;
    },
    setSelectedTicketId: (state, action: PayloadAction<string | null>) => {
      state.selectedTicketId = action.payload;
    },
    replyToTicket: (
      state,
      action: PayloadAction<{
        ticketId: string;
        message: string;
        adminName: string;
        adminAvatar: string;
      }>
    ) => {
      const { ticketId, message, adminName, adminAvatar } = action.payload;
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (ticket) {
        const newMessage: TicketMessage = {
          id: `MSG-${Date.now()}`,
          senderName: `${adminName} (Admin)`,
          senderRole: 'admin',
          senderAvatar: adminAvatar,
          message,
          timestamp: 'Just now',
          isAdminReply: true,
        };
        ticket.messages.push(newMessage);
        ticket.status = 'in_progress';
        ticket.lastUpdated = 'Just now';
        ticket.assignedAdmin = adminName;
      }
    },
    updateTicketStatus: (
      state,
      action: PayloadAction<{ ticketId: string; status: TicketStatus }>
    ) => {
      const { ticketId, status } = action.payload;
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (ticket) {
        ticket.status = status;
        ticket.lastUpdated = 'Just now';
      }
    },
    updateTicketPriority: (
      state,
      action: PayloadAction<{ ticketId: string; priority: TicketPriority }>
    ) => {
      const { ticketId, priority } = action.payload;
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (ticket) {
        ticket.priority = priority;
        ticket.lastUpdated = 'Just now';
      }
    },
  },
});

export const {
  setTicketSearchQuery,
  setTicketStatusFilter,
  setTicketTypeFilter,
  setSelectedTicketId,
  replyToTicket,
  updateTicketStatus,
  updateTicketPriority,
} = ticketsSlice.actions;

export const ticketsReducer = ticketsSlice.reducer;
