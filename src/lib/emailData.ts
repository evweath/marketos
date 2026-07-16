export type FlowStatus = 'active' | 'paused' | 'draft';
export type EmailStatus = 'sent' | 'scheduled' | 'draft';
export type FlowTrigger = 'cart-abandon' | 'browse-abandon' | 'welcome' | 'post-purchase' | 'winback' | 'vip' | 'restock' | 'birthday';

export interface EmailFlow {
  id: string;
  name: string;
  trigger: FlowTrigger;
  status: FlowStatus;
  steps: number;
  channels: ('email' | 'sms' | 'push')[];
  store: string;
  // 30d performance
  triggered: number;
  sent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  unsubscribeRate: number;
  lastEdited: string;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  preview: string;
  status: EmailStatus;
  store: string;
  sentTo: number;
  openRate?: number;
  clickRate?: number;
  revenue?: number;
  unsubscribes?: number;
  scheduledFor?: string;
  sentAt?: string;
}

export interface SegmentData {
  id: string;
  name: string;
  count: number;
  description: string;
  avgClv: number;
  avgOrderValue: number;
  color: string;
}

export interface DeliverabilityMetric {
  label: string;
  value: string;
  status: 'ok' | 'warn' | 'error';
  detail: string;
}

const TRIGGER_CONFIG: Record<FlowTrigger, { label: string; icon: string; color: string }> = {
  'cart-abandon':    { label: 'Cart Abandon',     icon: '🛒', color: '#ffb347' },
  'browse-abandon':  { label: 'Browse Abandon',   icon: '👁', color: '#7b93ff' },
  'welcome':         { label: 'Welcome Series',   icon: '👋', color: '#00d9ff' },
  'post-purchase':   { label: 'Post-Purchase',    icon: '📦', color: '#10d98a' },
  'winback':         { label: 'Win-Back',         icon: '🔁', color: '#ff4444' },
  'vip':             { label: 'VIP Upgrade',      icon: '⭐', color: '#ffb347' },
  'restock':         { label: 'Back in Stock',    icon: '📬', color: '#10d98a' },
  'birthday':        { label: 'Birthday',         icon: '🎂', color: '#E1306C' },
};
export { TRIGGER_CONFIG };

function daysAgo(n: number) { return new Date(Date.now() - n * 86400000).toISOString(); }
function daysFromNow(n: number) { return new Date(Date.now() + n * 86400000).toISOString(); }

// SAMPLE_* below seeds Settings → Data → "Load Sample Data"; the app boots empty.
export const SAMPLE_EMAIL_FLOWS: EmailFlow[] = [
  {
    id: 'ef-001', name: 'Cart Abandonment — 3-Step (Email + SMS)', trigger: 'cart-abandon',
    status: 'active', steps: 3, channels: ['email', 'sms'], store: 'All Stores',
    triggered: 847, sent: 2198, openRate: 42.8, clickRate: 18.4, conversionRate: 11.2,
    revenue: 48420, unsubscribeRate: 0.3, lastEdited: daysAgo(14),
  },
  {
    id: 'ef-002', name: 'Welcome Series — 5-Email Onboarding', trigger: 'welcome',
    status: 'active', steps: 5, channels: ['email'], store: 'All Stores',
    triggered: 312, sent: 1180, openRate: 58.4, clickRate: 24.8, conversionRate: 14.7,
    revenue: 28840, unsubscribeRate: 0.8, lastEdited: daysAgo(30),
  },
  {
    id: 'ef-003', name: 'Post-Purchase — Review + Upsell (4-Step)', trigger: 'post-purchase',
    status: 'active', steps: 4, channels: ['email', 'sms'], store: 'All Stores',
    triggered: 613, sent: 1842, openRate: 51.2, clickRate: 21.4, conversionRate: 8.4,
    revenue: 38240, unsubscribeRate: 0.2, lastEdited: daysAgo(21),
  },
  {
    id: 'ef-004', name: 'Win-Back — 90-Day Lapsed Customers', trigger: 'winback',
    status: 'active', steps: 3, channels: ['email', 'sms'], store: 'All Stores',
    triggered: 284, sent: 712, openRate: 24.8, clickRate: 9.2, conversionRate: 4.1,
    revenue: 12480, unsubscribeRate: 1.4, lastEdited: daysAgo(7),
  },
  {
    id: 'ef-005', name: 'Browse Abandonment — Product Interest', trigger: 'browse-abandon',
    status: 'active', steps: 2, channels: ['email'], store: 'donut-equipment.com',
    triggered: 1840, sent: 3012, openRate: 38.4, clickRate: 14.8, conversionRate: 5.2,
    revenue: 18840, unsubscribeRate: 0.6, lastEdited: daysAgo(45),
  },
  {
    id: 'ef-006', name: 'VIP Tier Upgrade — $5K+ Lifetime Spend', trigger: 'vip',
    status: 'active', steps: 2, channels: ['email'], store: 'bakery-wholesalers.com',
    triggered: 48, sent: 86, openRate: 74.4, clickRate: 42.8, conversionRate: 28.4,
    revenue: 84240, unsubscribeRate: 0.0, lastEdited: daysAgo(60),
  },
  {
    id: 'ef-007', name: 'Back In Stock — Waitlist Notification', trigger: 'restock',
    status: 'paused', steps: 1, channels: ['email', 'sms', 'push'], store: 'donut-supplies.com',
    triggered: 0, sent: 0, openRate: 0, clickRate: 0, conversionRate: 0,
    revenue: 0, unsubscribeRate: 0, lastEdited: daysAgo(2),
  },
  {
    id: 'ef-008', name: 'Birthday Reward — Annual Offer', trigger: 'birthday',
    status: 'draft', steps: 1, channels: ['email', 'sms'], store: 'All Stores',
    triggered: 0, sent: 0, openRate: 0, clickRate: 0, conversionRate: 0,
    revenue: 0, unsubscribeRate: 0, lastEdited: daysAgo(1),
  },
];

export const SAMPLE_EMAIL_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'ec-001', subject: '🍩 Flash Sale: 20% Off All Glazing Mixes This Weekend',
    preview: 'Your donuts deserve the best glaze. Stock up before summer season peaks...',
    status: 'scheduled', store: 'donut-supplies.com', sentTo: 14820,
    scheduledFor: daysFromNow(1),
  },
  {
    id: 'ec-002', subject: 'New: AutoFryer XL 40L — Early Access for Existing Customers',
    preview: 'You\'re one of the first to hear about our most powerful fryer yet...',
    status: 'sent', store: 'donut-equipment.com', sentTo: 8240,
    openRate: 34.8, clickRate: 12.4, revenue: 28480, unsubscribes: 14,
    sentAt: daysAgo(4),
  },
  {
    id: 'ec-003', subject: 'Q2 Bakery Wholesale Buying Guide + Volume Pricing Update',
    preview: 'Reduce your ingredient costs by 18% with our new volume pricing tiers...',
    status: 'sent', store: 'bakery-wholesalers.com', sentTo: 3120,
    openRate: 48.2, clickRate: 22.8, revenue: 84240, unsubscribes: 8,
    sentAt: daysAgo(7),
  },
  {
    id: 'ec-004', subject: '[DRAFT] Summer Donut Flavor Collection — June Launch',
    preview: 'Strawberry basil, blueberry lavender, citrus burst...',
    status: 'draft', store: 'donut-supplies.com', sentTo: 0,
  },
];

export const SAMPLE_SEGMENTS: SegmentData[] = [
  { id: 'seg-001', name: 'VIP (LTV > $5K)',      count: 284,  description: 'High-value customers with >$5,000 lifetime spend', avgClv: 12480, avgOrderValue: 847, color: '#ffb347' },
  { id: 'seg-002', name: 'Active Buyers (90d)',  count: 1847, description: 'Purchased at least once in the last 90 days',        avgClv: 2840,  avgOrderValue: 312, color: '#10d98a' },
  { id: 'seg-003', name: 'At-Risk (91-180d)',    count: 612,  description: 'No purchase in 91-180 days — churn risk medium',    avgClv: 1240,  avgOrderValue: 214, color: '#ffb347' },
  { id: 'seg-004', name: 'Lapsed (180d+)',       count: 384,  description: 'No purchase in 180+ days — high churn risk',        avgClv: 840,   avgOrderValue: 184, color: '#ff4444' },
  { id: 'seg-005', name: 'Wholesale Accounts',  count: 142,  description: 'B2B buyers placing orders >$2,000 per order',      avgClv: 48400, avgOrderValue: 3840, color: '#7b93ff' },
  { id: 'seg-006', name: 'New Subscribers',     count: 312,  description: 'Subscribed in last 30 days, no purchase yet',      avgClv: 0,     avgOrderValue: 0,    color: '#00d9ff' },
];

export const SAMPLE_DELIVERABILITY: DeliverabilityMetric[] = [
  { label: 'Sending Domain SPF',    value: 'Pass',      status: 'ok',   detail: 'v=spf1 include:klaviyo.com ~all — properly configured' },
  { label: 'DKIM Signature',        value: 'Pass',      status: 'ok',   detail: 'DKIM key published and signing correctly for all 3 domains' },
  { label: 'DMARC Policy',          value: 'p=quarantine', status: 'warn', detail: 'Consider upgrading to p=reject for maximum deliverability' },
  { label: 'List Hygiene',          value: '2.1% invalid', status: 'warn', detail: '312 invalid/bounced emails in list — clean before next send' },
  { label: 'Spam Complaint Rate',   value: '0.08%',     status: 'ok',   detail: 'Below 0.1% threshold — excellent sender reputation' },
  { label: 'Bounce Rate (30d)',      value: '0.6%',      status: 'ok',   detail: 'Hard bounces 0.4%, soft bounces 0.2% — within healthy range' },
  { label: 'Unsubscribe Rate (30d)', value: '0.4%',     status: 'ok',   detail: 'Below 0.5% industry threshold — content relevance is good' },
  { label: 'Inbox Placement',       value: '94.2%',     status: 'ok',   detail: 'Gmail: 96%, Outlook: 91%, Apple Mail: 98% inbox placement' },
];

// Computed from whatever flows currently exist (empty by default, or seeded
// via Load Sample Data) rather than hardcoded, plus subscriber counts which
// have no backing data model yet — honestly zeroed until one exists.
export function computeEmailStats(flows: EmailFlow[]) {
  const sentFlows = flows.filter(f => f.sent > 0);
  return {
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalRevenue30d: flows.reduce((s, f) => s + f.revenue, 0),
    avgOpenRate: sentFlows.length > 0 ? sentFlows.reduce((s, f) => s + f.openRate, 0) / sentFlows.length : 0,
    avgClickRate: sentFlows.length > 0 ? sentFlows.reduce((s, f) => s + f.clickRate, 0) / sentFlows.length : 0,
    activeFlows: flows.filter(f => f.status === 'active').length,
  };
}

// ─── SMS ────────────────────────────────────────────────────────────────────

export type SmsStatus = 'sent' | 'scheduled' | 'draft';
export type SmsFlowStatus = 'active' | 'paused';

export interface SmsMessage { role: 'brand' | 'customer'; text: string; time: string; }

export interface SmsConversation {
  id: string; customer: string; cartValue: number; store: string;
  status: 'recovered' | 'active' | 'no_response';
  messages: SmsMessage[];
}

// Empty until real 2-way SMS conversations exist for a store — no sample
// content authored since conversation transcripts aren't a "seed catalog"
// the way campaigns/flows are.
export const SAMPLE_SMS_CONVERSATIONS: SmsConversation[] = [];

export interface SmsCampaign {
  id: string; name: string; status: SmsStatus; sentAt: string;
  recipients: number; delivered: number; deliveryRate: number;
  ctr: number; conversions: number; revenue: number; store: string;
}

export const SAMPLE_SMS_CAMPAIGNS: SmsCampaign[] = [
  { id: 'sms-001', name: 'Spring Sale Blast', status: 'sent', sentAt: '2d ago', recipients: 4820, delivered: 4739, deliveryRate: 98.3, ctr: 12.4, conversions: 84, revenue: 18420, store: 'All Stores' },
  { id: 'sms-002', name: 'Back In Stock: Donut Glazer Pro', status: 'sent', sentAt: '5d ago', recipients: 1240, delivered: 1228, deliveryRate: 99.0, ctr: 24.8, conversions: 31, revenue: 22480, store: 'donut-equipment.com' },
  { id: 'sms-003', name: 'Flash Sale — 15% Off Today Only', status: 'scheduled', sentAt: 'Tomorrow 10am', recipients: 6200, delivered: 0, deliveryRate: 0, ctr: 0, conversions: 0, revenue: 0, store: 'All Stores' },
  { id: 'sms-004', name: 'VIP Early Access — New Products', status: 'draft', sentAt: '—', recipients: 842, delivered: 0, deliveryRate: 0, ctr: 0, conversions: 0, revenue: 0, store: 'bakery-wholesalers.com' },
];

export interface SmsFlow {
  id: string; name: string; trigger: string; status: SmsFlowStatus;
  steps: number; triggered30d: number; convRate: number | null; revenue30d: number; store: string;
}

export const SAMPLE_SMS_FLOWS: SmsFlow[] = [
  { id: 'sf-001', name: 'Abandoned Cart SMS Recovery', trigger: 'Cart Abandoned > 1hr', status: 'active', steps: 2, triggered30d: 412, convRate: 14.2, revenue30d: 28400, store: 'All Stores' },
  { id: 'sf-002', name: 'Order Confirmation + Tracking', trigger: 'Order Placed', status: 'active', steps: 3, triggered30d: 847, convRate: null, revenue30d: 0, store: 'All Stores' },
  { id: 'sf-003', name: 'VIP Welcome SMS', trigger: 'Customer tagged VIP', status: 'active', steps: 1, triggered30d: 38, convRate: 42.1, revenue30d: 4200, store: 'bakery-wholesalers.com' },
  { id: 'sf-004', name: 'Win-Back — 90 Day Lapsed', trigger: 'No purchase 90d', status: 'paused', steps: 2, triggered30d: 124, convRate: 6.8, revenue30d: 3100, store: 'All Stores' },
];

export function computeSmsStats(campaigns: SmsCampaign[]) {
  const sent = campaigns.filter(c => c.status === 'sent');
  return {
    totalSent: sent.reduce((s, c) => s + c.delivered, 0),
    avgDelivery: sent.length > 0 ? sent.reduce((s, c) => s + c.deliveryRate, 0) / sent.length : 0,
    avgCtr: sent.length > 0 ? sent.reduce((s, c) => s + c.ctr, 0) / sent.length : 0,
    revenue: sent.reduce((s, c) => s + c.revenue, 0),
  };
}

// ─── Push Notifications ──────────────────────────────────────────────────────

export type PushStatus = 'sent' | 'scheduled';
export type PushAutoStatus = 'active' | 'paused';

export interface PushCampaign {
  id: string; name: string; status: PushStatus; sentAt: string;
  sent: number; delivered: number; clicked: number; ctr: number; revenue: number; store: string;
}

export const SAMPLE_PUSH_CAMPAIGNS: PushCampaign[] = [
  { id: 'pn-001', name: 'Weekend Sale Reminder', status: 'sent', sentAt: '1d ago', sent: 28400, delivered: 26912, clicked: 2154, ctr: 8.0, revenue: 4840, store: 'All Stores' },
  { id: 'pn-002', name: 'New Product Launch — Croissant Maker X2', status: 'sent', sentAt: '3d ago', sent: 28400, delivered: 27100, clicked: 3280, ctr: 12.1, revenue: 8420, store: 'donut-equipment.com' },
  { id: 'pn-003', name: 'Flash Sale — 4 Hours Only', status: 'scheduled', sentAt: 'Today 3pm', sent: 0, delivered: 0, clicked: 0, ctr: 0, revenue: 0, store: 'All Stores' },
];

export interface PushAutomation {
  id: string; name: string; trigger: string; status: PushAutoStatus;
  triggered30d: number; ctr: number; revenue30d: number; store: string;
}

export const SAMPLE_PUSH_AUTOMATIONS: PushAutomation[] = [
  { id: 'pa-001', name: 'Abandoned Cart Push Reminder', trigger: 'Cart Abandoned 30min', status: 'active', triggered30d: 847, ctr: 7.2, revenue30d: 3240, store: 'All Stores' },
  { id: 'pa-002', name: 'Back In Stock Alert', trigger: 'Product Restocked', status: 'active', triggered30d: 124, ctr: 24.8, revenue30d: 8420, store: 'donut-supplies.com' },
  { id: 'pa-003', name: 'Price Drop Alert', trigger: 'Price decreased ≥ 10%', status: 'active', triggered30d: 84, ctr: 18.4, revenue30d: 4120, store: 'All Stores' },
  { id: 'pa-004', name: 'Order Shipped', trigger: 'Fulfillment updated', status: 'active', triggered30d: 412, ctr: 31.2, revenue30d: 0, store: 'All Stores' },
];

export function computePushStats(campaigns: PushCampaign[]) {
  const sent = campaigns.filter(c => c.status === 'sent');
  return {
    totalRevenue30d: sent.reduce((s, c) => s + c.revenue, 0),
    avgCtr: sent.length > 0 ? sent.reduce((s, c) => s + c.ctr, 0) / sent.length : 0,
  };
}

// ─── Push subscriber breakdown (per-store subscriber counts) ────────────────
//
// No real push-subscription tracking model exists yet — zeroed by default,
// with a small sample so "Load Sample Data" demonstrates the per-store bars.

export interface PushSubscriberCount { store: string; subscribers: number; }

export const SAMPLE_PUSH_SUBSCRIBERS_BY_STORE: PushSubscriberCount[] = [
  { store: 'donut-equipment.com',    subscribers: 12400 },
  { store: 'donut-supplies.com',     subscribers: 8200  },
  { store: 'bakery-wholesalers.com', subscribers: 7800  },
];

// ─── Transactional Email ─────────────────────────────────────────────────────

export type TxStatus = 'active' | 'paused' | 'draft';
export interface TxTemplate {
  id: string; name: string; trigger: string; status: TxStatus;
  sent30d: number; deliveryRate: number; openRate: number; store: string;
}

// Standard transactional email trigger types every store can enable — this
// list itself is structural (like TEMPLATE_CATEGORIES in contentData.ts), so
// it stays populated by default rather than behind Load Sample Data; only
// its activity numbers are honestly zeroed until real fulfillment webhooks
// are connected.
export const TX_TEMPLATES: TxTemplate[] = [
  { id: 'tx-1', name: 'Order Confirmation',       trigger: 'order.placed',         status: 'draft', sent30d: 0, deliveryRate: 0, openRate: 0, store: 'All Stores' },
  { id: 'tx-2', name: 'Shipping Confirmation',    trigger: 'fulfillment.shipped',   status: 'draft', sent30d: 0, deliveryRate: 0, openRate: 0, store: 'All Stores' },
  { id: 'tx-3', name: 'Out for Delivery',          trigger: 'fulfillment.in_transit', status: 'draft', sent30d: 0, deliveryRate: 0, openRate: 0, store: 'All Stores' },
  { id: 'tx-4', name: 'Delivered Confirmation',   trigger: 'fulfillment.delivered', status: 'draft', sent30d: 0, deliveryRate: 0, openRate: 0, store: 'All Stores' },
  { id: 'tx-5', name: 'Refund Processed',          trigger: 'refund.created',        status: 'draft', sent30d: 0, deliveryRate: 0, openRate: 0, store: 'All Stores' },
  { id: 'tx-6', name: 'Password Reset',            trigger: 'customer.password_reset', status: 'draft', sent30d: 0, deliveryRate: 0, openRate: 0, store: 'All Stores' },
  { id: 'tx-7', name: 'Account Created',           trigger: 'customer.created',      status: 'draft', sent30d: 0, deliveryRate: 0, openRate: 0, store: 'All Stores' },
  { id: 'tx-8', name: 'Wholesale Invoice Ready',   trigger: 'invoice.created',       status: 'draft', sent30d: 0, deliveryRate: 0, openRate: 0, store: 'bakery-wholesalers.com' },
  { id: 'tx-9', name: 'Back-in-Stock Notification', trigger: 'inventory.back_in_stock', status: 'draft', sent30d: 0, deliveryRate: 0, openRate: 0, store: 'All Stores' },
];

// ─── A/B Testing ──────────────────────────────────────────────────────────────

export type ABTestStatus = 'running' | 'completed' | 'draft';
export type ABTestType = 'subject' | 'content' | 'send_time';

export interface EmailABTest {
  id: string; name: string; type: ABTestType; status: ABTestStatus; store: string;
  variantA: string; variantB: string;
  openA: number; openB: number; clickA: number; clickB: number;
  sampleSize: number; confidence: number; winner: 'A' | 'B' | null;
  started: string;
}

export const SAMPLE_EMAIL_AB_TESTS: EmailABTest[] = [
  {
    id: 'ab-001', name: 'Subject Line — Emoji vs Plain', type: 'subject', status: 'completed', store: 'donut-equipment.com',
    variantA: '🍩 Flash Sale: 20% Off Today Only', variantB: 'Flash Sale: 20% Off Today Only',
    openA: 42.8, openB: 34.1, clickA: 18.4, clickB: 14.2, sampleSize: 8400, confidence: 96, winner: 'A', started: daysAgo(12),
  },
  {
    id: 'ab-002', name: 'Send Time — Morning vs Evening', type: 'send_time', status: 'running', store: 'All Stores',
    variantA: '9:00 AM', variantB: '6:00 PM',
    openA: 38.2, openB: 41.6, clickA: 12.1, clickB: 15.8, sampleSize: 4200, confidence: 62, winner: null, started: daysAgo(3),
  },
];

export function computeAbTestStats(tests: EmailABTest[]) {
  const completed = tests.filter(t => t.status === 'completed');
  return {
    avgConfidence: completed.length > 0 ? Math.round(completed.reduce((s, t) => s + t.confidence, 0) / completed.length) : 0,
    avgOpenLift: completed.length > 0
      ? Math.round((completed.reduce((s, t) => s + (t.winner === 'A' ? t.openA - t.openB : t.winner === 'B' ? t.openB - t.openA : 0), 0) / completed.length) * 10) / 10
      : 0,
  };
}
