'use client';

import { useRef, useState } from 'react';
import { Upload, Trash2, AlertTriangle, Check, Loader2, Bold, Italic, RotateCcw, Sun, Moon, Info } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { GENERAL_SETTINGS, NOTIFICATION_PREFERENCES } from '@/lib/settingsData';
import type { NotificationRule } from '@/lib/settingsData';
import { useTheme, DEFAULT_APPEARANCE } from '@/lib/ThemeProvider';
import { useStores } from '@/lib/storeScope';

const APP_VERSION = '1.0.0';
const APP_BUILD_DATE = '2026-07-15';

const SEVERITY_COLOR: Record<string, string> = { critical: '#ff4444', warning: '#ffb347', info: '#7b93ff' };

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Amsterdam',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
  'UTC',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD'];
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const LANGUAGES = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'pt-BR', 'ja-JP'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DATE_RANGES = ['7 days', '14 days', '30 days', '60 days', '90 days'];
const FREQUENCIES = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'];
const RETENTION_OPTIONS = ['30 days', '60 days', '90 days', '180 days', '1 year', '2 years', '5 years'];
const FONT_SCALE_OPTIONS = [
  { label: 'Small', value: 0.9 },
  { label: 'Medium', value: 1 },
  { label: 'Large', value: 1.15 },
  { label: 'X-Large', value: 1.3 },
];

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-dim)',
  color: 'var(--text-primary)',
};

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</div>
      <div className="text-base mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</div>
    </div>
  );
}

function SaveButton({ saved, loading, onClick }: { saved: boolean; loading?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-base px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
      style={saved
        ? { background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }
        : { background: 'rgba(0,217,255,0.10)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
      {loading ? <><Loader2 size={13} className="animate-spin" />Saving…</>
        : saved ? <><Check size={13} />Saved!</>
        : 'Save Changes'}
    </button>
  );
}

interface AppearanceColorFieldProps {
  label: string;
  value: string | null;
  defaultHint: string;
  onChange: (v: string) => void;
  onReset: () => void;
}

function AppearanceColorField({ label, value, defaultHint, onChange, onReset }: AppearanceColorFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="section-label">{label}</label>
        {value && (
          <button onClick={onReset} className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
            Reset
          </button>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          value={value ?? defaultHint}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg cursor-pointer shrink-0"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', padding: 4 }}
        />
        <input
          type="text"
          value={value ?? ''}
          placeholder={defaultHint}
          onChange={e => onChange(e.target.value)}
          className="flex-1 min-w-0 text-base px-3 py-2 rounded-lg outline-none font-mono"
          style={inputStyle}
        />
      </div>
    </div>
  );
}

function PillToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-base font-medium transition-all"
      style={{
        background: active ? 'rgba(0,217,255,0.12)' : 'var(--bg-elevated)',
        color: active ? 'var(--cyan)' : 'var(--text-muted)',
        border: `1px solid ${active ? 'rgba(0,217,255,0.3)' : 'var(--border-subtle)'}`,
      }}>
      {children}
    </button>
  );
}

export function GeneralSettings() {
  const { theme, toggleTheme, appearance, setAppearance } = useTheme();
  const [stores] = useStores();

  // Display preferences
  const [defaultStore, setDefaultStore] = usePersistentState('settings.general.defaultStore', 'all');

  // Business info
  const [businessName, setBusinessName] = usePersistentState('settings.general.businessName', GENERAL_SETTINGS.businessName);
  const [timezone, setTimezone] = usePersistentState('settings.general.timezone', GENERAL_SETTINGS.timezone);
  const [currency, setCurrency] = usePersistentState('settings.general.currency', GENERAL_SETTINGS.currency);
  const [fiscalMonth, setFiscalMonth] = usePersistentState('settings.general.fiscalMonth', GENERAL_SETTINGS.fiscalYearStartMonth);
  const [dateFormat, setDateFormat] = usePersistentState('settings.general.dateFormat', GENERAL_SETTINGS.dateFormat);
  const [language, setLanguage] = usePersistentState('settings.general.language', GENERAL_SETTINGS.language);
  const [bizSaved, setBizSaved] = useState(false);

  // Branding
  const [brandColor, setBrandColor] = usePersistentState('settings.general.brandColor', '#00d9ff');
  const [footerText, setFooterText] = usePersistentState('settings.general.footerText', 'Generated by MarketOS · Confidential');
  const [brandSaved, setBrandSaved] = useState(false);
  const [logoName, setLogoName] = usePersistentState<string | null>('settings.general.logoName', null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Reporting
  const [defaultRange, setDefaultRange] = usePersistentState('settings.general.defaultRange', '30 days');
  const [autoSend, setAutoSend] = usePersistentState('settings.general.autoSend', true);
  const [frequency, setFrequency] = usePersistentState('settings.general.frequency', 'Weekly');
  const [recipientEmails, setRecipientEmails] = usePersistentState('settings.general.recipientEmails', 'rachel@marketosbakery.com, derek@marketosbakery.com');
  const [reportSaved, setReportSaved] = useState(false);

  // Data
  const [retention, setRetention] = usePersistentState('settings.general.retention', '1 year');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  // Delete confirmation
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm1' | 'confirm2' | 'deleted'>('idle');
  const [deleteInput, setDeleteInput] = useState('');

  // Notifications (v2: severity-based, includes Teams)
  const [notifications, setNotifications] = usePersistentState<NotificationRule[]>('settings.general.notifications.v2', NOTIFICATION_PREFERENCES);
  const [notifSaved, setNotifSaved] = useState(false);

  const makeSimpleSaver = (setter: (v: boolean) => void) => () => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleExport = () => {
    setExportLoading(true);
    setTimeout(() => {
      const payload = {
        exportedAt: new Date().toISOString(),
        business: { businessName, timezone, currency, fiscalYearStartMonth: fiscalMonth, dateFormat, language },
        branding: { brandColor, footerText, logo: logoName },
        reporting: { defaultRange, autoSend, frequency, recipientEmails },
        data: { retention },
        notifications,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'marketos-account-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportLoading(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    }, 2500);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoName(file.name);
  };

  const toggleNotif = (id: string, channel: 'email' | 'sms' | 'slack' | 'teams') => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, [channel]: !n[channel] } : n));
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Business Information */}
      <div className="glass-card p-5">
        <SectionHeader title="Business Information" description="Core account details used across all reports and integrations" />
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="col-span-2">
            <label className="section-label mb-1.5 block">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="section-label mb-1.5 block">Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="section-label mb-1.5 block">Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="section-label mb-1.5 block">Fiscal Year Start</label>
            <select
              value={fiscalMonth}
              onChange={e => setFiscalMonth(Number(e.target.value))}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="section-label mb-1.5 block">Date Format</label>
            <select
              value={dateFormat}
              onChange={e => setDateFormat(e.target.value)}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}>
              {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="section-label mb-1.5 block">Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <SaveButton saved={bizSaved} onClick={makeSimpleSaver(setBizSaved)} />
        </div>
      </div>

      {/* Branding */}
      <div className="glass-card p-5">
        <SectionHeader title="Branding" description="Customize how reports look when shared with clients or stakeholders" />
        <div className="flex flex-col gap-4 mb-5">
          {/* Logo upload */}
          <div>
            <label className="section-label mb-1.5 block">Report Logo</label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              onChange={handleLogoChange}
              className="hidden"
            />
            <div
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center justify-center rounded-xl py-8 cursor-pointer transition-all hover:bg-white/[0.02]"
              style={{ border: `1px dashed ${logoName ? 'rgba(16,217,138,0.4)' : 'var(--border-dim)'}` }}>
              <div className="flex flex-col items-center gap-2">
                {logoName ? <Check size={18} style={{ color: '#10d98a' }} /> : <Upload size={18} style={{ color: 'var(--text-muted)' }} />}
                <span className="text-base" style={{ color: logoName ? '#10d98a' : 'var(--text-muted)' }}>
                  {logoName ? `${logoName} selected — click to replace` : 'Click to upload logo — PNG, SVG, up to 2MB'}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label mb-1.5 block">Brand Color</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', padding: 4 }}
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                  className="flex-1 text-base px-3 py-2 rounded-lg outline-none font-mono"
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className="section-label mb-1.5 block">Report Footer Text</label>
              <input
                type="text"
                value={footerText}
                onChange={e => setFooterText(e.target.value)}
                className="w-full text-base px-3 py-2 rounded-lg outline-none"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <SaveButton saved={brandSaved} onClick={makeSimpleSaver(setBrandSaved)} />
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card p-5">
        <SectionHeader title="Appearance" description="Customize colors, font size, and text style — applies while the Light theme is active" />
        {theme === 'dark' && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-4"
            style={{ background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.2)' }}>
            <AlertTriangle size={14} style={{ color: '#ffb347' }} />
            <span className="text-base" style={{ color: '#ffb347' }}>
              These changes will apply once the Light theme is selected.
            </span>
          </div>
        )}
        <div className="flex flex-col gap-4 mb-5">
          <div className="grid grid-cols-3 gap-4">
            <AppearanceColorField
              label="Background Color"
              value={appearance.bgColor}
              defaultHint="#eef0f6"
              onChange={v => setAppearance(a => ({ ...a, bgColor: v }))}
              onReset={() => setAppearance(a => ({ ...a, bgColor: null }))}
            />
            <AppearanceColorField
              label="Menu Color"
              value={appearance.menuColor}
              defaultHint="#ffffff"
              onChange={v => setAppearance(a => ({ ...a, menuColor: v }))}
              onReset={() => setAppearance(a => ({ ...a, menuColor: null }))}
            />
            <AppearanceColorField
              label="Text Color"
              value={appearance.textColor}
              defaultHint="#10142a"
              onChange={v => setAppearance(a => ({ ...a, textColor: v }))}
              onReset={() => setAppearance(a => ({ ...a, textColor: null }))}
            />
          </div>
          <div>
            <label className="section-label mb-1.5 block">Font Size</label>
            <div className="flex gap-2">
              {FONT_SCALE_OPTIONS.map(opt => (
                <PillToggle
                  key={opt.label}
                  active={appearance.fontScale === opt.value}
                  onClick={() => setAppearance(a => ({ ...a, fontScale: opt.value }))}>
                  {opt.label}
                </PillToggle>
              ))}
            </div>
          </div>
          <div>
            <label className="section-label mb-1.5 block">Text Style</label>
            <div className="flex gap-2">
              <PillToggle active={appearance.bold} onClick={() => setAppearance(a => ({ ...a, bold: !a.bold }))}>
                <span className="flex items-center gap-1.5"><Bold size={12} />Bold</span>
              </PillToggle>
              <PillToggle active={appearance.italic} onClick={() => setAppearance(a => ({ ...a, italic: !a.italic }))}>
                <span className="flex items-center gap-1.5"><Italic size={12} />Italic</span>
              </PillToggle>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setAppearance(DEFAULT_APPEARANCE)}
            className="flex items-center gap-1.5 text-base px-4 py-2 rounded-lg font-medium transition-all"
            style={{ background: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            <RotateCcw size={13} />
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Display & Preferences */}
      <div className="glass-card p-5">
        <SectionHeader title="Display & Preferences" description="Theme and default view when the app loads" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="section-label mb-1.5 block">Theme</label>
            <div className="flex gap-2">
              {([
                { key: 'light', label: 'Light', Icon: Sun },
                { key: 'dark',  label: 'Dark',  Icon: Moon },
              ] as const).map(t => {
                const active = theme === t.key;
                return (
                  <button key={t.key}
                    onClick={() => { if (!active) toggleTheme(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-base font-medium transition-all"
                    style={{
                      background: active ? 'rgba(0,217,255,0.12)' : 'var(--bg-elevated)',
                      color: active ? 'var(--cyan)' : 'var(--text-muted)',
                      border: `1px solid ${active ? 'rgba(0,217,255,0.3)' : 'var(--border-subtle)'}`,
                    }}>
                    <t.Icon size={13} />{t.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="section-label mb-1.5 block">Default Store on Load</label>
            <select
              value={defaultStore}
              onChange={e => setDefaultStore(e.target.value)}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}>
              <option value="all">All Stores (group view)</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Reporting */}
      <div className="glass-card p-5">
        <SectionHeader title="Reporting Defaults" description="Configure default date ranges, scheduled reports, and recipients" />
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="section-label mb-1.5 block">Default Date Range</label>
            <select
              value={defaultRange}
              onChange={e => setDefaultRange(e.target.value)}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}>
              {DATE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="section-label mb-1.5 block">Report Frequency</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="section-label mb-1.5 block">Recipient Emails (comma-separated)</label>
            <input
              type="text"
              value={recipientEmails}
              onChange={e => setRecipientEmails(e.target.value)}
              className="w-full text-base px-3 py-2 rounded-lg outline-none"
              style={inputStyle}
            />
          </div>
          <div className="col-span-2">
            <label className="section-label mb-2 block">Auto-send Reports</label>
            <button
              onClick={() => setAutoSend(s => !s)}
              className="flex items-center gap-2.5 text-base"
              style={{ color: autoSend ? 'var(--cyan)' : 'var(--text-muted)' }}>
              <div className="relative w-10 h-5 rounded-full transition-all"
                style={{ background: autoSend ? 'rgba(0,217,255,0.25)' : 'var(--bg-overlay)', border: `1px solid ${autoSend ? 'rgba(0,217,255,0.4)' : 'var(--border-dim)'}` }}>
                <div className="absolute top-0.5 transition-all w-4 h-4 rounded-full"
                  style={{ left: autoSend ? '1.35rem' : '0.125rem', background: autoSend ? '#00d9ff' : 'var(--text-muted)' }} />
              </div>
              {autoSend ? 'Enabled — reports sent automatically' : 'Disabled'}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <SaveButton saved={reportSaved} onClick={makeSimpleSaver(setReportSaved)} />
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Notification Preferences</div>
          <div className="text-base mt-0.5" style={{ color: 'var(--text-muted)' }}>Route each alert severity to the channels that should receive it — mirrors the Alerts module’s delivery model</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="section-label text-left px-5 py-3 w-full">Severity</th>
                {(['Email', 'SMS', 'Slack', 'Teams'] as const).map(ch => (
                  <th key={ch} className="section-label px-5 py-3 text-center whitespace-nowrap">{ch}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notifications.map((rule, i) => (
                <tr key={rule.id}
                  style={{ borderBottom: i < notifications.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: SEVERITY_COLOR[rule.severity] }} />
                      <div>
                        <span className="text-base font-semibold" style={{ color: SEVERITY_COLOR[rule.severity] }}>{rule.label}</span>
                        <div className="text-[16px]" style={{ color: 'var(--text-muted)' }}>{rule.description}</div>
                      </div>
                    </div>
                  </td>
                  {(['email', 'sms', 'slack', 'teams'] as const).map(ch => (
                    <td key={ch} className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleNotif(rule.id, ch)}
                        className="w-5 h-5 rounded flex items-center justify-center mx-auto transition-all"
                        style={rule[ch]
                          ? { background: 'rgba(0,217,255,0.15)', border: '1px solid rgba(0,217,255,0.3)' }
                          : { background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                        {rule[ch] && <Check size={10} style={{ color: 'var(--cyan)' }} />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 flex justify-end border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <SaveButton saved={notifSaved} onClick={makeSimpleSaver(setNotifSaved)} />
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="glass-card p-5">
        <SectionHeader title="Data & Privacy" description="Manage data retention, exports, and account deletion" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="section-label mb-1.5 block">Data Retention Period</label>
              <select
                value={retention}
                onChange={e => setRetention(e.target.value)}
                className="text-base px-3 py-2 rounded-lg outline-none"
                style={{ ...inputStyle, minWidth: 160 }}>
                {RETENTION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex items-end h-full">
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="flex items-center gap-1.5 text-base px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                style={exportDone
                  ? { background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }
                  : { background: 'rgba(123,147,255,0.10)', color: '#7b93ff', border: '1px solid rgba(123,147,255,0.22)' }}>
                {exportLoading
                  ? <><Loader2 size={13} className="animate-spin" />Preparing…</>
                  : exportDone
                  ? <><Check size={13} />Export Ready</>
                  : 'Export All Data'}
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl p-4 mt-2" style={{ background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} style={{ color: '#ff4444' }} />
              <span className="text-base font-semibold" style={{ color: '#ff4444' }}>Danger Zone</span>
            </div>
            <p className="text-base mb-3" style={{ color: 'var(--text-secondary)' }}>
              Deleting your account will permanently remove all data, integrations, team members, and settings.
              This action cannot be undone.
            </p>

            {deleteStep === 'idle' && (
              <button
                onClick={() => setDeleteStep('confirm1')}
                className="text-base px-3 py-1.5 rounded-lg font-medium transition-all"
                style={{ background: 'rgba(255,68,68,0.10)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.25)' }}>
                Delete Account
              </button>
            )}

            {deleteStep === 'confirm1' && (
              <div className="flex flex-col gap-2">
                <p className="text-base" style={{ color: '#ffb347' }}>
                  Are you sure? This will delete all 3 stores, 21 integrations, and 5 team members.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteStep('confirm2')}
                    className="text-base px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: 'rgba(255,68,68,0.15)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                    Yes, I'm sure
                  </button>
                  <button
                    onClick={() => setDeleteStep('idle')}
                    className="text-base px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 'confirm2' && (
              <div className="flex flex-col gap-2">
                <p className="text-base" style={{ color: '#ff4444' }}>
                  Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm permanent deletion:
                </p>
                <input
                  type="text"
                  placeholder="DELETE MY ACCOUNT"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  className="text-base px-3 py-2 rounded-lg outline-none font-mono"
                  style={{ background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}
                />
                <div className="flex gap-2">
                  <button
                    disabled={deleteInput !== 'DELETE MY ACCOUNT'}
                    onClick={() => setDeleteStep('deleted')}
                    className="text-base px-3 py-1.5 rounded-lg font-medium disabled:opacity-30"
                    style={{ background: 'rgba(255,68,68,0.2)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.35)' }}>
                    Permanently Delete Everything
                  </button>
                  <button
                    onClick={() => { setDeleteStep('idle'); setDeleteInput(''); }}
                    className="text-base px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 'deleted' && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(255,68,68,0.10)', border: '1px solid rgba(255,68,68,0.25)' }}>
                <AlertTriangle size={14} style={{ color: '#ff4444' }} />
                <span className="text-base" style={{ color: '#ff4444' }}>
                  Account scheduled for deletion — all data will be permanently removed within 24 hours.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-5">
        <SectionHeader title="About" description="Application version and build information" />
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Version',    value: APP_VERSION },
            { label: 'Build Date', value: APP_BUILD_DATE },
            { label: 'Product',    value: 'MarketOS' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="section-label mb-1">{item.label}</div>
              <div className="text-base font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 mt-4 text-[16px]" style={{ color: 'var(--text-muted)' }}>
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>MarketOS marketing-operations console. All data shown is stored locally in your browser; use the Data section to load sample data or reset to an empty state.</span>
        </div>
      </div>
    </div>
  );
}
