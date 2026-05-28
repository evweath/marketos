'use client';

import type { ConversionMetrics } from '@/types';
import { formatCurrency } from '@/lib/mockData';
import { ShoppingCart, TrendingUp } from 'lucide-react';

interface Props {
  conversions: ConversionMetrics;
  storeColor: string;
}

export default function ConversionFunnel({ conversions, storeColor }: Props) {
  const maxCount = conversions.funnel[0].count;

  const overallColor = conversions.overallRate >= 3
    ? '#10d98a'
    : conversions.overallRate >= 1.5
    ? '#ffb347'
    : '#ff4444';

  return (
    <div className='glass-card p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div>
          <div className='section-label mb-1.5'>Conversion Funnel — Today</div>
          <div className='flex items-baseline gap-2'>
            <span className='font-mono text-2xl font-bold' style={{ color: overallColor }}>
              {conversions.overallRate.toFixed(1)}%
            </span>
            <span className='text-xs' style={{ color: 'var(--text-muted)' }}>overall conversion</span>
          </div>
        </div>
        <div className='text-right'>
          <div className='section-label mb-0.5'>AOV</div>
          <span className='font-mono text-sm font-bold' style={{ color: storeColor }}>
            {formatCurrency(conversions.avgOrderValue)}
          </span>
        </div>
      </div>

      {/* Funnel steps */}
      <div className='space-y-3 mb-4'>
        {conversions.funnel.map((step, idx) => {
          const barPct = (step.count / maxCount) * 100;
          const isFirst = idx === 0;
          const isLast = idx === conversions.funnel.length - 1;
          const dropColor = step.conversionRate >= 60 ? '#10d98a' : step.conversionRate >= 40 ? '#ffb347' : '#ff4444';

          return (
            <div key={step.label}>
              {/* Labels row */}
              <div className='flex items-center justify-between mb-1'>
                <span className='text-xs font-mono'
                  style={{ color: isFirst ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {step.label}
                </span>
                <div className='flex items-center gap-3'>
                  {idx > 0 && (
                    <span className='text-[10px] font-mono' style={{ color: dropColor }}>
                      ↓ {step.conversionRate.toFixed(1)}%
                    </span>
                  )}
                  <span className='text-[11px] font-mono font-medium' style={{ color: 'var(--text-muted)' }}>
                    {step.count.toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Bar */}
              <div className='h-5 rounded overflow-hidden' style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className='h-full rounded transition-all duration-700 ease-out'
                  style={{
                    width: `${barPct}%`,
                    background: isLast
                      ? `linear-gradient(90deg, ${storeColor}, ${storeColor}99)`
                      : `linear-gradient(90deg, ${storeColor}ff, ${storeColor}99)`,
                    minWidth: 20,
                    opacity: isFirst ? 1 : 0.55 + (idx * 0.1),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className='grid grid-cols-2 gap-2 pt-3 border-t' style={{ borderColor: 'var(--border-subtle)' }}>
        <div className='rounded-lg p-2.5' style={{ background: 'var(--bg-elevated)' }}>
          <div className='flex items-center gap-1 mb-1'>
            <TrendingUp size={10} style={{ color: 'var(--text-muted)' }} />
            <span className='section-label'>Revenue Today</span>
          </div>
          <div className='font-mono text-sm font-bold' style={{ color: storeColor }}>
            {formatCurrency(conversions.revenueToday)}
          </div>
        </div>
        <div className='rounded-lg p-2.5' style={{ background: 'var(--bg-elevated)' }}>
          <div className='flex items-center gap-1 mb-1'>
            <ShoppingCart size={10} style={{ color: 'var(--text-muted)' }} />
            <span className='section-label'>Orders Today</span>
          </div>
          <div className='font-mono text-sm font-bold' style={{ color: 'var(--text-primary)' }}>
            {conversions.ordersToday}
          </div>
        </div>
      </div>
    </div>
  );
}
