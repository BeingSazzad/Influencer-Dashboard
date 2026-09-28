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
import { SupportTicket, TicketPriority, TicketStatus, TicketType } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  LifeBuoy,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  User,
  Building,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  FileText,
  Flag,
  RotateCcw,
} from 'lucide-react';

export const TicketsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tickets, searchQuery, statusFilter, typeFilter, selectedTicketId } = useAppSelector(
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
        adminName: currentUser?.name || 'Admin HQ',
        adminAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      })
    );

    // Refresh active ticket from latest state
    const updated = tickets.find((t) => t.id === activeTicket.id);
    if (updated) {
      setActiveTicket({
        ...updated,
        messages: [
          ...updated.messages,
          {
            id: `MSG-${Date.now()}`,
            senderName: `${currentUser?.name || 'Admin HQ'} (Admin)`,
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
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            High
          </span>
        );
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Normal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-neutral-500/10 text-neutral-400">
            Low
          </span>
        );
    }
  };

  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <Badge variant="warning" className="font-extrabold text-[11px] uppercase tracking-wider">
            Open
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="default" className="font-extrabold text-[11px] uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
            In Progress
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="success" className="font-extrabold text-[11px] uppercase tracking-wider">
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'fraud_scam':
        return 'Fake Metrics / Bot Scam';
      case 'billing_escrow':
        return 'Billing & Escrow Settlement';
      case 'order_delivery':
        return 'Order Revision / Delivery';
      case 'copyright_ip':
        return 'Copyright / License Breach';
      case 'account_access':
        return 'Account Access & Security';
      default:
        return 'General Support';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <PageHeader
        title="Support"
        subtitle="Customer tickets and reported platform issues."
        badge={
          <Badge variant="default" size="sm" className="bg-[#FF2D78]/10 text-[#FF2D78] border border-[#FF2D78]/20 font-black">
            {openCount} Open
          </Badge>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Tickets"
          value={openCount.toString()}
          icon={<LifeBuoy className="w-5 h-5" />}
          change={-2}
          accentColor="pink"
          changePeriod="vs last month"
        />
        <StatCard
          title="Reports"
          value={reportCount.toString()}
          icon={<ShieldAlert className="w-5 h-5" />}
          accentColor="amber"
        />
        <StatCard
          title="Urgent"
          value={urgentCount.toString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          change={urgentCount > 0 ? -1 : undefined}
          accentColor="black"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount.toString()}
          icon={<Clock className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* Filter Tabs & Search */}
      <Card className="p-4 border-[#E7E7E2] dark:border-white/10">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status & Type Pills */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start overflow-x-auto max-w-full">
            <button
              onClick={() => {
                dispatch(setTicketStatusFilter('all'));
                dispatch(setTicketTypeFilter('all'));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'all' && typeFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => dispatch(setTicketTypeFilter('user_report'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                typeFilter === 'user_report'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Reports ({reportCount})
            </button>
            <button
              onClick={() => dispatch(setTicketStatusFilter('open'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'open'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Open ({openCount})
            </button>
            <button
              onClick={() => dispatch(setTicketStatusFilter('in_progress'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'in_progress'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => dispatch(setTicketStatusFilter('resolved'))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
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
              className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-pink/20 font-medium text-neutral-900"
            />
          </div>
        </div>
      </Card>

      {/* Tickets List Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs border-b border-neutral-200 font-semibold">
              <tr>
                <th className="py-3 px-5">Ticket</th>
                <th className="py-3 px-5">User</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Priority</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Updated</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <LifeBuoy className="w-10 h-10 mx-auto mb-2 opacity-30 text-neutral-500" />
                    <p className="text-sm font-bold">No tickets match the selected filters.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => handleOpenTicket(ticket)}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                  >
                    {/* Ticket ID & Subject */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-900">{ticket.id}</span>
                        {ticket.type === 'user_report' ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <Flag className="w-3 h-3 text-rose-500" />
                            Report
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <LifeBuoy className="w-3 h-3 text-blue-500" />
                            Support
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-neutral-900 text-xs line-clamp-1 max-w-[280px] mt-1" title={ticket.subject}>
                        {ticket.subject}
                      </p>
                    </td>

                    {/* Inquiring Party */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={ticket.userAvatar} name={ticket.userName} size="sm" />
                        <div className="max-w-[140px]">
                          <p className="text-xs font-bold text-neutral-900 truncate">{ticket.userName}</p>
                          <span className="text-[10px] text-neutral-400 capitalize font-medium block">
                            {ticket.userRole}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-semibold text-neutral-800 block">
                        {getCategoryLabel(ticket.category)}
                      </span>
                      {ticket.reportedUser && (
                        <span className="text-[11px] text-rose-600 font-medium block mt-0.5">
                          Reported: {ticket.reportedUser.name}
                        </span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-5">{renderPriorityBadge(ticket.priority)}</td>

                    {/* Status */}
                    <td className="py-3.5 px-5">{renderStatusBadge(ticket.status)}</td>

                    {/* Updated */}
                    <td className="py-3.5 px-5 text-xs text-neutral-500 font-medium">
                      {ticket.lastUpdated}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenTicket(ticket)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* TICKET DETAILS & REPLY MODAL */}
      {activeTicket && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Inquiry Dossier: ${activeTicket.id}`}
          maxWidth="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-bold">Set Status:</span>
                <select
                  value={activeTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <span className="text-xs text-neutral-400 font-bold ml-2">Priority:</span>
                <select
                  value={activeTicket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                  className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {activeTicket.status !== 'resolved' && (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleStatusChange('resolved')}
                    className="text-xs font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Mark Resolved
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Header Subject Banner */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-black text-white">{activeTicket.subject}</span>
                  {renderPriorityBadge(activeTicket.priority)}
                  {renderStatusBadge(activeTicket.status)}
                </div>
                <p className="text-xs text-neutral-400">
                  Category: <span className="text-white font-bold">{getCategoryLabel(activeTicket.category)}</span> • Created on {activeTicket.createdAt}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-neutral-400 block font-semibold">Assigned Admin</span>
                <span className="text-xs font-bold text-[#FF2D78]">
                  {activeTicket.assignedAdmin || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Inquiring User & Reported Target (if user_report) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inquirer */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[11px] font-black uppercase text-neutral-400 tracking-wider block">
                  Reported / Submitted By
                </span>
                <div className="flex items-center gap-3">
                  <Avatar src={activeTicket.userAvatar} alt={activeTicket.userName} size="md" />
                  <div>
                    <p className="font-extrabold text-white text-sm">{activeTicket.userName}</p>
                    <p className="text-xs text-neutral-400">{activeTicket.userEmail}</p>
                    <span className="text-[10px] text-[#FF2D78] font-bold uppercase mt-0.5 block">
                      Registered {activeTicket.userRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reported User (if applicable) */}
              {activeTicket.reportedUser ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Reported Marketplace Account
                    </span>
                    <Badge variant="danger" className="text-[10px]">Under Review</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar src={activeTicket.reportedUser.avatar} alt={activeTicket.reportedUser.name} size="md" />
                    <div>
                      <p className="font-extrabold text-white text-sm">{activeTicket.reportedUser.name}</p>
                      {activeTicket.reportedUser.handle && (
                        <p className="text-xs text-[#FF2D78] font-bold">{activeTicket.reportedUser.handle}</p>
                      )}
                      <p className="text-[11px] text-rose-300 mt-1 italic">
                        "{activeTicket.reportedUser.reason}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-center p-4">
                  <div className="space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-neutral-300">Standard Inquiry</p>
                    <p className="text-[11px] text-neutral-500">No account sanction or penalty reported.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-neutral-400 tracking-wider block">
                Communication History ({activeTicket.messages.length} messages)
              </span>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {activeTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      msg.isAdminReply
                        ? 'bg-[#FF2D78]/10 border-[#FF2D78]/20 ml-6'
                        : 'bg-white/[0.02] border-white/10 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={msg.senderAvatar} alt={msg.senderName} size="xs" />
                        <span className={`font-bold ${msg.isAdminReply ? 'text-[#FF2D78]' : 'text-white'}`}>
                          {msg.senderName}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-semibold">{msg.timestamp}</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed pl-6">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-white/10">
              <label className="text-xs font-bold text-neutral-300 block">
                Send Official Admin Response
              </label>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response to the user. This will notify them via email and platform inbox..."
                className="text-xs min-h-[80px]"
              />
              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!replyMessage.trim()}
                  className="text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Dispatch Response
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
