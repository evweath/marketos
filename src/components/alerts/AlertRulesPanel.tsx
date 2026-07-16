'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { CATEGORY_CONFIG, ruleInScope } from '@/lib/alertData';
import type { AlertRule, AlertCategory, AlertSeverity, DeliveryChannel } from '@/lib/alertData';
import { useStores, type StoreRecord } from '@/lib/storeScope';
import { Shield, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Edit2, Bell, Clock, X, CheckSquare, Square, FlaskConical } from 'lucide-react';

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
  const [enabled, setEnabled] = usePersistentState(`alerts.ruleEnabled.${rule.id}`, rule.enabled);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [threshold, setThreshold] = usePersistentState(`alerts.ruleThreshold.${rule.id}`, rule.threshold.toString());

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
          <span style={{ fontSize: 16 }}>{cat.icon}</span>
          <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: sevColor + '18', color: sevColor }}>
            {rule.severity.toUpperCase()}
          </span>
        </div>

        {/* Rule name + IF condition */}
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold mb-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
            {rule.name}
          </div>
          <div className="text-[16px] font-mono flex items-center gap-1"
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
            className="inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded-full font-mono text-[16px] font-bold"
            style={{
              background: rule.fireCount30d > 0 ? sevColor + '18' : 'var(--bg-overlay)',
              color: rule.fireCount30d > 0 ? sevColor : 'var(--text-muted)',
              border: `1px solid ${rule.fireCount30d > 0 ? sevColor + '30' : 'transparent'}`,
            }}>
            {rule.fireCount30d}
          </div>
          <div className="section-label mt-0.5" style={{ fontSize: 16 }}>fires/30d</div>
        </div>

        {/* Delivery icons */}
        <div className="flex gap-0.5 shrink-0">
          {rule.channels.map(ch => (
            <span key={ch} className="text-[16px]" title={ch}>{DELIVERY_ICONS[ch]}</span>
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
              <div className="text-[16px] font-mono font-bold mb-1.5" style={{ color: sevColor }}>IF</div>
              <div className="font-mono text-[16px]" style={{ color: 'var(--text-secondary)' }}>
                {rule.metric}
              </div>
              <div className="font-mono text-[16px]" style={{ color: 'var(--text-muted)' }}>
                {rule.operator} {rule.threshold}{unitLabel}
              </div>
            </div>
            {/* THEN block */}
            <div className="rounded-lg p-2.5"
              style={{ background: 'rgba(0,217,255,0.04)', border: '1px solid rgba(0,217,255,0.12)' }}>
              <div className="text-[16px] font-mono font-bold mb-1.5" style={{ color: 'var(--cyan)' }}>THEN</div>
              <div className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>
                Alert via {rule.channels.join(', ')}
              </div>
              <div className="text-[16px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                cooldown {cooldownLabel}
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 pt-3 space-y-3">
            {/* Description */}
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {rule.description}
            </p>

            {/* Threshold editor */}
            <div>
              <div className="section-label mb-1.5">Threshold</div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {rule.metric} {rule.operator}
                </span>
                {editing ? (
                  <input
                    type="number"
                    value={threshold}
                    onChange={e => setThreshold(e.target.value)}
                    className="w-20 text-base px-2 py-1 rounded outline-none font-mono"
                    style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)', border: `1px solid ${sevColor}40` }}
                  />
                ) : (
                  <span className="font-mono text-base font-bold" style={{ color: sevColor }}>{threshold}</span>
                )}
                <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>{rule.unit}</span>
                <button
                  onClick={() => setEditing(e => !e)}
                  className="ml-auto flex items-center gap-1 text-[16px] px-2 py-1 rounded-lg transition-all"
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
            <div className="flex items-center gap-4 text-[16px]">
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

const NEW_RULE_CATEGORIES: AlertCategory[] = [
  'budget', 'roas', 'uptime', 'ssl', 'cart', 'stock', 'traffic', 'revenue',
];

const RULE_OPERATORS: AlertRule['operator'][] = ['>', '<', '>=', '<=', '==', 'change%'];
const RULE_CHANNELS: DeliveryChannel[] = ['email', 'sms', 'slack', 'teams', 'push'];

// Deterministic pseudo "would have fired" count for the test-against-mock step.
function simulatedFireCount(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % 24;
}

function AlertRuleBuilderModal({ stores, onClose, onCreate }: {
  stores: StoreRecord[];
  onClose: () => void;
  onCreate: (rule: AlertRule) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AlertCategory>('budget');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [metric, setMetric] = useState('');
  const [operator, setOperator] = useState<AlertRule['operator']>('>=');
  const [threshold, setThreshold] = useState('');
  const [unit, setUnit] = useState('');
  const [periods, setPeriods] = useState('1');
  const [channels, setChannels] = useState<DeliveryChannel[]>(['email', 'slack']);
  const [storeScope, setStoreScope] = useState('all');

  const inputStyle = { background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' } as const;
  const metricLabel = metric.trim() || 'metric';
  const conditionStr = `${metricLabel} ${operator} ${threshold || '0'}${unit}${periods !== '1' ? ` for ${periods} consecutive periods` : ''}`;
  const canNext = step === 1 ? name.trim() !== '' : step === 2 ? threshold.trim() !== '' : step === 3 ? channels.length > 0 : true;
  const wouldFire = simulatedFireCount(`${name}${metric}${threshold}${category}`);

  const toggleChannel = (c: DeliveryChannel) =>
    setChannels(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const create = () => {
    onCreate({
      id: `rule-${Date.now()}`,
      name: name.trim(),
      category,
      enabled: true,
      severity,
      metric: metric.trim() || 'custom_metric',
      operator,
      threshold: Number(threshold) || 0,
      unit,
      storeIds: [storeScope],
      channels,
      cooldownMinutes: 60,
      description: `Fires when ${conditionStr}.`,
      fireCount30d: 0,
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center' style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className='rounded-2xl w-[560px] max-w-[92vw] flex flex-col' style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)' }} onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between px-5 pt-4 pb-3 border-b' style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>New Alert Rule</div>
            <div className='text-[16px]' style={{ color: 'var(--text-muted)' }}>Step {step} of 4 · {['Basics', 'Condition', 'Delivery', 'Review & Test'][step - 1]}</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <div className='flex gap-1 px-5 pt-3'>
          {[1, 2, 3, 4].map(n => <div key={n} className='flex-1 h-1 rounded-full' style={{ background: n <= step ? '#10d98a' : 'var(--bg-elevated)' }} />)}
        </div>

        <div className='p-5 flex flex-col gap-4' style={{ minHeight: 240 }}>
          {step === 1 && (
            <>
              <div>
                <label className='section-label block mb-1.5'>Rule Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder='e.g. Daily budget overspend'
                  className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle} />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='section-label block mb-1.5'>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value as AlertCategory)}
                    className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle}>
                    {NEW_RULE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_CONFIG[c].icon} {CATEGORY_CONFIG[c].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className='section-label block mb-1.5'>Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value as AlertSeverity)}
                    className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle}>
                    <option value='critical'>Critical</option>
                    <option value='warning'>Warning</option>
                    <option value='info'>Info</option>
                  </select>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className='grid grid-cols-[1fr_auto_1fr] gap-2 items-end'>
                <div>
                  <label className='section-label block mb-1.5'>Metric</label>
                  <input value={metric} onChange={e => setMetric(e.target.value)} placeholder='daily_spend'
                    className='w-full px-3 py-2 rounded-lg text-base outline-none font-mono' style={inputStyle} />
                </div>
                <div>
                  <label className='section-label block mb-1.5'>Op</label>
                  <select value={operator} onChange={e => setOperator(e.target.value as AlertRule['operator'])}
                    className='px-2 py-2 rounded-lg text-base outline-none' style={inputStyle}>
                    {RULE_OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className='section-label block mb-1.5'>Threshold</label>
                  <input value={threshold} onChange={e => setThreshold(e.target.value)} inputMode='decimal' placeholder='0'
                    className='w-full px-3 py-2 rounded-lg text-base outline-none font-mono' style={inputStyle} />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='section-label block mb-1.5'>Unit (optional)</label>
                  <input value={unit} onChange={e => setUnit(e.target.value)} placeholder='%, $, ms…'
                    className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle} />
                </div>
                <div>
                  <label className='section-label block mb-1.5'>Sustained for</label>
                  <select value={periods} onChange={e => setPeriods(e.target.value)}
                    className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle}>
                    {['1', '2', '3', '5'].map(n => <option key={n} value={n}>{n} consecutive period{n === '1' ? '' : 's'}</option>)}
                  </select>
                </div>
              </div>
              <div className='rounded-lg px-3 py-2 text-[16px] font-mono' style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                IF {conditionStr}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div>
                <label className='section-label block mb-1.5'>Deliver via</label>
                <div className='flex flex-col gap-1.5'>
                  {RULE_CHANNELS.map(c => {
                    const on = channels.includes(c);
                    return (
                      <button key={c} onClick={() => toggleChannel(c)}
                        className='flex items-center gap-2 px-3 py-2 rounded-lg text-base text-left capitalize transition-all'
                        style={{ background: on ? 'rgba(16,217,138,0.1)' : 'var(--bg-elevated)', color: on ? '#10d98a' : 'var(--text-secondary)', border: `1px solid ${on ? 'rgba(16,217,138,0.25)' : 'var(--border-subtle)'}` }}>
                        {on ? <CheckSquare size={14} /> : <Square size={14} />}{c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className='section-label block mb-1.5'>Applies to</label>
                <select value={storeScope} onChange={e => setStoreScope(e.target.value)}
                  className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle}>
                  <option value='all'>All Stores</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <div className='rounded-xl p-4 space-y-2 text-[16px] font-mono' style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                <div className='text-base font-semibold font-sans mb-1' style={{ color: 'var(--text-primary)' }}>{name.trim() || 'Untitled rule'}</div>
                <div className='flex gap-2'><span className='w-16 text-right' style={{ color: 'var(--text-muted)' }}>CATEGORY</span><span style={{ color: 'var(--text-secondary)' }}>{CATEGORY_CONFIG[category].icon} {CATEGORY_CONFIG[category].label} · {severity}</span></div>
                <div className='flex gap-2'><span className='w-16 text-right' style={{ color: 'var(--text-muted)' }}>IF</span><span style={{ color: '#ffb347' }}>{conditionStr}</span></div>
                <div className='flex gap-2'><span className='w-16 text-right' style={{ color: 'var(--text-muted)' }}>NOTIFY</span><span style={{ color: 'var(--cyan)' }}>{channels.join(', ')}</span></div>
                <div className='flex gap-2'><span className='w-16 text-right' style={{ color: 'var(--text-muted)' }}>SCOPE</span><span style={{ color: 'var(--text-secondary)' }}>{storeScope === 'all' ? 'All Stores' : stores.find(s => s.id === storeScope)?.name ?? storeScope}</span></div>
              </div>
              <div className='rounded-lg px-3 py-2.5 flex items-start gap-2 text-[16px]'
                style={{ background: 'rgba(0,217,255,0.06)', border: '1px solid rgba(0,217,255,0.2)', color: 'var(--cyan)' }}>
                <FlaskConical size={13} className='mt-0.5 shrink-0' />
                <span>Tested against the last 30 days of sample data: this rule would have fired <strong>{wouldFire}</strong> time{wouldFire === 1 ? '' : 's'}. {wouldFire > 12 ? 'That may be noisy — consider raising the threshold or the consecutive-periods window.' : 'Firing volume looks reasonable.'}</span>
              </div>
            </>
          )}
        </div>

        <div className='flex items-center justify-between px-5 py-3 border-t' style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-base' style={{ color: 'var(--text-muted)' }}>
            {step === 1 ? 'Cancel' : <><ChevronLeft size={13} />Back</>}
          </button>
          {step < 4 ? (
            <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext}
              className='flex items-center gap-1 px-4 py-1.5 rounded-lg text-base font-medium disabled:opacity-50'
              style={{ background: '#10d98a', color: '#0a0e1a' }}>Next<ChevronRight size={13} /></button>
          ) : (
            <button onClick={create} className='px-4 py-1.5 rounded-lg text-base font-semibold' style={{ background: '#10d98a', color: '#0a0e1a' }}>Create Rule</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AlertRulesPanel({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [catFilter, setCatFilter] = useState<AlertCategory | 'all'>('all');
  const [showDisabled, setShowDisabled] = useState(false);
  const [fullRules, setAllRules] = usePersistentState<AlertRule[]>('alerts.rules', []);
  const allRules = fullRules.filter(r => ruleInScope(r.storeIds, selectedStoreIds));
  const [building, setBuilding] = useState(false);

  const rules = allRules.filter(r => {
    if (!showDisabled && !r.enabled) return false;
    if (catFilter !== 'all' && r.category !== catFilter) return false;
    return true;
  }).sort((a, b) => {
    const sevOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });

  return (
    <div className="glass-card flex flex-col" style={{ flex: 1, minHeight: 0 }}>
      {building && (
        <AlertRuleBuilderModal
          stores={stores}
          onClose={() => setBuilding(false)}
          onCreate={(rule) => { setAllRules(prev => [rule, ...prev]); setBuilding(false); }}
        />
      )}
      {/* Header */}
      <div className="px-4 py-3 border-b shrink-0 space-y-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: 'rgba(16,217,138,0.12)' }}>
              <Shield size={11} style={{ color: '#10d98a' }} />
            </div>
            <span className="section-label">Alert Rules</span>
            <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              {allRules.filter(r => r.enabled).length}/{allRules.length} active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[16px] cursor-pointer select-none"
              style={{ color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={showDisabled} onChange={e => setShowDisabled(e.target.checked)} />
              Show disabled
            </label>
            <button onClick={() => setBuilding(true)}
              className="text-base px-3 py-1.5 rounded-lg font-semibold transition-all hover:brightness-110"
              style={{ background: 'rgba(0,217,255,0.10)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.22)' }}>
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
                className="px-2 py-0.5 rounded-full text-[16px] transition-all"
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
            <span className="text-base">
              {fullRules.length === 0 ? 'No alert rules yet — add one to get started.' : 'No rules match this filter'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
