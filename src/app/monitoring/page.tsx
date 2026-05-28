'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import StoreStatusCard from '@/components/monitoring/StoreStatusCard';
import TrafficChart from '@/components/monitoring/TrafficChart';
import ConversionFunnel from '@/components/monitoring/ConversionFunnel';
import AbandonedCartFeed from '@/components/monitoring/AbandonedCartFeed';
import TransactionFeed from '@/components/monitoring/TransactionFeed';
import PageChangeLog from '@/components/monitoring/PageChangeLog';
import AlertBanner from '@/components/monitoring/AlertBanner';
import SeoSnapshot from '@/components/monitoring/SeoSnapshot';
import { MapPin, Zap, DollarSign, Globe, Gauge, Route } from 'lucide-react';

import {
  STORES, TRAFFIC, CONVERSIONS, ABANDONED_CARTS,
  TRANSACTIONS, PAGE_CHANGES, ALERTS, SEO_SNAPSHOTS,
} from '@/lib/mockData';

// ─── Geographic Distribution data ────────────────────────────────────────────

const GEO_DATA: Record<string, Array<{ country: string; flag: string; sessions: number; pct: number; revenue: number }>> = {
  'donut-equipment': [
    { country: 'United States', flag: '🇺🇸', sessions: 8420, pct: 68.4, revenue: 142800 },
    { country: 'Canada',        flag: '🇨🇦', sessions: 1240, pct: 10.1, revenue: 18400 },
    { country: 'United Kingdom',flag: '🇬🇧', sessions: 842,  pct: 6.8,  revenue: 14200 },
    { country: 'Australia',     flag: '🇦🇺', sessions: 612,  pct: 5.0,  revenue: 9800  },
    { country: 'Germany',       flag: '🇩🇪', sessions: 380,  pct: 3.1,  revenue: 6200  },
    { country: 'Other',         flag: '🌍', sessions: 812,  pct: 6.6,  revenue: 8400  },
  ],
  'donut-supplies': [
    { country: 'United States', flag: '🇺🇸', sessions: 6200, pct: 72.1, revenue: 84200 },
    { country: 'Canada',        flag: '🇨🇦', sessions: 840,  pct: 9.8,  revenue: 8400  },
    { country: 'United Kingdom',flag: '🇬🇧', sessions: 580,  pct: 6.7,  revenue: 6200  },
    { country: 'Australia',     flag: '🇦🇺', sessions: 420,  pct: 4.9,  revenue: 4800  },
    { country: 'New Zealand',   flag: '🇳🇿', sessions: 240,  pct: 2.8,  revenue: 2400  },
    { country: 'Other',         flag: '🌍', sessions: 320,  pct: 3.7,  revenue: 2800  },
  ],
  'bakery-wholesalers': [
    { country: 'United States', flag: '🇺🇸', sessions: 11200, pct: 74.2, revenue: 198400 },
    { country: 'Canada',        flag: '🇨🇦', sessions: 1840,  pct: 12.2, revenue: 28400  },
    { country: 'United Kingdom',flag: '🇬🇧', sessions: 840,   pct: 5.6,  revenue: 12400  },
    { country: 'Germany',       flag: '🇩🇪', sessions: 420,   pct: 2.8,  revenue: 6200   },
    { country: 'Australia',     flag: '🇦🇺', sessions: 380,   pct: 2.5,  revenue: 5400   },
    { country: 'Other',         flag: '🌍', sessions: 420,   pct: 2.7,  revenue: 4800   },
  ],
};

// ─── Shopify Flow data ────────────────────────────────────────────────────────

const SHOPIFY_FLOWS: Record<string, Array<{
  id: string;
  name: string;
  trigger: string;
  triggeredToday: number;
  triggered30d: number;
  lastTriggered: string;
  status: 'active' | 'paused';
  outcomes: string;
}>> = {
  'donut-equipment': [
    { id: 'sf-1', name: 'High-Value Customer Tag',  trigger: 'Order value > $5,000',        triggeredToday: 3, triggered30d: 84,  lastTriggered: '12m ago', status: 'active', outcomes: 'Tags customer as VIP, sends welcome flow' },
    { id: 'sf-2', name: 'Reorder Reminder',         trigger: 'Purchase of consumable product', triggeredToday: 8, triggered30d: 247, lastTriggered: '4m ago',  status: 'active', outcomes: 'Schedules 30-day reorder email' },
    { id: 'sf-3', name: 'Out-of-Stock Wishlist',    trigger: 'Product inventory = 0',        triggeredToday: 2, triggered30d: 41,  lastTriggered: '1h ago',  status: 'active', outcomes: 'Adds customers to back-in-stock list' },
  ],
  'donut-supplies': [
    { id: 'sf-4', name: 'Wholesale Qualification',  trigger: 'Order count >= 5',             triggeredToday: 1, triggered30d: 28,  lastTriggered: '2h ago',  status: 'active', outcomes: 'Applies wholesale pricing tier' },
    { id: 'sf-5', name: 'Bulk Order Discount',      trigger: 'Cart value > $500',            triggeredToday: 4, triggered30d: 124, lastTriggered: '18m ago', status: 'active', outcomes: 'Adds 5% discount code to cart' },
  ],
  'bakery-wholesalers': [
    { id: 'sf-6', name: 'New Wholesale Account',    trigger: 'Account type = Wholesale',     triggeredToday: 0, triggered30d: 14,  lastTriggered: '1d ago',  status: 'active', outcomes: 'Notifies sales team, sends onboarding email' },
    { id: 'sf-7', name: 'Monthly Spend Reward',     trigger: 'Monthly spend > $2,000',       triggeredToday: 2, triggered30d: 48,  lastTriggered: '3h ago',  status: 'active', outcomes: 'Issues $50 store credit' },
    { id: 'sf-8', name: 'Lapsed B2B Customer',      trigger: 'No order in 60 days',          triggeredToday: 1, triggered30d: 22,  lastTriggered: '45m ago', status: 'paused', outcomes: 'Triggers win-back email sequence' },
  ],
};

// ─── GeoDistribution component ────────────────────────────────────────────────

function GeoDistribution({ storeId, storeColor }: { storeId: string; storeColor: string }) {
  const rows = GEO_DATA[storeId] ?? [];

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={14} style={{ color: storeColor }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Geographic Distribution
        </h3>
        <span className="section-label ml-auto">{rows.reduce((s, r) => s + r.sessions, 0).toLocaleString()} total sessions</span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 72px 52px 90px',
        gap: '0 12px',
        marginBottom: 6,
        padding: '0 2px',
      }}>
        {['Country', '', 'Sessions', '%', 'Revenue'].map(h => (
          <div key={h} className="section-label" style={{ textAlign: h === 'Revenue' || h === 'Sessions' ? 'right' : 'left' }}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(row => (
          <div key={row.country} style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 72px 52px 90px',
            gap: '0 12px',
            alignItems: 'center',
          }}>
            {/* Flag + Country */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>{row.flag}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.country}
              </span>
            </div>

            {/* Bar */}
            <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${row.pct}%`,
                background: storeColor,
                borderRadius: 3,
                opacity: row.country === 'Other' ? 0.4 : 0.8,
                transition: 'width 0.4s ease',
              }} />
            </div>

            {/* Sessions */}
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {row.sessions.toLocaleString()}
            </div>

            {/* Pct */}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {row.pct.toFixed(1)}%
            </div>

            {/* Revenue */}
            <div style={{ fontSize: 11, color: 'var(--text-primary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
              {formatCurrency(row.revenue)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ShopifyFlowTracker component ─────────────────────────────────────────────

function ShopifyFlowTracker({ storeId }: { storeId: string }) {
  const flows = SHOPIFY_FLOWS[storeId] ?? [];
  const totalToday = flows.reduce((s, f) => s + f.triggeredToday, 0);

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Zap size={14} style={{ color: '#ffb347' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Shopify Flow Triggers
        </h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold ml-1"
          style={{ background: 'rgba(255,179,71,0.15)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.3)' }}>
          {totalToday} triggered today
        </span>
        <button
          className="ml-auto text-[11px] transition-all"
          style={{ color: '#00d9ff', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          View All Flows
        </button>
      </div>
      <p className="section-label mb-4" style={{ fontSize: 10 }}>
        {flows.length} active flow{flows.length !== 1 ? 's' : ''} configured for this store
      </p>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 80px 90px 68px',
        gap: '0 12px',
        marginBottom: 6,
        padding: '0 2px',
      }}>
        {['Flow / Trigger', 'Today', '30-Day', 'Last Run', 'Status'].map(h => (
          <div key={h} className="section-label" style={{ textAlign: h === 'Today' || h === '30-Day' ? 'center' : 'left' }}>
            {h}
          </div>
        ))}
      </div>

      {/* Flow rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {flows.map((flow, i) => (
          <div key={flow.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 80px 90px 68px',
              gap: '0 12px',
              alignItems: 'center',
              padding: '9px 2px',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
            }}>
            {/* Name + trigger */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 2 }}>
                {flow.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{flow.trigger}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>{flow.outcomes}</div>
            </div>

            {/* Triggered today */}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                minWidth: 28,
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 700,
                background: flow.triggeredToday > 0 ? 'rgba(0,217,255,0.12)' : 'var(--bg-surface)',
                color: flow.triggeredToday > 0 ? '#00d9ff' : 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {flow.triggeredToday}
              </span>
            </div>

            {/* Triggered 30d */}
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              {flow.triggered30d}
            </div>

            {/* Last triggered */}
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{flow.lastTriggered}</div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: flow.status === 'active' ? '#10d98a' : '#ffb347',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 10, color: flow.status === 'active' ? '#10d98a' : '#ffb347', textTransform: 'capitalize' }}>
                {flow.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product Pricing Changes (G-03) ──────────────────────────────────────────

const PRICE_CHANGES: Record<string, Array<{
  id: string; product: string; sku: string;
  oldPrice: number; newPrice: number; changedAt: string; alert: boolean;
}>> = {
  'donut-equipment': [
    { id: 'pc-1', product: 'Pro Series Fryer 24"',       sku: 'DF-PRO-24',  oldPrice: 2299, newPrice: 2499, changedAt: '2h ago',  alert: true  },
    { id: 'pc-2', product: 'Commercial Fryer 18"',        sku: 'DF-COM-18',  oldPrice: 1799, newPrice: 1649, changedAt: '1d ago',  alert: false },
    { id: 'pc-3', product: 'Donut Glaze Station',         sku: 'DGS-100',    oldPrice: 449,  newPrice: 489,  changedAt: '3d ago',  alert: false },
  ],
  'donut-supplies': [
    { id: 'pc-4', product: 'Bulk Glaze Mix — Choc 50lb',  sku: 'GM-CHOC-50', oldPrice: 119,  newPrice: 124,  changedAt: '6h ago',  alert: false },
    { id: 'pc-5', product: 'Yeast Donut Mix 50lb',        sku: 'DM-YEAST-50',oldPrice: 189,  newPrice: 149,  changedAt: '2d ago',  alert: false },
  ],
  'bakery-wholesalers': [
    { id: 'pc-6', product: 'Proofing Cabinet 4-Tray',     sku: 'PC-4T',      oldPrice: 1099, newPrice: 899,  changedAt: '4h ago',  alert: true  },
    { id: 'pc-7', product: 'Deck Oven — 2-Tray',          sku: 'DO-2T',      oldPrice: 3499, newPrice: 3699, changedAt: '1d ago',  alert: false },
  ],
};

function PriceChangeMonitor({ storeId, storeColor }: { storeId: string; storeColor: string }) {
  const changes = PRICE_CHANGES[storeId] ?? [];
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div className="flex items-center gap-2 mb-4">
        <DollarSign size={14} style={{ color: storeColor }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Product Pricing Changes</h3>
        <span className="section-label ml-auto">{changes.length} changes detected</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 70px 70px 60px 70px 70px', gap: '0 12px', marginBottom: 6 }}>
        {['Product', 'SKU', 'Old Price', '', 'New Price', 'Changed'].map(h => (
          <div key={h} className="section-label" style={{ fontSize: 10 }}>{h}</div>
        ))}
      </div>
      {changes.map(ch => {
        const isUp = ch.newPrice > ch.oldPrice;
        const pctChange = (((ch.newPrice - ch.oldPrice) / ch.oldPrice) * 100).toFixed(1);
        return (
          <div key={ch.id} style={{ display: 'grid', gridTemplateColumns: '140px 70px 70px 60px 70px 70px', gap: '0 12px', alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.product}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>{ch.sku}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{formatCurrency(ch.oldPrice)}</div>
            <div style={{ fontSize: 11, color: isUp ? '#ff4444' : '#10d98a', fontWeight: 600 }}>
              {isUp ? '▲' : '▼'} {Math.abs(Number(pctChange))}%
            </div>
            <div style={{ fontSize: 11, color: isUp ? '#ff4444' : '#10d98a', fontWeight: 700 }}>{formatCurrency(ch.newPrice)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ch.changedAt}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sitemap New Product Detection (G-04) ────────────────────────────────────

const NEW_PRODUCTS: Record<string, Array<{
  id: string; name: string; url: string; detectedAt: string; category: string; price?: number;
}>> = {
  'donut-equipment': [
    { id: 'np-1', name: 'Electric Mini Donut Fryer — Countertop',  url: '/products/mini-fryer-ct', detectedAt: '4h ago',  category: 'Fryers',   price: 699  },
    { id: 'np-2', name: 'Donut Filling Injector Pro 2026',          url: '/products/injector-pro-26', detectedAt: '1d ago', category: 'Accessories', price: 289 },
  ],
  'donut-supplies': [
    { id: 'np-3', name: 'Matcha Glaze Mix — 25lb',                  url: '/products/matcha-glaze-25', detectedAt: '8h ago', category: 'Glazes', price: 68 },
  ],
  'bakery-wholesalers': [
    { id: 'np-4', name: 'Bread Slicer — 12mm Commercial',           url: '/products/slicer-12mm',   detectedAt: '2d ago', category: 'Equipment', price: 1249 },
    { id: 'np-5', name: 'Artisan Sourdough Starter Kit',            url: '/products/sourdough-kit', detectedAt: '2d ago', category: 'Supplies',  price: 34  },
  ],
};

function SitemapMonitor({ storeId, storeColor }: { storeId: string; storeColor: string }) {
  const products = NEW_PRODUCTS[storeId] ?? [];
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div className="flex items-center gap-2 mb-4">
        <Globe size={14} style={{ color: storeColor }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>New Products Detected via Sitemap</h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold ml-1"
          style={{ background: `${storeColor}18`, color: storeColor }}>{products.length} new</span>
        <span className="section-label ml-auto">Last crawl: 12m ago</span>
      </div>
      {products.length === 0 ? (
        <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No new products detected since last crawl.</div>
      ) : (
        products.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.category} · {p.url} · {p.detectedAt}</div>
            </div>
            {p.price && <div style={{ fontSize: 12, fontWeight: 600, color: storeColor, flexShrink: 0 }}>{formatCurrency(p.price)}</div>}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10d98a', flexShrink: 0 }} title="New" />
          </div>
        ))
      )}
    </div>
  );
}

// ─── Page Load Speed (G-17) ──────────────────────────────────────────────────

const LOAD_SPEED_DATA: Record<string, Array<{
  page: string; desktopMs: number; mobileMs: number; lcp: number; cls: number; fid: number;
}>> = {
  'donut-equipment': [
    { page: 'Homepage',          desktopMs: 1240, mobileMs: 2840, lcp: 2.1, cls: 0.04, fid: 28  },
    { page: '/products',         desktopMs: 1820, mobileMs: 3940, lcp: 2.8, cls: 0.09, fid: 41  },
    { page: '/products/[slug]',  desktopMs: 1480, mobileMs: 3120, lcp: 2.3, cls: 0.06, fid: 33  },
    { page: '/cart',             desktopMs: 980,  mobileMs: 2410, lcp: 1.8, cls: 0.02, fid: 19  },
    { page: '/checkout',         desktopMs: 2140, mobileMs: 5280, lcp: 3.9, cls: 0.18, fid: 84  },
  ],
  'donut-supplies': [
    { page: 'Homepage',          desktopMs: 1380, mobileMs: 3120, lcp: 2.4, cls: 0.05, fid: 31  },
    { page: '/products',         desktopMs: 1960, mobileMs: 4280, lcp: 3.1, cls: 0.11, fid: 48  },
    { page: '/checkout',         desktopMs: 1890, mobileMs: 4640, lcp: 3.4, cls: 0.14, fid: 72  },
  ],
  'bakery-wholesalers': [
    { page: 'Homepage',          desktopMs: 1080, mobileMs: 2560, lcp: 1.9, cls: 0.03, fid: 22  },
    { page: '/products',         desktopMs: 2240, mobileMs: 5120, lcp: 4.1, cls: 0.21, fid: 96  },
    { page: '/checkout',         desktopMs: 1640, mobileMs: 3840, lcp: 2.9, cls: 0.08, fid: 44  },
  ],
};

function speedGrade(ms: number): { label: string; color: string } {
  if (ms < 1500) return { label: 'Good',   color: '#10d98a' };
  if (ms < 3000) return { label: 'OK',     color: '#ffb347' };
  return              { label: 'Slow',    color: '#ff4444' };
}

function LoadSpeedMonitor({ storeId, storeColor }: { storeId: string; storeColor: string }) {
  const pages = LOAD_SPEED_DATA[storeId] ?? [];

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div className="flex items-center gap-2 mb-4">
        <Gauge size={14} style={{ color: storeColor }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Page Load Speed</h3>
        <span className="section-label ml-auto">Core Web Vitals</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 60px 50px 50px', gap: '0 8px', marginBottom: 6 }}>
        {['Page', 'Desktop', 'Mobile', 'LCP', 'CLS', 'FID'].map(h => (
          <div key={h} className="section-label" style={{ fontSize: 10 }}>{h}</div>
        ))}
      </div>
      {pages.map(pg => {
        const dGrade = speedGrade(pg.desktopMs);
        const mGrade = speedGrade(pg.mobileMs);
        const lcpBad = pg.lcp > 2.5;
        const clsBad = pg.cls > 0.1;
        const fidBad = pg.fid > 100;
        return (
          <div key={pg.page} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 60px 50px 50px', gap: '0 8px', alignItems: 'center', padding: '7px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'DM Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pg.page}</div>
            <div style={{ fontSize: 11 }}>
              <span style={{ color: dGrade.color, fontWeight: 600 }}>{pg.desktopMs}ms</span>
              <span style={{ fontSize: 9, marginLeft: 3, color: dGrade.color }}>({dGrade.label})</span>
            </div>
            <div style={{ fontSize: 11 }}>
              <span style={{ color: mGrade.color, fontWeight: 600 }}>{pg.mobileMs}ms</span>
              <span style={{ fontSize: 9, marginLeft: 3, color: mGrade.color }}>({mGrade.label})</span>
            </div>
            <div style={{ fontSize: 11, color: lcpBad ? '#ff4444' : '#10d98a', fontWeight: 600 }}>{pg.lcp}s</div>
            <div style={{ fontSize: 11, color: clsBad ? '#ff4444' : '#10d98a', fontWeight: 600 }}>{pg.cls}</div>
            <div style={{ fontSize: 11, color: fidBad ? '#ff4444' : '#10d98a', fontWeight: 600 }}>{pg.fid}ms</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Customer Journey Tracking (G-13) ────────────────────────────────────────

const JOURNEYS = [
  { id: 'cj-1', steps: ['Home', 'Products', 'Product Detail', 'Cart', 'Checkout'],     sessions: 2840, convRate: 4.2, avgTime: '8m 14s' },
  { id: 'cj-2', steps: ['Google Search', 'Product Detail', 'Cart', 'Checkout'],         sessions: 1920, convRate: 6.8, avgTime: '5m 42s' },
  { id: 'cj-3', steps: ['Home', 'Blog', 'Product Detail', 'Cart', 'Checkout'],           sessions: 840,  convRate: 7.4, avgTime: '12m 30s' },
  { id: 'cj-4', steps: ['Meta Ad', 'Product Detail', 'Checkout'],                        sessions: 620,  convRate: 9.1, avgTime: '3m 18s' },
  { id: 'cj-5', steps: ['Home', 'Products', 'Product Detail', 'Back to Products', 'Product Detail', 'Cart', 'Checkout'], sessions: 480, convRate: 3.1, avgTime: '14m 52s' },
  { id: 'cj-6', steps: ['Email', 'Product Detail', 'Cart', 'Checkout'],                  sessions: 380,  convRate: 11.2, avgTime: '4m 05s' },
];

const STEP_COLORS = ['#00d9ff', '#7b93ff', '#ffb347', '#10d98a', '#ff4444', '#e1306c', '#ff9900'];

function CustomerJourneyTracker() {
  const topJourney = JOURNEYS[0];

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div className="flex items-center gap-2 mb-4">
        <Route size={14} style={{ color: '#7b93ff' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Customer Journey Tracking</h3>
        <span className="section-label ml-auto">Top paths before purchase</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {JOURNEYS.map((journey, ji) => (
          <div key={journey.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, flexWrap: 'wrap' }}>
                {journey.steps.map((step, si) => (
                  <span key={si} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 500,
                      background: `${STEP_COLORS[si % STEP_COLORS.length]}18`,
                      color: STEP_COLORS[si % STEP_COLORS.length],
                      border: `1px solid ${STEP_COLORS[si % STEP_COLORS.length]}30`,
                      whiteSpace: 'nowrap',
                    }}>{step}</span>
                    {si < journey.steps.length - 1 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>→</span>}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{journey.sessions.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>sessions</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10d98a' }}>{journey.convRate}%</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>conv.</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{journey.avgTime}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>avg time</div>
                </div>
              </div>
            </div>
            {/* Mini bar */}
            <div style={{ height: 3, background: 'var(--bg-surface)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(journey.sessions / JOURNEYS[0].sessions) * 100}%`, background: '#7b93ff', opacity: 0.6, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MonitoringPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(STORES[0].id);

  const store = STORES.find(s => s.id === selectedStoreId)!;
  const traffic = TRAFFIC[selectedStoreId];
  const conversions = CONVERSIONS[selectedStoreId];
  const storeCarts = ABANDONED_CARTS.filter(c => c.storeId === selectedStoreId);
  const storeTransactions = TRANSACTIONS.filter(t => t.storeId === selectedStoreId);
  const seoSnapshot = SEO_SNAPSHOTS[selectedStoreId];

  // Summary metrics across all stores
  const totalRevenue = Object.values(CONVERSIONS).reduce((s, c) => s + c.revenueToday, 0);
  const totalOrders = Object.values(CONVERSIONS).reduce((s, c) => s + c.ordersToday, 0);
  const totalSessions = Object.values(TRAFFIC).reduce((s, t) => s + t.sessionsToday, 0);
  const totalCarts = ABANDONED_CARTS.length;
  const cartValue = ABANDONED_CARTS.reduce((s, c) => s + c.cartValue, 0);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          title="Site Monitoring"
          subtitle="3 Stores"
          breadcrumbs={['MarketOS', 'Monitoring']}
        />

        <main className="flex-1 overflow-y-auto p-5">

          {/* Active alerts */}
          <AlertBanner alerts={ALERTS} />

          {/* Cross-store summary bar */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {[
              { label: 'Total Revenue Today', value: formatCurrency(totalRevenue), color: '#10d98a', mono: true },
              { label: 'Total Orders',         value: totalOrders.toString(),       color: '#00d9ff', mono: true },
              { label: 'Total Sessions',       value: totalSessions.toLocaleString(), color: 'var(--text-primary)', mono: true },
              { label: 'Abandoned Carts',      value: totalCarts.toString(),        color: '#ffb347', mono: true },
              { label: 'Cart Value at Risk',   value: formatCurrency(cartValue),    color: '#ff4444', mono: true },
            ].map(stat => (
              <div key={stat.label} className="glass-card px-4 py-3">
                <div className="section-label mb-1.5">{stat.label}</div>
                <div className="data-value text-lg font-semibold stat-count" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Store selector cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {STORES.map(s => (
              <StoreStatusCard
                key={s.id}
                store={s}
                traffic={TRAFFIC[s.id]}
                conversions={CONVERSIONS[s.id]}
                isSelected={s.id === selectedStoreId}
                onSelect={() => setSelectedStoreId(s.id)}
              />
            ))}
          </div>

          {/* Selected store label */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: store.color }} />
            <h2 className="text-sm font-semibold" style={{ color: store.color }}>
              {store.name}
            </h2>
            <span className="section-label">— {store.domain}</span>
            <div className="flex-1 h-px ml-2" style={{ background: 'var(--border-subtle)' }} />
          </div>

          {/* Row 1: Traffic + Funnel */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <TrafficChart traffic={traffic} storeColor={store.color} />
            <ConversionFunnel conversions={conversions} storeColor={store.color} />
          </div>

          {/* Row 2: Abandoned Carts + Live Transactions */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <AbandonedCartFeed carts={storeCarts} storeColor={store.color} />
            <TransactionFeed transactions={storeTransactions} storeColor={store.color} />
          </div>

          {/* Row 3: Page Change Log + SEO */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="col-span-2">
              <PageChangeLog changes={PAGE_CHANGES} />
            </div>
            <SeoSnapshot snapshot={seoSnapshot} />
          </div>

          {/* Row 4: Geographic Distribution + Shopify Flow Tracking */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <GeoDistribution storeId={selectedStoreId} storeColor={store.color} />
            <ShopifyFlowTracker storeId={selectedStoreId} />
          </div>

          {/* Row 5: Price Change Monitor + Sitemap New Products */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <PriceChangeMonitor storeId={selectedStoreId} storeColor={store.color} />
            <SitemapMonitor storeId={selectedStoreId} storeColor={store.color} />
          </div>

          {/* Row 6: Page Load Speed + Customer Journey */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <LoadSpeedMonitor storeId={selectedStoreId} storeColor={store.color} />
            <CustomerJourneyTracker />
          </div>

        </main>
      </div>
    </div>
  );
}
