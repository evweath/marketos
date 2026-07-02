'use client';

import { useState } from 'react';
import {
  AlertCircle, AlertTriangle, Info, CheckCircle, BellOff,
  Bell, Store, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { FIRED_ALERTS, CATEGORY_CONFIG } from '@/lib/alertData';
import type { FiredAlert, AlertSeverity, AlertStatus, AlertCategory } from '@/lib/alertData';
import { STORES } from '@/lib/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SEV_CONFIG: Record<AlertSeverity, {
  Icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  dotClass: string;
}> = {
  critical: { Icon: AlertCircle,   color: '#ff4444', bg: 'rgba(255,68,68,0.06)',    border: 'rgba(255,68,68,0.2)',    dotClass: 'live-dot-red'   },
  warning:  { Icon: AlertTriangle, color: '#ffb347', bg: 'rgba(255,179,71,0.06)',   border: 'rgba(255,179,71,0.2)',   dotClass: 'live-dot-amber' },
  info:     { Icon: Info,          color: '#7b93ff', bg: 'rgba(123,147,255,0.06)',  border: 'rgba(123,147,255,0.15)', dotClass: ''               },
};

const STATUS_CONFIG: Record<AlertStatus, {
  Icon: LucideIcon;
  color: string;
  label: string;
}> = {
  active:       { Icon: Bell,        color: '#ff4444', label: 'Active'       },
  acknowledged: { Icon: Bell,        color: '#7b93ff', label: 'Acknowledged' },
  resolved:     { Icon: CheckCircle, color: '#10d98a', label: 'Resolved'     },
  snoozed:      { Icon: BellOff,     color: '#474e82', label: 'Snoozed'      },
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function AlertDetail({ alert, onClose, onUpdateStatus }: {
  alert: FiredAlert;
  onClose: () => void;
  onUpdateStatus: (status: AlertStatus) => void;
}) {
  const sc = SEV_CONFIG[alert.severity];
  const stc = STATUS_CONFIG[alert.status];
  const cat = CATEGORY_CONFIG[alert.category];
  const store = alert.storeId ? STORES.find(s => s.id === alert.storeId) : null;

  const timeline = [
    { Icon: Bell,        label: 'Alert fired',                                             time: alert.firedAt,        color: sc.color    },
    ...(alert.acknowledgedAt ? [{ Icon: Bell, label: `Acknowledged by ${alert.acknowledgedBy}`, time: alert.acknowledgedAt, color: '#7b93ff' }] : []),
    ...(alert.resolvedAt     ? [{ Icon: CheckCircle, label: 'Resolved',                         time: alert.resolvedAt,     color: '#10d98a' }] : []),
  ];

  return (
    <div className="glass-card flex flex-col h-full animate-slide-in">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <sc.Icon size={14} style={{ color: sc.color, marginTop: 3, flexShrink: 0 }} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="badge-critical text-[9px]" style={
                alert.severity === 'warning' ? { background: 'rgba(255,179,71,0.12)', color: '#ffbe6a', borderColor: 'rgba(255,179,71,0.25)' }
                  : alert.severity === 'info' ? { background: 'rgba(123,147,255,0.12)', color: '#9cb1ff', borderColor: 'rgba(123,147,255,0.25)' }
                    : undefined
              }>
                {alert.severity.toUpperCase()}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: stc.color + '18', color: stc.color }}>
                {stc.label.toUpperCase()}
              </span>
              <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {cat.icon} {cat.label}
              </span>
            </div>
            <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {alert.title}
            </h3>
          </div>
        </div>
        <button onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06] ml-2 shrink-0"
          style={{ color: 'var(--text-muted)' }}>
          <X size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Detail text */}
        <div>
          <div className="section-label mb-1.5">Alert Detail</div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {alert.detail}
          </p>
        </div>

        {/* Metric snapshot — monospace chips */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3" style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
            <div className="section-label mb-1.5">Actual Value</div>
            <div className="font-mono text-sm font-bold" style={{ color: sc.color }}>
              {alert.actualValue}
            </div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="section-label mb-1.5">Threshold</div>
            <div className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
              {alert.thresholdValue}
            </div>
          </div>
        </div>

        {/* Timeline with connected dots */}
        <div>
          <div className="section-label mb-2">Timeline</div>
          <div className="relative pl-4">
            {/* Vertical connector */}
            {timeline.length > 1 && (
              <div className="absolute left-[9px] top-4 bottom-4 w-px"
                style={{ background: 'var(--border-dim)' }} />
            )}
            <div className="space-y-3">
              {timeline.map((ev, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 z-10"
                    style={{ background: ev.color + '22', border: `1.5px solid ${ev.color}50` }}>
                    <ev.Icon size={9} style={{ color: ev.color }} />
                  </div>
                  <div className="flex-1 pb-0.5">
                    <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{ev.label}</div>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {fmtDate(ev.time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery channels */}
        <div>
          <div className="section-label mb-1.5">Delivered To</div>
          <div className="flex flex-wrap gap-1.5">
            {alert.deliveredTo.map(ch => (
              <span key={ch} className="badge-ok">✓ {ch}</span>
            ))}
          </div>
        </div>

        {/* Action taken */}
        {alert.actionTaken && (
          <div className="rounded-xl p-3" style={{ background: 'rgba(16,217,138,0.06)', border: '1px solid rgba(16,217,138,0.18)' }}>
            <div className="section-label mb-1" style={{ color: '#10d98a' }}>Action Taken</div>
            <p className="text-xs" style={{ color: '#10d98a' }}>{alert.actionTaken}</p>
          </div>
        )}

        {/* Store */}
        {store && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Store size={11} />
            {store.name} ({store.domain})
          </div>
        )}
      </div>

      {/* Action buttons */}
      {alert.status === 'active' && (
        <div className="flex gap-2 p-4 border-t shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={() => onUpdateStatus('acknowledged')}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
            style={{ background: 'rgba(123,147,255,0.12)', color: '#7b93ff', border: '1px solid rgba(123,147,255,0.25)' }}>
            Acknowledge
          </button>
          <button onClick={() => onUpdateStatus('snoozed')}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
            style={{ background: 'rgba(255,179,71,0.10)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.22)' }}>
            Snooze 1h
          </button>
          <button onClick={() => onUpdateStatus('resolved')}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
            style={{ background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.22)' }}>
            Resolve
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Feed Row ─────────────────────────────────────────────────────────────────

function AlertRow({ alert, selected, onClick }: { alert: FiredAlert; selected: boolean; onClick: () => void }) {
  const sc = SEV_CONFIG[alert.severity];
  const stc = STATUS_CONFIG[alert.status];
  const cat = CATEGORY_CONFIG[alert.category];
  const isActive = alert.status === 'active';

  return (
    <button
      onClick={onClick}
      className="w-full text-left border-b transition-colors hover:bg-white/[0.025] group"
      style={{
        borderColor: 'var(--border-subtle)',
        background: selected ? sc.bg : 'transparent',
        borderLeft: `3px solid ${selected || isActive ? sc.color : 'transparent'}`,
      }}>
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Severity dot — 8px, with animation for critical active */}
        <div
          className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${isActive && alert.severity !== 'info' ? sc.dotClass : ''}`}
          style={{ background: sc.color, opacity: isActive ? 1 : 0.35 }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: sc.color + '18', color: sc.color }}>
                {alert.severity.toUpperCase()}
              </span>
              <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {cat.icon} {cat.label}
              </span>
              {!isActive && (
                <span className="text-[9px] font-mono" style={{ color: stc.color }}>
                  {stc.label}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
              {timeAgo(alert.firedAt)}
            </span>
          </div>

          <div className="text-xs font-semibold mb-0.5 leading-snug"
            style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {alert.title}
          </div>
          <div className="text-[11px] line-clamp-1 mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {alert.detail}
          </div>

          {/* Actual vs Threshold monospace chips */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: sc.color + '18', color: sc.color }}>
              {alert.actualValue}
            </span>
            <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
              vs {alert.thresholdValue}
            </span>
            {alert.storeId && (
              <span className="text-[9px] font-mono ml-auto" style={{ color: 'var(--text-muted)' }}>
                {STORES.find(s => s.id === alert.storeId)?.domain}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Main Feed ────────────────────────────────────────────────────────────────

const STATUS_TABS: { key: AlertStatus | 'all'; label: string }[] = [
  { key: 'all',          label: 'All'          },
  { key: 'active',       label: 'Active'       },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'resolved',     label: 'Resolved'     },
  { key: 'snoozed',      label: 'Snoozed'      },
];

const SEV_FILTERS: { key: AlertSeverity | 'all'; label: string; color?: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'critical', label: 'Critical', color: '#ff4444' },
  { key: 'warning',  label: 'Warning',  color: '#ffb347' },
  { key: 'info',     label: 'Info',     color: '#7b93ff' },
];

export default function AlertFeed() {
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [sevFilter, setSevFilter] = useState<AlertSeverity | 'all'>('all');
  const [allAlerts, setAllAlerts] = usePersistentState<FiredAlert[]>('alerts.list', FIRED_ALERTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? allAlerts.find(a => a.id === selectedId) ?? null : null;

  function updateStatus(id: string, status: AlertStatus) {
    const now = new Date().toISOString();
    setAllAlerts(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next = { ...a, status };
      if (status === 'acknowledged') {
        next.acknowledgedAt = a.acknowledgedAt ?? now;
        next.acknowledgedBy = a.acknowledgedBy ?? 'You';
      } else if (status === 'resolved') {
        next.acknowledgedAt = a.acknowledgedAt ?? now;
        next.acknowledgedBy = a.acknowledgedBy ?? 'You';
        next.resolvedAt = now;
      }
      return next;
    }));
  }

  const alerts = allAlerts.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (sevFilter !== 'all' && a.severity !== sevFilter) return false;
    return true;
  }).sort((a, b) => {
    const order: Record<AlertStatus, number> = { active: 0, acknowledged: 1, snoozed: 2, resolved: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(b.firedAt).getTime() - new Date(a.firedAt).getTime();
  });

  return (
    <div className="flex gap-4 min-h-0" style={{ flex: 1 }}>
      {/* Feed list */}
      <div className="glass-card flex flex-col" style={{ flex: selected ? '0 0 460px' : 1, minWidth: 0 }}>
        {/* Filters */}
        <div className="px-4 py-3 border-b space-y-2 shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Status tabs — pill container */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--bg-elevated)', width: 'fit-content' }}>
            {STATUS_TABS.map(t => {
              const cnt = t.key === 'all' ? allAlerts.length : allAlerts.filter(a => a.status === t.key).length;
              const isActive = statusFilter === t.key;
              const tabColor = t.key !== 'all' ? STATUS_CONFIG[t.key as AlertStatus]?.color : undefined;
              return (
                <button key={t.key}
                  onClick={() => setStatusFilter(t.key)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] transition-all"
                  style={{
                    background: isActive ? 'var(--bg-overlay)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: isActive ? '1px solid var(--border-dim)' : '1px solid transparent',
                  }}>
                  {t.label}
                  <span
                    className="min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-mono text-[9px]"
                    style={{
                      background: tabColor ? tabColor + '20' : 'var(--bg-base)',
                      color: tabColor ?? 'var(--text-muted)',
                    }}>
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Severity filter pills */}
          <div className="flex items-center gap-1">
            {SEV_FILTERS.map(f => (
              <button key={f.key}
                onClick={() => setSevFilter(f.key)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-all"
                style={{
                  background: sevFilter === f.key
                    ? (f.color ? f.color + '18' : 'var(--bg-overlay)')
                    : 'transparent',
                  color: sevFilter === f.key
                    ? (f.color ?? 'var(--text-primary)')
                    : 'var(--text-muted)',
                  border: sevFilter === f.key
                    ? `1px solid ${f.color ? f.color + '35' : 'var(--border-dim)'}`
                    : '1px solid transparent',
                }}>
                {f.color && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: f.color }} />
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alert rows */}
        <div className="flex-1 overflow-y-auto">
          {alerts.map(a => (
            <AlertRow key={a.id} alert={a} selected={selectedId === a.id}
              onClick={() => setSelectedId(selectedId === a.id ? null : a.id)} />
          ))}
          {alerts.length === 0 && (
            <div className="flex items-center justify-center h-32" style={{ color: 'var(--text-muted)' }}>
              <span className="text-sm">No alerts match this filter</span>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ width: 360, flexShrink: 0 }}>
          <AlertDetail alert={selected} onClose={() => setSelectedId(null)}
            onUpdateStatus={status => updateStatus(selected.id, status)} />
        </div>
      )}
    </div>
  );
}
