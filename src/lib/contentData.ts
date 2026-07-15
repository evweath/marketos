// ─── AI Content Generation Types & Mock Data ──────────────────────────────────

export type CreativeType = 'image' | 'video' | 'ugc';
export type ContentPlatform = 'google' | 'meta' | 'tiktok' | 'youtube' | 'instagram' | 'linkedin';
export type CreativeStatus = 'draft' | 'ready' | 'published';
export type PerformancePrediction = 'strong' | 'average' | 'weak';
export type PerformanceIndicator = 'high' | 'medium' | 'low';
export type CampaignObjective = 'Brand Awareness' | 'Lead Generation' | 'Sales' | 'Retargeting' | 'Product Launch';

// ─── Generated Creatives ──────────────────────────────────────────────────────

export interface GeneratedCreative {
  id: string;
  type: CreativeType;
  platform: ContentPlatform;
  name: string;
  status: CreativeStatus;
  performanceScore: number;
  size: string;
  format: string;
  createdAt: string;
  store: string;
  thumbnailColor: string;
  thumbnailInitials: string;
}

// SAMPLE_* below seeds Settings → Data → "Load Sample Data"; the app boots empty.
export const SAMPLE_GENERATED_CREATIVES: GeneratedCreative[] = [
  {
    id: 'gc-001', type: 'image', platform: 'meta', name: 'Commercial Fryer Hero — White BG',
    status: 'published', performanceScore: 87, size: '1080x1080', format: 'JPG',
    createdAt: '2h ago', store: 'donut-equipment.com',
    thumbnailColor: 'linear-gradient(135deg, #00d9ff22, #7b93ff22)', thumbnailInitials: 'CF',
  },
  {
    id: 'gc-004', type: 'image', platform: 'google', name: 'Display Banner — 728×90',
    status: 'published', performanceScore: 71, size: '728x90', format: 'PNG',
    createdAt: '1d ago', store: 'donut-equipment.com',
    thumbnailColor: 'linear-gradient(135deg, #4285f422, #34a85322)', thumbnailInitials: 'DB',
  },
  {
    id: 'gc-006', type: 'video', platform: 'youtube', name: 'Bakery Equipment Overview — 30s',
    status: 'ready', performanceScore: 68, size: '1920x1080', format: 'MP4',
    createdAt: '2d ago', store: 'donut-equipment.com',
    thumbnailColor: 'linear-gradient(135deg, #ff000022, #ffb34722)', thumbnailInitials: 'BE',
  },
  {
    id: 'gc-007', type: 'image', platform: 'meta', name: 'Retargeting — Cart Abandoner v3',
    status: 'published', performanceScore: 91, size: '1080x1350', format: 'JPG',
    createdAt: '2d ago', store: 'donut-supplies.com',
    thumbnailColor: 'linear-gradient(135deg, #0866ff22, #00d9ff22)', thumbnailInitials: 'RT',
  },
  {
    id: 'gc-009', type: 'image', platform: 'google', name: 'Responsive Display — Wholesale',
    status: 'published', performanceScore: 76, size: '300x250', format: 'PNG',
    createdAt: '3d ago', store: 'bakerywholesalers.com',
    thumbnailColor: 'linear-gradient(135deg, #34a85322, #10d98a22)', thumbnailInitials: 'RD',
  },
  {
    id: 'gc-011', type: 'image', platform: 'meta', name: 'Carousel — Top 5 Fryers',
    status: 'ready', performanceScore: 63, size: '1080x1080', format: 'PNG',
    createdAt: '5d ago', store: 'donut-equipment.com',
    thumbnailColor: 'linear-gradient(135deg, #0866ff22, #ff005022)', thumbnailInitials: 'C5',
  },
  {
    id: 'gc-012', type: 'ugc', platform: 'youtube', name: 'Avatar Review — Commercial Mixer',
    status: 'draft', performanceScore: 72, size: '1920x1080', format: 'MP4',
    createdAt: '6d ago', store: 'donut-equipment.com',
    thumbnailColor: 'linear-gradient(135deg, #ff000022, #7b93ff22)', thumbnailInitials: 'AR',
  },
];

// ─── Competitor Ads ────────────────────────────────────────────────────────────

export interface CompetitorAd {
  id: string;
  competitor: string;
  platform: ContentPlatform;
  adType: 'image' | 'video' | 'carousel';
  headline: string;
  description: string;
  cta: string;
  estimatedSpend: string;
  daysRunning: number;
  performanceIndicator: PerformanceIndicator;
  category: string;
  thumbnailColor: string;
}

export const SAMPLE_COMPETITOR_ADS: CompetitorAd[] = [
  {
    id: 'ca-001', competitor: 'fryer-king.com', platform: 'meta', adType: 'image',
    headline: 'Commercial Fryers from $899', description: 'NSF-certified commercial fryers for bakeries and restaurants. Free shipping on orders over $1,200.',
    cta: 'Shop Now', estimatedSpend: '$4,200/mo', daysRunning: 42, performanceIndicator: 'high',
    category: 'Commercial Equipment', thumbnailColor: 'linear-gradient(135deg, #e83e3e, #ff8c00)',
  },
  {
    id: 'ca-002', competitor: 'bakersupply.co', platform: 'google', adType: 'image',
    headline: 'Bulk Donut Supplies — 30% Off', description: 'Premium donut mixes, glazes, and toppings. Wholesale pricing for businesses. Same-day shipping available.',
    cta: 'Get Quote', estimatedSpend: '$2,800/mo', daysRunning: 18, performanceIndicator: 'medium',
    category: 'Baking Supplies', thumbnailColor: 'linear-gradient(135deg, #4285F4, #34A853)',
  },
  {
    id: 'ca-003', competitor: 'equippro.com', platform: 'youtube', adType: 'video',
    headline: 'See Our Mixers in Action', description: '5-year warranty commercial mixers trusted by 10,000+ bakeries. Watch the demo and save 20% today.',
    cta: 'Watch Demo', estimatedSpend: '$6,100/mo', daysRunning: 67, performanceIndicator: 'high',
    category: 'Commercial Equipment', thumbnailColor: 'linear-gradient(135deg, #FF0000, #cc0000)',
  },
  {
    id: 'ca-004', competitor: 'wholesalecakes.com', platform: 'linkedin', adType: 'image',
    headline: 'Partner With Us — Wholesale Pricing', description: 'B2B baking ingredients at scale. Volume discounts, dedicated account manager, NET-30 terms available.',
    cta: 'Apply Now', estimatedSpend: '$3,400/mo', daysRunning: 31, performanceIndicator: 'medium',
    category: 'Wholesale', thumbnailColor: 'linear-gradient(135deg, #0A66C2, #004182)',
  },
  {
    id: 'ca-005', competitor: 'trendybakes.io', platform: 'tiktok', adType: 'video',
    headline: 'Viral Donut Trends 2026', description: 'Get the supplies to make trending donuts. Croissant donuts, matcha glazes, freeze-dried toppings.',
    cta: 'Shop Trends', estimatedSpend: '$1,900/mo', daysRunning: 12, performanceIndicator: 'high',
    category: 'Baking Supplies', thumbnailColor: 'linear-gradient(135deg, #FF0050, #00f2ea)',
  },
  {
    id: 'ca-006', competitor: 'fryer-king.com', platform: 'google', adType: 'carousel',
    headline: 'Industrial Fryers — Compare Models', description: 'Gas and electric commercial fryers. Capacity from 15 to 100 lbs. Compare specs side-by-side.',
    cta: 'Compare', estimatedSpend: '$5,800/mo', daysRunning: 55, performanceIndicator: 'high',
    category: 'Commercial Equipment', thumbnailColor: 'linear-gradient(135deg, #e83e3e, #7b1fa2)',
  },
  {
    id: 'ca-007', competitor: 'bakersupply.co', platform: 'instagram', adType: 'video',
    headline: 'New: Organic Donut Glazes', description: 'Clean-label glazes made with real fruit. Perfect for health-forward bakeries. Try our sampler pack.',
    cta: 'Try Now', estimatedSpend: '$1,200/mo', daysRunning: 8, performanceIndicator: 'low',
    category: 'Baking Supplies', thumbnailColor: 'linear-gradient(135deg, #E1306C, #F77737)',
  },
  {
    id: 'ca-008', competitor: 'equippro.com', platform: 'meta', adType: 'carousel',
    headline: 'End-to-End Bakery Equipment', description: 'Mixers, proofers, ovens, fryers — outfit your entire bakery. Financing available. Free delivery & install.',
    cta: 'Learn More', estimatedSpend: '$7,200/mo', daysRunning: 89, performanceIndicator: 'high',
    category: 'Commercial Equipment', thumbnailColor: 'linear-gradient(135deg, #0866FF, #5900d3)',
  },
];

// ─── Template Categories ──────────────────────────────────────────────────────

export interface TemplateCategory {
  id: string;
  name: string;
  count: number;
  iconName: string;
}

// The category list itself is structural (a fixed taxonomy for the template
// library), but `count` reflected a fabricated inventory size — it's now
// derived from the actual template library at render time instead (see
// TemplateLibrary.tsx), so it's zeroed here rather than hardcoded.
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'social',        name: 'Social Media',       count: 0, iconName: 'Share2'        },
  { id: 'display',       name: 'Display Ads',        count: 0, iconName: 'Monitor'        },
  { id: 'email',         name: 'Email Headers',      count: 0, iconName: 'Mail'           },
  { id: 'youtube',       name: 'YouTube Thumbnails', count: 0, iconName: 'Youtube'        },
  { id: 'stories',       name: 'Stories',            count: 0, iconName: 'Smartphone'     },
  { id: 'carousels',     name: 'Carousels',          count: 0, iconName: 'LayoutGrid'     },
  { id: 'video',         name: 'Video Ads',          count: 0, iconName: 'Video'          },
  { id: 'print',         name: 'Print',              count: 0, iconName: 'Printer'        },
  { id: 'presentations', name: 'Presentations',      count: 0, iconName: 'Presentation'   },
  { id: 'landing',       name: 'Landing Pages',      count: 0, iconName: 'Layout'         },
];

// ─── Brand Voice ──────────────────────────────────────────────────────────────

export interface BrandVoiceSettings {
  tone: string;
  toneValue: number;
  formalityValue: number;
  personalityTraits: string[];
  wordListAvoid: string[];
  wordListUse: string[];
  exampleCopy: string;
  lastTrained: string;
  trainingDocs: number;
}

// Untrained default — no brand voice has been trained yet.
export const DEFAULT_BRAND_VOICE_SETTINGS: BrandVoiceSettings = {
  tone: 'Not yet trained',
  toneValue: 50,
  formalityValue: 50,
  personalityTraits: [],
  wordListAvoid: [],
  wordListUse: [],
  exampleCopy: '',
  lastTrained: '',
  trainingDocs: 0,
};

export const SAMPLE_BRAND_VOICE_SETTINGS: BrandVoiceSettings = {
  tone: 'Professional with warmth',
  toneValue: 65,
  formalityValue: 55,
  personalityTraits: ['Expert', 'Trustworthy', 'Approachable', 'Innovative', 'Bold'],
  wordListAvoid: ['cheap', 'cheap price', 'dirt cheap', 'budget', 'discount', 'sale', 'deal', 'low-cost'],
  wordListUse: ['premium', 'professional', 'commercial-grade', 'trusted', 'high-performance', 'industry-leading', 'certified'],
  exampleCopy: 'Equip your bakery with confidence. Our commercial-grade fryers are engineered for professional kitchens — delivering consistent results batch after batch. Trusted by 12,000+ food service operators across North America.',
  lastTrained: '3 days ago',
  trainingDocs: 4,
};

// ─── Performance Scores ───────────────────────────────────────────────────────

export interface MetricScores {
  clarity: number;
  emotionalAppeal: number;
  brandConsistency: number;
  callToAction: number;
  visualHierarchy: number;
  colorContrast: number;
}

export interface ScoredCreative {
  id: string;
  name: string;
  type: CreativeType;
  overallScore: number;
  metrics: MetricScores;
  prediction: PerformancePrediction;
  platform: ContentPlatform;
  commentary: string;
  improvements: string[];
  thumbnailColor: string;
}

export const SAMPLE_PERFORMANCE_SCORES: ScoredCreative[] = [
  {
    id: 'ps-001', name: 'Commercial Fryer Hero — White BG', type: 'image', platform: 'meta',
    overallScore: 87, prediction: 'strong',
    metrics: { clarity: 92, emotionalAppeal: 78, brandConsistency: 94, callToAction: 88, visualHierarchy: 91, colorContrast: 85 },
    commentary: 'This creative scores exceptionally well on clarity and brand consistency, with a strong visual hierarchy that draws the eye immediately to the product. The white background creates a professional feel that resonates with B2B buyers in the food service industry.',
    improvements: ['Increase emotional appeal by adding a human element — a chef using the equipment', 'Test a warmer color palette for the CTA button to improve click-through', 'Add a social proof element such as a star rating or customer count overlay'],
    thumbnailColor: 'linear-gradient(135deg, #00d9ff33, #7b93ff33)',
  },
  {
    id: 'ps-005', name: 'Carousel — Top 5 Fryers', type: 'image', platform: 'meta',
    overallScore: 63, prediction: 'average',
    metrics: { clarity: 72, emotionalAppeal: 58, brandConsistency: 68, callToAction: 62, visualHierarchy: 65, colorContrast: 59 },
    commentary: 'This carousel shows room for improvement across most metrics. The product comparison format has potential, but the visual execution lacks the punch needed to stop the scroll. Color contrast is particularly weak, which will hurt performance on mobile in bright light conditions.',
    improvements: ['Redesign the first card — it needs to be dramatically more attention-grabbing to initiate swipes', 'Increase font sizes and improve contrast ratios to meet WCAG AA standards', 'Add pricing or a clear differentiator on each card to give users a reason to keep swiping'],
    thumbnailColor: 'linear-gradient(135deg, #0866ff33, #ff005033)',
  },
  {
    id: 'ps-006', name: 'Retargeting — Cart Abandoner v3', type: 'image', platform: 'meta',
    overallScore: 91, prediction: 'strong',
    metrics: { clarity: 94, emotionalAppeal: 89, brandConsistency: 93, callToAction: 96, visualHierarchy: 90, colorContrast: 88 },
    commentary: 'Exceptional performance across all metrics, with the CTA standing out as the strongest element at 96. This retargeting creative does an excellent job of re-engaging cart abandoners with urgency and specificity. Expected to outperform the control by 20-35%.',
    improvements: ['Test a countdown timer variant to further amplify urgency', 'Consider a version that shows the exact product the user left in their cart', 'A/B test copy variant with free shipping offer vs. percentage discount'],
    thumbnailColor: 'linear-gradient(135deg, #0866ff33, #00d9ff33)',
  },
];

// ─── Campaign Briefs ───────────────────────────────────────────────────────────

export interface ChannelStrategy {
  channel: string;
  budgetPercent: number;
  recommendation: string;
  formats: string[];
}

export interface KpiTargets {
  impressions: string;
  clicks: string;
  conversions: string;
  roas: string;
  cpa: string;
}

export interface CampaignBrief {
  id: string;
  title: string;
  objective: CampaignObjective;
  executiveSummary: string;
  targetAudience: {
    demographics: string;
    psychographics: string;
    behaviors: string;
  };
  keyMessages: string[];
  channelStrategy: ChannelStrategy[];
  creativeRequirements: string[];
  kpiTargets: KpiTargets;
  timeline: string;
  milestones: string[];
  budget: string;
  channels: string[];
  generatedAt: string;
}

export const SAMPLE_CAMPAIGN_BRIEFS: CampaignBrief[] = [
  {
    id: 'cb-001',
    title: 'Commercial Fryer Q2 Launch — Donut Equipment',
    objective: 'Product Launch',
    executiveSummary: 'Drive awareness and first-purchase conversions for the new ProFry 3000 series commercial fryer targeting independent bakery owners and food service operators in North America. Campaign runs across Google, Meta, and LinkedIn with a combined budget of $28,000 over 6 weeks.',
    targetAudience: {
      demographics: '35–55 year olds, business owners and purchasing managers, $150K+ household income, North America',
      psychographics: 'Quality-focused, efficiency-driven, risk-averse buyers who research thoroughly before purchasing. They value reliability over price.',
      behaviors: 'Searched commercial kitchen equipment in last 90 days, visited competitor sites, subscribed to food service trade publications',
    },
    keyMessages: [
      'The ProFry 3000 delivers 40% faster heat recovery than competing models — keeping up with peak production',
      'NSF-certified and backed by a 5-year commercial warranty — the lowest total cost of ownership in its class',
      'Trusted by 2,400+ bakeries across North America since 2019',
      'Free white-glove delivery and installation on all orders over $2,000',
    ],
    channelStrategy: [
      { channel: 'Google Search', budgetPercent: 40, recommendation: 'Capture high-intent searchers with branded and category terms. Prioritize "commercial fryer" and "bakery fryer" keywords.', formats: ['Responsive Search Ads', 'Shopping Ads'] },
      { channel: 'Meta Ads', budgetPercent: 30, recommendation: 'Prospecting via lookalike audiences based on existing customers. Run carousel showing product features and video testimonials.', formats: ['Image Ads', 'Carousel', 'Video'] },
      { channel: 'LinkedIn', budgetPercent: 20, recommendation: 'Target food service operations managers and restaurant owners. Sponsored content with ROI-focused messaging.', formats: ['Sponsored Content', 'Lead Gen Forms'] },
      { channel: 'YouTube', budgetPercent: 10, recommendation: 'In-stream product demonstration video for retargeting audiences who visited the product page.', formats: ['In-Stream Skippable', 'Bumper Ads'] },
    ],
    creativeRequirements: [
      '3× hero product images (white BG, lifestyle, detail) — 1080×1080 and 1200×628',
      '1× 30-second product demo video — 16:9 for YouTube, 9:16 cut for Meta Stories',
      '2× carousel sets (5 cards each) — features comparison and customer testimonials',
      'Google RSA copy — 15 headlines, 4 descriptions per ad group',
      'LinkedIn lead magnet — "2026 Commercial Fryer Buyer\'s Guide" PDF',
    ],
    kpiTargets: { impressions: '2.4M', clicks: '18,400', conversions: '186', roas: '7.2×', cpa: '$150' },
    timeline: '6 weeks (May 15 – June 26, 2026)',
    milestones: [
      'Week 1: Creative assets delivered and approved',
      'Week 2: Campaign launch on all channels — learning phase begins',
      'Week 3: First optimization pass — pause underperforming ad sets',
      'Week 4: Mid-campaign check — reallocate budget to top performers',
      'Week 6: Final report and next-phase recommendations',
    ],
    budget: '$28,000',
    channels: ['Google', 'Meta', 'LinkedIn', 'YouTube'],
    generatedAt: '2 hours ago',
  },
  {
    id: 'cb-002',
    title: 'Donut Supplies Summer Retargeting Push',
    objective: 'Retargeting',
    executiveSummary: 'Re-engage the 12,400 website visitors who browsed donut supplies in the past 30 days but did not convert. Using dynamic product ads and personalized copy, this campaign targets bottom-of-funnel buyers with urgency-based creative across Meta and Google.',
    targetAudience: {
      demographics: '25–45 year olds, bakery owners, pastry chefs, home bakers scaling to commercial. US-based.',
      psychographics: 'Motivated by quality and trend-following. They\'ve shown intent but may be comparison shopping or awaiting payday.',
      behaviors: 'Visited donut-supplies.com in last 30 days, viewed product pages, added to cart without purchasing, opened at least 2 email newsletters',
    },
    keyMessages: [
      'The supplies you were looking at are still available — and we\'ve added new summer flavors',
      'Free shipping on orders over $75 this week only',
      'Join 8,200+ bakeries already using our premium glazes and mixes',
      'Rated 4.8/5 stars by verified buyers',
    ],
    channelStrategy: [
      { channel: 'Meta Ads', budgetPercent: 55, recommendation: 'Dynamic product retargeting showing exact items viewed. Frequency cap at 3 per week. Add urgency in copy.', formats: ['Dynamic Product Ads', 'Carousel', 'Stories'] },
      { channel: 'Google', budgetPercent: 35, recommendation: 'RLSA campaigns targeting site visitors with modified bids. Shopping ads for product-page visitors.', formats: ['Display Retargeting', 'Shopping (RLSA)'] },
      { channel: 'Email', budgetPercent: 10, recommendation: 'Abandoned cart sequence — 3 emails over 5 days with escalating urgency and final discount offer.', formats: ['Abandoned Cart Emails', 'Browse Abandonment'] },
    ],
    creativeRequirements: [
      'Dynamic product ad templates — 1080×1080 and 1080×1350',
      'Urgency-focused static ads — "Limited Time" and "Low Stock" variants',
      '3-email abandon cart sequence with product imagery',
      'Google Display banner set — 300×250, 728×90, 160×600',
    ],
    kpiTargets: { impressions: '840K', clicks: '12,600', conversions: '378', roas: '9.4×', cpa: '$22' },
    timeline: '4 weeks (May 20 – June 17, 2026)',
    milestones: [
      'Week 1: Audience segments built and creative approved',
      'Week 2: Campaigns live — monitor frequency and overlap',
      'Week 3: Email sequence activated — 3-part abandoned cart flow',
      'Week 4: Final analysis and transition to evergreen retargeting',
    ],
    budget: '$8,400',
    channels: ['Meta', 'Google', 'Email'],
    generatedAt: '1 day ago',
  },
  {
    id: 'cb-003',
    title: 'Bakery Wholesale Q3 Brand Awareness',
    objective: 'Brand Awareness',
    executiveSummary: 'Establish bakerywholesalers.com as the definitive B2B source for wholesale baking ingredients among independent bakery chains and food service distributors. This upper-funnel campaign uses LinkedIn, YouTube, and programmatic display to reach purchasing decision-makers.',
    targetAudience: {
      demographics: '40–60 year olds, procurement managers, operations directors, multi-unit bakery owners. North America.',
      psychographics: 'Risk-averse, relationship-driven buyers who prioritize reliability, compliance, and favorable payment terms over price.',
      behaviors: 'Read food service trade publications, attend industry events, searched "wholesale baking supplier" or "food service distributor" in last 180 days',
    },
    keyMessages: [
      'Bakerywholesalers.com — supplying North America\'s top bakery chains since 2014',
      'NET-30 payment terms, dedicated account manager, FDA-compliant sourcing',
      'Minimum order $500 — maximum flexibility at wholesale prices',
      'In-stock guarantee: we carry 2,400+ SKUs with same-day fulfillment',
    ],
    channelStrategy: [
      { channel: 'LinkedIn', budgetPercent: 45, recommendation: 'Sponsored content targeting operations managers and procurement titles at food service companies with 50+ employees.', formats: ['Sponsored Content', 'Document Ads', 'Lead Gen Forms'] },
      { channel: 'YouTube', budgetPercent: 30, recommendation: 'Company story and facility tour video — 60-second non-skippable for awareness, 30-second skippable for consideration.', formats: ['Non-Skippable In-Stream', 'Skippable In-Stream'] },
      { channel: 'Programmatic Display', budgetPercent: 25, recommendation: 'Run on food service trade publication networks — NRN, FSR Magazine, QSR Magazine. Frequency cap 2/day.', formats: ['Display Banners', 'Native Ads'] },
    ],
    creativeRequirements: [
      'Brand story video — 60-second and 30-second cuts',
      'LinkedIn document ad — "Wholesale Buyer\'s Checklist: 10 Questions to Ask Your Supplier"',
      'Display banner set across 8 standard sizes',
      'LinkedIn sponsored content — 4 educational articles with strong imagery',
    ],
    kpiTargets: { impressions: '5.2M', clicks: '26,000', conversions: '840', roas: '4.8×', cpa: '$68' },
    timeline: '3 months (June 1 – August 31, 2026)',
    milestones: [
      'Month 1: Brand video production and asset delivery',
      'Month 2: Full campaign launch — all channels active',
      'Month 2 Week 3: Mid-campaign review — optimize creative and targeting',
      'Month 3: Retargeting layer added — convert awareness to leads',
      'End of Q3: Full attribution report and Q4 planning',
    ],
    budget: '$57,000',
    channels: ['LinkedIn', 'YouTube', 'Email'],
    generatedAt: '3 days ago',
  },
];

// ─── Image Format Presets ─────────────────────────────────────────────────────

export interface ImageFormat {
  name: string;
  width: number;
  height: number;
  format: string;
  useCase: string;
}

export interface PlatformPreset {
  platform: string;
  platformKey: ContentPlatform | 'email';
  color: string;
  formats: ImageFormat[];
}

export const IMAGE_PRESETS: PlatformPreset[] = [
  {
    platform: 'Meta Ads', platformKey: 'meta', color: '#0866FF',
    formats: [
      { name: 'Feed Image', width: 1080, height: 1080, format: 'JPG/PNG', useCase: 'Feed image ads and carousel cards' },
      { name: 'Feed Portrait', width: 1080, height: 1350, format: 'JPG/PNG', useCase: 'Feed image — 4:5 portrait (best for mobile)' },
      { name: 'Feed Landscape', width: 1200, height: 628, format: 'JPG/PNG', useCase: 'Link preview and landscape feed ads' },
      { name: 'Stories/Reels', width: 1080, height: 1920, format: 'JPG/MP4', useCase: 'Stories and Reels fullscreen format' },
      { name: 'Right Column', width: 1200, height: 628, format: 'JPG/PNG', useCase: 'Desktop right-column placement' },
    ],
  },
  {
    platform: 'Google Ads', platformKey: 'google', color: '#4285F4',
    formats: [
      { name: 'Leaderboard', width: 728, height: 90, format: 'JPG/PNG/GIF', useCase: 'Top of page banner — highest CTR placement' },
      { name: 'Medium Rectangle', width: 300, height: 250, format: 'JPG/PNG/GIF', useCase: 'Most versatile display format' },
      { name: 'Large Rectangle', width: 336, height: 280, format: 'JPG/PNG/GIF', useCase: 'In-content placement — higher engagement' },
      { name: 'Wide Skyscraper', width: 160, height: 600, format: 'JPG/PNG/GIF', useCase: 'Sidebar vertical placement' },
      { name: 'Billboard', width: 970, height: 250, format: 'JPG/PNG/GIF', useCase: 'Premium above-fold placement' },
      { name: 'Half Page', width: 300, height: 600, format: 'JPG/PNG/GIF', useCase: 'High-impact mid-content placement' },
    ],
  },
  {
    platform: 'TikTok Ads', platformKey: 'tiktok', color: '#FF0050',
    formats: [
      { name: 'TopView', width: 1080, height: 1920, format: 'MP4', useCase: 'First ad seen on app open — max 60 seconds' },
      { name: 'In-Feed Ad', width: 1080, height: 1920, format: 'MP4', useCase: 'Native feed placement — 9:16 vertical' },
      { name: 'Spark Ad', width: 1080, height: 1920, format: 'MP4', useCase: 'Boost organic TikTok content as ad' },
      { name: 'Brand Takeover', width: 1080, height: 1920, format: 'JPG/MP4', useCase: 'Full-screen on app launch — 3s image or 5s video' },
    ],
  },
  {
    platform: 'YouTube Ads', platformKey: 'youtube', color: '#FF0000',
    formats: [
      { name: 'In-Stream (16:9)', width: 1920, height: 1080, format: 'MP4', useCase: 'Skippable and non-skippable in-stream ads' },
      { name: 'Vertical (9:16)', width: 1080, height: 1920, format: 'MP4', useCase: 'YouTube Shorts ads — fullscreen mobile' },
      { name: 'Bumper Ad', width: 1920, height: 1080, format: 'MP4', useCase: 'Non-skippable 6-second bumper ads' },
      { name: 'Display Overlay', width: 480, height: 70, format: 'JPG/PNG', useCase: 'Overlay on video content on desktop' },
    ],
  },
  {
    platform: 'Instagram', platformKey: 'instagram', color: '#E1306C',
    formats: [
      { name: 'Feed Square', width: 1080, height: 1080, format: 'JPG/PNG', useCase: 'Standard Instagram feed post' },
      { name: 'Feed Portrait', width: 1080, height: 1350, format: 'JPG/PNG', useCase: 'Taller feed post — more screen real estate' },
      { name: 'Stories', width: 1080, height: 1920, format: 'JPG/MP4', useCase: 'Instagram Stories — vertical fullscreen' },
      { name: 'Reel', width: 1080, height: 1920, format: 'MP4', useCase: 'Reels format — up to 90 seconds' },
      { name: 'Explore', width: 1080, height: 1080, format: 'JPG/PNG', useCase: 'Discovery placement in Explore tab' },
    ],
  },
  {
    platform: 'LinkedIn Ads', platformKey: 'linkedin', color: '#0A66C2',
    formats: [
      { name: 'Sponsored Content', width: 1200, height: 627, format: 'JPG/PNG', useCase: 'Main feed sponsored content post' },
      { name: 'Carousel Card', width: 1080, height: 1080, format: 'JPG/PNG', useCase: 'Individual card in carousel ads' },
      { name: 'Video Ad', width: 1920, height: 1080, format: 'MP4', useCase: 'In-feed video — up to 30 minutes' },
      { name: 'Conversation Ad', width: 300, height: 250, format: 'JPG/PNG', useCase: 'Companion banner in conversation ads' },
    ],
  },
];

// ─── Content Stats ─────────────────────────────────────────────────────────────
// Computed from whatever creatives/briefs currently exist rather than hardcoded.

export function computeContentStats(creatives: GeneratedCreative[], briefs: CampaignBrief[]) {
  return {
    creativesGenerated30d: creatives.length,
    avgPerformanceScore: creatives.length > 0
      ? Math.round(creatives.reduce((s, c) => s + c.performanceScore, 0) / creatives.length)
      : 0,
    templatesUsed: 0,
    campaignBriefs: briefs.length,
  };
}
