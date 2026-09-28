import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { arbitrateDispute } from '@/store/slices/escrowSlice';
import { approveRequest, rejectRequest } from '@/store/slices/verificationSlice';
import { ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import {
  TrendingUp,
  ShieldCheck,
  Scale,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Euro,
  FileCheck,
  Receipt,
  ShoppingBag,
  Maximize2,
  Calendar,
  Clock,
  Check,
  X,
  FileText,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { EscrowDispute, VerificationRequest, MarketplaceOrder } from '@/types/admin.types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const disputes = useAppSelector((state) => state.escrow.disputes);
  const openDisputes = disputes.filter((d) => d.status === 'open');

  const verifications = useAppSelector((state) => state.verification.requests);
  const pendingVerifications = verifications.filter((r) => r.status === 'pending');

  const users = useAppSelector((state) => state.users.users);
  const orders = useAppSelector((state) => state.orders.orders);
  const activeOrders = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  );

  // Selected items for Full-Screen Dossier Modals
  const [selectedDispute, setSelectedDispute] = useState<EscrowDispute | null>(null);
  const [selectedVerification, setSelectedVerification] =
    useState<VerificationRequest | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);

  // Chart Hover States
  const [hoveredUserMonth, setHoveredUserMonth] = useState<number | null>(null);
  const [hoveredIncomeMonth, setHoveredIncomeMonth] = useState<number | null>(null);

  // Operational Table View Tab
  const [activeOperationalTab, setActiveOperationalTab] = useState<
    'disputes' | 'kyc' | 'orders'
  >('disputes');

  // Chart 1: Total User Growth (Dual Breakdown: Creators vs Brands)
  const userGrowthData = [
    { month: 'Apr', creators: 1120, brands: 380, total: 1500, creatorGrowth: '+12%', brandGrowth: '+8%' },
    { month: 'May', creators: 1340, brands: 440, total: 1780, creatorGrowth: '+19%', brandGrowth: '+15%' },
    { month: 'Jun', creators: 1560, brands: 510, total: 2070, creatorGrowth: '+16%', brandGrowth: '+15%' },
    { month: 'Jul', creators: 1750, brands: 590, total: 2340, creatorGrowth: '+12%', brandGrowth: '+15%' },
    { month: 'Aug', creators: 1930, brands: 660, total: 2590, creatorGrowth: '+10%', brandGrowth: '+11%' },
    { month: 'Sep', creators: 2120, brands: 720, total: 2840, creatorGrowth: '+9.8%', brandGrowth: '+9.1%' },
  ];

  // Chart 2: Income Growth (GMV and 15% Net Commission Fee)
  const incomeGrowthData = [
    { month: 'Apr', gmv: 680000, netFee: 102000, labelGmv: '€680k', labelFee: '€102k' },
    { month: 'May', gmv: 790000, netFee: 118500, labelGmv: '€790k', labelFee: '€118.5k' },
    { month: 'Jun', gmv: 920000, netFee: 138000, labelGmv: '€920k', labelFee: '€138k' },
    { month: 'Jul', gmv: 1040000, netFee: 156000, labelGmv: '€1.04M', labelFee: '€156k' },
    { month: 'Aug', gmv: 1150000, netFee: 172500, labelGmv: '€1.15M', labelFee: '€172.5k' },
    { month: 'Sep', gmv: 1248500, netFee: 187275, labelGmv: '€1.25M', labelFee: '€187.3k' },
  ];

  const maxTotalUsers = 3200;
  const maxGmv = 1400000;

  // Handlers for modal arbitration & verification
  const handleArbitrate = (
    decision: 'resolved_creator' | 'resolved_brand' | 'resolved_split',
    splitRatio?: string
  ) => {
    if (!selectedDispute) return;
    dispatch(
      arbitrateDispute({
        disputeId: selectedDispute.id,
        decision,
        splitRatio,
      })
    );
    setSelectedDispute(null);
  };

  const handleApproveKyc = (id: string) => {
    dispatch(approveRequest(id));
    setSelectedVerification(null);
  };

  const handleRejectKyc = (id: string) => {
    dispatch(rejectRequest({ id, reason: 'Identity document unverified or illegible.' }));
    setSelectedVerification(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Overview"
        subtitle="Platform metrics, escrow, and active operations."
        badge={
          <Badge variant="success" size="sm" dot>
            Operational
          </Badge>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="font-bold text-xs"
              onClick={() => navigate(ROUTES.DASHBOARD.ORDERS)}
              leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
            >
              Orders ({activeOrders.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-bold text-xs"
              onClick={() => navigate(ROUTES.DASHBOARD.TRANSACTIONS)}
              leftIcon={<Receipt className="w-3.5 h-3.5" />}
            >
              Transactions
            </Button>
            <Button
              variant="accent"
              size="sm"
              className="font-bold text-xs"
              onClick={() => navigate(ROUTES.DASHBOARD.ESCROW)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Disputes ({openDisputes.length})
            </Button>
          </>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Volume"
          value="€1,248,500"
          change={18.4}
          icon={<TrendingUp className="w-4 h-4" />}
          accentColor="black"
          changePeriod="vs last month"
        />
        <StatCard
          title="In Escrow"
          value="€148,500"
          change={6.2}
          icon={<Euro className="w-4 h-4" />}
          accentColor="pink"
          changePeriod="vs last month"
        />
        <StatCard
          title="Platform Revenue"
          value="€187,275"
          change={21.8}
          icon={<ShieldCheck className="w-4 h-4" />}
          accentColor="emerald"
          changePeriod="vs last month"
        />
        <StatCard
          title="Total Users"
          value="2,840"
          change={14.1}
          icon={<Users className="w-4 h-4" />}
          accentColor="amber"
          changePeriod="vs last month"
        />
      </div>

      {/* DUAL ANALYTICS CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1: USER GROWTH */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-neutral-900">
                  User Growth
                </h3>
                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  +14.1%
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">
                Monthly creator and brand signups
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-bold shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-pink" />
                <span className="text-neutral-700">Creators (2,120)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-950" />
                <span className="text-neutral-700">Brands (720)</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="relative pt-4">
            {/* Hover Tooltip Overlay */}
            {hoveredUserMonth !== null && (
              <div className="absolute top-0 right-4 bg-brand-black text-white px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-3 z-10 animate-in fade-in">
                <span className="text-neutral-300 font-black">
                  {userGrowthData[hoveredUserMonth].month}:
                </span>
                <span className="text-pink-400">
                  {userGrowthData[hoveredUserMonth].creators.toLocaleString()} Creators
                </span>
                <span>•</span>
                <span className="text-white">
                  {userGrowthData[hoveredUserMonth].brands.toLocaleString()} Brands
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-black">
                  Total: {userGrowthData[hoveredUserMonth].total.toLocaleString()}
                </span>
              </div>
            )}

            {/* SVG Visual */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-neutral-100">
              {userGrowthData.map((item, index) => {
                const creatorHeight = (item.creators / maxTotalUsers) * 100;
                const brandHeight = (item.brands / maxTotalUsers) * 100;
                const isHovered = hoveredUserMonth === index;

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredUserMonth(index)}
                    onMouseLeave={() => setHoveredUserMonth(null)}
                  >
                    <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-full">
                      {/* Creator Bar (Pink) */}
                      <div
                        style={{ height: `${creatorHeight}%` }}
                        className={`w-1/2 bg-brand-pink rounded-t-md transition-all duration-200 ${
                          isHovered ? 'brightness-110 shadow-md shadow-brand-pink/30' : 'hover:opacity-90'
                        }`}
                      />
                      {/* Brand Bar (Onyx Black) */}
                      <div
                        style={{ height: `${brandHeight}%` }}
                        className={`w-1/2 bg-brand-black rounded-t-md transition-all duration-200 ${
                          isHovered ? 'bg-neutral-800 shadow-md' : 'hover:opacity-90'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs mt-2 transition-colors ${
                        isHovered ? 'font-black text-brand-pink' : 'font-extrabold text-neutral-500'
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary Bar */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center">
              <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] font-black uppercase text-neutral-400">Total Users</div>
                <div className="text-sm font-black text-neutral-900 tabular-nums">2,840</div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] font-black uppercase text-neutral-400">Ratio</div>
                <div className="text-sm font-black text-brand-pink tabular-nums">2.9 : 1</div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] font-black uppercase text-neutral-400">Retention</div>
                <div className="text-sm font-black text-emerald-600 tabular-nums">94.2%</div>
              </div>
            </div>
          </div>
        </Card>

        {/* CHART 2: REVENUE (Curved Trend Area Chart for Visual Hierarchy) */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-neutral-900">
                  Revenue
                </h3>
                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  +21.8%
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">
                Gross GMV and 15% platform fees trajectory
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-bold shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-neutral-400" />
                <span className="text-neutral-500 font-medium">GMV</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 rounded-full bg-emerald-500" />
                <span className="text-neutral-900 font-bold">15% Fee</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="relative pt-4">
            {/* Hover Tooltip Overlay */}
            {hoveredIncomeMonth !== null && (
              <div className="absolute top-0 right-4 bg-brand-black text-white px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-3 z-10 animate-in fade-in">
                <span className="text-neutral-300 font-black">
                  {incomeGrowthData[hoveredIncomeMonth].month}:
                </span>
                <span className="text-neutral-300">
                  GMV: {formatCurrency(incomeGrowthData[hoveredIncomeMonth].gmv)}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-black">
                  15% Fee: {formatCurrency(incomeGrowthData[hoveredIncomeMonth].netFee)}
                </span>
              </div>
            )}

            {/* SVG Curved Area & Trend Line Visual */}
            <div className="h-56 flex flex-col justify-between pt-2">
              <svg
                viewBox="0 0 500 180"
                className="w-full h-44 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
                    <stop offset="50%" stopColor="#10B981" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="35" y1="35" x2="465" y2="35" stroke="#F4F4F0" strokeDasharray="3 3" />
                <line x1="35" y1="75" x2="465" y2="75" stroke="#F4F4F0" strokeDasharray="3 3" />
                <line x1="35" y1="115" x2="465" y2="115" stroke="#F4F4F0" strokeDasharray="3 3" />
                <line x1="35" y1="155" x2="465" y2="155" stroke="#E7E7E2" strokeWidth="1" />

                {/* Active Hover Crosshair Line */}
                {hoveredIncomeMonth !== null && (
                  <line
                    x1={[35, 121, 207, 293, 379, 465][hoveredIncomeMonth]}
                    y1="20"
                    x2={[35, 121, 207, 293, 379, 465][hoveredIncomeMonth]}
                    y2="155"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* GMV Trendline (Dashed Neutral) */}
                <path
                  d="M 35,125 C 78,125 78,108 121,108 C 164,108 164,88 207,88 C 250,88 250,68 293,68 C 336,68 336,52 379,52 C 422,52 422,38 465,38"
                  fill="none"
                  stroke="#A3A39E"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* 15% Fee Gradient Area Fill */}
                <path
                  d="M 35,130 C 78,130 78,112 121,112 C 164,112 164,90 207,90 C 250,90 250,70 293,70 C 336,70 336,51 379,51 C 422,51 422,34 465,34 L 465,155 L 35,155 Z"
                  fill="url(#revenueAreaGrad)"
                />

                {/* 15% Fee Main Line */}
                <path
                  d="M 35,130 C 78,130 78,112 121,112 C 164,112 164,90 207,90 C 250,90 250,70 293,70 C 336,70 336,51 379,51 C 422,51 422,34 465,34"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                />

                {/* Interactive Data Point Nodes */}
                {[
                  { x: 35, y: 130 },
                  { x: 121, y: 112 },
                  { x: 207, y: 90 },
                  { x: 293, y: 70 },
                  { x: 379, y: 51 },
                  { x: 465, y: 34 },
                ].map((pt, idx) => {
                  const isHovered = hoveredIncomeMonth === idx;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIncomeMonth(idx)}
                      onMouseLeave={() => setHoveredIncomeMonth(null)}
                    >
                      <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="8"
                          fill="#10B981"
                          fillOpacity="0.2"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5 : 3.5}
                        fill="#FFFFFF"
                        stroke="#10B981"
                        strokeWidth={isHovered ? 2.5 : 2}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* X-Axis Month Labels */}
              <div className="flex justify-between px-5 pt-1 border-b border-neutral-100 pb-2">
                {incomeGrowthData.map((item, index) => {
                  const isHovered = hoveredIncomeMonth === index;
                  return (
                    <button
                      key={item.month}
                      type="button"
                      onMouseEnter={() => setHoveredIncomeMonth(index)}
                      onMouseLeave={() => setHoveredIncomeMonth(null)}
                      className={`text-xs transition-colors cursor-pointer ${
                        isHovered
                          ? 'font-black text-emerald-600'
                          : 'font-extrabold text-neutral-400 hover:text-neutral-700'
                      }`}
                    >
                      {item.month}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Summary Bar */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center">
              <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] font-black uppercase text-neutral-400">GMV</div>
                <div className="text-sm font-black text-neutral-900 tabular-nums">€1.25M</div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] font-black uppercase text-neutral-400">Take-Rate</div>
                <div className="text-sm font-black text-emerald-600 tabular-nums">15%</div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="text-[10px] font-black uppercase text-neutral-400">Net Fees</div>
                <div className="text-sm font-black text-neutral-900 tabular-nums">€187.3k</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* OPERATIONAL TRAYS */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
          <button
            onClick={() => setActiveOperationalTab('disputes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeOperationalTab === 'disputes'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Disputes ({openDisputes.length})</span>
          </button>

          <button
            onClick={() => setActiveOperationalTab('kyc')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeOperationalTab === 'kyc'
                ? 'bg-brand-pink text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Verifications ({pendingVerifications.length})</span>
          </button>

          <button
            onClick={() => setActiveOperationalTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeOperationalTab === 'orders'
                ? 'bg-brand-black text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({activeOrders.length})</span>
          </button>
        </div>

        {/* TRAY 1: ESCROW ARBITRATION DOCKET TABLE CARD */}
        {activeOperationalTab === 'disputes' && (
          <Card className="border-rose-200/80">
            <CardHeader className="bg-rose-50/40 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-rose-950 font-black">
                      Disputes
                    </CardTitle>
                    <p className="text-xs text-rose-700 font-medium">
                      {openDisputes.length} cases requiring ruling
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white font-bold text-xs"
                  onClick={() => navigate(ROUTES.DASHBOARD.ESCROW)}
                >
                  All Disputes
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {openDisputes.length === 0 ? (
                <div className="p-8 text-center text-xs font-medium text-neutral-500">
                  No active disputes.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold text-xs">
                      <tr>
                        <th className="px-6 py-3">Case</th>
                        <th className="px-6 py-3">Campaign</th>
                        <th className="px-6 py-3">Parties</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {openDisputes.map((dispute) => (
                        <tr
                          key={dispute.id}
                          onClick={() => setSelectedDispute(dispute)}
                          className="hover:bg-rose-50/30 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-black text-rose-900 bg-rose-100 px-2 py-0.5 rounded">
                              {dispute.id}
                            </span>
                            <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
                              #{dispute.orderId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-extrabold text-neutral-900 text-xs">
                              {dispute.campaignTitle}
                            </div>
                            <div className="text-neutral-500 line-clamp-1 font-medium max-w-xs text-[11px]">
                              {dispute.disputeReason}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className="space-y-0.5">
                              <div>
                                <span className="text-neutral-400">Brand: </span>
                                <strong className="font-bold text-neutral-900">
                                  {dispute.brandName}
                                </strong>
                              </div>
                              <div>
                                <span className="text-neutral-400">Creator: </span>
                                <strong className="font-bold text-neutral-900">
                                  {dispute.creatorName}
                                </strong>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-neutral-950 text-xs tabular-nums">
                              {formatCurrency(dispute.amountEur)}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-medium">
                              Fee: {formatCurrency(dispute.feeEur)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="danger" size="sm" dot>
                              Pending
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="font-bold text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDispute(dispute);
                              }}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TRAY 2: CREATOR KYC QUEUE TABLE CARD */}
        {activeOperationalTab === 'kyc' && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-brand-pink">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="font-black">Verifications</CardTitle>
                    <p className="text-xs text-neutral-500 font-medium">
                      {pendingVerifications.length} badge audits pending
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs"
                  onClick={() => navigate(ROUTES.DASHBOARD.VERIFICATION)}
                >
                  All Requests
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {pendingVerifications.length === 0 ? (
                <div className="p-8 text-center text-xs font-medium text-neutral-500">
                  Verification queue is empty.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold text-xs">
                      <tr>
                        <th className="px-6 py-3">Creator</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Followers</th>
                        <th className="px-6 py-3">Sample</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {pendingVerifications.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedVerification(item)}
                          className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={item.avatar} name={item.creatorName} size="sm" />
                              <div>
                                <div className="font-extrabold text-neutral-950 text-xs">
                                  {item.creatorName}
                                </div>
                                <div className="text-neutral-400 font-medium">@{item.handle}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-neutral-800">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 font-black text-neutral-900 tabular-nums">
                            {item.followersTotal}
                          </td>
                          <td className="px-6 py-4 font-medium text-neutral-600 max-w-xs truncate">
                            "{item.sampleWorkTitle}"
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="warning" size="sm" dot>
                              Pending
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="primary"
                              size="sm"
                              className="font-bold text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVerification(item);
                              }}
                            >
                              Audit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TRAY 3: LIVE ACTIVE ORDERS TABLE CARD */}
        {activeOperationalTab === 'orders' && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="font-black">Active Orders</CardTitle>
                    <p className="text-xs text-neutral-500 font-medium">
                      In-flight campaign delivery
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs"
                  onClick={() => navigate(ROUTES.DASHBOARD.ORDERS)}
                >
                  All Orders
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold text-xs">
                    <tr>
                      <th className="px-6 py-3">Order</th>
                      <th className="px-6 py-3">Package</th>
                      <th className="px-6 py-3">Brand</th>
                      <th className="px-6 py-3">Creator</th>
                      <th className="px-6 py-3">Escrow</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {activeOrders.slice(0, 5).map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-black text-neutral-950">
                          {order.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-neutral-950 text-sm">
                            {order.packageTitle}
                          </div>
                          <div className="text-[11px] text-neutral-400 font-medium">
                            Tier: {order.packageTier.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-neutral-900">
                          {order.brandName}
                        </td>
                        <td className="px-6 py-4 font-bold text-neutral-900">
                          {order.creatorName}
                        </td>
                        <td className="px-6 py-4 font-black text-neutral-950 tabular-nums text-sm">
                          {formatCurrency(order.grossAmountEur)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              order.status === 'in_progress'
                                ? 'default'
                                : order.status === 'deliverable_submitted'
                                ? 'pink'
                                : order.status === 'revision_requested'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                            dot
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-extrabold text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* FULL-SCREEN CASE DOSSIER MODAL: ESCROW DISPUTE */}
      {selectedDispute && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDispute(null)}
          title={`Dispute ${selectedDispute.id}`}
          maxWidth="2xl"
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
              <span className="text-xs text-neutral-500 font-semibold">
                Binding Arbitrator Jurisdiction • Escrow Total: {formatCurrency(selectedDispute.amountEur)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-extrabold"
                  onClick={() => setSelectedDispute(null)}
                >
                  Close Dossier
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="font-extrabold"
                  onClick={() => handleArbitrate('resolved_brand')}
                >
                  Refund 100% to Brand
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="font-extrabold"
                  onClick={() => handleArbitrate('resolved_split', '50/50')}
                >
                  50/50 Split Settlement
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  className="font-extrabold"
                  onClick={() => handleArbitrate('resolved_creator')}
                >
                  Release 100% to Creator
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 text-xs text-neutral-800">
            {/* Case Overview Banner */}
            <div className="p-4 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">
                  Active Dispute Mediation
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedDispute.campaignTitle}
                </h3>
                <p className="text-xs text-neutral-300 font-medium mt-1">
                  Order Ref: #{selectedDispute.orderId} • Submitted: {selectedDispute.submittedDate}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-emerald-400 tabular-nums">
                  {formatCurrency(selectedDispute.amountEur)}
                </div>
                <div className="text-[11px] text-neutral-400 font-semibold">
                  Escrow Custody Hold
                </div>
              </div>
            </div>

            {/* Disputing Parties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-neutral-400">
                  Complainant Brand
                </span>
                <div className="text-sm font-extrabold text-neutral-950">
                  {selectedDispute.brandName}
                </div>
                <p className="text-neutral-600 leading-relaxed font-medium">
                  {selectedDispute.briefSummary}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-neutral-400">
                  Responding Creator
                </span>
                <div className="text-sm font-extrabold text-neutral-950">
                  {selectedDispute.creatorName}
                </div>
                <p className="text-neutral-600 leading-relaxed font-medium">
                  Contends that brief deliverables were fulfilled according to initial creative storyboard guidelines.
                </p>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Disputed Vault Breakdown
              </span>
              <div className="grid grid-cols-3 gap-3 text-center pt-2">
                <div className="p-2.5 rounded-lg bg-neutral-50">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Locked Escrow</div>
                  <div className="text-sm font-black text-neutral-900 tabular-nums">
                    {formatCurrency(selectedDispute.amountEur)}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-50">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Take-Rate Fee (15%)</div>
                  <div className="text-sm font-black text-brand-pink tabular-nums">
                    {formatCurrency(selectedDispute.feeEur)}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-50">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">Creator Net Payout</div>
                  <div className="text-sm font-black text-emerald-600 tabular-nums">
                    {formatCurrency(selectedDispute.amountEur - selectedDispute.feeEur)}
                  </div>
                </div>
              </div>
            </div>

            {/* Deliverable Evidence Link */}
            <div className="p-4 rounded-xl border border-dashed border-neutral-300 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-neutral-900">Submitted Deliverable Proof</span>
                <p className="text-neutral-500 text-[11px] font-medium">
                  Review original 4K video asset submitted by creator for milestone sign-off.
                </p>
              </div>
              <a
                href={selectedDispute.deliverableLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-900 flex items-center gap-1.5"
              >
                <span>Open Asset</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* FULL-SCREEN CASE DOSSIER MODAL: CREATOR KYC AUDIT */}
      {selectedVerification && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedVerification(null)}
          title={`Verify @${selectedVerification.handle}`}
          maxWidth="2xl"
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
              <span className="text-xs text-neutral-500 font-semibold">
                Persona Verified ID • Candidate: @{selectedVerification.handle}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-extrabold"
                  onClick={() => setSelectedVerification(null)}
                >
                  Close
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="font-extrabold"
                  onClick={() => handleRejectKyc(selectedVerification.id)}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                >
                  Reject Candidate
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  className="font-extrabold"
                  onClick={() => handleApproveKyc(selectedVerification.id)}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Approve Verified Badge
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 text-xs text-neutral-800">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <Avatar
                src={selectedVerification.avatar}
                name={selectedVerification.creatorName}
                size="xl"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-neutral-950">
                    {selectedVerification.creatorName}
                  </h3>
                  <Badge variant="pink" size="sm">
                    {selectedVerification.category}
                  </Badge>
                </div>
                <div className="text-neutral-500 font-bold">@{selectedVerification.handle}</div>
                <div className="text-[11px] text-neutral-400 font-medium">
                  Application Submitted: {selectedVerification.submittedDate}
                </div>
              </div>
            </div>

            {/* Audience Authenticity Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl border border-neutral-200 bg-white">
                <div className="text-[10px] font-black uppercase text-neutral-400">Total Audience</div>
                <div className="text-base font-black text-neutral-900 tabular-nums">
                  {selectedVerification.followersTotal}
                </div>
              </div>
              <div className="p-3 rounded-xl border border-neutral-200 bg-white">
                <div className="text-[10px] font-black uppercase text-neutral-400">Authenticity</div>
                <div className="text-base font-black text-emerald-600 tabular-nums">98.4%</div>
              </div>
              <div className="p-3 rounded-xl border border-neutral-200 bg-white">
                <div className="text-[10px] font-black uppercase text-neutral-400">Avg Engagement</div>
                <div className="text-base font-black text-brand-pink tabular-nums">4.8%</div>
              </div>
            </div>

            {/* Sample Work Assessment */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
              <span className="font-black text-neutral-900 uppercase tracking-wider text-xs">
                Audited Work Sample
              </span>
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-neutral-900">
                    "{selectedVerification.sampleWorkTitle}"
                  </div>
                  <div className="text-neutral-500 font-medium text-[11px] mt-0.5">
                    Portfolio showcase piece submitted for high-ticket brand partnerships.
                  </div>
                </div>
                <a
                  href={selectedVerification.sampleWorkUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-bold text-neutral-900 flex items-center gap-1.5 hover:bg-neutral-50"
                >
                  <span>Inspect</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* FULL-SCREEN CASE DOSSIER MODAL: ACTIVE ORDER */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-neutral-500 font-semibold">
                Status: {selectedOrder.status.replace('_', ' ').toUpperCase()}
              </span>
              <Button
                variant="accent"
                size="sm"
                className="font-extrabold"
                onClick={() => setSelectedOrder(null)}
              >
                Done
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-neutral-800">
            <div className="p-4 rounded-2xl bg-neutral-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase text-pink-400">
                  Campaign Order #{selectedOrder.id}
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {selectedOrder.packageTitle}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-emerald-400 tabular-nums">
                  {formatCurrency(selectedOrder.grossAmountEur)}
                </div>
                <div className="text-[11px] text-neutral-400 font-semibold">In Escrow</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] uppercase font-black text-neutral-400">Brand</span>
                <div className="font-extrabold text-sm text-neutral-900">{selectedOrder.brandName}</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] uppercase font-black text-neutral-400">Creator</span>
                <div className="font-extrabold text-sm text-neutral-900">{selectedOrder.creatorName}</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-black text-neutral-900 uppercase tracking-wider text-xs">
                Milestones & Timeline
              </span>
              <div className="space-y-1.5">
                {selectedOrder.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-extrabold text-neutral-900">{m.title}</span>
                    </div>
                    <span className="text-neutral-400 font-semibold">{m.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
