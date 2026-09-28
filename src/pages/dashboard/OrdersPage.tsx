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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Dropdown } from '@/components/ui/Dropdown';
import { Pagination } from '@/components/ui/Pagination';
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
  X,
  Bell,
  Lock,
  Check,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, searchQuery, statusFilter, slaFilter } = useAppSelector(
    (state) => state.orders
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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
  const [nudgeMessage, setNudgeMessage] = useState('Please update production status to maintain delivery SLA.');

  // Force Release Modal
  const [isForceReleaseModalOpen, setIsForceReleaseModalOpen] = useState(false);
  const [forceReason, setForceReason] = useState('Brand exceeded review SLA without response.');

  // Filtered orders
  const q = searchQuery.toLowerCase().trim();
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.packageTitle.toLowerCase().includes(q) ||
      order.brandName.toLowerCase().includes(q) ||
      order.creatorName.toLowerCase().includes(q) ||
      order.creatorHandle.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchesSla = true;
    if (slaFilter === 'overdue') {
      matchesSla = order.daysRemaining < 0 && order.status !== 'completed';
    } else if (slaFilter === 'at_risk') {
      matchesSla = Boolean((order.daysRemaining <= 1 || order.slaWarning) && order.status !== 'completed');
    }

    return matchesSearch && matchesStatus && matchesSla;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedOrders = filteredOrders.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

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

  // Minimal Status Badge
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
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Orders"
        subtitle="Track active contracts, escrow status, and delivery milestones."
        badge={
          <Badge variant="neutral" size="sm">
            {orders.length} Orders
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
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
              link.setAttribute('download', `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="text-xs font-bold"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
        }
      />

      {/* Top Stat Cards: Clean & Punchy */}
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
          subtitle="Awaiting client sign-off"
        />
        <StatCard
          title="At Risk"
          value={atRiskCount.toString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="black"
          subtitle={atRiskCount > 0 ? 'Requires attention' : 'All contracts healthy'}
        />
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All', count: orders.length },
              { id: 'in_progress', label: 'In Progress', count: orders.filter((o) => o.status === 'in_progress').length },
              { id: 'deliverable_submitted', label: 'In Review', count: orders.filter((o) => o.status === 'deliverable_submitted').length },
              { id: 'revision_requested', label: 'Revision', count: orders.filter((o) => o.status === 'revision_requested').length },
              { id: 'escrow_funded', label: 'Awaiting Script', count: orders.filter((o) => o.status === 'escrow_funded').length },
              { id: 'completed', label: 'Completed', count: orders.filter((o) => o.status === 'completed').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  dispatch(setOrderStatusFilter(tab.id as any));
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    statusFilter === tab.id
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'bg-neutral-200/60 text-neutral-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Overdue Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1 lg:justify-end">
            <div className="relative w-full sm:w-64 lg:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  dispatch(setOrderSearchQuery(e.target.value));
                  setCurrentPage(1);
                }}
                placeholder="Search orders, brands, creators..."
                className="w-full h-9 pl-9 pr-8 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink text-neutral-900 placeholder:text-neutral-400 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setOrderSearchQuery(''));
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                dispatch(setOrderSlaFilter(slaFilter === 'overdue' ? 'all' : 'overdue'));
                setCurrentPage(1);
              }}
              className={`h-9 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                slaFilter === 'overdue'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Overdue Only
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(searchQuery || statusFilter !== 'all' || slaFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-neutral-500 border-t border-neutral-100">
            <span className="font-semibold text-neutral-400">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-semibold text-[11px]">
                Search: "{searchQuery}"
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setOrderSearchQuery(''));
                    setCurrentPage(1);
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-semibold text-[11px] capitalize">
                Status: {statusFilter.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setOrderStatusFilter('all'));
                    setCurrentPage(1);
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {slaFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold text-[11px]">
                Overdue Contracts
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setOrderSlaFilter('all'));
                    setCurrentPage(1);
                  }}
                  className="hover:text-rose-800 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                dispatch(setOrderSearchQuery(''));
                dispatch(setOrderStatusFilter('all'));
                dispatch(setOrderSlaFilter('all'));
                setCurrentPage(1);
              }}
              className="text-[11px] font-bold text-brand-pink hover:underline ml-auto cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </Card>

      {/* Orders Directory Table */}
      <Card className="border-neutral-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs border-b border-neutral-100 font-bold uppercase tracking-wider">
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
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <ShoppingBag className="w-8 h-8 mx-auto text-neutral-300" />
                      <p className="font-bold text-neutral-900">No orders found</p>
                      <p className="text-xs text-neutral-400">
                        No active contracts match your search or filter settings.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          dispatch(setOrderSearchQuery(''));
                          dispatch(setOrderStatusFilter('all'));
                          dispatch(setOrderSlaFilter('all'));
                          setCurrentPage(1);
                        }}
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                    onClick={() => handleOpenDossier(order)}
                  >
                    {/* Order ID & Package Title */}
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs font-bold text-neutral-500 block">
                        #{order.id}
                      </span>
                      <p
                        className="text-sm font-bold text-neutral-950 truncate max-w-[280px] mt-0.5"
                        title={order.packageTitle}
                      >
                        {order.packageTitle}
                      </p>
                    </td>

                    {/* Clean Parties (Brand & Creator) */}
                    <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Avatar src={order.brandAvatar} name={order.brandName} size="xs" />
                          <span className="text-xs font-bold text-neutral-900 truncate max-w-[140px]">
                            {order.brandName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar src={order.creatorAvatar} name={order.creatorName} size="xs" />
                          <span className="text-xs text-neutral-600 truncate max-w-[140px]">
                            {order.creatorName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Clean Amount */}
                    <td className="py-4 px-5">
                      <span className="font-black text-sm text-neutral-950 tabular-nums">
                        {formatCurrency(order.grossAmountEur)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5">
                      {renderStatusBadge(order.status)}
                    </td>

                    {/* Single-line Clean Deadline */}
                    <td className="py-4 px-5">
                      {order.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Delivered
                        </span>
                      ) : order.daysRemaining < 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {Math.abs(order.daysRemaining)}d overdue
                        </span>
                      ) : order.daysRemaining <= 1 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          <Clock className="w-3.5 h-3.5" />
                          Due in 1 day
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-neutral-700">
                          Due {order.dueDate}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDossier(order)}
                          className="text-xs font-bold"
                        >
                          View
                        </Button>

                        <Dropdown
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                            >
                              •••
                            </Button>
                          }
                          items={[
                            {
                              id: 'dossier',
                              label: 'View Order Details',
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
                              label: 'Nudge Counterparties',
                              icon: <Bell className="w-3.5 h-3.5 mr-2" />,
                              onClick: () => {
                                setActiveDossierOrder(order);
                                setIsNudgeModalOpen(true);
                              },
                            },
                            {
                              id: 'force',
                              label: 'Force Disburse Escrow',
                              icon: <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" />,
                              onClick: () => {
                                setActiveDossierOrder(order);
                                setIsForceReleaseModalOpen(true);
                              },
                            },
                            {
                              id: 'dispute',
                              label: 'Escalate to Dispute',
                              icon: <Scale className="w-3.5 h-3.5 mr-2 text-rose-600" />,
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

        {/* Bottom Pagination */}
        <div className="border-t border-neutral-100 px-4 py-1.5">
          <Pagination
            currentPage={validCurrentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            pageSize={pageSize}
            pageSizeOptions={[6, 12, 24]}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="contracts"
          />
        </div>
      </Card>

      {/* ORDER DOSSIER DETAIL MODAL (Light Mode, All Rich Details) */}
      {activeDossierOrder && (
        <Modal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          title={`Order Details: #${activeDossierOrder.id}`}
          description="Complete contract breakdown, escrow verification, and production audit trail."
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
                  Nudge
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
                    Force Release
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setIsDossierOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Top Overview Banner */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-base font-black text-neutral-950">
                    {activeDossierOrder.packageTitle}
                  </span>
                  {renderStatusBadge(activeDossierOrder.status)}
                  <Badge variant="neutral" size="sm" className="capitalize">
                    {activeDossierOrder.packageTier}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 font-medium">
                  Niche: <span className="text-neutral-900 font-bold">{activeDossierOrder.category}</span> • Created {activeDossierOrder.createdAt} • Due {activeDossierOrder.dueDate}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white p-2.5 rounded-lg border border-neutral-200">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase tracking-wider">
                    Total Escrow Vault
                  </span>
                  <span className="text-lg font-black text-neutral-950 tabular-nums">
                    {formatCurrency(activeDossierOrder.grossAmountEur)}
                  </span>
                </div>
                <div className="pl-3 border-l border-neutral-200">
                  <span className="text-[10px] text-emerald-600 block font-bold uppercase tracking-wider">
                    15% Take-Rate
                  </span>
                  <span className="text-base font-black text-emerald-600 tabular-nums">
                    {formatCurrency(activeDossierOrder.platformFeeEur)}
                  </span>
                </div>
              </div>
            </div>

            {/* Counterparties Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Brand Profile */}
              <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-neutral-700" />
                    Brand (Client)
                  </span>
                  <Badge variant="neutral" size="sm">Escrow Funder</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar src={activeDossierOrder.brandAvatar} name={activeDossierOrder.brandName} size="md" />
                  <div>
                    <p className="font-extrabold text-neutral-950 text-sm">{activeDossierOrder.brandName}</p>
                    <p className="text-xs text-neutral-500">{activeDossierOrder.brandEmail}</p>
                  </div>
                </div>
                {activeDossierOrder.brandNotes && (
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-700">
                    <span className="font-bold text-neutral-500 block mb-0.5 text-[11px]">Brand Instructions:</span>
                    "{activeDossierOrder.brandNotes}"
                  </div>
                )}
              </div>

              {/* Creator Profile */}
              <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-pink" />
                    Creator (Contractor)
                  </span>
                  <Badge variant="pink" size="sm">Verified Talent</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar src={activeDossierOrder.creatorAvatar} name={activeDossierOrder.creatorName} size="md" />
                  <div>
                    <p className="font-extrabold text-neutral-950 text-sm">{activeDossierOrder.creatorName}</p>
                    <p className="text-xs font-bold text-brand-pink">{activeDossierOrder.creatorHandle}</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-500 block text-[11px]">Net Creator Payout</span>
                    <span className="text-sm font-black text-emerald-700 tabular-nums">
                      {formatCurrency(activeDossierOrder.creatorNetEur)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-neutral-500 block text-[11px]">Revisions</span>
                    <span className="text-xs font-bold text-neutral-800">
                      {activeDossierOrder.revisionCurrent} of {activeDossierOrder.revisionMax} used
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agreed Deliverables Scope */}
            <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-2.5">
              <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider block">
                Agreed Deliverables Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeDossierOrder.deliverablesSummary.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-800 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {activeDossierOrder.deliverableLink && (
                <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                  <span className="text-xs text-neutral-500 font-medium">Uploaded Draft:</span>
                  <a
                    href={activeDossierOrder.deliverableLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:underline"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Inspect Uploaded 4K Video
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Production Milestone Journey */}
            <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-3">
              <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider block">
                Production Timeline & Milestones
              </span>
              <div className="space-y-3">
                {activeDossierOrder.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {m.status === 'completed' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : m.status === 'current' ? (
                        <div className="w-5 h-5 rounded-full bg-brand-pink/15 text-brand-pink flex items-center justify-center animate-pulse">
                          <Clock className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-bold ${
                            m.status === 'completed'
                              ? 'text-neutral-900'
                              : m.status === 'current'
                              ? 'text-brand-pink'
                              : 'text-neutral-400'
                          }`}
                        >
                          {m.title}
                        </p>
                        {m.timestamp && (
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {m.timestamp}
                          </span>
                        )}
                      </div>
                      {m.notes && (
                        <p className="text-[11px] text-neutral-600 mt-0.5 italic">
                          "{m.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EXTEND SLA MODAL (Light Mode) */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        title="Extend Delivery Turnaround SLA"
        description="Add production days to prevent premature default and allow shipping delays."
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
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Additional Days to Add
            </label>
            <select
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              className="w-full h-9 px-3 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 outline-none focus:border-brand-pink cursor-pointer"
            >
              <option value="2">+2 Days (Standard Shipping Delay)</option>
              <option value="3">+3 Days (Sample Reshipment)</option>
              <option value="5">+5 Days (Complex Shoot Extension)</option>
              <option value="7">+7 Days (Medical / Force Majeure)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Admin Rationale
            </label>
            <Input
              value={extendReason}
              onChange={(e) => setExtendReason(e.target.value)}
              placeholder="e.g. Courier delayed physical product transit"
              className="text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* NUDGE MODAL (Light Mode) */}
      <Modal
        isOpen={isNudgeModalOpen}
        onClose={() => setIsNudgeModalOpen(false)}
        title="Send Urgent Operational Nudge"
        description="Dispatches a priority notification and email alert to the selected party."
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
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Target Counterparty
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNudgeTarget('creator')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  nudgeTarget === 'creator'
                    ? 'border-brand-black bg-neutral-900 text-white'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                }`}
              >
                Creator ({activeDossierOrder?.creatorName})
              </button>
              <button
                type="button"
                onClick={() => setNudgeTarget('brand')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  nudgeTarget === 'brand'
                    ? 'border-brand-black bg-neutral-900 text-white'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                }`}
              >
                Brand ({activeDossierOrder?.brandName})
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Message Content
            </label>
            <Input
              value={nudgeMessage}
              onChange={(e) => setNudgeMessage(e.target.value)}
              className="text-xs"
            />
          </div>
        </form>
      </Modal>

      {/* FORCE AUTO-RELEASE MODAL (Light Mode) */}
      <Modal
        isOpen={isForceReleaseModalOpen}
        onClose={() => setIsForceReleaseModalOpen(false)}
        title="Override: Force Escrow Auto-Disbursement"
        description="Immediately releases funds to creator when brand fails to review in time."
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
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <span className="font-bold block mb-1">Administrative Financial Release:</span>
            This action immediately releases <strong className="text-neutral-950 font-black">€{activeDossierOrder?.creatorNetEur.toLocaleString()}</strong> from escrow to the creator's payout balance and credits Influverse with its 15% platform take-rate.
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">
              Official Override Reason
            </label>
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
