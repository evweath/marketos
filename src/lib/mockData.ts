import type {
  Store, StoreStatus, TrafficMetrics, ConversionMetrics,
  AbandonedCart, Transaction, PageChange, SeoSnapshot
} from '@/types';
import { usePersistentState } from './usePersistentState';
import { useStores } from './storeScope';

// ─── Store health (monitoring) ─────────────────────────────────────────────
//
// Store *identity* (id/name/domain/color) lives in storeScope.ts, shared with
// Settings and every store-scoped page. Store *health* (uptime, response
// time, SSL, load speed) is monitoring-specific and starts unknown for every
// store until a health check actually runs — merged together for consumers
// via useMonitoringStores() below.

export interface StoreHealth {
  status: StoreStatus;
  responseTime: number;   // ms
  uptime7d: number;       // percentage 0-100
  sslDaysLeft: number;
  loadSpeed: number;      // ms
  lastChecked: string | null;
}

export const DEFAULT_STORE_HEALTH: StoreHealth = {
  status: 'pending', responseTime: 0, uptime7d: 0, sslDaysLeft: 0, loadSpeed: 0, lastChecked: null,
};

export const SAMPLE_STORE_HEALTH: Record<string, StoreHealth> = {
  'donut-equipment': {
    status: 'online', responseTime: 312, uptime7d: 99.94, sslDaysLeft: 87, loadSpeed: 1840,
    lastChecked: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  'donut-supplies': {
    status: 'degraded', responseTime: 1247, uptime7d: 98.71, sslDaysLeft: 14, loadSpeed: 3210,
    lastChecked: new Date(Date.now() - 1 * 60000).toISOString(),
  },
  'bakery-wholesalers': {
    status: 'online', responseTime: 284, uptime7d: 100, sslDaysLeft: 234, loadSpeed: 1560,
    lastChecked: new Date(Date.now() - 3 * 60000).toISOString(),
  },
};

// ─── Core Web Vitals (per store) ─────────────────────────────────────────────
// LCP (s), CLS (unitless), INP (ms) — current field value + a 7-day history
// for the sparkline. Empty by default; seeded by Load Sample Data.

export interface WebVitalMetric { current: number; history: number[] }
export interface StoreWebVitals { lcp: WebVitalMetric; cls: WebVitalMetric; inp: WebVitalMetric }

export const SAMPLE_WEB_VITALS: Record<string, StoreWebVitals> = {
  'donut-equipment': {
    lcp: { current: 2.3, history: [2.8, 2.7, 2.6, 2.5, 2.4, 2.4, 2.3] },
    cls: { current: 0.06, history: [0.09, 0.08, 0.08, 0.07, 0.07, 0.06, 0.06] },
    inp: { current: 168, history: [210, 205, 190, 185, 178, 172, 168] },
  },
  'donut-supplies': {
    lcp: { current: 4.6, history: [3.9, 4.0, 4.2, 4.3, 4.4, 4.5, 4.6] },
    cls: { current: 0.19, history: [0.12, 0.13, 0.15, 0.16, 0.17, 0.18, 0.19] },
    inp: { current: 340, history: [260, 275, 290, 305, 320, 330, 340] },
  },
  'bakery-wholesalers': {
    lcp: { current: 1.9, history: [2.1, 2.0, 2.0, 1.9, 1.9, 1.9, 1.9] },
    cls: { current: 0.04, history: [0.05, 0.05, 0.04, 0.04, 0.04, 0.04, 0.04] },
    inp: { current: 142, history: [160, 158, 152, 150, 147, 145, 142] },
  },
};

/** Live store list (identity + connections) merged with persisted health data — the single source Monitoring/Alerts read store info from. */
export function useMonitoringStores(): Store[] {
  const [stores] = useStores();
  const [health] = usePersistentState<Record<string, StoreHealth>>('monitoring.storeHealth', {});
  return stores.map(s => ({
    id: s.id,
    name: s.name,
    domain: s.domain,
    url: `https://${s.domain}`,
    color: s.color,
    ...(health[s.id] ?? DEFAULT_STORE_HEALTH),
  }));
}

// ─── Traffic ─────────────────────────────────────────────────────────────────
//
// SAMPLE_* below seeds Settings → Data → "Load Sample Data"; the app's live
// state (read via usePersistentState('monitoring.traffic', {})) starts empty.

export const DEFAULT_TRAFFIC: TrafficMetrics = {
  storeId: '', currentSessions: 0, sessionsToday: 0, sessionsDelta: 0, bounceRate: 0,
  avgSessionDuration: 0, mobilePercent: 0, desktopPercent: 0, daily: [], sources: [],
};

export const SAMPLE_TRAFFIC: Record<string, TrafficMetrics> = {
  'donut-equipment': {
    storeId: 'donut-equipment',
    currentSessions: 47,
    sessionsToday: 1284,
    sessionsDelta: +12.4,
    bounceRate: 38.2,
    avgSessionDuration: 187,
    mobilePercent: 41,
    desktopPercent: 59,
    daily: [
      { date: 'Mon', sessions: 1020, pageviews: 3140, users: 891 },
      { date: 'Tue', sessions: 1180, pageviews: 3620, users: 1041 },
      { date: 'Wed', sessions: 1390, pageviews: 4280, users: 1232 },
      { date: 'Thu', sessions: 1140, pageviews: 3510, users: 1007 },
      { date: 'Fri', sessions: 1560, pageviews: 4890, users: 1408 },
      { date: 'Sat', sessions: 870,  pageviews: 2680, users: 762 },
      { date: 'Sun', sessions: 1284, pageviews: 3940, users: 1127 },
    ],
    sources: [
      { source: 'Organic', value: 32, color: '#10d98a' },
      { source: 'Paid Google', value: 26, color: '#00d9ff' },
      { source: 'Direct', value: 16, color: '#7b93ff' },
      { source: 'Email', value: 12, color: '#ffb347' },
      { source: 'Social', value: 8,  color: '#ff4444' },
      { source: 'Referral', value: 6, color: '#e1306c' },
    ],
  },
  'donut-supplies': {
    storeId: 'donut-supplies',
    currentSessions: 31,
    sessionsToday: 892,
    sessionsDelta: -4.7,
    bounceRate: 44.8,
    avgSessionDuration: 143,
    mobilePercent: 58,
    desktopPercent: 42,
    daily: [
      { date: 'Mon', sessions: 810,  pageviews: 2490, users: 700 },
      { date: 'Tue', sessions: 930,  pageviews: 2870, users: 812 },
      { date: 'Wed', sessions: 1040, pageviews: 3200, users: 914 },
      { date: 'Thu', sessions: 870,  pageviews: 2680, users: 761 },
      { date: 'Fri', sessions: 1210, pageviews: 3720, users: 1072 },
      { date: 'Sat', sessions: 650,  pageviews: 2000, users: 573 },
      { date: 'Sun', sessions: 892,  pageviews: 2740, users: 783 },
    ],
    sources: [
      { source: 'Organic', value: 28, color: '#10d98a' },
      { source: 'Paid Google', value: 29, color: '#00d9ff' },
      { source: 'Direct', value: 15, color: '#7b93ff' },
      { source: 'Email', value: 13, color: '#ffb347' },
      { source: 'Social', value: 9, color: '#ff4444' },
      { source: 'Referral', value: 6, color: '#e1306c' },
    ],
  },
  'bakery-wholesalers': {
    storeId: 'bakery-wholesalers',
    currentSessions: 68,
    sessionsToday: 2107,
    sessionsDelta: +8.1,
    bounceRate: 31.5,
    avgSessionDuration: 224,
    mobilePercent: 35,
    desktopPercent: 65,
    daily: [
      { date: 'Mon', sessions: 1840, pageviews: 5620, users: 1612 },
      { date: 'Tue', sessions: 2100, pageviews: 6430, users: 1845 },
      { date: 'Wed', sessions: 2380, pageviews: 7270, users: 2092 },
      { date: 'Thu', sessions: 1990, pageviews: 6080, users: 1751 },
      { date: 'Fri', sessions: 2640, pageviews: 8070, users: 2320 },
      { date: 'Sat', sessions: 1450, pageviews: 4430, users: 1278 },
      { date: 'Sun', sessions: 2107, pageviews: 6440, users: 1853 },
    ],
    sources: [
      { source: 'Organic', value: 40, color: '#10d98a' },
      { source: 'Direct', value: 22, color: '#7b93ff' },
      { source: 'Paid Google', value: 18, color: '#00d9ff' },
      { source: 'Email', value: 9, color: '#ffb347' },
      { source: 'Social', value: 5,  color: '#ff4444' },
      { source: 'Referral', value: 6, color: '#e1306c' },
    ],
  },
};

// ─── Conversion Funnels ──────────────────────────────────────────────────────

export const DEFAULT_CONVERSIONS: ConversionMetrics = {
  storeId: '', funnel: [], overallRate: 0, avgOrderValue: 0, revenueToday: 0, ordersToday: 0,
};

export const SAMPLE_CONVERSIONS: Record<string, ConversionMetrics> = {
  'donut-equipment': {
    storeId: 'donut-equipment',
    funnel: [
      { label: 'Visitors',    count: 1284, conversionRate: 100 },
      { label: 'Product View',count: 847,  conversionRate: 66.0 },
      { label: 'Add to Cart', count: 312,  conversionRate: 36.8 },
      { label: 'Checkout',    count: 198,  conversionRate: 63.5 },
      { label: 'Purchase',    count: 157,  conversionRate: 79.3 },
    ],
    overallRate: 12.2,
    avgOrderValue: 847.50,
    revenueToday: 133057.50,
    ordersToday: 157,
  },
  'donut-supplies': {
    storeId: 'donut-supplies',
    funnel: [
      { label: 'Visitors',    count: 892,  conversionRate: 100 },
      { label: 'Product View',count: 561,  conversionRate: 62.9 },
      { label: 'Add to Cart', count: 198,  conversionRate: 35.3 },
      { label: 'Checkout',    count: 117,  conversionRate: 59.1 },
      { label: 'Purchase',    count: 88,   conversionRate: 75.2 },
    ],
    overallRate: 9.9,
    avgOrderValue: 214.30,
    revenueToday: 18858.40,
    ordersToday: 88,
  },
  'bakery-wholesalers': {
    storeId: 'bakery-wholesalers',
    funnel: [
      { label: 'Visitors',    count: 2107, conversionRate: 100 },
      { label: 'Product View',count: 1524, conversionRate: 72.3 },
      { label: 'Add to Cart', count: 612,  conversionRate: 40.2 },
      { label: 'Checkout',    count: 421,  conversionRate: 68.8 },
      { label: 'Purchase',    count: 368,  conversionRate: 87.4 },
    ],
    overallRate: 17.5,
    avgOrderValue: 1284.00,
    revenueToday: 472512.00,
    ordersToday: 368,
  },
};

// ─── Abandoned Carts ─────────────────────────────────────────────────────────

export const SAMPLE_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: 'ac-001',
    storeId: 'donut-equipment',
    customerName: 'Marcus Webb',
    customerEmail: 'marcus@sweetspot.biz',
    location: 'Chicago, IL',
    cartValue: 2340.00,
    items: [
      { name: 'Commercial Donut Fryer 24L', qty: 1, price: 1890 },
      { name: 'Donut Glaze Station Pro', qty: 1, price: 450 },
    ],
    minutesAgo: 4,
    recoveryEmailSent: false,
    smsSent: false,
  },
  {
    id: 'ac-002',
    storeId: 'donut-equipment',
    customerName: 'Sandra Okafor',
    customerEmail: 's.okafor@cakehouse.com',
    location: 'Houston, TX',
    cartValue: 5640.00,
    items: [
      { name: 'Industrial Ring Donut Machine', qty: 2, price: 2820 },
    ],
    minutesAgo: 17,
    recoveryEmailSent: true,
    smsSent: false,
  },
  {
    id: 'ac-003',
    storeId: 'donut-supplies',
    customerName: 'Todd Fairbanks',
    customerEmail: 'todd@fairbakery.net',
    location: 'Atlanta, GA',
    cartValue: 847.20,
    items: [
      { name: 'Glazing Mix 25lb Bag', qty: 4, price: 148.80 },
      { name: 'Donut Mix Premium Blend', qty: 3, price: 252.00 },
      { name: 'Sprinkles Assorted 10lb', qty: 2, price: 89.60 },
    ],
    minutesAgo: 28,
    recoveryEmailSent: true,
    smsSent: true,
  },
  {
    id: 'ac-004',
    storeId: 'bakery-wholesalers',
    customerName: 'Patricia Lund',
    customerEmail: 'procurement@lundfoods.com',
    location: 'Minneapolis, MN',
    cartValue: 12480.00,
    items: [
      { name: 'AP Flour 50lb (Pallet)', qty: 4, price: 1240 },
      { name: 'Sugar Granulated 100lb', qty: 6, price: 1080 },
      { name: 'Vegetable Shortening 50lb', qty: 8, price: 1890 },
    ],
    minutesAgo: 9,
    recoveryEmailSent: false,
    smsSent: false,
  },
  {
    id: 'ac-005',
    storeId: 'bakery-wholesalers',
    customerName: 'Jason Morales',
    customerEmail: 'jason.m@artisanbakehouse.com',
    location: 'Denver, CO',
    cartValue: 3420.00,
    items: [
      { name: 'Almond Flour 25lb', qty: 6, price: 420 },
      { name: 'Cake Mix Commercial 50lb', qty: 4, price: 370.50 },
    ],
    minutesAgo: 43,
    recoveryEmailSent: true,
    smsSent: false,
  },
];

// ─── Recent Transactions ─────────────────────────────────────────────────────

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: 't-001', storeId: 'donut-equipment',  orderNumber: '#DE-8821', customerName: 'Riverside Donuts LLC',      amount: 4720.00, itemCount: 2, channel: 'paid-google', minutesAgo: 3  },
  { id: 't-002', storeId: 'bakery-wholesalers', orderNumber: '#BW-3347', customerName: 'Golden Grain Bakeries',   amount: 8940.00, itemCount: 7, channel: 'email',       minutesAgo: 7  },
  { id: 't-003', storeId: 'donut-supplies',   orderNumber: '#DS-2209', customerName: 'Sweet Rings Co.',           amount: 612.40,  itemCount: 5, channel: 'organic',     minutesAgo: 12 },
  { id: 't-004', storeId: 'bakery-wholesalers', orderNumber: '#BW-3346', customerName: 'Metro Bread Corp',        amount: 22400.00,itemCount: 12,channel: 'direct',      minutesAgo: 19 },
  { id: 't-005', storeId: 'donut-equipment',  orderNumber: '#DE-8820', customerName: 'Dunkin Alternatives',       amount: 1890.00, itemCount: 1, channel: 'organic',     minutesAgo: 24 },
  { id: 't-006', storeId: 'donut-supplies',   orderNumber: '#DS-2208', customerName: 'Hole Foods Donut Bar',      amount: 2148.60, itemCount: 8, channel: 'email',       minutesAgo: 31 },
  { id: 't-007', storeId: 'bakery-wholesalers', orderNumber: '#BW-3345', customerName: 'Sunrise Pastry House',   amount: 5670.00, itemCount: 4, channel: 'paid-google', minutesAgo: 38 },
  { id: 't-008', storeId: 'donut-equipment',  orderNumber: '#DE-8819', customerName: 'Paul\'s Fried Rings',       amount: 7340.00, itemCount: 3, channel: 'direct',      minutesAgo: 45 },
];

// ─── Page Change Log ─────────────────────────────────────────────────────────

export const SAMPLE_PAGE_CHANGES: PageChange[] = [
  {
    id: 'pc-001',
    storeId: 'donut-supplies',
    url: '/products/glazing-mix-25lb',
    pageTitle: 'Glazing Mix 25lb Bag',
    changeType: 'price',
    description: 'Price changed +6.3%',
    detectedAt: new Date(Date.now() - 14 * 60000).toISOString(),
    severity: 'warning',
    oldValue: '$34.99',
    newValue: '$37.20',
  },
  {
    id: 'pc-002',
    storeId: 'donut-equipment',
    url: '/collections/fryers',
    pageTitle: 'Commercial Fryers Collection',
    changeType: 'product-added',
    description: 'New product added: "AutoFryer XL 40L — Commercial Grade"',
    detectedAt: new Date(Date.now() - 37 * 60000).toISOString(),
    severity: 'info',
  },
  {
    id: 'pc-003',
    storeId: 'donut-supplies',
    url: '/products/cake-donut-mix-bulk',
    pageTitle: 'Cake Donut Mix (Bulk 50lb)',
    changeType: 'out-of-stock',
    description: 'Product marked out of stock. Was in stock 2 hours ago.',
    detectedAt: new Date(Date.now() - 112 * 60000).toISOString(),
    severity: 'critical',
  },
  {
    id: 'pc-004',
    storeId: 'bakery-wholesalers',
    url: '/',
    pageTitle: 'Homepage',
    changeType: 'content',
    description: 'Hero banner updated: new summer promotion creative detected',
    detectedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    severity: 'info',
  },
  {
    id: 'pc-005',
    storeId: 'donut-equipment',
    url: '/pages/shipping-policy',
    pageTitle: 'Shipping Policy',
    changeType: 'seo',
    description: 'Meta description changed. Title tag modified.',
    detectedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    severity: 'info',
  },
  {
    id: 'pc-006',
    storeId: 'bakery-wholesalers',
    url: '/products/ap-flour-50lb',
    pageTitle: 'AP Flour 50lb Bag',
    changeType: 'price',
    description: 'Price changed from $28.40 → $31.10 (+9.5%)',
    detectedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    severity: 'warning',
  },
];

// ─── SEO Snapshots ────────────────────────────────────────────────────────────

export const DEFAULT_SEO_SNAPSHOT = (storeId: string): SeoSnapshot => ({ storeId, metrics: [] });

export const SAMPLE_SEO_SNAPSHOTS: Record<string, SeoSnapshot> = {
  'donut-equipment': {
    storeId: 'donut-equipment',
    metrics: [
      { label: 'Homepage Title',      value: '72 chars — OK',    status: 'ok' },
      { label: 'Meta Description',    value: '154 chars — OK',   status: 'ok' },
      { label: 'H1 Tag',              value: 'Present',          status: 'ok' },
      { label: 'Canonical Tag',       value: 'Set correctly',    status: 'ok' },
      { label: 'Structured Data',     value: 'Product schema OK', status: 'ok' },
      { label: 'Robots.txt',          value: 'No issues',        status: 'ok' },
    ],
  },
  'donut-supplies': {
    storeId: 'donut-supplies',
    metrics: [
      { label: 'Homepage Title',      value: '31 chars — Too short', status: 'warning', affectedUrls: 1 },
      { label: 'Meta Description',    value: '88 chars — Too short',  status: 'warning', affectedUrls: 12 },
      { label: 'H1 Tag',              value: 'Present',              status: 'ok' },
      { label: 'Canonical Tag',       value: 'Set correctly',        status: 'ok' },
      { label: 'Structured Data',     value: 'Missing on 3 products', status: 'error', affectedUrls: 3 },
      { label: 'Robots.txt',          value: 'No issues',            status: 'ok' },
    ],
  },
  'bakery-wholesalers': {
    storeId: 'bakery-wholesalers',
    metrics: [
      { label: 'Homepage Title',      value: '61 chars — OK',    status: 'ok' },
      { label: 'Meta Description',    value: '147 chars — OK',   status: 'ok' },
      { label: 'H1 Tag',              value: 'Present',          status: 'ok' },
      { label: 'Canonical Tag',       value: 'Set correctly',    status: 'ok' },
      { label: 'Structured Data',     value: 'Complete',         status: 'ok' },
      { label: 'Robots.txt',          value: 'No issues',        status: 'ok' },
    ],
  },
};

// ─── Customer journey paths (per store) ──────────────────────────────────────
// Named top conversion paths with sessions, conversion rate, avg time, and a
// vs-prior-period session delta for the trend arrow.

export interface JourneyPath {
  id: string;
  store: string;
  name: string;
  steps: string[];
  sessions: number;
  convRate: number;
  avgTime: string;
  sessionsDelta: number;   // % vs prior period → trend arrow
}

export const SAMPLE_JOURNEYS: JourneyPath[] = [
  { id: 'jp-001', store: 'donut-equipment', name: 'Paid → Product → Buy', steps: ['Google Ad', 'Product Page', 'Cart', 'Checkout'], sessions: 1842, convRate: 4.8, avgTime: '6m 12s', sessionsDelta: +11.4 },
  { id: 'jp-002', store: 'donut-equipment', name: 'Organic Research', steps: ['Organic Search', 'Blog', 'Product Page', 'Cart', 'Checkout'], sessions: 1204, convRate: 3.1, avgTime: '9m 47s', sessionsDelta: +6.2 },
  { id: 'jp-003', store: 'donut-equipment', name: 'Email Re-engage', steps: ['Email', 'Product Page', 'Checkout'], sessions: 684, convRate: 7.9, avgTime: '3m 05s', sessionsDelta: -2.8 },
  { id: 'jp-004', store: 'donut-supplies', name: 'Direct Reorder', steps: ['Direct', 'Account', 'Reorder', 'Checkout'], sessions: 928, convRate: 12.4, avgTime: '2m 18s', sessionsDelta: +4.1 },
  { id: 'jp-005', store: 'donut-supplies', name: 'Social Discovery', steps: ['Social', 'Product Page', 'Cart'], sessions: 512, convRate: 1.9, avgTime: '4m 33s', sessionsDelta: -5.6 },
  { id: 'jp-006', store: 'bakery-wholesalers', name: 'RFQ → Sales', steps: ['Organic Search', 'Wholesale', 'Request Quote', 'Sales Follow-up'], sessions: 1360, convRate: 8.7, avgTime: '11m 02s', sessionsDelta: +9.3 },
];

// ─── Sitemap diff (per store): added + removed URLs ──────────────────────────

export interface SitemapEntry { id: string; name: string; url: string; detectedAt: string; category: string; price?: number }
export interface SitemapDiff { added: SitemapEntry[]; removed: SitemapEntry[] }

export const SAMPLE_SITEMAP_CHANGES: Record<string, SitemapDiff> = {
  'donut-equipment': {
    added: [
      { id: 'sp-a1', name: 'AutoFryer XL 40L', url: '/products/autofryer-xl-40l', detectedAt: '12m ago', category: 'Fryers', price: 6899 },
      { id: 'sp-a2', name: 'Donut Finisher AF-12', url: '/products/af-12-finisher', detectedAt: '3h ago', category: 'Automation', price: 4299 },
    ],
    removed: [
      { id: 'sp-r1', name: 'Legacy Fryer DF-200 (discontinued)', url: '/products/df-200-fryer', detectedAt: '3h ago', category: 'Fryers' },
    ],
  },
  'donut-supplies': {
    added: [
      { id: 'sp-a3', name: 'Organic Donut Mix 50lb', url: '/products/organic-donut-mix-50lb', detectedAt: '1h ago', category: 'Mixes', price: 78 },
    ],
    removed: [
      { id: 'sp-r2', name: 'Seasonal Pumpkin Glaze (out of season)', url: '/products/pumpkin-glaze', detectedAt: '1d ago', category: 'Glazes' },
      { id: 'sp-r3', name: 'Sample Pack 5lb (retired SKU)', url: '/products/sample-pack-5lb', detectedAt: '2d ago', category: 'Mixes' },
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatMinutesAgo(minutes: number): string {
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function getStoreById(stores: Store[], id: string): Store | undefined {
  return stores.find(s => s.id === id);
}
