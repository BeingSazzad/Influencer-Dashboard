import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card } from '@/components/ui/Card';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Euro,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const DashboardPage: React.FC = () => {
  // Year Filter State (2026, 2025, 2024)
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025' | '2024'>('2026');

  // Chart Hover States
  const [hoveredUserMonth, setHoveredUserMonth] = useState<number | null>(null);
  const [hoveredIncomeMonth, setHoveredIncomeMonth] = useState<number | null>(null);

  // 12-Month User Growth Data by Year
  const userGrowthByYear = {
    '2026': [
      { month: 'Jan', creators: 720, brands: 240, total: 960 },
      { month: 'Feb', creators: 890, brands: 290, total: 1180 },
      { month: 'Mar', creators: 1040, brands: 340, total: 1380 },
      { month: 'Apr', creators: 1120, brands: 380, total: 1500 },
      { month: 'May', creators: 1340, brands: 440, total: 1780 },
      { month: 'Jun', creators: 1560, brands: 510, total: 2070 },
      { month: 'Jul', creators: 1750, brands: 590, total: 2340 },
      { month: 'Aug', creators: 1930, brands: 660, total: 2590 },
      { month: 'Sep', creators: 2120, brands: 720, total: 2840 },
      { month: 'Oct', creators: 2320, brands: 790, total: 3110 },
      { month: 'Nov', creators: 2580, brands: 870, total: 3450 },
      { month: 'Dec', creators: 2840, brands: 960, total: 3800 },
    ],
    '2025': [
      { month: 'Jan', creators: 180, brands: 60, total: 240 },
      { month: 'Feb', creators: 220, brands: 75, total: 295 },
      { month: 'Mar', creators: 270, brands: 90, total: 360 },
      { month: 'Apr', creators: 330, brands: 110, total: 440 },
      { month: 'May', creators: 390, brands: 130, total: 520 },
      { month: 'Jun', creators: 460, brands: 155, total: 615 },
      { month: 'Jul', creators: 520, brands: 175, total: 695 },
      { month: 'Aug', creators: 590, brands: 200, total: 790 },
      { month: 'Sep', creators: 660, brands: 220, total: 880 },
      { month: 'Oct', creators: 740, brands: 250, total: 990 },
      { month: 'Nov', creators: 840, brands: 280, total: 1120 },
      { month: 'Dec', creators: 950, brands: 310, total: 1260 },
    ],
    '2024': [
      { month: 'Jan', creators: 30, brands: 10, total: 40 },
      { month: 'Feb', creators: 45, brands: 15, total: 60 },
      { month: 'Mar', creators: 60, brands: 20, total: 80 },
      { month: 'Apr', creators: 80, brands: 28, total: 108 },
      { month: 'May', creators: 105, brands: 35, total: 140 },
      { month: 'Jun', creators: 130, brands: 45, total: 175 },
      { month: 'Jul', creators: 160, brands: 55, total: 215 },
      { month: 'Aug', creators: 190, brands: 65, total: 255 },
      { month: 'Sep', creators: 230, brands: 75, total: 305 },
      { month: 'Oct', creators: 270, brands: 90, total: 360 },
      { month: 'Nov', creators: 320, brands: 105, total: 425 },
      { month: 'Dec', creators: 380, brands: 125, total: 505 },
    ],
  };

  // 12-Month Revenue Data by Year (GMV and 15% Net Commission Fee)
  const incomeGrowthByYear = {
    '2026': [
      { month: 'Jan', gmv: 390000, netFee: 58500 },
      { month: 'Feb', gmv: 470000, netFee: 70500 },
      { month: 'Mar', gmv: 580000, netFee: 87000 },
      { month: 'Apr', gmv: 680000, netFee: 102000 },
      { month: 'May', gmv: 790000, netFee: 118500 },
      { month: 'Jun', gmv: 920000, netFee: 138000 },
      { month: 'Jul', gmv: 1040000, netFee: 156000 },
      { month: 'Aug', gmv: 1150000, netFee: 172500 },
      { month: 'Sep', gmv: 1248500, netFee: 187275 },
      { month: 'Oct', gmv: 1380000, netFee: 207000 },
      { month: 'Nov', gmv: 1520000, netFee: 228000 },
      { month: 'Dec', gmv: 1680000, netFee: 252000 },
    ],
    '2025': [
      { month: 'Jan', gmv: 95000, netFee: 14250 },
      { month: 'Feb', gmv: 120000, netFee: 18000 },
      { month: 'Mar', gmv: 155000, netFee: 23250 },
      { month: 'Apr', gmv: 190000, netFee: 28500 },
      { month: 'May', gmv: 235000, netFee: 35250 },
      { month: 'Jun', gmv: 290000, netFee: 43500 },
      { month: 'Jul', gmv: 340000, netFee: 51000 },
      { month: 'Aug', gmv: 410000, netFee: 61500 },
      { month: 'Sep', gmv: 480000, netFee: 72000 },
      { month: 'Oct', gmv: 560000, netFee: 84000 },
      { month: 'Nov', gmv: 640000, netFee: 96000 },
      { month: 'Dec', gmv: 730000, netFee: 109500 },
    ],
    '2024': [
      { month: 'Jan', gmv: 15000, netFee: 2250 },
      { month: 'Feb', gmv: 22000, netFee: 3300 },
      { month: 'Mar', gmv: 32000, netFee: 4800 },
      { month: 'Apr', gmv: 45000, netFee: 6750 },
      { month: 'May', gmv: 60000, netFee: 9000 },
      { month: 'Jun', gmv: 78000, netFee: 11700 },
      { month: 'Jul', gmv: 98000, netFee: 14700 },
      { month: 'Aug', gmv: 120000, netFee: 18000 },
      { month: 'Sep', gmv: 145000, netFee: 21750 },
      { month: 'Oct', gmv: 175000, netFee: 26250 },
      { month: 'Nov', gmv: 210000, netFee: 31500 },
      { month: 'Dec', gmv: 250000, netFee: 37500 },
    ],
  };

  const userGrowthData = userGrowthByYear[selectedYear];
  const incomeGrowthData = incomeGrowthByYear[selectedYear];

  const maxTotalUsers = Math.max(...userGrowthData.map((d) => d.creators), 100) * 1.15;
  const maxGmv = Math.max(...incomeGrowthData.map((d) => d.gmv), 100) * 1.15;
  const maxNetFee = Math.max(...incomeGrowthData.map((d) => d.netFee), 100) * 1.15;

  // SVG coordinates for 12 months (viewBox width: 500, height: 160)
  const revenuePoints = incomeGrowthData.map((item, idx) => {
    const x = 20 + idx * (460 / 11);
    const yFee = 150 - (item.netFee / maxNetFee) * 115;
    const yGmv = 150 - (item.gmv / maxGmv) * 115;
    return { x, yFee, yGmv };
  });

  // Generate smooth cubic bezier SVG path
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const feePoints = revenuePoints.map((p) => ({ x: p.x, y: p.yFee }));
  const gmvPoints = revenuePoints.map((p) => ({ x: p.x, y: p.yGmv }));

  const feePathString = createSmoothPath(feePoints);
  const gmvPathString = createSmoothPath(gmvPoints);
  const feeAreaString = `${feePathString} L ${feePoints[feePoints.length - 1].x.toFixed(1)},155 L ${feePoints[0].x.toFixed(1)},155 Z`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Overview"
        subtitle="Platform metrics, escrow, and active operations."
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
        {/* CHART 1: USER GROWTH (FULL 12 MONTHS) */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-neutral-100 flex-wrap">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900">
                User Growth
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium">
                12-month creator and brand signups
              </p>
            </div>

            {/* Corner Year Dropdown & Legend */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Legend */}
              <div className="hidden sm:flex items-center gap-2.5 text-xs font-bold">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-brand-pink" />
                  <span className="text-neutral-700 text-[11px]">Creators</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-neutral-950" />
                  <span className="text-neutral-700 text-[11px]">Brands</span>
                </div>
              </div>

              {/* Year Dropdown Filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value as '2026' | '2025' | '2024')}
                className="px-2.5 py-1 text-xs font-black bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-brand-pink cursor-pointer transition-colors"
                title="Filter by Year"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="relative pt-4">
            {/* Hover Tooltip Overlay */}
            {hoveredUserMonth !== null && (
              <div className="absolute top-0 right-4 bg-brand-black text-white px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-3 z-10 animate-in fade-in">
                <span className="text-neutral-300 font-black">
                  {userGrowthData[hoveredUserMonth].month} {selectedYear}:
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

            {/* 12-Month Bar Visual */}
            <div className="h-48 flex items-end justify-between gap-1 pt-6 px-1">
              {userGrowthData.map((item, index) => {
                const creatorHeight = Math.max((item.creators / maxTotalUsers) * 100, 6);
                const brandHeight = Math.max((item.brands / maxTotalUsers) * 100, 4);
                const isHovered = hoveredUserMonth === index;

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredUserMonth(index)}
                    onMouseLeave={() => setHoveredUserMonth(null)}
                  >
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      {/* Creator Bar (Pink) */}
                      <div
                        style={{ height: `${creatorHeight}%` }}
                        className={`w-1/2 max-w-[14px] bg-brand-pink rounded-t-sm transition-all duration-200 ${
                          isHovered ? 'brightness-110 shadow-md shadow-brand-pink/30 scale-y-105' : 'hover:opacity-90'
                        }`}
                      />
                      {/* Brand Bar (Onyx Black) */}
                      <div
                        style={{ height: `${brandHeight}%` }}
                        className={`w-1/2 max-w-[14px] bg-brand-black rounded-t-sm transition-all duration-200 ${
                          isHovered ? 'bg-neutral-800 shadow-md scale-y-105' : 'hover:opacity-90'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 12-Month Axis Labels */}
            <div className="flex justify-between gap-1 px-1 pt-2 border-t border-neutral-100">
              {userGrowthData.map((item, index) => {
                const isHovered = hoveredUserMonth === index;
                return (
                  <span
                    key={item.month}
                    className={`flex-1 text-center text-[10px] sm:text-xs transition-colors ${
                      isHovered ? 'font-black text-brand-pink' : 'font-extrabold text-neutral-500'
                    }`}
                  >
                    {item.month}
                  </span>
                );
              })}
            </div>
          </div>
        </Card>

        {/* CHART 2: REVENUE (FULL 12 MONTHS CURVED TREND) */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-neutral-100 flex-wrap">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900">
                Revenue
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium">
                12-month GMV and platform fees
              </p>
            </div>

            {/* Corner Year Dropdown & Legend */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Legend */}
              <div className="hidden sm:flex items-center gap-2.5 text-xs font-bold">
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-0.5 border-t-2 border-dashed border-neutral-400" />
                  <span className="text-neutral-500 text-[11px] font-medium">GMV</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-1 rounded-full bg-emerald-500" />
                  <span className="text-neutral-900 text-[11px] font-bold">Platform fee</span>
                </div>
              </div>

              {/* Year Dropdown Filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value as '2026' | '2025' | '2024')}
                className="px-2.5 py-1 text-xs font-black bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-brand-pink cursor-pointer transition-colors"
                title="Filter by Year"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="relative pt-4">
            {/* Hover Tooltip Overlay */}
            {hoveredIncomeMonth !== null && (
              <div className="absolute top-0 right-4 bg-brand-black text-white px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-3 z-10 animate-in fade-in">
                <span className="text-neutral-300 font-black">
                  {incomeGrowthData[hoveredIncomeMonth].month} {selectedYear}:
                </span>
                <span className="text-neutral-300">
                  GMV: {formatCurrency(incomeGrowthData[hoveredIncomeMonth].gmv)}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-black">
                  Fee: {formatCurrency(incomeGrowthData[hoveredIncomeMonth].netFee)}
                </span>
              </div>
            )}

            {/* SVG 12-Month Curved Area & Trend Line Visual */}
            <div>
              <svg
                viewBox="0 0 500 160"
                className="w-full h-48 overflow-visible"
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
                <line x1="20" y1="35" x2="480" y2="35" stroke="#F4F4F0" strokeDasharray="3 3" />
                <line x1="20" y1="75" x2="480" y2="75" stroke="#F4F4F0" strokeDasharray="3 3" />
                <line x1="20" y1="115" x2="480" y2="115" stroke="#F4F4F0" strokeDasharray="3 3" />
                <line x1="20" y1="155" x2="480" y2="155" stroke="#E7E7E2" strokeWidth="1" />

                {/* Active Hover Crosshair Line */}
                {hoveredIncomeMonth !== null && (
                  <line
                    x1={revenuePoints[hoveredIncomeMonth].x}
                    y1="20"
                    x2={revenuePoints[hoveredIncomeMonth].x}
                    y2="155"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* GMV Trendline (Dashed Neutral) */}
                <path
                  d={gmvPathString}
                  fill="none"
                  stroke="#A3A39E"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* 15% Fee Gradient Area Fill */}
                <path
                  d={feeAreaString}
                  fill="url(#revenueAreaGrad)"
                />

                {/* 15% Fee Main Line */}
                <path
                  d={feePathString}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                />

                {/* Interactive Data Point Nodes for 12 months */}
                {revenuePoints.map((pt, idx) => {
                  const isHovered = hoveredIncomeMonth === idx;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIncomeMonth(idx)}
                      onMouseLeave={() => setHoveredIncomeMonth(null)}
                    >
                      <circle cx={pt.x} cy={pt.yFee} r="14" fill="transparent" />
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.yFee}
                          r="8"
                          fill="#10B981"
                          fillOpacity="0.25"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.yFee}
                        r={isHovered ? 5 : 3}
                        fill="#FFFFFF"
                        stroke="#10B981"
                        strokeWidth={isHovered ? 2.5 : 2}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* X-Axis 12-Month Labels */}
              <div className="relative h-6 border-t border-neutral-100">
                {incomeGrowthData.map((item, index) => {
                  const isHovered = hoveredIncomeMonth === index;
                  return (
                    <button
                      key={item.month}
                      type="button"
                      onMouseEnter={() => setHoveredIncomeMonth(index)}
                      onMouseLeave={() => setHoveredIncomeMonth(null)}
                      style={{ left: `${(revenuePoints[index].x / 500) * 100}%` }}
                      className={`absolute top-2 -translate-x-1/2 text-[10px] sm:text-xs leading-none transition-colors cursor-pointer ${
                        isHovered
                          ? 'font-black text-emerald-600'
                          : 'font-extrabold text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      {item.month}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};
