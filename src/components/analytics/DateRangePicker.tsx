'use client';

import { DATE_RANGE_LABELS } from '@/lib/analyticsData';
import type { DateRange } from '@/lib/analyticsData';

interface Props {
  value: DateRange;
  onChange: (v: DateRange) => void;
}

export default function DateRangePicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
      {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map(r => (
        <button key={r}
          onClick={() => onChange(r)}
          className="px-3 py-1.5 rounded text-xs transition-all"
          style={{
            background: value === r ? 'var(--bg-overlay)' : 'transparent',
            color: value === r ? 'var(--text-primary)' : 'var(--text-muted)',
            fontFamily: value === r ? 'DM Mono' : 'DM Sans',
            border: value === r ? '1px solid var(--border-dim)' : '1px solid transparent',
          }}>
          {r.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
