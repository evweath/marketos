'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2, Globe, Bell, Send, Zap, ShoppingCart,
  Mail, Search, Settings, Radio, Sparkles, BookOpen
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/monitoring', label: 'Site Monitoring', icon: Globe,        badge: 3,    badgeColor: '#ffb347' },
  { href: '/analytics',  label: 'Analytics',       icon: BarChart2,   badge: null, badgeColor: null },
  { href: '/ads',        label: 'Ad Campaigns',    icon: Zap,         badge: null, badgeColor: null },
  { href: '/social',     label: 'Social Media',    icon: Send,        badge: null, badgeColor: null },
  { href: '/email',      label: 'Email & SMS',     icon: Mail,        badge: null, badgeColor: null },
  { href: '/content',    label: 'AI Content',      icon: Sparkles,    badge: null, badgeColor: null },
  { href: '/cart',       label: 'Cart Recovery',   icon: ShoppingCart,badge: 5,    badgeColor: '#ff4444' },
  { href: '/alerts',     label: 'Alerts',          icon: Bell,        badge: 4,    badgeColor: '#ff4444' },
  { href: '/seo',        label: 'SEO',             icon: Search,      badge: null, badgeColor: null },
  { href: '/glossary',   label: 'Glossary',        icon: BookOpen,    badge: null, badgeColor: null },
];

const STORES = [
  { id: 'donut-equipment',   label: 'Donut Equipment',  color: '#00d9ff', status: 'online'   },
  { id: 'donut-supplies',    label: 'Donut Supplies',   color: '#ffb347', status: 'degraded' },
  { id: 'bakery-wholesalers',label: 'Bakery Wholesale', color: '#10d98a', status: 'online'   },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col h-screen w-56 shrink-0"
      style={{
        background: 'var(--bg-nav)',
        borderRight: '1px solid var(--border-subtle)',
        boxShadow: '1px 0 0 var(--border-subtle)',
      }}
    >
      {/* ── Logo ────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #00d9ff 0%, #7b93ff 100%)',
            boxShadow: '0 2px 12px rgba(0,217,255,0.3)',
          }}
        >
          <Radio size={15} color="#080b18" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-base font-semibold leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
            MarketOS
          </div>
          <div className="text-[16px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
            3 stores connected
          </div>
        </div>
      </div>

      {/* ── Nav ─────────────────────────── */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <div className="section-label px-2 mb-2.5">Navigation</div>

        {NAV_ITEMS.map(({ href, label, icon: Icon, badge, badgeColor }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${active ? 'active' : ''}`}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: active ? 'rgba(0,217,255,0.15)' : 'rgba(var(--overlay-rgb),0.04)',
                }}
              >
                <Icon
                  size={13}
                  strokeWidth={active ? 2 : 1.8}
                  style={{ color: active ? 'var(--cyan)' : 'var(--text-secondary)' }}
                />
              </div>
              <span className="flex-1 text-[16px]">{label}</span>
              {badge !== null && badgeColor && (
                <span
                  className="text-[16px] px-1.5 py-0.5 rounded-full font-mono font-semibold leading-none"
                  style={{
                    background: active ? `${badgeColor}25` : `${badgeColor}18`,
                    color: active ? badgeColor : 'var(--text-muted)',
                    border: `1px solid ${badgeColor}30`,
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Store Status ─────────────────── */}
      <div
        className="px-2.5 py-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="section-label px-2 mb-2">Stores</div>
        {STORES.map(store => (
          <div
            key={store.id}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg"
            style={{ cursor: 'default' }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${store.status === 'degraded' ? 'live-dot-amber' : 'live-dot'}`}
              style={{ background: store.color }}
            />
            <span
              className="text-base truncate flex-1"
              style={{ color: 'var(--text-secondary)', fontWeight: 450 }}
            >
              {store.label}
            </span>
            <span
              className="text-[16px] font-mono font-semibold"
              style={{ color: store.status === 'degraded' ? '#ffb347' : '#10d98a' }}
            >
              {store.status === 'degraded' ? 'SLOW' : 'UP'}
            </span>
          </div>
        ))}
      </div>

      {/* ── Settings ─────────────────────── */}
      <div className="px-2.5 pb-3">
        <Link
          href="/settings"
          className={`nav-item ${pathname.startsWith('/settings') ? 'active' : ''}`}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: 'rgba(var(--overlay-rgb),0.04)' }}
          >
            <Settings size={13} strokeWidth={1.8} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <span className="text-[16px]">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
