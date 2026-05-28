'use client';

import { useState } from 'react';
import { DELIVERY_CHANNELS, QUIET_HOURS, DIGEST_CONFIG, CATEGORY_CONFIG } from '@/lib/alertData';
import type { DeliveryChannelConfig } from '@/lib/alertData';
import { CheckCircle, XCircle, AlertCircle, Send, Moon, Calendar, Loader2 } from 'lucide-react';

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

function ChannelCard({ ch }: { ch: DeliveryChannelConfig }) {
  const [enabled, setEnabled] = useState(ch.enabled);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null);

  const ts = testResult
    ? TEST_STATUS_CONFIG[testResult]
    : ch.testStatus
      ? TEST_STATUS_CONFIG[ch.testStatus]
      : null;

  const iconBg = CHANNEL_ICON_BG[ch.channel] ?? 'rgba(123,147,255,0.12)';
  const iconColor = CHANNEL_ICON_COLOR[ch.channel] ?? '#7b93ff';

  const runTest = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1000));
    setTestResult('ok');
    setTesting(false);
  };

  return (
    <div className="rounded-xl p-3.5 transition-all"
      style={{
        background: enabled ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border: `1px solid ${enabled ? 'var(--border-dim)' : 'var(--border-subtle)'}`,
        opacity: enabled ? 1 : 0.6,
      }}>
      {/* Top row: icon + name + toggle */}
      <div className="flex items-center gap-3 mb-3">
        {/* Channel icon in colored circle */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
          style={{ background: iconBg }}>
          <span style={{ color: iconColor }}>{ch.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ch.label}</div>
          {ts && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px]">
              <ts.Icon size={9} style={{ color: ts.color }} />
              <span style={{ color: ts.color }}>{ts.label}</span>
            </div>
          )}
        </div>

        <Toggle on={enabled} onChange={setEnabled} color={iconColor} />
      </div>

      {/* Destination input — relies on globals.css input styling */}
      <div className="mb-3">
        <div className="section-label mb-1">Destination</div>
        <input
          type="text"
          defaultValue={ch.destination}
          disabled={!enabled}
          className="w-full"
        />
      </div>

      {/* Test button */}
      <button
        onClick={runTest}
        disabled={!enabled || testing}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          background: !enabled ? 'transparent' : testing ? 'rgba(0,217,255,0.04)' : 'rgba(0,217,255,0.06)',
          color: !enabled ? 'var(--text-muted)' : '#00d9ff',
          border: `1px solid ${!enabled ? 'transparent' : 'rgba(0,217,255,0.15)'}`,
          cursor: !enabled || testing ? 'not-allowed' : 'pointer',
        }}>
        {testing
          ? <><Loader2 size={11} className="animate-spin" /> Sending...</>
          : <><Send size={11} /> Send Test</>}
      </button>
    </div>
  );
}

// ─── Quiet Hours ──────────────────────────────────────────────────────────────

function QuietHoursPanel() {
  const [enabled, setEnabled] = useState(QUIET_HOURS.enabled);
  const [exceptCrit, setExceptCrit] = useState(QUIET_HOURS.exceptCritical);
  const [start, setStart] = useState(QUIET_HOURS.start);
  const [end, setEnd] = useState(QUIET_HOURS.end);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
            <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>to</span>
            <input type="time" value={end} onChange={e => setEnd(e.target.value)}
              className="flex-1" />
          </div>
        </div>

        {/* Timezone */}
        <div>
          <div className="section-label mb-1">Timezone</div>
          <div className="text-xs px-2.5 py-2 rounded-lg font-mono"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            {QUIET_HOURS.timezone}
          </div>
        </div>

        {/* Day pills */}
        <div>
          <div className="section-label mb-1.5">Active Days</div>
          <div className="flex gap-1.5">
            {days.map((d, i) => {
              const isActive = QUIET_HOURS.daysActive.includes(i);
              return (
                <button key={d}
                  className="w-8 h-8 rounded-lg text-[10px] font-semibold transition-all"
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
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
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
  const [enabled, setEnabled] = useState(DIGEST_CONFIG.enabled);
  const [freq, setFreq] = useState(DIGEST_CONFIG.frequency);
  const [time, setTime] = useState(DIGEST_CONFIG.sendAt);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'rgba(0,217,255,0.12)' }}>
            <Calendar size={11} style={{ color: '#00d9ff' }} />
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
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: freq === f ? 'rgba(0,217,255,0.12)' : 'var(--bg-elevated)',
                  color: freq === f ? '#00d9ff' : 'var(--text-muted)',
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
              <span key={ch} className="text-[10px] font-mono px-2 py-0.5 rounded"
                style={{ background: 'rgba(0,217,255,0.10)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.2)' }}>
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
              <span key={cat} className="text-[10px] px-2 py-0.5 rounded"
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
          {DELIVERY_CHANNELS.map(ch => <ChannelCard key={ch.channel} ch={ch} />)}
        </div>
      </div>

      {/* Quiet Hours + Digest */}
      <div className="grid grid-cols-2 gap-3">
        <QuietHoursPanel />
        <DigestPanel />
      </div>
    </div>
  );
}
