'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, MousePointer, Eye, Target, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import { usePersistentState } from '@/lib/usePersistentState';
import type { StoreId, DateRange, GscStoreMetrics } from '@/lib/seoData';

const STORE_CONFIG: Record<StoreId, { label: string; color: string }> = {
  'donut-equipment':    { label: 'Donut Equipment',  color: 'var(--cyan)' },
  'donut-supplies':     { label: 'Donut Supplies',   color: '#ffb347' },
  'bakery-wholesalers': { label: 'Bakery Wholesale', color: '#10d98a' },
};

const STORES: StoreId[] = ['donut-equipment', 'donut-supplies', 'bakery-wholesalers'];
const DATE_RANGES: DateRange[] = ['7d', '30d', '90d'];
const DR_LABEL: Record<DateRange, string> = { '7d': '7d', '30d': '30d', '90d': '90d' };

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-xl px-3 py-2.5' style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)' }}>
      <div className='text-[16px] font-mono mb-2' style={{ color: 'var(--text-muted)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} className='flex items-center gap-2 text-base font-mono'>
          <div className='w-2 h-2 rounded-full' style={{ background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function positionBadgeColor(pos: number): string {
  if (pos <= 3)  return '#10d98a';
  if (pos <= 10) return '#00d9ff';
  if (pos <= 20) return '#ffb347';
  return '#7b93ff';
}

export function GscPerformance() {
  const [gscMetrics] = usePersistentState<GscStoreMetrics[]>('seo.gscMetrics', []);
  const [store, setStore]         = useState<StoreId>('donut-equipment');
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const storeData = gscMetrics.find(m => m.store === store);
  const storeCfg  = STORE_CONFIG[store];

  if (!storeData) {
    return (
      <div className='glass-card p-4'>
        <div className='flex items-center gap-0.5 p-1 mb-4' style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, width: 'fit-content' }}>
          {STORES.map(s => {
            const cfg    = STORE_CONFIG[s];
            const active = store === s;
            return (
              <button
                key={s}
                onClick={() => setStore(s)}
                className='px-3 py-1.5 text-base font-medium transition-all whitespace-nowrap'
                style={{
                  borderRadius: 7,
                  background: active ? cfg.color + '18' : 'transparent',
                  color: active ? cfg.color : 'var(--text-secondary)',
                  border: active ? `1px solid ${cfg.color}35` : '1px solid transparent',
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
        <div className='text-base text-center py-10' style={{ color: 'var(--text-muted)' }}>
          No Search Console data connected for this store yet.
        </div>
      </div>
    );
  }

  const metrics = storeData[dateRange];

  const kpis = [
    {
      label: 'Total Clicks',
      value: fmt(metrics.clicks),
      delta: metrics.clicksDelta,
      icon: MousePointer,
      color: 'var(--cyan)',
    },
    {
      label: 'Impressions',
      value: fmt(metrics.impressions),
      delta: metrics.impressionsDelta,
      icon: Eye,
      color: '#7b93ff',
    },
    {
      label: 'Avg CTR',
      value: metrics.avgCtr.toFixed(2) + '%',
      delta: metrics.ctrDelta,
      deltaIsAbsolute: true,
      icon: Target,
      color: '#10d98a',
    },
    {
      label: 'Avg Position',
      value: metrics.avgPosition.toFixed(1),
      delta: metrics.positionDelta,
      deltaIsAbsolute: true,
      lowerIsBetter: true,
      icon: BarChart2,
      color: '#ffb347',
    },
  ];

  return (
    <div className='glass-card p-4'>
      {/* Header row: store tabs + date range in same line */}
      <div className='flex items-center justify-between mb-4 gap-3'>
        {/* Store tabs */}
        <div
          className='flex items-center gap-0.5 p-1'
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
          }}
        >
          {STORES.map(s => {
            const cfg    = STORE_CONFIG[s];
            const active = store === s;
            return (
              <button
                key={s}
                onClick={() => setStore(s)}
                className='px-3 py-1.5 text-base font-medium transition-all whitespace-nowrap'
                style={{
                  borderRadius: 7,
                  background: active ? cfg.color + '18' : 'transparent',
                  color: active ? cfg.color : 'var(--text-secondary)',
                  border: active ? `1px solid ${cfg.color}35` : '1px solid transparent',
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Date range selector */}
        <div
          className='flex items-center gap-0.5 p-1'
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
          }}
        >
          {DATE_RANGES.map(dr => {
            const active = dateRange === dr;
            return (
              <button
                key={dr}
                onClick={() => setDateRange(dr)}
                className='px-3 py-1 text-[16px] font-mono transition-all'
                style={{
                  borderRadius: 6,
                  background: active ? 'rgba(0,217,255,0.15)' : 'transparent',
                  color: active ? 'var(--cyan)' : 'var(--text-secondary)',
                  border: active ? '1px solid rgba(0,217,255,0.3)' : '1px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {DR_LABEL[dr]}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI cards */}
      <div className='grid grid-cols-4 gap-3 mb-5'>
        {kpis.map(kpi => {
          const Icon    = kpi.icon;
          const isGood  = kpi.lowerIsBetter ? kpi.delta <= 0 : kpi.delta >= 0;
          const sign    = kpi.delta >= 0 ? '+' : '';
          const display = kpi.deltaIsAbsolute
            ? `${sign}${kpi.delta.toFixed(kpi.lowerIsBetter ? 1 : 2)}${kpi.lowerIsBetter ? '' : 'pp'}`
            : `${sign}${kpi.delta.toFixed(1)}%`;

          return (
            <div key={kpi.label} className='glass-card-elevated px-4 py-3.5 relative overflow-hidden'>
              <div
                className='absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none'
                style={{ background: kpi.color, opacity: 0.06, transform: 'translate(40%, -40%)' }}
              />
              <div className='flex items-center justify-between mb-2.5'>
                <div className='section-label'>{kpi.label}</div>
                <div className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0'
                  style={{ background: kpi.color + '20' }}>
                  <Icon size={13} style={{ color: kpi.color }} />
                </div>
              </div>
              <div className='font-bold text-xl mb-1.5 leading-none' style={{ fontFamily: 'DM Mono', color: kpi.color }}>
                {kpi.value}
              </div>
              <div className='flex items-center gap-1 text-[16px] font-mono'
                style={{ color: isGood ? '#10d98a' : '#ff4444' }}>
                {isGood ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {display}
                <span className='ml-1' style={{ color: 'var(--text-muted)' }}>vs prior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className='mb-5' style={{ height: 200 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={metrics.series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id='gscClicks' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%'  stopColor='#00d9ff' stopOpacity={0.3} />
                <stop offset='95%' stopColor='#00d9ff' stopOpacity={0} />
              </linearGradient>
              <linearGradient id='gscImpressions' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%'  stopColor={storeCfg.color} stopOpacity={0.18} />
                <stop offset='95%' stopColor={storeCfg.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(var(--overlay-rgb),0.04)' />
            <XAxis
              dataKey='date'
              tick={{ fill: 'var(--text-muted)', fontSize: 16, fontFamily: 'DM Mono' }}
              tickLine={false}
              axisLine={false}
              interval={dateRange === '7d' ? 0 : dateRange === '30d' ? 4 : 12}
            />
            <YAxis
              yAxisId='clicks'
              tick={{ fill: 'var(--text-muted)', fontSize: 16, fontFamily: 'DM Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmt}
            />
            <YAxis
              yAxisId='impressions'
              orientation='right'
              tick={{ fill: 'var(--text-muted)', fontSize: 16, fontFamily: 'DM Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmt}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 16, fontFamily: 'DM Mono', color: 'var(--text-muted)', paddingTop: 6 }}
            />
            <Area
              yAxisId='impressions'
              type='monotone'
              dataKey='impressions'
              name='Impressions'
              stroke={storeCfg.color}
              strokeWidth={1.5}
              fill='url(#gscImpressions)'
              strokeDasharray='4 2'
            />
            <Area
              yAxisId='clicks'
              type='monotone'
              dataKey='clicks'
              name='Clicks'
              stroke='#00d9ff'
              strokeWidth={2}
              fill='url(#gscClicks)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tables row */}
      <div className='grid grid-cols-2 gap-4'>
        {/* Top Pages */}
        <div>
          <div className='section-label mb-2.5'>Top Pages</div>
          <table className='w-full text-base' style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['URL', 'Clicks', 'Imp', 'CTR', 'Pos'].map(h => (
                  <th key={h} className='text-left pb-2 pr-2'
                    style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono', fontWeight: 500, fontSize: 16, letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storeData.topPages.map((p, i) => (
                <tr
                  key={i}
                  className='transition-colors hover:bg-white/[0.02]'
                  style={{ borderBottom: i < storeData.topPages.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
                >
                  <td className='py-2 pr-2' style={{ maxWidth: 120 }}>
                    <span
                      className='font-mono block truncate'
                      style={{ color: '#7b93ff', fontSize: 16, maxWidth: 120 }}
                    >
                      {p.url}
                    </span>
                  </td>
                  <td className='py-2 pr-2 font-mono tabular-nums' style={{ color: 'var(--text-primary)', fontSize: 16 }}>{fmt(p.clicks)}</td>
                  <td className='py-2 pr-2 font-mono tabular-nums' style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{fmt(p.impressions)}</td>
                  <td className='py-2 pr-2 font-mono tabular-nums' style={{ color: '#10d98a', fontSize: 16 }}>{p.ctr.toFixed(1)}%</td>
                  <td className='py-2'>
                    <span
                      className='inline-flex items-center justify-center px-1.5 py-0.5 rounded font-mono font-semibold'
                      style={{ fontSize: 16, background: positionBadgeColor(p.position) + '20', color: positionBadgeColor(p.position) }}
                    >
                      {p.position.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Queries */}
        <div>
          <div className='section-label mb-2.5'>Top Queries</div>
          <table className='w-full text-base' style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Query', 'Clicks', 'Imp', 'CTR', 'Pos'].map(h => (
                  <th key={h} className='text-left pb-2 pr-2'
                    style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono', fontWeight: 500, fontSize: 16, letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storeData.topQueries.map((q, i) => (
                <tr
                  key={i}
                  className='transition-colors hover:bg-white/[0.02]'
                  style={{ borderBottom: i < storeData.topQueries.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
                >
                  <td className='py-2 pr-2' style={{ maxWidth: 150 }}>
                    <span
                      className='block truncate'
                      style={{ color: 'var(--text-primary)', fontSize: 16, maxWidth: 150 }}
                    >
                      {q.query}
                    </span>
                  </td>
                  <td className='py-2 pr-2 font-mono tabular-nums' style={{ color: 'var(--text-primary)', fontSize: 16 }}>{fmt(q.clicks)}</td>
                  <td className='py-2 pr-2 font-mono tabular-nums' style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{fmt(q.impressions)}</td>
                  <td className='py-2 pr-2 font-mono tabular-nums' style={{ color: '#10d98a', fontSize: 16 }}>{q.ctr.toFixed(1)}%</td>
                  <td className='py-2'>
                    <span
                      className='inline-flex items-center justify-center px-1.5 py-0.5 rounded font-mono font-semibold'
                      style={{ fontSize: 16, background: positionBadgeColor(q.position) + '20', color: positionBadgeColor(q.position) }}
                    >
                      {q.position.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
