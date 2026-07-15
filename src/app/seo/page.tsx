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
import { SEO_STATS } from '@/lib/seoData';
import {
  TrendingUp, TrendingDown, Search, MousePointer, Award,
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
  delta: number;
  deltaLabel: string;
  icon: typeof Search;
  color: string;
  lowerIsBetter?: boolean;
  deltaIsAbsolute?: boolean;
}

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('keywords');
  const s = SEO_STATS;

  const statCards: StatCard[] = [
    {
      label: 'Avg Position',
      value: s.avgPosition.toFixed(1),
      delta: s.avgPositionDelta,
      deltaLabel: 'vs prior 30d',
      icon: Target,
      color: 'var(--cyan)',
      lowerIsBetter: true,
      deltaIsAbsolute: true,
    },
    {
      label: 'Total Keywords',
      value: s.totalKeywords.toLocaleString(),
      delta: s.totalKeywordsDelta,
      deltaLabel: 'this month',
      icon: Search,
      color: '#7b93ff',
      deltaIsAbsolute: true,
    },
    {
      label: 'Top 3 Rankings',
      value: s.top3Count.toLocaleString(),
      delta: s.top3Delta,
      deltaLabel: 'vs prior 30d',
      icon: Award,
      color: '#10d98a',
      deltaIsAbsolute: true,
    },
    {
      label: 'Top 10 Rankings',
      value: s.top10Count.toLocaleString(),
      delta: s.top10Delta,
      deltaLabel: 'vs prior 30d',
      icon: MousePointer,
      color: '#ffb347',
      deltaIsAbsolute: true,
    },
    {
      label: 'Organic Revenue (30d)',
      value: currency(s.organicRevenue30d),
      delta: s.revenueDelta,
      deltaLabel: 'vs prior 30d',
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
          subtitle='All Stores'
          breadcrumbs={['MarketOS', 'SEO']}
        />
        <main className='flex-1 overflow-y-auto p-5'>

          {/* Stats bar */}
          <div className='grid grid-cols-5 gap-3 mb-5'>
            {statCards.map(card => {
              const Icon     = card.icon;
              const positive = card.delta >= 0;
              const isGood   = card.lowerIsBetter ? !positive : positive;
              const sign     = card.delta >= 0 ? '+' : '';
              const deltaDisplay = card.deltaIsAbsolute
                ? `${sign}${card.delta}`
                : `${sign}${card.delta.toFixed(1)}%`;

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
                    className='font-bold text-2xl mb-2 leading-none'
                    style={{ fontFamily: 'DM Mono', color: card.color }}
                  >
                    {card.value}
                  </div>

                  <div
                    className='flex items-center gap-1 text-[16px] font-mono'
                    style={{ color: isGood ? '#10d98a' : '#ff4444' }}
                  >
                    {isGood ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    <span>{deltaDisplay}</span>
                    <span className='ml-1' style={{ color: 'var(--text-muted)' }}>{card.deltaLabel}</span>
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
          {activeTab === 'keywords'   && <KeywordRankTable />}
          {activeTab === 'gsc'        && <GscPerformance />}
          {activeTab === 'audit'      && <OnSiteSeoAudit />}
          {activeTab === 'blog'       && <AiBlogGenerator />}
          {activeTab === 'competitor' && <CompetitorMonitor />}
          {activeTab === 'mentions'   && <BrandMentions />}

        </main>
      </div>
    </div>
  );
}
