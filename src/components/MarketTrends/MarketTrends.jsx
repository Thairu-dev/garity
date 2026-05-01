/**
 * Learning Note:
 * The MarketTrends component provides at-a-glance market insights using the same
 * Sparkline component used in CarCards — demonstrating component reusability.
 * This section uses mock aggregated data to show average prices by vehicle category.
 * In a real app, this data would come from the backend's analytics endpoint.
 * The grid layout uses CSS Grid with responsive breakpoints for optimal display.
 */

"use client";

import { TrendingUp, TrendingDown, BarChart3, Car, Truck, Zap } from "lucide-react";
import Sparkline from "@/components/Sparkline/Sparkline";

const TRENDS = [
  {
    id: "suv",
    label: "SUVs & Crossovers",
    icon: Truck,
    avgPrice: "KES 5.2M",
    change: "+8.3%",
    isUp: true,
    data: [4_400_000, 4_600_000, 4_800_000, 4_900_000, 5_100_000, 5_200_000],
    insight: "High demand for Toyota Harrier & Prado driving prices up",
  },
  {
    id: "sedan",
    label: "Sedans",
    icon: Car,
    avgPrice: "KES 3.1M",
    change: "-4.2%",
    isUp: false,
    data: [3_400_000, 3_350_000, 3_300_000, 3_200_000, 3_150_000, 3_100_000],
    insight: "SUV preference shift causing sedan prices to cool",
  },
  {
    id: "hatchback",
    label: "Hatchbacks",
    icon: Zap,
    avgPrice: "KES 1.8M",
    change: "+2.1%",
    isUp: true,
    data: [1_650_000, 1_700_000, 1_720_000, 1_750_000, 1_780_000, 1_800_000],
    insight: "Fuel-efficient models gaining popularity in urban areas",
  },
];

export default function MarketTrends() {
  return (
    <section id="trends-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-5 w-5 text-emerald-500" />
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
          Market Trends
        </h2>
      </div>
      <p className="text-sm text-text-muted mb-8">
        6-month price trends across Kenya&apos;s most popular vehicle categories
      </p>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TRENDS.map((trend, i) => {
          const Icon = trend.icon;
          return (
            <div
              key={trend.id}
              className="group rounded-2xl border border-border-default bg-bg-card p-5 transition-all duration-500 hover:border-border-hover hover:shadow-card-hover animate-scale-in"
              style={{
                animationDelay: `${i * 100}ms`,
                transitionTimingFunction: "var(--ease-spring)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {/* Icon + Label */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/15 transition-colors duration-300">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">{trend.label}</div>
                  <div className="text-xs text-text-muted">Avg. price across Kenya</div>
                </div>
              </div>

              {/* Price + Change */}
              <div className="flex items-end justify-between mb-4">
                <div className="text-2xl font-bold text-text-primary">{trend.avgPrice}</div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${trend.isUp ? "text-emerald-400" : "text-red-400"}`}>
                  {trend.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {trend.change}
                </div>
              </div>

              {/* Sparkline */}
              <div className="mb-3">
                <Sparkline data={trend.data} width={280} height={48} strokeWidth={2} showTooltip={false} />
              </div>

              {/* Insight */}
              <p className="text-xs text-text-muted leading-relaxed border-t border-border-default pt-3">
                💡 {trend.insight}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
