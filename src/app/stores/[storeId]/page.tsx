'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { usePersistentState } from '@/lib/usePersistentState';
import { useStores } from '@/lib/storeScope';
import {
  CONNECTION_DEFINITIONS, CONNECTION_GROUPS, INITIAL_STORE_CONNECTIONS,
  emptyConnections, normalizeConnection, getTestResult, hasRequiredValues,
  SCHEDULE_LABELS, SCHEDULE_MINUTES,
} from '@/lib/storeConnectionsData';
import type {
  ConnectionDefinition, StoreConnection, StoreConnectionMap, ConnectionGroup, ScheduleFrequency,
} from '@/lib/storeConnectionsData';
import {
  CheckCircle, XCircle, Loader2, Plug, Unplug, Eye, EyeOff, Clock, ArrowLeft, Plus, RefreshCw, Store as StoreIcon,
} from 'lucide-react';

const STATUS_STYLE: Record<StoreConnection['status'], { bg: string; color: string; border: string; label: string }> = {
  connected:    { bg: 'rgba(16,217,138,0.12)', color: '#10d98a', border: 'rgba(16,217,138,0.25)', label: 'Connected' },
  error:        { bg: 'rgba(255,68,68,0.12)',  color: '#ff4444', border: 'rgba(255,68,68,0.25)',  label: 'Error' },
  disconnected: { bg: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-muted)', border: 'var(--border-subtle)', label: 'Not Connected' },
};

function relTime(iso?: string): string {
  if (!iso) return 'never';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function nextPull(conn: StoreConnection): string {
  if (conn.scheduleFrequency === 'off' || conn.status !== 'connected') return '—';
  const base = conn.lastDataPullAt ? new Date(conn.lastDataPullAt).getTime() : Date.now();
  const next = base + SCHEDULE_MINUTES[conn.scheduleFrequency] * 60000;
  const mins = Math.round((next - Date.now()) / 60000);
  if (mins <= 0) return 'due now';
  if (mins < 60) return `in ${mins}m`;
  if (mins < 1440) return `in ${Math.round(mins / 60)}h`;
  return `in ${Math.round(mins / 1440)}d`;
}

function ChannelCard({ def, conn, onChange }: {
  def: ConnectionDefinition;
  conn: StoreConnection;
  onChange: (patch: Partial<StoreConnection>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({ ...conn.values });
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);

  const style = STATUS_STYLE[conn.status];
  const isAttached = conn.status !== 'disconnected';
  const filledDraft: StoreConnection = { ...conn, values: draft };
  const canConnect = hasRequiredValues(def, filledDraft);

  const handleConnect = () => {
    if (!canConnect) return;
    setConnecting(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      onChange({
        values: { ...draft }, status: 'connected',
        lastConnectedAt: now, lastDataPullAt: now,
        lastTestedAt: undefined, lastTestOk: undefined, lastTestMessage: undefined,
      });
      setConnecting(false);
    }, 900);
  };

  const handleDisconnect = () => {
    setDraft({});
    onChange({
      values: {}, status: 'disconnected',
      lastConnectedAt: undefined, lastDataPullAt: undefined,
      lastTestedAt: undefined, lastTestOk: undefined, lastTestMessage: undefined,
      scheduleFrequency: 'off',
    });
  };

  const handleTest = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1200));
    const { ok, message } = getTestResult(def, conn);
    const now = new Date().toISOString();
    // A passing test also confirms auth + simulates an immediate data pull.
    onChange(ok
      ? { lastTestedAt: now, lastTestOk: true, lastTestMessage: message, lastConnectedAt: now, lastDataPullAt: now }
      : { lastTestedAt: now, lastTestOk: false, lastTestMessage: message });
    setTesting(false);
  };

  const result = conn.lastTestMessage && conn.lastTestedAt
    ? { ok: !!conn.lastTestOk, message: conn.lastTestMessage } : null;

  return (
    <div className='glass-card p-4'>
      <div className='flex items-center gap-2.5 mb-3'>
        <span className='text-lg' style={{ width: 24, textAlign: 'center' }}>{def.icon}</span>
        <div className='flex-1 min-w-0'>
          <div className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>{def.label}</div>
          <div className='text-[16px]' style={{ color: 'var(--text-muted)' }}>{def.group}{!def.builtin && ' · Custom'}</div>
        </div>
        <span className='text-[16px] px-2 py-0.5 rounded-full font-mono flex-shrink-0'
          style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
          {style.label}
        </span>
      </div>

      {/* Fields */}
      <div className='flex flex-col gap-2 mb-3'>
        {def.fields.map(f => {
          const shown = !f.secret || reveal[f.key];
          return (
            <div key={f.key}>
              <label className='text-[16px] block mb-1' style={{ color: 'var(--text-muted)' }}>{f.label}</label>
              <div className='relative'>
                <input
                  type={shown ? 'text' : 'password'}
                  value={draft[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                  className='w-full text-[16px] px-2.5 py-1.5 rounded-lg outline-none'
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', fontFamily: 'DM Mono', paddingRight: f.secret ? 34 : undefined }}
                />
                {f.secret && (
                  <button type='button' onClick={() => setReveal(r => ({ ...r, [f.key]: !r[f.key] }))}
                    className='absolute right-2 top-1/2 -translate-y-1/2' style={{ color: 'var(--text-muted)' }}>
                    {shown ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect / Disconnect + Test */}
      <div className='flex items-center gap-2 flex-wrap'>
        {!isAttached ? (
          <button onClick={handleConnect} disabled={connecting || !canConnect}
            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[16px] font-medium transition-all disabled:opacity-50'
            style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
            {connecting ? <><Loader2 size={11} className='animate-spin' />Connecting…</> : <><Plug size={11} />Connect</>}
          </button>
        ) : (
          <>
            <button onClick={handleTest} disabled={testing}
              className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[16px] font-medium transition-all disabled:opacity-60'
              style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.18)' }}>
              {testing ? <><Loader2 size={11} className='animate-spin' />Testing…</> : 'Test Connection'}
            </button>
            <button onClick={handleDisconnect}
              className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[16px] transition-all'
              style={{ background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
              <Unplug size={11} />Disconnect
            </button>
          </>
        )}
      </div>

      {/* Test result banner */}
      {result && (
        <div className='flex items-start gap-1.5 mt-2.5 p-2 rounded-lg text-[10.5px] leading-snug'
          style={{
            background: result.ok ? 'rgba(16,217,138,0.08)' : 'rgba(255,68,68,0.08)',
            border: `1px solid ${result.ok ? 'rgba(16,217,138,0.2)' : 'rgba(255,68,68,0.2)'}`,
            color: result.ok ? '#10d98a' : '#ff4444',
          }}>
          {result.ok ? <CheckCircle size={12} className='flex-shrink-0 mt-0.5' /> : <XCircle size={12} className='flex-shrink-0 mt-0.5' />}
          <span>{result.message}</span>
        </div>
      )}

      {/* Timestamps + scheduling (only when attached) */}
      {isAttached && (
        <div className='mt-3 pt-3 flex flex-col gap-2' style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className='flex items-center justify-between text-[16px]' style={{ color: 'var(--text-muted)' }}>
            <span>Last connected</span>
            <span className='font-mono' style={{ color: 'var(--text-secondary)' }}>{relTime(conn.lastConnectedAt)}</span>
          </div>
          <div className='flex items-center justify-between text-[16px]' style={{ color: 'var(--text-muted)' }}>
            <span>Last data pull</span>
            <span className='font-mono' style={{ color: 'var(--text-secondary)' }}>{relTime(conn.lastDataPullAt)}</span>
          </div>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-[16px] flex items-center gap-1' style={{ color: 'var(--text-muted)' }}><Clock size={10} />Routine pull</span>
            <select value={conn.scheduleFrequency}
              onChange={e => onChange({ scheduleFrequency: e.target.value as ScheduleFrequency })}
              className='text-[16px] px-2 py-1 rounded-lg outline-none'
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {(Object.keys(SCHEDULE_LABELS) as ScheduleFrequency[]).map(k => (
                <option key={k} value={k}>{SCHEDULE_LABELS[k]}</option>
              ))}
            </select>
          </div>
          {conn.scheduleFrequency !== 'off' && (
            <div className='text-[16px] text-right font-mono' style={{ color: 'var(--cyan)' }}>
              Next pull {nextPull(conn)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StoreConnectionsPage() {
  const params = useParams();
  const storeId = String(params.storeId);
  const [stores] = useStores();
  const store = stores.find(s => s.id === storeId);

  const [allConnections, setAllConnections] = usePersistentState<Record<string, StoreConnectionMap>>(
    'storeConnections', INITIAL_STORE_CONNECTIONS,
  );
  const [customChannels, setCustomChannels] = usePersistentState<Record<string, ConnectionDefinition[]>>(
    'storeCustomChannels', {},
  );

  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customFields, setCustomFields] = useState('API Key, Account ID');

  const storeCustom = customChannels[storeId] ?? [];
  const allDefs: ConnectionDefinition[] = [...CONNECTION_DEFINITIONS, ...storeCustom];

  const rawMap = allConnections[storeId];
  const connFor = (key: string): StoreConnection => normalizeConnection(rawMap?.[key]);

  const updateConnection = (key: string, patch: Partial<StoreConnection>) => {
    setAllConnections(prev => {
      const storeMap = { ...(prev[storeId] ?? emptyConnections()) };
      storeMap[key] = { ...normalizeConnection(storeMap[key]), ...patch };
      return { ...prev, [storeId]: storeMap };
    });
  };

  const addCustomChannel = () => {
    if (!customName.trim()) return;
    const fields = customFields.split(',').map(s => s.trim()).filter(Boolean).map(label => ({
      key: label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      label,
      placeholder: label,
      secret: /key|token|secret|password/i.test(label),
    }));
    const def: ConnectionDefinition = {
      key: `custom-${Date.now()}`,
      label: customName.trim(),
      group: 'Custom',
      icon: '🔌',
      builtin: false,
      fields: fields.length ? fields : [{ key: 'value', label: 'Value', placeholder: '' }],
    };
    setCustomChannels(prev => ({ ...prev, [storeId]: [...(prev[storeId] ?? []), def] }));
    setCustomName('');
    setCustomFields('API Key, Account ID');
    setAddingCustom(false);
  };

  if (!store) {
    return (
      <div className='flex h-screen overflow-hidden' style={{ background: 'var(--bg-base)' }}>
        <Sidebar />
        <div className='flex flex-col flex-1 min-w-0 overflow-hidden'>
          <TopBar title='Store' breadcrumbs={['MarketOS', 'Stores']} />
          <main className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <StoreIcon size={28} className='mx-auto mb-3' style={{ color: 'var(--text-muted)' }} />
              <div className='text-base font-medium' style={{ color: 'var(--text-primary)' }}>Store not found</div>
              <Link href='/settings' className='text-[16px] mt-1 inline-block' style={{ color: 'var(--cyan)' }}>Back to Settings</Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const connectedCount = allDefs.filter(d => connFor(d.key).status === 'connected').length;

  return (
    <div className='flex h-screen overflow-hidden' style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className='flex flex-col flex-1 min-w-0 overflow-hidden'>
        <TopBar
          title={store.name}
          subtitle={`${connectedCount} of ${allDefs.length} channels connected`}
          breadcrumbs={['MarketOS', 'Stores', store.name]}
        />
        <main className='flex-1 overflow-y-auto p-5'>
          <div className='flex items-center justify-between mb-5'>
            <Link href='/settings' className='flex items-center gap-1.5 text-base transition-colors hover:text-white'
              style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={13} />Back to Stores
            </Link>
            <div className='flex items-center gap-2 text-[16px]' style={{ color: 'var(--text-muted)' }}>
              <span className='w-2 h-2 rounded-full' style={{ background: store.color }} />
              <span className='font-mono'>{store.domain}</span>
            </div>
          </div>

          {CONNECTION_GROUPS.map(group => {
            const defs = allDefs.filter(d => d.group === group);
            if (defs.length === 0) return null;
            return (
              <div key={group} className='mb-6'>
                <div className='section-label mb-2.5'>{group}</div>
                <div className='grid grid-cols-3 gap-3'>
                  {defs.map(def => (
                    <ChannelCard key={def.key} def={def} conn={connFor(def.key)}
                      onChange={patch => updateConnection(def.key, patch)} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Add custom channel */}
          <div className='mb-6'>
            {addingCustom ? (
              <div className='glass-card p-4 flex flex-col gap-3' style={{ maxWidth: 520 }}>
                <div className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>Add Custom Channel</div>
                <div>
                  <label className='text-[16px] block mb-1' style={{ color: 'var(--text-muted)' }}>Channel Name</label>
                  <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder='e.g. Pinterest Ads'
                    className='w-full text-base px-2.5 py-1.5 rounded-lg outline-none'
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className='text-[16px] block mb-1' style={{ color: 'var(--text-muted)' }}>Fields (comma-separated)</label>
                  <input value={customFields} onChange={e => setCustomFields(e.target.value)}
                    className='w-full text-base px-2.5 py-1.5 rounded-lg outline-none'
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
                  <div className='text-[16px] mt-1' style={{ color: 'var(--text-muted)' }}>Fields whose name contains “key/token/secret/password” are masked automatically.</div>
                </div>
                <div className='flex gap-2 justify-end'>
                  <button onClick={() => setAddingCustom(false)} className='px-3 py-1.5 rounded-lg text-base' style={{ color: 'var(--text-muted)' }}>Cancel</button>
                  <button onClick={addCustomChannel} disabled={!customName.trim()}
                    className='px-3 py-1.5 rounded-lg text-base font-medium disabled:opacity-50'
                    style={{ background: 'var(--accent-blue)', color: '#fff' }}>Add Channel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingCustom(true)}
                className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-base font-medium transition-all'
                style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px dashed rgba(0,217,255,0.3)' }}>
                <Plus size={13} />Add Custom Channel
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
