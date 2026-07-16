'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { Zap, Shield, CheckCircle, AlertTriangle, XCircle, Clock, ShieldCheck, X, ChevronRight, ChevronLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AD_PLATFORM_CONFIG } from '@/lib/campaignData';
import type { AdPlatform, AutomationRule, HealthCheckItem } from '@/lib/campaignData';

// ─── 4-step rule builder ────────────────────────────────────────────────────

type BuilderMetric = 'ROAS' | 'CPA' | 'CTR' | 'Spend' | 'Frequency' | 'Quality Score';
type BuilderOperator = '<' | '<=' | '>' | '>=';
type BuilderAction = 'Pause ad set' | 'Pause campaign' | 'Increase daily budget by 20%' | 'Decrease daily budget by 20%' | 'Notify via Slack' | 'Notify via email';

const BUILDER_METRICS: { key: BuilderMetric; unit: string }[] = [
  { key: 'ROAS', unit: '×' }, { key: 'CPA', unit: '$' }, { key: 'CTR', unit: '%' },
  { key: 'Spend', unit: '$' }, { key: 'Frequency', unit: '' }, { key: 'Quality Score', unit: '/10' },
];
const BUILDER_ACTIONS: BuilderAction[] = ['Pause ad set', 'Pause campaign', 'Increase daily budget by 20%', 'Decrease daily budget by 20%', 'Notify via Slack', 'Notify via email'];

function RuleBuilderModal({ platforms, onClose, onCreate }: {
  platforms: AdPlatform[];
  onClose: () => void;
  onCreate: (rule: AutomationRule) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<AdPlatform>(platforms[0] ?? 'meta');
  const [metric, setMetric] = useState<BuilderMetric>('ROAS');
  const [operator, setOperator] = useState<BuilderOperator>('<');
  const [threshold, setThreshold] = useState('2.0');
  const [periods, setPeriods] = useState('2');
  const [action, setAction] = useState<BuilderAction>('Pause ad set');

  const unit = BUILDER_METRICS.find(m => m.key === metric)?.unit ?? '';
  const triggerStr = `${metric} ${operator} ${metric === 'CPA' || metric === 'Spend' ? '$' : ''}${threshold}${unit === '$' ? '' : unit}`;
  const conditionStr = `For ${periods} consecutive check period${periods === '1' ? '' : 's'}`;

  const create = () => {
    onCreate({
      id: `rule-${Date.now()}`,
      name: name.trim() || `${metric} ${operator} ${threshold} → ${action}`,
      platform,
      status: 'active',
      enabled: true,
      trigger: triggerStr,
      action,
      condition: conditionStr,
      fireCount: 0,
      lastFired: undefined,
    });
  };

  const canNext = step === 1 ? true : step === 2 ? threshold.trim() !== '' : true;
  const inputStyle = { background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' } as const;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center' style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className='rounded-2xl w-[560px] max-w-[92vw] flex flex-col' style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)' }} onClick={e => e.stopPropagation()}>
        {/* Header + step indicator */}
        <div className='flex items-center justify-between px-5 pt-4 pb-3 border-b' style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>New Automation Rule</div>
            <div className='text-[16px]' style={{ color: 'var(--text-muted)' }}>Step {step} of 4 · {['Basics', 'Condition', 'Action', 'Review'][step - 1]}</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <div className='flex gap-1 px-5 pt-3'>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className='flex-1 h-1 rounded-full' style={{ background: n <= step ? '#ffb347' : 'var(--bg-elevated)' }} />
          ))}
        </div>

        <div className='p-5 flex flex-col gap-4' style={{ minHeight: 220 }}>
          {step === 1 && (
            <>
              <div>
                <label className='section-label block mb-1.5'>Rule Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder='e.g. Pause underperformers'
                  className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle} />
              </div>
              <div>
                <label className='section-label block mb-1.5'>Platform</label>
                <div className='flex flex-wrap gap-1.5'>
                  {(platforms.length ? platforms : (['meta', 'google'] as AdPlatform[])).map(p => {
                    const cfg = AD_PLATFORM_CONFIG[p];
                    const active = platform === p;
                    return (
                      <button key={p} onClick={() => setPlatform(p)}
                        className='px-3 py-1.5 rounded-lg text-base transition-all'
                        style={{ background: active ? cfg.color + '18' : 'var(--bg-elevated)', color: active ? cfg.color : 'var(--text-muted)', border: `1px solid ${active ? cfg.color + '40' : 'var(--border-subtle)'}` }}>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div>
                <label className='section-label block mb-1.5'>When metric</label>
                <select value={metric} onChange={e => setMetric(e.target.value as BuilderMetric)}
                  className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle}>
                  {BUILDER_METRICS.map(m => <option key={m.key} value={m.key}>{m.key}</option>)}
                </select>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='section-label block mb-1.5'>Operator</label>
                  <select value={operator} onChange={e => setOperator(e.target.value as BuilderOperator)}
                    className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle}>
                    {(['<', '<=', '>', '>='] as BuilderOperator[]).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className='section-label block mb-1.5'>Threshold {unit && `(${unit})`}</label>
                  <input value={threshold} onChange={e => setThreshold(e.target.value)} inputMode='decimal'
                    className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle} />
                </div>
              </div>
              <div>
                <label className='section-label block mb-1.5'>Sustained for (consecutive check periods)</label>
                <select value={periods} onChange={e => setPeriods(e.target.value)}
                  className='w-full px-3 py-2 rounded-lg text-base outline-none' style={inputStyle}>
                  {['1', '2', '3', '5', '7'].map(n => <option key={n} value={n}>{n} period{n === '1' ? '' : 's'}</option>)}
                </select>
              </div>
            </>
          )}
          {step === 3 && (
            <div>
              <label className='section-label block mb-1.5'>Then perform action</label>
              <div className='flex flex-col gap-1.5'>
                {BUILDER_ACTIONS.map(a => {
                  const active = action === a;
                  return (
                    <button key={a} onClick={() => setAction(a)}
                      className='px-3 py-2 rounded-lg text-base text-left transition-all'
                      style={{ background: active ? 'rgba(0,217,255,0.1)' : 'var(--bg-elevated)', color: active ? 'var(--cyan)' : 'var(--text-secondary)', border: `1px solid ${active ? 'rgba(0,217,255,0.25)' : 'var(--border-subtle)'}` }}>
                      {active && '✓ '}{a}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className='rounded-xl p-4 space-y-2 text-[16px] font-mono' style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
              <div className='text-base font-semibold font-sans mb-2' style={{ color: 'var(--text-primary)' }}>{name.trim() || 'Untitled rule'}</div>
              <div className='flex gap-2'><span className='w-12 text-right' style={{ color: 'var(--text-muted)' }}>ON</span><span style={{ color: AD_PLATFORM_CONFIG[platform].color }}>{AD_PLATFORM_CONFIG[platform].label}</span></div>
              <div className='flex gap-2'><span className='w-12 text-right' style={{ color: 'var(--text-muted)' }}>IF</span><span style={{ color: '#ffb347' }}>{triggerStr}</span></div>
              <div className='flex gap-2'><span className='w-12 text-right' style={{ color: 'var(--text-muted)' }}>WHEN</span><span style={{ color: 'var(--text-secondary)' }}>{conditionStr}</span></div>
              <div className='flex gap-2'><span className='w-12 text-right' style={{ color: 'var(--text-muted)' }}>THEN</span><span style={{ color: 'var(--cyan)' }}>{action}</span></div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className='flex items-center justify-between px-5 py-3 border-t' style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-base' style={{ color: 'var(--text-muted)' }}>
            {step === 1 ? 'Cancel' : <><ChevronLeft size={13} />Back</>}
          </button>
          {step < 4 ? (
            <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext}
              className='flex items-center gap-1 px-4 py-1.5 rounded-lg text-base font-medium disabled:opacity-50'
              style={{ background: '#ffb347', color: '#0a0e1a' }}>
              Next<ChevronRight size={13} />
            </button>
          ) : (
            <button onClick={create}
              className='px-4 py-1.5 rounded-lg text-base font-semibold'
              style={{ background: '#ffb347', color: '#0a0e1a' }}>
              Create Rule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

// CSS-only pill toggle — no external library
interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      role='switch'
      aria-checked={enabled}
      className='shrink-0'
      style={{
        width: 32,
        height: 18,
        borderRadius: 9,
        background: enabled ? '#ffb347' : 'var(--bg-overlay)',
        border: `1px solid ${enabled ? '#ffb34760' : 'var(--border-dim)'}`,
        position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
        cursor: 'pointer',
        flexShrink: 0,
      }}>
      <div style={{
        position: 'absolute',
        top: 2,
        left: enabled ? 14 : 2,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
        transition: 'left 0.18s cubic-bezier(.4,0,.2,1)',
      }} />
    </button>
  );
}

const RULE_STATUS_COLOR = {
  active:    '#10d98a',
  triggered: '#ffb347',
  paused:    '#474e82',
} as const;

export function AutomationRulesPanel() {
  const [rules, setRules] = usePersistentState<AutomationRule[]>('ads.automationRules', []);
  const [building, setBuilding] = useState(false);

  const toggle = (id: string) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const platforms = Array.from(new Set(rules.map(r => r.platform))) as AdPlatform[];

  return (
    <div className='glass-card p-4'>
      {building && (
        <RuleBuilderModal
          platforms={platforms}
          onClose={() => setBuilding(false)}
          onCreate={(rule) => { setRules(prev => [rule, ...prev]); setBuilding(false); }}
        />
      )}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <Zap size={13} style={{ color: '#ffb347' }} />
          <span className='section-label'>Automation Rules</span>
          <span className='text-[16px] font-mono px-1.5 py-0.5 rounded'
            style={{ background: 'rgba(255,179,71,0.12)', color: '#ffb347' }}>
            {rules.filter(r => r.enabled).length}/{rules.length} active
          </span>
        </div>
        <button onClick={() => setBuilding(true)} className='text-base px-3 py-1.5 rounded-lg font-medium'
          style={{ background: 'rgba(255,179,71,0.08)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.2)' }}>
          + New Rule
        </button>
      </div>

      {rules.length === 0 && (
        <div className='rounded-xl p-8 text-center' style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-dim)' }}>
          <Zap size={22} className='mx-auto mb-2' style={{ color: 'var(--text-muted)' }} />
          <div className='text-base font-medium' style={{ color: 'var(--text-primary)' }}>No automation rules yet</div>
          <div className='text-[16px] mt-1' style={{ color: 'var(--text-muted)' }}>Add a rule to automatically pause, scale, or alert on campaign performance.</div>
        </div>
      )}

      <div className='space-y-2'>
        {rules.map(rule => {
          const pc = AD_PLATFORM_CONFIG[rule.platform];
          const sc = RULE_STATUS_COLOR[rule.status as keyof typeof RULE_STATUS_COLOR] ?? 'var(--text-muted)';

          return (
            <div key={rule.id} className='rounded-xl p-3 transition-all'
              style={{
                background: rule.enabled ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${rule.enabled ? 'var(--border-dim)' : 'var(--border-subtle)'}`,
                opacity: rule.enabled ? 1 : 0.5,
              }}>
              <div className='flex items-start gap-3'>
                <Toggle enabled={rule.enabled} onToggle={() => toggle(rule.id)} />

                <div className='flex-1 min-w-0'>
                  {/* Badges row */}
                  <div className='flex items-center gap-1.5 mb-1.5 flex-wrap'>
                    <span className='text-[16px] font-mono font-bold px-1.5 py-0.5 rounded'
                      style={{ background: pc.color + '18', color: pc.color, border: `1px solid ${pc.color}28` }}>
                      {pc.label}
                    </span>
                    <span className='text-[16px] font-mono px-1.5 py-0.5 rounded'
                      style={{ background: sc + '18', color: sc }}>
                      {rule.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Rule name */}
                  <div className='text-base font-semibold mb-1.5' style={{ color: 'var(--text-primary)' }}>
                    {rule.name}
                  </div>

                  {/* IF / THEN / WHEN code blocks */}
                  <div className='space-y-1 text-[16px] font-mono'>
                    <div className='flex gap-1.5'>
                      <span className='w-9 shrink-0 text-right' style={{ color: 'var(--text-muted)' }}>IF</span>
                      <span className='px-2 py-0.5 rounded'
                        style={{ background: 'rgba(255,179,71,0.1)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.15)' }}>
                        {rule.trigger}
                      </span>
                    </div>
                    <div className='flex gap-1.5'>
                      <span className='w-9 shrink-0 text-right' style={{ color: 'var(--text-muted)' }}>THEN</span>
                      <span className='px-2 py-0.5 rounded'
                        style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.15)' }}>
                        {rule.action}
                      </span>
                    </div>
                    <div className='flex gap-1.5'>
                      <span className='w-9 shrink-0 text-right' style={{ color: 'var(--text-muted)' }}>WHEN</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{rule.condition}</span>
                    </div>
                  </div>
                </div>

                {/* Fire count + time */}
                <div className='text-right shrink-0'>
                  <div className='font-mono text-base font-bold'
                    style={{ color: rule.fireCount > 0 ? '#ffb347' : 'var(--text-muted)' }}>
                    {rule.fireCount}
                  </div>
                  <div className='section-label' style={{ fontSize: 16 }}>fires</div>
                  {rule.lastFired && (
                    <div className='text-[16px] font-mono mt-1 flex items-center gap-0.5' style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                      <Clock size={8} />
                      {timeAgo(rule.lastFired)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type CheckStatus = 'pass' | 'warn' | 'fail';

const STATUS_CFG: Record<CheckStatus, {
  Icon: LucideIcon;
  color: string;
  label: string;
}> = {
  pass: { Icon: CheckCircle,   color: '#10d98a', label: 'Pass' },
  warn: { Icon: AlertTriangle, color: '#ffb347', label: 'Warn' },
  fail: { Icon: XCircle,       color: '#ff4444', label: 'Fail' },
};

export function AccountHealthAudit() {
  const [allChecks] = usePersistentState<HealthCheckItem[]>('ads.healthChecks', []);
  const [platform, setPlatform] = useState<AdPlatform | 'all'>('all');

  const checks   = allChecks.filter(h => platform === 'all' || h.platform === platform);
  const score    = checks.length === 0 ? 100 : Math.round((checks.filter(h => h.status === 'pass').length / checks.length) * 100);
  const fails    = checks.filter(h => h.status === 'fail').length;
  const warns    = checks.filter(h => h.status === 'warn').length;
  const scoreColor = score >= 80 ? '#10d98a' : score >= 60 ? '#ffb347' : '#ff4444';

  const platforms = Array.from(new Set(allChecks.map(h => h.platform))) as AdPlatform[];

  return (
    <div className='glass-card p-4'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <Shield size={13} style={{ color: scoreColor }} />
          <span className='section-label'>Account Health Audit</span>
        </div>

        {/* Score gauge */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1.5 text-base font-mono'>
            {fails > 0 && (
              <span className='px-1.5 py-0.5 rounded text-[16px] font-bold'
                style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444' }}>
                {fails} fail
              </span>
            )}
            {warns > 0 && (
              <span className='px-1.5 py-0.5 rounded text-[16px] font-bold'
                style={{ background: 'rgba(255,179,71,0.12)', color: '#ffb347' }}>
                {warns} warn
              </span>
            )}
          </div>
          {/* SVG ring gauge */}
          <div className='relative w-12 h-12'>
            <svg viewBox='0 0 36 36' className='w-12 h-12 -rotate-90'>
              <circle cx='18' cy='18' r='15' fill='none' stroke='var(--bg-overlay)' strokeWidth='3' />
              <circle cx='18' cy='18' r='15' fill='none'
                stroke={scoreColor}
                strokeWidth='3'
                strokeDasharray={`${score * 0.942} 100`}
                strokeLinecap='round'
                style={{ filter: `drop-shadow(0 0 4px ${scoreColor}60)` }}
              />
            </svg>
            <span className='absolute inset-0 flex items-center justify-center font-mono text-[16px] font-bold'
              style={{ color: 'var(--text-primary)' }}>
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Platform filter */}
      <div className='flex items-center gap-1 mb-3 flex-wrap'>
        <button onClick={() => setPlatform('all')}
          className='px-2.5 py-1 rounded-full text-[16px] font-medium transition-all'
          style={{
            background: platform === 'all' ? 'var(--bg-overlay)' : 'transparent',
            color: platform === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
            border: `1px solid ${platform === 'all' ? 'var(--border-dim)' : 'transparent'}`,
          }}>
          All
        </button>
        {platforms.map(p => {
          const cfg = AD_PLATFORM_CONFIG[p];
          const isActive = platform === p;
          return (
            <button key={p} onClick={() => setPlatform(p)}
              className='px-2.5 py-1 rounded-full text-[16px] font-medium transition-all'
              style={{
                background: isActive ? cfg.color + '18' : 'transparent',
                color: isActive ? cfg.color : 'var(--text-muted)',
                border: `1px solid ${isActive ? cfg.color + '30' : 'transparent'}`,
              }}>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {checks.length === 0 && (
        <div className='rounded-xl p-8 text-center' style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-dim)' }}>
          <ShieldCheck size={22} className='mx-auto mb-2' style={{ color: 'var(--text-muted)' }} />
          <div className='text-base font-medium' style={{ color: 'var(--text-primary)' }}>No health checks yet</div>
          <div className='text-[16px] mt-1' style={{ color: 'var(--text-muted)' }}>Connect an ad platform to start auditing account health.</div>
        </div>
      )}

      <div className='space-y-1.5'>
        {checks.map(check => {
          const sc = STATUS_CFG[check.status as CheckStatus];
          const Icon = sc.Icon;
          const bg = check.status === 'fail'
            ? 'rgba(255,68,68,0.05)'
            : check.status === 'warn'
            ? 'rgba(255,179,71,0.05)'
            : 'var(--bg-elevated)';
          const border = check.status === 'fail'
            ? 'rgba(255,68,68,0.18)'
            : check.status === 'warn'
            ? 'rgba(255,179,71,0.15)'
            : 'var(--border-subtle)';

          return (
            <div key={check.id} className='flex items-start gap-3 px-3 py-2.5 rounded-xl'
              style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon size={13} style={{ color: sc.color, marginTop: 1, flexShrink: 0 }} />
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-0.5'>
                  <span className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>
                    {check.check}
                  </span>
                  <span className='text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>
                    {check.category}
                  </span>
                  <span className='text-[16px] font-mono ml-auto px-1.5 py-0.5 rounded'
                    style={{
                      background: AD_PLATFORM_CONFIG[check.platform].color + '15',
                      color: AD_PLATFORM_CONFIG[check.platform].color,
                    }}>
                    {AD_PLATFORM_CONFIG[check.platform].icon}
                  </span>
                </div>
                <div className='text-[16px] leading-relaxed'
                  style={{ color: check.status === 'pass' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                  {check.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
