'use client';

import { useState, Fragment } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { scaledChannelMetrics, DATE_RANGE_LABELS } from '@/lib/analyticsData';
import type { ChannelMetrics, DateRange } from '@/lib/analyticsData';

interface Props {
  dateRange?: DateRange;
  channelMetrics: ChannelMetrics[];
}

type SortKey = keyof Pick<ChannelMetrics, 'spend' | 'revenue' | 'roas' | 'conversions' | 'cpa' | 'cpc' | 'ctr' | 'clicks' | 'impressions' | 'margin'>;

// Deterministic 8-point mini trend for the row-expand (derived from delta).
function miniTrend(seedStr: string, delta: number): string {
  const seed = seedStr.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const pts: number[] = [];
  for (let i = 0; i < 8; i++) pts.push(100 - delta + (delta * i) / 7 + (((seed + i * 29) % 7) - 3) * 0.5);
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  return pts.map((v, i) => `${(i / 7) * 120},${28 - ((v - min) / range) * 24 - 2}`).join(' ');
}

const currency = (n: number): string =>
  n === 0 ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

const fmt = (n: number): string =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1_000 ? (n / 1_000).toFixed(1) + 'K' : n.toLocaleString();

const STATUS_BADGE: Record<ChannelMetrics['status'], string> = {
  strong:      'badge-ok',
  ok:          'badge-info',
  weak:        'badge-critical',
  paused:      'badge-warning',
  'not-started': 'badge-warning',
};

const STATUS_LABEL: Record<ChannelMetrics['status'], string> = {
  strong:      'Strong',
  ok:          'OK',
  weak:        'Weak',
  paused:      'Paused',
  'not-started': 'Not Started',
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks',      label: 'Clicks'      },
  { key: 'ctr',         label: 'CTR'         },
  { key: 'cpc',         label: 'CPC'         },
  { key: 'spend',       label: 'Spend'       },
  { key: 'revenue',     label: 'Revenue'     },
  { key: 'roas',        label: 'ROAS'        },
  { key: 'conversions', label: 'Conv.'       },
  { key: 'cpa',         label: 'CPA'         },
  { key: 'margin',      label: 'Margin%'     },
];

export default function ChannelTable({ dateRange = '30d', channelMetrics }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const metrics = scaledChannelMetrics(dateRange, channelMetrics);

  const exportCsv = () => {
    const header = ['Channel', 'Status', 'Impressions', 'Clicks', 'CTR', 'CPC', 'Spend', 'Revenue', 'ROAS', 'Conversions', 'CPA', 'Margin%'];
    const rows = metrics.map(c => [c.label, STATUS_LABEL[c.status], c.impressions, c.clicks, c.ctr.toFixed(2), c.cpc.toFixed(2), c.spend, c.revenue, c.roas.toFixed(2), c.conversions, c.cpa.toFixed(2), c.margin.toFixed(1)]);
    const csv = [header, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'channel-performance.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const sorted = [...metrics].sort((a, b) => {
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return sortDir === 'desc' ? bv - av : av - bv;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const renderDelta = (delta: number, inverse = false) => {
    const good = inverse ? delta <= 0 : delta >= 0;
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[16px] font-mono ml-1"
        style={{ color: good ? '#10d98a' : '#ff4444' }}
      >
        {good ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
        {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
      </span>
    );
  };

  const renderCell = (ch: ChannelMetrics, key: SortKey) => {
    switch (key) {
      case 'impressions': return <>{fmt(ch.impressions)}{renderDelta(ch.impressionsDelta)}</>;
      case 'clicks':      return <>{fmt(ch.clicks)}{renderDelta(ch.clicksDelta)}</>;
      case 'ctr':         return <>{ch.ctr === 0 ? '—' : ch.ctr.toFixed(2) + '%'}</>;
      case 'cpc':         return <>{ch.cpc === 0 ? '—' : '$' + ch.cpc.toFixed(2)}</>;
      case 'spend':       return <>{currency(ch.spend)}{ch.spend > 0 && renderDelta(ch.spendDelta)}</>;
      case 'revenue':     return <>{currency(ch.revenue)}{renderDelta(ch.revenueDelta)}</>;
      case 'roas':        return <>{ch.roas === 0 ? '—' : ch.roas.toFixed(2) + '×'}{ch.roas > 0 && renderDelta(ch.roasDelta)}</>;
      case 'conversions': return <>{fmt(ch.conversions)}{renderDelta(ch.conversionsDelta)}</>;
      case 'cpa':         return <>{ch.cpa === 0 ? '—' : currency(ch.cpa)}</>;
      case 'margin':      return <>{ch.margin.toFixed(1) + '%'}</>;
    }
  };

  const cellColor = (ch: ChannelMetrics, key: SortKey): string => {
    if (key === 'roas') {
      if (ch.roas > 5) return '#10d98a';
      if (ch.roas > 0 && ch.roas < 3) return '#ff4444';
    }
    if (key === 'cpa' && ch.cpa > 40) return '#ff4444';
    if (key === 'revenue') return ch.color;
    return 'var(--text-primary)';
  };

  return (
    <div className="glass-card overflow-hidden">
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <div className="section-label mb-0.5">Channel Performance</div>
          <div className="text-base" style={{ color: 'var(--text-secondary)' }}>
            All channels · {DATE_RANGE_LABELS[dateRange].toLowerCase()}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
            sorted by {sortKey} {sortDir === 'desc' ? '↓' : '↑'}
          </span>
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 text-[16px] px-2.5 py-1 rounded-lg font-medium"
            style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
            <Download size={12} /> CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-base" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)' }}>
              {/* Channel sticky header */}
              <th
                className="text-left px-4 py-2.5 section-label whitespace-nowrap sticky left-0 z-10"
                style={{ background: 'var(--bg-elevated)' }}
              >
                Channel
              </th>
              {/* Status header */}
              <th className="px-3 py-2.5 section-label whitespace-nowrap">Status</th>
              {/* Sortable column headers */}
              {COLUMNS.map(col => {
                const isActive = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className="px-3 py-2.5 whitespace-nowrap cursor-pointer text-right transition-colors select-none"
                    style={{
                      background: isActive ? 'rgba(0,217,255,0.06)' : 'transparent',
                      color: isActive ? 'var(--cyan)' : 'var(--text-muted)',
                      fontFamily: 'DM Mono',
                      fontSize: 16,
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      {col.label}
                      {isActive
                        ? (sortDir === 'desc' ? <ChevronDown size={9} /> : <ChevronUp size={9} />)
                        : <ChevronDown size={9} style={{ opacity: 0.25 }} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sorted.map(ch => {
              const isSelected = selectedChannel === ch.channel;
              return (
                <Fragment key={ch.channel}>
                <tr
                  className="border-t transition-colors cursor-pointer"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: isSelected
                      ? 'rgba(0,217,255,0.05)'
                      : undefined,
                  }}
                  onClick={() => setSelectedChannel(isSelected ? null : ch.channel)}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(var(--overlay-rgb),0.018)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = '';
                  }}
                >
                  {/* Channel name */}
                  <td
                    className="px-4 py-3 sticky left-0"
                    style={{ background: isSelected ? 'rgba(0,217,255,0.05)' : 'var(--bg-surface)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Color dot */}
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: ch.color, boxShadow: `0 0 5px ${ch.color}60` }}
                      />
                      {/* Icon chip */}
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[16px] font-bold shrink-0"
                        style={{ background: ch.color + '20', color: ch.color }}
                      >
                        {ch.icon}
                      </div>
                      <span className="font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                        {ch.label}
                      </span>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-3 py-3 text-center">
                    <span className={STATUS_BADGE[ch.status]}>
                      {STATUS_LABEL[ch.status]}
                    </span>
                  </td>

                  {/* Data columns */}
                  {COLUMNS.map(col => (
                    <td
                      key={col.key}
                      className="px-3 py-3 text-right data-value"
                      style={{
                        color: cellColor(ch, col.key),
                        fontWeight: col.key === 'revenue' || col.key === 'roas' ? 500 : 400,
                        background: sortKey === col.key ? 'rgba(0,217,255,0.025)' : undefined,
                      }}
                    >
                      {renderCell(ch, col.key)}
                    </td>
                  ))}
                </tr>
                {isSelected && (
                  <tr style={{ background: 'rgba(0,217,255,0.03)' }}>
                    <td colSpan={COLUMNS.length + 2} className="px-4 py-3 sticky left-0" style={{ background: 'rgba(0,217,255,0.03)' }}>
                      <div className="flex items-center gap-6 flex-wrap">
                        <div>
                          <div className="section-label mb-1">Revenue trend (30d)</div>
                          <svg width="120" height="28" style={{ display: 'block' }}>
                            <polyline points={miniTrend(ch.channel, ch.revenueDelta)} fill="none" stroke={ch.revenueDelta >= 0 ? '#10d98a' : '#ff4444'} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
                          </svg>
                        </div>
                        {[
                          { l: 'CPC', v: ch.cpc > 0 ? '$' + ch.cpc.toFixed(2) : '—' },
                          { l: 'CPA', v: ch.cpa > 0 ? currency(ch.cpa) : '—' },
                          { l: 'Margin', v: ch.margin.toFixed(1) + '%' },
                          { l: 'Budget', v: currency(ch.budget) },
                          { l: 'Budget used', v: ch.budget > 0 ? ((ch.spend / ch.budget) * 100).toFixed(0) + '%' : '—' },
                        ].map(m => (
                          <div key={m.l}>
                            <div className="section-label mb-1">{m.l}</div>
                            <div className="text-base font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              );
            })}
          </tbody>

          {/* Totals row */}
          <tfoot>
            <tr
              className="border-t"
              style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-elevated)' }}
            >
              <td
                className="px-4 py-2.5 sticky left-0 font-semibold tracking-widest text-[16px] font-mono"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', letterSpacing: '0.12em' }}
              >
                TOTAL
              </td>
              <td />
              {COLUMNS.map(col => {
                const totals: Partial<Record<SortKey, string>> = {
                  impressions: fmt(metrics.reduce((s, c) => s + c.impressions, 0)),
                  clicks:      fmt(metrics.reduce((s, c) => s + c.clicks, 0)),
                  ctr:         '—',
                  cpc:         (() => { const cl = metrics.reduce((s, c) => s + c.clicks, 0); return cl > 0 ? '$' + (metrics.reduce((s, c) => s + c.spend, 0) / cl).toFixed(2) : '—'; })(),
                  spend:       currency(metrics.reduce((s, c) => s + c.spend, 0)),
                  revenue:     currency(metrics.reduce((s, c) => s + c.revenue, 0)),
                  roas:        (metrics.reduce((s, c) => s + c.revenue, 0) / (metrics.reduce((s, c) => s + c.spend, 0) || 1)).toFixed(2) + '×',
                  conversions: fmt(metrics.reduce((s, c) => s + c.conversions, 0)),
                  cpa:         metrics.reduce((s, c) => s + c.conversions, 0) > 0 ? currency(metrics.reduce((s, c) => s + c.spend, 0) / metrics.reduce((s, c) => s + c.conversions, 0)) : '—',
                  margin:      '—',
                };
                return (
                  <td
                    key={col.key}
                    className="px-3 py-2.5 text-right data-value font-semibold"
                    style={{ color: col.key === 'revenue' ? '#10d98a' : 'var(--text-primary)' }}
                  >
                    {totals[col.key] ?? '—'}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
