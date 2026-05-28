'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import AlertStatsBar from '@/components/alerts/AlertStatsBar';
import AlertFeed from '@/components/alerts/AlertFeed';
import AlertRulesPanel from '@/components/alerts/AlertRulesPanel';
import DeliverySettings from '@/components/alerts/DeliverySettings';
import { Bell, Shield, Settings } from 'lucide-react';
import { ALERT_STATS } from '@/lib/alertData';

type Tab = 'feed' | 'rules' | 'delivery';

const TABS: { key: Tab; label: string; icon: any; badge?: number }[] = [
  { key: 'feed',     label: 'Alert Feed',        icon: Bell,     badge: ALERT_STATS.totalActive },
  { key: 'rules',    label: 'Rules',             icon: Shield                                    },
  { key: 'delivery', label: 'Delivery & Config', icon: Settings                                  },
];

export default function AlertsPage() {
  const [tab, setTab] = useState<Tab>('feed');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          title="Alerts"
          subtitle={`${ALERT_STATS.criticalActive} critical · ${ALERT_STATS.warningActive} warnings`}
          breadcrumbs={['MarketOS', 'Alerts']}
        />
        <main className="flex-1 overflow-hidden flex flex-col p-5 gap-4" style={{ minHeight: 0 }}>

          <AlertStatsBar />

          <div className="flex items-center gap-1 p-1 rounded-xl shrink-0"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: tab === t.key ? 'var(--bg-elevated)' : 'transparent',
                    color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: tab === t.key ? 500 : 400,
                    border: tab === t.key ? '1px solid var(--border-dim)' : '1px solid transparent',
                  }}>
                  <Icon size={13} />
                  {t.label}
                  {t.badge ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
                      style={{ background: '#ff4444', color: 'white', minWidth: 16, textAlign: 'center' }}>
                      {t.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {tab === 'feed'     && <AlertFeed />}
          {tab === 'rules'    && <AlertRulesPanel />}
          {tab === 'delivery' && <div className="flex-1 overflow-y-auto"><DeliverySettings /></div>}

        </main>
      </div>
    </div>
  );
}
