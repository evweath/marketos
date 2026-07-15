'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import CampaignTable from '@/components/ads/CampaignTable';
import CampaignDetail from '@/components/ads/CampaignDetail';
import { AutomationRulesPanel, AccountHealthAudit } from '@/components/ads/AdsAutomation';
import { CAMPAIGN_TOTALS } from '@/lib/campaignData';
import type { Campaign } from '@/lib/campaignData';
import {
  BarChart2, Zap, Shield, FlaskConical, Users, XCircle,
  Play, Pause, Trophy, TrendingUp, TrendingDown, AlertTriangle,
  Plus, Trash2, CheckCircle2, RefreshCw,
} from 'lucide-react';

type Tab = 'campaigns' | 'automation' | 'health' | 'abtesting' | 'audiences' | 'negkeywords';

const c$ = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => n.toFixed(1) + '%';
const fmt = (n: number) => n.toLocaleString();

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'campaigns',   label: 'Campaigns',        icon: BarChart2    },
  { key: 'automation',  label: 'Automation Rules',  icon: Zap          },
  { key: 'health',      label: 'Account Health',    icon: Shield       },
  { key: 'abtesting',   label: 'A/B Testing',       icon: FlaskConical },
  { key: 'audiences',   label: 'Audience Overlap',  icon: Users        },
  { key: 'negkeywords', label: 'Negative Keywords', icon: XCircle      },
];

// ─── A/B Testing ──────────────────────────────────────────────────────────────

type ABStatus = 'running' | 'winner_found' | 'paused' | 'scheduled';
type Variant = { id: string; label: string; name: string; impressions: number; ctr: number; cpa: number; roas: number; spend: number; isWinner?: boolean; autoPaused?: boolean };
interface ABTest {
  id: string;
  name: string;
  campaign: string;
  platform: 'Meta' | 'Google';
  status: ABStatus;
  confidence: number;
  startDate: string;
  endDate?: string;
  variants: Variant[];
  metric: string;
}

const INITIAL_AB_TESTS: ABTest[] = [
  {
    id: 'ab-001', name: 'Donut Fryer — Headline Copy', campaign: 'Spring Sale — Donut Equipment', platform: 'Meta', status: 'winner_found',
    confidence: 97, startDate: '2026-05-01', endDate: '2026-05-10', metric: 'CPA',
    variants: [
      { id: 'v1', label: 'Control',    name: 'Shop Pro Donut Fryers — Free Shipping', impressions: 42800, ctr: 2.1, cpa: 38.40, roas: 4.2, spend: 1840 },
      { id: 'v2', label: 'Challenger', name: 'Get Commercial-Grade Donuts Ready in 90 Sec', impressions: 43200, ctr: 3.4, cpa: 24.80, roas: 6.1, spend: 1790, isWinner: true },
    ],
  },
  {
    id: 'ab-002', name: 'Glaze Kit — Creative Format', campaign: 'Bakery Wholesale — Supplies', platform: 'Meta', status: 'running',
    confidence: 72, startDate: '2026-05-08', metric: 'ROAS',
    variants: [
      { id: 'v1', label: 'Control',    name: 'Static Image — Product on White', impressions: 18400, ctr: 1.8, cpa: 44.20, roas: 3.8, spend: 920 },
      { id: 'v2', label: 'Challenger', name: 'Video — 15-sec Recipe Demo',       impressions: 19100, ctr: 2.3, cpa: 39.60, roas: 4.2, spend: 890 },
    ],
  },
  {
    id: 'ab-003', name: 'Equipment — Audience Targeting', campaign: 'Google — Branded Search', platform: 'Google', status: 'running',
    confidence: 61, startDate: '2026-05-06', metric: 'CTR',
    variants: [
      { id: 'v1', label: 'Control',    name: 'Broad Match + Smart Bidding', impressions: 28600, ctr: 3.9, cpa: 52.10, roas: 3.1, spend: 1420 },
      { id: 'v2', label: 'Challenger', name: 'Exact Match + Target CPA',    impressions: 27200, ctr: 5.1, cpa: 41.80, roas: 3.9, spend: 1380 },
    ],
  },
  {
    id: 'ab-004', name: 'Wholesale — CTA Button Text', campaign: 'Bakery Wholesale — Retargeting', platform: 'Meta', status: 'paused',
    confidence: 45, startDate: '2026-04-28', endDate: '2026-05-05', metric: 'CTR',
    variants: [
      { id: 'v1', label: 'Control',    name: '"Shop Now"',   impressions: 8400,  ctr: 1.2, cpa: 61.40, roas: 2.8, spend: 480, autoPaused: true },
      { id: 'v2', label: 'Challenger', name: '"Get a Quote"', impressions: 8100, ctr: 1.6, cpa: 55.20, roas: 3.1, spend: 470 },
    ],
  },
];

const STATUS_CONFIG: Record<ABStatus, { label: string; color: string; bg: string }> = {
  running:      { label: 'Running',      color: '#10d98a', bg: 'rgba(16,217,138,.12)' },
  winner_found: { label: 'Winner Found', color: '#7b93ff', bg: 'rgba(123,147,255,.12)' },
  paused:       { label: 'Paused',       color: '#ffb347', bg: 'rgba(255,179,71,.12)'  },
  scheduled:    { label: 'Scheduled',    color: 'var(--cyan)', bg: 'rgba(0,217,255,.12)'   },
};

function ABTestingPanel() {
  const [tests, setTests] = usePersistentState<ABTest[]>('ads.abTests', INITIAL_AB_TESTS);
  const [expanded, setExpanded] = useState<string | null>('ab-001');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCampaign, setNewCampaign] = useState('');
  const [newPlatform, setNewPlatform] = useState<'Meta' | 'Google'>('Meta');

  const pauseVariant = (testId: string, variantId: string) => {
    setTests(prev => prev.map(t => t.id !== testId ? t : {
      ...t,
      variants: t.variants.map(v => v.id === variantId ? { ...v, autoPaused: true } : v),
      status: 'paused',
    }));
  };

  const createTest = () => {
    if (!newName.trim() || !newCampaign.trim()) return;
    const t: ABTest = {
      id: `ab-${Date.now()}`, name: newName, campaign: newCampaign, platform: newPlatform,
      status: 'scheduled', confidence: 0, startDate: new Date().toISOString().slice(0, 10), metric: 'CPA',
      variants: [
        { id: 'v1', label: 'Control',    name: 'Variant A', impressions: 0, ctr: 0, cpa: 0, roas: 0, spend: 0 },
        { id: 'v2', label: 'Challenger', name: 'Variant B', impressions: 0, ctr: 0, cpa: 0, roas: 0, spend: 0 },
      ],
    };
    setTests(prev => [t, ...prev]);
    setNewName(''); setNewCampaign(''); setShowCreate(false);
  };

  const running  = tests.filter(t => t.status === 'running').length;
  const winners  = tests.filter(t => t.status === 'winner_found').length;
  const paused   = tests.filter(t => t.status === 'paused').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Active Tests',    value: running.toString(),  color: '#10d98a' },
          { label: 'Winner Found',    value: winners.toString(),  color: '#7b93ff' },
          { label: 'Paused Tests',    value: paused.toString(),   color: '#ffb347' },
          { label: 'Total Tests',     value: tests.length.toString(), color: 'var(--cyan)' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>A/B Tests</span>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-medium"
          style={{ background: 'var(--accent-blue)', color: '#fff' }}>
          <Plus size={13} /> New Test
        </button>
      </div>

      {showCreate && (
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Create A/B Test</div>
          <div className="grid grid-cols-3 gap-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Test name"
              className="px-3 py-2 rounded-lg text-base" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
            <input value={newCampaign} onChange={e => setNewCampaign(e.target.value)} placeholder="Campaign"
              className="px-3 py-2 rounded-lg text-base" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
            <select value={newPlatform} onChange={e => setNewPlatform(e.target.value as 'Meta' | 'Google')}
              className="px-3 py-2 rounded-lg text-base" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              <option value="Meta">Meta</option>
              <option value="Google">Google</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 rounded-lg text-base" style={{ color: 'var(--text-muted)' }}>Cancel</button>
            <button onClick={createTest} className="px-3 py-1.5 rounded-lg text-base font-medium" style={{ background: 'var(--accent-blue)', color: '#fff' }}>Create</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {tests.map(test => {
          const st = STATUS_CONFIG[test.status];
          const isOpen = expanded === test.id;
          const winner = test.variants.find(v => v.isWinner);
          const loser  = test.variants.find(v => !v.isWinner && test.status === 'winner_found');

          return (
            <div key={test.id} className="glass-card overflow-hidden">
              <button className="w-full px-4 py-3 flex items-center gap-3 text-left" onClick={() => setExpanded(isOpen ? null : test.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{test.name}</span>
                    <span className="text-base px-2 py-0.5 rounded-full" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                    <span className="text-base px-2 py-0.5 rounded-full" style={{ color: 'var(--cyan)', background: 'rgba(0,217,255,.1)' }}>{test.platform}</span>
                  </div>
                  <div className="section-label">{test.campaign} · Optimizing for {test.metric} · {test.confidence}% confidence</div>
                </div>
                {test.status === 'winner_found' && winner && (
                  <div className="flex items-center gap-1 text-base" style={{ color: '#10d98a' }}>
                    <Trophy size={13} /> Winner: {winner.label}
                  </div>
                )}
              </button>

              {isOpen && (
                <div className="border-t px-4 pb-4 pt-3 flex flex-col gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="grid grid-cols-2 gap-3">
                    {test.variants.map(v => {
                      const isW = !!v.isWinner;
                      const isPaused = !!v.autoPaused;
                      return (
                        <div key={v.id} className="rounded-xl p-3 flex flex-col gap-2 relative"
                          style={{ background: 'var(--bg-base)', border: `1px solid ${isW ? '#10d98a44' : isPaused ? '#ff444444' : 'var(--border-dim)'}` }}>
                          {isW && <div className="absolute top-2 right-2 flex items-center gap-1 text-base" style={{ color: '#10d98a' }}><Trophy size={11} /> Winner</div>}
                          {isPaused && <div className="absolute top-2 right-2 flex items-center gap-1 text-base" style={{ color: '#ff4444' }}><Pause size={11} /> Auto-Paused</div>}
                          <div>
                            <div className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>{v.label}</div>
                            <div className="text-base mt-0.5" style={{ color: 'var(--text-primary)' }}>{v.name}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { l: 'Impressions', v: fmt(v.impressions) },
                              { l: 'CTR',          v: pct(v.ctr) },
                              { l: 'CPA',          v: v.spend > 0 ? c$(v.cpa) : '—' },
                              { l: 'ROAS',         v: v.spend > 0 ? v.roas + '×' : '—' },
                            ].map(s => (
                              <div key={s.l}>
                                <div className="section-label text-[16px]">{s.l}</div>
                                <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{s.v}</div>
                              </div>
                            ))}
                          </div>
                          {test.status === 'running' && !isPaused && (
                            <button onClick={() => pauseVariant(test.id, v.id)}
                              className="flex items-center gap-1 text-[16px] mt-1 self-start px-2 py-1 rounded-md"
                              style={{ color: '#ff4444', background: 'rgba(255,68,68,.1)' }}>
                              <Pause size={10} /> Auto-Pause
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full h-1.5" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: pct(test.confidence), background: test.confidence >= 95 ? '#10d98a' : test.confidence >= 70 ? '#ffb347' : '#7b93ff' }} />
                    </div>
                    <span className="text-base" style={{ color: 'var(--text-muted)' }}>{test.confidence}% statistical confidence {test.confidence >= 95 ? '✓' : test.confidence >= 70 ? '(approaching)' : '(low)'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Audience Overlap ─────────────────────────────────────────────────────────

interface AudienceOverlap {
  id: string;
  set1: string;
  set2: string;
  campaign1: string;
  campaign2: string;
  overlapPct: number;
  platform: 'Meta' | 'Google';
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

const OVERLAPS: AudienceOverlap[] = [
  { id: 'ov-1', set1: 'Lookalike 1% — Purchasers', set2: 'Lookalike 2% — Purchasers', campaign1: 'Spring Sale — Equipment', campaign2: 'Retargeting — Equipment', overlapPct: 68, platform: 'Meta', impact: 'high', recommendation: 'Exclude Lookalike 1% from the Retargeting campaign to stop internal auction competition.' },
  { id: 'ov-2', set1: 'Website Visitors 30d', set2: 'Website Visitors 60d', campaign1: 'Retargeting — Supplies', campaign2: 'Awareness — Supplies', overlapPct: 84, platform: 'Meta', impact: 'high', recommendation: 'Add "Website Visitors 30d" as an exclusion to the Awareness campaign audience.' },
  { id: 'ov-3', set1: 'Interest: Commercial Baking', set2: 'Interest: Food Manufacturing', campaign1: 'Awareness — Wholesale', campaign2: 'Prospecting — Equipment', overlapPct: 42, platform: 'Meta', impact: 'medium', recommendation: 'Consider consolidating these interests into a single campaign to avoid bid inflation.' },
  { id: 'ov-4', set1: 'Customer Match — All Customers', set2: 'In-Market: Commercial Kitchen', campaign1: 'RLSA — Google', campaign2: 'Prospecting — Google', overlapPct: 31, platform: 'Google', impact: 'low', recommendation: 'Low overlap — no action needed. Monitor if campaigns scale.' },
  { id: 'ov-5', set1: 'Cart Abandoners 14d', set2: 'Cart Abandoners 30d', campaign1: 'Cart Recovery — Meta', campaign2: 'Retargeting — Equipment', overlapPct: 76, platform: 'Meta', impact: 'high', recommendation: 'Exclude Cart Abandoners 14d from the broader 30d retargeting campaign.' },
];

const IMPACT_COLOR = { high: '#ff4444', medium: '#ffb347', low: '#10d98a' };

function AudienceOverlapPanel() {
  const [filter, setFilter] = useState<'all' | 'Meta' | 'Google'>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = OVERLAPS.filter(o =>
    !dismissed.has(o.id) && (filter === 'all' || o.platform === filter)
  );
  const highCount = visible.filter(o => o.impact === 'high').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Overlaps',  value: visible.length.toString(),      color: 'var(--cyan)' },
          { label: 'High Impact',     value: highCount.toString(),             color: '#ff4444' },
          { label: 'Meta Overlaps',   value: visible.filter(o => o.platform === 'Meta').length.toString(),   color: '#7b93ff' },
          { label: 'Google Overlaps', value: visible.filter(o => o.platform === 'Google').length.toString(), color: '#10d98a' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Audience Overlap Detection</span>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {(['all', 'Meta', 'Google'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-md text-base transition-all"
              style={{ background: filter === f ? 'var(--bg-elevated)' : 'transparent', color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)', border: filter === f ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
              {f === 'all' ? 'All Platforms' : f}
            </button>
          ))}
        </div>
      </div>

      {highCount > 0 && (
        <div className="rounded-xl p-3 flex items-center gap-2 text-base" style={{ background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.25)' }}>
          <AlertTriangle size={14} style={{ color: '#ff4444', flexShrink: 0 }} />
          <span style={{ color: '#ff4444' }}>{highCount} high-impact overlap{highCount > 1 ? 's' : ''} detected — these audiences are competing against each other in the same auction, inflating your CPMs.</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {visible.map(ov => (
          <div key={ov.id} className="glass-card p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base px-1.5 py-0.5 rounded-full font-medium" style={{ color: IMPACT_COLOR[ov.impact], background: `${IMPACT_COLOR[ov.impact]}18` }}>{ov.impact.toUpperCase()} IMPACT</span>
                  <span className="text-base px-1.5 py-0.5 rounded-full" style={{ color: 'var(--cyan)', background: 'rgba(0,217,255,.1)' }}>{ov.platform}</span>
                  <span className="text-lg font-bold ml-auto" style={{ color: IMPACT_COLOR[ov.impact] }}>{ov.overlapPct}%</span>
                  <span className="section-label">overlap</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="rounded-lg p-2" style={{ background: 'var(--bg-base)' }}>
                    <div className="section-label text-[16px]">Audience 1 · {ov.campaign1}</div>
                    <div className="text-base font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{ov.set1}</div>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: 'var(--bg-base)' }}>
                    <div className="section-label text-[16px]">Audience 2 · {ov.campaign2}</div>
                    <div className="text-base font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{ov.set2}</div>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 text-base" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color: '#10d98a' }} />
                  {ov.recommendation}
                </div>
              </div>
              <button onClick={() => setDismissed(prev => new Set(Array.from(prev).concat(ov.id)))}
                className="text-base px-2 py-1 rounded-lg shrink-0" style={{ color: 'var(--text-muted)', background: 'var(--bg-base)' }}>
                Dismiss
              </button>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="glass-card p-8 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: '#10d98a' }} />
            <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>No overlaps detected</div>
            <div className="section-label mt-1">All audiences are clean — no internal auction competition.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Negative Keywords ────────────────────────────────────────────────────────

type MatchType = 'exact' | 'phrase' | 'broad';
interface NegKeyword { id: string; keyword: string; matchType: MatchType; campaign: string; addedDate: string; impressionsBlocked?: number }

const CAMPAIGNS_GOOGLE = ['Google — Branded Search', 'Google — Competitor Conquest', 'Google — Shopping — Equipment', 'Google — Shopping — Supplies', 'Google — Display Retargeting'];

const INITIAL_NEG_KWS: NegKeyword[] = [
  { id: 'nk-1',  keyword: 'free',           matchType: 'broad',  campaign: 'Google — Branded Search',       addedDate: '2026-04-10', impressionsBlocked: 8420 },
  { id: 'nk-2',  keyword: 'diy donut',       matchType: 'phrase', campaign: 'Google — Branded Search',       addedDate: '2026-04-10', impressionsBlocked: 2140 },
  { id: 'nk-3',  keyword: 'home donut maker', matchType: 'exact', campaign: 'Google — Shopping — Equipment', addedDate: '2026-04-15', impressionsBlocked: 4870 },
  { id: 'nk-4',  keyword: 'recipe',          matchType: 'broad',  campaign: 'Google — Shopping — Supplies',  addedDate: '2026-04-20', impressionsBlocked: 12300 },
  { id: 'nk-5',  keyword: 'how to make',     matchType: 'phrase', campaign: 'Google — Shopping — Supplies',  addedDate: '2026-04-20', impressionsBlocked: 6800 },
  { id: 'nk-6',  keyword: 'donut shop near me', matchType: 'phrase', campaign: 'Google — Competitor Conquest', addedDate: '2026-04-22', impressionsBlocked: 9400 },
  { id: 'nk-7',  keyword: 'retail',          matchType: 'broad',  campaign: 'Google — Shopping — Equipment', addedDate: '2026-04-25', impressionsBlocked: 3200 },
  { id: 'nk-8',  keyword: 'used equipment',  matchType: 'phrase', campaign: 'Google — Shopping — Equipment', addedDate: '2026-04-28', impressionsBlocked: 5600 },
];

const SUGGESTIONS = [
  { keyword: 'cheap', matchType: 'broad' as MatchType, reason: 'Attracts low-intent traffic unlikely to convert at commercial pricing.' },
  { keyword: 'repair', matchType: 'phrase' as MatchType, reason: 'Triggers for service queries — irrelevant to new equipment sales.' },
  { keyword: 'small batch', matchType: 'phrase' as MatchType, reason: 'Indicates hobbyist intent, not commercial buyers.' },
  { keyword: 'rent', matchType: 'exact' as MatchType, reason: 'Equipment rental queries waste spend on purchase campaigns.' },
];

const MATCH_COLOR: Record<MatchType, string> = { exact: '#7b93ff', phrase: '#00d9ff', broad: '#ffb347' };
const MATCH_TEXT_COLOR: Record<MatchType, string> = { exact: '#7b93ff', phrase: 'var(--cyan)', broad: 'var(--amber)' };

function NegativeKeywordsPanel() {
  const [keywords, setKeywords] = usePersistentState<NegKeyword[]>('ads.negativeKeywords', INITIAL_NEG_KWS);
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [newKw, setNewKw] = useState('');
  const [newMatch, setNewMatch] = useState<MatchType>('exact');
  const [newCampaign, setNewCampaign] = useState(CAMPAIGNS_GOOGLE[0]);
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const visible = filterCampaign === 'all' ? keywords : keywords.filter(k => k.campaign === filterCampaign);
  const totalBlocked = keywords.reduce((s, k) => s + (k.impressionsBlocked ?? 0), 0);

  const addKeyword = () => {
    if (!newKw.trim()) return;
    const kw: NegKeyword = {
      id: `nk-${Date.now()}`, keyword: newKw.trim().toLowerCase(),
      matchType: newMatch, campaign: newCampaign,
      addedDate: new Date().toISOString().slice(0, 10),
    };
    setKeywords(prev => [kw, ...prev]);
    setNewKw('');
  };

  const removeKeyword = (id: string) => setKeywords(prev => prev.filter(k => k.id !== id));

  const addBulk = () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const newKws: NegKeyword[] = lines.map((kw, i) => ({
      id: `nk-bulk-${Date.now()}-${i}`, keyword: kw.toLowerCase(),
      matchType: newMatch, campaign: newCampaign,
      addedDate: new Date().toISOString().slice(0, 10),
    }));
    setKeywords(prev => [...newKws, ...prev]);
    setBulkText(''); setShowBulk(false);
  };

  const addSuggestion = (s: typeof SUGGESTIONS[0]) => {
    const kw: NegKeyword = {
      id: `nk-sug-${Date.now()}`, keyword: s.keyword, matchType: s.matchType, campaign: newCampaign,
      addedDate: new Date().toISOString().slice(0, 10),
    };
    setKeywords(prev => [kw, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Neg. Keywords', value: keywords.length.toString(),           color: 'var(--cyan)' },
          { label: 'Impressions Blocked',  value: fmt(totalBlocked),                    color: '#10d98a' },
          { label: 'Exact Match',          value: keywords.filter(k => k.matchType === 'exact').length.toString(),  color: '#7b93ff' },
          { label: 'Phrase / Broad',       value: keywords.filter(k => k.matchType !== 'exact').length.toString(), color: '#ffb347' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add keyword */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Add Negative Keywords</span>
          <button onClick={() => setShowBulk(!showBulk)} className="text-base px-2 py-1 rounded-lg" style={{ color: 'var(--cyan)', background: 'rgba(0,217,255,.1)' }}>Bulk Import</button>
        </div>
        {showBulk ? (
          <div className="flex flex-col gap-2">
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder="One keyword per line..."
              rows={4} className="px-3 py-2 rounded-lg text-base w-full" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', resize: 'none' }} />
            <div className="flex gap-2 items-center">
              <select value={newMatch} onChange={e => setNewMatch(e.target.value as MatchType)}
                className="px-2 py-1.5 rounded-lg text-base flex-1" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                <option value="exact">Exact Match</option>
                <option value="phrase">Phrase Match</option>
                <option value="broad">Broad Match</option>
              </select>
              <select value={newCampaign} onChange={e => setNewCampaign(e.target.value)}
                className="px-2 py-1.5 rounded-lg text-base flex-[2]" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                {CAMPAIGNS_GOOGLE.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addBulk} className="px-3 py-1.5 rounded-lg text-base font-medium whitespace-nowrap" style={{ background: 'var(--accent-blue)', color: '#fff' }}>Import {bulkText.split('\n').filter(l => l.trim()).length}</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <input value={newKw} onChange={e => setNewKw(e.target.value)} onKeyDown={e => e.key === 'Enter' && addKeyword()} placeholder="Enter negative keyword..."
              className="flex-1 px-3 py-2 rounded-lg text-base" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
            <select value={newMatch} onChange={e => setNewMatch(e.target.value as MatchType)}
              className="px-2 py-1.5 rounded-lg text-base" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              <option value="exact">Exact</option>
              <option value="phrase">Phrase</option>
              <option value="broad">Broad</option>
            </select>
            <select value={newCampaign} onChange={e => setNewCampaign(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-base" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {CAMPAIGNS_GOOGLE.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={addKeyword} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-base font-medium" style={{ background: 'var(--accent-blue)', color: '#fff' }}>
              <Plus size={12} /> Add
            </button>
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <RefreshCw size={13} style={{ color: '#7b93ff' }} />
          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>AI Suggestions</span>
          <span className="section-label">— based on search term reports</span>
        </div>
        <div className="flex flex-col gap-2">
          {SUGGESTIONS.filter(s => !keywords.find(k => k.keyword === s.keyword)).map(s => (
            <div key={s.keyword} className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: 'var(--bg-base)' }}>
              <span className="text-base px-1.5 py-0.5 rounded font-mono font-medium" style={{ color: MATCH_COLOR[s.matchType], background: `${MATCH_COLOR[s.matchType]}18` }}>[{s.matchType}]</span>
              <span className="text-base font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{s.keyword}</span>
              <span className="text-base flex-[2]" style={{ color: 'var(--text-muted)' }}>{s.reason}</span>
              <button onClick={() => addSuggestion(s)} className="flex items-center gap-1 text-base px-2 py-1 rounded-lg" style={{ color: '#10d98a', background: 'rgba(16,217,138,.1)' }}>
                <Plus size={11} /> Add
              </button>
            </div>
          ))}
          {SUGGESTIONS.filter(s => !keywords.find(k => k.keyword === s.keyword)).length === 0 && (
            <div className="text-base text-center py-2" style={{ color: 'var(--text-muted)' }}>All suggestions have been added.</div>
          )}
        </div>
      </div>

      {/* Keyword list */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Keyword List <span className="font-normal text-[16px]" style={{ color: 'var(--text-muted)' }}>({visible.length})</span></span>
          <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)}
            className="px-2 py-1 rounded-lg text-base" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
            <option value="all">All Campaigns</option>
            {CAMPAIGNS_GOOGLE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
          <table className="w-full text-base">
            <thead style={{ background: 'var(--bg-elevated)', position: 'sticky', top: 0 }}>
              <tr>
                {['Keyword', 'Match Type', 'Campaign', 'Added', 'Impressions Blocked', ''].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(k => (
                <tr key={k.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className="px-3 py-2 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{k.keyword}</td>
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.5 rounded text-[16px] font-medium" style={{ color: MATCH_COLOR[k.matchType], background: `${MATCH_COLOR[k.matchType]}18` }}>{k.matchType}</span>
                  </td>
                  <td className="px-3 py-2 max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>{k.campaign}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{k.addedDate}</td>
                  <td className="px-3 py-2" style={{ color: k.impressionsBlocked ? '#10d98a' : 'var(--text-muted)' }}>{k.impressionsBlocked ? fmt(k.impressionsBlocked) : '—'}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeKeyword(k.id)} className="p-1 rounded hover:bg-red-500/10 transition-colors">
                      <Trash2 size={11} style={{ color: '#ff4444' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdsPage() {
  const [tab, setTab]           = useState<Tab>('campaigns');
  const [selected, setSelected] = useState<Campaign | null>(null);
  const t = CAMPAIGN_TOTALS;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title="Ad Campaigns" subtitle={`${t.activeCampaigns} active`} breadcrumbs={['MarketOS', 'Ads']} />
        <main className="flex-1 overflow-hidden flex flex-col p-5 gap-4" style={{ minHeight: 0 }}>

          <div className="grid grid-cols-5 gap-3 shrink-0">
            {[
              { label: 'Total Spend',        value: c$(t.totalSpend),                               color: 'var(--cyan)' },
              { label: 'Total Revenue',      value: c$(t.totalRevenue),                             color: '#10d98a' },
              { label: 'Blended ROAS',       value: (t.totalRevenue / t.totalSpend).toFixed(2) + '×', color: '#7b93ff' },
              { label: 'Total Conversions',  value: t.totalConversions.toLocaleString(),             color: '#ffb347' },
              { label: 'Health Issues',      value: t.healthIssues.toString(),                       color: t.healthIssues > 3 ? '#ff4444' : '#ffb347' },
            ].map(s => (
              <div key={s.label} className="glass-card px-4 py-3">
                <div className="section-label mb-1.5">{s.label}</div>
                <div className="data-value text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl shrink-0 flex-wrap"
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

          {tab === 'campaigns' && (
            <div className="flex gap-4 flex-1 min-h-0">
              <div className="flex-1 min-w-0 flex flex-col min-h-0">
                <CampaignTable onSelectCampaign={setSelected} selected={selected} />
              </div>
              {selected && (
                <div style={{ width: 360, flexShrink: 0 }}>
                  <CampaignDetail campaign={selected} onClose={() => setSelected(null)} />
                </div>
              )}
            </div>
          )}
          {tab === 'automation'  && <div className="flex-1 overflow-y-auto"><AutomationRulesPanel /></div>}
          {tab === 'health'      && <div className="flex-1 overflow-y-auto"><AccountHealthAudit /></div>}
          {tab === 'abtesting'   && <div className="flex-1 overflow-y-auto"><ABTestingPanel /></div>}
          {tab === 'audiences'   && <div className="flex-1 overflow-y-auto"><AudienceOverlapPanel /></div>}
          {tab === 'negkeywords' && <div className="flex-1 overflow-y-auto"><NegativeKeywordsPanel /></div>}
        </main>
      </div>
    </div>
  );
}
