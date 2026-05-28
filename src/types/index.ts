// ─── Store / Uptime ─────────────────────────────────────────────────────────

export type StoreStatus = 'online' | 'degraded' | 'down';

export interface Store {
  id: string;
  name: string;
  domain: string;
  url: string;
  color: string;          // accent hex for this store
  status: StoreStatus;
  responseTime: number;   // ms
  uptime7d: number;       // percentage 0-100
  sslDaysLeft: number;
  loadSpeed: number;      // ms (Largest Contentful Paint proxy)
  lastChecked: string;    // ISO string
}

// ─── Traffic ─────────────────────────────────────────────────────────────────

export interface TrafficDay {
  date: string;           // 'Mon', 'Tue', etc.
  sessions: number;
  pageviews: number;
  users: number;
}

export interface TrafficSource {
  source: string;
  value: number;          // percentage
  color: string;
}

export interface TrafficMetrics {
  storeId: string;
  currentSessions: number;
  sessionsToday: number;
  sessionsDelta: number;    // % change vs yesterday
  bounceRate: number;
  avgSessionDuration: number; // seconds
  mobilePercent: number;
  desktopPercent: number;
  daily: TrafficDay[];
  sources: TrafficSource[];
}

// ─── Conversion Funnel ───────────────────────────────────────────────────────

export interface FunnelStep {
  label: string;
  count: number;
  conversionRate: number; // from previous step
}

export interface ConversionMetrics {
  storeId: string;
  funnel: FunnelStep[];
  overallRate: number;    // visitors → purchase
  avgOrderValue: number;
  revenueToday: number;
  ordersToday: number;
}

// ─── Abandoned Carts ─────────────────────────────────────────────────────────

export interface CartItem {
  name: string;
  qty: number;
  price: number;
}

export interface AbandonedCart {
  id: string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  location: string;
  cartValue: number;
  items: CartItem[];
  minutesAgo: number;
  recoveryEmailSent: boolean;
  smsSent: boolean;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  storeId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  itemCount: number;
  channel: string;        // 'organic' | 'paid-google' | 'email' | 'social' | 'direct'
  minutesAgo: number;
}

// ─── Page Change Log ─────────────────────────────────────────────────────────

export type ChangeType = 'content' | 'price' | 'seo' | 'product-added' | 'product-removed' | 'out-of-stock';

export interface PageChange {
  id: string;
  storeId: string;
  url: string;
  pageTitle: string;
  changeType: ChangeType;
  description: string;
  detectedAt: string;     // ISO string
  severity: 'info' | 'warning' | 'critical';
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  storeId: string | null;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

// ─── SEO Snapshot ────────────────────────────────────────────────────────────

export interface SeoMetric {
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'error';
}

export interface SeoSnapshot {
  storeId: string;
  metrics: SeoMetric[];
}
