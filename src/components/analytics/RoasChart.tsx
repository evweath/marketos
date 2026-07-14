'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from 'recharts';
import { scaledChannelMetrics, CHANNEL_METRICS } from '@/lib/analyticsData';
import type { DateRange } from '@/lib/analyticsData';

interface TooltipPayloadItem {
  value: number;
  fill: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const ch = CHANNEL_METRICS.find(c => c.label === label || c.label.replace(' Ads', '').replace(' / ', '/') === label);
  return (
    <div
      className="glass-card-elevated px-3 py-2.5 text-xs"
      style={{ border: '1px solid var(--border-dim)', boxShadow: 'var(--shadow-float)' }}
    >
      <div className="font-mono font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</div>
      <div className="flex justify-between gap-6">
        <span style={{ color: 'var(--text-secondary)' }}>ROAS</span>
        <span className="font-mono font-semibold" style={{ color: payload[0].fill }}>
          {payload[0].value === 0 ? 'N/A' : payload[0].value.toFixed(2) + '×'}
        </span>
      </div>
      {ch && ch.spend > 0 && (
        <div className="flex justify-between gap-6 mt-0.5">
          <span style={{ color: 'var(--text-secondary)' }}>Margin</span>
          <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{ch.margin.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

const ZONE_LEGEND = [
  { color: '#10d98a', label: '≥ 5×  Strong' },
  { color: '#ffb347', label: '3–5×  OK' },
  { color: '#ff4444', label: '< 3×  Weak' },
];

export default function RoasChart({ dateRange = '30d' }: { dateRange?: DateRange }) {
  const data = scaledChannelMetrics(dateRange)
    .filter(c => c.channel !== 'organic')
    .sort((a, b) => b.roas - a.roas)
    .map(c => ({
      label: c.label.replace(' Ads', '').replace(' / ', '/'),
      roas: c.roas,
      color: c.color,
      id: c.channel,
    }));

  const avgRoas = data.filter(d => d.roas > 0).reduce((s, d) => s + d.roas, 0) / data.filter(d => d.roas > 0).length;

  const barColor = (roas: number): string => {
    if (roas === 0) return 'rgba(var(--overlay-rgb),0.08)';
    if (roas >= 5) return '#10d98a';
    if (roas >= 3) return '#ffb347';
    return '#ff4444';
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-label mb-1">ROAS by Channel</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Avg blended:{' '}
            <span className="font-mono" style={{ color: '#10d98a' }}>{avgRoas.toFixed(2)}×</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          <div
            className="w-8 h-px border-t border-dashed"
            style={{ borderColor: '#ffb347', opacity: 0.5 }}
          />
          <span style={{ color: '#ffb347' }}>avg</span>
        </div>
      </div>

      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="32%">
            <defs>
              {data.map(d => {
                const col = barColor(d.roas);
                return (
                  <linearGradient key={d.id} id={`roas-grad-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={col} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={col} stopOpacity={0.35} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid stroke="rgba(var(--overlay-rgb),0.04)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'DM Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(var(--overlay-rgb),0.03)' }}
            />
            <ReferenceLine
              y={avgRoas}
              stroke="#ffb347"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: `${avgRoas.toFixed(1)}×`,
                position: 'insideTopRight',
                fill: '#ffb347',
                fontSize: 9,
                fontFamily: 'DM Mono',
                opacity: 0.8,
              }}
            />
            <Bar dataKey="roas" radius={[4, 4, 0, 0]}>
              {data.map(entry => (
                <Cell
                  key={entry.id}
                  fill={`url(#roas-grad-${entry.id})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Zone legend pills */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        {ZONE_LEGEND.map(z => (
          <div
            key={z.label}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{ background: z.color + '12', border: `1px solid ${z.color}28` }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: z.color }} />
            <span className="text-[10px] font-mono" style={{ color: z.color }}>{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
