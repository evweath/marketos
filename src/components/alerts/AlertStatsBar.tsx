'use client';

import { computeAlertStats } from '@/lib/alertData';
import type { AlertRule, FiredAlert } from '@/lib/alertData';
import { usePersistentState } from '@/lib/usePersistentState';
import {
  AlertCircle, AlertTriangle, CheckCircle, BellOff, Bell, Shield,
} from 'lucide-react';

export default function AlertStatsBar() {
  const [rules]  = usePersistentState<AlertRule[]>('alerts.rules', []);
  const [alerts] = usePersistentState<FiredAlert[]>('alerts.list', []);
  const s = computeAlertStats(rules, alerts);

  const cards = [
    {
      label: 'Critical Active',
      value: s.criticalActive,
      Icon: AlertCircle,
      color: '#ff4444',
      bg: 'rgba(255,68,68,0.08)',
      border: 'rgba(255,68,68,0.22)',
      pulse: s.criticalActive > 0,
      glow: s.criticalActive > 0,
      trend: null as string | null,
    },
    {
      label: 'Warnings Active',
      value: s.warningActive,
      Icon: AlertTriangle,
      color: '#ffb347',
      bg: 'rgba(255,179,71,0.08)',
      border: 'rgba(255,179,71,0.2)',
      pulse: false,
      glow: false,
      trend: null as string | null,
    },
    {
      label: 'Acknowledged',
      value: s.totalAcknowledged,
      Icon: Bell,
      color: '#7b93ff',
      bg: 'rgba(123,147,255,0.06)',
      border: 'rgba(123,147,255,0.15)',
      pulse: false,
      glow: false,
      trend: null as string | null,
    },
    {
      label: 'Resolved (30d)',
      value: s.totalResolved,
      Icon: CheckCircle,
      color: '#10d98a',
      bg: 'rgba(16,217,138,0.06)',
      border: 'rgba(16,217,138,0.15)',
      pulse: false,
      glow: false,
      trend: '↑ this week' as string | null,
    },
    {
      label: 'Snoozed',
      value: s.totalSnoozed,
      Icon: BellOff,
      color: 'var(--text-muted)',
      bg: 'var(--bg-elevated)',
      border: 'var(--border-subtle)',
      pulse: false,
      glow: false,
      trend: null as string | null,
    },
    {
      label: 'Fires This Month',
      value: s.total30d,
      Icon: Bell,
      color: 'var(--cyan)',
      bg: 'rgba(0,217,255,0.06)',
      border: 'rgba(0,217,255,0.15)',
      pulse: false,
      glow: false,
      trend: '30-day total' as string | null,
    },
    {
      label: 'Rules Active',
      value: `${s.rulesEnabled}/${s.rulesTotal}`,
      Icon: Shield,
      color: '#10d98a',
      bg: 'rgba(16,217,138,0.06)',
      border: 'rgba(16,217,138,0.15)',
      pulse: false,
      glow: false,
      trend: null as string | null,
    },
  ];

  return (
    <div className="grid grid-cols-7 gap-2 mb-4">
      {cards.map(card => {
        const Icon = card.Icon;
        return (
          <div key={card.label} className="px-3 py-3 rounded-xl relative overflow-hidden"
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              boxShadow: card.glow ? `0 0 16px ${card.color}22` : 'none',
            }}>
            {/* Pulse indicator for critical active */}
            {card.pulse && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full live-dot-red"
                style={{ background: '#ff4444' }} />
            )}

            {/* Icon + label row */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 rounded flex items-center justify-center"
                style={{ background: card.color === 'var(--text-muted)' ? 'var(--bg-overlay)' : card.color + '20' }}>
                <Icon size={10} style={{ color: card.color }} />
              </div>
              <span className="section-label leading-tight" style={{ fontSize: 16 }}>{card.label}</span>
            </div>

            {/* Value */}
            <div className="data-value text-xl font-bold leading-none"
              style={{
                color: card.color,
                textShadow: card.glow ? `0 0 12px ${card.color}60` : 'none',
              }}>
              {card.value}
            </div>

            {/* Trend indicator */}
            {card.trend && (
              <div className="mt-1 text-[16px] font-mono" style={{ color: card.color, opacity: 0.7 }}>
                {card.trend}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
