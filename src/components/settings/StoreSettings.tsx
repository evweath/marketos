'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { RefreshCw, ExternalLink, Plus, CheckCircle, Loader2, Webhook, Eye, EyeOff, Save, X, KeyRound, Download, Plug, Wifi, XCircle } from 'lucide-react';
import { TRAFFIC, CONVERSIONS } from '@/lib/mockData';
import {
  INITIAL_STORE_CONNECTIONS,
  emptyConnections,
  withDefaults,
  type ConnectionKey,
  type StoreConnection,
} from '@/lib/storeConnectionsData';
import { useStores, STORE_COLORS, type StoreRecord } from '@/lib/storeScope';
import { StoreConnectionsPanel } from './StoreConnectionsPanel';

// `StoreData` is kept as an alias so the rest of this file (and future
// diffs) reads naturally — the canonical shape/seed data now lives in
// `storeScope.ts` so the Sidebar and every store-scoped page shares the
// exact same persisted list instead of each maintaining its own copy.
type StoreData = StoreRecord;

interface Credentials {
  domain: string;
  accessToken: string;
  apiSecret: string;
  webhookSecret: string;
}

function formatSyncTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

function maskToken(value: string): string {
  if (!value) return '—';
  if (value.length <= 8) return '•'.repeat(value.length);
  return value.slice(0, 6) + '••••' + value.slice(-4);
}

function downloadAnalyticsCsv(store: StoreData) {
  const traffic = TRAFFIC[store.id];
  const conversions = CONVERSIONS[store.id];
  const daily = traffic?.daily ?? [];
  const rows: string[] = [];

  rows.push(`Shopify Analytics Export — ${store.name}`);
  rows.push(`Domain,${store.domain}`);
  rows.push(`Generated At,${new Date().toISOString()}`);
  rows.push('');
  rows.push('Daily Traffic');
  rows.push('Date,Sessions,Pageviews,Users');
  if (daily.length === 0) {
    rows.push('No traffic history available yet');
  } else {
    for (const day of daily) rows.push(`${day.date},${day.sessions},${day.pageviews},${day.users}`);
  }
  rows.push('');
  rows.push('Conversion Summary');
  rows.push('Overall Conversion Rate,Avg Order Value,Revenue Today,Orders Today');
  rows.push(conversions
    ? `${conversions.overallRate}%,${conversions.avgOrderValue},${conversions.revenueToday},${conversions.ordersToday}`
    : '0%,0,0,0');
  rows.push('');
  rows.push('Conversion Funnel');
  rows.push('Step,Count,Conversion Rate');
  for (const step of conversions?.funnel ?? []) rows.push(`${step.label},${step.count},${step.conversionRate}%`);

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${store.domain.replace(/[^a-zA-Z0-9.-]+/g, '-')}-analytics.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface SecretFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

function SecretField({ label, placeholder, value, onChange, hint }: SecretFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div className='flex items-center justify-between mb-1.5'>
        <label className='section-label'>{label}</label>
        {hint && <span className='text-[16px]' style={{ color: 'var(--text-muted)' }}>{hint}</span>}
      </div>
      <div className='relative'>
        <input
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete='off'
          spellCheck={false}
          className='w-full text-base px-3 py-2 pr-9 rounded-lg outline-none'
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)',
            fontFamily: 'DM Mono',
          }}
        />
        <button
          type='button'
          onClick={() => setVisible(v => !v)}
          className='absolute right-2.5 top-1/2 -translate-y-1/2'
          style={{ color: 'var(--text-muted)' }}
        >
          {visible ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
    </div>
  );
}

interface StoreCardProps {
  store: StoreData;
  savedCreds: Credentials | null;
  onSaveCreds: (id: string, creds: Credentials) => void;
  connections: Record<ConnectionKey, StoreConnection>;
  onChangeConnection: (storeId: string, key: ConnectionKey, patch: Partial<StoreConnection>) => void;
}

function StoreCard({ store, savedCreds, onSaveCreds, connections, onChangeConnection }: StoreCardProps) {
  const [syncing, setSyncing]         = useState(false);
  const [justSynced, setJustSynced]   = useState(false);
  const [editing, setEditing]         = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [justSaved, setJustSaved]     = useState(false);
  const [testing, setTesting]         = useState(false);
  const [testResult, setTestResult]   = useState<{ success: boolean; message: string } | null>(null);

  const [creds, setCreds] = useState<Credentials>({
    domain:        savedCreds?.domain        ?? store.domain,
    accessToken:   savedCreds?.accessToken   ?? '',
    apiSecret:     savedCreds?.apiSecret     ?? '',
    webhookSecret: savedCreds?.webhookSecret ?? '',
  });

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    }, 2000);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSaveCreds(store.id, creds);
      setSaving(false);
      setJustSaved(true);
      setTestResult(null);
      setTimeout(() => { setJustSaved(false); setEditing(false); }, 1400);
    }, 900);
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTestResult(null);
    const domain = savedCreds?.domain ?? creds.domain ?? store.domain;
    const token = savedCreds?.accessToken ?? creds.accessToken;
    setTimeout(() => {
      setTesting(false);
      if (!token) {
        setTestResult({
          success: false,
          message: `No Admin API access token is configured for ${domain}. Add credentials under "Edit Credentials" and try again.`,
        });
        return;
      }
      if (store.status === 'error') {
        setTestResult({
          success: false,
          message: `401 Unauthorized — Shopify rejected the Admin API access token for ${domain}. The token may be invalid, expired, or missing required scopes (read_orders, read_products). Re-enter a valid token under "Edit Credentials" and test again.`,
        });
        return;
      }
      const latencyMs = 180 + Math.floor(Math.random() * 220);
      setTestResult({
        success: true,
        message: `Connected to ${domain} in ${latencyMs}ms. Verified read access to Orders, Products, and Checkouts endpoints.`,
      });
    }, 1100);
  };

  const handleCancel = () => {
    setCreds({
      domain:        savedCreds?.domain        ?? store.domain,
      accessToken:   savedCreds?.accessToken   ?? '',
      apiSecret:     savedCreds?.apiSecret     ?? '',
      webhookSecret: savedCreds?.webhookSecret ?? '',
    });
    setEditing(false);
  };

  const hasToken = !!(savedCreds?.accessToken || creds.accessToken);

  return (
    <div className='glass-card p-5'>
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='w-3 h-3 rounded-full flex-shrink-0 mt-0.5' style={{ background: store.color }} />
          <div>
            <div className='font-semibold text-base' style={{ color: 'var(--text-primary)' }}>{store.name}</div>
            <div className='text-base font-mono mt-0.5' style={{ color: 'var(--text-muted)' }}>
              {savedCreds?.domain ?? store.domain}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {store.status === 'connected'
            ? <span className='badge-ok text-[16px] px-2 py-0.5 rounded-full font-mono'>Connected</span>
            : <span className='badge-critical text-[16px] px-2 py-0.5 rounded-full font-mono'>Auth Error</span>
          }
          <a
            href={`https://${savedCreds?.domain ?? store.domain}`}
            target='_blank'
            rel='noopener noreferrer'
            className='p-1.5 rounded-lg transition-all hover:bg-white/5'
            style={{ color: 'var(--text-muted)' }}
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-3 mb-4'>
        {[
          { label: 'Products Synced',  value: store.products.toLocaleString() },
          { label: 'Orders (30d)',      value: store.orders30d.toLocaleString() },
          { label: 'Active Campaigns',  value: store.activeCampaigns },
        ].map(stat => (
          <div key={stat.label} className='glass-card-elevated p-3 text-center'>
            <div className='data-value text-lg font-semibold' style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
            <div className='section-label mt-0.5'>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Credential summary row */}
      <div className='flex items-center justify-between mb-4 px-1'>
        <div className='flex items-center gap-2'>
          <KeyRound size={12} style={{ color: 'var(--text-muted)' }} />
          <span className='section-label'>Access Token</span>
          <span
            className='text-base font-mono px-2 py-0.5 rounded'
            style={{ background: 'var(--bg-elevated)', color: hasToken ? 'var(--text-secondary)' : '#ff4444', border: '1px solid var(--border-subtle)' }}
          >
            {hasToken ? maskToken(savedCreds?.accessToken ?? creds.accessToken) : 'Not set'}
          </span>
        </div>
        <span className='text-base font-mono' style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
          Last sync: {formatSyncTime(store.lastSync)}
        </span>
      </div>

      {/* Edit Credentials form */}
      {editing && (
        <div
          className='rounded-xl p-4 mb-4 flex flex-col gap-3'
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}
        >
          <div className='flex items-center gap-2 mb-1'>
            <KeyRound size={13} style={{ color: 'var(--cyan)' }} />
            <span className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>Shopify Credentials</span>
          </div>

          {/* Domain */}
          <div>
            <label className='section-label mb-1.5 block'>Store Domain</label>
            <input
              type='text'
              placeholder='your-store.myshopify.com'
              value={creds.domain}
              onChange={e => setCreds(c => ({ ...c, domain: e.target.value }))}
              className='w-full text-base px-3 py-2 rounded-lg outline-none'
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', fontFamily: 'DM Mono' }}
            />
          </div>

          <SecretField
            label='Admin API Access Token'
            placeholder='shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            hint='Settings → Apps → Private apps'
            value={creds.accessToken}
            onChange={v => setCreds(c => ({ ...c, accessToken: v }))}
          />
          <SecretField
            label='API Secret Key'
            placeholder='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            hint='Client secret from app credentials'
            value={creds.apiSecret}
            onChange={v => setCreds(c => ({ ...c, apiSecret: v }))}
          />
          <SecretField
            label='Webhook Secret'
            placeholder='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            hint='Used to verify webhook payloads'
            value={creds.webhookSecret}
            onChange={v => setCreds(c => ({ ...c, webhookSecret: v }))}
          />

          <div className='flex gap-2 pt-1'>
            <button
              onClick={handleSave}
              disabled={saving || justSaved}
              className='flex items-center gap-1.5 flex-1 justify-center py-2 rounded-lg text-base font-semibold transition-all disabled:opacity-70'
              style={justSaved
                ? { background: 'rgba(16,217,138,0.15)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.3)' }
                : { background: 'rgba(0,217,255,0.12)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.25)' }}
            >
              {saving    ? <><Loader2 size={12} className='animate-spin' />Saving…</>
              : justSaved ? <><CheckCircle size={12} />Saved</>
              : <><Save size={12} />Save Credentials</>}
            </button>
            <button
              onClick={handleCancel}
              className='px-3 py-2 rounded-lg text-base transition-all'
              style={{ background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Webhooks */}
      <div className='glass-card-elevated p-3 mb-4'>
        <div className='flex items-center gap-2 mb-2'>
          <Webhook size={12} style={{ color: 'var(--text-muted)' }} />
          <span className='section-label'>Webhooks Configured</span>
          <span
            className='text-[16px] font-mono px-1.5 py-0.5 rounded ml-auto'
            style={{ background: 'rgba(16,217,138,0.1)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.2)' }}
          >
            {store.webhooks.length} active
          </span>
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {store.webhooks.map(wh => (
            <span
              key={wh}
              className='text-[16px] font-mono px-1.5 py-0.5 rounded'
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              {wh}
            </span>
          ))}
        </div>
      </div>

      {/* Connected ad & analytics accounts */}
      {showConnections && (
        <div
          className='rounded-xl p-4 mb-4'
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}
        >
          <div className='flex items-center gap-2 mb-3'>
            <Plug size={13} style={{ color: 'var(--cyan)' }} />
            <span className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>Connected Accounts</span>
          </div>
          <StoreConnectionsPanel
            connections={connections}
            onChange={(key, patch) => onChangeConnection(store.id, key, patch)}
          />
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center gap-2 flex-wrap'>
        <button
          onClick={handleSync}
          disabled={syncing}
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-medium transition-all disabled:opacity-50'
          style={justSynced
            ? { background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }
            : { background: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          {syncing    ? <><Loader2 size={12} className='animate-spin' />Syncing…</>
          : justSynced ? <><CheckCircle size={12} />Synced</>
          : <><RefreshCw size={12} />Re-sync</>}
        </button>
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-medium transition-all disabled:opacity-50'
          style={{ background: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          {testing ? <><Loader2 size={12} className='animate-spin' />Testing…</> : <><Wifi size={12} />Test Connection</>}
        </button>
        <button
          onClick={() => downloadAnalyticsCsv(store)}
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-medium transition-all'
          style={{ background: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          <Download size={12} />Download Analytics
        </button>
        <button
          onClick={() => setShowConnections(c => !c)}
          className='text-base px-3 py-1.5 rounded-lg font-medium transition-all'
          style={showConnections
            ? { background: 'rgba(var(--overlay-rgb),0.08)', color: 'var(--text-secondary)', border: '1px solid var(--border-dim)' }
            : { background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.18)' }}
        >
          {showConnections ? 'Hide Connections' : 'Connections'}
        </button>
        <button
          onClick={() => setEditing(e => !e)}
          className='ml-auto text-base px-3 py-1.5 rounded-lg font-medium transition-all'
          style={editing
            ? { background: 'rgba(var(--overlay-rgb),0.08)', color: 'var(--text-secondary)', border: '1px solid var(--border-dim)' }
            : { background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.18)' }}
        >
          {editing ? 'Hide' : 'Edit Credentials'}
        </button>
      </div>

      {/* Test connection result */}
      {testResult && (
        <div
          className='flex items-start gap-2 mt-3 px-3 py-2.5 rounded-lg text-base'
          style={testResult.success
            ? { background: 'rgba(16,217,138,0.08)', border: '1px solid rgba(16,217,138,0.22)', color: '#10d98a' }
            : { background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.22)', color: '#ff6464' }}
        >
          {testResult.success
            ? <CheckCircle size={14} className='mt-0.5 shrink-0' />
            : <XCircle size={14} className='mt-0.5 shrink-0' />}
          <span>
            <strong>{testResult.success ? 'Connection succeeded — ' : 'Connection failed — '}</strong>
            {testResult.message}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Add Store form ───────────────────────────────────────────────────────────

interface NewStorePayload {
  name: string;
  domain: string;
  accessToken: string;
  apiSecret: string;
  webhookSecret: string;
}

interface AddStoreFormProps {
  onClose: () => void;
  onAdd: (payload: NewStorePayload) => void;
}

function AddStoreForm({ onClose, onAdd }: AddStoreFormProps) {
  const [name,          setName]          = useState('');
  const [domain,        setDomain]        = useState('');
  const [accessToken,   setAccessToken]   = useState('');
  const [apiSecret,     setApiSecret]     = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [saving,        setSaving]        = useState(false);
  const [done,          setDone]          = useState(false);

  const handleConnect = () => {
    if (!domain.trim() || !accessToken.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setDone(true);
      onAdd({
        name:          name.trim(),
        domain:        domain.trim(),
        accessToken:   accessToken.trim(),
        apiSecret:     apiSecret.trim(),
        webhookSecret: webhookSecret.trim(),
      });
      setTimeout(onClose, 1200);
    }, 1000);
  };

  return (
    <div className='glass-card p-5'>
      <div className='flex items-center justify-between mb-4'>
        <div className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>Add Shopify Store</div>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      <div className='flex flex-col gap-3'>
        <div>
          <label className='section-label mb-1.5 block'>Store Name</label>
          <input
            type='text'
            placeholder='e.g. My Bakery Shop'
            value={name}
            onChange={e => setName(e.target.value)}
            className='w-full text-base px-3 py-2 rounded-lg outline-none'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className='section-label mb-1.5 block'>Store Domain</label>
          <input
            type='text'
            placeholder='your-store.myshopify.com'
            value={domain}
            onChange={e => setDomain(e.target.value)}
            className='w-full text-base px-3 py-2 rounded-lg outline-none'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', fontFamily: 'DM Mono' }}
          />
        </div>
        <SecretField
          label='Admin API Access Token'
          placeholder='shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
          hint='Settings → Apps → Private apps'
          value={accessToken}
          onChange={setAccessToken}
        />
        <SecretField
          label='API Secret Key'
          placeholder='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
          hint='Client secret'
          value={apiSecret}
          onChange={setApiSecret}
        />
        <SecretField
          label='Webhook Secret'
          placeholder='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
          hint='For payload verification'
          value={webhookSecret}
          onChange={setWebhookSecret}
        />
        <div className='flex gap-2 pt-1'>
          <button
            onClick={handleConnect}
            disabled={saving || done || !domain.trim() || !accessToken.trim()}
            className='flex-1 flex items-center justify-center gap-1.5 text-base py-2 rounded-lg font-semibold transition-all disabled:opacity-60'
            style={done
              ? { background: 'rgba(16,217,138,0.15)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.3)' }
              : { background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}
          >
            {saving ? <><Loader2 size={12} className='animate-spin' />Connecting…</>
            : done   ? <><CheckCircle size={12} />Connected</>
            : 'Connect Store'}
          </button>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded-lg text-base transition-all'
            style={{ background: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const DEFAULT_WEBHOOKS = ['orders/create', 'orders/updated', 'products/update', 'checkouts/create', 'customers/create'];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function StoreSettings() {
  const [showAddForm, setShowAddForm]                 = useState(false);
  // Persisted so an added store survives settings-tab navigation (this panel
  // unmounts when you leave the Stores section) and full page reloads. Shared
  // with the Sidebar and every store-scoped page via the same 'stores' key.
  const [stores, setStores]                           = useStores();
  const [savedCreds, setSavedCreds]                   = usePersistentState<Record<string, Credentials>>('storeCreds', {});
  const [storeConnections, setStoreConnections]       = usePersistentState<Record<string, Record<ConnectionKey, StoreConnection>>>(
    'storeConnections', INITIAL_STORE_CONNECTIONS,
  );

  const handleSaveCreds = (id: string, creds: Credentials) => {
    setSavedCreds(prev => ({ ...prev, [id]: creds }));
  };

  const handleChangeConnection = (storeId: string, key: ConnectionKey, patch: Partial<StoreConnection>) => {
    setStoreConnections(prev => ({
      ...prev,
      [storeId]: {
        ...withDefaults(prev[storeId]),
        [key]: { ...withDefaults(prev[storeId])[key], ...patch },
      },
    }));
  };

  const handleAddStore = (payload: NewStorePayload) => {
    const base = slugify(payload.name || payload.domain) || `store-${stores.length + 1}`;
    let id = base;
    for (let n = 2; stores.some(s => s.id === id); n++) id = `${base}-${n}`;

    const newStore: StoreData = {
      id,
      name:            payload.name || payload.domain,
      domain:          payload.domain,
      color:           STORE_COLORS[stores.length % STORE_COLORS.length],
      status:          'connected',
      lastSync:        new Date().toISOString(),
      apiKeyMasked:    maskToken(payload.accessToken),
      products:        0,
      orders30d:       0,
      activeCampaigns: 0,
      webhooks:        DEFAULT_WEBHOOKS,
    };

    setStores(prev => [...prev, newStore]);
    setSavedCreds(prev => ({
      ...prev,
      [id]: {
        domain:        payload.domain,
        accessToken:   payload.accessToken,
        apiSecret:     payload.apiSecret,
        webhookSecret: payload.webhookSecret,
      },
    }));
    setStoreConnections(prev => ({ ...prev, [id]: emptyConnections() }));
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>Shopify Stores</div>
          <div className='text-base mt-0.5' style={{ color: 'var(--text-muted)' }}>
            Manage connected store credentials and sync settings
          </div>
        </div>
        <span className='section-label'>{stores.length} stores connected</span>
      </div>

      <div className='flex flex-col gap-3'>
        {stores.map(store => (
          <StoreCard
            key={store.id}
            store={store}
            savedCreds={savedCreds[store.id] ?? null}
            onSaveCreds={handleSaveCreds}
            connections={withDefaults(storeConnections[store.id])}
            onChangeConnection={handleChangeConnection}
          />
        ))}
      </div>

      {showAddForm ? (
        <AddStoreForm onClose={() => setShowAddForm(false)} onAdd={handleAddStore} />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className='flex items-center gap-2 justify-center py-3 rounded-xl text-base transition-all'
          style={{ border: '1px dashed var(--border-dim)', color: 'var(--text-muted)' }}
        >
          <Plus size={14} />
          Add Shopify Store
        </button>
      )}
    </div>
  );
}
