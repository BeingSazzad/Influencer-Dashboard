import React, { useState, useRef, useEffect } from 'react';
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
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  Download,
  Search,
  CheckCircle2,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Printer,
  X,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, searchQuery, statusFilter } = useAppSelector(
    (state) => state.transactions
  );

  const [inspectedTxn, setInspectedTxn] = useState<MarketplaceTransaction | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; subtext?: string; type?: 'success' | 'info' } | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportOpen]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  // Filter transactions: strictly records matching search and status
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

  // 1. Real RFC-compliant Excel / CSV Export with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Order ID',
      'Invoice Number',
      'Date',
      'Campaign Title',
      'Brand',
      'Creator',
      'Gross Amount (EUR)',
      'VAT / Settlement (EUR)',
      'Net Payout (EUR)',
      'Status',
      'Payment Method',
      'Stripe Payment Intent ID',
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.id}"`,
      `"${t.orderId}"`,
      `"${t.invoiceNumber}"`,
      `"${t.createdAt}"`,
      `"${t.campaignTitle.replace(/"/g, '""')}"`,
      `"${t.brandName.replace(/"/g, '""')}"`,
      `"${t.creatorName.replace(/"/g, '""')}"`,
      t.grossAmountEur.toFixed(2),
      t.platformFeeEur.toFixed(2),
      (t.grossAmountEur - t.platformFeeEur).toFixed(2),
      `"${t.status === 'completed' ? 'Settled' : 'In Escrow'}"`,
      `"${t.paymentMethod}"`,
      `"${t.stripePaymentIntentId}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `influverse_transactions_ledger_${dateStr}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: 'Excel / CSV Downloaded',
      subtext: `Exported ${filteredTransactions.length} records to ${fileName}`,
      type: 'success',
    });
  };

  // 2. Real Executive PDF Statement Generation
  const handleExportPDF = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const totalGross = filteredTransactions.reduce((acc, t) => acc + t.grossAmountEur, 0);
    const totalSettled = filteredTransactions
      .filter((t) => t.status === 'completed')
      .reduce((acc, t) => acc + t.grossAmountEur, 0);
    const totalEscrow = filteredTransactions
      .filter((t) => t.status === 'escrow_locked')
      .reduce((acc, t) => acc + t.grossAmountEur, 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setToast({
        message: 'Pop-up blocked',
        subtext: 'Please allow pop-ups to print or save the PDF report.',
        type: 'info',
      });
      return;
    }

    const tableRowsHtml = filteredTransactions
      .map(
        (t) => `
      <tr>
        <td style="font-family: monospace; font-size: 11px; font-weight: 600;">${t.orderId}</td>
        <td style="font-family: monospace; font-size: 11px; color: #475569;">${t.invoiceNumber}</td>
        <td style="font-weight: 600;">${t.campaignTitle}</td>
        <td>${t.brandName}</td>
        <td>${t.creatorName}</td>
        <td style="text-align: right; font-weight: 700;">€${t.grossAmountEur.toLocaleString()}</td>
        <td style="text-align: right; font-weight: 700; color: #047857;">€${(t.grossAmountEur - t.platformFeeEur).toLocaleString()}</td>
        <td style="text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; ${
            t.status === 'completed'
              ? 'background: #ecfdf5; color: #065f46;'
              : 'background: #fef3c7; color: #92400e;'
          }">
            ${t.status === 'completed' ? 'Settled' : 'In Escrow'}
          </span>
        </td>
        <td style="font-size: 11px; color: #64748b;">${t.createdAt}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Influverse_Financial_Statement_${new Date().toISOString().slice(0, 10)}</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4 landscape; margin: 12mm 15mm; }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 24px;
              font-size: 12px;
              background: #fff;
            }
            .action-bar {
              background: #0f172a;
              color: white;
              padding: 12px 20px;
              border-radius: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .brand-title {
              font-size: 24px;
              font-weight: 900;
              letter-spacing: -0.5px;
              color: #0f172a;
            }
            .brand-title span { color: #f43f5e; }
            .report-tag {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #f43f5e;
              margin-top: 4px;
            }
            .meta-info {
              text-align: right;
              font-size: 11px;
              color: #475569;
              line-height: 1.6;
            }
            .kpi-row {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }
            .kpi-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px 14px;
            }
            .kpi-lbl {
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #64748b;
            }
            .kpi-num {
              font-size: 18px;
              font-weight: 900;
              color: #0f172a;
              margin-top: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            th {
              background: #f1f5f9;
              color: #334155;
              text-align: left;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 9px 10px;
              border-bottom: 1.5px solid #cbd5e1;
            }
            td {
              padding: 9px 10px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 11.5px;
              vertical-align: middle;
            }
            tr:nth-child(even) td {
              background-color: #fafbfc;
            }
            .footer {
              margin-top: 36px;
              padding-top: 14px;
              border-top: 1px solid #cbd5e1;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 10px;
              color: #94a3b8;
            }
            @media print {
              .action-bar { display: none !important; }
              body { padding: 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="action-bar">
            <span style="font-weight: 700; font-size: 13px;">Official Influverse Financial Statement (PDF / Print View)</span>
            <button onclick="window.print()" style="background: #f43f5e; color: white; border: none; padding: 7px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">
              Save as PDF / Print
            </button>
          </div>

          <div class="header">
            <div>
              <div class="brand-title">Influ<span>verse</span></div>
              <div class="report-tag">Official Financial Settlement Statement</div>
            </div>
            <div class="meta-info">
              <div><strong>Generated:</strong> ${dateStr}</div>
              <div><strong>Scope:</strong> ${filteredTransactions.length} Settlement Records</div>
              <div><strong>Currency:</strong> EUR (€) • Treasury Verified</div>
            </div>
          </div>

          <div class="kpi-row">
            <div class="kpi-box">
              <div class="kpi-lbl">Total Gross Volume</div>
              <div class="kpi-num">€${totalGross.toLocaleString()}</div>
            </div>
            <div class="kpi-box">
              <div class="kpi-lbl">Settled to Treasury</div>
              <div class="kpi-num" style="color: #047857;">€${totalSettled.toLocaleString()}</div>
            </div>
            <div class="kpi-box">
              <div class="kpi-lbl">In Escrow Custody</div>
              <div class="kpi-num" style="color: #b45309;">€${totalEscrow.toLocaleString()}</div>
            </div>
            <div class="kpi-box">
              <div class="kpi-lbl">Total Records</div>
              <div class="kpi-num">${filteredTransactions.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Invoice</th>
                <th>Campaign</th>
                <th>Brand</th>
                <th>Creator</th>
                <th style="text-align: right;">Gross (€)</th>
                <th style="text-align: right;">Payout (€)</th>
                <th style="text-align: center;">Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div>Influverse Technologies Ltd. • Automated Escrow Protection System • Confidential Financial Ledger</div>
            <div>Page 1 of 1 • System Verified</div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    setToast({
      message: 'PDF Statement Ready',
      subtext: 'Print & Save as PDF dialog opened.',
      type: 'success',
    });
  };

  // 3. Single Transaction Receipt / Proof PDF
  const handleDownloadProof = (txn: MarketplaceTransaction) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setToast({
        message: 'Pop-up blocked',
        subtext: 'Please allow pop-ups to view or print the receipt.',
        type: 'info',
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${txn.invoiceNumber}</title>
          <meta charset="utf-8" />
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              padding: 32px;
              font-size: 13px;
              line-height: 1.5;
              background: #fff;
            }
            .action-bar {
              background: #0f172a;
              color: white;
              padding: 10px 16px;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .brand { font-size: 28px; font-weight: 900; }
            .brand span { color: #f43f5e; }
            .title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-top: 4px; }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 18px;
            }
            .details-grid dt { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
            .details-grid dd { font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; }
            .receipt-box {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 24px;
            }
            .amount-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px dashed #cbd5e1;
              font-size: 13px;
            }
            .amount-total {
              display: flex;
              justify-content: space-between;
              padding: 14px 0 0 0;
              font-size: 18px;
              font-weight: 900;
            }
            .seal {
              margin-top: 24px;
              padding: 14px;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              border-radius: 10px;
              color: #065f46;
              font-size: 11px;
              text-align: center;
              font-weight: 800;
              letter-spacing: 0.5px;
            }
            @media print {
              .action-bar { display: none !important; }
              body { padding: 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="action-bar">
            <span style="font-weight: 700; font-size: 12px;">Official Settlement Receipt (PDF / Print View)</span>
            <button onclick="window.print()" style="background: #f43f5e; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px;">
              Save as PDF / Print
            </button>
          </div>

          <div class="header">
            <div>
              <div class="brand">Influ<span>verse</span></div>
              <div class="title">Settlement Receipt &amp; Proof of Payment</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.6;">
              <div><strong>Receipt No:</strong> ${txn.invoiceNumber}</div>
              <div><strong>Date:</strong> ${txn.createdAt}</div>
              <div><strong>Order ID:</strong> ${txn.orderId}</div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <dt>Campaign Title</dt>
              <dd>${txn.campaignTitle}</dd>
              <dt>Hiring Brand</dt>
              <dd>${txn.brandName}</dd>
            </div>
            <div>
              <dt>Contracted Creator</dt>
              <dd>${txn.creatorName}</dd>
              <dt>Payment Route / Ref</dt>
              <dd style="font-family: monospace; font-size: 11px;">${txn.stripePaymentIntentId}</dd>
            </div>
          </div>

          <div class="receipt-box">
            <div class="amount-row">
              <span>Total Campaign Value:</span>
              <span style="font-weight: 700;">€${txn.grossAmountEur.toFixed(2)}</span>
            </div>
            <div class="amount-row">
              <span>Marketplace Escrow Settlement:</span>
              <span style="font-weight: 700;">€${txn.platformFeeEur.toFixed(2)}</span>
            </div>
            <div class="amount-total">
              <span>Net Creator Payout:</span>
              <span style="color: #047857;">€${(txn.grossAmountEur - txn.platformFeeEur).toFixed(2)}</span>
            </div>
          </div>

          <div class="seal">
            ✓ 100% ESCROW PROTECTED &amp; VERIFIED BY INFLUVERSE TREASURY PROTOCOL
          </div>

          <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center;">
            Influverse Technologies Ltd. • Automated Escrow Protection System • Transaction Verified
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    setToast({
      message: 'Official Receipt Ready',
      subtext: `Receipt for ${txn.invoiceNumber} opened to save as PDF.`,
      type: 'success',
    });
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
        subtitle="Marketplace settlements and financial transaction records."
        actions={
          <div className="relative inline-block" ref={exportRef}>
            <Button
              variant="outline"
              size="sm"
              className="font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-neutral-50"
              onClick={() => setIsExportOpen(!isExportOpen)}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isExportOpen && 'rotate-180')} />
            </Button>

            {/* Premium Enterprise Export Menu (Excel / CSV + PDF) */}
            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 border-b border-neutral-100 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Export Format Options
                  </span>
                </div>

                {/* Option 1: Excel / CSV */}
                <button
                  type="button"
                  onClick={() => {
                    handleExportCSV();
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-neutral-50 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                      <span>Excel / CSV Spreadsheet</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        .csv
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-medium mt-0.5 leading-snug">
                      Data table with quotes &amp; UTF-8 formatting for Excel and Google Sheets.
                    </p>
                  </div>
                </button>

                {/* Option 2: PDF Statement */}
                <button
                  type="button"
                  onClick={() => {
                    handleExportPDF();
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left hover:bg-neutral-50 transition-colors group cursor-pointer mt-1"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-brand-pink flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 group-hover:text-brand-pink transition-colors flex items-center gap-1.5">
                      <span>Official PDF Statement</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                        .pdf
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-medium mt-0.5 leading-snug">
                      Print-ready executive summary with verified settlement records.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        }
      />


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
                <TableRow
                  key={txn.id}
                  onClick={() => setInspectedTxn(txn)}
                  className="cursor-pointer hover:bg-neutral-50/80 transition-colors group"
                >
                  {/* Order ID */}
                  <TableCell>
                    <span className="font-mono text-sm font-bold text-neutral-900 group-hover:text-brand-pink transition-colors">
                      {txn.orderId}
                    </span>
                  </TableCell>

                  {/* Campaign */}
                  <TableCell>
                    <span
                      className="font-bold text-neutral-950 text-sm block truncate max-w-[380px]"
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
                      className="text-xs h-7 px-2 font-bold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedTxn(txn);
                      }}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1 text-neutral-500" />
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
                  Settlement Receipt: {inspectedTxn.invoiceNumber}
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs"
                  onClick={() => handleDownloadProof(inspectedTxn)}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Download Proof (PDF)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold text-xs"
                  onClick={() => setInspectedTxn(null)}
                >
                  Close Receipt
                </Button>
              </div>
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
                  Platform Revenue (VAT)
                </span>
                <p className="text-lg font-black text-brand-pink mt-0.5 tabular-nums">
                  +{formatCurrency(inspectedTxn.platformFeeEur)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600">
                  Creator payout
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

      {/* Modern Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-neutral-800 animate-in slide-in-from-bottom-5 duration-200 max-w-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs flex-1">
            <p className="font-bold text-neutral-100">{toast.message}</p>
            {toast.subtext && <p className="text-neutral-400 text-[11px] mt-0.5">{toast.subtext}</p>}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
