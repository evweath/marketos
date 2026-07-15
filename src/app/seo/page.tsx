'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { KeywordRankTable }  from '@/components/seo/KeywordRankTable';
import { GscPerformance }    from '@/components/seo/GscPerformance';
import { OnSiteSeoAudit }    from '@/components/seo/OnSiteSeoAudit';
import { AiBlogGenerator }   from '@/components/seo/AiBlogGenerator';
import { CompetitorMonitor } from '@/components/seo/CompetitorMonitor';
import { BrandMentions }     from '@/components/seo/BrandMentions';
import { computeSeoStats } from '@/lib/seoData';
import type { KeywordRanking, GscStoreMetrics } from '@/lib/seoData';
import { usePersistentState } from '@/lib/usePersistentState';
import { useStoreScope } from '@/lib/storeScope';
import { StoreScopeBar } from '@/components/shared/StoreScopeBar';
import {
  Search, MousePointer, Award,
  Target, DollarSign, BarChart2, Wrench, PenSquare, Globe, MessageSquare,
} from 'lucide-react';

type Tab = 'keywords' | 'gsc' | 'audit' | 'blog' | 'competitor' | 'mentions';

const TABS: { key: Tab; label: string; icon: typeof Search }[] = [
  { key: 'keywords',   label: 'Keyword Rankings',  icon: Search       },
  { key: 'gsc',        label: 'GSC Performance',    icon: BarChart2    },
  { key: 'audit',      label: 'On-Site Audit',      icon: Wrench       },
  { key: 'blog',       label: 'AI Blog Generator',  icon: PenSquare    },
  { key: 'competitor', label: 'Competitor Monitor', icon: Globe        },
  { key: 'mentions',   label: 'Brand Mentions',     icon: MessageSquare },
];

function currency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

interface StatCard {
  label: string;
  value: string;
  icon: typeof Search;
  color: string;
}

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('keywords');
  const { selectedStoreIds } = useStoreScope('seo');
  const [allKeywords] = usePersistentState<KeywordRanking[]>('seo.keywordRankings', []);
  const [allGscMetrics] = usePersistentState<GscStoreMetrics[]>('seo.gscMetrics', []);
  const keywords = allKeywords.filter(k => selectedStoreIds.includes(k.store));
  const gscMetrics = allGscMetrics.filter(m => selectedStoreIds.includes(m.store));
  const s = computeSeoStats(keywords, gscMetrics);

  const statCards: StatCard[] = [
    {
      label: 'Avg Position',
      value: s.avgPosition > 0 ? s.avgPosition.toFixed(1) : '—',
      icon: Target,
      color: 'var(--cyan)',
    },
    {
      label: 'Total Keywords',
      value: s.totalKeywords.toLocaleString(),
      icon: Search,
      color: '#7b93ff',
    },
    {
      label: 'Top 3 Rankings',
      value: s.top3Count.toLocaleString(),
      icon: Award,
      color: '#10d98a',
    },
    {
      label: 'Top 10 Rankings',
      value: s.top10Count.toLocaleString(),
      icon: MousePointer,
      color: '#ffb347',
    },
    {
      label: 'Organic Revenue (30d)',
      value: currency(s.organicRevenue30d),
      icon: DollarSign,
      color: '#10d98a',
    },
  ];

  return (
    <div className='flex h-screen overflow-hidden' style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className='flex flex-col flex-1 min-w-0 overflow-hidden'>
        <TopBar
          title='SEO'
          subtitle={`${selectedStoreIds.length} store${selectedStoreIds.length !== 1 ? 's' : ''}`}
          breadcrumbs={['MarketOS', 'SEO']}
        />
        <main className='flex-1 overflow-y-auto p-5'>

          <div className='mb-5'><StoreScopeBar sectionKey='seo' /></div>

          {/* Stats bar */}
          <div className='grid grid-cols-5 gap-3 mb-5'>
            {statCards.map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className='glass-card px-4 py-3.5 relative overflow-hidden'>
                  {/* Glow blob */}
                  <div
                    className='absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none'
                    style={{ background: card.color, opacity: 0.06, transform: 'translate(40%, -40%)' }}
                  />

                  <div className='flex items-start justify-between mb-2.5'>
                    <div className='section-label'>{card.label}</div>
                    <div
                      className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0'
                      style={{ background: card.color + '20' }}
                    >
                      <Icon size={13} style={{ color: card.color }} />
                    </div>
                  </div>

                  <div
                    className='font-bold text-2xl leading-none'
                    style={{ fontFamily: 'DM Mono', color: card.color }}
                  >
                    {card.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tab navigation — pill container */}
          <div
            className='flex items-center gap-0.5 mb-5 p-1'
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              width: 'fit-content',
            }}
          >
            {TABS.map(tab => {
              const active = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className='flex items-center gap-1.5 px-3.5 py-2 text-base font-medium transition-all whitespace-nowrap'
                  style={{
                    borderRadius: 7,
                    background: active ? 'var(--bg-overlay)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: active ? '1px solid var(--border-dim)' : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <TabIcon size={12} style={{ color: active ? 'var(--cyan)' : 'var(--text-muted)' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {activeTab === 'keywords'   && <KeywordRankTable selectedStoreIds={selectedStoreIds} />}
          {activeTab === 'gsc'        && <GscPerformance selectedStoreIds={selectedStoreIds} />}
          {activeTab === 'audit'      && <OnSiteSeoAudit selectedStoreIds={selectedStoreIds} />}
          {activeTab === 'blog'       && <AiBlogGenerator selectedStoreIds={selectedStoreIds} />}
          {activeTab === 'competitor' && <CompetitorMonitor selectedStoreIds={selectedStoreIds} />}
          {activeTab === 'mentions'   && <BrandMentions selectedStoreIds={selectedStoreIds} />}

        </main>
      </div>
    </div>
  );
}
