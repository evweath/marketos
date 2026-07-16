'use client';

import { useState } from 'react';
import { X, Pause, Play, TrendingUp, TrendingDown, Users, Image, Video, LayoutGrid, Type, Zap, DollarSign, MousePointer, BarChart2, Clock, Flag, AlertTriangle, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { AD_PLATFORM_CONFIG, STATUS_CONFIG } from '@/lib/campaignData';
import type { Campaign, CampaignStatus, AdSet, Creative } from '@/lib/campaignData';

const c$ = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const c2 = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const pacingColor = (p: number) => (p > 95 ? '#ff4444' : p > 80 ? '#ffb347' : '#10d98a');

interface Props {
  campaign: Campaign;
  onClose: () => void;
}

interface KPIItem {
  label: string;
  value: string;
  color: string;
  delta?: number;
  Icon: LucideIcon;
}

type Tab = 'adsets' | 'ads' | 'history';

const CREATIVE_TYPE_ICON: Record<Creative['type'], LucideIcon> = {
  image: Image, video: Video, carousel: LayoutGrid, text: Type,
};

interface HistoryEvent { Icon: LucideIcon; color: string; label: string; detail: string; when: string; }

export default function CampaignDetail({ campaign: c, onClose }: Props) {
  const [status, setStatus] = useState<CampaignStatus>(c.status);
  const [tab, setTab] = useState<Tab>('adsets');
  const isPaused = status === 'paused';
  const togglePause = () =>
    setStatus(prev => (prev === 'paused' ? 'active' : 'paused'));

  const [allAdSets]    = usePersistentState<AdSet[]>('ads.adSets', []);
  const [allCreatives] = usePersistentState<Creative[]>('ads.creatives', []);

  const pc = AD_PLATFORM_CONFIG[c.platform];
  const sc = STATUS_CONFIG[status];
  const adSets    = allAdSets.filter(a => a.campaignId === c.id);
  const creatives = allCreatives.filter(cr => cr.campaignId === c.id);

  // History log — derived from the campaign's real current state (no fabricated
  // random events): launch, status, pacing, creative winner, frequency fatigue.
  const winner = creatives.find(cr => cr.status === 'winner');
  const history: HistoryEvent[] = [
    { Icon: Rocket, color: pc.color, label: 'Campaign launched', detail: `${pc.label} · objective: ${c.objective}`, when: creatives.length ? `${Math.max(...creatives.map(cr => cr.daysRunning))}d ago` : 'recently' },
    ...(winner ? [{ Icon: Flag, color: '#ffd700', label: 'A/B winner declared', detail: `${winner.name} — ${winner.roas.toFixed(1)}× ROAS`, when: `${winner.daysRunning}d running` }] : []),
    ...(c.frequency && c.frequency > 4.5 ? [{ Icon: AlertTriangle, color: '#ff4444', label: 'Creative fatigue flagged', detail: `Frequency ${c.frequency.toFixed(1)}× exceeds 4.5 threshold`, when: 'active' }] : []),
    { Icon: DollarSign, color: pacingColor(c.budgetPacing), label: `Pacing at ${c.budgetPacing}%`, detail: `${c$(c.spendToDate)} of ${c$(c.totalBudget)} spent`, when: 'today' },
    { Icon: status === 'paused' ? Pause : Play, color: sc.color, label: `Status: ${sc.label}`, detail: status === 'paused' ? 'Delivery paused' : 'Delivering ads', when: 'now' },
  ];

  const roasColor = c.roas >= 7 ? '#10d98a' : c.roas >= 4 ? '#ffb347' : '#ff4444';
  const spendPct  = Math.min((c.spendToDate / c.totalBudget) * 100, 100);
  const pacingBarColor = pacingColor(c.budgetPacing);

  const kpis: KPIItem[] = [
    { label: 'Revenue',  value: c$(c.revenue),                       color: pc.color,  delta: c.roasDelta,        Icon: TrendingUp    },
    { label: 'ROAS',     value: c.roas.toFixed(2) + '×',             color: roasColor, delta: c.roasDelta,        Icon: BarChart2     },
    { label: 'Spend',    value: c$(c.spendToDate),                   color: 'var(--text-primary)', delta: c.spendDelta, Icon: DollarSign },
    { label: 'Conv.',    value: String(c.conversions),               color: 'var(--text-primary)', delta: c.conversionsDelta, Icon: Zap },
    { label: 'CPA',      value: c2(c.cpa),                           color: c.cpa <= 40 ? '#10d98a' : '#ffb347', Icon: MousePointer },
    { label: 'CTR',      value: c.ctr.toFixed(2) + '%',             color: 'var(--text-primary)', Icon: MousePointer },
  ];

  return (
    <div className='glass-card flex flex-col h-full animate-slide-in'>

      {/* Header */}
      <div className='flex items-start justify-between px-4 py-3 border-b shrink-0'
        style={{ borderColor: 'var(--border-subtle)' }}>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2 mb-1.5 flex-wrap'>
            {/* Platform badge */}
            <div className='flex items-center gap-1 px-2 py-0.5 rounded text-[16px] font-mono font-bold'
              style={{ background: pc.color + '20', color: pc.color, border: `1px solid ${pc.color}30` }}>
              <span>{pc.icon}</span>
              <span>{pc.label}</span>
            </div>
            {/* Status badge */}
            <span className='text-[16px] font-mono font-bold px-1.5 py-0.5 rounded'
              style={{ background: sc.bg, color: sc.color }}>
              {sc.label}
            </span>
            <span className='text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>{c.store}</span>
          </div>
          <h3 className='text-base font-bold leading-snug' style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
        </div>
        <div className='flex items-center gap-1.5 ml-2 shrink-0'>
          <button onClick={togglePause}
            title={isPaused ? 'Resume campaign' : 'Pause campaign'}
            className='p-1.5 rounded-lg text-base transition-all'
            style={isPaused
              ? { background: 'rgba(16,217,138,0.1)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.2)' }
              : { background: 'rgba(255,179,71,0.1)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.2)' }}>
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <button onClick={onClose}
            className='p-1.5 rounded-lg transition-colors hover:bg-white/5'
            style={{ color: 'var(--text-muted)' }}>
            <X size={13} />
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>

        {/* KPI 2×3 grid */}
        <div className='grid grid-cols-3 gap-2'>
          {kpis.map(m => {
            const Icon = m.Icon;
            return (
              <div key={m.label} className='rounded-xl p-3 flex flex-col gap-1'
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div className='flex items-center justify-between'>
                  <span className='section-label'>{m.label}</span>
                  <Icon size={10} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className='font-mono text-base font-bold tabular-nums' style={{ color: m.color as string }}>
                  {m.value}
                </div>
                {m.delta !== undefined && (
                  <div className='flex items-center gap-0.5 text-[16px] font-mono'
                    style={{ color: m.delta >= 0 ? '#10d98a' : '#ff4444' }}>
                    {m.delta >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {m.delta >= 0 ? '+' : ''}{m.delta.toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Budget & Pacing */}
        <div>
          <div className='section-label mb-2'>Budget & Pacing</div>
          <div className='rounded-xl p-3' style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className='flex items-center justify-between mb-2 text-base'>
              <span style={{ color: 'var(--text-secondary)' }}>Spend to date</span>
              <span className='font-mono font-semibold' style={{ color: 'var(--text-primary)' }}>
                {c$(c.spendToDate)} / {c$(c.totalBudget)}
              </span>
            </div>
            {/* 12px tall pacing bar */}
            <div className='rounded-full overflow-hidden mb-2' style={{ height: 12, background: 'var(--bg-overlay)' }}>
              <div className='h-full rounded-full transition-all duration-500'
                style={{
                  width: `${spendPct}%`,
                  background: `linear-gradient(90deg, ${pacingBarColor}cc, ${pacingBarColor})`,
                }} />
            </div>
            <div className='flex items-center justify-between text-[16px] font-mono'>
              <span style={{ color: 'var(--text-muted)' }}>Daily: {c$(c.dailyBudget)}</span>
              <span style={{ color: pacingBarColor }}>Pacing: {c.budgetPacing}%</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className='flex items-center gap-1 p-1 rounded-xl'
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          {([
            { id: 'adsets'  as Tab, label: `Ad Sets (${adSets.length})`, Icon: Users },
            { id: 'ads'     as Tab, label: `Ads (${creatives.length})`,  Icon: Image },
            { id: 'history' as Tab, label: 'History',                     Icon: Clock },
          ]).map(t => {
            const active = tab === t.id;
            const TabIcon = t.Icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className='flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[16px] font-mono transition-all'
                style={active
                  ? { background: pc.color + '22', color: pc.color, border: `1px solid ${pc.color}40` }
                  : { color: 'var(--text-muted)', border: '1px solid transparent' }}>
                <TabIcon size={12} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Ad Sets tab */}
        {tab === 'adsets' && (
          adSets.length > 0 ? (
            <div className='space-y-1.5'>
              {adSets.map(as => {
                const asc = STATUS_CONFIG[as.status];
                return (
                  <div key={as.id} className='rounded-xl p-3'
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div className='flex items-start justify-between gap-2 mb-2'>
                      <div className='min-w-0'>
                        <div className='text-base font-semibold truncate' style={{ color: 'var(--text-primary)' }}>
                          {as.name}
                        </div>
                        <div className='text-[16px] font-mono truncate' style={{ color: 'var(--text-muted)' }}>
                          {as.audience}
                        </div>
                      </div>
                      <span className='text-[16px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0'
                        style={{ background: asc.bg, color: asc.color }}>{asc.label}</span>
                    </div>
                    <div className='grid grid-cols-4 gap-1.5'>
                      {[
                        { label: 'Spend', value: c$(as.spend),               highlight: false,                       warn: false },
                        { label: 'ROAS',  value: as.roas.toFixed(1) + '×',   highlight: as.roas >= 7,               warn: false },
                        { label: 'CPA',   value: c$(as.cpa),                 highlight: false,                       warn: false },
                        { label: 'Freq',  value: (as.frequency ?? 0) > 0 ? (as.frequency as number).toFixed(1) : '—', highlight: false, warn: (as.frequency ?? 0) > 4 },
                      ].map(m => (
                        <div key={m.label} className='text-center rounded-lg py-1.5'
                          style={{ background: 'var(--bg-overlay)' }}>
                          <div className='font-mono text-[16px] font-semibold'
                            style={{ color: m.highlight ? '#10d98a' : m.warn ? '#ff4444' : 'var(--text-primary)' }}>
                            {m.value}
                          </div>
                          <div className='section-label' style={{ fontSize: 16 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='rounded-xl p-6 text-center text-base'
              style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}>
              <Users size={20} className='mx-auto mb-2 opacity-50' />
              No ad sets for this campaign yet.
            </div>
          )
        )}

        {/* Individual Ads tab (creatives w/ thumbnails) */}
        {tab === 'ads' && (
          creatives.length > 0 ? (
            <div className='space-y-1.5'>
              {creatives.map(cr => {
                const isWinner = cr.status === 'winner';
                const isLoser  = cr.status === 'loser';
                const crColor  = isWinner ? '#10d98a' : isLoser ? '#ff4444' : cr.status === 'active' ? '#00d9ff' : '#ffb347';
                const TypeIcon = CREATIVE_TYPE_ICON[cr.type];
                return (
                  <div key={cr.id} className='rounded-xl p-3 flex gap-3'
                    style={{
                      background: isWinner ? 'rgba(16,217,138,0.05)' : isLoser ? 'rgba(255,68,68,0.04)' : 'var(--bg-elevated)',
                      border: `1px solid ${isWinner ? 'rgba(16,217,138,0.22)' : isLoser ? 'rgba(255,68,68,0.15)' : 'var(--border-subtle)'}`,
                    }}>
                    {/* Thumbnail placeholder — colored by creative type */}
                    <div className='shrink-0 rounded-lg flex items-center justify-center relative overflow-hidden'
                      style={{ width: 52, height: 52, background: `linear-gradient(135deg, ${crColor}30, ${crColor}10)`, border: `1px solid ${crColor}30` }}>
                      <TypeIcon size={22} style={{ color: crColor, opacity: isLoser ? 0.4 : 0.9 }} />
                      <span className='absolute bottom-0.5 right-0.5 text-[16px] font-mono uppercase px-1 rounded'
                        style={{ fontSize: 9, background: 'var(--bg-base)', color: 'var(--text-muted)' }}>{cr.type[0]}</span>
                    </div>
                    <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-base font-semibold'
                          style={{ color: isLoser ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isLoser ? 'line-through' : 'none' }}>
                          {cr.name}
                        </span>
                        {cr.isControl && (
                          <span className='text-[16px] font-mono px-1.5 py-0.5 rounded'
                            style={{ background: 'rgba(123,147,255,0.15)', color: '#7b93ff' }}>
                            CONTROL
                          </span>
                        )}
                        {isWinner && (
                          <span className='text-[16px] font-mono px-1.5 py-0.5 rounded font-bold'
                            style={{ background: 'rgba(255,215,0,0.15)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.25)' }}>
                            WINNER
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <span className='text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>{cr.daysRunning}d</span>
                        <span className='text-[16px] font-mono px-1.5 py-0.5 rounded font-bold'
                          style={{ background: crColor + '18', color: crColor }}>
                          {cr.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className='grid grid-cols-4 gap-1'>
                      {[
                        { label: 'ROAS', value: cr.roas > 0 ? cr.roas.toFixed(1) + '×' : '—', good: cr.roas >= 7 },
                        { label: 'CTR',  value: cr.ctr.toFixed(2) + '%',                        good: cr.ctr >= 2  },
                        { label: 'CPA',  value: c$(cr.cpa),                                     good: cr.cpa <= 25 },
                        { label: 'Conv', value: String(cr.conversions),                         good: false        },
                      ].map(m => (
                        <div key={m.label} className='text-center rounded py-1' style={{ background: 'var(--bg-overlay)' }}>
                          <div className='font-mono text-[16px] font-semibold'
                            style={{ color: m.good ? '#10d98a' : 'var(--text-primary)' }}>
                            {m.value}
                          </div>
                          <div className='section-label' style={{ fontSize: 16 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='rounded-xl p-6 text-center text-base'
              style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}>
              <Image size={20} className='mx-auto mb-2 opacity-50' />
              No individual ads for this campaign yet.
            </div>
          )
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div className='space-y-2'>
            {history.map((ev, i) => {
              const EvIcon = ev.Icon;
              return (
                <div key={i} className='flex items-start gap-3 rounded-xl p-3'
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div className='shrink-0 rounded-lg flex items-center justify-center'
                    style={{ width: 30, height: 30, background: ev.color + '1a', border: `1px solid ${ev.color}30` }}>
                    <EvIcon size={15} style={{ color: ev.color }} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>{ev.label}</span>
                      <span className='text-[16px] font-mono shrink-0' style={{ color: 'var(--text-muted)' }}>{ev.when}</span>
                    </div>
                    <div className='text-[16px] font-mono mt-0.5' style={{ color: 'var(--text-secondary)' }}>{ev.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ad Frequency warning (Ad Sets tab) */}
        {tab === 'adsets' && c.frequency && (
          <div className='rounded-xl p-3 text-base'
            style={{
              background: c.frequency > 4.5 ? 'rgba(255,68,68,0.06)' : 'var(--bg-elevated)',
              border: `1px solid ${c.frequency > 4.5 ? 'rgba(255,68,68,0.2)' : 'var(--border-subtle)'}`,
            }}>
            <div className='flex items-center justify-between'>
              <span style={{ color: 'var(--text-secondary)' }}>Ad Frequency (3-day)</span>
              <span className='font-mono font-bold'
                style={{ color: c.frequency > 4.5 ? '#ff4444' : c.frequency > 3 ? '#ffb347' : '#10d98a' }}>
                {c.frequency.toFixed(1)}×
              </span>
            </div>
            {c.frequency > 4.5 && (
              <div className='mt-1.5 text-[16px]' style={{ color: '#ff4444' }}>
                High frequency — creative fatigue likely. Refresh or expand audience.
              </div>
            )}
          </div>
        )}

        {/* Quality Score (Ad Sets tab) */}
        {tab === 'adsets' && c.qualityScore && (
          <div className='rounded-xl p-3 text-base'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className='flex items-center justify-between mb-2'>
              <span style={{ color: 'var(--text-secondary)' }}>Google Quality Score</span>
              <span className='font-mono font-bold'
                style={{ color: c.qualityScore >= 8 ? '#10d98a' : c.qualityScore >= 6 ? '#ffb347' : '#ff4444' }}>
                {c.qualityScore}/10
              </span>
            </div>
            {/* 10-segment bar */}
            <div className='flex items-center gap-0.5'>
              {Array.from({ length: 10 }, (_, i) => {
                const filled = i < c.qualityScore!;
                const fillColor = c.qualityScore! >= 8 ? '#10d98a' : c.qualityScore! >= 6 ? '#ffb347' : '#ff4444';
                return (
                  <div key={i} className='flex-1 rounded-sm'
                    style={{ height: 6, background: filled ? fillColor : 'var(--bg-overlay)' }} />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
