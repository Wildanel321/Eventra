import React from "react";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { DollarSign, TrendingUp, Users, QrCode } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 0;

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
          Intelligence & Reporting
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
          Real-time Analytics & Financial Velocity
        </h1>
        <p className="text-xs text-slate-400">
          Monitor revenue timelines, conversion rates, tier distribution, and marketing campaign attribution.
        </p>
      </div>

      <AnalyticsCharts />
    </div>
  );
}
