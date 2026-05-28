'use client';

import { useState } from 'react';
import { LISTENING_ITEMS, PLATFORM_CONFIG } from '@/lib/socialData';
import { Search, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SENTIMENT_CONFIG = {
  positive: { color: '#10d98a', bg: 'rgba(16,217,138,0.12)', border: 'rgba(16,217,138,0.22)', arrow: '↑', label: 'Positive' },
  neutral:  { color: '#7b93ff', bg: 'rgba(123,147,255,0.12)', border: 'rgba(123,147,255,0.22)', arrow: '→', label: 'Neutral'  },
  negative: { color: '#ff4444', bg: 'rgba(255,68,68,0.12)',   border: 'rgba(255,68,68,0.22)',   arrow: '↓', label: 'Negative' },
};

// ─── Sentiment Analytics ───────────────────────────────────────────────────────

const SENTIMENT_HISTORY = [
  { week: 'Apr 21', positive: 58, neutral: 28, negative: 14 },
  { week: 'Apr 28', positive: 62, neutral: 26, negative: 12 },
  { week: 'May 5',  positive: 67, neutral: 24, negative: 9  },
  { week: 'May 12', positive: 71, neutral: 21, negative: 8  },
];

function SentimentAnalyticsPanel() {
  const current  = SENTIMENT_HISTORY[SENTIMENT_HISTORY.length - 1];
  const previous = SENTIMENT_HISTORY[SENTIMENT_HISTORY.length - 2];
  const posDelta = current.positive - previous.positive;
  const negDelta = current.negative - previous.negative;

  const totalMentions = LISTENING_ITEMS.length;
  const byPlatform = PLATFORM_CONFIG && Object.entries(
    LISTENING_ITEMS.reduce<Record<string, { positive: number; negative: number; neutral: number }>>((acc, item) => {
      if (!acc[item.platform]) acc[item.platform] = { positive: 0, negative: 0, neutral: 0 };
      acc[item.platform][item.sentiment]++;
      return acc;
    }, {})
  );

  return (
    <div className="rounded-xl p-4 mb-4 flex flex-col gap-4"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Sentiment Analysis</span>
        <span className="section-label">{totalMentions} mentions monitored</span>
      </div>

      {/* Current breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { key: 'positive' as const, delta: posDelta,    TrendIcon: posDelta >= 0 ? TrendingUp : TrendingDown },
          { key: 'neutral'  as const, delta: 0,           TrendIcon: Minus },
          { key: 'negative' as const, delta: -negDelta,   TrendIcon: negDelta <= 0 ? TrendingUp : TrendingDown },
        ]).map(({ key, delta, TrendIcon }) => {
          const cfg = SENTIMENT_CONFIG[key];
          const val = current[key];
          const deltaColor = key === 'negative'
            ? (negDelta > 0 ? '#ff4444' : '#10d98a')
            : (delta >= 0 ? '#10d98a' : '#ff4444');
          return (
            <div key={key} className="rounded-lg p-3" style={{ background: 'var(--bg-base)', border: `1px solid ${cfg.border}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium capitalize" style={{ color: cfg.color }}>{cfg.label}</span>
                {delta !== 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] font-mono" style={{ color: deltaColor }}>
                    <TrendIcon size={9} />{Math.abs(delta)}%
                  </span>
                )}
              </div>
              <div className="text-xl font-bold mb-1.5" style={{ color: cfg.color }}>{val}%</div>
              <div className="w-full h-1 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                <div className="h-1 rounded-full transition-all" style={{ width: `${val}%`, background: cfg.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4-week trend */}
      <div>
        <div className="section-label mb-2 text-[10px]">4-Week Trend</div>
        <div className="flex gap-1 items-end h-12">
          {SENTIMENT_HISTORY.map((wk, i) => (
            <div key={wk.week} className="flex-1 flex flex-col gap-0.5 items-center">
              <div className="w-full flex flex-col-reverse gap-px" style={{ height: 36 }}>
                {([
                  { pct: wk.positive, color: '#10d98a' },
                  { pct: wk.neutral,  color: '#7b93ff' },
                  { pct: wk.negative, color: '#ff4444' },
                ] as const).map((seg, j) => (
                  <div key={j} style={{ height: `${seg.pct * 0.36}px`, background: seg.color, borderRadius: 2, opacity: i === SENTIMENT_HISTORY.length - 1 ? 1 : 0.55 }} />
                ))}
              </div>
              <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{wk.week}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {(['positive', 'neutral', 'negative'] as const).map(k => (
            <div key={k} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: SENTIMENT_CONFIG[k].color }} />
              <span className="text-[9px] capitalize" style={{ color: 'var(--text-muted)' }}>{k}</span>
            </div>
          ))}
        </div>
      </div>
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

export default function SocialListening() {
  const [showAnalytics, setShowAnalytics] = useState(true);
  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'rgba(0,217,255,0.12)' }}>
            <Search size={11} style={{ color: '#00d9ff' }} />
          </div>
          <span className="section-label">Social Listening</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: '#10d98a' }} />
          Live monitoring
        </div>
      </div>

      {/* Sentiment analytics toggle */}
      <button onClick={() => setShowAnalytics(v => !v)}
        className="text-[10px] mb-3 flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
        style={{ color: '#7b93ff', background: 'rgba(123,147,255,.08)', border: '1px solid rgba(123,147,255,.2)' }}>
        {showAnalytics ? '▲' : '▼'} Sentiment Analysis
      </button>
      {showAnalytics && <SentimentAnalyticsPanel />}

      {/* Tracked keywords */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {KEYWORDS.map(kw => (
          <span key={kw}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded"
            style={{
              background: 'rgba(0,217,255,0.08)',
              color: '#00d9ff',
              border: '1px solid rgba(0,217,255,0.18)',
            }}>
            # {kw}
          </span>
        ))}
      </div>

      {/* Listening items */}
      <div className="space-y-2">
        {LISTENING_ITEMS.map(item => {
          const pCfg = PLATFORM_CONFIG[item.platform];
          const sCfg = SENTIMENT_CONFIG[item.sentiment];

          return (
            <div key={item.id} className="rounded-xl p-3"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              {/* Top row: platform badge + sentiment pill + time + reach */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {/* Platform badge */}
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: pCfg.color + '18', color: pCfg.color }}>
                    {pCfg.label}
                  </span>

                  {/* Sentiment pill */}
                  <span
                    className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: sCfg.bg, color: sCfg.color, border: `1px solid ${sCfg.border}` }}>
                    {sCfg.arrow} {sCfg.label}
                  </span>

                  <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                    {timeAgo(item.foundAt)}
                  </span>
                </div>

                {/* Reach metric */}
                <div className="text-right shrink-0">
                  <div className="data-value text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {fmt(item.reach)}
                  </div>
                  <div className="section-label" style={{ fontSize: 8 }}>reach</div>
                </div>
              </div>

              {/* Author + content */}
              <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {item.author}
              </div>
              <p className="text-xs leading-relaxed mb-2.5" style={{ color: 'var(--text-secondary)' }}>
                {item.content}
              </p>

              {/* Footer: keyword + actions */}
              <div className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    Keyword: <span style={{ color: '#00d9ff' }}>#{item.keyword}</span>
                  </span>
                  <a href={item.url} target="_blank" rel="noreferrer"
                    className="p-1 rounded transition-colors hover:bg-white/[0.06]"
                    style={{ color: 'var(--text-muted)' }}>
                    <ExternalLink size={10} />
                  </a>
                </div>

                {item.sentiment !== 'negative' ? (
                  <button className="text-[10px] font-medium px-2.5 py-1 rounded-full transition-all hover:brightness-110"
                    style={{
                      background: 'rgba(0,217,255,0.10)',
                      color: '#00d9ff',
                      border: '1px solid rgba(0,217,255,0.2)',
                    }}>
                    Engage
                  </button>
                ) : (
                  <button className="text-[10px] font-medium px-2.5 py-1 rounded-full transition-all hover:brightness-110"
                    style={{
                      background: 'rgba(255,68,68,0.10)',
                      color: '#ff4444',
                      border: '1px solid rgba(255,68,68,0.2)',
                    }}>
                    Respond
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
