import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setTicketSearchQuery,
  setTicketStatusFilter,
  setTicketTypeFilter,
  setSelectedTicketId,
  replyToTicket,
  updateTicketStatus,
  updateTicketPriority,
} from '@/store/slices/ticketsSlice';
import { SupportTicket, TicketPriority, TicketStatus } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Send,
  ShieldAlert,
  Clock,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';

export const TicketsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tickets, searchQuery, statusFilter, typeFilter } = useAppSelector(
    (state) => state.tickets
  );
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // KPIs
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const reportCount = tickets.filter((t) => t.type === 'user_report').length;

  const q = searchQuery.toLowerCase().trim();
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.userEmail.toLowerCase().includes(q) ||
      (t.reportedUser && t.reportedUser.name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedTickets = filteredTickets.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  const handleOpenTicket = (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    dispatch(setSelectedTicketId(ticket.id));
    setReplyMessage('');
    setIsModalOpen(true);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;

    dispatch(
      replyToTicket({
        ticketId: activeTicket.id,
        message: replyMessage.trim(),
        adminName: currentUser?.name || 'Admin',
        adminAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      })
    );

    const updated = tickets.find((t) => t.id === activeTicket.id);
    if (updated) {
      setActiveTicket({
        ...updated,
        messages: [
          ...updated.messages,
          {
            id: `MSG-${Date.now()}`,
            senderName: `${currentUser?.name || 'Admin'} (Admin)`,
            senderRole: 'admin',
            senderAvatar: currentUser?.avatar || '',
            message: replyMessage.trim(),
            timestamp: 'Just now',
            isAdminReply: true,
          },
        ],
        status: 'in_progress',
      });
    }
    setReplyMessage('');
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!activeTicket) return;
    dispatch(updateTicketStatus({ ticketId: activeTicket.id, status }));
    setActiveTicket({ ...activeTicket, status, lastUpdated: 'Just now' });
  };

  const handlePriorityChange = (priority: TicketPriority) => {
    if (!activeTicket) return;
    dispatch(updateTicketPriority({ ticketId: activeTicket.id, priority }));
    setActiveTicket({ ...activeTicket, priority, lastUpdated: 'Just now' });
  };

  const renderPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="danger" size="sm">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning" size="sm">High</Badge>;
      case 'normal':
        return <Badge variant="neutral" size="sm">Normal</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Low</Badge>;
    }
  };

  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="warning" size="sm" dot>Open</Badge>;
      case 'in_progress':
        return <Badge variant="default" size="sm" dot>In Progress</Badge>;
      case 'resolved':
        return <Badge variant="success" size="sm" dot>Resolved</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'fraud_scam':
        return 'Fake Metrics / Bot Scam';
      case 'billing_escrow':
        return 'Billing & Escrow';
      case 'order_delivery':
        return 'Order Revision';
      case 'copyright_ip':
        return 'Copyright / License';
      case 'account_access':
        return 'Account Access';
      default:
        return 'General Support';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Support"
        subtitle="Manage customer support inquiries and user reports."
      />


      {/* Filter Tabs & Search */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status & Type Pills */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl self-start overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => {
                dispatch(setTicketStatusFilter('all'));
                dispatch(setTicketTypeFilter('all'));
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === 'all' && typeFilter === 'all'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(setTicketTypeFilter('user_report'));
                dispatch(setTicketStatusFilter('all'));
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                typeFilter === 'user_report'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Reports ({reportCount})
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(setTicketStatusFilter('open'));
                dispatch(setTicketTypeFilter('all'));
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === 'open' && typeFilter === 'all'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Open ({openCount})
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(setTicketStatusFilter('in_progress'));
                dispatch(setTicketTypeFilter('all'));
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === 'in_progress' && typeFilter === 'all'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch(setTicketStatusFilter('resolved'));
                dispatch(setTicketTypeFilter('all'));
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === 'resolved' && typeFilter === 'all'
                  ? 'bg-white text-neutral-950 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Resolved ({tickets.filter((t) => t.status === 'resolved').length})
            </button>
          </div>

          {/* Search Box with Clear */}
          <div className="relative w-full sm:w-72 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                dispatch(setTicketSearchQuery(e.target.value));
                setCurrentPage(1);
              }}
              placeholder="Search tickets, users, issues..."
              className="w-full h-9 pl-9 pr-8 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink font-medium text-neutral-900 placeholder:text-neutral-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  dispatch(setTicketSearchQuery(''));
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Tickets List Table */}
      <Card className="border-neutral-200/80 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-neutral-500 font-medium">
                  <div className="max-w-xs mx-auto space-y-2">
                    <LifeBuoy className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="font-bold text-neutral-900">No support tickets found</p>
                    <p className="text-xs text-neutral-400">
                      Try adjusting your keywords or clearing the active filters.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        dispatch(setTicketSearchQuery(''));
                        dispatch(setTicketStatusFilter('all'));
                        dispatch(setTicketTypeFilter('all'));
                        setCurrentPage(1);
                      }}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  onClick={() => handleOpenTicket(ticket)}
                  className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                >
                  {/* Ticket ID */}
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-neutral-900">
                      {ticket.id}
                    </span>
                  </TableCell>

                  {/* Subject */}
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-[260px]">
                      {ticket.type === 'user_report' && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Report
                        </span>
                      )}
                      <span
                        className="text-sm font-bold text-neutral-950 truncate"
                        title={ticket.subject}
                      >
                        {ticket.subject}
                      </span>
                    </div>
                  </TableCell>

                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar src={ticket.userAvatar} name={ticket.userName} size="xs" />
                      <span className="text-xs font-bold text-neutral-900 truncate max-w-[120px]">
                        {ticket.userName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span className="text-xs font-semibold text-neutral-700">
                      {getCategoryLabel(ticket.category)}
                    </span>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>
                    {renderPriorityBadge(ticket.priority)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {renderStatusBadge(ticket.status)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold"
                      onClick={() => handleOpenTicket(ticket)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Bottom Pagination */}
        <div className="border-t border-neutral-100 px-4 py-1.5">
          <Pagination
            currentPage={validCurrentPage}
            totalPages={totalPages}
            totalItems={filteredTickets.length}
            pageSize={pageSize}
            pageSizeOptions={[8, 16, 24]}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="tickets"
          />
        </div>
      </Card>

      {/* TICKET DETAILS & REPLY MODAL (Light Mode) */}
      {activeTicket && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Ticket ${activeTicket.id}`}
          description="Direct customer conversation, dispute reason, and resolution."
          maxWidth="lg"
          footer={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-semibold">Status:</span>
                <div className="relative">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="bg-neutral-50 border border-neutral-200 rounded-lg pl-2.5 pr-7 py-1 text-xs text-neutral-900 font-bold outline-none cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <span className="text-xs text-neutral-500 font-semibold ml-2">Priority:</span>
                <div className="relative">
                  <select
                    value={activeTicket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="bg-neutral-50 border border-neutral-200 rounded-lg pl-2.5 pr-7 py-1 text-xs text-neutral-900 font-bold outline-none cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                {activeTicket.status !== 'resolved' && (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleStatusChange('resolved')}
                    className="text-xs font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Mark Resolved
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Clean Ticket Meta Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <h4 className="text-sm font-extrabold text-neutral-950">
                  {activeTicket.subject}
                </h4>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  {getCategoryLabel(activeTicket.category)} • Created {activeTicket.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {renderPriorityBadge(activeTicket.priority)}
                {renderStatusBadge(activeTicket.status)}
              </div>
            </div>

            {/* Inquirer Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2.5">
                <Avatar src={activeTicket.userAvatar} name={activeTicket.userName} size="sm" />
                <div>
                  <span className="font-bold text-xs text-neutral-950">{activeTicket.userName}</span>
                  <span className="text-xs text-neutral-500 ml-2 font-medium">{activeTicket.userEmail}</span>
                </div>
              </div>
              <Badge variant="neutral" size="sm" className="capitalize self-start sm:self-auto">
                {activeTicket.userRole}
              </Badge>
            </div>

            {/* Reported User (only if present) */}
            {activeTicket.reportedUser && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Avatar src={activeTicket.reportedUser.avatar} name={activeTicket.reportedUser.name} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-rose-950">{activeTicket.reportedUser.name}</span>
                      {activeTicket.reportedUser.handle && (
                        <span className="text-xs text-rose-700 font-medium">{activeTicket.reportedUser.handle}</span>
                      )}
                    </div>
                    {activeTicket.reportedUser.reason && (
                      <p className="text-xs text-rose-800 italic mt-0.5">"{activeTicket.reportedUser.reason}"</p>
                    )}
                  </div>
                </div>
                <Badge variant="danger" size="sm">Under Review</Badge>
              </div>
            )}

            {/* Conversation Messages */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                Messages ({activeTicket.messages.length})
              </span>

              <div className="space-y-2.5 max-h-56 overflow-y-auto p-3 bg-neutral-50/50 rounded-xl border border-neutral-100">
                {activeTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      msg.isAdminReply
                        ? 'bg-pink-50 border border-pink-200 text-neutral-950 ml-6'
                        : 'bg-white text-neutral-900 border border-neutral-200/80 mr-6 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${msg.isAdminReply ? 'text-brand-pink' : 'text-neutral-950'}`}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-2.5 pt-1">
              <Textarea
                placeholder="Type your official administrative reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={3}
                className="text-xs"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!replyMessage.trim()}
                  className="text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Send Reply
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
