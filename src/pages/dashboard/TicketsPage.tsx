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
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Send,
  ShieldAlert,
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

  // KPIs
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const reportCount = tickets.filter((t) => t.type === 'user_report').length;
  const urgentCount = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length;

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.reportedUser && t.reportedUser.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

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
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Support"
        subtitle="Customer tickets and reported platform issues."
        badge={
          <Badge variant="default" size="sm">
            {openCount} Open
          </Badge>
        }
      />

      {/* KPI Minimal Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Open Tickets', value: openCount.toString() },
          { label: 'Reports', value: reportCount.toString() },
          { label: 'Urgent', value: urgentCount.toString() },
          { label: 'In Progress', value: inProgressCount.toString() },
        ].map((item) => (
          <Card key={item.label} className="p-3.5">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              {item.label}
            </span>
            <div className="text-base font-bold text-neutral-900 dark:text-white mt-1 tabular-nums">
              {item.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Tabs & Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status & Type Pills */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 p-1 rounded-xl self-start overflow-x-auto max-w-full">
            <button
              onClick={() => {
                dispatch(setTicketStatusFilter('all'));
                dispatch(setTicketTypeFilter('all'));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'all' && typeFilter === 'all'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => dispatch(setTicketTypeFilter('user_report'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                typeFilter === 'user_report'
                  ? 'bg-white dark:bg-neutral-800 text-rose-700 dark:text-rose-400 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Reports ({reportCount})
            </button>
            <button
              onClick={() => dispatch(setTicketStatusFilter('open'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'open'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Open ({openCount})
            </button>
            <button
              onClick={() => dispatch(setTicketStatusFilter('in_progress'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'in_progress'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => dispatch(setTicketStatusFilter('resolved'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'resolved'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Resolved ({tickets.filter((t) => t.status === 'resolved').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setTicketSearchQuery(e.target.value))}
              placeholder="Search tickets..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-brand-pink/20 font-medium text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Tickets List Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-neutral-400 font-medium">
                  No tickets match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  onClick={() => handleOpenTicket(ticket)}
                  className="cursor-pointer"
                >
                  {/* Ticket ID */}
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                      {ticket.id}
                    </span>
                  </TableCell>

                  {/* Subject */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 max-w-[240px]">
                      {ticket.type === 'user_report' && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                          Report
                        </span>
                      )}
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate" title={ticket.subject}>
                        {ticket.subject}
                      </span>
                    </div>
                  </TableCell>

                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar src={ticket.userAvatar} name={ticket.userName} size="sm" />
                      <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">
                        {ticket.userName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span className="text-xs text-neutral-600 dark:text-neutral-300">
                      {getCategoryLabel(ticket.category)}
                    </span>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>{renderPriorityBadge(ticket.priority)}</TableCell>

                  {/* Status */}
                  <TableCell>{renderStatusBadge(ticket.status)}</TableCell>

                  {/* Updated */}
                  <TableCell className="text-xs text-neutral-500 whitespace-nowrap">
                    {ticket.lastUpdated}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2.5 font-bold"
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
      </Card>

      {/* TICKET DETAILS & REPLY MODAL */}
      {activeTicket && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Ticket ${activeTicket.id}`}
          maxWidth="lg"
          footer={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-semibold">Status:</span>
                <select
                  value={activeTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 font-medium outline-none"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <span className="text-xs text-neutral-500 font-semibold ml-2">Priority:</span>
                <select
                  value={activeTicket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                  className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-200 font-medium outline-none"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
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
          <div className="space-y-5 text-xs">
            {/* Header Subject Banner */}
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    {activeTicket.subject}
                  </span>
                  {renderPriorityBadge(activeTicket.priority)}
                  {renderStatusBadge(activeTicket.status)}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Category: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{getCategoryLabel(activeTicket.category)}</span> • Created on {activeTicket.createdAt}
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">
                  Assigned
                </span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {activeTicket.assignedAdmin || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Inquiring User & Reported Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Inquirer */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block">
                  Submitted By
                </span>
                <div className="flex items-center gap-3">
                  <Avatar src={activeTicket.userAvatar} name={activeTicket.userName} size="md" />
                  <div>
                    <p className="font-extrabold text-neutral-900 dark:text-white text-xs">{activeTicket.userName}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{activeTicket.userEmail}</p>
                    <Badge variant="neutral" size="sm" className="mt-1 capitalize">
                      {activeTicket.userRole}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Reported User (if applicable) */}
              {activeTicket.reportedUser ? (
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Reported Account
                    </span>
                    <Badge variant="danger" size="sm">Under Review</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar src={activeTicket.reportedUser.avatar} name={activeTicket.reportedUser.name} size="md" />
                    <div>
                      <p className="font-extrabold text-neutral-900 dark:text-white text-xs">
                        {activeTicket.reportedUser.name}
                      </p>
                      {activeTicket.reportedUser.handle && (
                        <p className="text-[11px] text-rose-600 font-bold">{activeTicket.reportedUser.handle}</p>
                      )}
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 italic leading-relaxed">
                        "{activeTicket.reportedUser.reason}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 flex items-center justify-center text-center">
                  <div className="space-y-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold text-neutral-800 dark:text-white">Standard Inquiry</p>
                    <p className="text-[11px] text-neutral-400">No account sanction reported.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Conversation Messages */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
                Messages ({activeTicket.messages.length})
              </span>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      msg.isAdminReply
                        ? 'bg-neutral-900 text-white border-neutral-800 ml-6 dark:bg-neutral-800 dark:text-white'
                        : 'bg-neutral-50 dark:bg-white/5 border-neutral-200/80 dark:border-white/10 mr-6 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={msg.senderAvatar} name={msg.senderName} size="xs" />
                        <span className="font-bold">
                          {msg.senderName}
                        </span>
                      </div>
                      <span className={`text-[10px] ${msg.isAdminReply ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="leading-relaxed pl-6">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} className="space-y-2.5 pt-3 border-t border-neutral-200/80 dark:border-white/10">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Reply to User
              </label>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response to the user..."
                className="text-xs min-h-[70px]"
              />
              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  variant="accent"
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
