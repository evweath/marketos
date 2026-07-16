'use client';

import { useState } from 'react';
import { PLATFORM_CONFIG } from '@/lib/socialData';
import type { SocialListeningItem } from '@/lib/socialData';
import { usePersistentState } from '@/lib/usePersistentState';
import { useStores, resolveStoreId } from '@/lib/storeScope';
import { Search, ExternalLink } from 'lucide-react';

const SENTIMENT_CONFIG = {
  positive: { color: '#10d98a', bg: 'rgba(16,217,138,0.12)', border: 'rgba(16,217,138,0.22)', arrow: '↑', label: 'Positive' },
  neutral:  { color: '#7b93ff', bg: 'rgba(123,147,255,0.12)', border: 'rgba(123,147,255,0.22)', arrow: '→', label: 'Neutral'  },
  negative: { color: '#ff4444', bg: 'rgba(255,68,68,0.12)',   border: 'rgba(255,68,68,0.22)',   arrow: '↓', label: 'Negative' },
};

// ─── Sentiment Analytics ───────────────────────────────────────────────────────
// A real sentiment donut computed from the current (scoped/filtered) mentions.

function SentimentDonut({ counts, total }: { counts: Record<'positive' | 'neutral' | 'negative', number>; total: number }) {
  const size = 96, r = 38, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const order = ['positive', 'neutral', 'negative'] as const;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-overlay)" strokeWidth={9} />
        {total > 0 && order.map(k => {
          const frac = counts[k] / total;
          const dash = frac * circ;
          const seg = (
            <circle key={k} cx={cx} cy={cy} r={r} fill="none" stroke={SENTIMENT_CONFIG[k].color} strokeWidth={9}
              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold" style={{ fontSize: 20, color: 'var(--text-primary)' }}>{total}</span>
        <span className="section-label" style={{ fontSize: 16 }}>mentions</span>
      </div>
    </div>
  );
}

function SentimentAnalyticsPanel({ listeningItems }: { listeningItems: SocialListeningItem[] }) {
  const total = listeningItems.length;
  const counts = {
    positive: listeningItems.filter(i => i.sentiment === 'positive').length,
    neutral:  listeningItems.filter(i => i.sentiment === 'neutral').length,
    negative: listeningItems.filter(i => i.sentiment === 'negative').length,
  };
  return (
    <div className="rounded-xl p-4 mb-4 flex flex-col gap-3"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Sentiment Analysis</span>
        <span className="section-label">{total} mentions monitored</span>
      </div>
      {total === 0 ? (
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>No mentions to analyze yet.</p>
      ) : (
        <div className="flex items-center gap-5">
          <SentimentDonut counts={counts} total={total} />
          <div className="flex-1 flex flex-col gap-2.5">
            {(['positive', 'neutral', 'negative'] as const).map(k => {
              const cfg = SENTIMENT_CONFIG[k];
              const pct = total > 0 ? Math.round((counts[k] / total) * 100) : 0;
              return (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-[16px] capitalize" style={{ color: cfg.color }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />{cfg.label}
                    </span>
                    <span className="text-[16px] font-mono" style={{ color: cfg.color }}>{counts[k]} · {pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: cfg.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const KEYWORDS = ['donut equipment', 'donut-equipment.com', 'donut supplies', 'commercial donut fryer', 'bakery wholesale'];

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function SocialListening({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [allListeningItems] = usePersistentState<SocialListeningItem[]>('social.listeningItems', []);
  const scopedItems = allListeningItems.filter(i => selectedStoreIds.includes(resolveStoreId(i.store, stores) ?? ''));
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [query, setQuery] = useState('');
  const [actedIds, setActedIds] = useState<Set<string>>(new Set());
  const markActed = (id: string) => setActedIds(prev => new Set(prev).add(id));

  const q = query.trim().toLowerCase();
  const listeningItems = q === '' ? scopedItems : scopedItems.filter(i =>
    i.content.toLowerCase().includes(q) || i.author.toLowerCase().includes(q) || i.keyword.toLowerCase().includes(q));
  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'rgba(0,217,255,0.12)' }}>
            <Search size={11} style={{ color: 'var(--cyan)' }} />
          </div>
          <span className="section-label">Social Listening</span>
        </div>
        <div className="flex items-center gap-1.5 text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
          <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: '#10d98a' }} />
          Live monitoring
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search mentions by keyword, author, or content…"
          className="w-full text-base rounded-lg outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px 10px 8px 30px' }}
        />
      </div>

      {/* Sentiment analytics toggle */}
      <button onClick={() => setShowAnalytics(v => !v)}
        className="text-[16px] mb-3 flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
        style={{ color: '#7b93ff', background: 'rgba(123,147,255,.08)', border: '1px solid rgba(123,147,255,.2)' }}>
        {showAnalytics ? '▲' : '▼'} Sentiment Analysis
      </button>
      {showAnalytics && <SentimentAnalyticsPanel listeningItems={listeningItems} />}

      {/* Tracked keywords */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {KEYWORDS.map(kw => (
          <span key={kw}
            className="flex items-center gap-1 text-[16px] font-mono px-2 py-0.5 rounded"
            style={{
              background: 'rgba(0,217,255,0.08)',
              color: 'var(--cyan)',
              border: '1px solid rgba(0,217,255,0.18)',
            }}>
            # {kw}
          </span>
        ))}
      </div>

      {/* Listening items */}
      {listeningItems.length === 0 && (
        <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
          {allListeningItems.length === 0
            ? 'No mentions found yet for your tracked keywords.'
            : q !== ''
            ? 'No mentions match your search.'
            : `No mentions for the selected store${selectedStoreIds.length !== 1 ? 's' : ''}.`}
        </div>
      )}
      <div className="space-y-2">
        {listeningItems.map(item => {
          const pCfg = PLATFORM_CONFIG[item.platform];
          const sCfg = SENTIMENT_CONFIG[item.sentiment];

          return (
            <div key={item.id} className="rounded-xl p-3"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              {/* Top row: platform badge + sentiment pill + time + reach */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {/* Platform badge */}
                  <span className="text-[16px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: pCfg.color + '18', color: pCfg.color }}>
                    {pCfg.label}
                  </span>

                  {/* Sentiment pill */}
                  <span
                    className="flex items-center gap-1 text-[16px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: sCfg.bg, color: sCfg.color, border: `1px solid ${sCfg.border}` }}>
                    {sCfg.arrow} {sCfg.label}
                  </span>

                  <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                    {timeAgo(item.foundAt)}
                  </span>
                </div>

                {/* Reach metric */}
                <div className="text-right shrink-0">
                  <div className="data-value text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {fmt(item.reach)}
                  </div>
                  <div className="section-label" style={{ fontSize: 16 }}>reach</div>
                </div>
              </div>

              {/* Author + content */}
              <div className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {item.author}
              </div>
              <p className="text-base leading-relaxed mb-2.5" style={{ color: 'var(--text-secondary)' }}>
                {item.content}
              </p>

              {/* Footer: keyword + actions */}
              <div className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    Keyword: <span style={{ color: 'var(--cyan)' }}>#{item.keyword}</span>
                  </span>
                  <a href={item.url} target="_blank" rel="noreferrer"
                    className="p-1 rounded transition-colors hover:bg-white/[0.06]"
                    style={{ color: 'var(--text-muted)' }}>
                    <ExternalLink size={10} />
                  </a>
                </div>

                {item.sentiment !== 'negative' ? (
                  <button onClick={() => markActed(item.id)}
                    className="text-[16px] font-medium px-2.5 py-1 rounded-full transition-all hover:brightness-110"
                    style={{
                      background: actedIds.has(item.id) ? 'rgba(16,217,138,0.12)' : 'rgba(0,217,255,0.10)',
                      color: actedIds.has(item.id) ? '#10d98a' : 'var(--cyan)',
                      border: `1px solid ${actedIds.has(item.id) ? 'rgba(16,217,138,0.25)' : 'rgba(0,217,255,0.2)'}`,
                    }}>
                    {actedIds.has(item.id) ? '✓ Engaged' : 'Engage'}
                  </button>
                ) : (
                  <button onClick={() => markActed(item.id)}
                    className="text-[16px] font-medium px-2.5 py-1 rounded-full transition-all hover:brightness-110"
                    style={{
                      background: actedIds.has(item.id) ? 'rgba(16,217,138,0.12)' : 'rgba(255,68,68,0.10)',
                      color: actedIds.has(item.id) ? '#10d98a' : '#ff4444',
                      border: `1px solid ${actedIds.has(item.id) ? 'rgba(16,217,138,0.25)' : 'rgba(255,68,68,0.2)'}`,
                    }}>
                    {actedIds.has(item.id) ? '✓ Responded' : 'Respond'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
