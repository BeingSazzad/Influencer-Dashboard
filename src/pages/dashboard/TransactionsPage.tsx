import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setTransactionSearchQuery,
  setTransactionTypeFilter,
  setTransactionStatusFilter,
} from '@/store/slices/transactionsSlice';
import {
  MarketplaceTransaction,
  TransactionType,
  TransactionStatus,
} from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Receipt,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  RotateCcw,
  Percent,
  CreditCard,
  Building,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, searchQuery, typeFilter, statusFilter } = useAppSelector(
    (state) => state.transactions
  );

  const [inspectedTxn, setInspectedTxn] = useState<MarketplaceTransaction | null>(null);
  const [exportNotice, setExportNotice] = useState(false);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.stripePaymentIntentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleExportCSV = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const getTypeBadgeVariant = (type: TransactionType) => {
    switch (type) {
      case 'escrow_deposit':
        return 'pink';
      case 'creator_payout':
        return 'success';
      case 'platform_fee':
        return 'default';
      case 'brand_refund':
        return 'danger';
      case 'arbitration_split':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'escrow_locked':
        return 'pink';
      case 'pending':
        return 'warning';
      case 'refunded':
        return 'danger';
      case 'failed':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Ledger & Transactions"
        subtitle="Immutable transaction ledger tracking brand escrow deposits, creator payouts, 15% platform take, and gateway refunds."
        badge={
          <Badge variant="default" size="sm">
            Stripe & SEPA Audited
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV Ledger
          </Button>
        }
      />

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Financial statement generated & exported (influverse_ledger_sept2026.csv).</span>
        </div>
      )}

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Gross Settled"
          value="€1,248,500"
          change={18.4}
          icon={<Receipt className="w-5 h-5" />}
          accentColor="black"
          changePeriod="vs last month"
        />
        <StatCard
          title="Escrow in Custody"
          value="€148,500"
          change={6.2}
          icon={<Lock className="w-5 h-5" />}
          accentColor="pink"
          subtitle="Segregated client escrow"
        />
        <StatCard
          title="Platform Net Take (15%)"
          value="€187,275"
          change={21.8}
          icon={<Percent className="w-5 h-5" />}
          accentColor="emerald"
          changePeriod="vs last month"
        />
        <StatCard
          title="Disbursed Payouts"
          value="€912,725"
          change={14.1}
          icon={<ArrowUpRight className="w-5 h-5" />}
          accentColor="amber"
          subtitle="Zero payout delays"
        />
      </div>

      {/* Filters & Control Panel */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'escrow_deposit', label: 'Escrow Deposits' },
              { id: 'creator_payout', label: 'Creator Payouts' },
              { id: 'platform_fee', label: 'Platform Fees (15%)' },
              { id: 'brand_refund', label: 'Refunds' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => dispatch(setTransactionTypeFilter(t.id as any))}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                  typeFilter === t.id
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search & Status */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-xl justify-end">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search TXN, Order, Brand, Stripe..."
                value={searchQuery}
                onChange={(e) => dispatch(setTransactionSearchQuery(e.target.value))}
                className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink font-medium"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => dispatch(setTransactionStatusFilter(e.target.value as any))}
              className="h-9 px-3 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 outline-none focus:border-brand-pink cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="escrow_locked">Escrow Locked</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Financial Ledger Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction / Invoice</TableHead>
              <TableHead>Contract Order & Campaign</TableHead>
              <TableHead>Counterparties</TableHead>
              <TableHead>Transaction Type</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>15% Platform Take</TableHead>
              <TableHead>Net Settlement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-neutral-400 font-medium">
                  No transaction records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <div>
                      <div className="font-mono text-xs font-black text-neutral-950">
                        {txn.id}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
                        {txn.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-medium">
                        {txn.createdAt}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 max-w-[200px]">
                      <span className="font-mono text-[11px] font-bold text-neutral-500">
                        #{txn.orderId}
                      </span>
                      <div className="text-xs font-extrabold text-neutral-950 truncate" title={txn.campaignTitle}>
                        {txn.campaignTitle}
                      </div>
                      <span className="inline-block text-[10px] uppercase font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded">
                        {txn.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Avatar src={txn.brandAvatar} name={txn.brandName} size="xs" />
                        <span className="font-bold text-neutral-900 truncate max-w-[120px]">
                          {txn.brandName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400 pl-1 text-[11px]">
                        <span>↳</span>
                        <Avatar src={txn.creatorAvatar} name={txn.creatorName} size="xs" />
                        <span className="font-semibold text-neutral-700 truncate max-w-[120px]">
                          {txn.creatorName}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(txn.type)} size="sm">
                      {txn.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-bold text-neutral-700 tabular-nums">
                    {formatCurrency(txn.grossAmountEur)}
                  </TableCell>

                  <TableCell className="font-bold text-brand-pink tabular-nums">
                    {formatCurrency(txn.platformFeeEur)}
                  </TableCell>

                  <TableCell className="font-black text-neutral-950 tabular-nums text-sm">
                    {formatCurrency(txn.netAmountEur)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(txn.status)}
                      size="sm"
                      dot
                    >
                      {txn.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-bold"
                      onClick={() => setInspectedTxn(txn)}
                      title="Inspect Ledger Entry"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Transaction Details Modal */}
      {inspectedTxn && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedTxn(null)}
          title={
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-black text-white flex items-center justify-center font-mono font-bold text-xs">
                TX
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-950">
                  Transaction Audit: {inspectedTxn.id}
                </h3>
                <p className="text-xs text-neutral-400 font-medium">
                  Invoice {inspectedTxn.invoiceNumber} • Logged at {inspectedTxn.createdAt}
                </p>
              </div>
            </div>
          }
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono text-neutral-400 truncate max-w-xs">
                Stripe ID: {inspectedTxn.stripePaymentIntentId}
              </span>
              <Button
                variant="primary"
                size="sm"
                className="font-bold"
                onClick={() => setInspectedTxn(null)}
              >
                Close Audit View
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Financial Summary Card */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  Gross Escrow
                </span>
                <p className="text-lg font-black text-neutral-950 mt-0.5 tabular-nums">
                  {formatCurrency(inspectedTxn.grossAmountEur)}
                </p>
              </div>
              <div className="border-x border-neutral-200 px-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-pink">
                  Platform Take (15%)
                </span>
                <p className="text-lg font-black text-brand-pink mt-0.5 tabular-nums">
                  {formatCurrency(inspectedTxn.platformFeeEur)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Net Disbursed
                </span>
                <p className="text-lg font-black text-emerald-700 mt-0.5 tabular-nums">
                  {formatCurrency(inspectedTxn.netAmountEur)}
                </p>
              </div>
            </div>

            {/* Campaign & Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  Originating Brand
                </span>
                <div className="flex items-center gap-2.5">
                  <Avatar src={inspectedTxn.brandAvatar} name={inspectedTxn.brandName} size="sm" />
                  <div>
                    <h5 className="font-extrabold text-neutral-950">{inspectedTxn.brandName}</h5>
                    <p className="text-neutral-400 text-[11px]">Primary Payer</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  Commissioned Creator
                </span>
                <div className="flex items-center gap-2.5">
                  <Avatar src={inspectedTxn.creatorAvatar} name={inspectedTxn.creatorName} size="sm" />
                  <div>
                    <h5 className="font-extrabold text-neutral-950">{inspectedTxn.creatorName}</h5>
                    <p className="text-neutral-400 text-[11px]">Beneficiary Recipient</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Payment Rails Details */}
            <div className="border border-neutral-200 rounded-xl p-4 divide-y divide-neutral-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Gateway Protocol</span>
                <span className="font-extrabold text-neutral-900 uppercase">
                  {inspectedTxn.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Stripe Payment Intent ID</span>
                <span className="font-mono text-neutral-800 font-bold">
                  {inspectedTxn.stripePaymentIntentId}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Escrow Smart Custody Status</span>
                <Badge variant={getStatusBadgeVariant(inspectedTxn.status)} size="sm" dot>
                  {inspectedTxn.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Campaign Reference</span>
                <span className="font-bold text-neutral-900">{inspectedTxn.campaignTitle}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
