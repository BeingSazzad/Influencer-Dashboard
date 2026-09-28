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
  // Chart Hover States
  const [hoveredUserMonth, setHoveredUserMonth] = useState<number | null>(null);
  const [hoveredIncomeMonth, setHoveredIncomeMonth] = useState<number | null>(null);

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
