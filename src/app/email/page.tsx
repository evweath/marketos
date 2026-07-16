'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import {
  computeEmailStats, TRIGGER_CONFIG,
  computeSmsStats,
  SAMPLE_PUSH_CAMPAIGNS, SAMPLE_PUSH_AUTOMATIONS, computePushStats, SAMPLE_PUSH_SUBSCRIBERS_BY_STORE,
  TX_TEMPLATES, SAMPLE_EMAIL_AB_TESTS, computeAbTestStats,
} from '@/lib/emailData';
import type {
  EmailFlow, FlowStatus, EmailCampaign, SegmentData, DeliverabilityMetric,
  SmsMessage, SmsConversation, SmsCampaign, SmsStatus, SmsFlow, SmsFlowStatus,
  PushCampaign, PushStatus, PushAutomation, PushAutoStatus, PushSubscriberCount,
  TxTemplate, TxStatus, EmailABTest, ABTestStatus, ABTestType,
} from '@/lib/emailData';
import { useStores, useStoreScope, resolveStoreId } from '@/lib/storeScope';
import { StoreScopeBar } from '@/components/shared/StoreScopeBar';
import { Mail, GitBranch, Users, Shield, Play, Pause, CheckCircle, AlertTriangle, XCircle, MessageSquare, Bell, LayoutTemplate, Clock, FlaskConical, ShoppingBag, GripVertical, Trash2, Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { StoreRecord } from '@/lib/storeScope';

const c$ = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();

type Tab = 'flows' | 'campaigns' | 'segments' | 'deliverability' | 'sms' | 'push' | 'builder' | 'sendtime' | 'abtesting' | 'transactional';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'flows',          label: 'Automation Flows',  icon: GitBranch      },
  { key: 'campaigns',      label: 'Campaigns',         icon: Mail           },
  { key: 'builder',        label: 'Email Builder',     icon: LayoutTemplate },
  { key: 'segments',       label: 'Segments',          icon: Users          },
  { key: 'deliverability', label: 'Deliverability',    icon: Shield         },
  { key: 'abtesting',      label: 'A/B Testing',       icon: FlaskConical   },
  { key: 'sendtime',       label: 'Send-Time AI',      icon: Clock          },
  { key: 'transactional',  label: 'Transactional',     icon: ShoppingBag    },
  { key: 'sms',            label: 'SMS & MMS',         icon: MessageSquare  },
  { key: 'push',           label: 'Web Push',          icon: Bell           },
];

const FLOW_STATUS_CFG: Record<FlowStatus, { color: string; bg: string; label: string }> = {
  active: { color: '#10d98a', bg: 'rgba(16,217,138,0.1)', label: 'Active' },
  paused: { color: '#ffb347', bg: 'rgba(255,179,71,0.1)',  label: 'Paused' },
  draft:  { color: '#7b93ff', bg: 'rgba(123,147,255,0.1)', label: 'Draft'  },
};

const DEFAULT_STEP_DELAYS = ['Immediate', '+1 day', '+3 days', '+5 days', '+7 days', '+10 days', '+14 days'];
const STEP_CH_ICON: Record<'email' | 'sms' | 'push', string> = { email: '✉️', sms: '💬', push: '🔔' };

function FlowCard({ flow }: { flow: EmailFlow }) {
  const tc = TRIGGER_CONFIG[flow.trigger];
  const sc = FLOW_STATUS_CFG[flow.status];
  const [enabled, setEnabled] = usePersistentState(`email.flowEnabled.${flow.id}`, flow.status === 'active');
  const [expanded, setExpanded] = useState(false);
  const [stepCount, setStepCount] = usePersistentState(`email.flowStepCount.${flow.id}`, flow.steps);
  const [delays, setDelays] = usePersistentState<string[]>(`email.flowStepDelays.${flow.id}`, []);

  // Synthesize the step sequence from the flow's real config: cycle channels,
  // progressive delays. Delays are editable + persisted per step.
  const stepDelay = (i: number) => delays[i] ?? DEFAULT_STEP_DELAYS[i] ?? `+${i * 2} days`;
  const setStepDelay = (i: number, v: string) => setDelays(prev => {
    const next = [...prev];
    while (next.length <= i) next.push(DEFAULT_STEP_DELAYS[next.length] ?? `+${next.length * 2} days`);
    next[i] = v;
    return next;
  });
  const stepChannel = (i: number) => flow.channels[i % flow.channels.length] ?? 'email';

  return (
    <div className="glass-card p-4 transition-all hover:border-white/10"
      style={{ opacity: flow.status === 'draft' ? 0.75 : 1 }}>
      <div className="flex items-start justify-between mb-3">
        <button onClick={() => setExpanded(e => !e)} className="flex items-start gap-2.5 text-left flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
            style={{ background: tc.color + '18' }}>{tc.icon}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <ChevronDown size={13} className="transition-transform shrink-0" style={{ color: 'var(--text-muted)', transform: expanded ? 'none' : 'rotate(-90deg)' }} />
              <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{flow.name}</div>
            </div>
            <div className="flex items-center gap-2 text-[16px] mt-0.5 ml-5">
              <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
              <span style={{ color: 'var(--text-muted)' }}>{stepCount} steps · {flow.channels.join(' + ')} · {flow.store}</span>
            </div>
          </div>
        </button>
        {flow.status !== 'draft' && (
          <button onClick={() => setEnabled(e => !e)}
            className="p-1.5 rounded-lg transition-all shrink-0"
            style={{ background: enabled ? 'rgba(255,179,71,0.08)' : 'rgba(16,217,138,0.08)', color: enabled ? '#ffb347' : '#10d98a' }}>
            {enabled ? <Pause size={12} /> : <Play size={12} />}
          </button>
        )}
      </div>

      {/* Expanded step-by-step visualization + edit */}
      {expanded && (
        <div className="mb-3 rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="section-label">Flow Steps</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>Trigger: {tc.label}</span>
              <button onClick={() => setStepCount(n => Math.max(1, n - 1))}
                className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}>−</button>
              <span className="text-[16px] font-mono w-4 text-center" style={{ color: 'var(--text-primary)' }}>{stepCount}</span>
              <button onClick={() => setStepCount(n => Math.min(7, n + 1))}
                className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}>+</button>
            </div>
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: stepCount }, (_, i) => {
              const ch = stepChannel(i);
              return (
                <div key={i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-base">{STEP_CH_ICON[ch]}</span>
                  <span className="text-[16px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>Step {i + 1}</span>
                  <span className="text-[16px] capitalize" style={{ color: 'var(--text-secondary)', width: 44 }}>{ch}</span>
                  <input
                    value={stepDelay(i)}
                    onChange={e => setStepDelay(i, e.target.value)}
                    className="text-[16px] font-mono px-2 py-1 rounded outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', width: 90 }}
                  />
                  <span className="text-[16px] truncate flex-1" style={{ color: 'var(--text-muted)' }}>
                    {tc.label} message #{i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {flow.sent > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Triggered',  value: fmt(flow.triggered),                     color: 'var(--text-primary)' },
            { label: 'Open Rate',  value: flow.openRate.toFixed(1) + '%',          color: flow.openRate > 40 ? '#10d98a' : '#ffb347' },
            { label: 'Click Rate', value: flow.clickRate.toFixed(1) + '%',         color: flow.clickRate > 15 ? '#10d98a' : '#ffb347' },
            { label: 'Conv.',      value: flow.conversionRate.toFixed(1) + '%',    color: 'var(--cyan)' },
          ].map(m => (
            <div key={m.label} className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-elevated)' }}>
              <div className="data-value text-base font-semibold" style={{ color: m.color }}>{m.value}</div>
              <div className="section-label" style={{ fontSize: 16 }}>{m.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-base text-center py-3" style={{ color: 'var(--text-muted)' }}>
          {flow.status === 'draft' ? 'Complete setup to activate' : 'No sends yet'}
        </div>
      )}
      {flow.revenue > 0 && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-base" style={{ color: 'var(--text-muted)' }}>30d revenue attributed</span>
          <span className="data-value text-base font-semibold" style={{ color: tc.color }}>{c$(flow.revenue)}</span>
        </div>
      )}
    </div>
  );
}

const CAMPAIGN_TEMPLATES = ['Newsletter', 'Promotion / Sale', 'Product Launch', 'Win-Back', 'Announcement'];

function CampaignWizardModal({ stores, segments, onClose, onCreate }: {
  stores: StoreRecord[];
  segments: SegmentData[];
  onClose: () => void;
  onCreate: (c: EmailCampaign) => void;
}) {
  const [step, setStep] = useState(1);
  const [store, setStore] = useState(stores[0]?.domain ?? '');
  const [segmentId, setSegmentId] = useState<string>('all');
  const [template, setTemplate] = useState(CAMPAIGN_TEMPLATES[0]);
  const [subject, setSubject] = useState('');
  const [preview, setPreview] = useState('');
  const [schedule, setSchedule] = useState<'now' | 'later'>('now');
  const [when, setWhen] = useState('');

  const inputStyle = { background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' } as const;
  const seg = segments.find(s => s.id === segmentId);
  const recipients = seg ? seg.count : segments.reduce((s, x) => s + x.count, 0);
  const canNext = step === 3 ? subject.trim() !== '' : true;
  const steps = ['Segment', 'Template', 'Subject', 'Review', 'Schedule'];

  const create = () => {
    onCreate({
      id: `ec-${Date.now()}`,
      subject: subject.trim() || '[Draft] Untitled Campaign',
      preview: preview.trim() || `${template} to ${seg ? seg.name : 'all subscribers'}`,
      status: schedule === 'later' ? 'scheduled' : 'draft',
      store,
      sentTo: recipients,
      scheduledFor: schedule === 'later' ? (when || 'Not set') : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="rounded-2xl w-[580px] max-w-[92vw] flex flex-col" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>New Email Campaign</div>
            <div className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Step {step} of 5 · {steps[step - 1]}</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <div className="flex gap-1 px-5 pt-3">
          {[1, 2, 3, 4, 5].map(n => <div key={n} className="flex-1 h-1 rounded-full" style={{ background: n <= step ? '#ffb347' : 'var(--bg-elevated)' }} />)}
        </div>
        <div className="p-5 flex flex-col gap-4" style={{ minHeight: 240 }}>
          {step === 1 && (
            <>
              <div>
                <label className="section-label block mb-1.5">Store</label>
                <select value={store} onChange={e => setStore(e.target.value)} className="w-full px-3 py-2 rounded-lg text-base outline-none" style={inputStyle}>
                  {stores.map(s => <option key={s.id} value={s.domain}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="section-label block mb-1.5">Audience segment</label>
                <select value={segmentId} onChange={e => setSegmentId(e.target.value)} className="w-full px-3 py-2 rounded-lg text-base outline-none" style={inputStyle}>
                  <option value="all">All subscribers{segments.length ? ` (${segments.reduce((s, x) => s + x.count, 0).toLocaleString()})` : ''}</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name} ({s.count.toLocaleString()})</option>)}
                </select>
                <div className="text-[16px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{recipients.toLocaleString()} recipients{segments.length === 0 && ' — load sample data or create segments first'}</div>
              </div>
            </>
          )}
          {step === 2 && (
            <div>
              <label className="section-label block mb-1.5">Template</label>
              <div className="grid grid-cols-2 gap-2">
                {CAMPAIGN_TEMPLATES.map(t => {
                  const active = template === t;
                  return (
                    <button key={t} onClick={() => setTemplate(t)}
                      className="px-3 py-3 rounded-lg text-base text-left transition-all"
                      style={{ background: active ? 'rgba(255,179,71,0.1)' : 'var(--bg-elevated)', color: active ? '#ffb347' : 'var(--text-secondary)', border: `1px solid ${active ? 'rgba(255,179,71,0.3)' : 'var(--border-subtle)'}` }}>
                      <LayoutTemplate size={14} className="mb-1.5" />{t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {step === 3 && (
            <>
              <div>
                <label className="section-label block mb-1.5">Subject line</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="🍩 Your subject line…"
                  className="w-full px-3 py-2 rounded-lg text-base outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="section-label block mb-1.5">Preview text</label>
                <input value={preview} onChange={e => setPreview(e.target.value)} placeholder="The teaser shown after the subject…"
                  className="w-full px-3 py-2 rounded-lg text-base outline-none" style={inputStyle} />
              </div>
              {/* inbox preview */}
              <div className="rounded-lg p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div className="text-[16px] mb-1" style={{ color: 'var(--text-muted)' }}>Inbox preview</div>
                <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{subject || 'Your subject line'}</div>
                <div className="text-[16px]" style={{ color: 'var(--text-muted)' }}>{preview || 'Preview text appears here…'}</div>
              </div>
            </>
          )}
          {step === 4 && (
            <div className="rounded-xl p-4 space-y-2 text-[16px] font-mono" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
              <div className="flex gap-2"><span className="w-20 text-right" style={{ color: 'var(--text-muted)' }}>STORE</span><span style={{ color: 'var(--text-secondary)' }}>{store}</span></div>
              <div className="flex gap-2"><span className="w-20 text-right" style={{ color: 'var(--text-muted)' }}>SEGMENT</span><span style={{ color: 'var(--text-secondary)' }}>{seg ? seg.name : 'All subscribers'} · {recipients.toLocaleString()} recipients</span></div>
              <div className="flex gap-2"><span className="w-20 text-right" style={{ color: 'var(--text-muted)' }}>TEMPLATE</span><span style={{ color: 'var(--text-secondary)' }}>{template}</span></div>
              <div className="flex gap-2"><span className="w-20 text-right" style={{ color: 'var(--text-muted)' }}>SUBJECT</span><span style={{ color: '#ffb347' }}>{subject || '—'}</span></div>
            </div>
          )}
          {step === 5 && (
            <>
              <label className="section-label block mb-1.5">When to send</label>
              <div className="flex flex-col gap-2">
                <button onClick={() => setSchedule('now')} className="px-3 py-2.5 rounded-lg text-base text-left" style={{ background: schedule === 'now' ? 'rgba(16,217,138,0.1)' : 'var(--bg-elevated)', color: schedule === 'now' ? '#10d98a' : 'var(--text-secondary)', border: `1px solid ${schedule === 'now' ? 'rgba(16,217,138,0.25)' : 'var(--border-subtle)'}` }}>
                  {schedule === 'now' && '✓ '}Save as draft (send later manually)
                </button>
                <button onClick={() => setSchedule('later')} className="px-3 py-2.5 rounded-lg text-base text-left" style={{ background: schedule === 'later' ? 'rgba(0,217,255,0.1)' : 'var(--bg-elevated)', color: schedule === 'later' ? 'var(--cyan)' : 'var(--text-secondary)', border: `1px solid ${schedule === 'later' ? 'rgba(0,217,255,0.25)' : 'var(--border-subtle)'}` }}>
                  {schedule === 'later' && '✓ '}Schedule for a specific time
                </button>
                {schedule === 'later' && (
                  <input value={when} onChange={e => setWhen(e.target.value)} placeholder="e.g. Tomorrow 9:00 AM"
                    className="w-full px-3 py-2 rounded-lg text-base outline-none" style={inputStyle} />
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={() => step === 1 ? onClose() : setStep(step - 1)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-base" style={{ color: 'var(--text-muted)' }}>
            {step === 1 ? 'Cancel' : <><ChevronLeft size={13} />Back</>}
          </button>
          {step < 5 ? (
            <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext} className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-base font-medium disabled:opacity-50" style={{ background: '#ffb347', color: '#0a0e1a' }}>Next<ChevronRight size={13} /></button>
          ) : (
            <button onClick={create} className="px-4 py-1.5 rounded-lg text-base font-semibold" style={{ background: '#ffb347', color: '#0a0e1a' }}>{schedule === 'later' ? 'Schedule Campaign' : 'Create Draft'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function CampaignsList({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const SS = { sent: { color: '#10d98a', label: 'Sent' }, scheduled: { color: 'var(--cyan)', label: 'Scheduled' }, draft: { color: '#7b93ff', label: 'Draft' } };
  const [allCampaigns, setCampaigns] = usePersistentState<EmailCampaign[]>('email.campaigns', []);
  const [allSegments] = usePersistentState<SegmentData[]>('email.segments', []);
  const campaigns = allCampaigns.filter(c => selectedStoreIds.includes(resolveStoreId(c.store, stores) ?? ''));
  const [wizard, setWizard] = useState(false);
  return (
    <div className="glass-card overflow-hidden">
      {wizard && (
        <CampaignWizardModal stores={stores} segments={allSegments}
          onClose={() => setWizard(false)}
          onCreate={(c) => { setCampaigns(prev => [c, ...prev]); setWizard(false); }} />
      )}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="section-label">Email Campaigns</span>
        <button onClick={() => setWizard(true)} className="text-base px-3 py-1.5 rounded-lg font-medium"
          style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>+ New Campaign</button>
      </div>
      {campaigns.length === 0 && (
        <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
          {allCampaigns.length === 0 ? 'No campaigns yet — create one to get started.' : `No campaigns for the selected store${selectedStoreIds.length !== 1 ? 's' : ''}.`}
        </div>
      )}
      {campaigns.map(camp => {
        const ss = SS[camp.status];
        return (
          <div key={camp.id} className="border-b px-4 py-3 hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[16px] font-mono px-1.5 py-0.5 rounded" style={{ background: ss.color + '18', color: ss.color }}>{ss.label}</span>
                  <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>{camp.store}</span>
                </div>
                <div className="text-base font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{camp.subject}</div>
                <div className="text-base truncate" style={{ color: 'var(--text-muted)' }}>{camp.preview}</div>
              </div>
              {camp.status === 'sent' && (
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right"><div className="data-value text-base font-semibold" style={{ color: '#10d98a' }}>{camp.openRate?.toFixed(1)}%</div><div className="section-label">Open</div></div>
                  <div className="text-right"><div className="data-value text-base font-semibold" style={{ color: 'var(--cyan)' }}>{camp.clickRate?.toFixed(1)}%</div><div className="section-label">Click</div></div>
                  <div className="text-right"><div className="data-value text-base font-semibold" style={{ color: '#ffb347' }}>{c$(camp.revenue!)}</div><div className="section-label">Revenue</div></div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Empty until real predictive-CLV/churn scoring is connected — this panel
// gets a full rebuild in a later pass.
const PREDICTIVE_CUSTOMERS: Array<{ id: string; name: string; clv: number; churnRisk: number; nextOrderDays: number | null; segment: string; churnLabel: string }> = [];

function SegmentsPanel() {
  const [segments] = usePersistentState<SegmentData[]>('email.segments', []);
  const [showPredictive, setShowPredictive] = useState(false);
  const highChurn = PREDICTIVE_CUSTOMERS.filter(c => c.churnRisk >= 60).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-4">
        <div className="section-label mb-4">Customer Segments</div>
        {segments.length === 0 && (
          <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No segments defined yet.</div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {segments.map(seg => (
            <div key={seg.id} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: `1px solid ${seg.color}20` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-base font-semibold" style={{ color: seg.color }}>{seg.name}</div>
                <div className="data-value text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(seg.count)}</div>
              </div>
              <div className="text-[16px] mb-2" style={{ color: 'var(--text-secondary)' }}>{seg.description}</div>
              {seg.avgClv > 0 && (
                <div className="flex items-center justify-between text-[16px] font-mono">
                  <span style={{ color: 'var(--text-muted)' }}>CLV: <span style={{ color: seg.color }}>{c$(seg.avgClv)}</span></span>
                  <span style={{ color: 'var(--text-muted)' }}>AOV: {c$(seg.avgOrderValue)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Per-Customer Predictive Intelligence (F-13) */}
      <div className="glass-card overflow-hidden">
        <button className="w-full px-4 py-3 flex items-center justify-between border-b text-left"
          style={{ borderColor: 'var(--border-subtle)' }}
          onClick={() => setShowPredictive(v => !v)}>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Predictive Customer Intelligence</span>
            {highChurn > 0 && (
              <span className="text-[16px] px-2 py-0.5 rounded-full" style={{ color: '#ff4444', background: 'rgba(255,68,68,.1)' }}>
                {highChurn} high churn risk
              </span>
            )}
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>{showPredictive ? '▲' : '▼'}</span>
        </button>

        {showPredictive && PREDICTIVE_CUSTOMERS.length === 0 && (
          <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>No predictive customer data yet.</div>
        )}
        {showPredictive && PREDICTIVE_CUSTOMERS.length > 0 && (
          <table className="w-full text-base">
            <thead style={{ background: 'var(--bg-elevated)' }}>
              <tr>
                {['Customer', 'Segment', 'Pred. CLV', 'Churn Risk', 'Next Order'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PREDICTIVE_CUSTOMERS.map(c => {
                const churnColor = c.churnRisk >= 60 ? '#ff4444' : c.churnRisk >= 30 ? '#ffb347' : '#10d98a';
                return (
                  <tr key={c.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-[16px] px-1.5 py-0.5 rounded-full"
                        style={{ color: c.segment === 'VIP' ? '#7b93ff' : c.segment === 'At Risk' ? '#ff4444' : 'var(--cyan)', background: c.segment === 'VIP' ? 'rgba(123,147,255,.1)' : c.segment === 'At Risk' ? 'rgba(255,68,68,.1)' : 'rgba(0,217,255,.1)' }}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-bold" style={{ color: 'var(--cyan)' }}>{c$(c.clv)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${c.churnRisk}%`, background: churnColor }} />
                        </div>
                        <span style={{ color: churnColor }}>{c.churnRisk}% — {c.churnLabel}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5" style={{ color: c.nextOrderDays ? '#7b93ff' : '#ff4444' }}>
                      {c.nextOrderDays ? `~${c.nextOrderDays}d` : 'At risk'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function DeliverabilityPanel() {
  const [deliverability] = usePersistentState<DeliverabilityMetric[]>('email.deliverability', []);
  const STATUS_CFG = {
    ok:   { Icon: CheckCircle,   color: '#10d98a' },
    warn: { Icon: AlertTriangle, color: '#ffb347' },
    error:{ Icon: XCircle,       color: '#ff4444' },
  };
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}><span className="section-label">Email Deliverability</span></div>
      {deliverability.length === 0 && (
        <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>No deliverability data yet — connect your sending domain.</div>
      )}
      <div>
        {deliverability.map(m => {
          const sc = STATUS_CFG[m.status];
          return (
            <div key={m.label} className="flex items-start gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <sc.Icon size={14} style={{ color: sc.color, marginTop: 1, flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{m.label}</span>
                  <span className="data-value text-base font-semibold shrink-0" style={{ color: sc.color }}>{m.value}</span>
                </div>
                <div className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>{m.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Conversational SMS (F-09) ───────────────────────────────────────────────

const CONV_STATUS_CFG = {
  recovered:   { label: 'Recovered',    color: '#10d98a', bg: 'rgba(16,217,138,.1)'  },
  active:      { label: 'Active',       color: 'var(--cyan)', bg: 'rgba(0,217,255,.1)'   },
  no_response: { label: 'No Response',  color: '#ffb347', bg: 'rgba(255,179,71,.1)'  },
};

function ConversationalSmsPanel({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [allConversations, setConversations] = usePersistentState<SmsConversation[]>('email.conversations', []);
  const conversations = allConversations.filter(c => selectedStoreIds.includes(resolveStoreId(c.store, stores) ?? ''));
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const conv = conversations.find(c => c.id === selected);
  const recovered = conversations.filter(c => c.status === 'recovered');
  const recRevenue = recovered.reduce((s, c) => s + c.cartValue, 0);

  const sendReply = () => {
    if (!reply.trim() || !selected) return;
    const text = reply.trim();
    setConversations(prev => prev.map(c => c.id !== selected ? c : {
      ...c,
      messages: [...c.messages, { role: 'brand', text, time: 'just now' }],
    }));
    setReply('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Conversations', value: conversations.filter(c => c.status === 'active').length.toString(), color: 'var(--cyan)' },
          { label: 'Recovered (30d)',       value: recovered.length.toString(), color: '#10d98a' },
          { label: 'Revenue Recovered',     value: c$(recRevenue), color: '#ffb347' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4" style={{ minHeight: 360 }}>
        {/* Conversation list */}
        <div className="flex flex-col gap-2 shrink-0" style={{ width: 240 }}>
          {conversations.length === 0 && (
            <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>No SMS conversations yet.</div>
          )}
          {conversations.map(c => {
            const sc = CONV_STATUS_CFG[c.status];
            const last = c.messages[c.messages.length - 1];
            return (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className="glass-card p-3 text-left transition-all"
                style={{ border: selected === c.id ? '1px solid #00d9ff44' : '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{c.customer}</span>
                  <span className="text-[16px] px-1.5 py-0.5 rounded-full" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                </div>
                <div className="text-[16px] mb-1" style={{ color: 'var(--text-muted)' }}>{c.store} · {c$(c.cartValue)}</div>
                <div className="text-[16px] truncate" style={{ color: 'var(--text-secondary)' }}>{last.text.slice(0, 45)}…</div>
              </button>
            );
          })}
        </div>

        {/* Chat window */}
        {conv && (
          <div className="flex-1 glass-card flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{conv.customer}</div>
                <div className="section-label">{conv.store} · Cart: {c$(conv.cartValue)}</div>
              </div>
              <span className="ml-auto text-[16px] px-2 py-0.5 rounded-full" style={{ color: CONV_STATUS_CFG[conv.status].color, background: CONV_STATUS_CFG[conv.status].bg }}>
                {CONV_STATUS_CFG[conv.status].label}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {conv.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'brand' ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[75%] rounded-xl px-3 py-2"
                    style={{
                      background: msg.role === 'brand' ? 'var(--bg-elevated)' : 'rgba(0,217,255,.12)',
                      border: msg.role === 'brand' ? '1px solid var(--border-dim)' : '1px solid rgba(0,217,255,.25)',
                    }}>
                    <div className="text-base" style={{ color: 'var(--text-primary)' }}>{msg.text}</div>
                    <div className="text-[16px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
            {conv.status === 'active' && (
              <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} placeholder="Type a reply…" className="flex-1 px-3 py-2 rounded-lg text-base"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
                <button onClick={sendReply} className="px-3 py-2 rounded-lg text-base font-medium" style={{ background: 'var(--accent-blue)', color: '#fff' }}>Send</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SMS types ───────────────────────────────────────────────────────────────

const SMS_FLOW_STATUS_BADGE: Record<SmsFlowStatus, { color: string; bg: string; label: string }> = {
  active: { color: '#10d98a', bg: 'rgba(16,217,138,0.1)', label: 'Active' },
  paused: { color: '#ffb347', bg: 'rgba(255,179,71,0.1)', label: 'Paused' },
};

type SmsSubTab = 'campaigns' | 'flows' | 'conversational' | 'compliance';

function SmsFlowCard({ flow }: { flow: SmsFlow }) {
  const badge = SMS_FLOW_STATUS_BADGE[flow.status];
  const [enabled, setEnabled] = usePersistentState(`email.smsFlowEnabled.${flow.id}`, flow.status === 'active');
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{flow.name}</div>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
            <span className="text-[16px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)' }}>{flow.trigger}</span>
          </div>
        </div>
        <button onClick={() => setEnabled(e => !e)}
          className="p-1.5 rounded-lg transition-all ml-2 shrink-0"
          style={{ background: enabled ? 'rgba(255,179,71,0.08)' : 'rgba(16,217,138,0.08)', color: enabled ? '#ffb347' : '#10d98a' }}>
          {enabled ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-elevated)' }}>
          <div className="data-value text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Mono' }}>{flow.steps}</div>
          <div className="section-label" style={{ fontSize: 16 }}>Steps</div>
        </div>
        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-elevated)' }}>
          <div className="data-value text-base font-semibold" style={{ color: 'var(--cyan)', fontFamily: 'DM Mono' }}>{fmt(flow.triggered30d)}</div>
          <div className="section-label" style={{ fontSize: 16 }}>Triggered</div>
        </div>
        <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-elevated)' }}>
          <div className="data-value text-base font-semibold" style={{ color: flow.convRate !== null ? '#10d98a' : 'var(--text-muted)', fontFamily: 'DM Mono' }}>
            {flow.convRate !== null ? flow.convRate.toFixed(1) + '%' : '—'}
          </div>
          <div className="section-label" style={{ fontSize: 16 }}>Conv. Rate</div>
        </div>
      </div>
      {flow.revenue30d > 0 && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-base" style={{ color: 'var(--text-muted)' }}>30d revenue</span>
          <span className="data-value text-base font-semibold" style={{ color: '#ffb347', fontFamily: 'DM Mono' }}>{c$(flow.revenue30d)}</span>
        </div>
      )}
    </div>
  );
}

// ─── SMS Panel ───────────────────────────────────────────────────────────────

function SmsCampaignsPanel({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [subTab, setSubTab] = useState<SmsSubTab>('campaigns');
  const [compliance, setCompliance] = usePersistentState<Record<string, boolean>>('email.compliance', {
    'TCPA Consent Required': true,
    'Double Opt-In': true,
    'Auto Opt-Out Instruction': true,
    'Brand Name in Footer': true,
    'Quiet Hours': true,
    'Weekend Restriction': false,
  });
  const toggleCompliance = (label: string) => setCompliance(prev => ({ ...prev, [label]: !prev[label] }));

  const [allSmsCampaigns, setSmsCampaigns] = usePersistentState<SmsCampaign[]>('email.smsCampaigns', []);
  const inScope = (store: string) => store === 'All Stores' || selectedStoreIds.includes(resolveStoreId(store, stores) ?? '');
  const SMS_CAMPAIGNS = allSmsCampaigns.filter(c => inScope(c.store));
  const [newSmsStore, setNewSmsStore] = useState(stores[0]?.id ?? '');
  const addSmsCampaign = () => {
    const id = `sms-${Date.now()}`;
    setSmsCampaigns(prev => [{
      id, name: 'Untitled SMS Campaign', status: 'draft', sentAt: '—',
      recipients: 0, delivered: 0, deliveryRate: 0, ctr: 0, conversions: 0, revenue: 0, store: newSmsStore,
    }, ...prev]);
  };

  const [allSmsFlows] = usePersistentState<SmsFlow[]>('email.smsFlows', []);
  const SMS_FLOWS = allSmsFlows.filter(f => inScope(f.store));

  const sentCampaigns = SMS_CAMPAIGNS.filter(c => c.status === 'sent');
  const smsStats = computeSmsStats(sentCampaigns);
  const totalSent = smsStats.totalSent;
  const avgDelivery = smsStats.avgDelivery;
  const avgCtr = smsStats.avgCtr;
  const smsRevenue = smsStats.revenue;

  const STATUS_BADGE: Record<SmsStatus, { color: string; label: string }> = {
    sent:      { color: '#10d98a', label: 'Sent'      },
    scheduled: { color: 'var(--cyan)', label: 'Scheduled' },
    draft:     { color: '#7b93ff', label: 'Draft'     },
  };

  const SUB_TABS: { key: SmsSubTab; label: string }[] = [
    { key: 'campaigns',      label: 'Campaigns'      },
    { key: 'flows',          label: 'Flows'          },
    { key: 'conversational', label: 'Conversational' },
    { key: 'compliance',     label: 'Compliance'     },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header stats */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Total SMS Sent (30d)', value: fmt(totalSent),              color: 'var(--cyan)' },
          { label: 'Avg Delivery Rate',    value: avgDelivery.toFixed(1) + '%', color: '#10d98a' },
          { label: 'Avg CTR',              value: avgCtr.toFixed(1) + '%',      color: '#7b93ff' },
          { label: 'SMS Revenue (30d)',     value: c$(smsRevenue),              color: '#ffb347' },
        ].map(stat => (
          <div key={stat.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1.5">{stat.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: stat.color, fontFamily: 'DM Mono' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className="px-3 py-1.5 rounded-lg text-base transition-all"
            style={{
              background: subTab === t.key ? 'var(--bg-elevated)' : 'transparent',
              color: subTab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: subTab === t.key ? 500 : 400,
              border: subTab === t.key ? '1px solid var(--border-dim)' : '1px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* SMS Campaigns */}
      {subTab === 'campaigns' && (
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="section-label">SMS Campaigns</span>
            <div className="flex items-center gap-2">
              <select value={newSmsStore} onChange={e => setNewSmsStore(e.target.value)}
                className="text-base px-2 py-1.5 rounded-lg" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button onClick={addSmsCampaign} className="text-base px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                + New SMS Campaign
              </button>
            </div>
          </div>
          {SMS_CAMPAIGNS.length === 0 && (
            <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
              {allSmsCampaigns.length === 0 ? 'No SMS campaigns yet.' : `No SMS campaigns for the selected store${selectedStoreIds.length !== 1 ? 's' : ''}.`}
            </div>
          )}
          {SMS_CAMPAIGNS.map(camp => {
            const badge = STATUS_BADGE[camp.status];
            const isSent = camp.status === 'sent';
            return (
              <div key={camp.id} className="border-b px-4 py-3 hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: badge.color + '18', color: badge.color }}>{badge.label}</span>
                      <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(123,147,255,0.1)', color: '#7b93ff' }}>{camp.store}</span>
                      <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>{camp.sentAt}</span>
                    </div>
                    <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{camp.name}</div>
                    {isSent && (
                      <div className="text-[16px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {fmt(camp.recipients)} recipients
                      </div>
                    )}
                  </div>
                  {isSent && (
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="data-value text-base font-semibold" style={{ color: '#10d98a', fontFamily: 'DM Mono' }}>{camp.deliveryRate.toFixed(1)}%</div>
                        <div className="section-label">Delivery</div>
                      </div>
                      <div className="text-right">
                        <div className="data-value text-base font-semibold" style={{ color: 'var(--cyan)', fontFamily: 'DM Mono' }}>{camp.ctr.toFixed(1)}%</div>
                        <div className="section-label">CTR</div>
                      </div>
                      <div className="text-right">
                        <div className="data-value text-base font-semibold" style={{ color: '#7b93ff', fontFamily: 'DM Mono' }}>{camp.conversions}</div>
                        <div className="section-label">Conv.</div>
                      </div>
                      <div className="text-right">
                        <div className="data-value text-base font-semibold" style={{ color: '#ffb347', fontFamily: 'DM Mono' }}>{c$(camp.revenue)}</div>
                        <div className="section-label">Revenue</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SMS Flows */}
      {subTab === 'flows' && (
        <div className="grid grid-cols-2 gap-3">
          {SMS_FLOWS.length === 0 && (
            <div className="col-span-2 text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
              {allSmsFlows.length === 0 ? 'No SMS flows yet.' : `No SMS flows for the selected store${selectedStoreIds.length !== 1 ? 's' : ''}.`}
            </div>
          )}
          {SMS_FLOWS.map(flow => <SmsFlowCard key={flow.id} flow={flow} />)}
        </div>
      )}

      {/* Conversational SMS Recovery (F-09) */}
      {subTab === 'conversational' && (
        <ConversationalSmsPanel selectedStoreIds={selectedStoreIds} />
      )}

      {/* SMS Compliance */}
      {subTab === 'compliance' && (
        <div className="flex flex-col gap-4">
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="section-label">Opt-In Management</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {[
                { label: 'TCPA Consent Required', detail: 'Require explicit TCPA consent before sending any SMS' },
                { label: 'Double Opt-In', detail: 'Send confirmation SMS when subscriber joins — reply to confirm' },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <div>
                    <div className="text-base font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                    <div className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>{item.detail}</div>
                  </div>
                  <div onClick={() => toggleCompliance(item.label)} className="w-9 h-5 rounded-full shrink-0 flex items-center px-0.5 cursor-pointer"
                    style={{ background: compliance[item.label] ? '#10d98a' : 'rgba(var(--overlay-rgb),0.1)' }}>
                    <div className="w-4 h-4 rounded-full bg-white transition-all" style={{ marginLeft: compliance[item.label] ? 'auto' : 0 }} />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Opt-In Keyword', value: 'JOIN' },
                  { label: 'Opt-Out Keywords', value: 'STOP · UNSUBSCRIBE' },
                ].map(kw => (
                  <div key={kw.label} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="text-[16px] mb-1.5 section-label">{kw.label}</div>
                    <div className="text-base font-semibold font-mono" style={{ color: 'var(--cyan)' }}>{kw.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="section-label">Message Footer</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {[
                { label: 'Auto Opt-Out Instruction', detail: 'Append "Reply STOP to unsubscribe" to every message' },
                { label: 'Brand Name in Footer', detail: 'Include brand name to comply with A2P 10DLC requirements' },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <div>
                    <div className="text-base font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                    <div className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>{item.detail}</div>
                  </div>
                  <div onClick={() => toggleCompliance(item.label)} className="w-9 h-5 rounded-full shrink-0 flex items-center px-0.5 cursor-pointer"
                    style={{ background: compliance[item.label] ? '#10d98a' : 'rgba(var(--overlay-rgb),0.1)' }}>
                    <div className="w-4 h-4 rounded-full bg-white transition-all" style={{ marginLeft: compliance[item.label] ? 'auto' : 0 }} />
                  </div>
                </div>
              ))}
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(0,217,255,0.12)' }}>
                <div className="text-[16px] mb-2 section-label">Footer Preview</div>
                <div className="text-base p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)', fontFamily: 'DM Mono' }}>
                  [MarketOS] Reply STOP to unsubscribe · Msg &amp; data rates may apply
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="section-label">Sending Restrictions</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {[
                { label: 'Quiet Hours', detail: 'No messages between 9:00 PM – 9:00 AM recipient local time' },
                { label: 'Weekend Restriction', detail: 'Suppress non-transactional messages on Saturday & Sunday' },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <div>
                    <div className="text-base font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                    <div className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>{item.detail}</div>
                  </div>
                  <div onClick={() => toggleCompliance(item.label)} className="w-9 h-5 rounded-full shrink-0 flex items-center px-0.5 cursor-pointer"
                    style={{ background: compliance[item.label] ? '#10d98a' : 'rgba(var(--overlay-rgb),0.1)' }}>
                    <div className="w-4 h-4 rounded-full bg-white transition-all" style={{ marginLeft: compliance[item.label] ? 'auto' : 0 }} />
                  </div>
                </div>
              ))}
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <div className="text-[16px] mb-2 section-label">Frequency Cap</div>
                <div className="flex items-center gap-2">
                  <span className="text-base" style={{ color: 'var(--text-secondary)' }}>Max</span>
                  <span className="text-base font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', fontFamily: 'DM Mono' }}>3</span>
                  <span className="text-base" style={{ color: 'var(--text-secondary)' }}>messages per contact per week</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="section-label mb-3">Compliance Status</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                'TCPA consent in place',
                'Opt-out keywords configured',
                'Footer opt-out text enabled',
                'Quiet hours enforced',
                'A2P 10DLC registered',
                'Double opt-in active',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-base" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle size={12} style={{ color: '#10d98a', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Push types ───────────────────────────────────────────────────────────────

type PushSubTab = 'campaigns' | 'automations' | 'health';

const PUSH_AUTO_STATUS_BADGE: Record<PushAutoStatus, { color: string; bg: string; label: string }> = {
  active: { color: '#10d98a', bg: 'rgba(16,217,138,0.1)', label: 'Active' },
  paused: { color: '#ffb347', bg: 'rgba(255,179,71,0.1)', label: 'Paused' },
};

function PushAutoRow({ auto }: { auto: PushAutomation }) {
  const badge = PUSH_AUTO_STATUS_BADGE[auto.status];
  const [enabled, setEnabled] = usePersistentState(`email.pushAutoEnabled.${auto.id}`, auto.status === 'active');
  return (
    <div className="border-b px-4 py-3 hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
            <span className="text-[16px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)' }}>{auto.trigger}</span>
          </div>
          <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{auto.name}</div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="data-value text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Mono' }}>{fmt(auto.triggered30d)}</div>
            <div className="section-label">Triggered</div>
          </div>
          <div className="text-right">
            <div className="data-value text-base font-semibold" style={{ color: '#10d98a', fontFamily: 'DM Mono' }}>{auto.ctr.toFixed(1)}%</div>
            <div className="section-label">CTR</div>
          </div>
          {auto.revenue30d > 0 && (
            <div className="text-right">
              <div className="data-value text-base font-semibold" style={{ color: '#ffb347', fontFamily: 'DM Mono' }}>{c$(auto.revenue30d)}</div>
              <div className="section-label">Revenue</div>
            </div>
          )}
          <button onClick={() => setEnabled(e => !e)}
            className="p-1.5 rounded-lg transition-all"
            style={{ background: enabled ? 'rgba(255,179,71,0.08)' : 'rgba(16,217,138,0.08)', color: enabled ? '#ffb347' : '#10d98a' }}>
            {enabled ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Push Panel ───────────────────────────────────────────────────────────────

function PushPanel({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [subTab, setSubTab] = useState<PushSubTab>('campaigns');
  const inScope = (store: string) => store === 'All Stores' || selectedStoreIds.includes(resolveStoreId(store, stores) ?? '');

  const [allPushCampaigns, setPushCampaigns] = usePersistentState<PushCampaign[]>('email.pushCampaigns', []);
  const PUSH_CAMPAIGNS = allPushCampaigns.filter(c => inScope(c.store));
  const [newPushStore, setNewPushStore] = useState('All Stores');
  const addPushCampaign = () => {
    const id = `pn-${Date.now()}`;
    setPushCampaigns(prev => [{
      id, name: 'Untitled Push Campaign', status: 'scheduled', sentAt: 'Not scheduled',
      sent: 0, delivered: 0, clicked: 0, ctr: 0, revenue: 0, store: newPushStore,
    }, ...prev]);
  };

  const [allPushAutomations] = usePersistentState<PushAutomation[]>('email.pushAutomations', []);
  const PUSH_AUTOMATIONS = allPushAutomations.filter(a => inScope(a.store));

  const PUSH_CAMPAIGN_BADGE: Record<PushStatus, { color: string; label: string }> = {
    sent:      { color: '#10d98a', label: 'Sent'      },
    scheduled: { color: 'var(--cyan)', label: 'Scheduled' },
  };


  const SUB_TABS: { key: PushSubTab; label: string }[] = [
    { key: 'campaigns',    label: 'Campaigns'   },
    { key: 'automations',  label: 'Automations' },
    { key: 'health',       label: 'Subscriber Health' },
  ];

  const pushStats = computePushStats(PUSH_CAMPAIGNS);

  const [allSubscribersByStore] = usePersistentState<PushSubscriberCount[]>('email.pushSubscribersByStore', []);
  const STORES = allSubscribersByStore.filter(s => selectedStoreIds.includes(resolveStoreId(s.store, stores) ?? ''));
  const totalSubscribers = STORES.reduce((s, st) => s + st.subscribers, 0);

  // No real subscriber-activity/browser tracking model exists yet — zeroed
  // until a real push-subscription analytics pipeline is connected.
  const ACTIVITY: Array<{ label: string; count: number; color: string }> = [];
  const BROWSERS: Array<{ name: string; pct: number; color: string }> = [];

  return (
    <div className="flex flex-col gap-4">
      {/* Header stats */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Push Subscribers',  value: fmt(totalSubscribers),  color: 'var(--cyan)' },
          { label: 'Avg CTR',           value: pushStats.avgCtr > 0 ? pushStats.avgCtr.toFixed(1) + '%' : '—', color: '#10d98a' },
          { label: 'Revenue (30d)',      value: c$(pushStats.totalRevenue30d), color: '#ffb347' },
          { label: 'Opt-In Rate',        value: '—', color: '#7b93ff' },
        ].map(stat => (
          <div key={stat.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1.5">{stat.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: stat.color, fontFamily: 'DM Mono' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className="px-3 py-1.5 rounded-lg text-base transition-all"
            style={{
              background: subTab === t.key ? 'var(--bg-elevated)' : 'transparent',
              color: subTab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: subTab === t.key ? 500 : 400,
              border: subTab === t.key ? '1px solid var(--border-dim)' : '1px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Push Campaigns */}
      {subTab === 'campaigns' && (
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="section-label">Push Campaigns</span>
            <div className="flex items-center gap-2">
              <select value={newPushStore} onChange={e => setNewPushStore(e.target.value)}
                className="text-base px-2 py-1.5 rounded-lg" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                <option value="All Stores">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.domain}>{s.name}</option>)}
              </select>
              <button onClick={addPushCampaign} className="text-base px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                + New Push Campaign
              </button>
            </div>
          </div>
          {PUSH_CAMPAIGNS.length === 0 && (
            <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
              {allPushCampaigns.length === 0 ? 'No push campaigns yet.' : `No push campaigns for the selected store${selectedStoreIds.length !== 1 ? 's' : ''}.`}
            </div>
          )}
          {PUSH_CAMPAIGNS.map(camp => {
            const badge = PUSH_CAMPAIGN_BADGE[camp.status];
            const isSent = camp.status === 'sent';
            return (
              <div key={camp.id} className="border-b px-4 py-3 hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: badge.color + '18', color: badge.color }}>{badge.label}</span>
                      <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>{camp.sentAt}</span>
                    </div>
                    <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{camp.name}</div>
                    {isSent && (
                      <div className="text-[16px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {fmt(camp.sent)} sent · {fmt(camp.delivered)} delivered
                      </div>
                    )}
                  </div>
                  {isSent && (
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="data-value text-base font-semibold" style={{ color: 'var(--cyan)', fontFamily: 'DM Mono' }}>{fmt(camp.clicked)}</div>
                        <div className="section-label">Clicked</div>
                      </div>
                      <div className="text-right">
                        <div className="data-value text-base font-semibold" style={{ color: '#10d98a', fontFamily: 'DM Mono' }}>{camp.ctr.toFixed(1)}%</div>
                        <div className="section-label">CTR</div>
                      </div>
                      <div className="text-right">
                        <div className="data-value text-base font-semibold" style={{ color: '#ffb347', fontFamily: 'DM Mono' }}>{c$(camp.revenue)}</div>
                        <div className="section-label">Revenue</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Push Automations */}
      {subTab === 'automations' && (
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="section-label">Push Automations</span>
          </div>
          {PUSH_AUTOMATIONS.length === 0 && (
            <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
              {allPushAutomations.length === 0 ? 'No push automations yet.' : `No push automations for the selected store${selectedStoreIds.length !== 1 ? 's' : ''}.`}
            </div>
          )}
          {PUSH_AUTOMATIONS.map(auto => <PushAutoRow key={auto.id} auto={auto} />)}
        </div>
      )}

      {/* Push Subscriber Health */}
      {subTab === 'health' && (
        <div className="flex flex-col gap-4">
          {/* Subscribers by store */}
          <div className="glass-card p-4">
            <div className="section-label mb-3">Subscribers by Store</div>
            {STORES.length === 0 ? (
              <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No push subscriber data yet.</div>
            ) : (
            <div className="flex flex-col gap-2">
              {STORES.map(store => {
                const pct = totalSubscribers > 0 ? (store.subscribers / totalSubscribers) * 100 : 0;
                return (
                  <div key={store.store}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base" style={{ color: 'var(--text-secondary)' }}>{store.store}</span>
                      <span className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Mono' }}>{fmt(store.subscribers)}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="h-full rounded-full" style={{ width: pct + '%', background: '#00d9ff' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>

          {/* 30-day activity breakdown */}
          <div className="glass-card p-4">
            <div className="section-label mb-3">30-Day Activity Breakdown</div>
            {ACTIVITY.length === 0 ? (
              <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No subscriber activity data yet.</div>
            ) : (
            <>
            <div className="flex h-4 rounded-full overflow-hidden mb-3 gap-px">
              {ACTIVITY.map(a => (
                <div key={a.label} style={{ flex: a.count, background: a.color }} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ACTIVITY.map(a => (
                <div key={a.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-elevated)', border: `1px solid ${a.color}20` }}>
                  <div className="data-value text-lg font-bold mb-0.5" style={{ color: a.color, fontFamily: 'DM Mono' }}>{fmt(a.count)}</div>
                  <div className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>{a.label}</div>
                </div>
              ))}
            </div>
            </>
            )}
          </div>

          {/* Browser breakdown */}
          <div className="glass-card p-4">
            <div className="section-label mb-3">Browser Breakdown</div>
            {BROWSERS.length === 0 ? (
              <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No browser breakdown data yet.</div>
            ) : (
            <div className="flex flex-col gap-2">
              {BROWSERS.map(b => (
                <div key={b.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base" style={{ color: 'var(--text-secondary)' }}>{b.name}</span>
                    <span className="text-base font-semibold" style={{ color: b.color, fontFamily: 'DM Mono' }}>{b.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="h-full rounded-full" style={{ width: b.pct + '%', background: b.color }} />
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Email Builder (F-01) ─────────────────────────────────────────────────────

type BlockType = 'header' | 'text' | 'image' | 'button' | 'divider' | 'spacer';
interface EmailBlock { id: string; type: BlockType; label: string }

const BLOCK_PALETTE: { type: BlockType; label: string; icon: string }[] = [
  { type: 'header',  label: 'Header',  icon: 'H' },
  { type: 'image',   label: 'Image',   icon: '🖼' },
  { type: 'text',    label: 'Text',    icon: 'T' },
  { type: 'button',  label: 'Button',  icon: '⬛' },
  { type: 'divider', label: 'Divider', icon: '—' },
  { type: 'spacer',  label: 'Spacer',  icon: '↕' },
];

const INITIAL_BLOCKS: EmailBlock[] = [
  { id: 'b1', type: 'header',  label: 'Header — Logo + Nav' },
  { id: 'b2', type: 'image',   label: 'Hero Image' },
  { id: 'b3', type: 'text',    label: 'Body Copy' },
  { id: 'b4', type: 'button',  label: 'CTA Button — Shop Now' },
  { id: 'b5', type: 'divider', label: 'Divider' },
  { id: 'b6', type: 'text',    label: 'Footer Text' },
];

function EmailBuilderPanel() {
  const [blocks, setBlocks] = useState<EmailBlock[]>(INITIAL_BLOCKS);
  const [selected, setSelected] = useState<string | null>('b3');
  const [subject, setSubject] = useState('Spring Sale — 20% off all donut equipment');
  const [previewText, setPreviewText] = useState('Ends Sunday · Shop your favorites');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const runAction = (label: string) => {
    const done: Record<string, string> = {
      'Save Draft': 'Saved', 'Preview': 'Preview ready', 'Send Test': 'Sent', 'Schedule Send': 'Scheduled',
    };
    setActionFeedback(`${label}: ${done[label] ?? 'Done'}`);
    setTimeout(() => setActionFeedback(prev => (prev && prev.startsWith(label) ? null : prev)), 2000);
  };

  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setBlocks(prev => { const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
  };
  const moveDown = (idx: number) => {
    setBlocks(prev => { if (idx >= prev.length - 1) return prev; const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a; });
  };
  const addBlock = (type: BlockType) => {
    const label = BLOCK_PALETTE.find(b => b.type === type)?.label ?? type;
    setBlocks(prev => [...prev, { id: `b${Date.now()}`, type, label }]);
  };

  const BLOCK_COLOR: Record<BlockType, string> = {
    header: '#00d9ff', image: '#7b93ff', text: 'var(--text-primary)',
    button: '#10d98a', divider: 'var(--text-muted)', spacer: 'var(--text-muted)',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Subject / preview */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[16px] section-label block mb-1.5">Subject Line</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-base"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="text-[16px] section-label block mb-1.5">Preview Text</label>
            <input value={previewText} onChange={e => setPreviewText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-base"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4" style={{ minHeight: 480 }}>
        {/* Block palette */}
        <div className="flex flex-col gap-3">
          <div className="glass-card p-3">
            <div className="section-label mb-3">Add Block</div>
            <div className="grid grid-cols-2 gap-2">
              {BLOCK_PALETTE.map(b => (
                <button key={b.type} onClick={() => addBlock(b.type)}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all hover:bg-white/[0.05]"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-base">{b.icon}</span>
                  <span className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-3">
            <div className="section-label mb-3">Actions</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Save Draft',    color: '#7b93ff' },
                { label: 'Preview',       color: 'var(--cyan)' },
                { label: 'Send Test',     color: '#ffb347' },
                { label: 'Schedule Send', color: '#10d98a' },
              ].map(a => (
                <button key={a.label} onClick={() => runAction(a.label)}
                  className="text-base py-2 rounded-lg text-left px-3 transition-all hover:bg-white/[0.05]"
                  style={{ background: 'var(--bg-elevated)', color: a.color }}>
                  {a.label}
                </button>
              ))}
              {actionFeedback && (
                <div className="text-[16px] mt-1 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ background: 'rgba(16,217,138,0.08)', color: '#10d98a' }}>
                  <CheckCircle size={11} />{actionFeedback}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="col-span-3 glass-card overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="section-label">Canvas — Drag & Drop</span>
            <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>{blocks.length} blocks</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {blocks.map((block, idx) => (
              <div key={block.id} onClick={() => setSelected(block.id)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: selected === block.id ? 'rgba(0,217,255,0.05)' : 'var(--bg-elevated)',
                  border: `1px solid ${selected === block.id ? 'rgba(0,217,255,0.3)' : 'var(--border-subtle)'}`,
                }}>
                <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span className="text-[16px] w-16 px-1.5 py-0.5 rounded text-center font-medium shrink-0"
                  style={{ background: 'var(--bg-overlay)', color: BLOCK_COLOR[block.type] }}>
                  {block.type}
                </span>
                <span className="flex-1 text-base" style={{ color: 'var(--text-primary)' }}>{block.label}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={e => { e.stopPropagation(); moveUp(idx); }} className="p-1 rounded hover:bg-white/[0.05]" style={{ color: 'var(--text-muted)' }}>
                    <ChevronUp size={11} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); moveDown(idx); }} className="p-1 rounded hover:bg-white/[0.05]" style={{ color: 'var(--text-muted)' }}>
                    <ChevronDown size={11} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} className="p-1 rounded hover:bg-white/[0.05]" style={{ color: '#ff4444' }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => addBlock('text')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-base border-2 border-dashed transition-all hover:bg-white/[0.02]"
              style={{ borderColor: 'var(--border-dim)', color: 'var(--text-muted)' }}>
              <Plus size={12} />Add Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Send-Time Optimization (F-11) ───────────────────────────────────────────

// Empty until real per-subscriber open-time history is available.
const SEND_TIME_SUBSCRIBERS: Array<{ id: string; name: string; segment: string; optimalTime: string; engRate: number; tz: string; opens: number }> = [];
const BEST_WINDOWS: Array<{ day: string; slots: Array<{ time: string; score: number }> }> = [];

function SendTimePanel() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Subscribers w/ AI Send Time', value: SEND_TIME_SUBSCRIBERS.length.toString(), color: 'var(--cyan)' },
          { label: 'Avg Open Rate Lift',           value: '—',  color: '#10d98a' },
          { label: 'Timezones Covered',            value: new Set(SEND_TIME_SUBSCRIBERS.map(s => s.tz)).size.toString(), color: '#7b93ff' },
          { label: 'Predictions Updated',          value: 'Daily',   color: '#ffb347' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color, fontFamily: 'DM Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <div className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Predictive Send-Time Optimization</div>
          <div className="text-base" style={{ color: 'var(--text-muted)' }}>Sends each email at the individual subscriber's highest-engagement window based on 90-day open history</div>
        </div>
        <button onClick={() => setEnabled(v => !v)}
          className="w-11 h-6 rounded-full flex items-center px-0.5 shrink-0 transition-all"
          style={{ background: enabled ? '#10d98a' : 'rgba(var(--overlay-rgb),0.1)' }}>
          <div className="w-5 h-5 rounded-full bg-white transition-all" style={{ marginLeft: enabled ? 'auto' : 0 }} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Optimal send-time heatmap */}
        <div className="glass-card p-4">
          <div className="section-label mb-3">Best Send Windows (Engagement Score)</div>
          {BEST_WINDOWS.length === 0 && (
            <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No send-time data yet.</div>
          )}
          <div className="flex flex-col gap-2">
            {BEST_WINDOWS.map(w => (
              <div key={w.day} className="flex items-center gap-3">
                <span className="text-[16px] w-6 shrink-0 font-medium" style={{ color: 'var(--text-muted)' }}>{w.day}</span>
                <div className="flex gap-2 flex-1">
                  {w.slots.map(s => (
                    <div key={s.time} className="flex-1 rounded-lg px-2 py-1.5 text-center"
                      style={{
                        background: s.score >= 75 ? 'rgba(16,217,138,0.15)' : s.score >= 50 ? 'rgba(0,217,255,0.1)' : 'var(--bg-elevated)',
                        border: `1px solid ${s.score >= 75 ? 'rgba(16,217,138,0.2)' : 'var(--border-subtle)'}`,
                      }}>
                      <div className="text-[16px] font-mono font-bold" style={{ color: s.score >= 75 ? '#10d98a' : s.score >= 50 ? 'var(--cyan)' : 'var(--text-muted)' }}>{s.score}</div>
                      <div className="text-[16px]" style={{ color: 'var(--text-muted)' }}>{s.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-subscriber table */}
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="section-label">Per-Subscriber Optimal Times</span>
          </div>
          <table className="w-full text-base">
            <thead style={{ background: 'var(--bg-elevated)' }}>
              <tr>
                {['Subscriber', 'Optimal Time', 'Eng. Rate', 'TZ'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEND_TIME_SUBSCRIBERS.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-base" style={{ color: 'var(--text-muted)' }}>No subscriber data yet.</td></tr>
              )}
              {SEND_TIME_SUBSCRIBERS.map(s => (
                <tr key={s.id} className="border-b transition-colors" style={{ borderColor: 'var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                  <td className="px-3 py-2.5 font-mono" style={{ color: 'var(--cyan)' }}>{s.optimalTime}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${s.engRate}%`, background: s.engRate >= 60 ? '#10d98a' : s.engRate >= 30 ? '#ffb347' : '#ff4444' }} />
                      </div>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.engRate}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[16px]" style={{ color: 'var(--text-muted)' }}>{s.tz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Email A/B Testing (F-14) ─────────────────────────────────────────────────

function EmailABPanel({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [allTests, setTests] = usePersistentState<EmailABTest[]>('email.abTests', []);
  const inScope = (store: string) => store === 'All Stores' || selectedStoreIds.includes(resolveStoreId(store, stores) ?? '');
  const tests = allTests.filter(t => inScope(t.store));
  const [newTestStore, setNewTestStore] = useState(stores[0]?.id ?? '');
  const addTest = () => {
    const id = `ab-${Date.now()}`;
    setTests(prev => [{
      id, name: 'Untitled A/B Test', type: 'subject', status: 'draft', store: newTestStore,
      variantA: 'Variant A subject', variantB: 'Variant B subject',
      openA: 0, openB: 0, clickA: 0, clickB: 0, sampleSize: 2000, confidence: 0, winner: null, started: '—',
    }, ...prev]);
  };
  const TYPE_LABEL: Record<ABTestType, string> = { subject: 'Subject Line', content: 'Content', send_time: 'Send Time' };
  const TYPE_COLOR: Record<ABTestType, string> = { subject: '#00d9ff', content: '#7b93ff', send_time: '#ffb347' };
  const STATUS_CFG: Record<ABTestStatus, { color: string; bg: string; label: string }> = {
    running:   { color: '#10d98a', bg: 'rgba(16,217,138,.1)', label: 'Running'   },
    completed: { color: 'var(--cyan)', bg: 'rgba(0,217,255,.1)',  label: 'Completed' },
    draft:     { color: '#7b93ff', bg: 'rgba(123,147,255,.1)', label: 'Draft'    },
  };
  const abStats = computeAbTestStats(tests);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Tests',      value: tests.filter(t => t.status === 'running').length.toString(), color: '#10d98a' },
          { label: 'Completed (30d)',   value: tests.filter(t => t.status === 'completed').length.toString(), color: 'var(--cyan)' },
          { label: 'Avg Confidence',    value: abStats.avgConfidence > 0 ? abStats.avgConfidence + '%' : '—', color: '#7b93ff' },
          { label: 'Avg Open Rate Lift', value: abStats.avgOpenLift !== 0 ? (abStats.avgOpenLift > 0 ? '+' : '') + abStats.avgOpenLift + '%' : '—', color: '#ffb347' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color, fontFamily: 'DM Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="section-label">A/B Tests</span>
          <div className="flex items-center gap-2">
            <select value={newTestStore} onChange={e => setNewTestStore(e.target.value)}
              className="text-base px-2 py-1.5 rounded-lg" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={addTest} className="text-base px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
              style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
              <Plus size={11} />New Test
            </button>
          </div>
        </div>
        {tests.length === 0 && (
          <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
            {allTests.length === 0 ? 'No A/B tests yet — create one to get started.' : `No A/B tests for the selected store${selectedStoreIds.length !== 1 ? 's' : ''}.`}
          </div>
        )}
        {tests.map(test => {
          const sc = STATUS_CFG[test.status];
          const winnerColor = test.winner ? '#10d98a' : 'var(--text-muted)';
          return (
            <div key={test.id} className="border-b px-4 py-4 hover:bg-white/[0.015] transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[16px] px-1.5 py-0.5 rounded" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    <span className="text-[16px] px-1.5 py-0.5 rounded" style={{ background: TYPE_COLOR[test.type] + '18', color: TYPE_COLOR[test.type] }}>{TYPE_LABEL[test.type]}</span>
                    <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Started {test.started}</span>
                  </div>
                  <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{test.name}</div>
                </div>
                {test.confidence > 0 && (
                  <div className="text-right shrink-0">
                    <div className="text-base font-bold" style={{ color: test.confidence >= 95 ? '#10d98a' : test.confidence >= 75 ? '#ffb347' : 'var(--text-secondary)', fontFamily: 'DM Mono' }}>{test.confidence}%</div>
                    <div className="text-[16px]" style={{ color: 'var(--text-muted)' }}>confidence</div>
                  </div>
                )}
              </div>

              {test.status !== 'draft' && (
                <div className="grid grid-cols-2 gap-2">
                  {(['A', 'B'] as const).map(v => {
                    const label = v === 'A' ? test.variantA : test.variantB;
                    const open  = v === 'A' ? test.openA  : test.openB;
                    const click = v === 'A' ? test.clickA : test.clickB;
                    const isWinner = test.winner === v;
                    return (
                      <div key={v} className="rounded-xl p-3"
                        style={{ background: isWinner ? 'rgba(16,217,138,0.05)' : 'var(--bg-elevated)', border: `1px solid ${isWinner ? 'rgba(16,217,138,0.2)' : 'var(--border-subtle)'}` }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[16px] w-4 h-4 rounded flex items-center justify-center font-bold"
                            style={{ background: isWinner ? 'rgba(16,217,138,.2)' : 'rgba(var(--overlay-rgb),.08)', color: isWinner ? '#10d98a' : 'var(--text-muted)' }}>
                            {v}
                          </span>
                          <span className="text-[16px] flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                          {isWinner && <CheckCircle size={11} style={{ color: '#10d98a', flexShrink: 0 }} />}
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <div className="data-value text-base font-bold" style={{ color: 'var(--cyan)', fontFamily: 'DM Mono' }}>{open.toFixed(1)}%</div>
                            <div className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Open</div>
                          </div>
                          <div>
                            <div className="data-value text-base font-bold" style={{ color: '#10d98a', fontFamily: 'DM Mono' }}>{click.toFixed(1)}%</div>
                            <div className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Click</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {test.status === 'draft' && (
                <div className="text-base py-2" style={{ color: 'var(--text-muted)' }}>
                  {test.variantA} vs {test.variantB} · {(test.sampleSize / 1000).toFixed(0)}K sample size
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Transactional Email (F-15) ───────────────────────────────────────────────

function TransactionalPanel({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [allTemplates, setTemplates] = usePersistentState<TxTemplate[]>('email.txTemplates', TX_TEMPLATES);
  const inScope = (store: string) => store === 'All Stores' || selectedStoreIds.includes(resolveStoreId(store, stores) ?? '');
  const templates = allTemplates.filter(t => inScope(t.store));
  const [flows, setFlows] = usePersistentState<Record<string, boolean>>(
    'email.txFlows',
    Object.fromEntries(TX_TEMPLATES.map(t => [t.id, t.status === 'active']))
  );
  const [newTemplateStore, setNewTemplateStore] = useState('All Stores');
  const addTemplate = () => {
    const id = `tx-${Date.now()}`;
    setTemplates(prev => [{
      id, name: 'Untitled Template', trigger: 'custom.event', status: 'draft',
      sent30d: 0, deliveryRate: 0, openRate: 0, store: newTemplateStore,
    }, ...prev]);
  };
  const STATUS_CFG: Record<TxStatus, { color: string; bg: string; label: string }> = {
    active: { color: '#10d98a', bg: 'rgba(16,217,138,.1)', label: 'Active' },
    paused: { color: '#ffb347', bg: 'rgba(255,179,71,.1)', label: 'Paused' },
    draft:  { color: '#7b93ff', bg: 'rgba(123,147,255,.1)', label: 'Draft' },
  };

  const active = templates.filter(t => t.status === 'active');
  const totalSent = active.reduce((s, t) => s + t.sent30d, 0);
  const avgDelivery = active.length > 0 ? active.reduce((s, t) => s + t.deliveryRate, 0) / active.length : 0;
  const avgOpen = active.length > 0 ? active.reduce((s, t) => s + t.openRate, 0) / active.length : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Sent (30d)',   value: fmt(totalSent),              color: 'var(--cyan)' },
          { label: 'Active Templates',   value: active.length.toString(),     color: '#10d98a' },
          { label: 'Avg Delivery Rate',  value: avgDelivery.toFixed(1) + '%', color: '#7b93ff' },
          { label: 'Avg Open Rate',      value: avgOpen.toFixed(1) + '%',     color: '#ffb347' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color, fontFamily: 'DM Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="section-label">Transactional Templates</span>
          <div className="flex items-center gap-2">
            <select value={newTemplateStore} onChange={e => setNewTemplateStore(e.target.value)}
              className="text-base px-2 py-1.5 rounded-lg" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              <option value="All Stores">All Stores</option>
              {stores.map(s => <option key={s.id} value={s.domain}>{s.name}</option>)}
            </select>
            <button onClick={addTemplate} className="text-base px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
              style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
              <Plus size={11} />New Template
            </button>
          </div>
        </div>
        {templates.length === 0 && (
          <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
            No transactional templates for the selected store{selectedStoreIds.length !== 1 ? 's' : ''}.
          </div>
        )}
        <table className="w-full text-base">
          <thead style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              {['Template', 'Trigger Event', 'Sent (30d)', 'Delivery', 'Open Rate', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {templates.map(t => {
              const sc = STATUS_CFG[t.status];
              const on = flows[t.id];
              return (
                <tr key={t.id} className="border-b transition-colors" style={{ borderColor: 'var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</td>
                  <td className="px-4 py-2.5 font-mono text-[16px]" style={{ color: 'var(--text-muted)' }}>{t.trigger}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'DM Mono' }}>{t.sent30d > 0 ? fmt(t.sent30d) : '—'}</td>
                  <td className="px-4 py-2.5" style={{ color: t.deliveryRate >= 99 ? '#10d98a' : t.deliveryRate >= 95 ? '#ffb347' : '#ff4444', fontFamily: 'DM Mono' }}>
                    {t.deliveryRate > 0 ? t.deliveryRate.toFixed(1) + '%' : '—'}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: t.openRate >= 70 ? '#10d98a' : t.openRate >= 40 ? '#ffb347' : 'var(--text-muted)', fontFamily: 'DM Mono' }}>
                    {t.openRate > 0 ? t.openRate.toFixed(1) + '%' : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[16px] px-1.5 py-0.5 rounded" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    {t.status !== 'draft' && (
                      <button onClick={() => setFlows(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: on ? 'rgba(255,179,71,0.08)' : 'rgba(16,217,138,0.08)', color: on ? '#ffb347' : '#10d98a' }}>
                        {on ? <Pause size={11} /> : <Play size={11} />}
                      </button>
                    )}
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

export default function EmailPage() {
  const [tab, setTab] = useState<Tab>('flows');
  const [stores] = useStores();
  const { selectedStoreIds } = useStoreScope('email');
  const [allFlows] = usePersistentState<EmailFlow[]>('email.flows', []);
  const inScope = (store: string) => store === 'All Stores' || selectedStoreIds.includes(resolveStoreId(store, stores) ?? '');
  const flows = allFlows.filter(f => inScope(f.store));
  const s = computeEmailStats(flows);
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title="Email & SMS" subtitle={`${s.activeFlows} active flows`} breadcrumbs={['MarketOS', 'Email & SMS']} />
        <main className="flex-1 overflow-hidden flex flex-col p-5 gap-4" style={{ minHeight: 0 }}>
          <div className="shrink-0"><StoreScopeBar sectionKey="email" /></div>
          <div className="grid grid-cols-5 gap-3 shrink-0">
            {[
              { label: 'Subscribers',   value: fmt(s.totalSubscribers),      color: 'var(--cyan)' },
              { label: 'Active',        value: fmt(s.activeSubscribers),      color: '#10d98a' },
              { label: 'Revenue (30d)', value: c$(s.totalRevenue30d),         color: '#ffb347' },
              { label: 'Avg Open Rate', value: s.avgOpenRate.toFixed(1)+'%',  color: '#7b93ff' },
              { label: 'Active Flows',  value: s.activeFlows.toString(),      color: '#10d98a' },
            ].map(stat => (
              <div key={stat.label} className="glass-card px-4 py-3">
                <div className="section-label mb-1.5">{stat.label}</div>
                <div className="data-value text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl shrink-0"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base transition-all"
                  style={{
                    background: tab === t.key ? 'var(--bg-elevated)' : 'transparent',
                    color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: tab === t.key ? 500 : 400,
                    border: tab === t.key ? '1px solid var(--border-dim)' : '1px solid transparent',
                  }}>
                  <Icon size={13} />{t.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto">
            {tab === 'flows'          && (
              <div className="grid grid-cols-2 gap-3">
                {flows.length === 0 && (
                  <div className="col-span-2 text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
                    {allFlows.length === 0 ? 'No automation flows yet.' : `No automation flows for the selected store${selectedStoreIds.length !== 1 ? 's' : ''}.`}
                  </div>
                )}
                {flows.map(f => <FlowCard key={f.id} flow={f} />)}
              </div>
            )}
            {tab === 'campaigns'      && <CampaignsList selectedStoreIds={selectedStoreIds} />}
            {tab === 'builder'        && <EmailBuilderPanel />}
            {tab === 'segments'       && <SegmentsPanel />}
            {tab === 'deliverability' && <DeliverabilityPanel />}
            {tab === 'abtesting'      && <EmailABPanel selectedStoreIds={selectedStoreIds} />}
            {tab === 'sendtime'       && <SendTimePanel />}
            {tab === 'transactional'  && <TransactionalPanel selectedStoreIds={selectedStoreIds} />}
            {tab === 'sms'            && <SmsCampaignsPanel selectedStoreIds={selectedStoreIds} />}
            {tab === 'push'           && <PushPanel selectedStoreIds={selectedStoreIds} />}
          </div>
        </main>
      </div>
    </div>
  );
}
