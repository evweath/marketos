'use client';

import type { SeoSnapshot } from '@/types';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  snapshot: SeoSnapshot;
}

const STATUS_CONFIG = {
  ok:      { Icon: CheckCircle,   color: '#10d98a', label: 'OK'    },
  warning: { Icon: AlertTriangle, color: '#ffb347', label: 'WARN'  },
  error:   { Icon: XCircle,       color: '#ff4444', label: 'ERROR' },
};

export default function SeoSnapshot({ snapshot }: Props) {
  const errors   = snapshot.metrics.filter(m => m.status === 'error').length;
  const warnings = snapshot.metrics.filter(m => m.status === 'warning').length;
  const ok       = snapshot.metrics.filter(m => m.status === 'ok').length;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="section-label">SEO Health</div>
        <div className="flex items-center gap-2 text-[16px] font-mono">
          {errors > 0   && <span style={{ color: '#ff4444' }}>{errors} error{errors !== 1 ? 's' : ''}</span>}
          {warnings > 0 && <span style={{ color: '#ffb347' }}>{warnings} warn</span>}
          <span style={{ color: '#10d98a' }}>{ok} ok</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {snapshot.metrics.map(metric => {
          const sc = STATUS_CONFIG[metric.status];
          const Icon = sc.Icon;
          return (
            <div key={metric.label} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
              style={{ background: 'var(--bg-elevated)' }}>
              <Icon size={13} style={{ color: sc.color }} className="shrink-0" />
              <span className="text-base flex-1" style={{ color: 'var(--text-secondary)' }}>{metric.label}</span>
              <span className="text-base text-right" style={{ color: 'var(--text-primary)', fontFamily: 'DM Mono', maxWidth: 160 }}>
                {metric.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
