'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { scaledTimeSeries, DATE_RANGE_LABELS, CHANNEL_CONFIG } from '@/lib/analyticsData';
import type { Channel, DateRange } from '@/lib/analyticsData';

const DEFAULT_CHANNELS: Channel[] = ['google-ads', 'meta-ads', 'linkedin', 'email'];

const currency = (n: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

type Metric = 'revenue' | 'spend' | 'conversions';

const METRIC_LABELS: Record<Metric, string> = {
  revenue: 'Attributed Revenue ($)',
  spend: 'Ad Spend ($)',
  conversions: 'Conversions',
};

const METRICS: Metric[] = ['revenue', 'spend', 'conversions'];

interface TooltipPayloadItem {
  dataKey: string;
  name: string;
  color: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass-card-elevated px-3 py-2.5 text-xs min-w-40"
      style={{ border: '1px solid var(--border-dim)', boxShadow: 'var(--shadow-float)' }}
    >
      <div className="font-mono font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-0.5 rounded" style={{ background: p.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
          </div>
          <span className="font-mono font-medium" style={{ color: p.color }}>
            {currency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueSpendChart({ dateRange = '30d' }: { dateRange?: DateRange }) {
  const [activeChannels, setActiveChannels] = useState<Set<Channel>>(new Set(DEFAULT_CHANNELS));
  const [metric, setMetric] = useState<Metric>('revenue');

  const timeSeries = scaledTimeSeries(dateRange);

  const toggleChannel = (ch: Channel) => {
    setActiveChannels(prev => {
      const s = new Set(prev);
      if (s.has(ch)) { if (s.size > 1) s.delete(ch); }
      else s.add(ch);
      return s;
    });
  };

  const mergedData = timeSeries[0].data.map((_, dayIdx) => {
    const dayObj: Record<string, number | string> = { date: timeSeries[0].data[dayIdx].date };
    for (const ts of timeSeries) {
      if (activeChannels.has(ts.channel)) {
        dayObj[ts.channel] = ts.data[dayIdx][metric];
      }
    }
    return dayObj;
  });

  const activeTimeSeries = timeSeries.filter(ts => activeChannels.has(ts.channel));

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-label mb-1">Channel Trends — {DATE_RANGE_LABELS[dateRange]}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{METRIC_LABELS[metric]}</div>
        </div>

        {/* Segmented metric control */}
        <div
          className="flex items-center p-0.5 rounded-full"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          {METRICS.map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className="px-3 py-1 rounded-full text-xs transition-all"
              style={{
                background: metric === m ? 'var(--bg-overlay)' : 'transparent',
                color: metric === m ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'DM Mono',
                fontWeight: metric === m ? 500 : 400,
                boxShadow: metric === m ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mergedData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              {activeTimeSeries.map(ts => {
                const color = CHANNEL_CONFIG[ts.channel].color;
                return (
                  <linearGradient key={ts.channel} id={`grad-${ts.channel}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid
              stroke="rgba(var(--overlay-rgb),0.04)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'DM Mono' }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(var(--overlay-rgb),0.06)', strokeWidth: 1 }}
            />
            {activeTimeSeries.map(ts => {
              const color = CHANNEL_CONFIG[ts.channel].color;
              return (
                <Area
                  key={ts.channel}
                  type="monotone"
                  dataKey={ts.channel}
                  name={CHANNEL_CONFIG[ts.channel].label}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#grad-${ts.channel})`}
                  fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0, fill: color }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Channel toggle pills */}
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        {timeSeries.map(ts => {
          const cfg = CHANNEL_CONFIG[ts.channel];
          const active = activeChannels.has(ts.channel);
          return (
            <button
              key={ts.channel}
              onClick={() => toggleChannel(ts.channel)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all"
              style={{
                background: active ? cfg.color + '18' : 'var(--bg-elevated)',
                color: active ? cfg.color : 'var(--text-muted)',
                border: `1px solid ${active ? cfg.color + '40' : 'var(--border-subtle)'}`,
                transition: 'all 0.15s ease',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: active ? cfg.color : 'var(--text-muted)' }}
              />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
