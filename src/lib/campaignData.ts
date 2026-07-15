// ─── Ad Campaign Types & Mock Data ───────────────────────────────────────────

export type AdPlatform = 'google' | 'meta' | 'tiktok' | 'youtube' | 'linkedin' | 'x-twitter';
export type CampaignStatus = 'active' | 'paused' | 'ended' | 'draft' | 'learning';
export type CampaignObjective = 'conversions' | 'traffic' | 'awareness' | 'leads' | 'video-views' | 'catalog-sales';

export interface Campaign {
  id: string;
  platform: AdPlatform;
  name: string;
  status: CampaignStatus;
  objective: CampaignObjective;
  // budget
  dailyBudget: number;
  totalBudget: number;
  spendToDate: number;
  budgetPacing: number;      // % of budget paced correctly
  // performance
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  revenue: number;
  roas: number;
  cpa: number;
  frequency?: number;        // Meta only
  qualityScore?: number;     // Google only (1-10)
  // vs yesterday
  spendDelta: number;
  roasDelta: number;
  conversionsDelta: number;
  // meta
  startDate: string;
  adSets: number;
  ads: number;
  autoRulesFired: number;
  store: string;
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  status: CampaignStatus;
  audience: string;
  dailyBudget: number;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  roas: number;
  cpa: number;
  frequency?: number;
}

export interface Creative {
  id: string;
  campaignId: string;
  name: string;
  type: 'image' | 'video' | 'carousel' | 'text';
  status: 'active' | 'paused' | 'winner' | 'loser';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  roas: number;
  cpa: number;
  daysRunning: number;
  isControl: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  platform: AdPlatform;
  enabled: boolean;
  trigger: string;
  action: string;
  condition: string;
  lastFired?: string;
  fireCount: number;
  status: 'active' | 'paused' | 'triggered';
}

export interface HealthCheckItem {
  id: string;
  platform: AdPlatform;
  category: string;
  check: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  priority: 'high' | 'medium' | 'low';
}

// ─── Platform UI config ───────────────────────────────────────────────────────

export const AD_PLATFORM_CONFIG: Record<AdPlatform, { label: string; color: string; icon: string }> = {
  google:     { label: 'Google Ads',  color: '#4285F4', icon: 'G'  },
  meta:       { label: 'Meta Ads',    color: '#0866FF', icon: 'M'  },
  tiktok:     { label: 'TikTok Ads', color: '#FF0050', icon: 'TK' },
  youtube:    { label: 'YouTube',    color: '#FF0000', icon: 'YT' },
  linkedin:   { label: 'LinkedIn',   color: '#0A66C2', icon: 'LI' },
  'x-twitter':{ label: 'X/Twitter', color: '#E7E9EA', icon: 'X'  },
};

export const STATUS_CONFIG: Record<CampaignStatus, { color: string; label: string; bg: string }> = {
  active:   { color: '#10d98a', label: 'Active',    bg: 'rgba(16,217,138,0.1)'  },
  paused:   { color: '#ffb347', label: 'Paused',    bg: 'rgba(255,179,71,0.1)'  },
  ended:    { color: '#474e82', label: 'Ended',     bg: 'rgba(71,78,130,0.1)'   },
  draft:    { color: '#7b93ff', label: 'Draft',     bg: 'rgba(123,147,255,0.1)' },
  learning: { color: '#00d9ff', label: 'Learning',  bg: 'rgba(0,217,255,0.1)'   },
};

// ─── Campaigns ────────────────────────────────────────────────────────────────
//
// These SAMPLE_* arrays are not the app's live data — the app boots empty by
// default (see src/lib/sampleDataRegistry.ts). They're the seed content for
// Settings → Data → "Load Sample Data", used to demo/verify the app with
// realistic records without shipping fabricated numbers as the default state.

export const SAMPLE_CAMPAIGNS: Campaign[] = [
  // Google Ads
  {
    id: 'c-001', platform: 'google', name: 'Commercial Fryers — Search (Exact)', status: 'active',
    objective: 'conversions', dailyBudget: 420, totalBudget: 12600, spendToDate: 9847, budgetPacing: 96,
    impressions: 28400, clicks: 1842, ctr: 6.49, cpc: 5.34, conversions: 187, revenue: 89640, roas: 9.11, cpa: 52.66,
    qualityScore: 9, spendDelta: +4.2, roasDelta: +8.1, conversionsDelta: +11.4,
    startDate: '2026-04-01', adSets: 3, ads: 12, autoRulesFired: 4, store: 'donut-equipment.com',
  },
  {
    id: 'c-002', platform: 'google', name: 'Donut Supplies — Shopping', status: 'active',
    objective: 'catalog-sales', dailyBudget: 280, totalBudget: 8400, spendToDate: 6214, budgetPacing: 88,
    impressions: 142000, clicks: 4280, ctr: 3.01, cpc: 1.45, conversions: 312, revenue: 42840, roas: 6.90, cpa: 19.92,
    qualityScore: 7, spendDelta: +2.8, roasDelta: -1.4, conversionsDelta: +3.2,
    startDate: '2026-04-01', adSets: 4, ads: 1, autoRulesFired: 2, store: 'donut-supplies.com',
  },
  {
    id: 'c-003', platform: 'google', name: 'Bakery Wholesale — Brand', status: 'active',
    objective: 'conversions', dailyBudget: 140, totalBudget: 4200, spendToDate: 3128, budgetPacing: 99,
    impressions: 18400, clicks: 2104, ctr: 11.43, cpc: 1.49, conversions: 248, revenue: 67840, roas: 21.68, cpa: 12.61,
    qualityScore: 10, spendDelta: +1.1, roasDelta: +2.4, conversionsDelta: +4.8,
    startDate: '2026-03-01', adSets: 1, ads: 4, autoRulesFired: 0, store: 'bakery-wholesalers.com',
  },
  {
    id: 'c-004', platform: 'google', name: 'Competitors — Defense', status: 'paused',
    objective: 'traffic', dailyBudget: 80, totalBudget: 2400, spendToDate: 1847, budgetPacing: 62,
    impressions: 9200, clicks: 412, ctr: 4.48, cpc: 4.48, conversions: 28, revenue: 8120, roas: 4.40, cpa: 66.00,
    qualityScore: 5, spendDelta: 0, roasDelta: -12.4, conversionsDelta: -18.2,
    startDate: '2026-04-15', adSets: 1, ads: 3, autoRulesFired: 1, store: 'donut-equipment.com',
  },
  // Meta Ads
  {
    id: 'c-005', platform: 'meta', name: 'Donut Equipment — Prospecting (LAL)', status: 'active',
    objective: 'conversions', dailyBudget: 350, totalBudget: 10500, spendToDate: 8420, budgetPacing: 95,
    impressions: 284000, clicks: 3124, ctr: 1.10, cpc: 2.70, conversions: 218, revenue: 64780, roas: 7.69, cpa: 38.62,
    frequency: 2.8, spendDelta: +6.2, roasDelta: -3.1, conversionsDelta: -2.4,
    startDate: '2026-04-01', adSets: 4, ads: 18, autoRulesFired: 3, store: 'donut-equipment.com',
  },
  {
    id: 'c-006', platform: 'meta', name: 'Donut Supplies — Retargeting (30-Day)', status: 'active',
    objective: 'conversions', dailyBudget: 180, totalBudget: 5400, spendToDate: 3847, budgetPacing: 84,
    impressions: 84000, clicks: 1840, ctr: 2.19, cpc: 2.09, conversions: 187, revenue: 34280, roas: 8.91, cpa: 20.57,
    frequency: 4.8, spendDelta: +8.4, roasDelta: -8.3, conversionsDelta: -5.7,
    startDate: '2026-04-01', adSets: 2, ads: 8, autoRulesFired: 5, store: 'donut-supplies.com',
  },
  {
    id: 'c-007', platform: 'meta', name: 'Bakery Wholesale — B2B Lead Gen', status: 'learning',
    objective: 'leads', dailyBudget: 200, totalBudget: 3000, spendToDate: 1240, budgetPacing: 72,
    impressions: 48400, clicks: 842, ctr: 1.74, cpc: 1.47, conversions: 42, revenue: 18480, roas: 14.90, cpa: 29.52,
    frequency: 1.4, spendDelta: +41.2, roasDelta: 0, conversionsDelta: 0,
    startDate: '2026-05-05', adSets: 2, ads: 6, autoRulesFired: 0, store: 'bakery-wholesalers.com',
  },
  // YouTube
  {
    id: 'c-009', platform: 'youtube', name: 'Donut Equipment — In-Stream (Skippable)', status: 'active',
    objective: 'awareness', dailyBudget: 170, totalBudget: 5100, spendToDate: 3847, budgetPacing: 91,
    impressions: 218000, clicks: 2840, ctr: 1.30, cpc: 1.35, conversions: 148, revenue: 22480, roas: 5.84, cpa: 25.99,
    spendDelta: +14.2, roasDelta: +7.1, conversionsDelta: +21.8,
    startDate: '2026-04-01', adSets: 2, ads: 4, autoRulesFired: 1, store: 'donut-equipment.com',
  },
];

// Ad platforms not yet launched — kept as selectable/placeholder tabs in the UI,
// but with zero real campaigns behind them.
export const AD_PLATFORM_STARTED: Record<AdPlatform, boolean> = {
  google: true, meta: true, youtube: true,
  tiktok: false, linkedin: false, 'x-twitter': false,
};

// ─── Ad Sets (for campaign c-005 Meta example) ───────────────────────────────

export const SAMPLE_AD_SETS: AdSet[] = [
  {
    id: 'as-001', campaignId: 'c-005', name: 'LAL 2% — US Purchasers', status: 'active',
    audience: 'Lookalike 2% based on 180d purchasers', dailyBudget: 100, spend: 2420,
    impressions: 84000, clicks: 940, ctr: 1.12, conversions: 78, roas: 9.14, cpa: 31.03, frequency: 2.4,
  },
  {
    id: 'as-002', campaignId: 'c-005', name: 'Interest — Commercial Baking', status: 'active',
    audience: 'Interests: commercial baking, food service, restaurant equipment', dailyBudget: 80, spend: 1840,
    impressions: 94000, clicks: 984, ctr: 1.05, conversions: 54, roas: 6.22, cpa: 34.07, frequency: 2.8,
  },
  {
    id: 'as-003', campaignId: 'c-005', name: 'Broad — Auto Advantage+', status: 'active',
    audience: 'Advantage+ Audience (broad, Meta-optimized)', dailyBudget: 120, spend: 2840,
    impressions: 84000, clicks: 1040, ctr: 1.24, conversions: 68, roas: 7.41, cpa: 41.76, frequency: 3.1,
  },
  {
    id: 'as-004', campaignId: 'c-005', name: 'LAL 5% — Email List', status: 'paused',
    audience: 'Lookalike 5% based on email subscriber list', dailyBudget: 50, spend: 1320,
    impressions: 22000, clicks: 160, ctr: 0.73, conversions: 18, roas: 4.18, cpa: 73.33, frequency: 4.2,
  },
];

// ─── Creatives (A/B test for c-006) ──────────────────────────────────────────

export const SAMPLE_CREATIVES: Creative[] = [
  {
    id: 'cr-001', campaignId: 'c-006', name: 'Product Hero — White BG', type: 'image',
    status: 'winner', spend: 1240, impressions: 28400, clicks: 684, ctr: 2.41,
    conversions: 84, roas: 11.84, cpa: 14.76, daysRunning: 18, isControl: true,
  },
  {
    id: 'cr-002', campaignId: 'c-006', name: 'Lifestyle — Bakery Setting', type: 'image',
    status: 'active', spend: 1080, impressions: 24200, clicks: 580, ctr: 2.40,
    conversions: 68, roas: 10.42, cpa: 15.88, daysRunning: 18, isControl: false,
  },
  {
    id: 'cr-003', campaignId: 'c-006', name: 'Carousel — Product Range', type: 'carousel',
    status: 'loser', spend: 840, impressions: 18400, clicks: 368, ctr: 2.00,
    conversions: 32, roas: 6.84, cpa: 26.25, daysRunning: 18, isControl: false,
  },
  {
    id: 'cr-004', campaignId: 'c-006', name: 'UGC — Customer Testimonial Video', type: 'video',
    status: 'active', spend: 687, impressions: 13000, clicks: 208, ctr: 1.60,
    conversions: 3, roas: 2.80, cpa: 229.00, daysRunning: 4, isControl: false,
  },
];

// ─── Automation Rules ─────────────────────────────────────────────────────────

export const SAMPLE_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'ar-001', name: 'Pause ad sets with CPA > $80 (72h data)', platform: 'meta', enabled: true,
    trigger: 'CPA > $80.00', action: 'Pause ad set', condition: 'After 72h with 50+ clicks',
    lastFired: new Date(Date.now() - 6 * 3600000).toISOString(), fireCount: 3, status: 'triggered',
  },
  {
    id: 'ar-002', name: 'Scale budget +20% when ROAS > 8× (24h)', platform: 'meta', enabled: true,
    trigger: 'ROAS > 8.0×', action: 'Increase daily budget by 20%', condition: 'After 24h with 30+ conversions',
    lastFired: new Date(Date.now() - 2 * 3600000).toISOString(), fireCount: 7, status: 'triggered',
  },
  {
    id: 'ar-003', name: 'Pause when frequency > 5.0 (3-day window)', platform: 'meta', enabled: true,
    trigger: 'Ad frequency > 5.0', action: 'Pause ad, notify Slack', condition: '3-day rolling window',
    lastFired: new Date(Date.now() - 48 * 3600000).toISOString(), fireCount: 2, status: 'active',
  },
  {
    id: 'ar-004', name: 'Google: Raise bid +15% if CPC < $3 & CTR > 8%', platform: 'google', enabled: true,
    trigger: 'CPC < $3.00 AND CTR > 8%', action: 'Increase max CPC bid by 15%', condition: 'Daily check at 08:00 CT',
    lastFired: new Date(Date.now() - 16 * 3600000).toISOString(), fireCount: 4, status: 'active',
  },
  {
    id: 'ar-005', name: 'Google: Lower bid 20% if Quality Score ≤ 4', platform: 'google', enabled: true,
    trigger: 'Keyword Quality Score ≤ 4', action: 'Reduce max CPC bid by 20%', condition: 'Daily check',
    lastFired: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), fireCount: 1, status: 'active',
  },
];

// ─── Account Health Checks ────────────────────────────────────────────────────

export const SAMPLE_HEALTH_CHECKS: HealthCheckItem[] = [
  // Google
  { id: 'hc-001', platform: 'google', category: 'Quality', check: 'Average Quality Score', status: 'pass', detail: 'Avg QS 7.8/10 across active keywords — above 6.0 benchmark', priority: 'medium' },
  { id: 'hc-002', platform: 'google', category: 'Coverage', check: 'Search Impression Share', status: 'warn', detail: 'Brand terms at 84% — losing 16% to competitors. Increase brand bid or budget.', priority: 'high' },
  { id: 'hc-003', platform: 'google', category: 'Structure', check: 'Ad Group Size', status: 'pass', detail: 'All ad groups contain 15–20 keywords — within best practice range', priority: 'low' },
  { id: 'hc-004', platform: 'google', category: 'Assets', check: 'Responsive Search Ad Coverage', status: 'pass', detail: 'All ad groups have ≥1 RSA with "Good" or "Excellent" strength rating', priority: 'medium' },
  { id: 'hc-005', platform: 'google', category: 'Negatives', check: 'Negative Keyword List', status: 'warn', detail: '12 search terms found with 0 conversions and >$200 spend. Add as negatives.', priority: 'high' },
  { id: 'hc-006', platform: 'google', category: 'Conversions', check: 'Enhanced Conversions', status: 'pass', detail: 'Enhanced conversions enabled and verified — improves measurement by ~18%', priority: 'medium' },
  // Meta
  { id: 'hc-007', platform: 'meta', category: 'Pixel', check: 'Meta Pixel Health', status: 'pass', detail: 'All 3 stores firing correctly — Purchase, AddToCart, ViewContent events verified', priority: 'high' },
  { id: 'hc-008', platform: 'meta', category: 'Audiences', check: 'Custom Audience Freshness', status: 'warn', detail: '90-day website visitor audience has only 2,400 people — below 5,000 threshold for reliable delivery', priority: 'high' },
  { id: 'hc-009', platform: 'meta', category: 'Creative', check: 'Ad Creative Fatigue', status: 'fail', detail: 'Retargeting campaign: avg frequency 4.8 on 3 creatives running 18+ days. Refresh needed immediately.', priority: 'high' },
  { id: 'hc-010', platform: 'meta', category: 'Overlap', check: 'Audience Overlap', status: 'warn', detail: '62% overlap detected between LAL 2% and Interest ad sets — possible internal auction competition', priority: 'medium' },
  { id: 'hc-011', platform: 'meta', category: 'CAPI', check: 'Conversions API', status: 'pass', detail: 'Server-side CAPI active on all 3 stores — EMQ score 8.2/10', priority: 'high' },
  { id: 'hc-012', platform: 'meta', category: 'Policy', check: 'Ad Account Standing', status: 'pass', detail: 'Account in Good Standing — no active policy flags or restrictions', priority: 'high' },
];

// ─── A/B Tests ────────────────────────────────────────────────────────────────
// Variants are transitively store-scoped via their parent campaign's `store`
// field (matched by `campaign` name here) — no own store field needed.

export type ABStatus = 'running' | 'winner_found' | 'paused' | 'scheduled';
export interface ABVariant { id: string; label: string; name: string; impressions: number; ctr: number; cpa: number; roas: number; spend: number; isWinner?: boolean; autoPaused?: boolean }
export interface ABTest {
  id: string;
  name: string;
  campaign: string;
  platform: 'Meta' | 'Google';
  status: ABStatus;
  confidence: number;
  startDate: string;
  endDate?: string;
  variants: ABVariant[];
  metric: string;
}

export const SAMPLE_AB_TESTS: ABTest[] = [
  {
    id: 'ab-001', name: 'Donut Fryer — Headline Copy', campaign: 'Spring Sale — Donut Equipment', platform: 'Meta', status: 'winner_found',
    confidence: 97, startDate: '2026-05-01', endDate: '2026-05-10', metric: 'CPA',
    variants: [
      { id: 'v1', label: 'Control',    name: 'Shop Pro Donut Fryers — Free Shipping', impressions: 42800, ctr: 2.1, cpa: 38.40, roas: 4.2, spend: 1840 },
      { id: 'v2', label: 'Challenger', name: 'Get Commercial-Grade Donuts Ready in 90 Sec', impressions: 43200, ctr: 3.4, cpa: 24.80, roas: 6.1, spend: 1790, isWinner: true },
    ],
  },
  {
    id: 'ab-002', name: 'Glaze Kit — Creative Format', campaign: 'Bakery Wholesale — Supplies', platform: 'Meta', status: 'running',
    confidence: 72, startDate: '2026-05-08', metric: 'ROAS',
    variants: [
      { id: 'v1', label: 'Control',    name: 'Static Image — Product on White', impressions: 18400, ctr: 1.8, cpa: 44.20, roas: 3.8, spend: 920 },
      { id: 'v2', label: 'Challenger', name: 'Video — 15-sec Recipe Demo',       impressions: 19100, ctr: 2.3, cpa: 39.60, roas: 4.2, spend: 890 },
    ],
  },
  {
    id: 'ab-003', name: 'Equipment — Audience Targeting', campaign: 'Google — Branded Search', platform: 'Google', status: 'running',
    confidence: 61, startDate: '2026-05-06', metric: 'CTR',
    variants: [
      { id: 'v1', label: 'Control',    name: 'Broad Match + Smart Bidding', impressions: 28600, ctr: 3.9, cpa: 52.10, roas: 3.1, spend: 1420 },
      { id: 'v2', label: 'Challenger', name: 'Exact Match + Target CPA',    impressions: 27200, ctr: 5.1, cpa: 41.80, roas: 3.9, spend: 1380 },
    ],
  },
  {
    id: 'ab-004', name: 'Wholesale — CTA Button Text', campaign: 'Bakery Wholesale — Retargeting', platform: 'Meta', status: 'paused',
    confidence: 45, startDate: '2026-04-28', endDate: '2026-05-05', metric: 'CTR',
    variants: [
      { id: 'v1', label: 'Control',    name: '"Shop Now"',   impressions: 8400,  ctr: 1.2, cpa: 61.40, roas: 2.8, spend: 480, autoPaused: true },
      { id: 'v2', label: 'Challenger', name: '"Get a Quote"', impressions: 8100, ctr: 1.6, cpa: 55.20, roas: 3.1, spend: 470 },
    ],
  },
];

// ─── Audience Overlap ─────────────────────────────────────────────────────────
// Platform/ad-account-level analysis, not tied to a single store — same
// exception class as AutomationRule/HealthCheckItem above.

export interface AudienceOverlap {
  id: string;
  set1: string;
  set2: string;
  campaign1: string;
  campaign2: string;
  overlapPct: number;
  platform: 'Meta' | 'Google';
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export const SAMPLE_AUDIENCE_OVERLAPS: AudienceOverlap[] = [
  { id: 'ov-1', set1: 'Lookalike 1% — Purchasers', set2: 'Lookalike 2% — Purchasers', campaign1: 'Spring Sale — Equipment', campaign2: 'Retargeting — Equipment', overlapPct: 68, platform: 'Meta', impact: 'high', recommendation: 'Exclude Lookalike 1% from the Retargeting campaign to stop internal auction competition.' },
  { id: 'ov-2', set1: 'Website Visitors 30d', set2: 'Website Visitors 60d', campaign1: 'Retargeting — Supplies', campaign2: 'Awareness — Supplies', overlapPct: 84, platform: 'Meta', impact: 'high', recommendation: 'Add "Website Visitors 30d" as an exclusion to the Awareness campaign audience.' },
  { id: 'ov-3', set1: 'Interest: Commercial Baking', set2: 'Interest: Food Manufacturing', campaign1: 'Awareness — Wholesale', campaign2: 'Prospecting — Equipment', overlapPct: 42, platform: 'Meta', impact: 'medium', recommendation: 'Consider consolidating these interests into a single campaign to avoid bid inflation.' },
  { id: 'ov-4', set1: 'Customer Match — All Customers', set2: 'In-Market: Commercial Kitchen', campaign1: 'RLSA — Google', campaign2: 'Prospecting — Google', overlapPct: 31, platform: 'Google', impact: 'low', recommendation: 'Low overlap — no action needed. Monitor if campaigns scale.' },
  { id: 'ov-5', set1: 'Cart Abandoners 14d', set2: 'Cart Abandoners 30d', campaign1: 'Cart Recovery — Meta', campaign2: 'Retargeting — Equipment', overlapPct: 76, platform: 'Meta', impact: 'high', recommendation: 'Exclude Cart Abandoners 14d from the broader 30d retargeting campaign.' },
];

// ─── Negative Keywords (Google account-level) ────────────────────────────────

export type MatchType = 'exact' | 'phrase' | 'broad';
export interface NegKeyword { id: string; keyword: string; matchType: MatchType; campaign: string; addedDate: string; impressionsBlocked?: number }
export interface NegKeywordSuggestion { keyword: string; matchType: MatchType; reason: string }

export const NEG_KEYWORD_CAMPAIGNS = ['Google — Branded Search', 'Google — Competitor Conquest', 'Google — Shopping — Equipment', 'Google — Shopping — Supplies', 'Google — Display Retargeting'];

export const SAMPLE_NEG_KEYWORDS: NegKeyword[] = [
  { id: 'nk-1',  keyword: 'free',           matchType: 'broad',  campaign: 'Google — Branded Search',       addedDate: '2026-04-10', impressionsBlocked: 8420 },
  { id: 'nk-2',  keyword: 'diy donut',       matchType: 'phrase', campaign: 'Google — Branded Search',       addedDate: '2026-04-10', impressionsBlocked: 2140 },
  { id: 'nk-3',  keyword: 'home donut maker', matchType: 'exact', campaign: 'Google — Shopping — Equipment', addedDate: '2026-04-15', impressionsBlocked: 4870 },
  { id: 'nk-4',  keyword: 'recipe',          matchType: 'broad',  campaign: 'Google — Shopping — Supplies',  addedDate: '2026-04-20', impressionsBlocked: 12300 },
  { id: 'nk-5',  keyword: 'how to make',     matchType: 'phrase', campaign: 'Google — Shopping — Supplies',  addedDate: '2026-04-20', impressionsBlocked: 6800 },
  { id: 'nk-6',  keyword: 'donut shop near me', matchType: 'phrase', campaign: 'Google — Competitor Conquest', addedDate: '2026-04-22', impressionsBlocked: 9400 },
  { id: 'nk-7',  keyword: 'retail',          matchType: 'broad',  campaign: 'Google — Shopping — Equipment', addedDate: '2026-04-25', impressionsBlocked: 3200 },
  { id: 'nk-8',  keyword: 'used equipment',  matchType: 'phrase', campaign: 'Google — Shopping — Equipment', addedDate: '2026-04-28', impressionsBlocked: 5600 },
];

export const SAMPLE_NEG_KEYWORD_SUGGESTIONS: NegKeywordSuggestion[] = [
  { keyword: 'cheap', matchType: 'broad', reason: 'Attracts low-intent traffic unlikely to convert at commercial pricing.' },
  { keyword: 'repair', matchType: 'phrase', reason: 'Triggers for service queries — irrelevant to new equipment sales.' },
  { keyword: 'small batch', matchType: 'phrase', reason: 'Indicates hobbyist intent, not commercial buyers.' },
  { keyword: 'rent', matchType: 'exact', reason: 'Equipment rental queries waste spend on purchase campaigns.' },
];

// ─── Computed Totals ──────────────────────────────────────────────────────────
//
// Computed from whatever campaigns/health checks currently exist (empty by
// default, or seeded via Load Sample Data) rather than hardcoded, so totals
// are always accurate and never drift from the underlying records.

export function computeCampaignTotals(campaigns: Campaign[], healthChecks: HealthCheckItem[]) {
  return {
    totalSpend:       campaigns.reduce((s, c) => s + c.spendToDate, 0),
    totalRevenue:     campaigns.reduce((s, c) => s + c.revenue, 0),
    totalConversions: campaigns.reduce((s, c) => s + c.conversions, 0),
    totalImpressions: campaigns.reduce((s, c) => s + c.impressions, 0),
    activeCampaigns:  campaigns.filter(c => c.status === 'active').length,
    totalCampaigns:   campaigns.length,
    healthIssues:     healthChecks.filter(h => h.status !== 'pass').length,
  };
}
