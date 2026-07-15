'use client';

import { useState } from 'react';
import type { Alert } from '@/types';
import { formatMinutesAgo, useMonitoringStores } from '@/lib/mockData';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  alerts: Alert[];
}

type Severity = 'critical' | 'warning' | 'info';

const SEVERITY_CONFIG: Record<Severity, {
  Icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  leftBorder: string;
  label: string;
  dotClass: string;
}> = {
  critical: {
    Icon: AlertCircle,
    color: '#ff4444',
    bg: 'rgba(255,68,68,0.06)',
    border: 'rgba(255,68,68,0.18)',
    leftBorder: '#ff4444',
    label: 'CRITICAL',
    dotClass: 'live-dot-red',
  },
  warning: {
    Icon: AlertTriangle,
    color: '#ffb347',
    bg: 'rgba(255,179,71,0.06)',
    border: 'rgba(255,179,71,0.18)',
    leftBorder: '#ffb347',
    label: 'WARNING',
    dotClass: 'live-dot-amber',
  },
  info: {
    Icon: Info,
    color: '#7b93ff',
    bg: 'rgba(123,147,255,0.06)',
    border: 'rgba(123,147,255,0.18)',
    leftBorder: '#7b93ff',
    label: 'INFO',
    dotClass: '',
  },
};

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return formatMinutesAgo(mins);
}

export default function AlertBanner({ alerts }: Props) {
  const stores = useMonitoringStores();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const active = alerts.filter(a => !a.acknowledged && !dismissed.has(a.id));

  if (active.length === 0) return null;

  const sorted = [...active].sort((a, b) => {
    const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const dismiss = (id: string) =>
    setDismissed(prev => { const s = new Set(prev); s.add(id); return s; });

  return (
    <div className='space-y-2 mb-4'>
      {sorted.map(alert => {
        const sc = SEVERITY_CONFIG[alert.severity];
        const Icon = sc.Icon;
        const store = alert.storeId ? stores.find(s => s.id === alert.storeId) : null;

        return (
          <div key={alert.id}
            className='flex items-start gap-3 px-4 py-3 rounded-xl animate-slide-in'
            style={{
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              borderLeft: `3px solid ${sc.leftBorder}`,
            }}>

            {/* Icon + pulse dot */}
            <div className='flex items-center gap-2 shrink-0 mt-0.5'>
              {sc.dotClass
                ? <div className={`w-1.5 h-1.5 rounded-full ${sc.dotClass}`} style={{ background: sc.color }} />
                : <div className='w-1.5 h-1.5 rounded-full' style={{ background: sc.color }} />
              }
              <Icon size={14} style={{ color: sc.color }} />
            </div>

            {/* Body */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-0.5 flex-wrap'>
                <span className='text-[16px] font-mono font-bold px-1.5 py-0.5 rounded'
                  style={{ background: sc.color + '20', color: sc.color }}>
                  {sc.label}
                </span>
                {store && (
                  <span className='text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>
                    {store.domain}
                  </span>
                )}
                <span className='text-[16px] font-mono tabular-nums' style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                  {timeAgo(alert.createdAt)}
                </span>
              </div>
              <div className='text-base font-semibold' style={{ color: sc.color }}>{alert.title}</div>
              <div className='text-base mt-0.5' style={{ color: 'var(--text-secondary)' }}>{alert.message}</div>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => dismiss(alert.id)}
              className='shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-white/10'
              style={{ color: 'var(--text-muted)' }}
              aria-label='Dismiss alert'>
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
