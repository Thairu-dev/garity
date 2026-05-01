/**
 * Learning Note:
 * The FilterToggle is a controlled component — its state is "lifted up" to the parent
 * via the `onFilterChange` callback prop. This is React's core pattern for sharing state.
 * We use `role="radiogroup"` for accessibility.
 */

"use client";

import { Globe, MapPin, LayoutGrid } from "lucide-react";

const FILTERS = [
  { id: "all", label: "All Cars", icon: LayoutGrid },
  { id: "foreign", label: "Foreign Used", icon: Globe },
  { id: "local", label: "Locally Used", icon: MapPin },
];

export default function FilterToggle({ activeFilter = "all", onFilterChange, counts = {} }) {
  return (
    <div
      id="filter-toggle"
      role="radiogroup"
      aria-label="Filter by car type"
      className="inline-flex items-center rounded-xl border border-border-default bg-bg-card/60 backdrop-blur-sm p-1 gap-1"
    >
      {FILTERS.map(({ id, label, icon: Icon }) => {
        const isActive = activeFilter === id;
        const count = id === "all" ? (counts.all || 0) : (counts[id] || 0);
        return (
          <button
            key={id}
            id={`filter-${id}`}
            role="radio"
            aria-checked={isActive}
            onClick={() => onFilterChange(id)}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : "text-text-muted border border-transparent hover:text-text-secondary hover:bg-emerald-500/5"
            }`}
            style={{ transitionTimingFunction: "var(--ease-spring)" }}
          >
            <Icon className={`h-4 w-4 transition-colors duration-200 ${isActive ? "text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">{label}</span>
            {count > 0 && (
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center tabular-nums transition-colors duration-200 ${
                isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-text-muted"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
