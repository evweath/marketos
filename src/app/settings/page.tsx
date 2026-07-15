'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { IntegrationHub } from '@/components/settings/IntegrationHub';
import { StoreSettings } from '@/components/settings/StoreSettings';
import { TeamSettings } from '@/components/settings/TeamSettings';
import { TrackingSettings } from '@/components/settings/TrackingSettings';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { DataSettings } from '@/components/settings/DataSettings';
import {
  Plug,
  ShoppingBag,
  Users,
  Radio,
  SlidersHorizontal,
  Database,
} from 'lucide-react';

type Section = 'integrations' | 'stores' | 'team' | 'tracking' | 'general' | 'data';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ElementType;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'integrations', label: 'Integrations',   icon: Plug,              description: 'Connected platforms'         },
  { id: 'stores',       label: 'Stores',          icon: ShoppingBag,       description: 'Shopify store management'    },
  { id: 'team',         label: 'Team & Access',   icon: Users,             description: 'Members and permissions'     },
  { id: 'tracking',     label: 'Tracking & APIs', icon: Radio,             description: 'CAPI, conversions, UTM'      },
  { id: 'general',      label: 'General',         icon: SlidersHorizontal, description: 'Account and branding'        },
  { id: 'data',         label: 'Data',            icon: Database,         description: 'Sample data & reset'         },
];

const SECTION_TITLES: Record<Section, { title: string; description: string }> = {
  integrations: { title: 'Integration Hub',       description: 'Manage all connected data sources and platforms'         },
  stores:       { title: 'Store Management',       description: 'Shopify connections, sync status, and webhooks'          },
  team:         { title: 'Team & Access Control',  description: 'Members, roles, and module permissions'                  },
  tracking:     { title: 'Tracking & APIs',        description: 'Server-side events, conversion APIs, and UTM defaults'   },
  general:      { title: 'General Settings',       description: 'Business info, branding, and data preferences'           },
  data:         { title: 'Data',                   description: 'Load realistic sample data for a demo, or reset to empty' },
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('integrations');

  const { title, description } = SECTION_TITLES[activeSection];

  return (
    <div className='flex h-screen overflow-hidden' style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className='flex flex-col flex-1 min-w-0 overflow-hidden'>
        <TopBar
          title='Settings'
          subtitle='Account & Integrations'
          breadcrumbs={['MarketOS', 'Settings']}
        />
        <main className='flex-1 overflow-hidden'>
          <div className='flex h-full min-h-0'>

            {/* Settings sidebar nav */}
            <nav
              className='w-60 shrink-0 flex flex-col py-5 px-3 gap-0.5 overflow-y-auto'
              style={{ background: 'var(--bg-nav)', borderRight: '1px solid var(--border-subtle)' }}
            >
              <div className='section-label px-3 mb-4'>Configuration</div>

              {NAV_ITEMS.map(({ id, label, icon: Icon, description: desc }) => {
                const active = activeSection === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className='w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group'
                    style={{
                      background: active ? 'var(--bg-elevated)' : 'transparent',
                      borderLeft: active ? '3px solid var(--cyan)' : '3px solid transparent',
                      paddingLeft: active ? 'calc(0.75rem - 0px)' : '0.75rem',
                    }}
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.8}
                      style={{ color: active ? 'var(--cyan)' : 'var(--text-muted)', flexShrink: 0 }}
                    />
                    <div className='flex flex-col min-w-0'>
                      <span
                        className='text-base leading-tight font-medium'
                        style={{ color: active ? 'var(--cyan)' : 'var(--text-secondary)' }}
                      >
                        {label}
                      </span>
                      <span
                        className='text-[16px] leading-tight mt-0.5 truncate font-mono'
                        style={{ color: active ? 'rgba(0,217,255,0.55)' : 'var(--text-muted)' }}
                      >
                        {desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Content area */}
            <div className='flex-1 overflow-y-auto p-6 min-w-0'>
              {/* Section header */}
              <div className='mb-6 pb-4' style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 className='text-base font-semibold mb-0.5' style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h2>
                <p className='text-base' style={{ color: 'var(--text-muted)' }}>
                  {description}
                </p>
              </div>

              {activeSection === 'integrations' && <IntegrationHub />}
              {activeSection === 'stores'       && <StoreSettings />}
              {activeSection === 'team'         && <TeamSettings />}
              {activeSection === 'tracking'     && <TrackingSettings />}
              {activeSection === 'general'      && <GeneralSettings />}
              {activeSection === 'data'         && <DataSettings />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
