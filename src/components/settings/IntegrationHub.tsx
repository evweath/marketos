'use client';

import { useState } from 'react';
import { Search, CheckCircle, Loader2, X, AlertCircle, Zap, Plus, Trash2, ArrowRight } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { INTEGRATIONS } from '@/lib/settingsData';
import type { Integration, IntegrationCategory, IntegrationStatus } from '@/lib/settingsData';

type CategoryFilter = 'all' | IntegrationCategory;

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: 'all',           label: 'All'           },
  { id: 'advertising',   label: 'Advertising'   },
  { id: 'ecommerce',     label: 'E-commerce'    },
  { id: 'social',        label: 'Social'        },
  { id: 'analytics',     label: 'Analytics'     },
  { id: 'automation',    label: 'Automation'    },
  { id: 'communication', label: 'Communication' },
  { id: 'crm',           label: 'CRM'           },
  { id: 'design',        label: 'Design'        },
];

type ConnectState = 'idle' | 'form' | 'testing' | 'success';

interface CardState {
  connectState: ConnectState;
  apiKey: string;
  secret: string;
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === 'connected') {
    return (
      <span className='badge-ok text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1'>
        <span className='w-1.5 h-1.5 rounded-full inline-block' style={{ background: '#10d98a' }} />
        Connected
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className='badge-critical text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1'>
        <span className='w-1.5 h-1.5 rounded-full inline-block' style={{ background: '#ff4444' }} />
        Error
      </span>
    );
  }
  return (
    <span
      className='text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1'
      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
    >
      <span className='w-1.5 h-1.5 rounded-full inline-block' style={{ background: 'var(--text-muted)' }} />
      Disconnected
    </span>
  );
}

function formatSyncTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

interface IntegrationCardProps {
  integration: Integration;
  statuses: Record<string, IntegrationStatus>;
  onStatusChange: (id: string, status: IntegrationStatus) => void;
}

function IntegrationCard({ integration, statuses, onStatusChange }: IntegrationCardProps) {
  const currentStatus = statuses[integration.id] ?? integration.status;
  const [state, setState] = useState<CardState>({ connectState: 'idle', apiKey: '', secret: '' });
  const [hovered, setHovered] = useState(false);
  const [managing, setManaging] = useState(false);

  const handleConnect = () => setState(s => ({ ...s, connectState: 'form' }));
  const handleCancel  = () => setState(s => ({ ...s, connectState: 'idle', apiKey: '', secret: '' }));

  const handleTest = () => {
    setState(s => ({ ...s, connectState: 'testing' }));
    setTimeout(() => {
      setState(s => ({ ...s, connectState: 'success' }));
      onStatusChange(integration.id, 'connected');
      setTimeout(() => setState(s => ({ ...s, connectState: 'idle' })), 1500);
    }, 1500);
  };

  const handleDisconnect = () => {
    onStatusChange(integration.id, 'disconnected');
    setHovered(false);
  };

  const isConnected    = currentStatus === 'connected';
  const isDisconnected = currentStatus === 'disconnected';
  const isError        = currentStatus === 'error';

  return (
    <div
      className='glass-card p-4 flex flex-col gap-3 relative transition-all'
      style={{ minHeight: 180 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-3'>
          {/* Icon in large rounded square */}
          <div
            className='w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}
          >
            {integration.icon}
          </div>
          <div>
            <div className='text-sm font-semibold leading-tight' style={{ color: 'var(--text-primary)' }}>
              {integration.name}
            </div>
            <div className='text-[10px] mt-0.5 font-mono capitalize' style={{ color: 'var(--text-muted)' }}>
              {integration.category}
            </div>
          </div>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      {/* Description */}
      <p className='text-xs leading-relaxed flex-1' style={{ color: 'var(--text-secondary)' }}>
        {integration.description}
      </p>

      {/* Manage panel — inline details */}
      {isConnected && managing && (
        <div
          className='flex flex-col gap-1.5 p-3 rounded-xl text-[10px] font-mono'
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}
        >
          <div className='flex items-center justify-between'>
            <span style={{ color: 'var(--text-muted)' }}>Account</span>
            <span>{integration.accountName ?? '—'}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span style={{ color: 'var(--text-muted)' }}>Category</span>
            <span className='capitalize'>{integration.category}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span style={{ color: 'var(--text-muted)' }}>Last sync</span>
            <span suppressHydrationWarning>{integration.lastSync ? formatSyncTime(integration.lastSync) : '—'}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span style={{ color: 'var(--text-muted)' }}>Status</span>
            <span style={{ color: '#10d98a' }}>Connected</span>
          </div>
        </div>
      )}

      {/* Connected account info */}
      {isConnected && integration.accountName && (
        <div
          className='flex items-center justify-between px-2.5 py-1.5 rounded-lg'
          style={{ background: 'rgba(16,217,138,0.06)', border: '1px solid rgba(16,217,138,0.15)' }}
        >
          <span className='text-[10px] font-mono truncate' style={{ color: 'var(--text-secondary)' }}>
            {integration.accountName}
          </span>
          {integration.lastSync && (
            <span className='text-[10px] font-mono shrink-0 ml-2' style={{ color: 'var(--text-muted)' }}>
              <span suppressHydrationWarning>Synced {formatSyncTime(integration.lastSync)}</span>
            </span>
          )}
        </div>
      )}

      {/* Connect form — animates in */}
      {state.connectState === 'form' && (
        <div
          className='flex flex-col gap-2 p-3 rounded-xl'
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}
        >
          <input
            type='text'
            placeholder='API Key'
            value={state.apiKey}
            onChange={e => setState(s => ({ ...s, apiKey: e.target.value }))}
            className='w-full text-xs px-2.5 py-2 rounded-lg outline-none'
            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', fontFamily: 'DM Mono' }}
          />
          <input
            type='password'
            placeholder='Secret / Access Token'
            value={state.secret}
            onChange={e => setState(s => ({ ...s, secret: e.target.value }))}
            className='w-full text-xs px-2.5 py-2 rounded-lg outline-none'
            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', fontFamily: 'DM Mono' }}
          />
          <div className='flex gap-2'>
            <button
              onClick={handleTest}
              className='flex-1 text-xs py-2 rounded-lg font-semibold transition-all'
              style={{ background: '#00d9ff', color: '#080b18' }}
            >
              Test Connection
            </button>
            <button
              onClick={handleCancel}
              className='px-2.5 py-2 rounded-lg transition-all'
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Testing state */}
      {state.connectState === 'testing' && (
        <div className='flex items-center gap-2 text-xs' style={{ color: 'var(--text-secondary)' }}>
          <Loader2 size={12} className='animate-spin' style={{ color: '#00d9ff' }} />
          Testing connection…
        </div>
      )}

      {/* Success state */}
      {state.connectState === 'success' && (
        <div className='flex items-center gap-2 text-xs font-medium' style={{ color: '#10d98a' }}>
          <CheckCircle size={12} />
          Connection verified
        </div>
      )}

      {/* Actions */}
      {state.connectState === 'idle' && (
        <div className='flex items-center gap-2 mt-auto'>
          {isConnected && (
            <>
              <button
                onClick={() => setManaging(m => !m)}
                className='flex-1 text-xs py-2 rounded-lg font-medium transition-all'
                style={managing
                  ? { background: 'rgba(0,217,255,0.10)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.2)' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                {managing ? 'Hide Details' : 'Manage'}
              </button>
              {hovered && (
                <button
                  onClick={handleDisconnect}
                  className='text-xs px-3 py-2 rounded-lg font-medium transition-all'
                  style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.25)' }}
                >
                  Disconnect
                </button>
              )}
            </>
          )}
          {isDisconnected && (
            <button
              onClick={handleConnect}
              className='flex-1 text-xs py-2 rounded-lg font-medium transition-all'
              style={{ background: 'rgba(0,217,255,0.10)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.2)' }}
            >
              Connect
            </button>
          )}
          {isError && (
            <button
              onClick={handleConnect}
              className='flex-1 text-xs py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5'
              style={{ background: 'rgba(255,68,68,0.10)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.25)' }}
            >
              <AlertCircle size={11} />Reconnect
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Zapier / Make Workflow Builder (I-09) ────────────────────────────────────

type WFPlatform = 'zapier' | 'make';
type WFStatus = 'active' | 'paused' | 'error';

interface Workflow {
  id: string;
  name: string;
  platform: WFPlatform;
  trigger: string;
  action: string;
  status: WFStatus;
  runsLast30d: number;
  lastRun: string;
}

const INITIAL_WORKFLOWS: Workflow[] = [
  { id: 'wf-1', name: 'New Order → Google Sheets',       platform: 'zapier', trigger: 'New Shopify Order',          action: 'Append row to Sheets',           status: 'active', runsLast30d: 847, lastRun: '4m ago'  },
  { id: 'wf-2', name: 'Cart Recovery → Slack Alert',     platform: 'zapier', trigger: 'Cart value > $1,000',        action: 'Post message to Slack',          status: 'active', runsLast30d: 124, lastRun: '22m ago' },
  { id: 'wf-3', name: 'New Lead → HubSpot CRM',          platform: 'zapier', trigger: 'Email form submission',       action: 'Create HubSpot contact',         status: 'active', runsLast30d: 38,  lastRun: '1h ago'  },
  { id: 'wf-4', name: 'Daily Revenue → Google Sheets',   platform: 'make',   trigger: 'Daily schedule (8am UTC)',    action: 'Update revenue dashboard sheet', status: 'active', runsLast30d: 30,  lastRun: '8h ago'  },
  { id: 'wf-5', name: 'Ad Alert → MS Teams',             platform: 'make',   trigger: 'ROAS drops below 2×',        action: 'Send Teams notification',        status: 'paused', runsLast30d: 0,   lastRun: 'Never'   },
  { id: 'wf-6', name: 'Product restock → Email notify',  platform: 'zapier', trigger: 'Shopify inventory updated',  action: 'Send notification email',        status: 'error',  runsLast30d: 0,   lastRun: '3d ago'  },
];

const ZAPIER_TRIGGERS = ['New Shopify Order', 'Cart Abandoned', 'Cart value > $1,000', 'New customer signup', 'Product out of stock', 'Shopify inventory updated', 'Email form submission', 'ROAS drops below 2×', 'Daily schedule'];
const ZAPIER_ACTIONS  = ['Append row to Sheets', 'Post message to Slack', 'Send Teams notification', 'Create HubSpot contact', 'Send notification email', 'Update revenue dashboard sheet', 'Create Trello card', 'Send SMS via Twilio'];

const WF_STATUS_CFG: Record<WFStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: '#10d98a', bg: 'rgba(16,217,138,.1)'  },
  paused: { label: 'Paused', color: '#ffb347', bg: 'rgba(255,179,71,.1)'  },
  error:  { label: 'Error',  color: '#ff4444', bg: 'rgba(255,68,68,.1)'   },
};

function WorkflowBuilder() {
  const [workflows, setWorkflows] = usePersistentState<Workflow[]>('settings.workflows', INITIAL_WORKFLOWS);
  const [tab, setTab] = useState<WFPlatform | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');
  const [newPlatform, setNewPlatform] = useState<WFPlatform>('zapier');
  const [newTrigger, setNewTrigger] = useState(ZAPIER_TRIGGERS[0]);
  const [newAction, setNewAction]   = useState(ZAPIER_ACTIONS[0]);

  const visible = tab === 'all' ? workflows : workflows.filter(w => w.platform === tab);
  const totalRuns = workflows.reduce((s, w) => s + w.runsLast30d, 0);

  const toggleStatus = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id !== id ? w : { ...w, status: w.status === 'active' ? 'paused' : 'active' }));
  };

  const deleteWf = (id: string) => setWorkflows(prev => prev.filter(w => w.id !== id));

  const createWorkflow = () => {
    if (!newName.trim()) return;
    const wf: Workflow = {
      id: `wf-${Date.now()}`, name: newName, platform: newPlatform, trigger: newTrigger,
      action: newAction, status: 'active', runsLast30d: 0, lastRun: 'Never',
    };
    setWorkflows(prev => [wf, ...prev]);
    setNewName(''); setShowCreate(false);
  };

  return (
    <div className='flex flex-col gap-4 pt-2'>
      <div className='flex items-center gap-2'>
        <Zap size={15} style={{ color: '#ffb347' }} />
        <span className='text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>Automation Workflows</span>
        <span className='section-label'>— Zapier &amp; Make (I-09)</span>
      </div>

      <div className='grid grid-cols-4 gap-3'>
        {[
          { label: 'Active Workflows', value: workflows.filter(w => w.status === 'active').length.toString(), color: '#10d98a' },
          { label: 'Runs (30d)',        value: totalRuns.toLocaleString(),                                       color: '#00d9ff' },
          { label: 'Zapier Workflows',  value: workflows.filter(w => w.platform === 'zapier').length.toString(), color: '#ff6640' },
          { label: 'Make Workflows',    value: workflows.filter(w => w.platform === 'make').length.toString(),   color: '#7b93ff' },
        ].map(s => (
          <div key={s.label} className='rounded-xl px-3 py-3' style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className='section-label mb-1'>{s.label}</div>
            <div className='text-xl font-bold' style={{ color: s.color, fontFamily: 'DM Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex gap-1 p-1 rounded-lg' style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {(['all', 'zapier', 'make'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className='px-2.5 py-1 rounded-md text-xs capitalize transition-all'
              style={{ background: tab === t ? 'var(--bg-elevated)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', border: tab === t ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
              {t === 'all' ? 'All Platforms' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium'
          style={{ background: 'rgba(255,102,64,.12)', color: '#ff6640', border: '1px solid rgba(255,102,64,.25)' }}>
          <Plus size={12} /> New Workflow
        </button>
      </div>

      {showCreate && (
        <div className='rounded-xl p-4 flex flex-col gap-3' style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
          <div className='text-xs font-semibold' style={{ color: 'var(--text-primary)' }}>Create Workflow</div>
          <div className='grid grid-cols-3 gap-3'>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder='Workflow name'
              className='col-span-2 px-3 py-2 rounded-lg text-xs' style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
            <select value={newPlatform} onChange={e => setNewPlatform(e.target.value as WFPlatform)}
              className='px-3 py-2 rounded-lg text-xs' style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              <option value='zapier'>Zapier</option>
              <option value='make'>Make</option>
            </select>
            <select value={newTrigger} onChange={e => setNewTrigger(e.target.value)}
              className='px-3 py-2 rounded-lg text-xs' style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {ZAPIER_TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className='flex items-center justify-center'><ArrowRight size={14} style={{ color: 'var(--text-muted)' }} /></div>
            <select value={newAction} onChange={e => setNewAction(e.target.value)}
              className='px-3 py-2 rounded-lg text-xs' style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {ZAPIER_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className='flex gap-2 justify-end'>
            <button onClick={() => setShowCreate(false)} className='px-3 py-1.5 rounded-lg text-xs' style={{ color: 'var(--text-muted)' }}>Cancel</button>
            <button onClick={createWorkflow} className='px-3 py-1.5 rounded-lg text-xs font-medium' style={{ background: 'rgba(255,102,64,.12)', color: '#ff6640' }}>Create</button>
          </div>
        </div>
      )}

      <div className='rounded-xl overflow-hidden' style={{ border: '1px solid var(--border-subtle)' }}>
        <table className='w-full text-xs'>
          <thead style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              {['Workflow', 'Platform', 'Trigger → Action', 'Runs (30d)', 'Last Run', 'Status', ''].map(h => (
                <th key={h} className='px-3 py-2.5 text-left font-medium' style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(wf => {
              const sc = WF_STATUS_CFG[wf.status];
              return (
                <tr key={wf.id} className='transition-colors' style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className='px-3 py-2.5 font-medium' style={{ color: 'var(--text-primary)' }}>{wf.name}</td>
                  <td className='px-3 py-2.5'>
                    <span className='text-[10px] px-1.5 py-0.5 rounded font-medium capitalize'
                      style={{ color: wf.platform === 'zapier' ? '#ff6640' : '#7b93ff', background: wf.platform === 'zapier' ? 'rgba(255,102,64,.1)' : 'rgba(123,147,255,.1)' }}>
                      {wf.platform}
                    </span>
                  </td>
                  <td className='px-3 py-2.5'>
                    <span className='section-label'>{wf.trigger}</span>
                    <ArrowRight size={10} className='inline mx-1' style={{ color: 'var(--text-muted)' }} />
                    <span className='section-label'>{wf.action}</span>
                  </td>
                  <td className='px-3 py-2.5 font-mono' style={{ color: 'var(--text-secondary)' }}>{wf.runsLast30d.toLocaleString()}</td>
                  <td className='px-3 py-2.5' style={{ color: 'var(--text-muted)' }}>{wf.lastRun}</td>
                  <td className='px-3 py-2.5'>
                    <span className='text-[10px] px-1.5 py-0.5 rounded-full' style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                  </td>
                  <td className='px-3 py-2.5'>
                    <div className='flex items-center gap-1'>
                      <button onClick={() => toggleStatus(wf.id)} className='text-[10px] px-2 py-1 rounded' style={{ color: wf.status === 'active' ? '#ffb347' : '#10d98a', background: wf.status === 'active' ? 'rgba(255,179,71,.08)' : 'rgba(16,217,138,.08)' }}>
                        {wf.status === 'active' ? 'Pause' : 'Run'}
                      </button>
                      <button onClick={() => deleteWf(wf.id)} className='p-1 rounded' style={{ color: '#ff4444' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function IntegrationHub() {
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [statuses, setStatuses]           = usePersistentState<Record<string, IntegrationStatus>>('settings.integrations', {});

  const handleStatusChange = (id: string, status: IntegrationStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  };

  const getStatus = (integration: Integration): IntegrationStatus =>
    statuses[integration.id] ?? integration.status;

  const filtered = INTEGRATIONS.filter(i => {
    const matchesCategory = activeCategory === 'all' || i.category === activeCategory;
    const matchesSearch   = i.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount  = INTEGRATIONS.filter(i => getStatus(i) === 'connected').length;
  const errorCount      = INTEGRATIONS.filter(i => getStatus(i) === 'error').length;
  const availableCount  = INTEGRATIONS.filter(i => getStatus(i) === 'disconnected').length;

  return (
    <div className='flex flex-col gap-5'>

      {/* Summary stats row */}
      <div className='grid grid-cols-3 gap-3'>
        {[
          { label: 'Connected', value: connectedCount, color: '#10d98a', bg: 'rgba(16,217,138,0.08)', border: 'rgba(16,217,138,0.2)' },
          { label: 'Available', value: availableCount, color: 'var(--text-secondary)', bg: 'var(--bg-elevated)', border: 'var(--border-subtle)' },
          { label: 'Errors',    value: errorCount,     color: '#ff4444', bg: 'rgba(255,68,68,0.06)',  border: 'rgba(255,68,68,0.2)'  },
        ].map(stat => (
          <div
            key={stat.label}
            className='px-4 py-3.5 rounded-xl'
            style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
          >
            <div className='text-2xl font-bold mb-1' style={{ fontFamily: 'DM Mono', color: stat.color }}>
              {stat.value}
            </div>
            <div className='section-label'>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className='flex items-center gap-3 flex-wrap'>
        {/* Category pill row */}
        <div className='flex items-center gap-1 flex-wrap'>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className='text-xs px-3 py-1.5 rounded-full transition-all'
                style={
                  active
                    ? { background: 'rgba(0,217,255,0.12)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.28)' }
                    : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className='relative ml-auto'>
          <Search size={13} className='absolute left-2.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--text-muted)' }} />
          <input
            type='text'
            placeholder='Search integrations…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none w-52'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className='text-center py-16' style={{ color: 'var(--text-muted)' }}>
          <div className='text-3xl mb-3'>🔍</div>
          <div className='text-sm'>No integrations match your search</div>
        </div>
      ) : (
        <div className='grid grid-cols-3 gap-3'>
          {filtered.map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              statuses={statuses}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Workflow Builder */}
      <div className='rounded-xl p-5' style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <WorkflowBuilder />
      </div>
    </div>
  );
}
