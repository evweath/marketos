'use client';

import { useState } from 'react';
import { scaledAttributionConversions, DATE_RANGE_LABELS, emptyAttribution } from '@/lib/analyticsData';
import { usePersistentState } from '@/lib/usePersistentState';
import type { DateRange, ChannelMetrics, AttributionTouchpoint } from '@/lib/analyticsData';

type Model = 'firstTouch' | 'lastTouch' | 'linearTouch' | 'positionBased';

const MODEL_LABELS: Record<Model, string> = {
  firstTouch:    'First Touch',
  lastTouch:     'Last Touch',
  linearTouch:   'Linear',
  positionBased: 'Position',
};

const MODEL_DESC: Record<Model, string> = {
  firstTouch:    '100% credit to first channel in conversion path',
  lastTouch:     '100% credit to final channel before conversion',
  linearTouch:   'Equal credit distributed across all touchpoints',
  positionBased: '40% first, 40% last, 20% split across middle',
};

const MODELS: Model[] = ['firstTouch', 'lastTouch', 'linearTouch', 'positionBased'];

export default function AttributionPanel({ dateRange = '30d', channelMetrics }: { dateRange?: DateRange; channelMetrics: ChannelMetrics[] }) {
  const [model, setModel] = useState<Model>('linearTouch');
  const [attribution] = usePersistentState<AttributionTouchpoint[]>('analytics.attribution', emptyAttribution());
  const conversions = scaledAttributionConversions(dateRange, channelMetrics);
  const data = [...attribution].sort((a, b) => b[model] - a[model]);

  return (
    <div className="glass-card p-4">
      <div className="mb-3">
        <div className="section-label mb-1">Attribution Model</div>
        <div className="text-base" style={{ color: 'var(--text-secondary)' }}>{MODEL_DESC[model]}</div>
      </div>

      {/* Segmented model selector — 2×2 grid pill container */}
      <div
        className="grid grid-cols-2 gap-0.5 mb-4 p-0.5 rounded-xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        {MODELS.map(m => (
          <button
            key={m}
            onClick={() => setModel(m)}
            className="px-2 py-1.5 rounded-[10px] text-[16px] text-center transition-all font-mono"
            style={{
              background: model === m ? 'var(--bg-overlay)' : 'transparent',
              color: model === m ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: model === m ? 500 : 400,
              border: model === m ? '1px solid var(--border-dim)' : '1px solid transparent',
              boxShadow: model === m ? '0 1px 3px rgba(0,0,0,0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {MODEL_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Attribution bars */}
      <div className="space-y-3">
        {data.map((row, i) => (
          <div key={row.channel}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {/* Rank */}
                <span
                  className="text-[16px] font-mono w-4 text-right shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {i + 1}
                </span>
                {/* Color dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: row.color, boxShadow: `0 0 5px ${row.color}60` }}
                />
                {/* Label */}
                <span className="text-base" style={{ color: 'var(--text-secondary)' }}>
                  {row.label}
                </span>
              </div>
              {/* Percentage */}
              <span
                className="data-value text-base font-semibold"
                style={{ color: row.color }}
              >
                {row[model].toFixed(1)}%
              </span>
            </div>

            {/* Bar track — 20px height, rounded ends */}
            <div
              className="w-full rounded overflow-hidden"
              style={{ height: 20, background: 'var(--bg-elevated)', borderRadius: 4 }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${row[model]}%`,
                  background: `linear-gradient(90deg, ${row.color}CC 0%, ${row.color}88 100%)`,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-3 pt-3 border-t text-[16px] font-mono"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        Based on {conversions.toLocaleString()} conversions · {DATE_RANGE_LABELS[dateRange].toLowerCase()}
      </div>
    </div>
  );
}
