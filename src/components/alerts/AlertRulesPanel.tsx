'use client';

import { useState } from 'react';
import { ALERT_RULES, CATEGORY_CONFIG } from '@/lib/alertData';
import type { AlertRule, AlertCategory } from '@/lib/alertData';
import { Shield, ChevronDown, ChevronUp, Edit2, Bell, Clock } from 'lucide-react';

const DELIVERY_ICONS: Record<string, string> = {
  email: '✉', sms: '📱', slack: '💬', teams: '🔷', push: '🔔',
};

const CAT_FILTERS: { key: AlertCategory | 'all'; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'budget',  label: '💰 Budget'  },
  { key: 'roas',    label: '📈 ROAS'    },
  { key: 'uptime',  label: '🔔 Uptime'  },
  { key: 'ssl',     label: '🔒 SSL'     },
  { key: 'cart',    label: '🛒 Cart'    },
  { key: 'stock',   label: '📦 Stock'   },
  { key: 'traffic', label: '🌐 Traffic' },
  { key: 'revenue', label: '💵 Revenue' },
];

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Toggle({ on, onChange, color }: { on: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="w-9 h-5 rounded-full transition-colors shrink-0 relative focus:outline-none"
      style={{ background: on ? (color ?? '#10d98a') : 'var(--bg-overlay)' }}>
      <div className="absolute w-3.5 h-3.5 bg-white rounded-full top-0.5 transition-all shadow-sm"
        style={{ left: on ? '18px' : '2px' }} />
    </button>
  );
}

function RuleCard({ rule }: { rule: AlertRule }) {
  const [enabled, setEnabled] = useState(rule.enabled);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [threshold, setThreshold] = useState(rule.threshold.toString());

  const cat = CATEGORY_CONFIG[rule.category];
  const sevColor = rule.severity === 'critical' ? '#ff4444' : rule.severity === 'warning' ? '#ffb347' : '#7b93ff';
  const unitLabel = rule.unit !== 'flag' && rule.unit !== 'status (0=down)' ? ` ${rule.unit}` : '';
  const cooldownLabel = rule.cooldownMinutes < 60
    ? `${rule.cooldownMinutes}m`
    : `${rule.cooldownMinutes / 60}h`;

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{
        background: enabled ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border: `1px solid ${enabled ? 'var(--border-dim)' : 'var(--border-subtle)'}`,
        opacity: enabled ? 1 : 0.6,
      }}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Toggle on={enabled} onChange={setEnabled} color={sevColor} />

        {/* Category icon + severity badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span style={{ fontSize: 14 }}>{cat.icon}</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: sevColor + '18', color: sevColor }}>
            {rule.severity.toUpperCase()}
          </span>
        </div>

        {/* Rule name + IF condition */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold mb-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
            {rule.name}
          </div>
          <div className="text-[10px] font-mono flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}>
            <span>IF</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {rule.metric} {rule.operator} {rule.threshold}{unitLabel}
            </span>
            <span className="mx-0.5">·</span>
            <span>cooldown {cooldownLabel}</span>
          </div>
        </div>

        {/* Fire count badge */}
        <div className="shrink-0 text-right">
          <div
            className="inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded-full font-mono text-[10px] font-bold"
            style={{
              background: rule.fireCount30d > 0 ? sevColor + '18' : 'var(--bg-overlay)',
              color: rule.fireCount30d > 0 ? sevColor : 'var(--text-muted)',
              border: `1px solid ${rule.fireCount30d > 0 ? sevColor + '30' : 'transparent'}`,
            }}>
            {rule.fireCount30d}
          </div>
          <div className="section-label mt-0.5" style={{ fontSize: 8 }}>fires/30d</div>
        </div>

        {/* Delivery icons */}
        <div className="flex gap-0.5 shrink-0">
          {rule.channels.map(ch => (
            <span key={ch} className="text-[11px]" title={ch}>{DELIVERY_ICONS[ch]}</span>
          ))}
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(e => !e)}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06] shrink-0"
          style={{ color: 'var(--text-muted)' }}>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t animate-fade-up" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* IF/THEN layout */}
          <div className="grid grid-cols-2 gap-2 px-4 pt-3">
            {/* IF block */}
            <div className="rounded-lg p-2.5"
              style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-[9px] font-mono font-bold mb-1.5" style={{ color: sevColor }}>IF</div>
              <div className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                {rule.metric}
              </div>
              <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {rule.operator} {rule.threshold}{unitLabel}
              </div>
            </div>
            {/* THEN block */}
            <div className="rounded-lg p-2.5"
              style={{ background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.12)' }}>
              <div className="text-[9px] font-mono font-bold mb-1.5" style={{ color: '#00d9ff' }}>THEN</div>
              <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                Alert via {rule.channels.join(', ')}
              </div>
              <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                cooldown {cooldownLabel}
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 pt-3 space-y-3">
            {/* Description */}
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {rule.description}
            </p>

            {/* Threshold editor */}
            <div>
              <div className="section-label mb-1.5">Threshold</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {rule.metric} {rule.operator}
                </span>
                {editing ? (
                  <input
                    type="number"
                    value={threshold}
                    onChange={e => setThreshold(e.target.value)}
                    className="w-20 text-xs px-2 py-1 rounded outline-none font-mono"
                    style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)', border: `1px solid ${sevColor}40` }}
                  />
                ) : (
                  <span className="font-mono text-xs font-bold" style={{ color: sevColor }}>{threshold}</span>
                )}
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{rule.unit}</span>
                <button
                  onClick={() => setEditing(e => !e)}
                  className="ml-auto flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-all"
                  style={{
                    background: editing ? 'rgba(16,217,138,0.12)' : 'var(--bg-overlay)',
                    color: editing ? '#10d98a' : 'var(--text-muted)',
                    border: `1px solid ${editing ? 'rgba(16,217,138,0.25)' : 'transparent'}`,
                  }}>
                  <Edit2 size={9} />
                  {editing ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Last fired + fire count */}
            <div className="flex items-center gap-4 text-[10px]">
              {rule.lastFired ? (
                <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                  <Clock size={9} />
                  Last fired: {timeAgo(rule.lastFired)}
                </div>
              ) : (
                <div className="flex items-center gap-1" style={{ color: '#10d98a' }}>
                  <Shield size={9} />
                  Never fired
                </div>
              )}
              <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Bell size={9} />
                {rule.fireCount30d} fires this month
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlertRulesPanel() {
  const [catFilter, setCatFilter] = useState<AlertCategory | 'all'>('all');
  const [showDisabled, setShowDisabled] = useState(false);

  const rules = ALERT_RULES.filter(r => {
    if (!showDisabled && !r.enabled) return false;
    if (catFilter !== 'all' && r.category !== catFilter) return false;
    return true;
  }).sort((a, b) => {
    const sevOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });

  return (
    <div className="glass-card flex flex-col" style={{ flex: 1, minHeight: 0 }}>
      {/* Header */}
      <div className="px-4 py-3 border-b shrink-0 space-y-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: 'rgba(16,217,138,0.12)' }}>
              <Shield size={11} style={{ color: '#10d98a' }} />
            </div>
            <span className="section-label">Alert Rules</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              {ALERT_RULES.filter(r => r.enabled).length}/{ALERT_RULES.length} active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] cursor-pointer select-none"
              style={{ color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={showDisabled} onChange={e => setShowDisabled(e.target.checked)} />
              Show disabled
            </label>
            <button className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:brightness-110"
              style={{ background: 'rgba(0,217,255,0.10)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.22)' }}>
              + New Rule
            </button>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1">
          {CAT_FILTERS.map(f => {
            const isActive = catFilter === f.key;
            return (
              <button key={f.key}
                onClick={() => setCatFilter(f.key)}
                className="px-2 py-0.5 rounded-full text-[10px] transition-all"
                style={{
                  background: isActive ? 'var(--bg-overlay)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border-dim)' : '1px solid transparent',
                }}>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {rules.map(rule => <RuleCard key={rule.id} rule={rule} />)}
        {rules.length === 0 && (
          <div className="flex items-center justify-center h-24" style={{ color: 'var(--text-muted)' }}>
            <span className="text-sm">No rules match this filter</span>
          </div>
        )}
      </div>
    </div>
  );
}
