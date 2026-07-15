'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, Megaphone } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { AD_PLATFORM_CONFIG, STATUS_CONFIG, AD_PLATFORM_STARTED } from '@/lib/campaignData';
import type { Campaign, AdPlatform, CampaignStatus } from '@/lib/campaignData';
import { useStores, resolveStoreId } from '@/lib/storeScope';

const c$ = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1_000 ? (n / 1_000).toFixed(1) + 'K' : n.toString();

function DeltaPill({ v }: { v: number }) {
  const color = v >= 0 ? '#10d98a' : '#ff4444';
  return (
    <span className='inline-flex items-center gap-0.5 text-[16px] font-mono font-semibold px-1.5 py-0.5 rounded-full ml-1'
      style={{ background: color + '18', color, border: `1px solid ${color}28` }}>
      {v >= 0 ? '+' : ''}{v.toFixed(1)}%
    </span>
  );
}

type SortKey = 'name' | 'spendToDate' | 'revenue' | 'roas' | 'conversions' | 'cpa' | 'ctr' | 'impressions';

interface Props {
  onSelectCampaign: (c: Campaign) => void;
  selected: Campaign | null;
  selectedStoreIds: string[];
}

const PLATFORM_TABS: { key: AdPlatform | 'all'; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'google',    label: 'Google' },
  { key: 'meta',      label: 'Meta' },
  { key: 'tiktok',    label: 'TikTok' },
  { key: 'youtube',   label: 'YouTube' },
  { key: 'linkedin',  label: 'LinkedIn' },
  { key: 'x-twitter', label: 'X/Twitter' },
];

const STATUS_FILTERS: { key: CampaignStatus | 'all'; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'active',   label: 'Active'   },
  { key: 'paused',   label: 'Paused'   },
  { key: 'learning', label: 'Learning' },
];

const COLS: { key: SortKey; label: string }[] = [
  { key: 'impressions', label: 'Impr.'   },
  { key: 'ctr',         label: 'CTR'     },
  { key: 'spendToDate', label: 'Spend'   },
  { key: 'revenue',     label: 'Revenue' },
  { key: 'roas',        label: 'ROAS'    },
  { key: 'conversions', label: 'Conv.'   },
  { key: 'cpa',         label: 'CPA'     },
];

export default function CampaignTable({ onSelectCampaign, selected, selectedStoreIds }: Props) {
  const [stores] = useStores();
  const [allStoreCampaigns] = usePersistentState<Campaign[]>('ads.campaigns', []);
  const [platform, setPlatform] = useState<AdPlatform | 'all'>('all');
  const [status,   setStatus]   = useState<CampaignStatus | 'all'>('all');
  const [sortKey,  setSortKey]  = useState<SortKey>('revenue');
  const [sortDir,  setSortDir]  = useState<'asc' | 'desc'>('desc');

  const allCampaigns = allStoreCampaigns.filter(c => selectedStoreIds.includes(resolveStoreId(c.store, stores) ?? ''));

  const campaigns = allCampaigns
    .filter(c => platform === 'all' || c.platform === platform)
    .filter(c => status === 'all' || c.status === status)
    .sort((a, b) => {
      if (sortKey === 'name') {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      const av = (a as unknown as Record<string, number>)[sortKey];
      const bv = (b as unknown as Record<string, number>)[sortKey];
      return sortDir === 'desc' ? bv - av : av - bv;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortDir === 'desc' ? <ChevronDown size={9} /> : <ChevronUp size={9} />)
      : <ChevronDown size={9} style={{ opacity: 0.2 }} />;

  return (
    <div className='glass-card flex flex-col' style={{ minHeight: 0 }}>
      {/* Filters */}
      <div className='px-4 py-3 border-b space-y-2 shrink-0' style={{ borderColor: 'var(--border-subtle)' }}>

        {/* Platform pill tabs */}
        <div className='flex items-center gap-1 overflow-x-auto pb-0.5'>
          {PLATFORM_TABS.map(t => {
            const cfg = t.key !== 'all' ? AD_PLATFORM_CONFIG[t.key as AdPlatform] : null;
            const count = t.key === 'all'
              ? allCampaigns.length
              : allCampaigns.filter(c => c.platform === t.key).length;
            const isActive = platform === t.key;

            return (
              <button key={t.key}
                onClick={() => setPlatform(t.key)}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-medium transition-all whitespace-nowrap'
                style={{
                  background: isActive ? (cfg ? cfg.color + '18' : 'var(--bg-overlay)') : 'transparent',
                  color: isActive ? (cfg?.color ?? 'var(--text-primary)') : 'var(--text-muted)',
                  border: `1px solid ${isActive ? (cfg ? cfg.color + '35' : 'var(--border-bright)') : 'var(--border-subtle)'}`,
                }}>
                {cfg && (
                  <span className='text-[16px] font-bold'>{cfg.icon}</span>
                )}
                {t.label}
                <span className='font-mono text-[16px] px-1 py-0.5 rounded-full'
                  style={{
                    background: isActive ? (cfg ? cfg.color + '25' : 'rgba(var(--overlay-rgb),0.1)') : 'rgba(var(--overlay-rgb),0.06)',
                    color: isActive ? (cfg?.color ?? 'var(--text-primary)') : 'var(--text-muted)',
                  }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status + count */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-0.5'>
            {STATUS_FILTERS.map(f => (
              <button key={f.key}
                onClick={() => setStatus(f.key)}
                className='px-2.5 py-1 rounded-md text-[16px] font-medium transition-all'
                style={{
                  background: status === f.key ? 'var(--bg-overlay)' : 'transparent',
                  color: status === f.key ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: `1px solid ${status === f.key ? 'var(--border-dim)' : 'transparent'}`,
                }}>
                {f.label}
              </button>
            ))}
          </div>
          <span className='text-[16px] font-mono' style={{ color: 'var(--text-muted)' }}>
            {campaigns.length} campaigns
          </span>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-auto flex-1'>
        <table className='w-full text-base data-table' style={{ borderCollapse: 'collapse', minWidth: 920 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)' }}>
              <th className='text-left px-4 py-2.5 sticky left-0 font-medium section-label'
                style={{ background: 'var(--bg-elevated)', zIndex: 1, minWidth: 240 }}>
                <button className='flex items-center gap-1' onClick={() => handleSort('name')}>
                  Campaign <SortIcon k='name' />
                </button>
              </th>
              <th className='px-3 py-2.5 section-label text-center whitespace-nowrap'>Status</th>
              {COLS.map(col => (
                <th key={col.key} className='px-3 py-2.5 section-label text-right whitespace-nowrap'>
                  <button className='flex items-center gap-0.5 ml-auto' onClick={() => handleSort(col.key)}>
                    {col.label} <SortIcon k={col.key} />
                  </button>
                </th>
              ))}
              <th className='px-3 py-2.5 section-label text-center whitespace-nowrap'>Pacing</th>
              <th className='px-3 py-2.5 section-label text-right whitespace-nowrap'>Budget/Day</th>
            </tr>
          </thead>

          <tbody>
            {campaigns.map((camp, i) => {
              const pc = AD_PLATFORM_CONFIG[camp.platform];
              const sc = STATUS_CONFIG[camp.status];
              const isSelected = selected?.id === camp.id;
              const roasColor = camp.roas >= 7 ? '#10d98a' : camp.roas >= 4 ? '#ffb347' : '#ff4444';
              const cpaColor  = camp.cpa <= 30 ? '#10d98a' : camp.cpa <= 60 ? '#ffb347' : '#ff4444';
              const pacingColor = camp.budgetPacing > 95 ? '#ff4444' : camp.budgetPacing > 80 ? '#10d98a' : '#ffb347';
              const rowBg = isSelected
                ? 'rgba(0,217,255,0.04)'
                : i % 2 !== 0
                ? 'rgba(var(--overlay-rgb),0.012)'
                : 'transparent';

              return (
                <tr key={camp.id}
                  className='border-t cursor-pointer transition-colors hover:bg-white/[0.02]'
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: rowBg,
                    borderLeft: isSelected ? '3px solid #00d9ff' : '3px solid transparent',
                  }}
                  onClick={() => onSelectCampaign(camp)}>

                  {/* Campaign name */}
                  <td className='px-4 py-3 sticky left-0' style={{ background: rowBg }}>
                    <div className='flex items-center gap-2.5'>
                      {/* Colored dot instead of icon box */}
                      <div className='w-2 h-2 rounded-full shrink-0' style={{ background: pc.color }} />
                      <div className='min-w-0'>
                        <div className='text-base font-semibold truncate' style={{ color: 'var(--text-primary)', maxWidth: 200 }}>
                          {camp.name}
                        </div>
                        <div className='text-[16px] font-mono flex items-center gap-1.5 mt-0.5'
                          style={{ color: 'var(--text-muted)' }}>
                          <span>{camp.adSets} ad sets</span>
                          <span>·</span>
                          <span>{camp.ads} ads</span>
                          <span>·</span>
                          <span>{camp.store.split('.')[0]}</span>
                          {camp.autoRulesFired > 0 && (
                            <span className='flex items-center gap-0.5 px-1 py-0.5 rounded-full font-semibold'
                              style={{ background: 'rgba(0,217,255,0.12)', color: 'var(--cyan)', fontSize: 16 }}>
                              <Zap size={7} />
                              {camp.autoRulesFired}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className='px-3 py-3 text-center'>
                    <span className='text-[16px] font-mono font-bold px-1.5 py-0.5 rounded'
                      style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </td>

                  {/* Impressions */}
                  <td className='px-3 py-3 text-right font-mono text-base tabular-nums' style={{ color: 'var(--text-secondary)' }}>
                    {fmt(camp.impressions)}
                  </td>
                  {/* CTR */}
                  <td className='px-3 py-3 text-right font-mono text-base tabular-nums' style={{ color: 'var(--text-secondary)' }}>
                    {camp.ctr.toFixed(2)}%
                  </td>
                  {/* Spend */}
                  <td className='px-3 py-3 text-right'>
                    <div className='font-mono text-base tabular-nums' style={{ color: 'var(--text-secondary)' }}>
                      {c$(camp.spendToDate)}
                    </div>
                    <DeltaPill v={camp.spendDelta} />
                  </td>
                  {/* Revenue */}
                  <td className='px-3 py-3 text-right'>
                    <div className='font-mono text-base font-bold tabular-nums' style={{ color: pc.color }}>
                      {c$(camp.revenue)}
                    </div>
                    <DeltaPill v={camp.roasDelta} />
                  </td>
                  {/* ROAS */}
                  <td className='px-3 py-3 text-right'>
                    <span className='font-mono text-base font-bold tabular-nums' style={{ color: roasColor }}>
                      {camp.roas.toFixed(2)}×
                    </span>
                  </td>
                  {/* Conversions */}
                  <td className='px-3 py-3 text-right'>
                    <div className='font-mono text-base tabular-nums' style={{ color: 'var(--text-secondary)' }}>
                      {camp.conversions}
                    </div>
                    <DeltaPill v={camp.conversionsDelta} />
                  </td>
                  {/* CPA */}
                  <td className='px-3 py-3 text-right'>
                    <span className='font-mono text-base tabular-nums' style={{ color: cpaColor }}>
                      {c$(camp.cpa)}
                    </span>
                  </td>
                  {/* Pacing bar */}
                  <td className='px-3 py-3 text-center'>
                    <div className='flex flex-col items-center gap-1'>
                      <div className='w-16 rounded-full overflow-hidden' style={{ height: 6, background: 'var(--bg-overlay)' }}>
                        <div className='h-full rounded-full transition-all'
                          style={{ width: `${Math.min(camp.budgetPacing, 100)}%`, background: pacingColor }} />
                      </div>
                      <span className='text-[16px] font-mono tabular-nums' style={{ color: 'var(--text-muted)' }}>
                        {camp.budgetPacing}%
                      </span>
                    </div>
                  </td>
                  {/* Budget */}
                  <td className='px-3 py-3 text-right font-mono text-base tabular-nums' style={{ color: 'var(--text-muted)' }}>
                    {c$(camp.dailyBudget)}
                  </td>
                </tr>
              );
            })}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={11} className='px-4 py-10 text-center'>
                  {allStoreCampaigns.length === 0 ? (
                    <>
                      <Megaphone size={22} className='mx-auto mb-2' style={{ color: 'var(--text-muted)' }} />
                      <div className='text-base font-medium' style={{ color: 'var(--text-primary)' }}>No campaigns yet</div>
                      <div className='text-[16px] mt-1' style={{ color: 'var(--text-muted)' }}>
                        Connect an ad platform for a store to start pulling in campaign data.
                      </div>
                    </>
                  ) : allCampaigns.length === 0 ? (
                    <>
                      <Megaphone size={22} className='mx-auto mb-2' style={{ color: 'var(--text-muted)' }} />
                      <div className='text-base font-medium' style={{ color: 'var(--text-primary)' }}>No campaigns for the selected store{selectedStoreIds.length !== 1 ? 's' : ''}</div>
                      <div className='text-[16px] mt-1' style={{ color: 'var(--text-muted)' }}>
                        Try selecting a different store, or All Stores.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='text-base font-medium' style={{ color: 'var(--text-primary)' }}>
                        {platform !== 'all' && !AD_PLATFORM_STARTED[platform as AdPlatform]
                          ? 'Not started on this platform yet'
                          : 'No campaigns match these filters'}
                      </div>
                      {platform !== 'all' && !AD_PLATFORM_STARTED[platform as AdPlatform] && (
                        <div className='text-[16px] mt-1' style={{ color: 'var(--text-muted)' }}>
                          No ad account has been connected for {AD_PLATFORM_CONFIG[platform as AdPlatform].label} yet.
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>

          {/* Totals footer */}
          <tfoot>
            <tr className='border-t font-semibold' style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-elevated)' }}>
              <td className='px-4 py-2.5 sticky left-0 text-base font-semibold'
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                TOTAL ({campaigns.length} campaigns)
              </td>
              <td />
              <td className='px-3 py-2.5 text-right font-mono text-base tabular-nums' style={{ color: 'var(--text-secondary)' }}>
                {fmt(campaigns.reduce((s, c) => s + c.impressions, 0))}
              </td>
              <td className='px-3 py-2.5 text-right text-base' style={{ color: 'var(--text-muted)' }}>—</td>
              <td className='px-3 py-2.5 text-right font-mono text-base tabular-nums' style={{ color: 'var(--text-secondary)' }}>
                {c$(campaigns.reduce((s, c) => s + c.spendToDate, 0))}
              </td>
              <td className='px-3 py-2.5 text-right font-mono text-base font-bold tabular-nums' style={{ color: '#10d98a' }}>
                {c$(campaigns.reduce((s, c) => s + c.revenue, 0))}
              </td>
              <td className='px-3 py-2.5 text-right font-mono text-base font-bold tabular-nums' style={{ color: '#10d98a' }}>
                {campaigns.length === 0 ? '—' : (campaigns.reduce((s, c) => s + c.revenue, 0) / (campaigns.reduce((s, c) => s + c.spendToDate, 0) || 1)).toFixed(2) + '×'}
              </td>
              <td className='px-3 py-2.5 text-right font-mono text-base tabular-nums' style={{ color: 'var(--text-secondary)' }}>
                {campaigns.reduce((s, c) => s + c.conversions, 0)}
              </td>
              <td className='px-3 py-2.5 text-right text-base' style={{ color: 'var(--text-muted)' }}>—</td>
              <td /><td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
