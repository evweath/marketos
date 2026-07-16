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
import { MapPin, Zap, DollarSign, Globe, Gauge, Route, TrendingUp, TrendingDown } from 'lucide-react';

import { useMonitoringStores, DEFAULT_TRAFFIC, DEFAULT_CONVERSIONS, DEFAULT_SEO_SNAPSHOT } from '@/lib/mockData';
import type { StoreWebVitals, WebVitalMetric, JourneyPath, SitemapDiff } from '@/lib/mockData';
import { usePersistentState } from '@/lib/usePersistentState';
import { useStoreScope, useStores, resolveStoreId } from '@/lib/storeScope';
import { StoreScopeBar } from '@/components/shared/StoreScopeBar';
import type { TrafficMetrics, ConversionMetrics, AbandonedCart, Transaction, PageChange, SeoSnapshot as SeoSnapshotData, Alert } from '@/types';
import type { FiredAlert } from '@/lib/alertData';

// ─── Geographic Distribution data ────────────────────────────────────────────
// Empty until a real analytics connection supplies per-country session data
// (this per-page breakdown is slated for a full rebuild in a later pass).

const GEO_DATA: Record<string, Array<{ country: string; flag: string; sessions: number; pct: number; revenue: number }>> = {};

// ─── Shopify Flow data ────────────────────────────────────────────────────────

// Empty until Shopify Flow webhooks are wired up for a store.
const SHOPIFY_FLOWS: Record<string, Array<{
  id: string;
  name: string;
  trigger: string;
  triggeredToday: number;
  triggered30d: number;
  lastTriggered: string;
  status: 'active' | 'paused';
  outcomes: string;
}>> = {};

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
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          Geographic Distribution
        </h3>
        <span className="section-label ml-auto">{rows.reduce((s, r) => s + r.sessions, 0).toLocaleString()} total sessions</span>
      </div>

      {rows.length === 0 && (
        <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No geographic data yet for this store.</div>
      )}

      {/* Column headers */}
      {rows.length > 0 && (
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
      )}

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
              <span style={{ fontSize: 16, lineHeight: 1 }}>{row.flag}</span>
              <span style={{ fontSize: 16, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {row.sessions.toLocaleString()}
            </div>

            {/* Pct */}
            <div style={{ fontSize: 16, color: 'var(--text-muted)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {row.pct.toFixed(1)}%
            </div>

            {/* Revenue */}
            <div style={{ fontSize: 16, color: 'var(--text-primary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
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
  const [viewedAll, setViewedAll] = useState(false);

  const handleViewAll = () => {
    setViewedAll(true);
    setTimeout(() => setViewedAll(false), 2000);
  };

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Zap size={14} style={{ color: '#ffb347' }} />
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          Shopify Flow Triggers
        </h3>
        <span className="px-2 py-0.5 rounded-full text-[16px] font-semibold ml-1"
          style={{ background: 'rgba(255,179,71,0.15)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.3)' }}>
          {totalToday} triggered today
        </span>
        <button
          onClick={handleViewAll}
          className="ml-auto text-[16px] transition-all"
          style={{ color: viewedAll ? '#10d98a' : 'var(--cyan)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {viewedAll ? `Showing all ${flows.length}` : 'View All Flows'}
        </button>
      </div>
      <p className="section-label mb-4" style={{ fontSize: 16 }}>
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
              <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 2 }}>
                {flow.name}
              </div>
              <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>{flow.trigger}</div>
              <div style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>{flow.outcomes}</div>
            </div>

            {/* Triggered today */}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                minWidth: 28,
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                background: flow.triggeredToday > 0 ? 'rgba(0,217,255,0.12)' : 'var(--bg-surface)',
                color: flow.triggeredToday > 0 ? 'var(--cyan)' : 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {flow.triggeredToday}
              </span>
            </div>

            {/* Triggered 30d */}
            <div style={{ textAlign: 'center', fontSize: 16, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              {flow.triggered30d}
            </div>

            {/* Last triggered */}
            <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>{flow.lastTriggered}</div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: flow.status === 'active' ? '#10d98a' : '#ffb347',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 16, color: flow.status === 'active' ? '#10d98a' : '#ffb347', textTransform: 'capitalize' }}>
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

// Empty until a real price-monitoring crawl has run for a store.
const PRICE_CHANGES: Record<string, Array<{
  id: string; product: string; sku: string;
  oldPrice: number; newPrice: number; changedAt: string; alert: boolean;
}>> = {};

function PriceChangeMonitor({ storeId, storeColor }: { storeId: string; storeColor: string }) {
  const changes = PRICE_CHANGES[storeId] ?? [];
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div className="flex items-center gap-2 mb-4">
        <DollarSign size={14} style={{ color: storeColor }} />
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Product Pricing Changes</h3>
        <span className="section-label ml-auto">{changes.length} changes detected</span>
      </div>
      {changes.length === 0 && (
        <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No price changes detected yet.</div>
      )}
      {changes.length > 0 && (
      <div style={{ display: 'grid', gridTemplateColumns: '140px 70px 70px 60px 70px 70px', gap: '0 12px', marginBottom: 6 }}>
        {['Product', 'SKU', 'Old Price', '', 'New Price', 'Changed'].map(h => (
          <div key={h} className="section-label" style={{ fontSize: 16 }}>{h}</div>
        ))}
      </div>
      )}
      {changes.map(ch => {
        const isUp = ch.newPrice > ch.oldPrice;
        const pctChange = (((ch.newPrice - ch.oldPrice) / ch.oldPrice) * 100).toFixed(1);
        return (
          <div key={ch.id} style={{ display: 'grid', gridTemplateColumns: '140px 70px 70px 60px 70px 70px', gap: '0 12px', alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.product}</div>
            <div style={{ fontSize: 16, color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>{ch.sku}</div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{formatCurrency(ch.oldPrice)}</div>
            <div style={{ fontSize: 16, color: isUp ? '#ff4444' : '#10d98a', fontWeight: 600 }}>
              {isUp ? '▲' : '▼'} {Math.abs(Number(pctChange))}%
            </div>
            <div style={{ fontSize: 16, color: isUp ? '#ff4444' : '#10d98a', fontWeight: 700 }}>{formatCurrency(ch.newPrice)}</div>
            <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>{ch.changedAt}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sitemap New Product Detection (G-04) ────────────────────────────────────

function SitemapMonitor({ storeId, storeColor }: { storeId: string; storeColor: string }) {
  const [allChanges] = usePersistentState<Record<string, SitemapDiff>>('monitoring.sitemapChanges', {});
  const diff = allChanges[storeId] ?? { added: [], removed: [] };
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);
  const empty = diff.added.length === 0 && diff.removed.length === 0;

  const row = (p: typeof diff.added[number], kind: 'added' | 'removed') => {
    const color = kind === 'added' ? '#10d98a' : '#ff4444';
    return (
      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ color, fontSize: 16, fontWeight: 700, flexShrink: 0, width: 14, textAlign: 'center' }}>{kind === 'added' ? '+' : '−'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, color: kind === 'removed' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: kind === 'removed' ? 'line-through' : 'none' }}>{p.name}</div>
          <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>{p.category} · {p.url} · {p.detectedAt}</div>
        </div>
        {p.price && <div style={{ fontSize: 16, fontWeight: 600, color: storeColor, flexShrink: 0 }}>{formatCurrency(p.price)}</div>}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} title={kind === 'added' ? 'New' : 'Removed'} />
      </div>
    );
  };

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Globe size={14} style={{ color: storeColor }} />
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Sitemap Product Changes</h3>
        <span className="px-2 py-0.5 rounded-full text-[16px] font-semibold ml-1"
          style={{ background: 'rgba(16,217,138,0.15)', color: '#10d98a' }}>{diff.added.length} added</span>
        <span className="px-2 py-0.5 rounded-full text-[16px] font-semibold"
          style={{ background: 'rgba(255,68,68,0.15)', color: '#ff4444' }}>{diff.removed.length} removed</span>
        <span className="section-label ml-auto">Last crawl: 12m ago</span>
      </div>
      {empty ? (
        <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No sitemap changes detected since last crawl.</div>
      ) : (
        <>
          {diff.added.map(p => row(p, 'added'))}
          {diff.removed.map(p => row(p, 'removed'))}
        </>
      )}
    </div>
  );
}

// ─── Core Web Vitals gauges (G-17) ───────────────────────────────────────────

type Rating = { label: string; color: string };
// Google CWV thresholds: [good ≤, needs-improvement ≤]
const CWV_META = {
  lcp: { label: 'LCP', name: 'Largest Contentful Paint', unit: 's',  good: 2.5, ni: 4.0,  max: 6.0,  fmt: (v: number) => v.toFixed(1) },
  cls: { label: 'CLS', name: 'Cumulative Layout Shift',  unit: '',   good: 0.1, ni: 0.25, max: 0.4,  fmt: (v: number) => v.toFixed(2) },
  inp: { label: 'INP', name: 'Interaction to Next Paint', unit: 'ms', good: 200, ni: 500,  max: 700,  fmt: (v: number) => String(Math.round(v)) },
} as const;
type CwvKey = keyof typeof CWV_META;

function cwvRating(key: CwvKey, v: number): Rating {
  const m = CWV_META[key];
  if (v <= m.good) return { label: 'Good', color: '#10d98a' };
  if (v <= m.ni)   return { label: 'Needs work', color: '#ffb347' };
  return             { label: 'Poor', color: '#ff4444' };
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 120, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function CwvGauge({ metricKey, metric }: { metricKey: CwvKey; metric: WebVitalMetric }) {
  const m = CWV_META[metricKey];
  const rating = cwvRating(metricKey, metric.current);
  // Semicircle arc gauge (180°), fill proportional to value vs a sensible max.
  const size = 92, r = 38, cx = size / 2, cy = size / 2;
  const semi = Math.PI * r;                       // arc length of a half circle
  const frac = Math.min(metric.current / m.max, 1);
  const dash = frac * semi;
  return (
    <div className="rounded-xl p-3 flex flex-col items-center"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div className="section-label mb-1" title={m.name}>{m.label}</div>
      <div style={{ position: 'relative', width: size, height: size / 2 + 8 }}>
        <svg width={size} height={size / 2 + 8} style={{ overflow: 'visible' }}>
          {/* track */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="var(--bg-overlay)" strokeWidth={7} strokeLinecap="round" />
          {/* value arc */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke={rating.color} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={`${dash} ${semi - dash}`} />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
          <span className="font-mono font-bold" style={{ fontSize: 20, color: rating.color }}>{m.fmt(metric.current)}</span>
          <span className="font-mono" style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 2 }}>{m.unit}</span>
        </div>
      </div>
      <div className="text-[16px] font-mono mb-1.5" style={{ color: rating.color }}>{rating.label}</div>
      <Sparkline data={metric.history} color={rating.color} />
      <div className="section-label mt-1" style={{ fontSize: 16 }}>7-day trend</div>
    </div>
  );
}

function LoadSpeedMonitor({ storeId, storeColor }: { storeId: string; storeColor: string }) {
  const [allVitals] = usePersistentState<Record<string, StoreWebVitals>>('monitoring.webVitals', {});
  const vitals = allVitals[storeId];

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div className="flex items-center gap-2 mb-4">
        <Gauge size={14} style={{ color: storeColor }} />
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Core Web Vitals</h3>
        <span className="section-label ml-auto">Field data · last 7 days</span>
      </div>
      {!vitals ? (
        <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>No Core Web Vitals data yet for this store.</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <CwvGauge metricKey="lcp" metric={vitals.lcp} />
          <CwvGauge metricKey="cls" metric={vitals.cls} />
          <CwvGauge metricKey="inp" metric={vitals.inp} />
        </div>
      )}
    </div>
  );
}

// ─── Customer Journey Tracking (G-13) ────────────────────────────────────────

const STEP_COLORS = ['#00d9ff', '#7b93ff', '#ffb347', '#10d98a', '#ff4444', '#e1306c', '#ff9900'];

function CustomerJourneyTracker({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [allJourneys] = usePersistentState<JourneyPath[]>('monitoring.journeys', []);
  const journeys = allJourneys
    .filter(j => selectedStoreIds.includes(resolveStoreId(j.store, stores) ?? ''))
    .sort((a, b) => b.sessions - a.sessions);
  const maxSessions = journeys[0]?.sessions ?? 1;

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div className="flex items-center gap-2 mb-4">
        <Route size={14} style={{ color: '#7b93ff' }} />
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Customer Journey Tracking</h3>
        <span className="section-label ml-auto">Top paths before purchase</span>
      </div>
      {journeys.length === 0 && (
        <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>
          {allJourneys.length === 0 ? 'No journey data yet.' : 'No journey data for the selected store(s).'}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {journeys.map(journey => {
          const up = journey.sessionsDelta >= 0;
          return (
            <div key={journey.id}>
              {/* Named pattern + trend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{journey.name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 16, fontFamily: 'DM Mono', color: up ? '#10d98a' : '#ff4444' }}>
                  {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {up ? '+' : ''}{journey.sessionsDelta.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, flexWrap: 'wrap' }}>
                  {journey.steps.map((step, si) => (
                    <span key={si} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        fontSize: 16, padding: '2px 8px', borderRadius: 12, fontWeight: 500,
                        background: `${STEP_COLORS[si % STEP_COLORS.length]}18`,
                        color: STEP_COLORS[si % STEP_COLORS.length],
                        border: `1px solid ${STEP_COLORS[si % STEP_COLORS.length]}30`,
                        whiteSpace: 'nowrap',
                      }}>{step}</span>
                      {si < journey.steps.length - 1 && <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>→</span>}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{journey.sessions.toLocaleString()}</div>
                    <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>sessions</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#10d98a' }}>{journey.convRate}%</div>
                    <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>conv.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>{journey.avgTime}</div>
                    <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>avg time</div>
                  </div>
                </div>
              </div>
              {/* Mini bar */}
              <div style={{ height: 3, background: 'var(--bg-surface)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(journey.sessions / maxSessions) * 100}%`, background: '#7b93ff', opacity: 0.6, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MonitoringPage() {
  const allStores = useMonitoringStores();
  const { selectedStoreIds } = useStoreScope('monitoring');
  const stores = allStores.filter(s => selectedStoreIds.includes(s.id));
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [allTraffic]      = usePersistentState<Record<string, TrafficMetrics>>('monitoring.traffic', {});
  const [allConversions]  = usePersistentState<Record<string, ConversionMetrics>>('monitoring.conversions', {});
  const [allCarts]        = usePersistentState<AbandonedCart[]>('monitoring.abandonedCarts', []);
  const [allTransactions] = usePersistentState<Transaction[]>('monitoring.transactions', []);
  const [allPageChanges]  = usePersistentState<PageChange[]>('monitoring.pageChanges', []);
  const [allSeoSnapshots] = usePersistentState<Record<string, SeoSnapshotData>>('monitoring.seoSnapshots', {});
  const [firedAlerts]     = usePersistentState<FiredAlert[]>('alerts.list', []);

  // The single-store detail drill-down operates within the current scope;
  // if the previously-selected store falls out of scope, fall back to the
  // first in-scope store.
  const activeStoreId = (selectedStoreId && stores.some(s => s.id === selectedStoreId))
    ? selectedStoreId
    : (stores[0]?.id || '');
  const store = stores.find(s => s.id === activeStoreId);
  const traffic = allTraffic[activeStoreId] ?? DEFAULT_TRAFFIC;
  const conversions = allConversions[activeStoreId] ?? DEFAULT_CONVERSIONS;
  const storeCarts = allCarts.filter(c => c.storeId === activeStoreId);
  const storeTransactions = allTransactions.filter(t => t.storeId === activeStoreId);
  const seoSnapshot = allSeoSnapshots[activeStoreId] ?? DEFAULT_SEO_SNAPSHOT(activeStoreId);

  const bannerAlerts: Alert[] = firedAlerts
    .filter(a => a.storeId === null || selectedStoreIds.includes(a.storeId))
    .map(a => ({
      id: a.id, storeId: a.storeId, severity: a.severity, title: a.title,
      message: a.detail, createdAt: a.firedAt, acknowledged: a.status !== 'active',
    }));

  // Summary metrics aggregated across the in-scope stores.
  const scopedConversions = stores.map(s => allConversions[s.id]).filter(Boolean) as ConversionMetrics[];
  const scopedTraffic = stores.map(s => allTraffic[s.id]).filter(Boolean) as TrafficMetrics[];
  const scopedCarts = allCarts.filter(c => selectedStoreIds.includes(c.storeId));
  const totalRevenue = scopedConversions.reduce((s, c) => s + c.revenueToday, 0);
  const totalOrders = scopedConversions.reduce((s, c) => s + c.ordersToday, 0);
  const totalSessions = scopedTraffic.reduce((s, t) => s + t.sessionsToday, 0);
  const totalCarts = scopedCarts.length;
  const cartValue = scopedCarts.reduce((s, c) => s + c.cartValue, 0);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

  if (!store) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar title="Site Monitoring" subtitle="0 Stores" breadcrumbs={['MarketOS', 'Monitoring']} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Globe size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>No stores yet</div>
              <div className="text-[16px] mt-1" style={{ color: 'var(--text-muted)' }}>Add a store in Settings to start monitoring it.</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          title="Site Monitoring"
          subtitle={`${stores.length} Store${stores.length !== 1 ? 's' : ''}`}
          breadcrumbs={['MarketOS', 'Monitoring']}
        />

        <main className="flex-1 overflow-y-auto p-5">

          <div className="mb-4"><StoreScopeBar sectionKey="monitoring" /></div>

          {/* Active alerts */}
          <AlertBanner alerts={bannerAlerts} />

          {/* Cross-store summary bar */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {[
              { label: 'Total Revenue Today', value: formatCurrency(totalRevenue), color: '#10d98a', mono: true },
              { label: 'Total Orders',         value: totalOrders.toString(),       color: 'var(--cyan)', mono: true },
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
            {stores.map(s => (
              <StoreStatusCard
                key={s.id}
                store={s}
                traffic={allTraffic[s.id] ?? DEFAULT_TRAFFIC}
                conversions={allConversions[s.id] ?? DEFAULT_CONVERSIONS}
                isSelected={s.id === activeStoreId}
                onSelect={() => setSelectedStoreId(s.id)}
              />
            ))}
          </div>

          {/* Selected store label */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: store.color }} />
            <h2 className="text-base font-semibold" style={{ color: store.color }}>
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
              <PageChangeLog changes={allPageChanges.filter(pc => selectedStoreIds.includes(pc.storeId))} />
            </div>
            <SeoSnapshot snapshot={seoSnapshot} />
          </div>

          {/* Row 4: Geographic Distribution + Shopify Flow Tracking */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <GeoDistribution storeId={activeStoreId} storeColor={store.color} />
            <ShopifyFlowTracker storeId={activeStoreId} />
          </div>

          {/* Row 5: Price Change Monitor + Sitemap New Products */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <PriceChangeMonitor storeId={activeStoreId} storeColor={store.color} />
            <SitemapMonitor storeId={activeStoreId} storeColor={store.color} />
          </div>

          {/* Row 6: Page Load Speed + Customer Journey */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <LoadSpeedMonitor storeId={activeStoreId} storeColor={store.color} />
            <CustomerJourneyTracker selectedStoreIds={selectedStoreIds} />
          </div>

        </main>
      </div>
    </div>
  );
}
