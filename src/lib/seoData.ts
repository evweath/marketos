// ─── SEO Types & Mock Data ────────────────────────────────────────────────────

export type StoreId = 'donut-equipment' | 'donut-supplies' | 'bakery-wholesalers';
export type RankCategory = 'top3' | 'top10' | 'top30' | 'beyond';
export type AuditCategory = 'meta' | 'headings' | 'content' | 'technical' | 'links';
export type AuditStatus = 'ok' | 'warn' | 'error';
export type ImpactLevel = 'high' | 'medium' | 'low';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type MentionSource = 'web' | 'social' | 'news';
export type LlmProvider = 'ChatGPT' | 'Gemini' | 'Claude' | 'Perplexity';
export type DateRange = '7d' | '30d' | '90d';

// ─── Keyword Rankings ─────────────────────────────────────────────────────────

export interface TrendPoint {
  day: number;
  position: number;
}

export interface KeywordRanking {
  id: string;
  keyword: string;
  store: StoreId;
  rank: number;
  previousRank: number;
  change: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  url: string;
  trend: TrendPoint[];  // 30 days of position data
}

function genTrend(endRank: number, startRank: number): TrendPoint[] {
  const points: TrendPoint[] = [];
  let s = endRank * 1337 + startRank * 7;
  for (let i = 0; i < 30; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const noise = ((s >>> 0) % 6) - 3;
    const interp = startRank + ((endRank - startRank) * i) / 29;
    points.push({ day: i + 1, position: Math.max(1, Math.round(interp + noise)) });
  }
  return points;
}

export const KEYWORD_RANKINGS: KeywordRanking[] = [
  {
    id: 'kw-001', keyword: 'commercial donut fryer', store: 'donut-equipment',
    rank: 2, previousRank: 5, change: +3, searchVolume: 8400, difficulty: 52, cpc: 3.40,
    url: '/products/commercial-donut-fryers', trend: genTrend(2, 5),
  },
  {
    id: 'kw-002', keyword: 'donut glazing machine', store: 'donut-equipment',
    rank: 1, previousRank: 1, change: 0, searchVolume: 3600, difficulty: 38, cpc: 2.85,
    url: '/products/donut-glazing-machines', trend: genTrend(1, 1),
  },
  {
    id: 'kw-003', keyword: 'automatic donut maker', store: 'donut-equipment',
    rank: 7, previousRank: 12, change: +5, searchVolume: 14800, difficulty: 68, cpc: 1.95,
    url: '/products/automatic-donut-makers', trend: genTrend(7, 12),
  },
  {
    id: 'kw-004', keyword: 'donut fryer machine price', store: 'donut-equipment',
    rank: 14, previousRank: 10, change: -4, searchVolume: 5200, difficulty: 45, cpc: 2.10,
    url: '/products/commercial-donut-fryers', trend: genTrend(14, 10),
  },
  {
    id: 'kw-005', keyword: 'donut depositor machine', store: 'donut-equipment',
    rank: 3, previousRank: 4, change: +1, searchVolume: 2900, difficulty: 41, cpc: 3.75,
    url: '/products/donut-depositors', trend: genTrend(3, 4),
  },
  {
    id: 'kw-006', keyword: 'wholesale donut mix', store: 'donut-supplies',
    rank: 9, previousRank: 15, change: +6, searchVolume: 6700, difficulty: 55, cpc: 1.40,
    url: '/products/donut-mix-wholesale', trend: genTrend(9, 15),
  },
  {
    id: 'kw-007', keyword: 'bulk donut glaze powder', store: 'donut-supplies',
    rank: 4, previousRank: 3, change: -1, searchVolume: 2100, difficulty: 33, cpc: 1.85,
    url: '/products/glaze-powder-bulk', trend: genTrend(4, 3),
  },
  {
    id: 'kw-008', keyword: 'commercial fry shortening food service', store: 'donut-supplies',
    rank: 18, previousRank: 22, change: +4, searchVolume: 3800, difficulty: 62, cpc: 1.65,
    url: '/products/fry-shortening', trend: genTrend(18, 22),
  },
  {
    id: 'kw-009', keyword: 'donut box packaging wholesale', store: 'donut-supplies',
    rank: 6, previousRank: 6, change: 0, searchVolume: 4500, difficulty: 49, cpc: 1.20,
    url: '/products/donut-packaging', trend: genTrend(6, 6),
  },
  {
    id: 'kw-010', keyword: 'bakery flour bulk purchase', store: 'bakery-wholesalers',
    rank: 11, previousRank: 8, change: -3, searchVolume: 9200, difficulty: 71, cpc: 0.95,
    url: '/products/bulk-flour', trend: genTrend(11, 8),
  },
  {
    id: 'kw-011', keyword: 'wholesale baking ingredients supplier', store: 'bakery-wholesalers',
    rank: 5, previousRank: 9, change: +4, searchVolume: 7300, difficulty: 66, cpc: 2.30,
    url: '/wholesale-ingredients', trend: genTrend(5, 9),
  },
  {
    id: 'kw-012', keyword: 'commercial bakery supplies near me', store: 'bakery-wholesalers',
    rank: 2, previousRank: 3, change: +1, searchVolume: 12400, difficulty: 58, cpc: 2.80,
    url: '/bakery-supplies', trend: genTrend(2, 3),
  },
  {
    id: 'kw-013', keyword: 'sugar fondant wholesale', store: 'bakery-wholesalers',
    rank: 23, previousRank: 31, change: +8, searchVolume: 1800, difficulty: 29, cpc: 1.55,
    url: '/products/fondant-wholesale', trend: genTrend(23, 31),
  },
  {
    id: 'kw-014', keyword: 'industrial dough mixer', store: 'donut-equipment',
    rank: 38, previousRank: 34, change: -4, searchVolume: 5600, difficulty: 74, cpc: 4.10,
    url: '/products/industrial-mixers', trend: genTrend(38, 34),
  },
  {
    id: 'kw-015', keyword: 'donut proofing cabinet commercial', store: 'donut-equipment',
    rank: 8, previousRank: 11, change: +3, searchVolume: 1400, difficulty: 36, cpc: 3.20,
    url: '/products/proofing-cabinets', trend: genTrend(8, 11),
  },
  {
    id: 'kw-016', keyword: 'bulk vanilla extract baking', store: 'donut-supplies',
    rank: 12, previousRank: 12, change: 0, searchVolume: 3200, difficulty: 43, cpc: 1.10,
    url: '/products/vanilla-extract-bulk', trend: genTrend(12, 12),
  },
  {
    id: 'kw-017', keyword: 'bakery packaging boxes bulk', store: 'bakery-wholesalers',
    rank: 1, previousRank: 2, change: +1, searchVolume: 8900, difficulty: 47, cpc: 1.75,
    url: '/products/bakery-boxes', trend: genTrend(1, 2),
  },
];

// ─── GSC Metrics ──────────────────────────────────────────────────────────────

export interface GscTopPage {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscTopQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscDatePoint {
  date: string;
  clicks: number;
  impressions: number;
}

export interface GscPeriodMetrics {
  clicks: number;
  impressions: number;
  avgCtr: number;
  avgPosition: number;
  clicksDelta: number;
  impressionsDelta: number;
  ctrDelta: number;
  positionDelta: number;
  series: GscDatePoint[];
}

export interface GscStoreMetrics {
  store: StoreId;
  '7d': GscPeriodMetrics;
  '30d': GscPeriodMetrics;
  '90d': GscPeriodMetrics;
  topPages: GscTopPage[];
  topQueries: GscTopQuery[];
}

function genGscSeries(days: number, baseClicks: number, baseImpressions: number): GscDatePoint[] {
  const result: GscDatePoint[] = [];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let s = baseClicks * 31 + days;
  const now = new Date('2026-05-11');
  for (let i = days - 1; i >= 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const noise = ((s >>> 0) % 300 - 150) / 1000;
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const wkd = [0, 6].includes(d.getDay()) ? 0.72 : 1;
    result.push({
      date: `${months[d.getMonth()]} ${d.getDate()}`,
      clicks: Math.max(0, Math.round(baseClicks / days * (1 + noise) * wkd)),
      impressions: Math.max(0, Math.round(baseImpressions / days * (1 + noise * 0.8) * wkd)),
    });
  }
  return result;
}

export const GSC_METRICS: GscStoreMetrics[] = [
  {
    store: 'donut-equipment',
    '7d': {
      clicks: 3240, impressions: 84600, avgCtr: 3.83, avgPosition: 6.2,
      clicksDelta: +9.4, impressionsDelta: +6.1, ctrDelta: +0.31, positionDelta: -0.8,
      series: genGscSeries(7, 3240, 84600),
    },
    '30d': {
      clicks: 13820, impressions: 362400, avgCtr: 3.81, avgPosition: 6.4,
      clicksDelta: +11.2, impressionsDelta: +8.7, ctrDelta: +0.18, positionDelta: -1.1,
      series: genGscSeries(30, 13820, 362400),
    },
    '90d': {
      clicks: 39600, impressions: 1040000, avgCtr: 3.81, avgPosition: 6.8,
      clicksDelta: +18.4, impressionsDelta: +14.2, ctrDelta: +0.22, positionDelta: -1.8,
      series: genGscSeries(90, 39600, 1040000),
    },
    topPages: [
      { url: '/products/commercial-donut-fryers', clicks: 2840, impressions: 64200, ctr: 4.42, position: 2.1 },
      { url: '/products/automatic-donut-makers',  clicks: 1920, impressions: 48700, ctr: 3.94, position: 7.3 },
      { url: '/products/donut-glazing-machines',  clicks: 1640, impressions: 32100, ctr: 5.11, position: 1.4 },
      { url: '/products/donut-depositors',        clicks: 1280, impressions: 28800, ctr: 4.44, position: 3.2 },
      { url: '/products/proofing-cabinets',       clicks:  980, impressions: 22400, ctr: 4.38, position: 8.1 },
    ],
    topQueries: [
      { query: 'commercial donut fryer',       clicks: 1840, impressions: 42000, ctr: 4.38, position: 2.0 },
      { query: 'donut glazing machine',         clicks: 1420, impressions: 28600, ctr: 4.97, position: 1.4 },
      { query: 'automatic donut maker',         clicks:  980, impressions: 29400, ctr: 3.33, position: 7.1 },
      { query: 'donut depositor commercial',    clicks:  840, impressions: 19800, ctr: 4.24, position: 3.6 },
      { query: 'best commercial donut machine', clicks:  720, impressions: 22100, ctr: 3.26, position: 9.4 },
    ],
  },
  {
    store: 'donut-supplies',
    '7d': {
      clicks: 2180, impressions: 58400, avgCtr: 3.73, avgPosition: 8.1,
      clicksDelta: +5.2, impressionsDelta: +3.4, ctrDelta: +0.14, positionDelta: -0.4,
      series: genGscSeries(7, 2180, 58400),
    },
    '30d': {
      clicks: 9640, impressions: 248000, avgCtr: 3.89, avgPosition: 7.9,
      clicksDelta: +7.8, impressionsDelta: +5.1, ctrDelta: +0.21, positionDelta: -0.7,
      series: genGscSeries(30, 9640, 248000),
    },
    '90d': {
      clicks: 27800, impressions: 714000, avgCtr: 3.89, avgPosition: 8.2,
      clicksDelta: +12.4, impressionsDelta: +9.8, ctrDelta: +0.18, positionDelta: -1.1,
      series: genGscSeries(90, 27800, 714000),
    },
    topPages: [
      { url: '/products/donut-mix-wholesale',   clicks: 1840, impressions: 42000, ctr: 4.38, position: 9.2 },
      { url: '/products/glaze-powder-bulk',      clicks: 1320, impressions: 28600, ctr: 4.62, position: 4.1 },
      { url: '/products/donut-packaging',        clicks: 1120, impressions: 26800, ctr: 4.18, position: 6.3 },
      { url: '/products/fry-shortening',         clicks:  840, impressions: 24600, ctr: 3.41, position: 18.4 },
      { url: '/products/vanilla-extract-bulk',   clicks:  680, impressions: 18400, ctr: 3.70, position: 12.2 },
    ],
    topQueries: [
      { query: 'wholesale donut mix',            clicks: 1240, impressions: 32100, ctr: 3.86, position: 9.1 },
      { query: 'bulk donut glaze powder',         clicks:  980, impressions: 21400, ctr: 4.58, position: 4.0 },
      { query: 'donut packaging wholesale',       clicks:  820, impressions: 19800, ctr: 4.14, position: 6.1 },
      { query: 'commercial fry shortening',       clicks:  640, impressions: 22600, ctr: 2.83, position: 17.8 },
      { query: 'bulk vanilla extract food grade', clicks:  480, impressions: 16200, ctr: 2.96, position: 11.9 },
    ],
  },
  {
    store: 'bakery-wholesalers',
    '7d': {
      clicks: 4120, impressions: 102000, avgCtr: 4.04, avgPosition: 4.8,
      clicksDelta: +13.1, impressionsDelta: +10.2, ctrDelta: +0.41, positionDelta: -1.2,
      series: genGscSeries(7, 4120, 102000),
    },
    '30d': {
      clicks: 17640, impressions: 438000, avgCtr: 4.03, avgPosition: 5.1,
      clicksDelta: +15.4, impressionsDelta: +12.8, ctrDelta: +0.38, positionDelta: -1.4,
      series: genGscSeries(30, 17640, 438000),
    },
    '90d': {
      clicks: 50400, impressions: 1260000, avgCtr: 4.00, avgPosition: 5.5,
      clicksDelta: +22.1, impressionsDelta: +18.6, ctrDelta: +0.31, positionDelta: -2.1,
      series: genGscSeries(90, 50400, 1260000),
    },
    topPages: [
      { url: '/products/bakery-boxes',           clicks: 3480, impressions: 72400, ctr: 4.81, position: 1.2 },
      { url: '/wholesale-ingredients',            clicks: 2840, impressions: 64800, ctr: 4.38, position: 5.2 },
      { url: '/bakery-supplies',                  clicks: 2340, impressions: 58200, ctr: 4.02, position: 2.1 },
      { url: '/products/bulk-flour',              clicks: 1960, impressions: 51400, ctr: 3.81, position: 11.4 },
      { url: '/products/fondant-wholesale',       clicks:  820, impressions: 22800, ctr: 3.60, position: 23.1 },
    ],
    topQueries: [
      { query: 'bakery packaging boxes bulk',     clicks: 2840, impressions: 58000, ctr: 4.90, position: 1.1 },
      { query: 'commercial bakery supplies',       clicks: 2180, impressions: 54200, ctr: 4.02, position: 2.4 },
      { query: 'wholesale baking ingredients',     clicks: 1840, impressions: 46800, ctr: 3.93, position: 5.1 },
      { query: 'bakery flour bulk',                clicks: 1420, impressions: 38600, ctr: 3.68, position: 11.2 },
      { query: 'sugar fondant wholesale supplier', clicks:  620, impressions: 18400, ctr: 3.37, position: 22.8 },
    ],
  },
];

// ─── SEO Audit Items ──────────────────────────────────────────────────────────

export interface SeoAuditItem {
  id: string;
  category: AuditCategory;
  status: AuditStatus;
  impact: ImpactLevel;
  page: string;
  issue: string;
  detail: string;
}

export const SEO_AUDIT_ITEMS: SeoAuditItem[] = [
  {
    id: 'audit-001', category: 'meta', status: 'error', impact: 'high',
    page: '/products/industrial-mixers',
    issue: 'Missing meta description',
    detail: 'Page has no meta description tag. Google will auto-generate one, reducing CTR by an estimated 20-30%.',
  },
  {
    id: 'audit-002', category: 'meta', status: 'warn', impact: 'medium',
    page: '/products/fry-shortening',
    issue: 'Title tag too long (74 chars)',
    detail: 'Title is 74 characters, exceeding the 60-char recommended limit. It will be truncated in SERPs.',
  },
  {
    id: 'audit-003', category: 'meta', status: 'ok', impact: 'low',
    page: '/products/commercial-donut-fryers',
    issue: 'Meta description within optimal range',
    detail: 'Meta description is 152 characters — within the 150-160 char optimal range.',
  },
  {
    id: 'audit-004', category: 'meta', status: 'error', impact: 'high',
    page: '/wholesale-ingredients',
    issue: 'Duplicate title tag',
    detail: 'Title tag "Wholesale Baking Ingredients" is used on 3 other pages. Consolidate or differentiate.',
  },
  {
    id: 'audit-005', category: 'headings', status: 'error', impact: 'high',
    page: '/products/donut-packaging',
    issue: 'Multiple H1 tags (3 found)',
    detail: 'Page contains 3 H1 tags. Only one H1 should exist per page for clear semantic hierarchy.',
  },
  {
    id: 'audit-006', category: 'headings', status: 'warn', impact: 'medium',
    page: '/bakery-supplies',
    issue: 'H2 skipped — H3 used directly after H1',
    detail: 'Heading hierarchy jumps from H1 to H3 in the features section. Add H2 wrappers for proper structure.',
  },
  {
    id: 'audit-007', category: 'headings', status: 'ok', impact: 'low',
    page: '/products/donut-glazing-machines',
    issue: 'Heading structure is correct',
    detail: 'H1 → H2 → H3 hierarchy is properly nested with keyword-rich headings.',
  },
  {
    id: 'audit-008', category: 'content', status: 'warn', impact: 'high',
    page: '/products/proofing-cabinets',
    issue: 'Thin content — 248 words',
    detail: 'Page has only 248 words. Competing top-10 pages average 1,200+ words. Expand with specs, FAQs, and use cases.',
  },
  {
    id: 'audit-009', category: 'content', status: 'warn', impact: 'medium',
    page: '/products/vanilla-extract-bulk',
    issue: 'Target keyword density too low (0.3%)',
    detail: '"Bulk vanilla extract" appears only once in the body. Aim for 1.0-1.5% density without stuffing.',
  },
  {
    id: 'audit-010', category: 'content', status: 'ok', impact: 'medium',
    page: '/products/commercial-donut-fryers',
    issue: 'Content length and keyword density optimal',
    detail: 'Page has 1,840 words with 1.2% keyword density. Images have alt tags. Reading level is Grade 9.',
  },
  {
    id: 'audit-011', category: 'content', status: 'error', impact: 'high',
    page: '/products/bulk-flour',
    issue: 'No structured data / schema markup',
    detail: 'Product page is missing JSON-LD Schema.org markup. Adding Product schema can unlock rich result features.',
  },
  {
    id: 'audit-012', category: 'technical', status: 'error', impact: 'high',
    page: '/products/industrial-mixers',
    issue: 'Page load time 6.4s (Core Web Vitals fail)',
    detail: 'LCP is 6.4s — far above the 2.5s threshold. Largest image (1.8MB hero) is not compressed or lazy-loaded.',
  },
  {
    id: 'audit-013', category: 'technical', status: 'warn', impact: 'high',
    page: '/bakery-supplies',
    issue: 'Missing canonical tag',
    detail: 'Page is accessible via 3 URLs (/bakery-supplies, /bakery-supplies/, /en/bakery-supplies). Add canonical to prevent duplicate content penalties.',
  },
  {
    id: 'audit-014', category: 'technical', status: 'ok', impact: 'medium',
    page: '/wholesale-ingredients',
    issue: 'Sitemap includes this page',
    detail: 'Page is correctly included in sitemap.xml with proper lastmod and changefreq.',
  },
  {
    id: 'audit-015', category: 'technical', status: 'warn', impact: 'medium',
    page: '/products/donut-depositors',
    issue: 'Mobile viewport not optimised',
    detail: 'Product image gallery overflows on 375px screens. CLS score is 0.18 (above 0.1 threshold).',
  },
  {
    id: 'audit-016', category: 'technical', status: 'error', impact: 'high',
    page: '/products/glaze-powder-bulk',
    issue: '404 — referenced in internal links',
    detail: 'Page /products/glaze-powder-bulk/reviews returns 404 but 12 internal links point to it.',
  },
  {
    id: 'audit-017', category: 'links', status: 'error', impact: 'high',
    page: '/products/donut-mix-wholesale',
    issue: '3 broken outbound links',
    detail: 'Links to fda.gov and usda.gov regulatory pages return 301 chains and one 404. Update all three.',
  },
  {
    id: 'audit-018', category: 'links', status: 'warn', impact: 'medium',
    page: '/products/fry-shortening',
    issue: 'No internal links to this page',
    detail: 'Page receives zero internal links. It is an SEO orphan. Add links from related category and blog pages.',
  },
  {
    id: 'audit-019', category: 'links', status: 'ok', impact: 'low',
    page: '/products/commercial-donut-fryers',
    issue: 'Internal linking is healthy',
    detail: 'Page receives 14 internal links from relevant category pages and blog posts.',
  },
  {
    id: 'audit-020', category: 'links', status: 'warn', impact: 'medium',
    page: '/bakery-supplies',
    issue: 'Anchor text is generic ("click here" x4)',
    detail: '4 outbound links use the anchor text "click here" — replace with descriptive, keyword-rich anchors.',
  },
  {
    id: 'audit-021', category: 'meta', status: 'warn', impact: 'low',
    page: '/products/donut-depositors',
    issue: 'Open Graph image missing',
    detail: 'No og:image tag — social media previews will use a fallback or no image, reducing click-through.',
  },
  {
    id: 'audit-022', category: 'technical', status: 'ok', impact: 'high',
    page: '/products/automatic-donut-makers',
    issue: 'HTTPS and www redirect configured correctly',
    detail: 'All HTTP → HTTPS and non-www → www redirects resolve in a single hop with 301 status.',
  },
];

// ─── Competitor Data ──────────────────────────────────────────────────────────

export type CompetitorChangeType = 'price' | 'product' | 'content';

export interface CompetitorChange {
  id: string;
  type: CompetitorChangeType;
  what: string;
  oldValue?: string;
  newValue?: string;
  page: string;
  severity: 'high' | 'medium' | 'low';
  detectedAt: string;
}

export interface CompetitorData {
  id: string;
  domain: string;
  displayName: string;
  lastChecked: string;
  totalChanges: number;
  weeklyChanges: number;
  changes: CompetitorChange[];
}

export const COMPETITOR_DATA: CompetitorData[] = [
  {
    id: 'comp-001',
    domain: 'bakeryequipmentpro.com',
    displayName: 'Bakery Equipment Pro',
    lastChecked: '2026-05-11T08:42:00Z',
    totalChanges: 14,
    weeklyChanges: 6,
    changes: [
      {
        id: 'cc-001', type: 'price', what: 'Commercial Donut Fryer DF-400 price dropped',
        oldValue: '$4,299', newValue: '$3,849', page: '/products/df-400-fryer',
        severity: 'high', detectedAt: '2026-05-10T14:22:00Z',
      },
      {
        id: 'cc-002', type: 'price', what: 'Industrial Dough Mixer DM-80 price increase',
        oldValue: '$2,150', newValue: '$2,395', page: '/products/dm-80-mixer',
        severity: 'medium', detectedAt: '2026-05-09T09:11:00Z',
      },
      {
        id: 'cc-003', type: 'product', what: 'New product listed: Automated Donut Finisher AF-12',
        oldValue: undefined, newValue: '$6,899', page: '/products/af-12-finisher',
        severity: 'high', detectedAt: '2026-05-08T16:40:00Z',
      },
      {
        id: 'cc-004', type: 'content', what: 'Homepage hero updated — "Summer Sale 20% Off" banner',
        oldValue: 'Spring Deals', newValue: 'Summer Sale 20% Off', page: '/',
        severity: 'medium', detectedAt: '2026-05-07T11:30:00Z',
      },
      {
        id: 'cc-005', type: 'content', what: 'Added customer testimonials section',
        oldValue: undefined, newValue: '12 new testimonials added', page: '/about',
        severity: 'low', detectedAt: '2026-05-06T08:15:00Z',
      },
      {
        id: 'cc-006', type: 'price', what: 'Donut Glazing Unit GU-200 — free shipping added',
        oldValue: '$85 shipping', newValue: 'Free shipping', page: '/products/gu-200',
        severity: 'high', detectedAt: '2026-05-05T13:55:00Z',
      },
    ],
  },
  {
    id: 'comp-002',
    domain: 'wholesalebakingsupplies.com',
    displayName: 'Wholesale Baking Supplies',
    lastChecked: '2026-05-11T08:44:00Z',
    totalChanges: 9,
    weeklyChanges: 4,
    changes: [
      {
        id: 'cc-007', type: 'product', what: 'New SKU: Organic Donut Mix 50lb bag',
        oldValue: undefined, newValue: '$78.99', page: '/products/organic-donut-mix-50lb',
        severity: 'high', detectedAt: '2026-05-10T10:18:00Z',
      },
      {
        id: 'cc-008', type: 'price', what: 'Bulk Glaze Powder 25kg price cut',
        oldValue: '$124', newValue: '$109', page: '/products/glaze-powder-25kg',
        severity: 'high', detectedAt: '2026-05-09T14:02:00Z',
      },
      {
        id: 'cc-009', type: 'content', what: 'New blog post: "Top 10 Donut Trends 2026"',
        oldValue: undefined, newValue: '1,800 word article published', page: '/blog/donut-trends-2026',
        severity: 'medium', detectedAt: '2026-05-08T09:00:00Z',
      },
      {
        id: 'cc-010', type: 'price', what: 'Fry shortening 50lb case — price increase',
        oldValue: '$89', newValue: '$97', page: '/products/fry-shortening-50lb',
        severity: 'medium', detectedAt: '2026-05-07T15:30:00Z',
      },
    ],
  },
  {
    id: 'comp-003',
    domain: 'commercialbakeryoutlet.com',
    displayName: 'Commercial Bakery Outlet',
    lastChecked: '2026-05-11T08:46:00Z',
    totalChanges: 5,
    weeklyChanges: 2,
    changes: [
      {
        id: 'cc-011', type: 'content', what: 'Category page rewrite: Commercial Fryers',
        oldValue: '320 words', newValue: '1,240 words with FAQ schema', page: '/commercial-fryers',
        severity: 'high', detectedAt: '2026-05-09T11:20:00Z',
      },
      {
        id: 'cc-012', type: 'product', what: 'Discontinued: Mini Donut Machine MD-6',
        oldValue: '$1,299', newValue: 'Out of stock / removed', page: '/products/md-6',
        severity: 'low', detectedAt: '2026-05-08T14:45:00Z',
      },
    ],
  },
];

// ─── Brand Mentions ───────────────────────────────────────────────────────────

export interface BrandMention {
  id: string;
  source: MentionSource;
  platform: string;
  author: string;
  content: string;
  sentiment: Sentiment;
  reach: number;
  url: string;
  timeAgo: string;
}

export const BRAND_MENTIONS: BrandMention[] = [
  {
    id: 'bm-001', source: 'social', platform: 'Reddit', author: 'u/BakeryNerd_PDX',
    content: 'Just got our new commercial donut fryer from donut-equipment.com — setup took 20 minutes and the output is incredible. 150 donuts/hr without breaking a sweat.',
    sentiment: 'positive', reach: 8400, url: 'https://reddit.com/r/bakery', timeAgo: '2h ago',
  },
  {
    id: 'bm-002', source: 'news', platform: 'BakeryMag',
    author: 'Sarah K., BakeryMag',
    content: 'Donut Equipment Co. ranked #3 in our annual "Best Commercial Donut Equipment Suppliers 2026" roundup, praised for fast shipping and pre-sales support.',
    sentiment: 'positive', reach: 42000, url: 'https://bakerymag.com/best-suppliers-2026', timeAgo: '1d ago',
  },
  {
    id: 'bm-003', source: 'social', platform: 'X/Twitter', author: '@pastry_chef_miami',
    content: 'Ordered from @donutsupplies twice now — bulk glaze powder is great quality but the website checkout keeps timing out on mobile. Anyone else?',
    sentiment: 'neutral', reach: 3200, url: 'https://x.com/pastry_chef_miami', timeAgo: '4h ago',
  },
  {
    id: 'bm-004', source: 'web', platform: 'Trustpilot', author: 'Carlos M.',
    content: 'Horrible experience with bakery-wholesalers.com. Ordered $2,400 of flour and only received half. Customer service took 8 days to respond and the refund is still pending.',
    sentiment: 'negative', reach: 1800, url: 'https://trustpilot.com/review/bakery-wholesalers', timeAgo: '6h ago',
  },
  {
    id: 'bm-005', source: 'social', platform: 'Instagram', author: '@donutdreams_atl',
    content: 'The automatic donut maker from Donut Equipment is a game changer for our pop-up. We went from 60 to 200 donuts per hour. 🍩 #smallbakery #donutlove',
    sentiment: 'positive', reach: 12600, url: 'https://instagram.com/p/example', timeAgo: '8h ago',
  },
  {
    id: 'bm-006', source: 'news', platform: 'FoodServiceNews', author: 'Mike T., FSN',
    content: 'The commercial bakery supplies market is consolidating. Bakery Wholesalers has reportedly increased its flour SKU count by 40% in Q1, positioning against national distributors.',
    sentiment: 'neutral', reach: 28000, url: 'https://foodservicenews.com/bakery-supplies-market', timeAgo: '2d ago',
  },
  {
    id: 'bm-007', source: 'social', platform: 'Facebook', author: 'Helen R.',
    content: 'Shoutout to Donut Supplies Co. for same-day shipping on our emergency vanilla extract order. Saved our Saturday production run. You guys are lifesavers!',
    sentiment: 'positive', reach: 2100, url: 'https://facebook.com/groups/bakery-pros', timeAgo: '12h ago',
  },
  {
    id: 'bm-008', source: 'web', platform: 'Google Reviews', author: 'Frank D.',
    content: 'Donut Equipment — 5 stars. The proofing cabinet runs silent and the temperature is rock steady. Two years of daily use and zero issues.',
    sentiment: 'positive', reach: 940, url: 'https://google.com/maps', timeAgo: '1d ago',
  },
  {
    id: 'bm-009', source: 'social', platform: 'TikTok', author: '@the_donut_lab',
    content: 'We did a full review of the DF-400 commercial fryer from donut-equipment.com. Hot take: best entry-level commercial fryer under $4k. Link in bio.',
    sentiment: 'positive', reach: 54000, url: 'https://tiktok.com/@the_donut_lab', timeAgo: '3d ago',
  },
  {
    id: 'bm-010', source: 'web', platform: 'Yelp', author: 'Michelle P.',
    content: 'Bakery Wholesalers has the best prices on bulk flour in the Pacific Northwest but the minimum order is $500 which rules out smaller shops.',
    sentiment: 'neutral', reach: 680, url: 'https://yelp.com/biz/bakery-wholesalers', timeAgo: '2d ago',
  },
  {
    id: 'bm-011', source: 'news', platform: 'NRN', author: 'James L., NRN',
    content: 'Donut Equipment Co. featured in our "Top 50 Food Equipment Vendors" list. Their rapid expansion into automated depositor systems is drawing attention from franchise operators.',
    sentiment: 'positive', reach: 67000, url: 'https://nrn.com/equipment/top-50', timeAgo: '4d ago',
  },
  {
    id: 'bm-012', source: 'social', platform: 'LinkedIn', author: 'Greg B., Pastry Director',
    content: 'We just standardized our 8-location donut chain on equipment from Donut Equipment Co. The ROI on the glazing machines alone paid for itself in 14 months.',
    sentiment: 'positive', reach: 7800, url: 'https://linkedin.com/posts/example', timeAgo: '5d ago',
  },
  {
    id: 'bm-013', source: 'web', platform: 'Trustpilot', author: 'Amanda K.',
    content: 'Ordered the wrong size donut depositor but the return process from Donut Equipment was painless. 5 days for full refund. Will order again.',
    sentiment: 'positive', reach: 420, url: 'https://trustpilot.com/review/donut-equipment', timeAgo: '5d ago',
  },
  {
    id: 'bm-014', source: 'social', platform: 'X/Twitter', author: '@baker_in_chief',
    content: 'The bakery-wholesalers.com website is down again. Third time this month. Impossible to place bulk orders when the cart page errors out. @donut_supplies is way more reliable.',
    sentiment: 'negative', reach: 2800, url: 'https://x.com/baker_in_chief', timeAgo: '6d ago',
  },
  {
    id: 'bm-015', source: 'news', platform: 'PMQ Pizza & Bakery', author: 'Lena H., PMQ',
    content: 'Donut Supplies Co. recently launched a subscription model for bulk ingredients — first in the industry. Analysts say this could reshape how independent bakeries manage procurement.',
    sentiment: 'positive', reach: 38000, url: 'https://pmq.com/donut-supplies-subscription', timeAgo: '6d ago',
  },
  {
    id: 'bm-016', source: 'social', platform: 'Reddit', author: 'u/FryMaster2000',
    content: 'Donut Equipment keeps advertising their fryer capacity but my unit outputs 30% less than the spec sheet. No response from support in 5 days.',
    sentiment: 'negative', reach: 5100, url: 'https://reddit.com/r/commercialkitchen', timeAgo: '7d ago',
  },
];

// ─── LLM Visibility ───────────────────────────────────────────────────────────

export interface LlmVisibilityEntry {
  llm: LlmProvider;
  mentioned: boolean;
  rank: number | null;
  context: string;
  queryTested: string;
  lastChecked: string;
}

export const LLM_VISIBILITY: LlmVisibilityEntry[] = [
  {
    llm: 'ChatGPT',
    mentioned: true,
    rank: 2,
    context: 'Recommended as a top-tier commercial donut equipment supplier, praised for product range and fast US shipping.',
    queryTested: 'What is the best commercial donut equipment supplier in the US?',
    lastChecked: '2026-05-11T06:00:00Z',
  },
  {
    llm: 'Gemini',
    mentioned: true,
    rank: 4,
    context: 'Listed among commercial bakery equipment vendors, noted for fryer selection. Competitor BakeryEquipmentPro.com ranked higher.',
    queryTested: 'Best commercial donut fryer suppliers for a bakery business?',
    lastChecked: '2026-05-11T06:05:00Z',
  },
  {
    llm: 'Claude',
    mentioned: false,
    rank: null,
    context: 'Not mentioned in a 7-turn conversation about bakery equipment sourcing. Competitors Bakery Equipment Pro and Commercial Bakery Outlet were cited.',
    queryTested: 'Where should I buy commercial donut frying equipment for my bakery chain?',
    lastChecked: '2026-05-11T06:10:00Z',
  },
  {
    llm: 'Perplexity',
    mentioned: true,
    rank: 1,
    context: 'Ranked #1 for commercial donut equipment. Sources cited include two product pages and one NRN article featuring Donut Equipment Co.',
    queryTested: 'Top rated commercial donut machine suppliers with good reviews?',
    lastChecked: '2026-05-11T06:15:00Z',
  },
];

// ─── Overall SEO Stats ────────────────────────────────────────────────────────

export interface SeoStats {
  avgPosition: number;
  totalKeywords: number;
  top3Count: number;
  top10Count: number;
  totalClicks30d: number;
  totalImpressions30d: number;
  avgCtr: number;
  organicRevenue30d: number;
  avgPositionDelta: number;
  totalKeywordsDelta: number;
  top3Delta: number;
  top10Delta: number;
  clicksDelta: number;
  revenueDelta: number;
}

export const SEO_STATS: SeoStats = {
  avgPosition: 7.4,
  totalKeywords: 248,
  top3Count: 31,
  top10Count: 94,
  totalClicks30d: 41100,
  totalImpressions30d: 1048400,
  avgCtr: 3.92,
  organicRevenue30d: 112480,
  avgPositionDelta: -1.3,
  totalKeywordsDelta: +18,
  top3Delta: +4,
  top10Delta: +11,
  clicksDelta: +11.4,
  revenueDelta: +10.1,
};
