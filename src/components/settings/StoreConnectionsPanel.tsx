'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Plug, Unplug } from 'lucide-react';
import {
  CONNECTION_DEFINITIONS,
  getTestResult,
  type ConnectionKey,
  type ConnectionGroup,
  type StoreConnection,
} from '@/lib/storeConnectionsData';

const GROUPS: ConnectionGroup[] = ['Google', 'Facebook', 'Social'];

const STATUS_STYLE: Record<StoreConnection['status'], { bg: string; color: string; border: string; label: string }> = {
  connected:    { bg: 'rgba(16,217,138,0.12)', color: '#10d98a', border: 'rgba(16,217,138,0.25)', label: 'Connected' },
  error:        { bg: 'rgba(255,68,68,0.12)',  color: '#ff4444', border: 'rgba(255,68,68,0.25)',  label: 'Error' },
  disconnected: { bg: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-muted)', border: 'var(--border-subtle)', label: 'Not Connected' },
};

interface RowProps {
  connKey: ConnectionKey;
  connection: StoreConnection;
  label: string;
  icon: string;
  placeholder: string;
  onChange: (patch: Partial<StoreConnection>) => void;
}

function ConnectionRow({ connKey, connection, label, icon, placeholder, onChange }: RowProps) {
  const [draftId, setDraftId] = useState(connection.accountId);
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);

  // Derived from props (not duplicated into local state) so the banner reflects
  // whatever `connections` the parent last persisted, including after the async
  // localStorage hydration in usePersistentState replaces the seed data.
  const result = connection.lastTestMessage && connection.lastTestedAt
    ? { ok: !!connection.lastTestOk, message: connection.lastTestMessage }
    : null;

  const style = STATUS_STYLE[connection.status];
  const isAttached = connection.status !== 'disconnected';

  const handleConnect = () => {
    if (!draftId.trim()) return;
    setConnecting(true);
    setTimeout(() => {
      onChange({ accountId: draftId.trim(), status: 'connected', lastTestedAt: undefined, lastTestOk: undefined, lastTestMessage: undefined });
      setConnecting(false);
    }, 900);
  };

  const handleDisconnect = () => {
    setDraftId('');
    onChange({ accountId: '', status: 'disconnected', lastTestedAt: undefined, lastTestOk: undefined, lastTestMessage: undefined });
  };

  const handleTest = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1200));
    const { ok, message } = getTestResult(connKey, connection);
    setTesting(false);
    onChange({ lastTestedAt: new Date().toISOString(), lastTestOk: ok, lastTestMessage: message });
  };

  return (
    <div className='rounded-lg p-3' style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div className='flex items-center gap-2.5'>
        <span className='text-base' style={{ width: 18, textAlign: 'center' }}>{icon}</span>
        <div className='flex-1 min-w-0'>
          <div className='text-base font-medium' style={{ color: 'var(--text-primary)' }}>{label}</div>
          {isAttached && (
            <div className='text-[16px] font-mono mt-0.5' style={{ color: 'var(--text-muted)' }}>{connection.accountId}</div>
          )}
        </div>
        <span
          className='text-[16px] px-2 py-0.5 rounded-full font-mono flex-shrink-0'
          style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
        >
          {style.label}
        </span>
      </div>

      {!isAttached ? (
        <div className='flex items-center gap-2 mt-2.5'>
          <input
            type='text'
            placeholder={placeholder}
            value={draftId}
            onChange={e => setDraftId(e.target.value)}
            className='flex-1 text-[16px] px-2.5 py-1.5 rounded-lg outline-none'
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', fontFamily: 'DM Mono' }}
          />
          <button
            onClick={handleConnect}
            disabled={connecting || !draftId.trim()}
            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[16px] font-medium transition-all disabled:opacity-50 flex-shrink-0'
            style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}
          >
            {connecting ? <><Loader2 size={11} className='animate-spin' />Connecting…</> : <><Plug size={11} />Connect</>}
          </button>
        </div>
      ) : (
        <div className='flex items-center gap-2 mt-2.5'>
          <button
            onClick={handleTest}
            disabled={testing}
            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[16px] font-medium transition-all disabled:opacity-60'
            style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.18)' }}
          >
            {testing ? <><Loader2 size={11} className='animate-spin' />Testing…</> : 'Test Connection'}
          </button>
          <button
            onClick={handleDisconnect}
            className='flex items-center gap-1 ml-auto px-2.5 py-1.5 rounded-lg text-[16px] transition-all'
            style={{ background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
          >
            <Unplug size={11} />Disconnect
          </button>
        </div>
      )}

      {result && (
        <div
          className='flex items-start gap-1.5 mt-2.5 p-2 rounded-lg text-[10.5px] leading-snug'
          style={{
            background: result.ok ? 'rgba(16,217,138,0.08)' : 'rgba(255,68,68,0.08)',
            border: `1px solid ${result.ok ? 'rgba(16,217,138,0.2)' : 'rgba(255,68,68,0.2)'}`,
            color: result.ok ? '#10d98a' : '#ff4444',
          }}
        >
          {result.ok ? <CheckCircle size={12} className='flex-shrink-0 mt-0.5' /> : <XCircle size={12} className='flex-shrink-0 mt-0.5' />}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}

interface StoreConnectionsPanelProps {
  connections: Record<ConnectionKey, StoreConnection>;
  onChange: (key: ConnectionKey, patch: Partial<StoreConnection>) => void;
}

export function StoreConnectionsPanel({ connections, onChange }: StoreConnectionsPanelProps) {
  return (
    <div className='flex flex-col gap-4'>
      {GROUPS.map(group => (
        <div key={group}>
          <div className='section-label mb-2'>{group}</div>
          <div className='flex flex-col gap-2'>
            {CONNECTION_DEFINITIONS.filter(def => def.group === group).map(def => (
              <ConnectionRow
                key={def.key}
                connKey={def.key}
                connection={connections[def.key]}
                label={def.label}
                icon={def.icon}
                placeholder={def.placeholder}
                onChange={patch => onChange(def.key, patch)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
