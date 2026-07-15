'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { KEYWORD_RANKINGS } from '@/lib/seoData';
import type { StoreId, KeywordRanking } from '@/lib/seoData';

type SortKey = 'rank' | 'change' | 'searchVolume';

const STORE_CONFIG: Record<StoreId | 'all', { label: string; color: string }> = {
  all:                   { label: 'All Stores',       color: '#7b93ff' },
  'donut-equipment':     { label: 'Donut Equipment',  color: 'var(--cyan)' },
  'donut-supplies':      { label: 'Donut Supplies',   color: '#ffb347' },
  'bakery-wholesalers':  { label: 'Bakery Wholesale', color: '#10d98a' },
};

const STORE_ABBR: Record<StoreId, string> = {
  'donut-equipment':    'DE',
  'donut-supplies':     'DS',
  'bakery-wholesalers': 'BW',
};

function rankColor(rank: number): string {
  if (rank <= 3)  return '#10d98a';
  if (rank <= 10) return '#00d9ff';
  if (rank <= 30) return '#ffb347';
  return '#ff4444';
}

function difficultyColor(d: number): string {
  if (d <= 33) return '#10d98a';
  if (d <= 66) return '#ffb347';
  return '#ff4444';
}

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function Sparkline({ data }: { data: { day: number; position: number }[] }) {
  const inverted = data.map(d => ({ ...d, value: 100 - d.position }));
  const first = data[0]?.position ?? 50;
  const last  = data[data.length - 1]?.position ?? 50;
  const improved = last <= first;
  return (
    <ResponsiveContainer width={48} height={24}>
      <LineChart data={inverted}>
        <Line
          type='monotone'
          dataKey='value'
          stroke={improved ? '#10d98a' : '#ff4444'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const TH_STYLE: React.CSSProperties = {
  color: 'var(--text-muted)',
  fontFamily: 'DM Mono',
  fontWeight: 500,
  fontSize: 16,
  letterSpacing: '0.08em',
};

export function KeywordRankTable() {
  const [storeFilter, setStoreFilter] = useState<StoreId | 'all'>('all');
  const [sortKey, setSortKey]         = useState<SortKey>('rank');
  const [sortAsc, setSortAsc]         = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(key !== 'change'); }
  };

  const filtered: KeywordRanking[] = KEYWORD_RANKINGS
    .filter(k => storeFilter === 'all' || k.store === storeFilter)
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === 'rank')         diff = a.rank - b.rank;
      if (sortKey === 'change')       diff = b.change - a.change;
      if (sortKey === 'searchVolume') diff = b.searchVolume - a.searchVolume;
      return sortAsc ? diff : -diff;
    });

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className='w-3 inline-block' />;
    return sortAsc
      ? <ArrowUp size={10} style={{ color: 'var(--cyan)' }} />
      : <ArrowDown size={10} style={{ color: 'var(--cyan)' }} />;
  }

  return (
    <div className='glass-card p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div>
          <div className='section-label mb-1'>Keyword Rankings</div>
          <div className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>
            {filtered.length} keywords tracked
          </div>
        </div>

        {/* Store filter pills */}
        <div
          className='flex items-center gap-0.5 p-1'
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
          }}
        >
          {(['all', 'donut-equipment', 'donut-supplies', 'bakery-wholesalers'] as const).map(s => {
            const cfg    = STORE_CONFIG[s];
            const active = storeFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStoreFilter(s)}
                className='px-2.5 py-1 text-[16px] font-mono transition-all'
                style={{
                  borderRadius: 6,
                  background: active ? cfg.color + '20' : 'transparent',
                  color: active ? cfg.color : 'var(--text-secondary)',
                  border: active ? `1px solid ${cfg.color}40` : '1px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {s === 'all' ? 'All' : STORE_ABBR[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full text-base' style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className='text-left pb-2.5 pr-3' style={TH_STYLE}>KEYWORD</th>
              <th className='text-left pb-2.5 pr-3' style={TH_STYLE}>STORE</th>
              <th
                className='text-center pb-2.5 pr-3 cursor-pointer select-none'
                style={TH_STYLE}
                onClick={() => handleSort('rank')}
              >
                <span className='flex items-center justify-center gap-1'>RANK <SortIcon k='rank' /></span>
              </th>
              <th
                className='text-center pb-2.5 pr-3 cursor-pointer select-none'
                style={TH_STYLE}
                onClick={() => handleSort('change')}
              >
                <span className='flex items-center justify-center gap-1'>CHANGE <SortIcon k='change' /></span>
              </th>
              <th
                className='text-right pb-2.5 pr-3 cursor-pointer select-none'
                style={TH_STYLE}
                onClick={() => handleSort('searchVolume')}
              >
                <span className='flex items-center justify-end gap-1'>VOL <SortIcon k='searchVolume' /></span>
              </th>
              <th className='text-center pb-2.5 pr-3' style={{ ...TH_STYLE, minWidth: 90 }}>DIFFICULTY</th>
              <th className='text-right pb-2.5 pr-3' style={TH_STYLE}>CPC</th>
              <th className='text-center pb-2.5' style={TH_STYLE}>TREND</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((kw, i) => {
              const storeCfg = STORE_CONFIG[kw.store];
              const rColor   = rankColor(kw.rank);
              const improved = kw.change > 0;
              const neutral  = kw.change === 0;
              const dColor   = difficultyColor(kw.difficulty);

              return (
                <tr
                  key={kw.id}
                  className='transition-colors hover:bg-white/[0.02]'
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
                >
                  {/* Keyword */}
                  <td className='py-3 pr-3'>
                    <div
                      className='text-base font-medium'
                      style={{ color: 'var(--text-primary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {kw.keyword}
                    </div>
                    <div
                      className='text-[16px] mt-0.5 font-mono truncate'
                      style={{ color: 'var(--text-muted)', maxWidth: 220 }}
                    >
                      {kw.url}
                    </div>
                  </td>

                  {/* Store badge */}
                  <td className='py-3 pr-3'>
                    <span
                      className='text-[16px] px-2 py-0.5 rounded font-mono font-semibold whitespace-nowrap'
                      style={{ background: storeCfg.color + '18', color: storeCfg.color }}
                    >
                      {STORE_ABBR[kw.store]}
                    </span>
                  </td>

                  {/* Rank — colored circle */}
                  <td className='py-3 pr-3 text-center'>
                    <span
                      className='inline-flex items-center justify-center w-9 h-9 rounded-full font-mono text-base font-bold'
                      style={{ background: rColor + '18', color: rColor, border: `1px solid ${rColor}30` }}
                    >
                      {kw.rank}
                    </span>
                  </td>

                  {/* Change delta chip */}
                  <td className='py-3 pr-3 text-center'>
                    <span
                      className='inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-mono text-[16px] font-semibold'
                      style={{
                        background: neutral ? 'rgba(var(--overlay-rgb),0.05)' : improved ? 'rgba(16,217,138,0.14)' : 'rgba(255,68,68,0.14)',
                        color: neutral ? 'var(--text-muted)' : improved ? '#10d98a' : '#ff4444',
                      }}
                    >
                      {neutral
                        ? <Minus size={9} />
                        : improved
                        ? <ArrowUp size={9} />
                        : <ArrowDown size={9} />}
                      {neutral ? '—' : Math.abs(kw.change)}
                    </span>
                  </td>

                  {/* Volume */}
                  <td className='py-3 pr-3 text-right'>
                    <span className='font-mono text-base' style={{ color: 'var(--text-secondary)' }}>
                      {fmt(kw.searchVolume)}
                    </span>
                  </td>

                  {/* Difficulty bar */}
                  <td className='py-3 pr-3'>
                    <div className='flex items-center gap-2'>
                      <div className='flex-1 h-2 rounded-full' style={{ background: 'var(--bg-overlay)', minWidth: 48 }}>
                        <div
                          className='h-full rounded-full'
                          style={{ width: `${kw.difficulty}%`, background: dColor }}
                        />
                      </div>
                      <span className='font-mono text-[16px] w-5 text-right tabular-nums' style={{ color: dColor }}>
                        {kw.difficulty}
                      </span>
                    </div>
                  </td>

                  {/* CPC */}
                  <td className='py-3 pr-3 text-right'>
                    <span className='font-mono text-base' style={{ color: 'var(--text-secondary)' }}>
                      ${kw.cpc.toFixed(2)}
                    </span>
                  </td>

                  {/* Sparkline */}
                  <td className='py-3 text-center'>
                    <div className='flex justify-center'>
                      <Sparkline data={kw.trend} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className='flex items-center gap-5 mt-4 pt-3' style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <span className='section-label'>Rank:</span>
        {[
          { label: '#1–3',  color: '#10d98a' },
          { label: '#4–10', color: 'var(--cyan)' },
          { label: '#11–30', color: '#ffb347' },
          { label: '#30+',  color: '#ff4444' },
        ].map(r => (
          <div key={r.label} className='flex items-center gap-1.5'>
            <div className='w-2.5 h-2.5 rounded-full' style={{ background: r.color }} />
            <span className='text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
