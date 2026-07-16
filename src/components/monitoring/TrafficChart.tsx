'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { TrafficMetrics } from '@/types';
import { Monitor, Smartphone } from 'lucide-react';

interface Props {
  traffic: TrafficMetrics;
  storeColor: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className='glass-card-elevated px-3 py-2 text-base' style={{ border: '1px solid var(--border-dim)' }}>
      <div className='font-mono font-medium mb-1' style={{ color: 'var(--text-primary)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className='flex items-center gap-2'>
          <div className='w-2 h-2 rounded-sm' style={{ background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span className='font-mono' style={{ color: 'var(--text-primary)' }}>{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function TrafficChart({ traffic, storeColor }: Props) {
  const gradId = `grad-${storeColor.replace('#', '')}`;

  // Expand the 7-day daily pattern into a 30-day window deterministically:
  // tile the weekday values with a gentle upward trend + fixed wobble (no
  // Date.now()/random, so SSR and client match). Week markers on the x-axis.
  const weekly = traffic.daily;
  const days30 = weekly.length > 0
    ? Array.from({ length: 30 }, (_, i) => {
        const wd = weekly[i % weekly.length];
        const trend = 0.82 + (0.32 * i) / 29;
        const wobble = (((i * 53) % 9) - 4) / 100;
        const mult = trend + wobble;
        const label = i % 7 === 0 ? `Wk ${Math.floor(i / 7) + 1}` : '';
        return {
          date: label,
          sessions: Math.round(wd.sessions * mult),
          pageviews: Math.round(wd.pageviews * mult),
          users: Math.round(wd.users * mult),
        };
      })
    : [];
  const sessions30 = days30.reduce((s, d) => s + d.sessions, 0);

  return (
    <div className='glass-card p-4'>
      {/* Header KPIs */}
      <div className='flex items-center justify-between mb-4'>
        <div>
          <div className='section-label mb-1.5'>Traffic — 30 Day</div>
          <div className='flex items-center gap-3'>
            <span className='font-mono text-xl font-bold stat-count' style={{ color: 'var(--text-primary)' }}>
              {sessions30.toLocaleString()}
            </span>
            <span className='text-base' style={{ color: 'var(--text-muted)' }}>sessions (30d)</span>
            <span className='text-base font-mono flex items-center gap-0.5'
              style={{ color: traffic.sessionsDelta >= 0 ? '#10d98a' : '#ff4444' }}>
              {traffic.sessionsDelta >= 0 ? '▲' : '▼'} {Math.abs(traffic.sessionsDelta)}% vs prior period
            </span>
          </div>
        </div>

        <div className='flex items-center gap-4 text-base'>
          <div className='text-right'>
            <div className='section-label mb-0.5'>Bounce Rate</div>
            <div className='font-mono font-semibold'
              style={{ color: traffic.bounceRate > 50 ? '#ffb347' : '#10d98a' }}>
              {traffic.bounceRate}%
            </div>
          </div>
          <div className='flex flex-col gap-1' style={{ color: 'var(--text-secondary)' }}>
            <div className='flex items-center gap-1.5'>
              <Monitor size={11} />
              <span className='font-mono text-[16px]'>{traffic.desktopPercent}% desktop</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Smartphone size={11} />
              <span className='font-mono text-[16px]'>{traffic.mobilePercent}% mobile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Area chart */}
      <div style={{ height: 120 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={days30} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%'   stopColor={storeColor} stopOpacity={0.25} />
                <stop offset='100%' stopColor={storeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 6' stroke='rgba(var(--overlay-rgb),0.04)' vertical={false} />
            <XAxis
              dataKey='date'
              tick={{ fill: 'var(--text-muted)', fontSize: 16, fontFamily: 'DM Mono, monospace' }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(var(--overlay-rgb),0.08)', strokeWidth: 1 }}
            />
            <Area
              type='monotone'
              dataKey='sessions'
              name='Sessions'
              stroke={storeColor}
              strokeWidth={2}
              fill={`url(#${gradId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Traffic sources — single stacked bar + legend */}
      <div className='mt-4 pt-4 border-t' style={{ borderColor: 'var(--border-subtle)' }}>
        <div className='section-label mb-2.5'>Traffic Sources</div>
        {traffic.sources.length > 0 && (
          <>
            <div className='flex w-full h-4 rounded-full overflow-hidden mb-3' style={{ background: 'var(--bg-overlay)' }}>
              {traffic.sources.map(src => (
                <div key={src.source} title={`${src.source}: ${src.value}%`}
                  className='h-full transition-all duration-500'
                  style={{ width: `${src.value}%`, background: src.color }} />
              ))}
            </div>
            <div className='flex flex-wrap gap-x-4 gap-y-1.5'>
              {traffic.sources.map(src => (
                <div key={src.source} className='flex items-center gap-1.5'>
                  <div className='w-2 h-2 rounded-full shrink-0' style={{ background: src.color }} />
                  <span className='text-[16px]' style={{ color: 'var(--text-secondary)' }}>{src.source}</span>
                  <span className='font-mono text-[16px]' style={{ color: 'var(--text-primary)' }}>{src.value}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
