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

export const EMAIL_FLOWS: EmailFlow[] = [
  {
    id: 'ef-001', name: 'Cart Abandonment — 3-Step (Email + SMS)', trigger: 'cart-abandon',
    status: 'active', steps: 3, channels: ['email', 'sms'], store: 'all stores',
    triggered: 847, sent: 2198, openRate: 42.8, clickRate: 18.4, conversionRate: 11.2,
    revenue: 48420, unsubscribeRate: 0.3, lastEdited: daysAgo(14),
  },
  {
    id: 'ef-002', name: 'Welcome Series — 5-Email Onboarding', trigger: 'welcome',
    status: 'active', steps: 5, channels: ['email'], store: 'all stores',
    triggered: 312, sent: 1180, openRate: 58.4, clickRate: 24.8, conversionRate: 14.7,
    revenue: 28840, unsubscribeRate: 0.8, lastEdited: daysAgo(30),
  },
  {
    id: 'ef-003', name: 'Post-Purchase — Review + Upsell (4-Step)', trigger: 'post-purchase',
    status: 'active', steps: 4, channels: ['email', 'sms'], store: 'all stores',
    triggered: 613, sent: 1842, openRate: 51.2, clickRate: 21.4, conversionRate: 8.4,
    revenue: 38240, unsubscribeRate: 0.2, lastEdited: daysAgo(21),
  },
  {
    id: 'ef-004', name: 'Win-Back — 90-Day Lapsed Customers', trigger: 'winback',
    status: 'active', steps: 3, channels: ['email', 'sms'], store: 'all stores',
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
    status: 'active', steps: 2, channels: ['email'], store: 'bakerywholesalers.com',
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
    status: 'draft', steps: 1, channels: ['email', 'sms'], store: 'all stores',
    triggered: 0, sent: 0, openRate: 0, clickRate: 0, conversionRate: 0,
    revenue: 0, unsubscribeRate: 0, lastEdited: daysAgo(1),
  },
];

export const EMAIL_CAMPAIGNS: EmailCampaign[] = [
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
    status: 'sent', store: 'bakerywholesalers.com', sentTo: 3120,
    openRate: 48.2, clickRate: 22.8, revenue: 84240, unsubscribes: 8,
    sentAt: daysAgo(7),
  },
  {
    id: 'ec-004', subject: '[DRAFT] Summer Donut Flavor Collection — June Launch',
    preview: 'Strawberry basil, blueberry lavender, citrus burst...',
    status: 'draft', store: 'donut-supplies.com', sentTo: 0,
  },
];

export const SEGMENTS: SegmentData[] = [
  { id: 'seg-001', name: 'VIP (LTV > $5K)',      count: 284,  description: 'High-value customers with >$5,000 lifetime spend', avgClv: 12480, avgOrderValue: 847, color: '#ffb347' },
  { id: 'seg-002', name: 'Active Buyers (90d)',  count: 1847, description: 'Purchased at least once in the last 90 days',        avgClv: 2840,  avgOrderValue: 312, color: '#10d98a' },
  { id: 'seg-003', name: 'At-Risk (91-180d)',    count: 612,  description: 'No purchase in 91-180 days — churn risk medium',    avgClv: 1240,  avgOrderValue: 214, color: '#ffb347' },
  { id: 'seg-004', name: 'Lapsed (180d+)',       count: 384,  description: 'No purchase in 180+ days — high churn risk',        avgClv: 840,   avgOrderValue: 184, color: '#ff4444' },
  { id: 'seg-005', name: 'Wholesale Accounts',  count: 142,  description: 'B2B buyers placing orders >$2,000 per order',      avgClv: 48400, avgOrderValue: 3840, color: '#7b93ff' },
  { id: 'seg-006', name: 'New Subscribers',     count: 312,  description: 'Subscribed in last 30 days, no purchase yet',      avgClv: 0,     avgOrderValue: 0,    color: '#00d9ff' },
];

export const DELIVERABILITY: DeliverabilityMetric[] = [
  { label: 'Sending Domain SPF',    value: 'Pass',      status: 'ok',   detail: 'v=spf1 include:klaviyo.com ~all — properly configured' },
  { label: 'DKIM Signature',        value: 'Pass',      status: 'ok',   detail: 'DKIM key published and signing correctly for all 3 domains' },
  { label: 'DMARC Policy',          value: 'p=quarantine', status: 'warn', detail: 'Consider upgrading to p=reject for maximum deliverability' },
  { label: 'List Hygiene',          value: '2.1% invalid', status: 'warn', detail: '312 invalid/bounced emails in list — clean before next send' },
  { label: 'Spam Complaint Rate',   value: '0.08%',     status: 'ok',   detail: 'Below 0.1% threshold — excellent sender reputation' },
  { label: 'Bounce Rate (30d)',      value: '0.6%',      status: 'ok',   detail: 'Hard bounces 0.4%, soft bounces 0.2% — within healthy range' },
  { label: 'Unsubscribe Rate (30d)', value: '0.4%',     status: 'ok',   detail: 'Below 0.5% industry threshold — content relevance is good' },
  { label: 'Inbox Placement',       value: '94.2%',     status: 'ok',   detail: 'Gmail: 96%, Outlook: 91%, Apple Mail: 98% inbox placement' },
];

export const EMAIL_STATS = {
  totalSubscribers: 23108,
  activeSubscribers: 18420,
  totalRevenue30d: EMAIL_FLOWS.reduce((s, f) => s + f.revenue, 0),
  avgOpenRate: EMAIL_FLOWS.filter(f => f.sent > 0).reduce((s, f) => s + f.openRate, 0) / EMAIL_FLOWS.filter(f => f.sent > 0).length,
  avgClickRate: EMAIL_FLOWS.filter(f => f.sent > 0).reduce((s, f) => s + f.clickRate, 0) / EMAIL_FLOWS.filter(f => f.sent > 0).length,
  activeFlows: EMAIL_FLOWS.filter(f => f.status === 'active').length,
};
