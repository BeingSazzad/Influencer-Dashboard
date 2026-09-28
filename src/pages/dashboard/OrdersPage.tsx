import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setOrderSearchQuery,
  setOrderStatusFilter,
  setOrderSlaFilter,
  setSelectedOrderId,
  extendOrderDeadline,
  forceDisburseOrderEscrow,
  escalateOrderToDispute,
  sendOrderNudge,
} from '@/store/slices/ordersSlice';
import { MarketplaceOrder, OrderStatus } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Send,
  CalendarPlus,
  Play,
  FileText,
  User,
  Building,
  RotateCcw,
  Scale,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X,
  Bell,
  Lock,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, searchQuery, statusFilter, slaFilter, selectedOrderId } = useAppSelector(
    (state) => state.orders
  );

  // Intervention Modals State
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [activeDossierOrder, setActiveDossierOrder] = useState<MarketplaceOrder | null>(null);

  // Extend SLA Modal
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendDays, setExtendDays] = useState('3');
  const [extendReason, setExtendReason] = useState('Product shipping / customs transit delay');

  // Nudge Modal
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);
  const [nudgeTarget, setNudgeTarget] = useState<'brand' | 'creator'>('creator');
  const [nudgeMessage, setNudgeMessage] = useState('Please update production status to maintain 72h delivery SLA.');

  // Force Release Modal
  const [isForceReleaseModalOpen, setIsForceReleaseModalOpen] = useState(false);
  const [forceReason, setForceReason] = useState('Brand exceeded 72-hour review SLA without response.');

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.packageTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.creatorHandle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchesSla = true;
    if (slaFilter === 'overdue') {
      matchesSla = order.daysRemaining < 0 && order.status !== 'completed';
    } else if (slaFilter === 'at_risk') {
      matchesSla = Boolean((order.daysRemaining <= 1 || order.slaWarning) && order.status !== 'completed');
    }

    return matchesSearch && matchesStatus && matchesSla;
  });

  // High-level KPI Calculations
  const activeOrdersCount = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
  const escrowLockedEur = orders
    .filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.grossAmountEur, 0);
  const reviewPendingCount = orders.filter((o) => o.status === 'deliverable_submitted').length;
  const atRiskCount = orders.filter(
    (o) => (o.daysRemaining <= 1 || o.slaWarning) && o.status !== 'completed'
  ).length;

  const handleOpenDossier = (order: MarketplaceOrder) => {
    setActiveDossierOrder(order);
    dispatch(setSelectedOrderId(order.id));
    setIsDossierOpen(true);
  };

  const handleExtendDeadlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDossierOrder) return;
    dispatch(
      extendOrderDeadline({
        orderId: activeDossierOrder.id,
        daysToAdd: Number(extendDays),
        adminNote: extendReason,
      })
    );
    // Refresh active dossier order reference
    const updated = orders.find((o) => o.id === activeDossierOrder.id);
    if (updated) setActiveDossierOrder(updated);
    setIsExtendModalOpen(false);
  };

  const handleForceReleaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDossierOrder) return;
    dispatch(
      forceDisburseOrderEscrow({
        orderId: activeDossierOrder.id,
        adminReason: forceReason,
      })
    );
    const updated = orders.find((o) => o.id === activeDossierOrder.id);
    if (updated) setActiveDossierOrder(updated);
    setIsForceReleaseModalOpen(false);
  };

  const handleNudgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDossierOrder) return;
    dispatch(
      sendOrderNudge({
        orderId: activeDossierOrder.id,
        target: nudgeTarget,
        message: nudgeMessage,
      })
    );
    const updated = orders.find((o) => o.id === activeDossierOrder.id);
    if (updated) setActiveDossierOrder(updated);
    setIsNudgeModalOpen(false);
  };

  const handleEscalateDispute = (order: MarketplaceOrder) => {
    if (
      window.confirm(
        `Are you sure you want to escalate Order ${order.id} to the Escrow Dispute Arbitration Docket?`
      )
    ) {
      dispatch(
        escalateOrderToDispute({
          orderId: order.id,
          disputeReason: 'Escalated by Admin due to production impasse or SLA breach.',
        })
      );
      if (activeDossierOrder?.id === order.id) {
        const updated = orders.find((o) => o.id === order.id);
        if (updated) setActiveDossierOrder(updated);
      }
    }
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'deliverable_submitted':
        return <Badge variant="warning" size="sm">Under Review</Badge>;
      case 'revision_requested':
        return <Badge variant="warning" size="sm">Revision</Badge>;
      case 'in_progress':
        return <Badge variant="default" size="sm">In Progress</Badge>;
      case 'escrow_funded':
        return <Badge variant="neutral" size="sm">Awaiting Script</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'disputed':
        return <Badge variant="danger" size="sm">Disputed</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Orders"
        subtitle="Track active contracts, milestones, and escrow releases."
        badge={
          <Badge variant="neutral" size="sm">
            {orders.length} Total
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                const csvData =
                  'Order ID,Package,Brand,Creator,Gross EUR,Platform Fee EUR,Net EUR,Status,Due Date\n' +
                  orders
                    .map(
                      (o) =>
                        `"${o.id}","${o.packageTitle}","${o.brandName}","${o.creatorName}",${o.grossAmountEur},${o.platformFeeEur},${o.creatorNetEur},"${o.status}","${o.dueDate}"`
                    )
                    .join('\n');
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `influverse_orders_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="text-xs font-bold"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Export Orders CSV
            </Button>
          </div>
        }
      />

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Orders"
          value={activeOrdersCount.toString()}
          icon={<ShoppingBag className="w-5 h-5" />}
          change={14.2}
          accentColor="pink"
          changePeriod="vs last month"
        />
        <StatCard
          title="In Escrow"
          value={formatCurrency(escrowLockedEur)}
          icon={<Lock className="w-5 h-5" />}
          change={8.5}
          accentColor="emerald"
          changePeriod="vs last month"
        />
        <StatCard
          title="In Review"
          value={reviewPendingCount.toString()}
          icon={<Clock className="w-5 h-5" />}
          accentColor="amber"
          changePeriod="vs last month"
        />
        <StatCard
          title="At Risk"
          value={atRiskCount.toString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          change={atRiskCount > 0 ? -1 : undefined}
          accentColor="black"
          changePeriod="vs last month"
        />
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start overflow-x-auto max-w-full">
            {[
              { id: 'all', label: `All (${orders.length})` },
              { id: 'in_progress', label: `In Production (${orders.filter((o) => o.status === 'in_progress').length})` },
              { id: 'deliverable_submitted', label: `In Review (${orders.filter((o) => o.status === 'deliverable_submitted').length})` },
              { id: 'revision_requested', label: `Revision (${orders.filter((o) => o.status === 'revision_requested').length})` },
              { id: 'escrow_funded', label: `Awaiting Script (${orders.filter((o) => o.status === 'escrow_funded').length})` },
              { id: 'completed', label: `Completed (${orders.filter((o) => o.status === 'completed').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => dispatch(setOrderStatusFilter(tab.id as any))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & SLA Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setOrderSearchQuery(e.target.value))}
                placeholder="Search orders..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-pink/20 font-medium text-neutral-900"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() =>
                  dispatch(setOrderSlaFilter(slaFilter === 'overdue' ? 'all' : 'overdue'))
                }
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  slaFilter === 'overdue'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Overdue Only
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Orders Directory Table */}
      <Card className="border-[#E7E7E2] dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-white/[0.03] text-neutral-500 dark:text-neutral-400 text-xs border-b border-[#E7E7E2] dark:border-white/5 font-semibold">
              <tr>
                <th className="py-3 px-5">Order</th>
                <th className="py-3 px-5">Parties</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Deadline</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30 text-neutral-500" />
                    <p className="text-sm font-bold">No active marketplace orders match your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    onClick={() => handleOpenDossier(order)}
                  >
                    {/* Order ID & Package */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-900">{order.id}</span>
                        <Badge variant="neutral" size="sm" className="capitalize text-[10px]">
                          {order.packageTier}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-neutral-900 line-clamp-1 max-w-[220px] mt-1" title={order.packageTitle}>
                        {order.packageTitle}
                      </p>
                      <span className="text-[11px] text-neutral-500 font-medium">{order.category}</span>
                    </td>

                    {/* Counterparties */}
                    <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Avatar src={order.brandAvatar} name={order.brandName} size="xs" />
                          <span className="text-xs font-bold text-neutral-900 truncate max-w-[120px]">{order.brandName}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-3 text-neutral-400 text-xs">
                          <span>↳</span>
                          <Avatar src={order.creatorAvatar} name={order.creatorName} size="xs" />
                          <span className="text-xs font-semibold text-neutral-700 truncate max-w-[120px]">{order.creatorName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Escrow & Payout */}
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-neutral-900 text-xs tabular-nums">
                        {formatCurrency(order.grossAmountEur)}
                      </p>
                      <p className="text-[11px] text-neutral-500 tabular-nums mt-0.5">
                        Net: {formatCurrency(order.creatorNetEur)}
                      </p>
                    </td>

                    {/* Status & Progress */}
                    <td className="py-3.5 px-5">
                      <div>{renderStatusBadge(order.status)}</div>
                      <span className="text-[11px] text-neutral-400 block mt-1 font-medium">
                        {order.progressPercent}% • {order.lastActivity}
                      </span>
                    </td>

                    {/* Delivery SLA */}
                    <td className="py-3.5 px-5">
                      {order.status === 'completed' ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </div>
                      ) : order.daysRemaining < 0 ? (
                        <Badge variant="danger" size="sm" dot>
                          {Math.abs(order.daysRemaining)}d Overdue
                        </Badge>
                      ) : order.daysRemaining <= 1 ? (
                        <Badge variant="warning" size="sm" dot>
                          Due in {order.daysRemaining === 0 ? 'Hours' : '1 Day'}
                        </Badge>
                      ) : (
                        <div className="text-xs text-neutral-700 font-medium">
                          {order.daysRemaining} days left
                        </div>
                      )}
                      <span className="text-[11px] text-neutral-400 block mt-0.5">Due {order.dueDate}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDossier(order)}
                        >
                          View
                        </Button>

                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100">
                              •••
                            </Button>
                          }
                          items={[
                            {
                              id: 'dossier',
                              label: 'Inspect Dossier',
                              icon: <FileText className="w-3.5 h-3.5 mr-2" />,
                              onClick: () => handleOpenDossier(order),
                            },
                            {
                              id: 'extend',
                              label: 'Extend Delivery SLA',
                              icon: <CalendarPlus className="w-3.5 h-3.5 mr-2" />,
                              onClick: () => {
                                setActiveDossierOrder(order);
                                setIsExtendModalOpen(true);
                              },
                            },
                            {
                              id: 'nudge',
                              label: 'Nudge Creator / Brand',
                              icon: <Bell className="w-3.5 h-3.5 mr-2" />,
                              onClick: () => {
                                setActiveDossierOrder(order);
                                setIsNudgeModalOpen(true);
                              },
                            },
                            {
                              id: 'force',
                              label: 'Force Disburse Escrow',
                              icon: <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-400" />,
                              onClick: () => {
                                setActiveDossierOrder(order);
                                setIsForceReleaseModalOpen(true);
                              },
                            },
                            {
                              id: 'dispute',
                              label: 'Escalate to Dispute',
                              icon: <Scale className="w-3.5 h-3.5 mr-2 text-rose-400" />,
                              onClick: () => handleEscalateDispute(order),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ORDER DOSSIER INSPECTION MODAL */}
      {activeDossierOrder && (
        <Modal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          title={`Order Dossier: ${activeDossierOrder.id}`}
          maxWidth="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExtendModalOpen(true)}
                  className="text-xs font-bold"
                >
                  <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
                  Extend SLA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNudgeModalOpen(true)}
                  className="text-xs font-bold"
                >
                  <Bell className="w-3.5 h-3.5 mr-1.5" />
                  Nudge Counterparties
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {activeDossierOrder.status !== 'completed' && (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setIsForceReleaseModalOpen(true)}
                    className="text-xs font-bold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    Force Auto-Disburse
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setIsDossierOpen(false)}>
                  Close Dossier
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Top Overview Banner */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-white">{activeDossierOrder.packageTitle}</span>
                  {renderStatusBadge(activeDossierOrder.status)}
                </div>
                <p className="text-xs text-neutral-400">
                  Category: <span className="text-white font-bold">{activeDossierOrder.category}</span> • Created on {activeDossierOrder.createdAt} • Due Date: {activeDossierOrder.dueDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-neutral-400 block font-semibold">Total Escrow Vault</span>
                  <span className="text-xl font-black text-white">{formatCurrency(activeDossierOrder.grossAmountEur)}</span>
                </div>
                <div className="text-right pl-3 border-l border-white/10">
                  <span className="text-xs text-[#FF2D78] block font-black">Influverse 15%</span>
                  <span className="text-lg font-black text-[#FF2D78]">{formatCurrency(activeDossierOrder.platformFeeEur)}</span>
                </div>
              </div>
            </div>

            {/* Counterparties Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand Profile */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    Originating Brand
                  </span>
                  <Badge variant="neutral" className="text-[10px]">Client / Escrow Funder</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar src={activeDossierOrder.brandAvatar} alt={activeDossierOrder.brandName} size="md" />
                  <div>
                    <p className="font-extrabold text-white text-sm">{activeDossierOrder.brandName}</p>
                    <p className="text-xs text-neutral-400">{activeDossierOrder.brandEmail}</p>
                  </div>
                </div>
                {activeDossierOrder.brandNotes && (
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-neutral-300">
                    <span className="font-bold text-neutral-400 block mb-1">Brand Campaign Notes:</span>
                    "{activeDossierOrder.brandNotes}"
                  </div>
                )}
              </div>

              {/* Creator Profile */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FF2D78]" />
                    Contracted Creator
                  </span>
                  <Badge variant="pink" className="text-[10px]">Verified Talent</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar src={activeDossierOrder.creatorAvatar} alt={activeDossierOrder.creatorName} size="md" />
                  <div>
                    <p className="font-extrabold text-white text-sm">{activeDossierOrder.creatorName}</p>
                    <p className="text-xs font-black text-[#FF2D78]">{activeDossierOrder.creatorHandle}</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-neutral-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-400 block mb-0.5">Net Creator Payout</span>
                    <span className="text-sm font-black text-emerald-400">{formatCurrency(activeDossierOrder.creatorNetEur)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-neutral-400 block mb-0.5">Revisions Used</span>
                    <span className="text-sm font-bold text-neutral-200">
                      {activeDossierOrder.revisionCurrent} of {activeDossierOrder.revisionMax} Max
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deliverables Scope Checklist */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-black uppercase text-neutral-400 tracking-wider block">
                Agreed Contract Deliverables
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeDossierOrder.deliverablesSummary.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-neutral-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {activeDossierOrder.deliverableLink && (
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-xs text-neutral-400 font-semibold">Latest Video Asset Draft:</span>
                  <a
                    href={activeDossierOrder.deliverableLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF2D78] hover:underline"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Inspect Uploaded 4K Video Asset
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Production Milestone Journey */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-black uppercase text-neutral-400 tracking-wider block">
                Production Audit Trail & Milestones
              </span>
              <div className="space-y-3">
                {activeDossierOrder.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {m.status === 'completed' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : m.status === 'current' ? (
                        <div className="w-5 h-5 rounded-full bg-[#FF2D78]/20 text-[#FF2D78] flex items-center justify-center animate-pulse">
                          <Clock className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/10 text-neutral-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-neutral-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${m.status === 'completed' ? 'text-white' : m.status === 'current' ? 'text-[#FF2D78]' : 'text-neutral-500'}`}>
                          {m.title}
                        </p>
                        {m.timestamp && <span className="text-[11px] text-neutral-500">{m.timestamp}</span>}
                      </div>
                      {m.notes && <p className="text-[11px] text-neutral-400 mt-0.5 italic">"{m.notes}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EXTEND SLA MODAL */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        title="Extend Delivery Turnaround SLA"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsExtendModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExtendDeadlineSubmit}>
              Apply Extension
            </Button>
          </div>
        }
      >
        <form onSubmit={handleExtendDeadlineSubmit} className="space-y-4">
          <p className="text-xs text-neutral-400">
            Grant additional production days to the creator. This adjusts the order countdown clock and preserves platform escrow without marking the contract as defaulted.
          </p>
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1">Additional Days to Add</label>
            <select
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs text-white"
            >
              <option value="2">+2 Days (Standard Shipping Delay)</option>
              <option value="3">+3 Days (Sample Reshipment)</option>
              <option value="5">+5 Days (Complex Shoot Extension)</option>
              <option value="7">+7 Days (Medical / Force Majeure)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1">Internal Admin Rationale</label>
            <Input
              value={extendReason}
              onChange={(e) => setExtendReason(e.target.value)}
              placeholder="e.g. Courier delayed physical product transit"
              className="text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* NUDGE MODAL */}
      <Modal
        isOpen={isNudgeModalOpen}
        onClose={() => setIsNudgeModalOpen(false)}
        title="Send Urgent Operational Nudge"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsNudgeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleNudgeSubmit}>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Dispatch Nudge
            </Button>
          </div>
        }
      >
        <form onSubmit={handleNudgeSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1">Target Counterparty</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNudgeTarget('creator')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  nudgeTarget === 'creator'
                    ? 'border-[#FF2D78] bg-[#FF2D78]/10 text-white'
                    : 'border-white/10 bg-black/40 text-neutral-400'
                }`}
              >
                Creator ({activeDossierOrder?.creatorName})
              </button>
              <button
                type="button"
                onClick={() => setNudgeTarget('brand')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  nudgeTarget === 'brand'
                    ? 'border-[#FF2D78] bg-[#FF2D78]/10 text-white'
                    : 'border-white/10 bg-black/40 text-neutral-400'
                }`}
              >
                Brand ({activeDossierOrder?.brandName})
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1">Push Alert & Email Content</label>
            <Input
              value={nudgeMessage}
              onChange={(e) => setNudgeMessage(e.target.value)}
              className="text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* FORCE AUTO-RELEASE MODAL */}
      <Modal
        isOpen={isForceReleaseModalOpen}
        onClose={() => setIsForceReleaseModalOpen(false)}
        title="Override: Force Escrow Auto-Disbursement"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsForceReleaseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleForceReleaseSubmit}>
              Confirm Force Release
            </Button>
          </div>
        }
      >
        <form onSubmit={handleForceReleaseSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            <span className="font-bold block mb-1">Administrative Financial Release:</span>
            This action immediately releases <strong className="text-white">€{activeDossierOrder?.creatorNetEur.toLocaleString()}</strong> from escrow to the creator's payout balance and credits Influverse with its 15% platform fee.
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1">Official Override Reason</label>
            <Input
              value={forceReason}
              onChange={(e) => setForceReason(e.target.value)}
              className="text-xs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
