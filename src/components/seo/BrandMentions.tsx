'use client';

import { useState } from 'react';
import { ExternalLink, MessageCircle, CheckCircle, XCircle, Bot } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { BRAND_MENTIONS, LLM_VISIBILITY } from '@/lib/seoData';
import type { MentionSource, Sentiment, LlmProvider } from '@/lib/seoData';

type SourceFilter = MentionSource | 'all';

const SOURCE_CONFIG: Record<MentionSource, { label: string; color: string }> = {
  web:    { label: 'Web',    color: '#7b93ff' },
  social: { label: 'Social', color: 'var(--cyan)' },
  news:   { label: 'News',   color: '#ffb347' },
};

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; color: string }> = {
  positive: { label: 'Positive', color: '#10d98a' },
  neutral:  { label: 'Neutral',  color: '#7b93ff' },
  negative: { label: 'Negative', color: '#ff4444' },
};

const LLM_CONFIG: Record<LlmProvider, { color: string; initial: string; name: string }> = {
  ChatGPT:    { color: '#10d98a', initial: 'GP', name: 'ChatGPT'    },
  Gemini:     { color: '#4285F4', initial: 'GE', name: 'Gemini'     },
  Claude:     { color: '#ffb347', initial: 'CL', name: 'Claude'     },
  Perplexity: { color: '#7b93ff', initial: 'PP', name: 'Perplexity' },
};

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

const SOURCE_FILTERS: SourceFilter[] = ['all', 'web', 'social', 'news'];

export function BrandMentions() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [responded, setResponded] = usePersistentState<Record<string, boolean>>('seo.mentionResponded', {});

  const filtered = BRAND_MENTIONS.filter(m => sourceFilter === 'all' || m.source === sourceFilter);

  const positive = BRAND_MENTIONS.filter(m => m.sentiment === 'positive').length;
  const neutral  = BRAND_MENTIONS.filter(m => m.sentiment === 'neutral').length;
  const negative = BRAND_MENTIONS.filter(m => m.sentiment === 'negative').length;
  const total    = BRAND_MENTIONS.length;

  const positivePct = Math.round((positive / total) * 100);
  const neutralPct  = Math.round((neutral  / total) * 100);
  const negativePct = Math.round((negative / total) * 100);

  const webCount    = BRAND_MENTIONS.filter(m => m.source === 'web').length;
  const socialCount = BRAND_MENTIONS.filter(m => m.source === 'social').length;
  const newsCount   = BRAND_MENTIONS.filter(m => m.source === 'news').length;

  const sourceCounts: Record<MentionSource, number> = { web: webCount, social: socialCount, news: newsCount };

  return (
    <div className='space-y-4'>
      {/* LLM Visibility — 4-col grid */}
      <div className='glass-card p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <Bot size={14} style={{ color: '#7b93ff' }} />
            <div className='section-label'>LLM Brand Visibility</div>
          </div>
          <div className='flex items-center gap-1.5 text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>
            <div className='w-1.5 h-1.5 rounded-full live-dot' style={{ background: '#10d98a' }} />
            Checked today
          </div>
        </div>

        <div className='grid grid-cols-4 gap-3'>
          {LLM_VISIBILITY.map(entry => {
            const cfg = LLM_CONFIG[entry.llm];
            return (
              <div
                key={entry.llm}
                className='rounded-xl p-3.5'
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${entry.mentioned ? cfg.color + '35' : 'var(--border-subtle)'}`,
                }}
              >
                {/* LLM avatar + status */}
                <div className='flex items-center justify-between mb-3'>
                  <div
                    className='w-9 h-9 rounded-xl flex items-center justify-center text-[16px] font-bold'
                    style={{ background: cfg.color + '20', color: cfg.color, fontFamily: 'DM Mono' }}
                  >
                    {cfg.initial}
                  </div>
                  {entry.mentioned
                    ? <CheckCircle size={14} style={{ color: '#10d98a' }} />
                    : <XCircle    size={14} style={{ color: '#ff4444' }} />}
                </div>

                {/* LLM name */}
                <div className='text-base font-semibold mb-1' style={{ color: 'var(--text-primary)' }}>
                  {cfg.name}
                </div>

                {entry.mentioned ? (
                  <>
                    {/* Mentioned badge + rank */}
                    <div className='flex items-center gap-1.5 mb-2'>
                      <span
                        className='text-[16px] px-1.5 py-0.5 rounded-full font-mono font-semibold'
                        style={{ background: 'rgba(16,217,138,0.15)', color: '#10d98a' }}
                      >
                        Mentioned
                      </span>
                      {entry.rank !== null && (
                        <span
                          className='text-[16px] px-1.5 py-0.5 rounded-full font-mono font-semibold'
                          style={{ background: cfg.color + '20', color: cfg.color }}
                        >
                          #{entry.rank}
                        </span>
                      )}
                    </div>
                    <div className='text-[16px] leading-relaxed' style={{ color: 'var(--text-secondary)' }}>
                      {entry.context.length > 80 ? entry.context.slice(0, 80) + '…' : entry.context}
                    </div>
                  </>
                ) : (
                  <span
                    className='text-[16px] px-1.5 py-0.5 rounded-full font-mono font-semibold'
                    style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444' }}
                  >
                    Not mentioned
                  </span>
                )}

                <div className='mt-3 text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>
                  {new Date(entry.lastChecked).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sentiment summary bar */}
      <div className='glass-card p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='section-label'>Sentiment Overview</div>
          <div className='flex items-center gap-3 text-[16px] font-mono'>
            {(['web', 'social', 'news'] as MentionSource[]).map(s => (
              <span key={s} style={{ color: SOURCE_CONFIG[s].color }}>
                {SOURCE_CONFIG[s].label}: {sourceCounts[s]}
              </span>
            ))}
          </div>
        </div>

        {/* Segmented bar */}
        <div className='flex gap-1 h-4 rounded-full overflow-hidden mb-3'>
          <div className='rounded-full transition-all' style={{ width: `${positivePct}%`, background: '#10d98a' }} />
          <div className='rounded-full transition-all' style={{ width: `${neutralPct}%`,  background: '#7b93ff' }} />
          <div className='rounded-full transition-all' style={{ width: `${negativePct}%`, background: '#ff4444' }} />
        </div>

        <div className='flex items-center gap-5'>
          {[
            { label: 'Positive', pct: positivePct, color: '#10d98a' },
            { label: 'Neutral',  pct: neutralPct,  color: '#7b93ff' },
            { label: 'Negative', pct: negativePct, color: '#ff4444' },
          ].map(seg => (
            <div key={seg.label} className='flex items-center gap-2'>
              <div className='w-2.5 h-2.5 rounded-full' style={{ background: seg.color }} />
              <span className='text-[16px] font-semibold font-mono' style={{ color: seg.color }}>{seg.pct}%</span>
              <span className='text-[16px]' style={{ color: 'var(--text-muted)' }}>{seg.label}</span>
            </div>
          ))}
          <span className='ml-auto text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>
            {total} total
          </span>
        </div>
      </div>

      {/* Mentions list */}
      <div className='glass-card p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='section-label'>All Mentions</div>
          {/* Source filter pills */}
          <div
            className='flex items-center gap-0.5 p-1'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}
          >
            {SOURCE_FILTERS.map(f => {
              const active = sourceFilter === f;
              const color  = f === 'all' ? '#7b93ff' : SOURCE_CONFIG[f].color;
              const count  = f !== 'all' ? sourceCounts[f] : undefined;
              return (
                <button
                  key={f}
                  onClick={() => setSourceFilter(f)}
                  className='px-2.5 py-1 text-[16px] font-mono transition-all'
                  style={{
                    borderRadius: 6,
                    background: active ? color + '18' : 'transparent',
                    color: active ? color : 'var(--text-secondary)',
                    border: active ? `1px solid ${color}35` : '1px solid transparent',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {f === 'all' ? 'All' : SOURCE_CONFIG[f].label}
                  {count !== undefined && (
                    <span className='ml-1.5 tabular-nums' style={{ color: active ? color : 'var(--text-muted)' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className='space-y-2'>
          {filtered.map(mention => {
            const sCfg   = SENTIMENT_CONFIG[mention.sentiment];
            const srcCfg = SOURCE_CONFIG[mention.source];

            return (
              <div
                key={mention.id}
                className='rounded-xl p-3.5 transition-colors hover:bg-white/[0.02]'
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: `3px solid ${sCfg.color}40`,
                }}
              >
                <div className='flex items-start gap-3'>
                  <div className='flex-1 min-w-0'>
                    {/* Badges row */}
                    <div className='flex items-center gap-2 mb-2 flex-wrap'>
                      <span
                        className='text-[16px] px-2 py-0.5 rounded-full font-mono font-semibold'
                        style={{ background: srcCfg.color + '18', color: srcCfg.color }}
                      >
                        {mention.platform}
                      </span>
                      <span
                        className='text-[16px] px-2 py-0.5 rounded-full font-mono font-semibold'
                        style={{ background: sCfg.color + '14', color: sCfg.color }}
                      >
                        {sCfg.label}
                      </span>
                      <span className='text-[16px] font-medium' style={{ color: 'var(--text-secondary)' }}>
                        {mention.author}
                      </span>
                      <span className='text-[16px] font-mono ml-auto' style={{ color: 'var(--text-muted)' }}>
                        {mention.timeAgo}
                      </span>
                    </div>

                    {/* Content */}
                    <p className='text-[16px] leading-relaxed mb-2.5' style={{ color: 'var(--text-secondary)' }}>
                      {mention.content}
                    </p>

                    {/* Footer */}
                    <div className='flex items-center justify-between'>
                      <span className='text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>
                        Reach: <span className='font-semibold' style={{ color: 'var(--text-secondary)' }}>{fmt(mention.reach)}</span>
                      </span>
                      <div className='flex items-center gap-1.5'>
                        <a
                          href={mention.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='p-1 rounded-lg transition-colors hover:bg-white/5'
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <ExternalLink size={11} />
                        </a>
                        {responded[mention.id] ? (
                          <span
                            className='flex items-center gap-1 px-2.5 py-1 rounded-lg text-[16px] font-mono'
                            style={{
                              background: 'rgba(16,217,138,0.12)',
                              color: '#10d98a',
                              border: '1px solid rgba(16,217,138,0.25)',
                            }}
                          >
                            <CheckCircle size={9} />Responded
                          </span>
                        ) : (
                          <button
                            onClick={() => setResponded(prev => ({ ...prev, [mention.id]: true }))}
                            className='flex items-center gap-1 px-2.5 py-1 rounded-lg text-[16px] font-mono transition-all'
                            style={{
                              background: mention.sentiment === 'negative' ? 'rgba(255,68,68,0.1)' : 'rgba(0,217,255,0.08)',
                              color: mention.sentiment === 'negative' ? '#ff4444' : 'var(--cyan)',
                              border: `1px solid ${mention.sentiment === 'negative' ? 'rgba(255,68,68,0.2)' : 'rgba(0,217,255,0.15)'}`,
                            }}
                          >
                            <MessageCircle size={9} />Respond
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
