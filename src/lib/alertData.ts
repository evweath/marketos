// ─── Alert System Types & Mock Data ──────────────────────────────────────────

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus   = 'active' | 'acknowledged' | 'resolved' | 'snoozed';
export type AlertCategory =
  | 'budget'
  | 'roas'
  | 'traffic'
  | 'revenue'
  | 'cart'
  | 'conversion'
  | 'ad-account'
  | 'uptime'
  | 'ssl'
  | 'social'
  | 'seo'
  | 'price-change'
  | 'stock';

export type DeliveryChannel = 'email' | 'sms' | 'slack' | 'teams' | 'push';

export interface AlertRule {
  id: string;
  name: string;
  category: AlertCategory;
  enabled: boolean;
  severity: AlertSeverity;
  // condition
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | 'change%';
  threshold: number;
  unit: string;
  // scope
  storeIds: string[];          // 'all' or specific store ids
  channelIds?: string[];       // for channel-specific rules
  // delivery
  channels: DeliveryChannel[];
  // cooldown / dedup
  cooldownMinutes: number;     // don't re-fire within N minutes
  // meta
  description: string;
  lastFired?: string;          // ISO
  fireCount30d: number;
}

export interface FiredAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  detail: string;
  metric: string;
  actualValue: string;
  thresholdValue: string;
  storeId: string | null;
  firedAt: string;             // ISO
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  deliveredTo: DeliveryChannel[];
  actionTaken?: string;
}

export interface DeliveryChannelConfig {
  channel: DeliveryChannel;
  label: string;
  icon: string;
  color: string;
  enabled: boolean;
  destination: string;         // email address, phone, webhook URL, etc.
  testStatus?: 'ok' | 'error' | 'untested';
}

export interface DigestConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  sendAt: string;              // '08:00'
  dayOfWeek?: number;          // 1=Monday etc., for weekly
  channels: DeliveryChannel[];
  includeCategories: AlertCategory[];
}

export interface QuietHoursConfig {
  enabled: boolean;
  start: string;               // '22:00'
  end: string;                 // '07:00'
  timezone: string;
  exceptCritical: boolean;     // critical alerts bypass quiet hours
  daysActive: number[];        // 0=Sun, 6=Sat
}

// ─── Category Config ──────────────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<AlertCategory, { label: string; icon: string; color: string; description: string }> = {
  budget:       { label: 'Budget',         icon: '💰', color: '#ffb347', description: 'Ad spend vs. budget limits'         },
  roas:         { label: 'ROAS',           icon: '📈', color: '#00d9ff', description: 'Return on ad spend thresholds'      },
  traffic:      { label: 'Traffic',        icon: '🌐', color: '#7b93ff', description: 'Website traffic spikes and drops'   },
  revenue:      { label: 'Revenue',        icon: '💵', color: '#10d98a', description: 'Sales and revenue performance'      },
  cart:         { label: 'Cart Recovery',  icon: '🛒', color: '#ffb347', description: 'Abandoned cart rate changes'        },
  conversion:   { label: 'Conversions',    icon: '🎯', color: '#00d9ff', description: 'Conversion rate thresholds'         },
  'ad-account': { label: 'Ad Account',     icon: '⚡', color: '#ff4444', description: 'Policy flags and account issues'    },
  uptime:       { label: 'Uptime',         icon: '🔔', color: '#ff4444', description: 'Website downtime detection'         },
  ssl:          { label: 'SSL / Domain',   icon: '🔒', color: '#ffb347', description: 'Certificate expiry warnings'        },
  social:       { label: 'Social Media',   icon: '📱', color: '#7b93ff', description: 'Engagement drops and spikes'        },
  seo:          { label: 'SEO Changes',    icon: '🔍', color: '#00d9ff', description: 'On-site SEO modifications'          },
  'price-change':{ label: 'Price Change', icon: '🏷',  color: '#ffb347', description: 'Product price modifications'        },
  stock:        { label: 'Stock / OOS',   icon: '📦',  color: '#ff4444', description: 'Out-of-stock detection'             },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function minsAgo(n: number): string {
  return new Date(Date.now() - n * 60000).toISOString();
}
function hoursAgo(n: number): string {
  return minsAgo(n * 60);
}
function daysAgo(n: number): string {
  return hoursAgo(n * 24);
}

// ─── Alert Rules ──────────────────────────────────────────────────────────────

export const ALERT_RULES: AlertRule[] = [
  // Budget
  {
    id: 'rule-001', name: 'Daily Budget Overage (Any Channel)', category: 'budget', enabled: true, severity: 'critical',
    metric: 'daily_spend_pct', operator: '>=', threshold: 100, unit: '% of daily budget',
    storeIds: ['all'], channels: ['slack', 'email', 'sms'], cooldownMinutes: 60,
    description: 'Alert when any ad channel exceeds its daily budget allocation',
    lastFired: hoursAgo(14), fireCount30d: 3,
  },
  {
    id: 'rule-002', name: 'Budget 80% Consumed (Early Warning)', category: 'budget', enabled: true, severity: 'warning',
    metric: 'daily_spend_pct', operator: '>=', threshold: 80, unit: '% of daily budget',
    storeIds: ['all'], channels: ['slack'], cooldownMinutes: 240,
    description: 'Early warning when daily budget is 80% consumed',
    lastFired: hoursAgo(6), fireCount30d: 12,
  },
  // ROAS
  {
    id: 'rule-003', name: 'Google Ads ROAS Drop', category: 'roas', enabled: true, severity: 'warning',
    metric: 'roas', operator: '<', threshold: 4.0, unit: '× ROAS',
    storeIds: ['all'], channelIds: ['google-ads'], channels: ['slack', 'email'], cooldownMinutes: 120,
    description: 'Alert when Google Ads ROAS drops below 4.0×',
    lastFired: daysAgo(3), fireCount30d: 2,
  },
  {
    id: 'rule-004', name: 'Meta ROAS Critical Drop', category: 'roas', enabled: true, severity: 'critical',
    metric: 'roas', operator: '<', threshold: 2.5, unit: '× ROAS',
    storeIds: ['all'], channelIds: ['meta-ads'], channels: ['slack', 'email', 'sms'], cooldownMinutes: 60,
    description: 'Critical alert if Meta ROAS drops below 2.5× — campaign may need pausing',
    lastFired: undefined, fireCount30d: 0,
  },
  // Traffic
  {
    id: 'rule-005', name: 'Traffic Drop (Any Store)', category: 'traffic', enabled: true, severity: 'warning',
    metric: 'sessions_change_pct', operator: '<', threshold: -25, unit: '% vs. 7-day avg',
    storeIds: ['all'], channels: ['slack', 'email'], cooldownMinutes: 60,
    description: 'Alert when any store sessions drop >25% vs. 7-day rolling average',
    lastFired: daysAgo(2), fireCount30d: 4,
  },
  {
    id: 'rule-006', name: 'Traffic Spike (>3× Normal)', category: 'traffic', enabled: true, severity: 'info',
    metric: 'sessions_change_pct', operator: '>=', threshold: 200, unit: '% vs. 7-day avg',
    storeIds: ['all'], channels: ['slack'], cooldownMinutes: 30,
    description: 'Positive alert — traffic spike may indicate viral content or press mention',
    lastFired: daysAgo(7), fireCount30d: 1,
  },
  // Revenue
  {
    id: 'rule-007', name: 'Daily Revenue Below Target', category: 'revenue', enabled: true, severity: 'warning',
    metric: 'daily_revenue', operator: '<', threshold: 15000, unit: '$ daily revenue',
    storeIds: ['all'], channels: ['slack', 'email'], cooldownMinutes: 360,
    description: 'Alert when combined daily revenue across all stores drops below $15,000',
    lastFired: daysAgo(5), fireCount30d: 3,
  },
  {
    id: 'rule-008', name: 'Bakerywholesalers Revenue Drop', category: 'revenue', enabled: true, severity: 'critical',
    metric: 'daily_revenue', operator: '<', threshold: 200000, unit: '$ daily revenue',
    storeIds: ['bakery-wholesalers'], channels: ['slack', 'sms', 'email'], cooldownMinutes: 120,
    description: 'Critical if bakerywholesalers.com daily revenue drops below $200K',
    lastFired: undefined, fireCount30d: 0,
  },
  // Cart
  {
    id: 'rule-009', name: 'Cart Abandonment Rate Spike', category: 'cart', enabled: true, severity: 'warning',
    metric: 'cart_abandonment_rate', operator: '>=', threshold: 80, unit: '% abandonment',
    storeIds: ['all'], channels: ['slack', 'email'], cooldownMinutes: 120,
    description: 'Alert when cart abandonment rate exceeds 80% (industry avg: 70%)',
    lastFired: hoursAgo(28), fireCount30d: 5,
  },
  {
    id: 'rule-010', name: 'High-Value Cart Abandoned', category: 'cart', enabled: true, severity: 'warning',
    metric: 'cart_value', operator: '>=', threshold: 5000, unit: '$ cart value',
    storeIds: ['all'], channels: ['slack', 'sms'], cooldownMinutes: 5,
    description: 'Immediate alert when a cart worth $5,000+ is abandoned without recovery attempt',
    lastFired: minsAgo(9), fireCount30d: 8,
  },
  // Conversion
  {
    id: 'rule-011', name: 'Conversion Rate Drop', category: 'conversion', enabled: true, severity: 'warning',
    metric: 'conversion_rate', operator: '<', threshold: 2.0, unit: '% conversion rate',
    storeIds: ['all'], channels: ['slack', 'email'], cooldownMinutes: 240,
    description: 'Alert when store conversion rate drops below 2.0%',
    lastFired: daysAgo(4), fireCount30d: 2,
  },
  // Ad account
  {
    id: 'rule-012', name: 'Ad Account Policy Flag', category: 'ad-account', enabled: true, severity: 'critical',
    metric: 'policy_flag', operator: '==', threshold: 1, unit: 'flag',
    storeIds: ['all'], channels: ['email', 'sms', 'slack', 'teams'], cooldownMinutes: 0,
    description: 'Immediate alert on any Facebook or Google ad policy violation or account flag',
    lastFired: daysAgo(12), fireCount30d: 1,
  },
  {
    id: 'rule-013', name: 'Ad Spend Anomaly (>150% of normal)', category: 'ad-account', enabled: true, severity: 'critical',
    metric: 'spend_vs_avg', operator: '>=', threshold: 150, unit: '% of 7-day avg',
    storeIds: ['all'], channels: ['email', 'sms', 'slack'], cooldownMinutes: 30,
    description: 'Alert if daily spend exceeds 150% of 7-day average — may indicate runaway campaign',
    lastFired: undefined, fireCount30d: 0,
  },
  // Uptime
  {
    id: 'rule-014', name: 'Website Down (Any Store)', category: 'uptime', enabled: true, severity: 'critical',
    metric: 'uptime_status', operator: '==', threshold: 0, unit: 'status (0=down)',
    storeIds: ['all'], channels: ['sms', 'email', 'slack', 'teams'], cooldownMinutes: 5,
    description: 'Immediate alert if any store is unreachable for 2 consecutive 5-min checks',
    lastFired: daysAgo(18), fireCount30d: 1,
  },
  {
    id: 'rule-015', name: 'Slow Response Time', category: 'uptime', enabled: true, severity: 'warning',
    metric: 'response_time_ms', operator: '>=', threshold: 800, unit: 'ms response',
    storeIds: ['all'], channels: ['slack'], cooldownMinutes: 30,
    description: 'Alert when any store response time exceeds 800ms (donut-supplies currently at 1,247ms)',
    lastFired: minsAgo(45), fireCount30d: 14,
  },
  // SSL
  {
    id: 'rule-016', name: 'SSL Certificate — 30-Day Warning', category: 'ssl', enabled: true, severity: 'warning',
    metric: 'ssl_days_remaining', operator: '<=', threshold: 30, unit: 'days remaining',
    storeIds: ['all'], channels: ['email', 'slack'], cooldownMinutes: 1440,
    description: '30-day advance warning for SSL certificate renewal',
    lastFired: daysAgo(2), fireCount30d: 2,
  },
  {
    id: 'rule-017', name: 'SSL Certificate — 14-Day Critical', category: 'ssl', enabled: true, severity: 'critical',
    metric: 'ssl_days_remaining', operator: '<=', threshold: 14, unit: 'days remaining',
    storeIds: ['all'], channels: ['email', 'sms', 'slack', 'teams'], cooldownMinutes: 720,
    description: 'Urgent: SSL cert expiry within 14 days will cause browser warnings',
    lastFired: hoursAgo(2), fireCount30d: 2,
  },
  // Social
  {
    id: 'rule-018', name: 'Engagement Rate Drop (Any Platform)', category: 'social', enabled: true, severity: 'info',
    metric: 'engagement_rate_change', operator: '<', threshold: -30, unit: '% change vs. 7-day avg',
    storeIds: ['all'], channels: ['slack'], cooldownMinutes: 1440,
    description: 'Alert when any platform engagement rate drops >30% vs. 7-day average',
    lastFired: daysAgo(6), fireCount30d: 3,
  },
  // Price change
  {
    id: 'rule-019', name: 'Product Price Changed (>5%)', category: 'price-change', enabled: true, severity: 'warning',
    metric: 'price_change_pct', operator: 'change%', threshold: 5, unit: '% price change',
    storeIds: ['all'], channels: ['slack', 'email'], cooldownMinutes: 60,
    description: 'Alert when any product price changes by more than 5% in either direction',
    lastFired: minsAgo(14), fireCount30d: 6,
  },
  // Stock
  {
    id: 'rule-020', name: 'High-Demand Product Out of Stock', category: 'stock', enabled: true, severity: 'critical',
    metric: 'stock_status', operator: '==', threshold: 0, unit: 'units',
    storeIds: ['all'], channels: ['slack', 'email', 'sms'], cooldownMinutes: 60,
    description: 'Immediate alert when a top-20 best-selling product goes out of stock',
    lastFired: hoursAgo(2), fireCount30d: 4,
  },
];

// ─── Fired Alert History ──────────────────────────────────────────────────────

export const FIRED_ALERTS: FiredAlert[] = [
  // Active / unacknowledged
  {
    id: 'fa-001', ruleId: 'rule-017', ruleName: 'SSL Certificate — 14-Day Critical',
    category: 'ssl', severity: 'critical', status: 'active',
    title: 'SSL Certificate Expiring in 14 Days',
    detail: 'donut-supplies.com SSL certificate expires on May 25, 2026. Browsers will show a security warning to all visitors after expiry. Renew immediately via your domain registrar or Shopify SSL settings.',
    metric: 'SSL Days Remaining', actualValue: '14 days', thresholdValue: '≤ 14 days',
    storeId: 'donut-supplies', firedAt: hoursAgo(2),
    deliveredTo: ['email', 'sms', 'slack', 'teams'],
  },
  {
    id: 'fa-002', ruleId: 'rule-020', ruleName: 'High-Demand Product Out of Stock',
    category: 'stock', severity: 'critical', status: 'active',
    title: 'Cake Donut Mix (Bulk 50lb) — Out of Stock',
    detail: 'Product went OOS 1h 52m ago. This is a top-5 seller on donut-supplies.com. 3 carts containing this item have been abandoned in the last 2 hours. 6 back-in-stock notifications are queued.',
    metric: 'Stock Units', actualValue: '0 units', thresholdValue: '0 units (OOS trigger)',
    storeId: 'donut-supplies', firedAt: hoursAgo(1.87),
    deliveredTo: ['slack', 'email', 'sms'],
  },
  {
    id: 'fa-003', ruleId: 'rule-015', ruleName: 'Slow Response Time',
    category: 'uptime', severity: 'warning', status: 'active',
    title: 'donut-supplies.com Response Time: 1,247ms',
    detail: 'Response time has exceeded 800ms threshold for 9 consecutive checks (45 min). Average is now 1,247ms vs. threshold of 800ms. This is degrading user experience and may be impacting conversion rate. Check server load and Shopify app performance.',
    metric: 'Response Time', actualValue: '1,247ms', thresholdValue: '≥ 800ms',
    storeId: 'donut-supplies', firedAt: minsAgo(45),
    deliveredTo: ['slack'],
  },
  {
    id: 'fa-004', ruleId: 'rule-010', ruleName: 'High-Value Cart Abandoned',
    category: 'cart', severity: 'warning', status: 'active',
    title: '$12,480 Cart Abandoned — bakerywholesalers.com',
    detail: 'Patricia Lund (procurement@lundfoods.com, Minneapolis MN) abandoned a cart worth $12,480 9 minutes ago. No recovery email has been sent. Includes: AP Flour 50lb Pallet ×4, Sugar ×6, Shortening ×8. High-value B2B lead — manual outreach recommended in addition to automated recovery.',
    metric: 'Cart Value', actualValue: '$12,480', thresholdValue: '≥ $5,000',
    storeId: 'bakery-wholesalers', firedAt: minsAgo(9),
    deliveredTo: ['slack', 'sms'],
  },
  {
    id: 'fa-005', ruleId: 'rule-019', ruleName: 'Product Price Changed (>5%)',
    category: 'price-change', severity: 'warning', status: 'active',
    title: 'Price Increase Detected: Glazing Mix 25lb',
    detail: 'donut-supplies.com: Glazing Mix 25lb price changed from $34.99 → $37.20 (+6.3%). Change detected 14 minutes ago. Source: Shopify product webhook. Verify this was an intentional update — if automated repricing, check rules.',
    metric: 'Price Change', actualValue: '+6.3% ($34.99 → $37.20)', thresholdValue: 'change ≥ 5%',
    storeId: 'donut-supplies', firedAt: minsAgo(14),
    deliveredTo: ['slack', 'email'],
  },
  // Acknowledged
  {
    id: 'fa-006', ruleId: 'rule-016', ruleName: 'SSL Certificate — 30-Day Warning',
    category: 'ssl', severity: 'warning', status: 'acknowledged',
    title: 'SSL Expiry Warning: donut-supplies.com',
    detail: 'Initial 30-day warning. Acknowledged — renewal scheduled for this week.',
    metric: 'SSL Days Remaining', actualValue: '28 days (at time of alert)', thresholdValue: '≤ 30 days',
    storeId: 'donut-supplies', firedAt: daysAgo(2),
    acknowledgedAt: hoursAgo(46), acknowledgedBy: 'James K.',
    deliveredTo: ['email', 'slack'],
    actionTaken: 'Renewal scheduled for this week.',
  },
  {
    id: 'fa-007', ruleId: 'rule-009', ruleName: 'Cart Abandonment Rate Spike',
    category: 'cart', severity: 'warning', status: 'acknowledged',
    title: 'Cart Abandonment Rate at 83% — donut-supplies.com',
    detail: 'Abandonment rate spiked to 83% vs. 72% baseline. Likely linked to slow response time and the OOS product.',
    metric: 'Cart Abandonment Rate', actualValue: '83%', thresholdValue: '≥ 80%',
    storeId: 'donut-supplies', firedAt: hoursAgo(28),
    acknowledgedAt: hoursAgo(26), acknowledgedBy: 'Sarah M.',
    deliveredTo: ['slack', 'email'],
    actionTaken: 'Recovery sequence manually triggered.',
  },
  {
    id: 'fa-008', ruleId: 'rule-002', ruleName: 'Budget 80% Consumed (Early Warning)',
    category: 'budget', severity: 'warning', status: 'acknowledged',
    title: 'Google Ads Daily Budget 84% Consumed (6h Remaining)',
    detail: 'Google Ads daily budget is 84% consumed with 6 hours remaining in the day. Consider pausing lower-priority ad sets to protect budget for peak evening hours.',
    metric: 'Budget Utilization', actualValue: '84% consumed', thresholdValue: '≥ 80%',
    storeId: null, firedAt: hoursAgo(6),
    acknowledgedAt: hoursAgo(5.5), acknowledgedBy: 'James K.',
    deliveredTo: ['slack'],
    actionTaken: 'Paused 2 display campaigns for evening prime time.',
  },
  // Resolved
  {
    id: 'fa-009', ruleId: 'rule-012', ruleName: 'Ad Account Policy Flag',
    category: 'ad-account', severity: 'critical', status: 'resolved',
    title: 'Meta Ad Account Policy Flag — Resolved',
    detail: 'Meta flagged an ad creative for potential policy violation. Ad was paused automatically. Creative reviewed and modified. Account in good standing.',
    metric: 'Policy Flag', actualValue: '1 flag', thresholdValue: 'Any flag',
    storeId: null, firedAt: daysAgo(12),
    acknowledgedAt: daysAgo(12), acknowledgedBy: 'Sarah M.',
    resolvedAt: daysAgo(11),
    deliveredTo: ['email', 'sms', 'slack', 'teams'],
    actionTaken: 'Creative modified and resubmitted. Approved within 24h.',
  },
  {
    id: 'fa-010', ruleId: 'rule-005', ruleName: 'Traffic Drop (Any Store)',
    category: 'traffic', severity: 'warning', status: 'resolved',
    title: 'Traffic Drop 28% — donut-equipment.com',
    detail: 'Sessions dropped 28% vs. 7-day average on donut-equipment.com. Root cause: Google Search Console showed a 4-hour crawl issue that has since resolved.',
    metric: 'Session Change', actualValue: '-28% vs. 7d avg', thresholdValue: '< -25%',
    storeId: 'donut-equipment', firedAt: daysAgo(2),
    acknowledgedAt: daysAgo(2), resolvedAt: daysAgo(2),
    deliveredTo: ['slack', 'email'],
    actionTaken: 'Google crawl issue resolved automatically. Traffic restored to normal.',
  },
  {
    id: 'fa-011', ruleId: 'rule-001', ruleName: 'Daily Budget Overage',
    category: 'budget', severity: 'critical', status: 'resolved',
    title: 'Meta Ads Budget Exceeded — $2,180 Over Daily Limit',
    detail: 'Meta Ads overspent daily budget by $2,180 due to a campaign with misconfigured bid cap. Campaign paused automatically.',
    metric: 'Daily Spend', actualValue: '$4,680 (budget: $2,500)', thresholdValue: '≥ 100% of budget',
    storeId: null, firedAt: daysAgo(14),
    acknowledgedAt: daysAgo(14), resolvedAt: daysAgo(14),
    deliveredTo: ['slack', 'email', 'sms'],
    actionTaken: 'Campaign paused. Bid caps corrected. Budget overage filed with Meta support.',
  },
  // Snoozed
  {
    id: 'fa-012', ruleId: 'rule-018', ruleName: 'Engagement Rate Drop',
    category: 'social', severity: 'info', status: 'snoozed',
    title: 'X/Twitter Engagement Down 34%',
    detail: 'X/Twitter engagement rate dropped 34% vs. 7-day average. Platform-wide engagement decline noted across industry.',
    metric: 'Engagement Rate Change', actualValue: '-34%', thresholdValue: '< -30%',
    storeId: null, firedAt: daysAgo(6),
    deliveredTo: ['slack'],
    actionTaken: 'Snoozed 7 days — platform-wide issue, not store-specific.',
  },
];

// ─── Delivery Channel Config ──────────────────────────────────────────────────

export const DELIVERY_CHANNELS: DeliveryChannelConfig[] = [
  { channel: 'email',  label: 'Email',      icon: '✉',  color: '#ffb347', enabled: true,  destination: 'marketing@donut-equipment.com', testStatus: 'ok'       },
  { channel: 'sms',    label: 'SMS',        icon: '📱', color: '#10d98a', enabled: true,  destination: '+1 (918) 555-0142',              testStatus: 'ok'       },
  { channel: 'slack',  label: 'Slack',      icon: '💬', color: '#4A154B', enabled: true,  destination: '#marketing-alerts',              testStatus: 'ok'       },
  { channel: 'teams',  label: 'MS Teams',   icon: '🔷', color: '#5b5fc7', enabled: true,  destination: 'MarketOS Alerts webhook',        testStatus: 'ok'       },
  { channel: 'push',   label: 'Push / App', icon: '🔔', color: '#00d9ff', enabled: false, destination: 'Not configured',                testStatus: 'untested' },
];

// ─── Quiet Hours Config ───────────────────────────────────────────────────────

export const QUIET_HOURS: QuietHoursConfig = {
  enabled: true,
  start: '22:00',
  end: '07:00',
  timezone: 'America/Chicago',
  exceptCritical: true,
  daysActive: [0, 1, 2, 3, 4, 5, 6],
};

// ─── Digest Config ────────────────────────────────────────────────────────────

export const DIGEST_CONFIG: DigestConfig = {
  enabled: true,
  frequency: 'daily',
  sendAt: '08:00',
  channels: ['email', 'slack'],
  includeCategories: ['budget', 'roas', 'revenue', 'cart', 'uptime', 'ssl'],
};

// ─── Computed Stats ───────────────────────────────────────────────────────────

export const ALERT_STATS = {
  totalActive:        FIRED_ALERTS.filter(a => a.status === 'active').length,
  totalAcknowledged:  FIRED_ALERTS.filter(a => a.status === 'acknowledged').length,
  totalResolved:      FIRED_ALERTS.filter(a => a.status === 'resolved').length,
  totalSnoozed:       FIRED_ALERTS.filter(a => a.status === 'snoozed').length,
  criticalActive:     FIRED_ALERTS.filter(a => a.status === 'active' && a.severity === 'critical').length,
  warningActive:      FIRED_ALERTS.filter(a => a.status === 'active' && a.severity === 'warning').length,
  total30d:           ALERT_RULES.reduce((s, r) => s + r.fireCount30d, 0),
  rulesEnabled:       ALERT_RULES.filter(r => r.enabled).length,
  rulesTotal:         ALERT_RULES.length,
};

export type AlertTab = 'feed' | 'rules' | 'delivery' | 'digest';
