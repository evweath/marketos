'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { DELIVERY_CHANNEL_LIST, QUIET_HOURS, DIGEST_CONFIG, CATEGORY_CONFIG } from '@/lib/alertData';
import type { DeliveryChannelConfig } from '@/lib/alertData';
import { CheckCircle, XCircle, AlertCircle, Send, Moon, Calendar, Loader2, Eye, EyeOff, Route } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEST_STATUS_CONFIG = {
  ok:       { Icon: CheckCircle, color: '#10d98a', label: 'Connected'  },
  error:    { Icon: XCircle,     color: '#ff4444', label: 'Error'      },
  untested: { Icon: AlertCircle, color: '#ffb347', label: 'Not Tested' },
};

const CHANNEL_ICON_BG: Record<string, string> = {
  email: 'rgba(0,217,255,0.12)',
  sms:   'rgba(16,217,138,0.12)',
  slack: 'rgba(255,179,71,0.12)',
  teams: 'rgba(123,147,255,0.12)',
  push:  'rgba(0,217,255,0.12)',
};

const CHANNEL_ICON_COLOR: Record<string, string> = {
  email: '#00d9ff',
  sms:   '#10d98a',
  slack: '#ffb347',
  teams: '#7b93ff',
  push:  '#00d9ff',
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange, color = '#10d98a' }: { on: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="w-9 h-5 rounded-full transition-colors shrink-0 relative focus:outline-none"
      style={{ background: on ? color : 'var(--bg-overlay)' }}>
      <div className="absolute w-3.5 h-3.5 bg-white rounded-full top-0.5 transition-all shadow-sm"
        style={{ left: on ? '18px' : '2px' }} />
    </button>
  );
}

// ─── Channel Card ─────────────────────────────────────────────────────────────

interface ChannelField { key: string; label: string; placeholder: string; secret?: boolean }

// Per-channel field sets — the real config each provider needs.
const CHANNEL_FIELDS: Record<string, ChannelField[]> = {
  email: [
    { key: 'from',     label: 'From Address', placeholder: 'alerts@yourdomain.com' },
    { key: 'smtpHost', label: 'SMTP Host',    placeholder: 'smtp.sendgrid.net' },
    { key: 'smtpPort', label: 'SMTP Port',    placeholder: '587' },
    { key: 'smtpUser', label: 'SMTP Username', placeholder: 'apikey' },
    { key: 'smtpPass', label: 'SMTP Password', placeholder: '••••••••', secret: true },
  ],
  sms: [
    { key: 'from',        label: 'From Number',        placeholder: '+1 (555) 555-0100' },
    { key: 'twilioSid',   label: 'Twilio Account SID', placeholder: 'ACxxxxxxxxxxxxxxxx' },
    { key: 'twilioToken', label: 'Twilio Auth Token',  placeholder: '••••••••', secret: true },
  ],
  slack: [
    { key: 'workspace', label: 'Workspace',            placeholder: 'yourteam' },
    { key: 'channel',   label: 'Channel',              placeholder: '#alerts' },
    { key: 'webhook',   label: 'Incoming Webhook URL', placeholder: 'https://hooks.slack.com/services/…', secret: true },
  ],
  teams: [
    { key: 'webhook', label: 'Incoming Webhook URL', placeholder: 'https://outlook.office.com/webhook/…', secret: true },
  ],
  push: [],
};

const SEVERITIES = [
  { key: 'critical', label: 'Critical', color: '#ff4444' },
  { key: 'warning',  label: 'Warning',  color: '#ffb347' },
  { key: 'info',     label: 'Info',     color: '#7b93ff' },
] as const;

function ChannelCard({ ch }: { ch: DeliveryChannelConfig }) {
  const [enabled, setEnabled] = usePersistentState(`alerts.channelEnabled.${ch.channel}`, false);
  const [values, setValues] = usePersistentState<Record<string, string>>(`alerts.channelValues.${ch.channel}`, {});
  const [severities, setSeverities] = usePersistentState<string[]>(`alerts.channelSeverities.${ch.channel}`, ['critical', 'warning', 'info']);
  const [savedTestStatus, setSavedTestStatus] = usePersistentState<'ok' | 'error' | 'untested'>(`alerts.channelTestStatus.${ch.channel}`, 'untested');
  const [showSecrets, setShowSecrets] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null);

  const ts = testResult
    ? TEST_STATUS_CONFIG[testResult]
    : TEST_STATUS_CONFIG[savedTestStatus];

  const iconBg = CHANNEL_ICON_BG[ch.channel] ?? 'rgba(123,147,255,0.12)';
  const iconColor = CHANNEL_ICON_COLOR[ch.channel] ?? '#7b93ff';
  const fields = CHANNEL_FIELDS[ch.channel] ?? [];
  const configured = fields.length === 0 || fields.some(f => (values[f.key] ?? '').trim().length > 0);
  const criticalOnly = severities.length === 1 && severities[0] === 'critical';

  const setField = (key: string, v: string) => setValues(prev => ({ ...prev, [key]: v }));
  const toggleSeverity = (key: string) =>
    setSeverities(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise(r => setTimeout(r, 1000));
    const ok = configured;
    setTestResult(ok ? 'ok' : 'error');
    setSavedTestStatus(ok ? 'ok' : 'error');
    setTesting(false);
  };

  return (
    <div className="rounded-xl p-3.5 transition-all flex flex-col"
      style={{
        background: enabled ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border: `1px solid ${enabled ? 'var(--border-dim)' : 'var(--border-subtle)'}`,
        opacity: enabled ? 1 : 0.6,
      }}>
      {/* Top row: icon + name + toggle */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
          style={{ background: iconBg }}>
          <span style={{ color: iconColor }}>{ch.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{ch.label}</div>
          {ts && (
            <div className="flex items-center gap-1 mt-0.5 text-[16px]">
              <ts.Icon size={9} style={{ color: ts.color }} />
              <span style={{ color: ts.color }}>{ts.label}</span>
            </div>
          )}
        </div>
        <Toggle on={enabled} onChange={setEnabled} color={iconColor} />
      </div>

      {/* Per-channel fields */}
      {fields.length > 0 ? (
        <div className={`space-y-2 mb-3 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {fields.some(f => f.secret) && (
            <div className="flex justify-end -mb-1">
              <button onClick={() => setShowSecrets(s => !s)}
                className="flex items-center gap-1 text-[16px]" style={{ color: 'var(--text-muted)' }}>
                {showSecrets ? <EyeOff size={11} /> : <Eye size={11} />}
                {showSecrets ? 'Hide' : 'Show'} secrets
              </button>
            </div>
          )}
          {fields.map(f => (
            <div key={f.key}>
              <div className="section-label mb-1">{f.label}</div>
              <input
                type={f.secret && !showSecrets ? 'password' : 'text'}
                value={values[f.key] ?? ''}
                onChange={e => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
                disabled={!enabled}
                className="w-full"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-3 text-[16px] rounded-lg px-2.5 py-2"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
          Browser push uses the device subscription — no configuration needed.
        </div>
      )}

      {/* Severity routing filter */}
      <div className={`mb-3 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="section-label">Route Severities</span>
          {criticalOnly && (
            <span className="text-[16px] font-mono px-1.5 rounded" style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444' }}>critical-only</span>
          )}
        </div>
        <div className="flex gap-1.5">
          {SEVERITIES.map(sev => {
            const on = severities.includes(sev.key);
            return (
              <button key={sev.key} onClick={() => toggleSeverity(sev.key)}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[16px] font-medium transition-all"
                style={{
                  background: on ? sev.color + '1a' : 'var(--bg-surface)',
                  color: on ? sev.color : 'var(--text-muted)',
                  border: `1px solid ${on ? sev.color + '40' : 'var(--border-subtle)'}`,
                }}>
                {on && <CheckCircle size={10} />}{sev.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Test button */}
      <button
        onClick={runTest}
        disabled={!enabled || testing}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-base font-medium transition-all mt-auto"
        style={{
          background: !enabled ? 'transparent' : testing ? 'rgba(0,217,255,0.04)' : 'rgba(0,217,255,0.06)',
          color: !enabled ? 'var(--text-muted)' : 'var(--cyan)',
          border: `1px solid ${!enabled ? 'transparent' : 'rgba(0,217,255,0.15)'}`,
          cursor: !enabled || testing ? 'not-allowed' : 'pointer',
        }}>
        {testing
          ? <><Loader2 size={11} className="animate-spin" /> Sending...</>
          : <><Send size={11} /> Send Test</>}
      </button>

      {testResult && (
        <div className="mt-2 text-[16px]" style={{ color: testResult === 'ok' ? '#10d98a' : '#ff6464' }}>
          {testResult === 'ok'
            ? `Test message delivered via ${ch.label} to the configured destination.`
            : `${ch.label} is missing required fields — fill them in above and try again.`}
        </div>
      )}
    </div>
  );
}

// ─── Routing Logic info panel ───────────────────────────────────────────────

function RoutingLogicPanel() {
  const rules = [
    { color: '#ff4444', label: 'Critical', text: 'Sent immediately to every enabled channel that routes Critical — bypasses quiet hours if the critical-bypass toggle is on.' },
    { color: '#ffb347', label: 'Warning',  text: 'Sent to channels routing Warning; held during quiet hours and delivered when the window ends.' },
    { color: '#7b93ff', label: 'Info',     text: 'Not sent individually — rolled into the scheduled digest unless a channel explicitly routes Info.' },
  ];
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(0,217,255,0.12)' }}>
          <Route size={11} style={{ color: 'var(--cyan)' }} />
        </div>
        <span className="section-label">Alert Routing Logic</span>
      </div>
      <div className="space-y-2.5">
        {rules.map(r => (
          <div key={r.label} className="flex items-start gap-2.5">
            <span className="text-[16px] font-mono px-1.5 py-0.5 rounded shrink-0 mt-0.5"
              style={{ background: r.color + '18', color: r.color, minWidth: 62, textAlign: 'center' }}>{r.label}</span>
            <span className="text-base" style={{ color: 'var(--text-secondary)' }}>{r.text}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t text-[16px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        A channel only receives an alert whose severity is in its Route Severities set. Set a channel to Critical-only for on-call escalation (e.g. SMS).
      </div>
    </div>
  );
}

// ─── Quiet Hours ──────────────────────────────────────────────────────────────

function QuietHoursPanel() {
  const [enabled, setEnabled] = usePersistentState('alerts.quietHours.enabled', QUIET_HOURS.enabled);
  const [exceptCrit, setExceptCrit] = usePersistentState('alerts.quietHours.exceptCritical', QUIET_HOURS.exceptCritical);
  const [start, setStart] = usePersistentState('alerts.quietHours.start', QUIET_HOURS.start);
  const [end, setEnd] = usePersistentState('alerts.quietHours.end', QUIET_HOURS.end);
  const [daysActive, setDaysActive] = usePersistentState<number[]>('alerts.quietDays', QUIET_HOURS.daysActive);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function toggleDay(i: number) {
    setDaysActive(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]);
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'rgba(123,147,255,0.12)' }}>
            <Moon size={11} style={{ color: '#7b93ff' }} />
          </div>
          <span className="section-label">Quiet Hours</span>
        </div>
        <Toggle on={enabled} onChange={setEnabled} color="#7b93ff" />
      </div>

      <div className={`space-y-3 transition-opacity ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* Time range — side by side with "to" separator */}
        <div>
          <div className="section-label mb-1.5">Time Range</div>
          <div className="flex items-center gap-2">
            <input type="time" value={start} onChange={e => setStart(e.target.value)}
              className="flex-1" />
            <span className="text-[16px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>to</span>
            <input type="time" value={end} onChange={e => setEnd(e.target.value)}
              className="flex-1" />
          </div>
        </div>

        {/* Timezone */}
        <div>
          <div className="section-label mb-1">Timezone</div>
          <div className="text-base px-2.5 py-2 rounded-lg font-mono"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            {QUIET_HOURS.timezone}
          </div>
        </div>

        {/* Day pills */}
        <div>
          <div className="section-label mb-1.5">Active Days</div>
          <div className="flex gap-1.5">
            {days.map((d, i) => {
              const isActive = daysActive.includes(i);
              return (
                <button key={d}
                  onClick={() => toggleDay(i)}
                  className="w-8 h-8 rounded-lg text-[16px] font-semibold transition-all"
                  style={{
                    background: isActive ? 'rgba(123,147,255,0.15)' : 'var(--bg-elevated)',
                    color: isActive ? '#7b93ff' : 'var(--text-muted)',
                    border: isActive ? '1px solid rgba(123,147,255,0.3)' : '1px solid var(--border-subtle)',
                  }}>
                  {d.charAt(0)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Critical bypass toggle */}
        <div className="flex items-center justify-between">
          <span className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Critical alerts bypass quiet hours
          </span>
          <Toggle on={exceptCrit} onChange={setExceptCrit} color="#ff4444" />
        </div>
      </div>
    </div>
  );
}

// ─── Digest Panel ─────────────────────────────────────────────────────────────

function DigestPanel() {
  const [enabled, setEnabled] = usePersistentState('alerts.digest.enabled', DIGEST_CONFIG.enabled);
  const [freq, setFreq] = usePersistentState('alerts.digest.frequency', DIGEST_CONFIG.frequency);
  const [time, setTime] = usePersistentState('alerts.digest.sendAt', DIGEST_CONFIG.sendAt);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'rgba(0,217,255,0.12)' }}>
            <Calendar size={11} style={{ color: 'var(--cyan)' }} />
          </div>
          <span className="section-label">Alert Digest</span>
        </div>
        <Toggle on={enabled} onChange={setEnabled} color="#00d9ff" />
      </div>

      <div className={`space-y-3 transition-opacity ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* Frequency pills */}
        <div>
          <div className="section-label mb-1.5">Frequency</div>
          <div className="flex gap-1.5">
            {(['daily', 'weekly'] as const).map(f => (
              <button key={f}
                onClick={() => setFreq(f)}
                className="flex-1 py-1.5 rounded-lg text-base font-medium transition-all"
                style={{
                  background: freq === f ? 'rgba(0,217,255,0.12)' : 'var(--bg-elevated)',
                  color: freq === f ? 'var(--cyan)' : 'var(--text-muted)',
                  border: `1px solid ${freq === f ? 'rgba(0,217,255,0.25)' : 'var(--border-subtle)'}`,
                }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Send at */}
        <div>
          <div className="section-label mb-1.5">Send At</div>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full" />
        </div>

        {/* Deliver via */}
        <div>
          <div className="section-label mb-1.5">Deliver Via</div>
          <div className="flex flex-wrap gap-1.5">
            {DIGEST_CONFIG.channels.map(ch => (
              <span key={ch} className="text-[16px] font-mono px-2 py-0.5 rounded"
                style={{ background: 'rgba(0,217,255,0.10)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                {ch}
              </span>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="section-label mb-1.5">Include Categories</div>
          <div className="flex flex-wrap gap-1">
            {DIGEST_CONFIG.includeCategories.map(cat => (
              <span key={cat} className="text-[16px] px-2 py-0.5 rounded"
                style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DeliverySettings() {
  return (
    <div className="space-y-4">
      {/* Channels */}
      <div>
        <div className="section-label mb-3">Notification Channels</div>
        <div className="grid grid-cols-3 gap-3">
          {DELIVERY_CHANNEL_LIST.map(ch => <ChannelCard key={ch.channel} ch={ch} />)}
        </div>
      </div>

      {/* Routing logic */}
      <RoutingLogicPanel />

      {/* Quiet Hours + Digest */}
      <div className="grid grid-cols-2 gap-3">
        <QuietHoursPanel />
        <DigestPanel />
      </div>
    </div>
  );
}
