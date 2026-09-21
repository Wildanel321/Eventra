"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const REVENUE_DATA_30D = [
  { date: "Sep 01", revenue: 4500000, tickets: 18 },
  { date: "Sep 05", revenue: 7800000, tickets: 31 },
  { date: "Sep 10", revenue: 12400000, tickets: 48 },
  { date: "Sep 15", revenue: 19500000, tickets: 76 },
  { date: "Sep 18", revenue: 28200000, tickets: 110 },
  { date: "Sep 20", revenue: 38500000, tickets: 145 },
  { date: "Sep 21", revenue: 49800000, tickets: 192 },
];

const TICKET_TIER_DATA = [
  { name: "Early Bird", value: 285, color: "#6366F1" },
  { name: "Regular Pass", value: 420, color: "#38BDF8" },
  { name: "VIP Executive", value: 95, color: "#F59E0B" },
];

const REFERRAL_DATA = [
  { source: "Instagram Ads", registrations: 184, revenue: 36800000 },
  { source: "LinkedIn Sponsored", registrations: 112, revenue: 28000000 },
  { source: "August Newsletter", registrations: 95, revenue: 19000000 },
  { source: "Discord Community", registrations: 78, revenue: 15600000 },
  { source: "Direct & Organic", registrations: 62, revenue: 12400000 },
];

export function AnalyticsCharts() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Top Chart: Revenue & Ticket Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Financial Velocity
            </span>
            <h3 className="text-lg font-bold text-white">Gross Ticket Revenue Growth</h3>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800">
            {["7d", "30d", "90d", "All"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  timeRange === range
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_DATA_30D} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `Rp${(val / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Charts: Breakdown & Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tier Distribution Donut (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Inventory Distribution
            </span>
            <h4 className="text-sm font-bold text-white">Tickets Sold by Tier</h4>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TICKET_TIER_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {TICKET_TIER_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800 text-center">
            {TICKET_TIER_DATA.map((t) => (
              <div key={t.name}>
                <div className="text-[10px] text-slate-400 truncate">{t.name}</div>
                <div className="text-sm font-black text-white">{t.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Referral Acquisition (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Acquisition Attribution
            </span>
            <h4 className="text-sm font-bold text-white">Referral Channels & ROI</h4>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REFERRAL_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="source" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="registrations" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 mt-2 text-right">
            Top Performing Channel: <strong className="text-white">Instagram Ads (184 converted)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
