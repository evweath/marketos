// ─── Analytics Types & Mock Data ─────────────────────────────────────────────

export type Channel =
  | 'google-ads'
  | 'meta-ads'
  | 'tiktok-ads'
  | 'youtube-ads'
  | 'x-twitter'
  | 'linkedin'
  | 'email'
  | 'organic';

export interface ChannelMetrics {
  channel: Channel;
  label: string;
  icon: string;
  color: string;
  // current period
  impressions: number;
  clicks: number;
  ctr: number;         // %
  cpc: number;         // $
  spend: number;       // $
  budget: number;      // $ monthly budget
  conversions: number;
  revenue: number;     // $ attributed
  roas: number;        // revenue/spend
  cpa: number;         // spend/conversions
  margin: number;      // (revenue - spend) / revenue * 100
  // vs prior period
  impressionsDelta: number; // %
  clicksDelta: number;
  conversionsDelta: number;
  revenueDelta: number;
  roasDelta: number;
  spendDelta: number;
  // status
  status: 'strong' | 'ok' | 'weak' | 'paused';
}

export interface DailyMetric {
  date: string;        // 'May 1', etc.
  spend: number;
  revenue: number;
  conversions: number;
  impressions: number;
  clicks: number;
}

export interface ChannelTimeSeries {
  channel: Channel;
  data: DailyMetric[];
}

export interface AttributionTouchpoint {
  channel: Channel;
  label: string;
  color: string;
  firstTouch: number;   // % of conversions
  lastTouch: number;
  linearTouch: number;
  positionBased: number;
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'anomaly' | 'warning' | 'win';
  title: string;
  detail: string;
  channel?: Channel;
  impact: 'high' | 'medium' | 'low';
  action?: string;
}

// ─── Channel Config ───────────────────────────────────────────────────────────

export const CHANNEL_CONFIG: Record<Channel, { label: string; icon: string; color: string }> = {
  'google-ads':  { label: 'Google Ads',  icon: 'G',  color: '#4285F4' },
  'meta-ads':    { label: 'Meta Ads',    icon: 'M',  color: '#0866FF' },
  'tiktok-ads':  { label: 'TikTok Ads', icon: 'TK', color: '#FF0050' },
  'youtube-ads': { label: 'YouTube Ads',icon: 'YT', color: '#FF0000' },
  'x-twitter':   { label: 'X / Twitter',icon: 'X',  color: '#E7E9EA' },
  'linkedin':    { label: 'LinkedIn',   icon: 'LI', color: '#0A66C2' },
  'email':       { label: 'Email',      icon: 'EM', color: '#ffb347' },
  'organic':     { label: 'Organic SEO',icon: 'OR', color: '#10d98a' },
};

// ─── Channel Metrics (30-day current period) ──────────────────────────────────

export const CHANNEL_METRICS: ChannelMetrics[] = [
  {
    channel: 'google-ads', label: 'Google Ads', icon: 'G', color: '#4285F4',
    impressions: 428600, clicks: 12840, ctr: 2.99, cpc: 1.84, spend: 23625,
    budget: 28000, conversions: 847, revenue: 142890, roas: 6.05, cpa: 27.89,
    margin: 83.5, impressionsDelta: +8.2, clicksDelta: +11.4, conversionsDelta: +9.7,
    revenueDelta: +14.2, roasDelta: +2.1, spendDelta: +4.8, status: 'strong',
  },
  {
    channel: 'meta-ads', label: 'Meta Ads', icon: 'M', color: '#0866FF',
    impressions: 867400, clicks: 9120, ctr: 1.05, cpc: 2.14, spend: 19517,
    budget: 22000, conversions: 612, revenue: 89340, roas: 4.58, cpa: 31.89,
    margin: 78.1, impressionsDelta: +3.1, clicksDelta: -2.4, conversionsDelta: -4.1,
    revenueDelta: -5.7, roasDelta: -8.3, spendDelta: +6.2, status: 'weak',
  },
  {
    channel: 'tiktok-ads', label: 'TikTok Ads', icon: 'TK', color: '#FF0050',
    impressions: 1240000, clicks: 7480, ctr: 0.60, cpc: 0.89, spend: 6657,
    budget: 8000, conversions: 218, revenue: 24640, roas: 3.70, cpa: 30.54,
    margin: 73.0, impressionsDelta: +42.0, clicksDelta: +38.7, conversionsDelta: +31.2,
    revenueDelta: +29.4, roasDelta: -7.1, spendDelta: +41.8, status: 'ok',
  },
  {
    channel: 'youtube-ads', label: 'YouTube Ads', icon: 'YT', color: '#FF0000',
    impressions: 312000, clicks: 4160, ctr: 1.33, cpc: 1.22, spend: 5075,
    budget: 6000, conversions: 187, revenue: 28960, roas: 5.71, cpa: 27.14,
    margin: 82.5, impressionsDelta: +15.3, clicksDelta: +18.9, conversionsDelta: +21.4,
    revenueDelta: +24.6, roasDelta: +6.8, spendDelta: +7.1, status: 'strong',
  },
  {
    channel: 'x-twitter', label: 'X / Twitter', icon: 'X', color: '#E7E9EA',
    impressions: 184000, clicks: 2210, ctr: 1.20, cpc: 1.56, spend: 3448,
    budget: 4000, conversions: 89, revenue: 9840, roas: 2.85, cpa: 38.74,
    margin: 64.9, impressionsDelta: -6.4, clicksDelta: -9.1, conversionsDelta: -12.3,
    revenueDelta: -11.8, roasDelta: -4.2, spendDelta: +1.8, status: 'weak',
  },
  {
    channel: 'linkedin', label: 'LinkedIn', icon: 'LI', color: '#0A66C2',
    impressions: 94000, clicks: 1880, ctr: 2.00, cpc: 4.20, spend: 7896,
    budget: 10000, conversions: 142, revenue: 67840, roas: 8.59, cpa: 55.60,
    margin: 88.4, impressionsDelta: +22.1, clicksDelta: +19.8, conversionsDelta: +28.4,
    revenueDelta: +34.2, roasDelta: +10.6, spendDelta: +8.4, status: 'strong',
  },
  {
    channel: 'email', label: 'Email', icon: 'EM', color: '#ffb347',
    impressions: 48200, clicks: 5784, ctr: 12.0, cpc: 0.21, spend: 1215,
    budget: 1500, conversions: 412, revenue: 89640, roas: 73.8, cpa: 2.95,
    margin: 98.6, impressionsDelta: +4.2, clicksDelta: +6.8, conversionsDelta: +7.1,
    revenueDelta: +9.3, roasDelta: +3.1, spendDelta: +2.1, status: 'strong',
  },
  {
    channel: 'organic', label: 'Organic SEO', icon: 'OR', color: '#10d98a',
    impressions: 0, clicks: 18420, ctr: 0, cpc: 0, spend: 0,
    budget: 0, conversions: 624, revenue: 112480, roas: 0, cpa: 0,
    margin: 100, impressionsDelta: +11.4, clicksDelta: +9.8, conversionsDelta: +8.2,
    revenueDelta: +10.1, roasDelta: 0, spendDelta: 0, status: 'strong',
  },
];

// ─── Totals (computed from above) ────────────────────────────────────────────

export const ANALYTICS_TOTALS = {
  totalSpend:        CHANNEL_METRICS.reduce((s, c) => s + c.spend, 0),
  totalRevenue:      CHANNEL_METRICS.reduce((s, c) => s + c.revenue, 0),
  totalConversions:  CHANNEL_METRICS.reduce((s, c) => s + c.conversions, 0),
  totalClicks:       CHANNEL_METRICS.reduce((s, c) => s + c.clicks, 0),
  totalImpressions:  CHANNEL_METRICS.reduce((s, c) => s + c.impressions, 0),
  blendedRoas:       0, // computed below
  totalBudget:       CHANNEL_METRICS.reduce((s, c) => s + c.budget, 0),
};
ANALYTICS_TOTALS.blendedRoas =
  ANALYTICS_TOTALS.totalRevenue / (ANALYTICS_TOTALS.totalSpend || 1);

// ─── 30-day Time Series (Google + Meta only for chart density) ────────────────

function genDailyData(baseSpend: number, baseRevenue: number, trend: number, seed: number): DailyMetric[] {
  const days: DailyMetric[] = [];
  const labels = ['May 1','May 2','May 3','May 4','May 5','May 6','May 7','May 8','May 9','May 10',
                  'May 11','May 12','May 13','May 14','May 15','May 16','May 17','May 18','May 19','May 20',
                  'May 21','May 22','May 23','May 24','May 25','May 26','May 27','May 28','May 29','May 30'];
  let s = seed;
  for (let i = 0; i < 30; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const noise = ((s >>> 0) % 200 - 100) / 1000;
    const trendFactor = 1 + trend * i / 30;
    const wkd = [0,6].includes(i % 7) ? 0.7 : 1;
    const spend = Math.round(baseSpend / 30 * (1 + noise) * trendFactor * wkd);
    const revenue = Math.round(baseRevenue / 30 * (1 + noise * 1.4) * trendFactor * wkd);
    days.push({
      date: labels[i],
      spend,
      revenue,
      conversions: Math.round(spend / 28),
      impressions: Math.round(spend * 18),
      clicks: Math.round(spend * 0.54),
    });
  }
  return days;
}

export const TIME_SERIES: ChannelTimeSeries[] = [
  { channel: 'google-ads',  data: genDailyData(23625, 142890, 0.14, 12345) },
  { channel: 'meta-ads',    data: genDailyData(19517, 89340,  -0.06, 67890) },
  { channel: 'tiktok-ads',  data: genDailyData(6657,  24640,  0.42, 11111) },
  { channel: 'youtube-ads', data: genDailyData(5075,  28960,  0.15, 22222) },
  { channel: 'linkedin',    data: genDailyData(7896,  67840,  0.22, 33333) },
  { channel: 'email',       data: genDailyData(1215,  89640,  0.09, 44444) },
];

// ─── Attribution ──────────────────────────────────────────────────────────────

export const ATTRIBUTION: AttributionTouchpoint[] = [
  { channel: 'google-ads',  label: 'Google Ads',   color: '#4285F4', firstTouch: 34.2, lastTouch: 28.7, linearTouch: 24.8, positionBased: 29.4 },
  { channel: 'meta-ads',    label: 'Meta Ads',     color: '#0866FF', firstTouch: 18.4, lastTouch: 21.3, linearTouch: 19.7, positionBased: 20.2 },
  { channel: 'organic',     label: 'Organic',      color: '#10d98a', firstTouch: 22.1, lastTouch: 14.6, linearTouch: 18.9, positionBased: 18.1 },
  { channel: 'email',       label: 'Email',        color: '#ffb347', firstTouch: 8.2,  lastTouch: 19.4, linearTouch: 14.8, positionBased: 15.6 },
  { channel: 'linkedin',    label: 'LinkedIn',     color: '#0A66C2', firstTouch: 9.4,  lastTouch: 7.8,  linearTouch: 9.2,  positionBased: 9.0  },
  { channel: 'youtube-ads', label: 'YouTube Ads',  color: '#FF0000', firstTouch: 4.8,  lastTouch: 5.2,  linearTouch: 6.4,  positionBased: 4.9  },
  { channel: 'tiktok-ads',  label: 'TikTok Ads',  color: '#FF0050', firstTouch: 2.9,  lastTouch: 3.0,  linearTouch: 6.2,  positionBased: 2.8  },
];

// ─── AI Insights ──────────────────────────────────────────────────────────────

export const AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ins-001',
    type: 'anomaly',
    title: 'Meta ROAS down 8.3% — possible creative fatigue',
    detail: 'Meta Ads ROAS has declined for 9 consecutive days. Average ad frequency reached 4.8. Top creative running 22 days without refresh.',
    channel: 'meta-ads',
    impact: 'high',
    action: 'Refresh top 3 ad creatives and expand to a lookalike audience based on recent purchasers.',
  },
  {
    id: 'ins-002',
    type: 'opportunity',
    title: 'LinkedIn ROAS 8.59× — scale budget recommended',
    detail: 'LinkedIn campaigns show the highest blended ROAS across all paid channels at 8.59×, averaging $67,840 revenue on $7,896 spend. Budget utilization is at 79% — there is $2,104 remaining budget headroom this month.',
    channel: 'linkedin',
    impact: 'high',
    action: 'Increase LinkedIn daily budget by 25% and duplicate top-performing B2B ad sets targeting decision-makers.',
  },
  {
    id: 'ins-003',
    type: 'win',
    title: 'TikTok volume up 42% MoM — ahead of projections',
    detail: 'TikTok Ads impressions grew 42% vs. last month. Click volume is up 38.7%. Despite lower ROAS (3.7×), cost per click ($0.89) is driving significant top-of-funnel volume at low cost.',
    channel: 'tiktok-ads',
    impact: 'medium',
    action: 'A/B test a retargeting campaign for TikTok viewers who did not convert to improve ROAS.',
  },
  {
    id: 'ins-004',
    type: 'warning',
    title: 'X/Twitter CPA rising — $38.74 vs. $31.20 last month',
    detail: 'X/Twitter cost per acquisition has risen 24.2% over the last 30 days. Conversions are down 12.3% while spend increased 1.8%. The channel is now the least efficient paid channel by CPA.',
    channel: 'x-twitter',
    impact: 'medium',
    action: 'Reduce X/Twitter budget by 30% and reallocate to YouTube Ads which shows improving ROAS trend.',
  },
  {
    id: 'ins-005',
    type: 'opportunity',
    title: 'Email ROI 73.8× — increase send frequency',
    detail: 'Email remains the highest-ROI channel with 73.8× ROAS on $1,215 spend generating $89,640 in attributed revenue. Current send cadence is 2×/week. Industry benchmark for your segment is 3-4×/week.',
    channel: 'email',
    impact: 'high',
    action: 'Launch a 3rd weekly email focused on product restocks and new arrivals. Test a Sunday evening send slot.',
  },
];

export type DateRange = '7d' | '30d' | '90d' | 'mtd' | 'ytd';

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  'mtd': 'Month to Date',
  'ytd': 'Year to Date',
};

// ─── Deterministic Range Scaling ──────────────────────────────────────────────
// The base constants above represent a 30-day period. All range-dependent views
// derive from them via these PURE helpers so SSR and client hydration match
// (no Date.now()/Math.random()). Volume metrics (spend, revenue, conversions,
// clicks, impressions) scale with the range's day count relative to 30; rate
// metrics (ctr, cpc, roas, cpa, margin, budget) are period-independent.

// Effective day count each range represents relative to the 30-day baseline.
export const DATE_RANGE_DAYS: Record<DateRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  'mtd': 18,   // deterministic "month-to-date" snapshot
  'ytd': 212,  // deterministic "year-to-date" snapshot
};

// Volume multiplier for a range (1 === 30-day baseline).
export function rangeScale(range: DateRange): number {
  return DATE_RANGE_DAYS[range] / 30;
}

// Number of daily points a range's time-series should render.
export function rangePoints(range: DateRange): number {
  return Math.min(DATE_RANGE_DAYS[range], 30);
}

// Scale a single channel's volume metrics for the given range; rates unchanged.
export function scaleChannel(c: ChannelMetrics, range: DateRange): ChannelMetrics {
  const k = rangeScale(range);
  return {
    ...c,
    impressions: Math.round(c.impressions * k),
    clicks: Math.round(c.clicks * k),
    spend: Math.round(c.spend * k),
    conversions: Math.round(c.conversions * k),
    revenue: Math.round(c.revenue * k),
  };
}

export function scaledChannelMetrics(range: DateRange): ChannelMetrics[] {
  return CHANNEL_METRICS.map(c => scaleChannel(c, range));
}

export interface AnalyticsTotals {
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  totalClicks: number;
  totalImpressions: number;
  blendedRoas: number;
  totalBudget: number;
}

// Totals for a range. Budget stays monthly (period-independent); the 30d case
// reproduces ANALYTICS_TOTALS exactly.
export function scaledTotals(range: DateRange): AnalyticsTotals {
  const metrics = scaledChannelMetrics(range);
  const totalSpend = metrics.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = metrics.reduce((s, c) => s + c.revenue, 0);
  return {
    totalSpend,
    totalRevenue,
    totalConversions: metrics.reduce((s, c) => s + c.conversions, 0),
    totalClicks: metrics.reduce((s, c) => s + c.clicks, 0),
    totalImpressions: metrics.reduce((s, c) => s + c.impressions, 0),
    blendedRoas: totalRevenue / (totalSpend || 1),
    totalBudget: ANALYTICS_TOTALS.totalBudget,
  };
}

// Time series sliced/scaled for the range. Ranges ≤30d take the last N days of
// the baseline series; ranges >30d scale each day's volume up by rangeScale/N-ratio
// so totals stay consistent with scaledTotals.
export function scaledTimeSeries(range: DateRange): ChannelTimeSeries[] {
  const points = rangePoints(range);
  // Per-day multiplier so the sum over `points` days equals the full range volume.
  const k = (rangeScale(range) * 30) / points;
  return TIME_SERIES.map(ts => ({
    channel: ts.channel,
    data: ts.data.slice(-points).map(d => ({
      ...d,
      spend: Math.round(d.spend * k),
      revenue: Math.round(d.revenue * k),
      conversions: Math.round(d.conversions * k),
      impressions: Math.round(d.impressions * k),
      clicks: Math.round(d.clicks * k),
    })),
  }));
}

// Attributed conversion count backing the attribution panel, scaled by range.
export const ATTRIBUTION_BASE_CONVERSIONS = 3131;
export function scaledAttributionConversions(range: DateRange): number {
  return Math.round(ATTRIBUTION_BASE_CONVERSIONS * rangeScale(range));
}
