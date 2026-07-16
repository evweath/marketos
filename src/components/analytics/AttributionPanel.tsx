'use client';

import { useState } from 'react';
import { scaledAttributionConversions, DATE_RANGE_LABELS } from '@/lib/analyticsData';
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

function MiniDonut({ rows, model, size = 56 }: { rows: AttributionTouchpoint[]; model: Model; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const total = rows.reduce((s, x) => s + x[model], 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-overlay)" strokeWidth={5} />
      {rows.map(row => {
        const frac = row[model] / total;
        const dash = frac * circ;
        const seg = (
          <circle key={row.channel} cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={row.color} strokeWidth={5}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset} />
        );
        offset += dash;
        return seg;
      })}
    </svg>
  );
}

export default function AttributionPanel({ dateRange = '30d', channelMetrics, attribution }: { dateRange?: DateRange; channelMetrics: ChannelMetrics[]; attribution: AttributionTouchpoint[] }) {
  const [model, setModel] = useState<Model>('linearTouch');
  const conversions = scaledAttributionConversions(dateRange, channelMetrics);
  const data = [...attribution].sort((a, b) => b[model] - a[model]);

  return (
    <div className="glass-card p-4">
      <div className="mb-3">
        <div className="section-label mb-1">Attribution Model</div>
        <div className="text-base" style={{ color: 'var(--text-secondary)' }}>{MODEL_DESC[model]}</div>
      </div>

      {/* 4 model cards with mini donut charts — click to select */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {MODELS.map(m => {
          const top = [...attribution].sort((a, b) => b[m] - a[m])[0];
          const active = model === m;
          return (
            <button key={m} onClick={() => setModel(m)}
              className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all"
              style={{ background: active ? 'var(--bg-overlay)' : 'var(--bg-elevated)', border: `1px solid ${active ? 'var(--border-bright)' : 'var(--border-subtle)'}` }}>
              <MiniDonut rows={attribution} model={m} />
              <span className="text-[16px] font-mono" style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 600 : 400 }}>{MODEL_LABELS[m]}</span>
              {top && <span className="text-[16px]" style={{ color: top.color }}>{top.label.split(' ')[0]} {top[m].toFixed(0)}%</span>}
            </button>
          );
        })}
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
