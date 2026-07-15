'use client';

import { TrendingUp, TrendingDown, DollarSign, MousePointer, BarChart2, Target, ShoppingBag, Eye } from 'lucide-react';
import { scaledTotals } from '@/lib/analyticsData';
import type { DateRange, ChannelMetrics } from '@/lib/analyticsData';
import type { LucideIcon } from 'lucide-react';

interface KpiItem {
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
  icon: LucideIcon;
  color: string;
  subValue?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function currency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

export default function KpiRow({ dateRange = '30d', channelMetrics }: { dateRange?: DateRange; channelMetrics: ChannelMetrics[] }) {
  const t = scaledTotals(dateRange, channelMetrics);

  const paidChannels = channelMetrics.filter(c => c.spend > 0 && c.channel !== 'organic' && c.channel !== 'email');
  const paidRevenue = paidChannels.reduce((s, c) => s + c.revenue, 0);
  const paidSpend = paidChannels.reduce((s, c) => s + c.spend, 0);
  const totalConvForDelta = channelMetrics.reduce((s, c) => s + c.conversions, 0);
  const weightedRevDelta = paidRevenue > 0 ? paidChannels.reduce((s, c) => s + c.revenueDelta * c.revenue, 0) / paidRevenue : 0;
  const weightedRoasDelta = paidSpend > 0 ? paidChannels.reduce((s, c) => s + c.roasDelta * c.spend, 0) / paidSpend : 0;
  const weightedConvDelta = totalConvForDelta > 0 ? channelMetrics.reduce((s, c) => s + c.conversionsDelta * c.conversions, 0) / totalConvForDelta : 0;

  const kpis: KpiItem[] = [
    {
      label: 'Total Revenue',
      value: currency(t.totalRevenue),
      delta: +weightedRevDelta,
      deltaLabel: 'vs prior period',
      icon: DollarSign,
      color: '#10d98a',
    },
    {
      label: 'Total Ad Spend',
      value: currency(t.totalSpend),
      delta: +7.3,
      deltaLabel: 'vs prior period',
      icon: BarChart2,
      color: 'var(--cyan)',
      subValue: `${currency(t.totalBudget)} budget`,
    },
    {
      label: 'Blended ROAS',
      value: t.blendedRoas.toFixed(2) + '×',
      delta: +weightedRoasDelta,
      deltaLabel: 'vs prior period',
      icon: Target,
      color: '#7b93ff',
    },
    {
      label: 'Total Conversions',
      value: fmt(t.totalConversions),
      delta: +weightedConvDelta,
      deltaLabel: 'vs prior period',
      icon: ShoppingBag,
      color: '#ffb347',
    },
    {
      label: 'Total Clicks',
      value: fmt(t.totalClicks),
      delta: +8.4,
      deltaLabel: 'vs prior period',
      icon: MousePointer,
      color: 'var(--cyan)',
    },
    {
      label: 'Impressions',
      value: fmt(t.totalImpressions),
      delta: +12.1,
      deltaLabel: 'vs prior period',
      icon: Eye,
      color: 'var(--text-secondary)',
    },
    {
      label: 'Blended CPA',
      value: t.totalConversions > 0 ? currency(t.totalSpend / t.totalConversions) : '—',
      delta: -3.8,
      deltaLabel: 'vs prior period',
      icon: Target,
      color: '#10d98a',
    },
    {
      label: 'Budget Utilization',
      value: t.totalBudget > 0 ? ((t.totalSpend / t.totalBudget) * 100).toFixed(1) + '%' : '—',
      delta: +2.1,
      deltaLabel: 'vs last month',
      icon: BarChart2,
      color: '#ffb347',
      subValue: `${currency(t.totalBudget - t.totalSpend)} remaining`,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      {kpis.map(kpi => {
        const Icon = kpi.icon;
        const positive = kpi.delta >= 0;
        const isCpa = kpi.label.includes('CPA');
        const isGood = isCpa ? !positive : positive;
        const deltaColor = isGood ? '#10d98a' : '#ff4444';

        return (
          <div
            key={kpi.label}
            className="glass-card px-4 py-3.5 relative overflow-hidden flex flex-col"
            style={{ borderTop: `1px solid ${kpi.color}50` }}
          >
            {/* Top colored line — overrides the default border-top */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, ${kpi.color}80 0%, ${kpi.color}20 100%)` }}
            />

            {/* Corner glow */}
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
              style={{ background: kpi.color, opacity: 0.04, transform: 'translate(35%, -35%)' }}
            />

            {/* Header row */}
            <div className="flex items-start justify-between mb-2.5">
              <div className="section-label leading-tight">{kpi.label}</div>
              <div
                className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: kpi.color + '1a', border: `1px solid ${kpi.color}28` }}
              >
                <Icon size={13} style={{ color: kpi.color }} />
              </div>
            </div>

            {/* Primary value */}
            <div
              className="data-value text-xl font-semibold stat-count mb-2"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </div>

            {/* Delta badge */}
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[16px] font-mono font-medium"
                style={{ background: deltaColor + '15', color: deltaColor, border: `1px solid ${deltaColor}28` }}
              >
                {isGood ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {kpi.delta >= 0 ? '+' : ''}{kpi.delta.toFixed(1)}%
              </span>
              <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {kpi.deltaLabel}
              </span>
            </div>

            {/* Sub-value */}
            {kpi.subValue && (
              <div className="text-[16px] mt-1.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                {kpi.subValue}
              </div>
            )}

            {/* Bottom accent gradient */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent 0%, ${kpi.color}18 50%, transparent 100%)` }}
            />
          </div>
        );
      })}
    </div>
  );
}
