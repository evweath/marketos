'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { TRACKING_SETTINGS } from '@/lib/settingsData';

const ALL_META_EVENTS = [
  'Purchase',
  'AddToCart',
  'ViewContent',
  'Lead',
  'CompleteRegistration',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Search',
  'Subscribe',
  'Contact',
];

const ALL_ENHANCED_FIELDS = [
  { id: 'email',   label: 'Email address' },
  { id: 'phone',   label: 'Phone number' },
  { id: 'address', label: 'Street address' },
  { id: 'city',    label: 'City' },
  { id: 'state',   label: 'State / Region' },
  { id: 'zip',     label: 'Postal code' },
];

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-base"
      style={{ color: checked ? 'var(--cyan)' : 'var(--text-muted)' }}>
      {checked
        ? <ToggleRight size={22} style={{ color: 'var(--cyan)' }} />
        : <ToggleLeft size={22} style={{ color: 'var(--text-muted)' }} />
      }
      {label}
    </button>
  );
}

interface GaugeProps {
  score: number;
}

function MatchQualityGauge({ score }: GaugeProps) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10d98a' : score >= 40 ? '#ffb347' : '#ff4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border-dim)" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="28" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold font-mono leading-none" style={{ color }}>{score}</span>
          <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>
      <span className="section-label">Match Quality</span>
    </div>
  );
}

interface UTMRow {
  channel: string;
  source: string;
  medium: string;
  campaignTemplate: string;
}

const UTM_DEFAULTS: UTMRow[] = [
  { channel: 'Google Ads',  source: 'google',   medium: 'cpc',     campaignTemplate: '{campaign_name}' },
  { channel: 'Meta Ads',    source: 'facebook',  medium: 'paid-social', campaignTemplate: '{campaign_name}' },
  { channel: 'TikTok Ads',  source: 'tiktok',   medium: 'paid-social', campaignTemplate: '{adgroup_name}'   },
  { channel: 'Email',       source: 'klaviyo',  medium: 'email',   campaignTemplate: '{flow_name}'      },
  { channel: 'Organic',     source: 'organic',  medium: 'organic', campaignTemplate: 'organic'           },
];

export function TrackingSettings() {
  // Meta CAPI state
  const [capiEnabled, setCapiEnabled] = usePersistentState('settings.tracking.capiEnabled', TRACKING_SETTINGS.metaCapi.enabled);
  const [pixelId, setPixelId] = usePersistentState('settings.tracking.pixelId', TRACKING_SETTINGS.metaCapi.pixelId);
  const [accessToken, setAccessToken] = usePersistentState('settings.tracking.accessToken', TRACKING_SETTINGS.metaCapi.accessToken);
  const [showToken, setShowToken] = useState(false);
  const [selectedEvents, setSelectedEvents] = usePersistentState<string[]>('settings.tracking.selectedEvents', TRACKING_SETTINGS.serverSideEvents);
  const [capiTesting, setCapiTesting] = useState(false);
  const [capiTestResult, setCapiTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [capiSaved, setCapiSaved] = useState(false);

  // Google Enhanced state
  const [gEnhancedEnabled, setGEnhancedEnabled] = usePersistentState('settings.tracking.gEnhancedEnabled', TRACKING_SETTINGS.googleEnhanced.enabled);
  const [conversionId, setConversionId] = usePersistentState('settings.tracking.conversionId', TRACKING_SETTINGS.googleEnhanced.conversionId);
  const [conversionLabel, setConversionLabel] = usePersistentState('settings.tracking.conversionLabel', TRACKING_SETTINGS.googleEnhanced.label);
  const [enhancedFields, setEnhancedFields] = usePersistentState<string[]>('settings.tracking.enhancedFields', ['email', 'phone', 'address']);
  const [gTesting, setGTesting] = useState(false);
  const [gTestResult, setGTestResult] = useState<'idle' | 'success'>('idle');
  const [gSaved, setGSaved] = useState(false);

  // UTM state
  const [utmRows, setUtmRows] = usePersistentState<UTMRow[]>('settings.tracking.utmRows', UTM_DEFAULTS);
  const [utmSaved, setUtmSaved] = useState(false);

  const handleTestCapi = () => {
    setCapiTesting(true);
    setCapiTestResult('idle');
    setTimeout(() => {
      setCapiTesting(false);
      setCapiTestResult('success');
      setTimeout(() => setCapiTestResult('idle'), 3000);
    }, 2000);
  };

  const handleTestGoogle = () => {
    setGTesting(true);
    setGTestResult('idle');
    setTimeout(() => {
      setGTesting(false);
      setGTestResult('success');
      setTimeout(() => setGTestResult('idle'), 3000);
    }, 2000);
  };

  const handleSaveCapi = () => {
    setCapiSaved(true);
    setTimeout(() => setCapiSaved(false), 2000);
  };

  const handleSaveGoogle = () => {
    setGSaved(true);
    setTimeout(() => setGSaved(false), 2000);
  };

  const handleSaveUtm = () => {
    setUtmSaved(true);
    setTimeout(() => setUtmSaved(false), 2000);
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
  };

  const toggleField = (field: string) => {
    setEnhancedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  const updateUtmRow = (idx: number, key: keyof UTMRow, value: string) => {
    setUtmRows(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));
  };

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-dim)',
    color: 'var(--text-primary)',
    fontFamily: 'DM Mono',
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Meta CAPI */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-lg">🔌</div>
              <div>
                <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Meta Conversions API</div>
                <div className="text-base mt-0.5" style={{ color: 'var(--text-muted)' }}>Server-side event forwarding for improved attribution</div>
              </div>
            </div>
          </div>
          <ToggleSwitch checked={capiEnabled} onChange={setCapiEnabled} label={capiEnabled ? 'Enabled' : 'Disabled'} />
        </div>

        {capiEnabled && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="section-label mb-1.5 block">Pixel ID</label>
                <input
                  type="text"
                  value={pixelId}
                  onChange={e => setPixelId(e.target.value)}
                  className="w-full text-base px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Access Token</label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={accessToken}
                    onChange={e => setAccessToken(e.target.value)}
                    className="w-full text-base px-3 py-2 pr-9 rounded-lg outline-none"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => setShowToken(s => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}>
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Events */}
            <div>
              <label className="section-label mb-2 block">Events to Forward</label>
              <div className="grid grid-cols-5 gap-2">
                {ALL_META_EVENTS.map(event => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className="text-[16px] px-2 py-1.5 rounded-lg text-left font-mono transition-all"
                    style={selectedEvents.includes(event)
                      ? { background: 'rgba(0,217,255,0.10)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.22)' }
                      : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    {event}
                  </button>
                ))}
              </div>
            </div>

            {/* Match quality + test */}
            <div className="flex items-center gap-6 glass-card-elevated p-4">
              <MatchQualityGauge score={84} />
              <div className="flex flex-col gap-2 flex-1">
                <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Event Match Quality</div>
                <div className="text-base" style={{ color: 'var(--text-secondary)' }}>
                  Your current match quality score is <span style={{ color: '#10d98a' }}>84/100 (Good)</span>. Adding email and phone hashing can improve this to 90+.
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={handleTestCapi}
                    disabled={capiTesting}
                    className="flex items-center gap-1.5 text-base px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
                    style={{ background: 'rgba(123,147,255,0.10)', color: '#7b93ff', border: '1px solid rgba(123,147,255,0.22)' }}>
                    {capiTesting ? <><Loader2 size={12} className="animate-spin" />Testing…</> : 'Send Test Event'}
                  </button>
                  {capiTestResult === 'success' && (
                    <span className="flex items-center gap-1 text-base" style={{ color: '#10d98a' }}>
                      <CheckCircle size={12} />Event received successfully
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveCapi}
                className="text-base px-4 py-2 rounded-lg font-medium transition-all"
                style={capiSaved
                  ? { background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }
                  : { background: 'rgba(0,217,255,0.10)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                {capiSaved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Google Enhanced Conversions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-lg">📡</div>
              <div>
                <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Google Enhanced Conversions</div>
                <div className="text-base mt-0.5" style={{ color: 'var(--text-muted)' }}>Send hashed customer data to improve Google Ads measurement</div>
              </div>
            </div>
          </div>
          <ToggleSwitch checked={gEnhancedEnabled} onChange={setGEnhancedEnabled} label={gEnhancedEnabled ? 'Enabled' : 'Disabled'} />
        </div>

        {gEnhancedEnabled && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="section-label mb-1.5 block">Conversion ID</label>
                <input
                  type="text"
                  value={conversionId}
                  onChange={e => setConversionId(e.target.value)}
                  className="w-full text-base px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Conversion Label</label>
                <input
                  type="text"
                  value={conversionLabel}
                  onChange={e => setConversionLabel(e.target.value)}
                  className="w-full text-base px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Enhanced matching */}
            <div>
              <label className="section-label mb-2 block">Enhanced Matching Fields</label>
              <div className="grid grid-cols-3 gap-2">
                {ALL_ENHANCED_FIELDS.map(field => (
                  <button
                    key={field.id}
                    onClick={() => toggleField(field.id)}
                    className="flex items-center gap-2 text-base px-3 py-2 rounded-lg text-left transition-all"
                    style={enhancedFields.includes(field.id)
                      ? { background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }
                      : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    <div className="w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: enhancedFields.includes(field.id) ? '#00d9ff' : 'var(--border-dim)', background: enhancedFields.includes(field.id) ? 'rgba(0,217,255,0.2)' : 'transparent' }}>
                      {enhancedFields.includes(field.id) && <span style={{ fontSize: 16, color: 'var(--cyan)' }}>✓</span>}
                    </div>
                    {field.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test + save */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestGoogle}
                disabled={gTesting}
                className="flex items-center gap-1.5 text-base px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
                style={{ background: 'rgba(123,147,255,0.10)', color: '#7b93ff', border: '1px solid rgba(123,147,255,0.22)' }}>
                {gTesting ? <><Loader2 size={12} className="animate-spin" />Testing…</> : 'Send Test Conversion'}
              </button>
              {gTestResult === 'success' && (
                <span className="flex items-center gap-1 text-base" style={{ color: '#10d98a' }}>
                  <CheckCircle size={12} />Conversion received
                </span>
              )}
              <div className="ml-auto">
                <button
                  onClick={handleSaveGoogle}
                  className="text-base px-4 py-2 rounded-lg font-medium transition-all"
                  style={gSaved
                    ? { background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }
                    : { background: 'rgba(0,217,255,0.10)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                  {gSaved ? '✓ Saved' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UTM Parameter Defaults */}
      <div className="glass-card p-5">
        <div className="mb-4">
          <div className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>UTM Parameter Defaults</div>
          <div className="text-base" style={{ color: 'var(--text-muted)' }}>Default UTM values applied to campaign links per channel</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Channel', 'utm_source', 'utm_medium', 'utm_campaign'].map(h => (
                  <th key={h} className="section-label text-left pb-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {utmRows.map((row, idx) => (
                <tr key={row.channel}>
                  <td className="py-2 pr-4">
                    <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{row.channel}</span>
                  </td>
                  {(['source', 'medium', 'campaignTemplate'] as const).map(key => (
                    <td key={key} className="py-2 pr-4">
                      <input
                        type="text"
                        value={row[key]}
                        onChange={e => updateUtmRow(idx, key, e.target.value)}
                        className="w-full text-base px-2.5 py-1.5 rounded-md outline-none"
                        style={{ ...inputStyle, fontSize: 16 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveUtm}
            className="text-base px-4 py-2 rounded-lg font-medium transition-all"
            style={utmSaved
              ? { background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }
              : { background: 'rgba(0,217,255,0.10)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
            {utmSaved ? '✓ Saved' : 'Save Defaults'}
          </button>
        </div>
      </div>
    </div>
  );
}
