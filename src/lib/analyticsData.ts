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
  store?: string;   // present on per-store sample rows; omitted on aggregated rows
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
  status: 'strong' | 'ok' | 'weak' | 'paused' | 'not-started';
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
  store?: string;
  data: DailyMetric[];
}

export interface AttributionTouchpoint {
  channel: Channel;
  store?: string;
  label: string;
  color: string;
  firstTouch: number;   // % of conversions
  lastTouch: number;
  linearTouch: number;
  positionBased: number;
}

export interface AIInsight {
  id: string;
  store?: string;   // omitted = account-wide insight, always shown
  type: 'opportunity' | 'anomaly' | 'warning' | 'win';
  title: string;
  detail: string;
  channel?: Channel;
  impact: 'high' | 'medium' | 'low';
  dollarImpact?: number;   // estimated monthly $ opportunity/risk
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
//
// The live app starts with every channel zeroed (see emptyChannelMetrics) —
// SAMPLE_CHANNEL_METRICS below only seeds Settings → Data → "Load Sample Data".

export function emptyChannelMetrics(): ChannelMetrics[] {
  return (Object.keys(CHANNEL_CONFIG) as Channel[]).map(channel => ({
    channel,
    ...CHANNEL_CONFIG[channel],
    impressions: 0, clicks: 0, ctr: 0, cpc: 0, spend: 0, budget: 0,
    conversions: 0, revenue: 0, roas: 0, cpa: 0, margin: 0,
    impressionsDelta: 0, clicksDelta: 0, conversionsDelta: 0,
    revenueDelta: 0, roasDelta: 0, spendDelta: 0,
    status: 'not-started',
  }));
}

// Blended (all-stores) baseline. SAMPLE_CHANNEL_METRICS below is derived from
// this by splitting each channel's volume across the 3 sample stores so that
// re-aggregating all stores exactly reconstitutes these figures.
const BLENDED_CHANNEL_METRICS: ChannelMetrics[] = [
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
    impressions: 0, clicks: 0, ctr: 0, cpc: 0, spend: 0,
    budget: 0, conversions: 0, revenue: 0, roas: 0, cpa: 0,
    margin: 0, impressionsDelta: 0, clicksDelta: 0, conversionsDelta: 0,
    revenueDelta: 0, roasDelta: 0, spendDelta: 0, status: 'not-started',
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
    impressions: 0, clicks: 0, ctr: 0, cpc: 0, spend: 0,
    budget: 0, conversions: 0, revenue: 0, roas: 0, cpa: 0,
    margin: 0, impressionsDelta: 0, clicksDelta: 0, conversionsDelta: 0,
    revenueDelta: 0, roasDelta: 0, spendDelta: 0, status: 'not-started',
  },
  {
    channel: 'linkedin', label: 'LinkedIn', icon: 'LI', color: '#0A66C2',
    impressions: 0, clicks: 0, ctr: 0, cpc: 0, spend: 0,
    budget: 0, conversions: 0, revenue: 0, roas: 0, cpa: 0,
    margin: 0, impressionsDelta: 0, clicksDelta: 0, conversionsDelta: 0,
    revenueDelta: 0, roasDelta: 0, spendDelta: 0, status: 'not-started',
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

// ─── Per-store sample split ────────────────────────────────────────────────────
// The 3 canonical sample stores (match INITIAL_STORES in storeScope.ts) and the
// share of each channel's volume they receive. The last store gets the exact
// remainder so summing all three reconstitutes the blended figure to the dollar.
const SAMPLE_STORE_IDS = ['donut-equipment', 'donut-supplies', 'bakery-wholesalers'];
const STORE_SPLIT = [0.5, 0.3, 0.2];

/** Split a whole-number total into 3 parts by STORE_SPLIT, remainder on the last. */
function split3(total: number): number[] {
  const a = Math.round(total * STORE_SPLIT[0]);
  const b = Math.round(total * STORE_SPLIT[1]);
  return [a, b, total - a - b];
}

export const SAMPLE_CHANNEL_METRICS: ChannelMetrics[] = BLENDED_CHANNEL_METRICS.flatMap(c => {
  const imp = split3(c.impressions), clk = split3(c.clicks), spd = split3(c.spend);
  const cnv = split3(c.conversions), rev = split3(c.revenue), bud = split3(c.budget);
  return SAMPLE_STORE_IDS.map((store, i) => ({
    ...c, store,
    impressions: imp[i], clicks: clk[i], spend: spd[i],
    conversions: cnv[i], revenue: rev[i], budget: bud[i],
    // rate & delta fields are period/store-independent — carried through as-is;
    // aggregation recomputes rates from summed volumes and revenue-weights deltas.
  }));
});

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

const BLENDED_TIME_SERIES: ChannelTimeSeries[] = [
  { channel: 'google-ads',  data: genDailyData(23625, 142890, 0.14, 12345) },
  { channel: 'meta-ads',    data: genDailyData(19517, 89340,  -0.06, 67890) },
  { channel: 'youtube-ads', data: genDailyData(5075,  28960,  0.15, 22222) },
  { channel: 'email',       data: genDailyData(1215,  89640,  0.09, 44444) },
];

// Per-store split of the daily series (same remainder-on-last approach so a
// day's three store values reconstitute the blended day exactly).
export const SAMPLE_TIME_SERIES: ChannelTimeSeries[] = BLENDED_TIME_SERIES.flatMap(ts =>
  SAMPLE_STORE_IDS.map((store, i) => ({
    channel: ts.channel,
    store,
    data: ts.data.map(d => {
      const spd = split3(d.spend), rev = split3(d.revenue), cnv = split3(d.conversions);
      const imp = split3(d.impressions), clk = split3(d.clicks);
      return { date: d.date, spend: spd[i], revenue: rev[i], conversions: cnv[i], impressions: imp[i], clicks: clk[i] };
    }),
  })),
);

/** Zeroed 30-day series (same date labels, all-zero values) for every channel — the live default. */
export function emptyTimeSeries(): ChannelTimeSeries[] {
  const zeroDays = genDailyData(0, 0, 0, 1).map(d => ({ ...d, spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0 }));
  return (Object.keys(CHANNEL_CONFIG) as Channel[]).map(channel => ({ channel, data: zeroDays }));
}

// ─── Attribution ──────────────────────────────────────────────────────────────

const BLENDED_ATTRIBUTION: AttributionTouchpoint[] = [
  { channel: 'google-ads',  label: 'Google Ads',   color: '#4285F4', firstTouch: 34.2, lastTouch: 28.7, linearTouch: 24.8, positionBased: 29.4 },
  { channel: 'meta-ads',    label: 'Meta Ads',     color: '#0866FF', firstTouch: 18.4, lastTouch: 21.3, linearTouch: 19.7, positionBased: 20.2 },
  { channel: 'organic',     label: 'Organic',      color: '#10d98a', firstTouch: 22.1, lastTouch: 14.6, linearTouch: 18.9, positionBased: 18.1 },
  { channel: 'email',       label: 'Email',        color: '#ffb347', firstTouch: 8.2,  lastTouch: 19.4, linearTouch: 14.8, positionBased: 15.6 },
  { channel: 'youtube-ads', label: 'YouTube Ads',  color: '#FF0000', firstTouch: 4.8,  lastTouch: 5.2,  linearTouch: 6.4,  positionBased: 4.9  },
];

// Attribution mix is a channel-level property, so each store carries the same
// touchpoint percentages; the conversion-weighted aggregation of identical
// percentages returns those percentages unchanged (invariant preserved).
export const SAMPLE_ATTRIBUTION: AttributionTouchpoint[] = SAMPLE_STORE_IDS.flatMap(store =>
  BLENDED_ATTRIBUTION.map(a => ({ ...a, store })),
);

/** Zeroed attribution rows for every channel — the live default. */
export function emptyAttribution(): AttributionTouchpoint[] {
  return (Object.keys(CHANNEL_CONFIG) as Channel[]).map(channel => ({
    channel, label: CHANNEL_CONFIG[channel].label, color: CHANNEL_CONFIG[channel].color,
    firstTouch: 0, lastTouch: 0, linearTouch: 0, positionBased: 0,
  }));
}

// ─── Cross-store aggregation ────────────────────────────────────────────────
// The persisted analytics data is per-store (rows carry `store`). Each page
// filters to the selected store scope, then collapses back to one row per
// channel via these helpers so the chart components (which expect a blended
// ChannelMetrics[] / ChannelTimeSeries[] / AttributionTouchpoint[]) need no
// changes. Volume metrics sum; rate metrics recompute from the sums; deltas
// are revenue/spend/conversion-weighted; attribution is conversion-weighted.

export function aggregateChannelMetrics(rows: ChannelMetrics[]): ChannelMetrics[] {
  return (Object.keys(CHANNEL_CONFIG) as Channel[]).map(channel => {
    const cfg = CHANNEL_CONFIG[channel];
    const group = rows.filter(r => r.channel === channel);
    if (group.length === 0) {
      return {
        channel, ...cfg,
        impressions: 0, clicks: 0, ctr: 0, cpc: 0, spend: 0, budget: 0,
        conversions: 0, revenue: 0, roas: 0, cpa: 0, margin: 0,
        impressionsDelta: 0, clicksDelta: 0, conversionsDelta: 0,
        revenueDelta: 0, roasDelta: 0, spendDelta: 0, status: 'not-started' as const,
      };
    }
    const sum = (f: (r: ChannelMetrics) => number) => group.reduce((s, r) => s + f(r), 0);
    const impressions = sum(r => r.impressions), clicks = sum(r => r.clicks), spend = sum(r => r.spend);
    const conversions = sum(r => r.conversions), revenue = sum(r => r.revenue), budget = sum(r => r.budget);
    const wAvg = (f: (r: ChannelMetrics) => number, weight: (r: ChannelMetrics) => number) => {
      const wTotal = group.reduce((s, r) => s + weight(r), 0);
      return wTotal > 0 ? group.reduce((s, r) => s + f(r) * weight(r), 0) / wTotal : 0;
    };
    // The dominant (highest-revenue) row's status represents the aggregate.
    const dominant = group.reduce((a, b) => (b.revenue > a.revenue ? b : a));
    return {
      channel, ...cfg,
      impressions, clicks, spend, conversions, revenue, budget,
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
      cpc: clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0,
      roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0,
      cpa: conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : 0,
      margin: revenue > 0 ? Math.round(((revenue - spend) / revenue) * 1000) / 10 : 0,
      impressionsDelta: wAvg(r => r.impressionsDelta, r => r.impressions),
      clicksDelta: wAvg(r => r.clicksDelta, r => r.clicks),
      conversionsDelta: wAvg(r => r.conversionsDelta, r => r.conversions),
      revenueDelta: wAvg(r => r.revenueDelta, r => r.revenue),
      roasDelta: wAvg(r => r.roasDelta, r => r.spend),
      spendDelta: wAvg(r => r.spendDelta, r => r.spend),
      status: (spend === 0 && revenue === 0) ? 'not-started' as const : dominant.status,
    };
  });
}

export function aggregateTimeSeries(rows: ChannelTimeSeries[]): ChannelTimeSeries[] {
  const channels = Array.from(new Set(rows.map(r => r.channel)));
  return channels.map(channel => {
    const group = rows.filter(r => r.channel === channel);
    const base = group[0].data;
    const data: DailyMetric[] = base.map((_, dayIdx) => {
      const sum = (f: (d: DailyMetric) => number) => group.reduce((s, ts) => s + f(ts.data[dayIdx]), 0);
      return {
        date: base[dayIdx].date,
        spend: sum(d => d.spend), revenue: sum(d => d.revenue), conversions: sum(d => d.conversions),
        impressions: sum(d => d.impressions), clicks: sum(d => d.clicks),
      };
    });
    return { channel, data };
  });
}

export function aggregateAttribution(rows: AttributionTouchpoint[], channelRows: ChannelMetrics[]): AttributionTouchpoint[] {
  // Weight each store's touchpoint percentages by that store's total conversions.
  const wByStore: Record<string, number> = {};
  for (const c of channelRows) if (c.store) wByStore[c.store] = (wByStore[c.store] ?? 0) + c.conversions;
  const totalW = Object.values(wByStore).reduce((s, w) => s + w, 0);
  const channels = Array.from(new Set(rows.map(r => r.channel)));
  return channels.map(channel => {
    const cfg = CHANNEL_CONFIG[channel];
    const group = rows.filter(r => r.channel === channel);
    const wAvg = (f: (r: AttributionTouchpoint) => number) => {
      if (totalW === 0) return group.length > 0 ? group.reduce((s, r) => s + f(r), 0) / group.length : 0;
      return group.reduce((s, r) => s + f(r) * (wByStore[r.store ?? ''] ?? 0), 0) / totalW;
    };
    return {
      channel, label: cfg.label, color: cfg.color,
      firstTouch: Math.round(wAvg(r => r.firstTouch) * 10) / 10,
      lastTouch: Math.round(wAvg(r => r.lastTouch) * 10) / 10,
      linearTouch: Math.round(wAvg(r => r.linearTouch) * 10) / 10,
      positionBased: Math.round(wAvg(r => r.positionBased) * 10) / 10,
    };
  });
}

// ─── AI Insights ──────────────────────────────────────────────────────────────

export const SAMPLE_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ins-001',
    store: 'donut-equipment',
    type: 'anomaly',
    title: 'Meta ROAS down 8.3% — possible creative fatigue',
    detail: 'Meta Ads ROAS has declined for 9 consecutive days. Average ad frequency reached 4.8. Top creative running 22 days without refresh.',
    channel: 'meta-ads',
    impact: 'high',
    dollarImpact: -6800,
    action: 'Refresh top 3 ad creatives and expand to a lookalike audience based on recent purchasers.',
  },
  {
    id: 'ins-005',
    // account-wide (no store) — Email is the top channel across all stores
    type: 'opportunity',
    title: 'Email ROI 73.8× — increase send frequency',
    detail: 'Email remains the highest-ROI channel with 73.8× ROAS on $1,215 spend generating $89,640 in attributed revenue. Current send cadence is 2×/week. Industry benchmark for your segment is 3-4×/week.',
    channel: 'email',
    impact: 'high',
    dollarImpact: 24000,
    action: 'Launch a 3rd weekly email focused on product restocks and new arrivals. Test a Sunday evening send slot.',
  },
  {
    id: 'ins-006',
    store: 'donut-equipment',
    type: 'opportunity',
    title: 'Google Ads under-pacing budget by 16%',
    detail: 'Google Ads has spent 84% of its monthly budget with 6 days left and holds a 6.05× ROAS. There is headroom to scale the top-performing Shopping campaigns without hurting efficiency.',
    channel: 'google-ads',
    impact: 'medium',
    dollarImpact: 9200,
    action: 'Raise daily budgets 15% on the two Shopping campaigns above 5× ROAS.',
  },
  {
    id: 'ins-007',
    type: 'warning',
    title: 'YouTube ROAS below 3× profitability floor',
    detail: 'YouTube Ads is running at 2.4× ROAS, below the 3× target. Spend is small but trending up week over week.',
    channel: 'youtube-ads',
    impact: 'medium',
    dollarImpact: -1400,
    action: 'Cap YouTube daily budget and A/B test a shorter 15s hook before scaling further.',
  },
  {
    id: 'ins-008',
    type: 'win',
    title: 'Organic SEO revenue up 9.8% this period',
    detail: 'Organic SEO attributed revenue grew to $112,480 (+9.8%), driven by three commercial keywords entering the top 3.',
    channel: 'organic',
    impact: 'low',
    dollarImpact: 10000,
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

export function scaledChannelMetrics(range: DateRange, channelMetrics: ChannelMetrics[]): ChannelMetrics[] {
  return channelMetrics.map(c => scaleChannel(c, range));
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

// Totals for a range, computed from whatever channel metrics currently exist
// (empty by default, or seeded via Load Sample Data). Budget stays monthly
// (period-independent).
export function scaledTotals(range: DateRange, channelMetrics: ChannelMetrics[]): AnalyticsTotals {
  const metrics = scaledChannelMetrics(range, channelMetrics);
  const totalSpend = metrics.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = metrics.reduce((s, c) => s + c.revenue, 0);
  return {
    totalSpend,
    totalRevenue,
    totalConversions: metrics.reduce((s, c) => s + c.conversions, 0),
    totalClicks: metrics.reduce((s, c) => s + c.clicks, 0),
    totalImpressions: metrics.reduce((s, c) => s + c.impressions, 0),
    blendedRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
    totalBudget: channelMetrics.reduce((s, c) => s + c.budget, 0),
  };
}

// Time series sliced/scaled for the range. Ranges ≤30d take the last N days of
// the baseline series; ranges >30d scale each day's volume up by rangeScale/N-ratio
// so totals stay consistent with scaledTotals.
export function scaledTimeSeries(range: DateRange, timeSeries: ChannelTimeSeries[]): ChannelTimeSeries[] {
  const points = rangePoints(range);
  // Per-day multiplier so the sum over `points` days equals the full range volume.
  const k = (rangeScale(range) * 30) / points;
  return timeSeries.map(ts => ({
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

// Attributed conversion count backing the attribution panel, scaled by range —
// equal to total conversions across channels so it never drifts from the
// Channel Performance Table's own totals.
export function scaledAttributionConversions(range: DateRange, channelMetrics: ChannelMetrics[]): number {
  return scaledChannelMetrics(range, channelMetrics).reduce((s, c) => s + c.conversions, 0);
}

// ─── Shareable Reports (Looker Studio / Google Slides stubs) ─────────────────

export interface SharedReport {
  id: string;
  name: string;
  platform: string;
  lastUpdated: string;
  views: number;
  shareUrl: string;
  live: boolean;
}

export const SAMPLE_SHARED_REPORTS: SharedReport[] = [
  { id: 'sr-1', name: 'Monthly Performance — All Stores', platform: 'Looker Studio', lastUpdated: '2h ago', views: 14, shareUrl: 'https://lookerstudio.google.com/r/abc123', live: true },
  { id: 'sr-2', name: 'Q1 Ad Spend Summary',              platform: 'Google Slides', lastUpdated: '3d ago', views: 8,  shareUrl: 'https://docs.google.com/presentation/d/xyz789', live: true },
  { id: 'sr-3', name: 'Channel Attribution Deep-Dive',    platform: 'Looker Studio', lastUpdated: '1w ago', views: 5,  shareUrl: 'https://lookerstudio.google.com/r/def456', live: false },
];
