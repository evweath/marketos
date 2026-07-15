'use client';

import type { PageChange, ChangeType } from '@/types';
import { formatMinutesAgo } from '@/lib/mockData';
import { DollarSign, Plus, Minus, FileText, Search, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  changes: PageChange[];
}

interface ChangeTypeConfig {
  icon: LucideIcon;
  label: string;
  color: string;
}

const CHANGE_TYPE_CONFIG: Record<ChangeType, ChangeTypeConfig> = {
  'price':           { icon: DollarSign,    label: 'Price Change',    color: '#ffb347' },
  'product-added':   { icon: Plus,          label: 'Product Added',   color: '#10d98a' },
  'product-removed': { icon: Minus,         label: 'Product Removed', color: '#ff4444' },
  'out-of-stock':    { icon: AlertTriangle, label: 'Out of Stock',    color: '#ff4444' },
  'content':         { icon: FileText,      label: 'Content Change',  color: '#7b93ff' },
  'seo':             { icon: Search,        label: 'SEO Change',      color: 'var(--cyan)' },
};

const SEVERITY_BADGE_CLASS = {
  critical: 'badge-critical',
  warning:  'badge-warning',
  info:     'badge-info',
} as const;

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return formatMinutesAgo(mins);
}

export default function PageChangeLog({ changes }: Props) {
  const criticalCount = changes.filter(c => c.severity === 'critical').length;
  const warningCount  = changes.filter(c => c.severity === 'warning').length;
  const infoCount     = changes.filter(c => c.severity === 'info').length;

  return (
    <div className='glass-card p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div>
          <div className='section-label mb-1'>Page Change Log</div>
          <div className='text-base' style={{ color: 'var(--text-secondary)' }}>
            {changes.length} change{changes.length !== 1 ? 's' : ''} detected — all 3 stores
          </div>
        </div>
        <div className='flex items-center gap-1.5'>
          {criticalCount > 0 && (
            <span className={`text-[16px] font-mono px-2 py-0.5 rounded ${SEVERITY_BADGE_CLASS.critical}`}>
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className={`text-[16px] font-mono px-2 py-0.5 rounded ${SEVERITY_BADGE_CLASS.warning}`}>
              {warningCount} warning
            </span>
          )}
          {infoCount > 0 && (
            <span className={`text-[16px] font-mono px-2 py-0.5 rounded ${SEVERITY_BADGE_CLASS.info}`}>
              {infoCount} info
            </span>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        {changes.map(change => {
          const tc = CHANGE_TYPE_CONFIG[change.changeType];
          const Icon = tc.icon;
          const bg = change.severity === 'critical'
            ? 'rgba(255,68,68,0.05)'
            : change.severity === 'warning'
            ? 'rgba(255,179,71,0.05)'
            : 'var(--bg-elevated)';
          const borderColor = change.severity === 'critical'
            ? 'rgba(255,68,68,0.18)'
            : change.severity === 'warning'
            ? 'rgba(255,179,71,0.18)'
            : 'var(--border-subtle)';

          return (
            <div key={change.id} className='flex gap-3 p-3 rounded-lg'
              style={{ background: bg, border: `1px solid ${borderColor}` }}>

              {/* Icon circle */}
              <div className='w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5'
                style={{ background: tc.color + '20', border: `1px solid ${tc.color}30` }}>
                <Icon size={13} style={{ color: tc.color }} />
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    {/* Title + type badge */}
                    <div className='flex items-center gap-2 mb-0.5 flex-wrap'>
                      <span className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>
                        {change.pageTitle}
                      </span>
                      <span className={`text-[16px] font-mono px-1.5 py-0.5 rounded ${SEVERITY_BADGE_CLASS[change.severity]}`}>
                        {tc.label}
                      </span>
                    </div>
                    {/* Description */}
                    <div className='text-[16px] mb-1' style={{ color: 'var(--text-secondary)' }}>
                      {change.description}
                    </div>
                    {/* URL in code style */}
                    <div className='font-mono text-[16px] truncate'
                      style={{ color: 'var(--cyan)', opacity: 0.75 }}>
                      {change.url}
                    </div>
                  </div>
                  {/* Timestamp */}
                  <div className='font-mono text-[16px] shrink-0 tabular-nums'
                    style={{ color: 'var(--text-muted)', textAlign: 'right', marginTop: 1 }}
                    suppressHydrationWarning>
                    {timeAgo(change.detectedAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
