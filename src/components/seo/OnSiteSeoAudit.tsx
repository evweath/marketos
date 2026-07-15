'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Tag, FileText, Code, Link2, Type } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import type { AuditCategory, AuditStatus, ImpactLevel, SeoAuditItem } from '@/lib/seoData';

const STATUS_CONFIG: Record<AuditStatus, { icon: typeof CheckCircle; color: string; label: string; badge: string }> = {
  ok:   { icon: CheckCircle,   color: '#10d98a', label: 'OK',      badge: 'badge-ok'      },
  warn: { icon: AlertTriangle, color: '#ffb347', label: 'Warning', badge: 'badge-warning'  },
  error:{ icon: XCircle,       color: '#ff4444', label: 'Error',   badge: 'badge-critical' },
};

const CATEGORY_CONFIG: Record<AuditCategory, { label: string; icon: typeof Tag; color: string }> = {
  meta:      { label: 'Meta Tags', icon: Tag,      color: '#7b93ff' },
  headings:  { label: 'Headings',  icon: Type,     color: 'var(--cyan)' },
  content:   { label: 'Content',   icon: FileText,  color: '#ffb347' },
  technical: { label: 'Technical', icon: Code,      color: '#10d98a' },
  links:     { label: 'Links',     icon: Link2,     color: '#ff4444' },
};

const IMPACT_ORDER: Record<ImpactLevel, number> = { high: 0, medium: 1, low: 2 };

const IMPACT_BADGE: Record<ImpactLevel, string> = {
  high:   'badge-critical',
  medium: 'badge-warning',
  low:    'badge-info',
};

const CATEGORIES: (AuditCategory | 'all')[] = ['all', 'meta', 'headings', 'content', 'technical', 'links'];
const STATUSES: (AuditStatus | 'all')[] = ['all', 'error', 'warn', 'ok'];

export function OnSiteSeoAudit() {
  const [auditItems] = usePersistentState<SeoAuditItem[]>('seo.auditItems', []);
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | 'all'>('all');
  const [statusFilter, setStatusFilter]     = useState<AuditStatus | 'all'>('all');
  const [auditing, setAuditing]             = useState(false);
  const [lastRun, setLastRun]               = useState<string | null>(null);

  const errorCount = auditItems.filter(i => i.status === 'error').length;
  const warnCount  = auditItems.filter(i => i.status === 'warn').length;
  const okCount    = auditItems.filter(i => i.status === 'ok').length;
  const healthPct  = auditItems.length > 0 ? Math.round((okCount / auditItems.length) * 100) : 0;

  const filtered = auditItems
    .filter(i => categoryFilter === 'all' || i.category === categoryFilter)
    .filter(i => statusFilter === 'all' || i.status === statusFilter)
    .sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]);

  const handleRunAudit = () => {
    setAuditing(true);
    setTimeout(() => {
      setAuditing(false);
      setLastRun(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    }, 2000);
  };

  return (
    <div className='glass-card p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div>
          <div className='section-label mb-1'>On-Site SEO Audit</div>
          <div className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>
            {auditItems.length} checks · {lastRun ? `Last run ${lastRun}` : 'Never run'}
          </div>
        </div>
        {/* Primary cyan button with spinner */}
        <button
          onClick={handleRunAudit}
          disabled={auditing}
          className='flex items-center gap-2 px-4 py-2 rounded-xl text-base font-semibold transition-all'
          style={{
            background: auditing ? 'rgba(0,217,255,0.08)' : '#00d9ff',
            color: auditing ? 'var(--cyan)' : '#080b18',
            border: auditing ? '1px solid rgba(0,217,255,0.3)' : 'none',
            opacity: auditing ? 0.75 : 1,
            cursor: auditing ? 'default' : 'pointer',
          }}
        >
          <RefreshCw size={12} className={auditing ? 'animate-spin' : ''} />
          {auditing ? 'Running…' : 'Run New Audit'}
        </button>
      </div>

      {/* Summary bar — 3 large stat numbers */}
      <div
        className='flex items-center mb-5 rounded-xl overflow-hidden'
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        {[
          { label: 'Errors',   count: errorCount, color: '#ff4444' },
          { label: 'Warnings', count: warnCount,  color: '#ffb347' },
          { label: 'Passed',   count: okCount,    color: '#10d98a' },
        ].map((item, idx) => (
          <div
            key={item.label}
            className='flex-1 flex flex-col items-center py-4'
            style={{
              borderRight: idx < 2 ? '1px solid var(--border-subtle)' : undefined,
              position: 'relative',
            }}
          >
            <div
              className='font-bold text-3xl leading-none mb-1.5'
              style={{ fontFamily: 'DM Mono', color: item.color }}
            >
              {item.count}
            </div>
            <div className='section-label'>{item.label}</div>
          </div>
        ))}

        {/* Health bar section */}
        <div className='flex-1 px-5 py-4' style={{ borderLeft: '1px solid var(--border-subtle)' }}>
          <div className='flex items-center justify-between mb-2'>
            <span className='section-label'>Health Score</span>
            <span className='text-base font-bold font-mono' style={{ color: healthPct >= 70 ? '#10d98a' : '#ffb347' }}>
              {healthPct}%
            </span>
          </div>
          <div className='h-2.5 rounded-full overflow-hidden' style={{ background: 'var(--bg-overlay)' }}>
            <div
              className='h-full rounded-full'
              style={{
                width: `${healthPct}%`,
                background: 'linear-gradient(90deg, #10d98a, #00d9ff)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex items-center gap-3 mb-4 flex-wrap'>
        {/* Category pills */}
        <div className='flex gap-1.5 flex-wrap flex-1'>
          {CATEGORIES.map(cat => {
            const cfg    = cat !== 'all' ? CATEGORY_CONFIG[cat] : null;
            const active = categoryFilter === cat;
            const CatIcon = cfg?.icon;
            const color  = cfg?.color ?? '#7b93ff';
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[16px] font-mono transition-all'
                style={{
                  background: active ? color + '18' : 'var(--bg-elevated)',
                  color: active ? color : 'var(--text-secondary)',
                  border: `1px solid ${active ? color + '40' : 'var(--border-subtle)'}`,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {CatIcon && <CatIcon size={10} />}
                {cat === 'all' ? 'All' : cfg?.label}
              </button>
            );
          })}
        </div>

        {/* Status filter */}
        <div
          className='flex items-center gap-0.5 p-0.5'
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}
        >
          {STATUSES.map(s => {
            const cfg    = s !== 'all' ? STATUS_CONFIG[s] : null;
            const active = statusFilter === s;
            const color  = cfg?.color ?? '#7b93ff';
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className='px-2.5 py-1 text-[16px] font-mono transition-all'
                style={{
                  borderRadius: 6,
                  background: active ? color + '20' : 'transparent',
                  color: active ? color : 'var(--text-secondary)',
                  border: active ? `1px solid ${color}40` : '1px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {s === 'all' ? 'All' : s === 'warn' ? 'Warn' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit list */}
      <div className='space-y-2'>
        {filtered.length === 0 && (
          <div className='text-center py-10' style={{ color: 'var(--text-muted)' }}>
            {auditItems.length === 0
              ? 'No audit has been run yet — click Run New Audit to scan your stores.'
              : 'No audit items match the selected filters.'}
          </div>
        )}
        {filtered.map(item => {
          const stCfg  = STATUS_CONFIG[item.status];
          const catCfg = CATEGORY_CONFIG[item.category];
          const StatusIcon = stCfg.icon;
          const CatIcon    = catCfg.icon;
          return (
            <div
              key={item.id}
              className='rounded-xl p-3 flex items-start gap-3 transition-colors hover:bg-white/[0.02]'
              style={{
                background: 'var(--bg-elevated)',
                borderLeft: `3px solid ${stCfg.color}`,
                border: `1px solid var(--border-subtle)`,
                borderLeftWidth: 3,
                borderLeftColor: stCfg.color,
              }}
            >
              {/* Status icon in circle */}
              <div
                className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5'
                style={{ background: stCfg.color + '18' }}
              >
                <StatusIcon size={13} style={{ color: stCfg.color }} />
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap mb-1'>
                  <span className='text-base font-medium' style={{ color: 'var(--text-primary)' }}>
                    {item.issue}
                  </span>
                  <span className={`${IMPACT_BADGE[item.impact]} text-[16px] px-1.5 py-0.5 rounded-full font-mono`}>
                    {item.impact.toUpperCase()}
                  </span>
                </div>
                <div className='text-[16px] font-mono mb-1' style={{ color: '#7b93ff' }}>
                  {item.page}
                </div>
                <div className='text-[16px] leading-relaxed' style={{ color: 'var(--text-secondary)' }}>
                  {item.detail}
                </div>
              </div>

              {/* Category badge */}
              <div className='shrink-0'>
                <span
                  className='flex items-center gap-1 text-[16px] px-2 py-1 rounded-lg font-mono whitespace-nowrap'
                  style={{ background: catCfg.color + '15', color: catCfg.color }}
                >
                  <CatIcon size={9} />
                  {catCfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
