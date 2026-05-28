'use client';

import { ExternalLink, Shield, Zap, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { Store, ConversionMetrics, TrafficMetrics } from '@/types';
import { formatCurrency } from '@/lib/mockData';

interface Props {
  store: Store;
  traffic: TrafficMetrics;
  conversions: ConversionMetrics;
  isSelected: boolean;
  onSelect: () => void;
}

const STATUS_CONFIG = {
  online:   { label: 'ONLINE',   dotClass: 'live-dot',       color: '#10d98a', bg: 'rgba(16,217,138,0.08)',  border: 'rgba(16,217,138,0.2)'  },
  degraded: { label: 'DEGRADED', dotClass: 'live-dot-amber', color: '#ffb347', bg: 'rgba(255,179,71,0.08)',  border: 'rgba(255,179,71,0.2)'  },
  down:     { label: 'DOWN',     dotClass: 'live-dot-red',   color: '#ff4444', bg: 'rgba(255,68,68,0.08)',   border: 'rgba(255,68,68,0.2)'   },
};

interface MetricCellProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  valueColor: string;
}

function MetricCell({ icon, iconColor, label, value, valueColor }: MetricCellProps) {
  return (
    <div className='rounded-lg p-2.5' style={{ background: 'var(--bg-elevated)' }}>
      <div className='flex items-center gap-1.5 mb-1.5'>
        <div className='w-4 h-4 rounded-full flex items-center justify-center shrink-0'
          style={{ background: iconColor + '22' }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <span className='section-label'>{label}</span>
      </div>
      <span className='font-mono text-base font-semibold leading-none' style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

export default function StoreStatusCard({ store, traffic, conversions, isSelected, onSelect }: Props) {
  const sc = STATUS_CONFIG[store.status];
  const sslWarning = store.sslDaysLeft <= 30;
  const sslCritical = store.sslDaysLeft <= 14;
  const speedWarning = store.loadSpeed > 2500;

  const responseColor = store.responseTime > 800 ? '#ffb347' : '#10d98a';
  const uptimeColor = store.uptime7d >= 99.9 ? '#10d98a' : store.uptime7d >= 99 ? '#ffb347' : '#ff4444';
  const sslColor = sslCritical ? '#ff4444' : sslWarning ? '#ffb347' : '#10d98a';
  const loadColor = speedWarning ? '#ffb347' : 'var(--text-primary)';

  return (
    <button
      onClick={onSelect}
      className='w-full text-left glass-card p-4 relative overflow-hidden'
      style={{
        transition: 'all 0.2s ease',
        borderColor: isSelected ? store.color + '50' : 'var(--border-subtle)',
        boxShadow: isSelected
          ? `0 0 0 1px ${store.color}30, 0 4px 24px ${store.color}12`
          : undefined,
      }}>

      {/* Accent line top */}
      <div className='absolute top-0 left-0 right-0 rounded-t-xl'
        style={{
          height: '2px',
          background: isSelected ? store.color : 'transparent',
          boxShadow: isSelected ? `0 0 8px ${store.color}30` : 'none',
          transition: 'all 0.2s ease',
        }} />

      {/* Header row */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-2.5'>
          <div className={`w-2 h-2 rounded-full ${sc.dotClass} shrink-0`} style={{ background: sc.color }} />
          <div>
            <div className='font-semibold text-sm' style={{ color: 'var(--text-primary)' }}>{store.name}</div>
            <a
              href={`https://${store.domain}`}
              target='_blank'
              rel='noopener noreferrer'
              onClick={e => e.stopPropagation()}
              className='text-[11px] mt-0.5 flex items-center gap-1 hover:underline'
              style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
              {store.domain}
              <ExternalLink size={9} />
            </a>
          </div>
        </div>
        <div className='flex items-center gap-1.5 px-2 py-0.5 rounded'
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          <span className='text-[10px] font-mono font-bold tracking-wide'>{sc.label}</span>
        </div>
      </div>

      {/* Metric grid */}
      <div className='grid grid-cols-2 gap-2 mb-3'>
        <MetricCell
          icon={<Zap size={9} />}
          iconColor='#00d9ff'
          label='Response'
          value={`${store.responseTime}ms`}
          valueColor={responseColor}
        />
        <MetricCell
          icon={<Activity size={9} />}
          iconColor='#10d98a'
          label='7d Uptime'
          value={`${store.uptime7d.toFixed(2)}%`}
          valueColor={uptimeColor}
        />
        <MetricCell
          icon={<Shield size={9} />}
          iconColor={sslColor}
          label='SSL'
          value={`${store.sslDaysLeft}d`}
          valueColor={sslColor}
        />
        <MetricCell
          icon={<Clock size={9} />}
          iconColor='#7b93ff'
          label='Load'
          value={`${(store.loadSpeed / 1000).toFixed(1)}s`}
          valueColor={loadColor}
        />
      </div>

      {/* Revenue + sessions row */}
      <div className='flex items-center gap-0 pt-2.5 border-t' style={{ borderColor: 'var(--border-subtle)' }}>
        <div className='flex-1'>
          <div className='section-label mb-0.5'>Today Revenue</div>
          <div className='font-mono text-sm font-bold' style={{ color: store.color }}>
            {formatCurrency(conversions.revenueToday)}
          </div>
        </div>
        <div className='w-px self-stretch mx-3' style={{ background: 'var(--border-subtle)' }} />
        <div className='flex-1 text-right'>
          <div className='section-label mb-0.5'>Sessions</div>
          <div className='flex items-center gap-1 justify-end'>
            <span className='font-mono text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>
              {traffic.sessionsToday.toLocaleString()}
            </span>
            <span className='text-[10px] font-mono flex items-center gap-0.5'
              style={{ color: traffic.sessionsDelta >= 0 ? '#10d98a' : '#ff4444' }}>
              {traffic.sessionsDelta >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {Math.abs(traffic.sessionsDelta)}%
            </span>
          </div>
        </div>
      </div>

      {/* SSL expiry warning strip */}
      {sslWarning && (
        <div className='mt-3 px-2.5 py-1.5 rounded text-[11px] flex items-center gap-1.5'
          style={{
            background: sslCritical ? 'rgba(255,68,68,0.1)' : 'rgba(255,179,71,0.1)',
            color: sslCritical ? '#ff4444' : '#ffb347',
            border: `1px solid ${sslCritical ? 'rgba(255,68,68,0.2)' : 'rgba(255,179,71,0.2)'}`,
          }}>
          <Shield size={11} />
          SSL expires in {store.sslDaysLeft} days — {sslCritical ? 'URGENT: Renew now' : 'Renew soon'}
        </div>
      )}
    </button>
  );
}
