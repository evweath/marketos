// ─── Cart Recovery — Types & Sample Data ──────────────────────────────────────
//
// SAMPLE_* constants below seed Settings → Data → "Load Sample Data"; the app
// boots empty. Records that carry a `store` field use the same domain-string
// format as the rest of the app ('donut-equipment.com', or 'All Stores' for
// genuinely cross-store records) — resolved to a canonical store id via
// resolveStoreId() at render time.

export interface SequenceStep {
  channel: 'email' | 'sms';
  delay: string;
  subject: string;
  openRate: number;
  clickRate: number;
  convRate: number;
}

export interface RecoverySequence {
  id: string;
  name: string;
  store: string;
  steps: SequenceStep[];
  recovered30d: number;
  revenue30d: number;
}

export const SAMPLE_SEQUENCES: RecoverySequence[] = [
  {
    id: 'seq-001', name: '3-Step Email + SMS Recovery', store: 'All Stores',
    steps: [
      { channel: 'email', delay: '1h',  subject: 'You left something behind 🛒',       openRate: 48.2, clickRate: 22.4, convRate: 6.8 },
      { channel: 'sms',   delay: '3h',  subject: 'Cart reminder + 5% off code',        openRate: 94.1, clickRate: 38.2, convRate: 4.2 },
      { channel: 'email', delay: '24h', subject: 'Last chance — your cart expires soon', openRate: 31.4, clickRate: 14.8, convRate: 3.1 },
    ],
    recovered30d: 62, revenue30d: 31840,
  },
  {
    id: 'seq-002', name: 'High-Value ($2K+) Priority Recovery', store: 'donut-equipment.com',
    steps: [
      { channel: 'email', delay: '30m', subject: 'Your equipment order is waiting',       openRate: 61.4, clickRate: 31.2, convRate: 14.2 },
      { channel: 'sms',   delay: '2h',  subject: 'Personal note from our team',          openRate: 97.2, clickRate: 48.4, convRate: 9.8  },
      { channel: 'email', delay: '6h',  subject: 'Financing options for your order',     openRate: 44.8, clickRate: 22.1, convRate: 7.4  },
    ],
    recovered30d: 18, revenue30d: 32480,
  },
  {
    id: 'seq-003', name: 'Browse Abandonment — Email Only', store: 'All Stores',
    steps: [
      { channel: 'email', delay: '4h',  subject: 'Still thinking about it?',            openRate: 32.1, clickRate: 11.4, convRate: 2.4 },
      { channel: 'email', delay: '48h', subject: "Here's what other bakers chose",      openRate: 24.8, clickRate: 8.2,  convRate: 1.8 },
    ],
    recovered30d: 14, revenue30d: 4100,
  },
];

export interface RecoveredCart {
  id: string;
  customer: string;
  store: string;
  value: number;
  channel: 'Email' | 'SMS' | 'Push';
  minutesAgo: number;
}

export const SAMPLE_RECOVERED_LIST: RecoveredCart[] = [
  { id: 'r-001', customer: 'Riverside Donuts LLC',   store: 'donut-equipment.com',   value: 2340, channel: 'SMS',   minutesAgo: 84  },
  { id: 'r-002', customer: 'Sunrise Pastry Co',      store: 'donut-supplies.com',    value: 847,  channel: 'Email', minutesAgo: 142 },
  { id: 'r-003', customer: 'Golden Grain Bakeries',  store: 'bakery-wholesalers.com', value: 5640, channel: 'SMS',   minutesAgo: 214 },
  { id: 'r-004', customer: 'Metro Bread Corp',       store: 'bakery-wholesalers.com', value: 1240, channel: 'Email', minutesAgo: 284 },
  { id: 'r-005', customer: 'Dunkin Alternatives',    store: 'donut-equipment.com',   value: 3420, channel: 'SMS',   minutesAgo: 412 },
  { id: 'r-006', customer: 'Hole Foods Donut Bar',   store: 'donut-supplies.com',    value: 612,  channel: 'Push',  minutesAgo: 540 },
];

export type UpsellStatus = 'active' | 'paused';
export type UpsellType   = 'upsell' | 'cross-sell' | 'bundle';

export interface UpsellOffer {
  id: string;
  name: string;
  type: UpsellType;
  trigger: string;
  offerProduct: string;
  originalPrice: number;
  offerPrice: number;
  discount: string;
  acceptRate: number;
  revenue30d: number;
  status: UpsellStatus;
}

// Upsell offers are catalog-level (triggered by a purchased product/category,
// not a single store) — no store field by design, same exception class as
// campaignData.ts's AutomationRule.
export const SAMPLE_UPSELL_OFFERS: UpsellOffer[] = [
  { id: 'u-001', name: 'Donut Fryer Oil Bundle',          type: 'cross-sell', trigger: 'After purchase of Donut Fryer',               offerProduct: 'Commercial Frying Oil 5L x3',    originalPrice: 89,   offerPrice: 72,   discount: '19% off', acceptRate: 18.4, revenue30d: 8420,  status: 'active' },
  { id: 'u-002', name: 'Upgrade to Pro Package',          type: 'upsell',     trigger: 'After purchase of Standard Donut Equipment',  offerProduct: 'Pro Equipment Package',          originalPrice: 2400, offerPrice: 1980, discount: '17% off', acceptRate: 8.2,  revenue30d: 14200, status: 'active' },
  { id: 'u-003', name: 'Starter Supply Bundle',           type: 'bundle',     trigger: 'First purchase from any store',               offerProduct: 'Essential Baking Supplies Bundle', originalPrice: 180, offerPrice: 139,  discount: '23% off', acceptRate: 22.1, revenue30d: 6840,  status: 'active' },
  { id: 'u-004', name: 'Extended Warranty',               type: 'cross-sell', trigger: 'After purchase of any equipment',             offerProduct: 'Extended 3-Year Warranty',       originalPrice: 299,  offerPrice: 249,  discount: '17% off', acceptRate: 6.8,  revenue30d: 4200,  status: 'paused' },
];

export function computeUpsellStats(offers: UpsellOffer[]) {
  const revenue30d = offers.reduce((s, o) => s + o.revenue30d, 0);
  return {
    upsellRevenue30d: revenue30d,
    acceptanceRate: offers.length > 0 ? Math.round((offers.reduce((s, o) => s + o.acceptRate, 0) / offers.length) * 10) / 10 : 0,
    avgUpsellValue: offers.length > 0 ? Math.round(offers.reduce((s, o) => s + o.offerPrice, 0) / offers.length) : 0,
    // No send-count model exists yet — stays zero until offers are actually shown to customers.
    totalOffers: 0,
  };
}

export type StockStatus = 'out_of_stock' | 'low_stock' | 'in_stock';

export interface WatchProduct {
  id: string;
  name: string;
  store: string;
  sku: string;
  currentPrice: number;
  targetPrice?: number;
  originalPrice?: number;
  stockStatus: StockStatus;
  watcherCount: number;
  notificationsSent: number;
  lastUpdated: string;
}

export const SAMPLE_WATCH_PRODUCTS: WatchProduct[] = [
  { id: 'wp-1', name: 'Pro Series Donut Fryer 24"',      store: 'donut-equipment.com',    sku: 'DF-PRO-24',  currentPrice: 2499, targetPrice: 2200,            stockStatus: 'out_of_stock', watcherCount: 47, notificationsSent: 0,  lastUpdated: '2026-05-10' },
  { id: 'wp-2', name: 'Commercial Donut Fryer — 18"',    store: 'donut-equipment.com',    sku: 'DF-COM-18',  currentPrice: 1649, targetPrice: 1500,            stockStatus: 'low_stock',    watcherCount: 31, notificationsSent: 0,  lastUpdated: '2026-05-12' },
  { id: 'wp-3', name: 'Bulk Glaze Mix — Chocolate 50lb', store: 'donut-supplies.com',     sku: 'GM-CHOC-50', currentPrice: 124,  targetPrice: 99,              stockStatus: 'out_of_stock', watcherCount: 83, notificationsSent: 0,  lastUpdated: '2026-05-11' },
  { id: 'wp-4', name: 'Yeast Donut Mix — 50lb Case',     store: 'donut-supplies.com',     sku: 'DM-YEAST-50',currentPrice: 189,  originalPrice: 220,           stockStatus: 'in_stock',     watcherCount: 22, notificationsSent: 22, lastUpdated: '2026-05-12' },
  { id: 'wp-5', name: 'Bakery Proofing Cabinet — 4-Tray', store: 'bakery-wholesalers.com', sku: 'PC-4T',     currentPrice: 899,  targetPrice: 750, originalPrice: 1099, stockStatus: 'in_stock', watcherCount: 15, notificationsSent: 15, lastUpdated: '2026-05-09' },
  { id: 'wp-6', name: 'Cake Decorating Kit — Pro',       store: 'bakery-wholesalers.com', sku: 'CK-DEC-PRO', currentPrice: 349,  targetPrice: 299,            stockStatus: 'out_of_stock', watcherCount: 29, notificationsSent: 0,  lastUpdated: '2026-05-08' },
];

export type ChurnRisk = 'high' | 'medium' | 'low';

export interface CustomerInsight {
  id: string;
  name: string;
  email: string;
  store: string;
  clv: number;
  totalOrders: number;
  lastOrderDays: number;
  avgOrderValue: number;
  churnRisk: ChurnRisk;
  repeatRate: number;
  predictedNextOrder?: number;
}

export const SAMPLE_CUSTOMERS: CustomerInsight[] = [
  { id: 'ci-1', name: 'Oak Street Bakery',    email: 'orders@oakstreet.com',    store: 'donut-equipment.com',    clv: 28400, totalOrders: 14, lastOrderDays: 8,  avgOrderValue: 2028, churnRisk: 'low',    repeatRate: 91, predictedNextOrder: 22 },
  { id: 'ci-2', name: 'Metro Donuts LLC',      email: 'metro@metrodo.com',       store: 'donut-equipment.com',    clv: 19200, totalOrders: 9,  lastOrderDays: 34, avgOrderValue: 2133, churnRisk: 'medium', repeatRate: 72, predictedNextOrder: 14 },
  { id: 'ci-3', name: 'Sweet Rings Co.',       email: 'buy@sweetrings.co',       store: 'donut-supplies.com',     clv: 6840,  totalOrders: 38, lastOrderDays: 12, avgOrderValue: 180,  churnRisk: 'low',    repeatRate: 88, predictedNextOrder: 18 },
  { id: 'ci-4', name: 'Baker Bros Wholesale',  email: 'orders@bakerbros.net',    store: 'bakery-wholesalers.com', clv: 14200, totalOrders: 21, lastOrderDays: 62, avgOrderValue: 676,  churnRisk: 'high',   repeatRate: 45, predictedNextOrder: undefined },
  { id: 'ci-5', name: 'Sunrise Bakehouse',     email: 'hello@sunrisebh.com',     store: 'donut-supplies.com',     clv: 4100,  totalOrders: 8,  lastOrderDays: 91, avgOrderValue: 512,  churnRisk: 'high',   repeatRate: 28, predictedNextOrder: undefined },
  { id: 'ci-6', name: 'Artisan Donut Works',   email: 'ops@artisandonut.com',    store: 'donut-equipment.com',    clv: 11800, totalOrders: 6,  lastOrderDays: 19, avgOrderValue: 1966, churnRisk: 'low',    repeatRate: 83, predictedNextOrder: 41 },
  { id: 'ci-7', name: 'Golden Ring Suppliers', email: 'sales@goldenring.com',    store: 'bakery-wholesalers.com', clv: 22100, totalOrders: 47, lastOrderDays: 4,  avgOrderValue: 470,  churnRisk: 'low',    repeatRate: 96, predictedNextOrder: 6  },
  { id: 'ci-8', name: 'Central City Bakers',   email: 'central@ccbakers.com',    store: 'donut-supplies.com',     clv: 3200,  totalOrders: 5,  lastOrderDays: 78, avgOrderValue: 640,  churnRisk: 'high',   repeatRate: 31, predictedNextOrder: undefined },
];
