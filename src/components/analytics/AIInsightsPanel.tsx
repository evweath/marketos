'use client';

import { useEffect, useState } from 'react';
import { CHANNEL_CONFIG } from '@/lib/analyticsData';
import type { AIInsight } from '@/lib/analyticsData';
import { Lightbulb, AlertTriangle, TrendingUp, ChevronDown, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TypeConfig {
  Icon: LucideIcon;
  color: string;
  label: string;
  bg: string;
}

const TYPE_CONFIG: Record<AIInsight['type'], TypeConfig> = {
  opportunity: { Icon: Lightbulb,    color: 'var(--cyan)', label: 'Opportunity', bg: 'rgba(0,217,255,0.055)'  },
  anomaly:     { Icon: AlertTriangle, color: '#ff4444', label: 'Anomaly',     bg: 'rgba(255,68,68,0.055)'  },
  warning:     { Icon: AlertTriangle, color: '#ffb347', label: 'Warning',     bg: 'rgba(255,179,71,0.055)' },
  win:         { Icon: TrendingUp,    color: '#10d98a', label: 'Win',         bg: 'rgba(16,217,138,0.055)' },
};

const IMPACT_BADGE: Record<AIInsight['impact'], string> = {
  high:   'badge-critical',
  medium: 'badge-warning',
  low:    'badge-info',
};

const IMPACT_LABEL: Record<AIInsight['impact'], string> = {
  high:   'High Impact',
  medium: 'Med. Impact',
  low:    'Low Impact',
};

function InsightCard({ insight }: { insight: AIInsight }) {
  const [expanded, setExpanded] = useState(insight.impact === 'high');
  const tc = TYPE_CONFIG[insight.type];
  const Icon = tc.Icon;
  const channelCfg = insight.channel ? CHANNEL_CONFIG[insight.channel] : null;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: tc.bg,
        border: `1px solid ${tc.color}22`,
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${tc.color}44`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${tc.color}22`;
      }}
    >
      <button
        className="w-full flex items-start gap-3 p-3.5 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Type icon */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: tc.color + '20' }}
        >
          <Icon size={14} style={{ color: tc.color }} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Badge row */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span
              className="text-[16px] font-mono px-1.5 py-0.5 rounded font-semibold"
              style={{ background: tc.color + '20', color: tc.color }}
            >
              {tc.label.toUpperCase()}
            </span>
            <span className={IMPACT_BADGE[insight.impact]}>
              {IMPACT_LABEL[insight.impact]}
            </span>
            {channelCfg && (
              <span
                className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: channelCfg.color + '15', color: channelCfg.color }}
              >
                {channelCfg.label}
              </span>
            )}
          </div>
          <div className="text-base font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
            {insight.title}
          </div>
        </div>

        {/* Chevron */}
        <div
          className="shrink-0 mt-1"
          style={{
            color: 'var(--text-muted)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <ChevronDown size={14} />
        </div>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 animate-fade-up">
          <div className="h-px mb-3" style={{ background: `${tc.color}20` }} />
          <p className="text-base leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            {insight.detail}
          </p>
          {insight.action && (
            <div
              className="flex items-start gap-3 pl-3"
              style={{ borderLeft: `2px solid ${tc.color}50` }}
            >
              <div>
                <div className="section-label mb-0.5">Recommended Action</div>
                <p className="text-base" style={{ color: 'var(--text-primary)' }}>{insight.action}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  const [filter, setFilter] = useState<'all' | 'high'>('all');
  const shown = insights.filter(i => filter === 'all' || i.impact === 'high');

  // Rendered only after mount to avoid a server/client hydration mismatch
  // (the current time differs between the SSR pass and hydration).
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  useEffect(() => {
    const format = () =>
      setUpdatedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    format();
    const id = setInterval(format, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: '#7b93ff' }} />
          <div className="section-label">AI Insights</div>
        </div>
        {/* Filter segmented control */}
        <div
          className="flex items-center p-0.5 rounded-full"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          {(['all', 'high'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2.5 py-1 rounded-full text-[16px] transition-all"
              style={{
                background: filter === f ? 'var(--bg-overlay)' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'DM Mono',
                fontWeight: filter === f ? 500 : 400,
                boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.35)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {f === 'all' ? 'All' : 'High Impact'}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 && (
        <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>No AI insights yet — connect channels with real data to generate recommendations.</div>
      )}

      <div className="space-y-2">
        {shown.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      <div
        className="mt-3 pt-3 border-t flex items-center gap-2"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: '#7b93ff' }} />
        <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
          AI analysis updated · <span suppressHydrationWarning>{updatedAt ?? '—:—'}</span>
        </span>
      </div>
    </div>
  );
}
