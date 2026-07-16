'use client';

import { scaledChannelMetrics, DATE_RANGE_LABELS } from '@/lib/analyticsData';
import type { DateRange, ChannelMetrics } from '@/lib/analyticsData';

const currency = (n: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// Pacing tiers: ≥100% over budget (critical), ≥80% on-pace-warning, else ok.
function pctBadgeClass(pct: number): string {
  if (pct >= 1.0) return 'badge-critical';
  if (pct >= 0.8) return 'badge-warning';
  return 'badge-ok';
}

// Hex color dimmed by lowering opacity
function dimColor(hex: string, opacity: number): string {
  // Parse 6-digit hex
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export default function SpendBudgetChart({ dateRange = '30d', channelMetrics }: { dateRange?: DateRange; channelMetrics: ChannelMetrics[] }) {
  // Ideal-pace marker: how far through the current month we are. On-budget
  // spend should track this % — bars past it are over-pacing.
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const elapsedPct = Math.min(100, (now.getDate() / daysInMonth) * 100);

  const data = scaledChannelMetrics(dateRange, channelMetrics)
    .filter(c => c.budget > 0)
    .sort((a, b) => b.budget - a.budget)
    .map(c => ({
      label: c.label,
      spend: c.spend,
      budget: c.budget,
      remaining: Math.max(0, c.budget - c.spend),
      color: c.color,
      pct: c.budget > 0 ? c.spend / c.budget : 0,
    }));

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-label mb-1">Budget Utilization</div>
          <div className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Spend ({DATE_RANGE_LABELS[dateRange].toLowerCase()}) vs. monthly budget per channel
          </div>
        </div>
        <div className="flex items-center gap-3 text-[16px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(var(--overlay-rgb),0.5)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Spent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(var(--overlay-rgb),0.12)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Remaining</span>
          </div>
        </div>
      </div>

      {/* Channel rows */}
      {data.length === 0 && (
        <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No channel budgets set yet.</div>
      )}
      <div className="space-y-2">
        {data.map(d => {
          const spentPct = Math.min(d.pct * 100, 100);
          const remainingPct = 100 - spentPct;
          return (
            <div key={d.label} style={{ minHeight: 40 }} className="flex flex-col justify-center">
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: d.color, boxShadow: `0 0 5px ${d.color}50` }}
                  />
                  <span className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {d.label}
                  </span>
                  <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    {currency(d.spend)} / {currency(d.budget)}
                  </span>
                </div>
                <span className={pctBadgeClass(d.pct)}>
                  {(d.pct * 100).toFixed(0)}%
                </span>
              </div>

              {/* Bar track */}
              <div
                className="relative w-full rounded-full overflow-hidden"
                style={{ height: 8, background: 'var(--bg-overlay)' }}
              >
                {/* Spent fill */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${spentPct}%`,
                    background: d.color,
                    opacity: 0.85,
                  }}
                />
                {/* Remaining fill — only shown when there is remaining budget */}
                {remainingPct > 0 && (
                  <div
                    className="absolute top-0 h-full rounded-r-full"
                    style={{
                      left: `${spentPct}%`,
                      width: `${remainingPct}%`,
                      background: dimColor(d.color.startsWith('#') ? d.color : '#7a82b8', 0.18),
                    }}
                  />
                )}
                {/* % period-elapsed ideal-pace marker */}
                <div className="absolute top-0 h-full" title={`${elapsedPct.toFixed(0)}% of month elapsed (ideal pace)`}
                  style={{ left: `${elapsedPct}%`, width: 2, background: 'var(--text-primary)', opacity: 0.6 }} />
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t text-[16px] font-mono" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: 2, height: 12, background: 'var(--text-primary)', opacity: 0.6 }} />
          Ideal pace marker — {elapsedPct.toFixed(0)}% of the month elapsed. Bars past it are over-pacing; ≥80% amber, ≥100% red.
        </div>
      )}
    </div>
  );
}
