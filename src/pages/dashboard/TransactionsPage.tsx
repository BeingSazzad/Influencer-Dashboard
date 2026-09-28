import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setTransactionSearchQuery,
  setTransactionStatusFilter,
} from '@/store/slices/transactionsSlice';
import {
  MarketplaceTransaction,
  TransactionStatus,
} from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Download,
  Search,
  CheckCircle2,
  ChevronDown,
  FileText,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, searchQuery, statusFilter } = useAppSelector(
    (state) => state.transactions
  );

  const [inspectedTxn, setInspectedTxn] = useState<MarketplaceTransaction | null>(null);
  const [exportNotice, setExportNotice] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Filter transactions: strictly platform fee records matching search and status
  const filteredTransactions = transactions.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.orderId.toLowerCase().includes(q) ||
      t.brandName.toLowerCase().includes(q) ||
      t.creatorName.toLowerCase().includes(q) ||
      t.stripePaymentIntentId.toLowerCase().includes(q) ||
      t.invoiceNumber.toLowerCase().includes(q) ||
      t.campaignTitle.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && t.status === 'completed') ||
      (statusFilter === 'escrow_locked' && t.status === 'escrow_locked');

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTransactions = filteredTransactions.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  const handleExportCSV = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'escrow_locked':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle="Platform commission revenue ledger and marketplace settlements."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="font-bold text-xs"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Ledger
          </Button>
        }
      />

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Platform fee ledger exported (influverse_platform_fees_sept2026.csv).</span>
        </div>
      )}


      {/* Minimal Control Panel: Search & Status Selector (No Unnecessary Tabs) */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order ID, invoice, brand, or creator..."
              value={searchQuery}
              onChange={(e) => {
                dispatch(setTransactionSearchQuery(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink font-medium text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Status Dropdown with Positioned Chevron */}
          <div className="relative sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                dispatch(setTransactionStatusFilter(e.target.value as any));
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-3 pr-8 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 outline-none focus:border-brand-pink cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">All Settlements</option>
              <option value="completed">Settled to Treasury</option>
              <option value="escrow_locked">In Escrow (Pending)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Financial Platform Revenue Ledger Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-neutral-500 font-medium">
                  No platform revenue transactions found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  {/* Order ID */}
                  <TableCell>
                    <span className="font-mono text-sm font-bold text-neutral-900">
                      {txn.orderId}
                    </span>
                  </TableCell>

                  {/* Campaign */}
                  <TableCell>
                    <span
                      className="font-bold text-neutral-950 text-sm block truncate max-w-[320px]"
                      title={txn.campaignTitle}
                    >
                      {txn.campaignTitle}
                    </span>
                  </TableCell>

                  {/* Revenue */}
                  <TableCell>
                    <span className="text-sm font-black text-emerald-700 tabular-nums">
                      +{formatCurrency(txn.platformFeeEur)}
                    </span>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-sm font-semibold text-neutral-600 whitespace-nowrap">
                    {formatDate(txn.createdAt)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(txn.status)}
                      size="sm"
                      dot
                    >
                      {txn.status === 'completed' ? 'Settled' : 'In Escrow'}
                    </Badge>
                  </TableCell>

                  {/* Action: View Receipt */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm h-8 px-2.5 font-bold text-neutral-800 hover:text-neutral-950"
                      onClick={() => setInspectedTxn(txn)}
                    >
                      <FileText className="w-4 h-4 mr-1 text-neutral-500" />
                      Receipt
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
            totalItems={filteredTransactions.length}
            pageSize={pageSize}
            pageSizeOptions={[8, 16, 24]}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="revenue records"
          />
        </div>
      </Card>

      {/* Transaction Platform Fee Receipt Modal */}
      {inspectedTxn && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedTxn(null)}
          title={
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-black text-white flex items-center justify-center font-mono font-bold text-xs">
                15%
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Platform Fee Receipt: {inspectedTxn.invoiceNumber}
                </h3>
                <p className="text-xs text-neutral-500 font-semibold">
                  Campaign Order {inspectedTxn.orderId} • {formatDate(inspectedTxn.createdAt)}
                </p>
              </div>
            </div>
          }
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono text-neutral-500 truncate max-w-xs">
                Stripe Transfer ID: {inspectedTxn.stripePaymentIntentId}
              </span>
              <Button
                variant="primary"
                size="sm"
                className="font-bold"
                onClick={() => setInspectedTxn(null)}
              >
                Close Receipt
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Financial Commission Calculation Summary */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  Deal Gross Value
                </span>
                <p className="text-lg font-black text-neutral-950 mt-0.5 tabular-nums">
                  {formatCurrency(inspectedTxn.grossAmountEur)}
                </p>
              </div>
              <div className="border-x border-neutral-200 px-2 bg-pink-50/50 rounded-lg">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-pink">
                  Platform Revenue (15%)
                </span>
                <p className="text-lg font-black text-brand-pink mt-0.5 tabular-nums">
                  +{formatCurrency(inspectedTxn.platformFeeEur)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600">
                  Net Creator Payout (85%)
                </span>
                <p className="text-lg font-black text-neutral-950 mt-0.5 tabular-nums">
                  {formatCurrency(inspectedTxn.grossAmountEur - inspectedTxn.platformFeeEur)}
                </p>
              </div>
            </div>

            {/* Campaign & Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  Hiring Brand (Fee Payer)
                </span>
                <div className="flex items-center gap-2.5">
                  <Avatar src={inspectedTxn.brandAvatar} name={inspectedTxn.brandName} size="sm" />
                  <div>
                    <h5 className="font-extrabold text-neutral-950">{inspectedTxn.brandName}</h5>
                    <p className="text-neutral-500 text-[11px] font-medium">B2B Verified Account</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  Contracted Creator
                </span>
                <div className="flex items-center gap-2.5">
                  <Avatar src={inspectedTxn.creatorAvatar} name={inspectedTxn.creatorName} size="sm" />
                  <div>
                    <h5 className="font-extrabold text-neutral-950">{inspectedTxn.creatorName}</h5>
                    <p className="text-neutral-500 text-[11px] font-medium">Content Producer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Payment Rails Details */}
            <div className="border border-neutral-200 rounded-xl p-4 divide-y divide-neutral-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Settlement Route</span>
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
                <span className="text-neutral-500 font-medium">Treasury Settlement Status</span>
                <Badge variant={getStatusBadgeVariant(inspectedTxn.status)} size="sm" dot>
                  {inspectedTxn.status === 'completed' ? 'Settled to Admin Treasury' : 'Held in Escrow'}
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
