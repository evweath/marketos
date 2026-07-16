'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import CampaignTable from '@/components/ads/CampaignTable';
import CampaignDetail from '@/components/ads/CampaignDetail';
import { AutomationRulesPanel, AccountHealthAudit } from '@/components/ads/AdsAutomation';
import { computeCampaignTotals, NEG_KEYWORD_CAMPAIGNS } from '@/lib/campaignData';
import type {
  Campaign, HealthCheckItem, ABTest, ABStatus, AudienceOverlap, NegKeyword, MatchType, NegKeywordSuggestion,
} from '@/lib/campaignData';
import { useStores, useStoreScope, resolveStoreId } from '@/lib/storeScope';
import { StoreScopeBar } from '@/components/shared/StoreScopeBar';
import {
  BarChart2, Zap, Shield, FlaskConical, Users, XCircle,
  Play, Pause, Trophy, TrendingUp, TrendingDown, AlertTriangle,
  Plus, Trash2, CheckCircle2, RefreshCw, Download,
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

const STATUS_CONFIG: Record<ABStatus, { label: string; color: string; bg: string }> = {
  running:      { label: 'Running',      color: '#10d98a', bg: 'rgba(16,217,138,.12)' },
  winner_found: { label: 'Winner Found', color: '#7b93ff', bg: 'rgba(123,147,255,.12)' },
  paused:       { label: 'Paused',       color: '#ffb347', bg: 'rgba(255,179,71,.12)'  },
  scheduled:    { label: 'Scheduled',    color: 'var(--cyan)', bg: 'rgba(0,217,255,.12)'   },
};

function ABTestingPanel() {
  const [tests, setTests] = usePersistentState<ABTest[]>('ads.abTests', []);
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
        {tests.length === 0 && (
          <div className="glass-card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            No A/B tests yet — click New Test to create one.
          </div>
        )}
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

const IMPACT_COLOR = { high: '#ff4444', medium: '#ffb347', low: '#10d98a' };

const overlapCellColor = (pct: number) =>
  pct >= 70 ? '#ff4444' : pct >= 40 ? '#ffb347' : '#10d98a';

function AudienceOverlapPanel({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [overlaps] = usePersistentState<AudienceOverlap[]>('ads.audienceOverlaps', []);
  const [filter, setFilter] = useState<'all' | 'Meta' | 'Google'>('all');
  const [view, setView] = useState<'matrix' | 'list'>('matrix');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = overlaps.filter(o =>
    selectedStoreIds.includes(resolveStoreId(o.store, stores) ?? '') &&
    !dismissed.has(o.id) && (filter === 'all' || o.platform === filter)
  );
  const highCount = visible.filter(o => o.impact === 'high').length;

  // Build a symmetric audience×audience overlap matrix from the pairwise rows.
  const audiences: string[] = [];
  for (const o of visible) {
    if (!audiences.includes(o.set1)) audiences.push(o.set1);
    if (!audiences.includes(o.set2)) audiences.push(o.set2);
  }
  const cell = (a: string, b: string): number | null => {
    if (a === b) return 100;
    const m = visible.find(o => (o.set1 === a && o.set2 === b) || (o.set1 === b && o.set2 === a));
    return m ? m.overlapPct : null;
  };

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

      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Audience Overlap Detection</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            {(['matrix', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1 rounded-md text-base transition-all capitalize"
                style={{ background: view === v ? 'var(--bg-elevated)' : 'transparent', color: view === v ? 'var(--text-primary)' : 'var(--text-muted)', border: view === v ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
                {v}
              </button>
            ))}
          </div>
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
      </div>

      {highCount > 0 && (
        <div className="rounded-xl p-3 flex items-center gap-2 text-base" style={{ background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.25)' }}>
          <AlertTriangle size={14} style={{ color: '#ff4444', flexShrink: 0 }} />
          <span style={{ color: '#ff4444' }}>{highCount} high-impact overlap{highCount > 1 ? 's' : ''} detected — these audiences are competing against each other in the same auction, inflating your CPMs.</span>
        </div>
      )}

      {/* Heatmap matrix */}
      {view === 'matrix' && audiences.length > 0 && (
        <div className="glass-card p-4 overflow-x-auto">
          <table className="border-separate" style={{ borderSpacing: 3 }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10" style={{ background: 'var(--bg-surface)', width: 210, minWidth: 210 }} />
                {audiences.map((_, j) => (
                  <th key={j} className="text-[16px] font-mono font-semibold pb-1" style={{ color: 'var(--text-muted)', minWidth: 40 }}>
                    A{j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audiences.map((a, i) => (
                <tr key={a}>
                  <th className="text-right pr-2 text-[16px] font-mono font-normal whitespace-nowrap overflow-hidden sticky left-0 z-10"
                    style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)', width: 210, minWidth: 210, maxWidth: 210, textOverflow: 'ellipsis' }}>
                    <span style={{ color: 'var(--text-muted)' }}>A{i + 1}</span> · {a.length > 22 ? a.slice(0, 21) + '…' : a}
                  </th>
                  {audiences.map((b, j) => {
                    const v = cell(a, b);
                    const isDiag = i === j;
                    const c = v == null ? null : overlapCellColor(v);
                    return (
                      <td key={j} className="text-center rounded-md text-[16px] font-mono font-bold tabular-nums"
                        title={v == null ? 'No measured overlap' : `${a} ↔ ${b}: ${v}%`}
                        style={{
                          width: 40, height: 34,
                          background: isDiag ? 'var(--bg-elevated)'
                            : v == null ? 'var(--bg-base)'
                            : `${c}${v >= 70 ? '44' : v >= 40 ? '33' : '22'}`,
                          color: isDiag ? 'var(--text-muted)' : c ?? 'var(--text-muted)',
                          border: `1px solid ${isDiag ? 'var(--border-subtle)' : v == null ? 'var(--border-subtle)' : c + '55'}`,
                        }}>
                        {isDiag ? '—' : v == null ? '' : v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-4 mt-3 text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
            <span>Overlap %:</span>
            {[{ l: '<40 low', c: '#10d98a' }, { l: '40–69 medium', c: '#ffb347' }, { l: '≥70 high', c: '#ff4444' }].map(k => (
              <span key={k.l} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: k.c + '44', border: `1px solid ${k.c}55` }} />{k.l}
              </span>
            ))}
          </div>
        </div>
      )}
      {view === 'matrix' && audiences.length === 0 && (
        <div className="glass-card p-8 text-center">
          <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>No audience overlap analysis yet</div>
          <div className="section-label mt-1">Connect an ad platform to start detecting audience overlaps.</div>
        </div>
      )}

      {view === 'list' && (
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
            <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: overlaps.length === 0 ? 'var(--text-muted)' : '#10d98a' }} />
            <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              {overlaps.length === 0 ? 'No audience overlap analysis yet' : 'No overlaps detected'}
            </div>
            <div className="section-label mt-1">
              {overlaps.length === 0 ? 'Connect an ad platform to start detecting audience overlaps.' : 'All audiences are clean — no internal auction competition.'}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

// ─── Negative Keywords ────────────────────────────────────────────────────────

const MATCH_COLOR: Record<MatchType, string> = { exact: '#7b93ff', phrase: '#00d9ff', broad: '#ffb347' };
const MATCH_TEXT_COLOR: Record<MatchType, string> = { exact: '#7b93ff', phrase: 'var(--cyan)', broad: 'var(--amber)' };

function NegativeKeywordsPanel() {
  const [keywords, setKeywords] = usePersistentState<NegKeyword[]>('ads.negativeKeywords', []);
  const [suggestions] = usePersistentState<NegKeywordSuggestion[]>('ads.negativeKeywordSuggestions', []);
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [newKw, setNewKw] = useState('');
  const [newMatch, setNewMatch] = useState<MatchType>('exact');
  const [newCampaign, setNewCampaign] = useState(NEG_KEYWORD_CAMPAIGNS[0]);
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = filterCampaign === 'all' ? keywords : keywords.filter(k => k.campaign === filterCampaign);
  const totalBlocked = keywords.reduce((s, k) => s + (k.impressionsBlocked ?? 0), 0);

  const toggleSel = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const allVisibleSelected = visible.length > 0 && visible.every(k => selected.has(k.id));
  const toggleAll = () => setSelected(prev => {
    const n = new Set(prev);
    if (allVisibleSelected) visible.forEach(k => n.delete(k.id));
    else visible.forEach(k => n.add(k.id));
    return n;
  });

  const exportCsv = () => {
    const rows = visible.filter(k => selected.size === 0 || selected.has(k.id));
    const header = ['Keyword', 'Match Type', 'Campaign', 'Source', 'Added', 'Impressions Blocked'];
    const csv = [header, ...rows.map(k => [k.keyword, k.matchType, k.campaign, k.source ?? 'manual', k.addedDate, k.impressionsBlocked ?? 0])]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'negative-keywords.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const addKeyword = () => {
    if (!newKw.trim()) return;
    const kw: NegKeyword = {
      id: `nk-${Date.now()}`, keyword: newKw.trim().toLowerCase(),
      matchType: newMatch, campaign: newCampaign,
      addedDate: new Date().toISOString().slice(0, 10), source: 'manual',
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
      addedDate: new Date().toISOString().slice(0, 10), source: 'manual',
    }));
    setKeywords(prev => [...newKws, ...prev]);
    setBulkText(''); setShowBulk(false);
  };

  const addSuggestion = (s: NegKeywordSuggestion) => {
    const kw: NegKeyword = {
      id: `nk-sug-${Date.now()}`, keyword: s.keyword, matchType: s.matchType, campaign: newCampaign,
      addedDate: new Date().toISOString().slice(0, 10), source: 'ai',
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
                {NEG_KEYWORD_CAMPAIGNS.map(c => <option key={c} value={c}>{c}</option>)}
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
              {NEG_KEYWORD_CAMPAIGNS.map(c => <option key={c} value={c}>{c}</option>)}
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
          {suggestions.filter(s => !keywords.find(k => k.keyword === s.keyword)).map(s => (
            <div key={s.keyword} className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: 'var(--bg-base)' }}>
              <span className="text-base px-1.5 py-0.5 rounded font-mono font-medium" style={{ color: MATCH_COLOR[s.matchType], background: `${MATCH_COLOR[s.matchType]}18` }}>[{s.matchType}]</span>
              <span className="text-base font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{s.keyword}</span>
              <span className="text-base flex-[2]" style={{ color: 'var(--text-muted)' }}>{s.reason}</span>
              {s.relevance != null && (
                <span className="flex items-center gap-1.5 shrink-0" title="AI relevance score">
                  <span className="w-14 h-1.5 rounded-full" style={{ background: 'var(--bg-overlay)' }}>
                    <span className="block h-full rounded-full" style={{ width: `${s.relevance}%`, background: s.relevance >= 85 ? '#10d98a' : s.relevance >= 70 ? '#ffb347' : '#7b93ff' }} />
                  </span>
                  <span className="text-[16px] font-mono" style={{ color: s.relevance >= 85 ? '#10d98a' : s.relevance >= 70 ? '#ffb347' : '#7b93ff' }}>{s.relevance}</span>
                </span>
              )}
              <button onClick={() => addSuggestion(s)} className="flex items-center gap-1 text-base px-2 py-1 rounded-lg" style={{ color: '#10d98a', background: 'rgba(16,217,138,.1)' }}>
                <Plus size={11} /> Add
              </button>
            </div>
          ))}
          {suggestions.filter(s => !keywords.find(k => k.keyword === s.keyword)).length === 0 && (
            <div className="text-base text-center py-2" style={{ color: 'var(--text-muted)' }}>All suggestions have been added.</div>
          )}
        </div>
      </div>

      {/* Keyword list */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Keyword List <span className="font-normal text-[16px]" style={{ color: 'var(--text-muted)' }}>({visible.length})</span></span>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} disabled={visible.length === 0}
              className="flex items-center gap-1.5 text-base px-2.5 py-1 rounded-lg font-medium disabled:opacity-40"
              style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
              <Download size={12} /> CSV{selected.size > 0 ? ` (${selected.size})` : ''}
            </button>
            <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)}
              className="px-2 py-1 rounded-lg text-base" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              <option value="all">All Campaigns</option>
              {NEG_KEYWORD_CAMPAIGNS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
          <table className="w-full text-base">
            <thead style={{ background: 'var(--bg-elevated)', position: 'sticky', top: 0 }}>
              <tr>
                <th className="px-3 py-2 text-left">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} style={{ accentColor: '#00d9ff' }} />
                </th>
                {['Keyword', 'Match Type', 'Source', 'Campaign', 'Added', 'Impressions Blocked', ''].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(k => (
                <tr key={k.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selected.has(k.id)} onChange={() => toggleSel(k.id)} style={{ accentColor: '#00d9ff' }} />
                  </td>
                  <td className="px-3 py-2 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{k.keyword}</td>
                  <td className="px-3 py-2">
                    <span className="px-1.5 py-0.5 rounded text-[16px] font-medium" style={{ color: MATCH_COLOR[k.matchType], background: `${MATCH_COLOR[k.matchType]}18` }}>{k.matchType}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[16px] font-mono px-1.5 py-0.5 rounded" style={{ background: k.source === 'ai' ? 'rgba(123,147,255,0.15)' : 'var(--bg-overlay)', color: k.source === 'ai' ? '#7b93ff' : 'var(--text-muted)' }}>
                      {k.source === 'ai' ? '✨ AI' : 'Manual'}
                    </span>
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
  const [stores] = useStores();
  const { selectedStoreIds } = useStoreScope('ads');
  const [allCampaigns]   = usePersistentState<Campaign[]>('ads.campaigns', []);
  const [healthChecks] = usePersistentState<HealthCheckItem[]>('ads.healthChecks', []);
  const campaigns = allCampaigns.filter(c => selectedStoreIds.includes(resolveStoreId(c.store, stores) ?? ''));
  const t = computeCampaignTotals(campaigns, healthChecks);
  const blendedRoas = t.totalSpend > 0 ? (t.totalRevenue / t.totalSpend).toFixed(2) + '×' : '—';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title="Ad Campaigns" subtitle={`${t.activeCampaigns} active`} breadcrumbs={['MarketOS', 'Ads']} />
        <main className="flex-1 overflow-hidden flex flex-col p-5 gap-4" style={{ minHeight: 0 }}>

          <div className="shrink-0"><StoreScopeBar sectionKey="ads" /></div>

          <div className="grid grid-cols-5 gap-3 shrink-0">
            {[
              { label: 'Total Spend',        value: c$(t.totalSpend),                               color: 'var(--cyan)' },
              { label: 'Total Revenue',      value: c$(t.totalRevenue),                             color: '#10d98a' },
              { label: 'Blended ROAS',       value: blendedRoas,                                       color: '#7b93ff' },
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
                <CampaignTable onSelectCampaign={setSelected} selected={selected} selectedStoreIds={selectedStoreIds} />
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
          {tab === 'audiences'   && <div className="flex-1 overflow-y-auto"><AudienceOverlapPanel selectedStoreIds={selectedStoreIds} /></div>}
          {tab === 'negkeywords' && <div className="flex-1 overflow-y-auto"><NegativeKeywordsPanel /></div>}
        </main>
      </div>
    </div>
  );
}
