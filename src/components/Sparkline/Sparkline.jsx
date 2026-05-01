/**
 * Learning Note:
 * The Sparkline is a pure SVG component with zero external dependencies.
 * SVG was chosen over Canvas because it integrates naturally with React's declarative model —
 * each element is a DOM node that React can diff and update efficiently.
 * The component computes whether the trend is "up" or "down" to color-code accordingly,
 * giving users an instant visual cue about price volatility on each car card.
 * The gradient fill under the line uses SVG's `<linearGradient>` and `<defs>` pattern.
 */

"use client";

import { useMemo } from "react";

export default function Sparkline({
  data = [],
  width = 120,
  height = 40,
  strokeWidth = 1.5,
  className = "",
  showTooltip = true,
}) {
  const computed = useMemo(() => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    // Is the trend up or down?
    const isUp = data[data.length - 1] >= data[0];

    // Map data points to SVG coordinates
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * innerWidth;
      const y = padding + innerHeight - ((value - min) / range) * innerHeight;
      return { x, y, value };
    });

    // Create polyline points string
    const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

    // Create area path (line + close to bottom)
    const areaPath = [
      `M ${points[0].x},${height}`,
      `L ${points[0].x},${points[0].y}`,
      ...points.slice(1).map((p) => `L ${p.x},${p.y}`),
      `L ${points[points.length - 1].x},${height}`,
      "Z",
    ].join(" ");

    // Percentage change
    const change = ((data[data.length - 1] - data[0]) / data[0]) * 100;

    return { points, linePoints, areaPath, isUp, min, max, change };
  }, [data, width, height]);

  if (!computed) return null;

  const { linePoints, areaPath, isUp, change } = computed;

  // Unique ID for gradient (prevents SVG gradient conflicts when multiple sparklines render)
  const gradientId = `spark-gradient-${data.join("-").slice(0, 20)}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        role="img"
        aria-label={`Price trend: ${isUp ? "increasing" : "decreasing"} by ${Math.abs(change).toFixed(1)}%`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isUp ? "var(--color-spark-up)" : "var(--color-spark-down)"}
              stopOpacity="0.25"
            />
            <stop
              offset="100%"
              stopColor={isUp ? "var(--color-spark-up)" : "var(--color-spark-down)"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line */}
        <polyline
          fill="none"
          stroke={isUp ? "var(--color-spark-up)" : "var(--color-spark-down)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
        />

        {/* End dot */}
        <circle
          cx={computed.points[computed.points.length - 1].x}
          cy={computed.points[computed.points.length - 1].y}
          r={2.5}
          fill={isUp ? "var(--color-spark-up)" : "var(--color-spark-down)"}
          className="animate-[glow-pulse_2s_ease-in-out_infinite]"
        />
      </svg>

      {/* Change percentage badge */}
      {showTooltip && (
        <span
          className={`text-[11px] font-semibold tabular-nums ${
            isUp ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isUp ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
