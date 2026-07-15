// ─── Social Media Types & Mock Data ──────────────────────────────────────────

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'x-twitter'
  | 'linkedin'
  | 'tiktok';

export type PostStatus = 'published' | 'scheduled' | 'draft' | 'failed' | 'review';
export type PostCategory = 'promotional' | 'educational' | 'product' | 'ugc' | 'behind-scenes' | 'seasonal';

export interface SocialPost {
  id: string;
  platforms: SocialPlatform[];
  status: PostStatus;
  category: PostCategory;
  caption: string;
  hashtags: string[];
  mediaType: 'image' | 'video' | 'carousel' | 'text' | 'reel' | 'story';
  mediaUrl?: string;
  scheduledFor: string;         // ISO date string
  publishedAt?: string;
  author: string;
  approver?: string;
  store: string;
  // engagement (if published)
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  engagementRate?: number;
  // AI suggested
  aiOptimalTime?: string;
  boostEligible?: boolean;
}

export interface InboxMessage {
  id: string;
  store: string;
  platform: SocialPlatform;
  type: 'comment' | 'dm' | 'mention' | 'review';
  author: string;
  authorHandle: string;
  avatarInitials: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  receivedAt: string;
  replied: boolean;
  postCaption?: string;
  requiresAttention: boolean;
}

export interface SocialListeningItem {
  id: string;
  store: string;
  keyword: string;
  platform: SocialPlatform;
  author: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  reach: number;
  foundAt: string;
  url: string;
}

// ─── Platform Config ──────────────────────────────────────────────────────────

export const PLATFORM_CONFIG: Record<SocialPlatform, {
  label: string; color: string; bg: string;
  charLimit: number; hashtagLimit: number; bestTimes: string[];
}> = {
  facebook:   { label: 'Facebook',   color: '#1877F2', bg: 'rgba(24,119,242,0.12)', charLimit: 63206, hashtagLimit: 10,  bestTimes: ['Wed 9am', 'Thu 1pm', 'Fri 11am'] },
  instagram:  { label: 'Instagram',  color: '#E1306C', bg: 'rgba(225,48,108,0.12)', charLimit: 2200,  hashtagLimit: 30,  bestTimes: ['Mon 9am', 'Wed 11am', 'Fri 10am'] },
  youtube:    { label: 'YouTube',    color: '#FF0000', bg: 'rgba(255,0,0,0.12)',     charLimit: 5000,  hashtagLimit: 15,  bestTimes: ['Sat noon', 'Sun noon', 'Fri 3pm'] },
  'x-twitter':{ label: 'X/Twitter', color: '#E7E9EA', bg: 'rgba(231,233,234,0.12)', charLimit: 280,   hashtagLimit: 3,   bestTimes: ['Tue 9am', 'Wed noon', 'Thu 9am']  },
  linkedin:   { label: 'LinkedIn',   color: '#0A66C2', bg: 'rgba(10,102,194,0.12)', charLimit: 3000,  hashtagLimit: 5,   bestTimes: ['Tue 8am', 'Wed 10am', 'Thu 9am']  },
  tiktok:     { label: 'TikTok',     color: '#FF0050', bg: 'rgba(255,0,80,0.12)',    charLimit: 2200,  hashtagLimit: 20,  bestTimes: ['Tue 7pm', 'Thu 8pm', 'Fri 9pm']  },
};

export const CATEGORY_CONFIG: Record<PostCategory, { label: string; color: string; icon: string }> = {
  promotional:    { label: 'Promotional',    color: '#ffb347', icon: '🎯' },
  educational:    { label: 'Educational',    color: '#00d9ff', icon: '📚' },
  product:        { label: 'Product',        color: '#10d98a', icon: '🛍' },
  ugc:            { label: 'UGC',            color: '#7b93ff', icon: '📸' },
  'behind-scenes':{ label: 'Behind Scenes',  color: '#ff4444', icon: '🎬' },
  seasonal:       { label: 'Seasonal',       color: '#E1306C', icon: '🌸' },
};

// ─── Helper to offset days from today ────────────────────────────────────────

function daysFromNow(d: number, h = 10, m = 0): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
}

// ─── Posts ───────────────────────────────────────────────────────────────────
//
// SAMPLE_* arrays below are not the app's live data — the app boots empty
// (see src/lib/sampleDataRegistry.ts). They seed Settings → Data → "Load
// Sample Data" for demoing/verifying the social module with realistic content.

export const SAMPLE_SOCIAL_POSTS: SocialPost[] = [
  // — Published ————————————————
  {
    id: 'sp-001', platforms: ['facebook'], status: 'published', category: 'product',
    caption: "🍩 New arrival: our AutoFryer XL 40L is here! Commercial-grade performance, whisper-quiet operation. Your donut shop deserves the best equipment. Link in bio for full specs. #DonutEquipment #CommercialBaking #DonutShop",
    hashtags: ['#DonutEquipment','#CommercialBaking','#DonutShop','#NewArrival'],
    mediaType: 'image', author: 'Sarah M.', store: 'donut-equipment.com',
    scheduledFor: daysFromNow(-3, 9, 0), publishedAt: daysFromNow(-3, 9, 0),
    likes: 284, comments: 47, shares: 31, reach: 8420, impressions: 12300, engagementRate: 4.3,
    boostEligible: true,
  },

  // — Scheduled ————————————————
  {
    id: 'sp-004', platforms: ['facebook'], status: 'scheduled', category: 'promotional',
    caption: "🎉 FLASH SALE: 20% off all glazing mixes this weekend only! Stock up before summer donut season peaks. Use code GLAZE20 at checkout. Shop donut-supplies.com",
    hashtags: ['#FlashSale','#DonutSupplies','#BakeryDeals','#GlazingMix'],
    mediaType: 'image', author: 'Sarah M.', store: 'donut-supplies.com',
    scheduledFor: daysFromNow(1, 9, 0), aiOptimalTime: 'Tomorrow 9:00 AM',
  },
  {
    id: 'sp-008', platforms: ['youtube'], status: 'scheduled', category: 'educational',
    caption: "How to Set Up a Commercial Donut Production Line: Complete Guide (2026) | DonutEquipment.com\n\nIn this video we cover: equipment selection, workflow layout, fryer maintenance, and scaling from 200 to 2000 donuts/day.",
    hashtags: ['#CommercialBaking','#DonutEquipment','#BakeryStartup'],
    mediaType: 'video', author: 'James K.', store: 'donut-equipment.com',
    scheduledFor: daysFromNow(4, 12, 0), aiOptimalTime: 'Fri 12:00 PM',
  },
  {
    id: 'sp-009', platforms: ['facebook'], status: 'scheduled', category: 'educational',
    caption: "Bulk buying guide for bakery wholesalers: how to calculate your monthly flour needs and negotiate volume discounts. We put together a free calculator — link in comments.",
    hashtags: ['#WholesaleBaking','#BakeryCosts','#BulkBuying'],
    mediaType: 'image', author: 'James K.', store: 'bakery-wholesalers.com',
    scheduledFor: daysFromNow(5, 9, 0),
  },

  // — In Review ————————————————
  {
    id: 'sp-013', platforms: ['facebook'], status: 'review', category: 'promotional',
    caption: "🍩 Introducing our new B2B loyalty program for wholesale bakeries. Spend $5,000+/month and unlock exclusive pricing, priority shipping, and dedicated account management. Apply now at bakerywholesalers.com/loyalty",
    hashtags: ['#BakeryBusiness','#WholesalePartners','#LoyaltyProgram'],
    mediaType: 'image', author: 'James K.', approver: 'Michael D.', store: 'bakery-wholesalers.com',
    scheduledFor: daysFromNow(2, 11, 0),
  },
];

// ─── Inbox Messages ───────────────────────────────────────────────────────────

export const SAMPLE_INBOX_MESSAGES: InboxMessage[] = [
  {
    id: 'im-002', store: 'donut-equipment.com', platform: 'facebook', type: 'comment', author: 'Marco Pellegrino', authorHandle: 'Marco Pellegrino',
    avatarInitials: 'MP', sentiment: 'negative',
    content: 'Ordered 3 weeks ago and still waiting. Customer service hasn\'t responded to 2 emails. Very disappointed.',
    receivedAt: daysFromNow(0, 7, 42), replied: false,
    requiresAttention: true,
  },
  {
    id: 'im-008', store: 'donut-equipment.com', platform: 'facebook', type: 'review', author: 'Glazed & Confused LLC', authorHandle: 'Glazed & Confused LLC',
    avatarInitials: 'GC', sentiment: 'neutral',
    content: 'Good products overall. The fryer is excellent. Shipping took longer than expected but customer service was helpful when we called. 4/5 stars.',
    receivedAt: daysFromNow(-1, 11, 0), replied: false,
    requiresAttention: false,
  },
];

// ─── Social Listening ──────────────────────────────────────────────────────────

export const SAMPLE_LISTENING_ITEMS: SocialListeningItem[] = [
  {
    id: 'sl-002', store: 'donut-equipment.com', keyword: 'donut-equipment.com', platform: 'facebook', author: 'Bakers United Group',
    content: 'Has anyone ordered from donut-equipment.com lately? Seeing mixed reviews online.',
    sentiment: 'neutral', reach: 1840, foundAt: daysFromNow(0, 9, 10),
    url: 'https://facebook.com/post/456',
  },
];

// ─── Platform Engagement Stats ────────────────────────────────────────────────

export interface PlatformStats {
  platform: SocialPlatform;
  started?: boolean;   // false = not launched on this platform yet (placeholder card only)
  followers: number;
  followerDelta: number;
  avgEngagementRate: number;
  postsThisMonth: number;
  reachThisMonth: number;
  topPost: string;
}

// Platforms this business hasn't actually launched on yet — kept as placeholder
// cards in the UI, but with no real activity to report.
export const NOT_STARTED_PLATFORMS: SocialPlatform[] = ['instagram', 'tiktok', 'linkedin', 'x-twitter'];

const ALL_PLATFORMS_LIST: SocialPlatform[] = ['facebook', 'instagram', 'youtube', 'x-twitter', 'linkedin', 'tiktok'];

/** Every platform zeroed/not-started — the live default before any channel is connected. */
export function emptyPlatformStats(): PlatformStats[] {
  return ALL_PLATFORMS_LIST.map(platform => ({
    platform, started: false, followers: 0, followerDelta: 0,
    avgEngagementRate: 0, postsThisMonth: 0, reachThisMonth: 0, topPost: '',
  }));
}

export const SAMPLE_PLATFORM_STATS: PlatformStats[] = [
  { platform: 'instagram',  started: false, followers: 0, followerDelta: 0, avgEngagementRate: 0, postsThisMonth: 0, reachThisMonth: 0, topPost: '' },
  { platform: 'facebook',   followers: 8240,  followerDelta: +87,  avgEngagementRate: 2.1, postsThisMonth: 14, reachThisMonth: 64000,  topPost: 'AutoFryer XL launch post' },
  { platform: 'tiktok',     started: false, followers: 0, followerDelta: 0, avgEngagementRate: 0, postsThisMonth: 0, reachThisMonth: 0, topPost: '' },
  { platform: 'linkedin',   started: false, followers: 0, followerDelta: 0, avgEngagementRate: 0, postsThisMonth: 0, reachThisMonth: 0, topPost: '' },
  { platform: 'youtube',    followers: 4780,  followerDelta: +124, avgEngagementRate: 3.1, postsThisMonth: 4,  reachThisMonth: 38000,  topPost: 'Commercial fryer setup guide' },
  { platform: 'x-twitter',  started: false, followers: 0, followerDelta: 0, avgEngagementRate: 0, postsThisMonth: 0, reachThisMonth: 0, topPost: '' },
];

// ─── AI Caption Suggestions ──────────────────────────────────────────────────

export interface AICaptionSuggestion {
  platform: SocialPlatform;
  caption: string;
  hashtags: string[];
  characterCount: number;
  tone: string;
  bestPostTime: string;
}

export function generateCaptions(topic: string): AICaptionSuggestion[] {
  return [
    {
      platform: 'instagram',
      caption: `✨ ${topic} — because your bakery deserves the best. Swipe to see why 2,000+ donut shops trust our equipment. Quality that speaks for itself. Link in bio for exclusive pricing. 🍩`,
      hashtags: ['#DonutEquipment','#BakeryLife','#CommercialBaking','#DonutShop','#BakerGoals','#FoodService','#ArtisanDonuts'],
      characterCount: 198, tone: 'Aspirational', bestPostTime: 'Wed 11am',
    },
    {
      platform: 'linkedin',
      caption: `Running a high-volume donut operation in 2026 requires equipment that keeps up.\n\nHere's what separates good equipment from great:\n→ Temperature consistency within ±2°F\n→ Recovery time under 45 seconds\n→ Capacity that matches your peak hour\n\nWe've helped 200+ bakeries upgrade their production lines. ${topic} — what metrics do you benchmark when evaluating equipment?`,
      hashtags: ['#BakeryBusiness','#CommercialKitchen','#FoodService'],
      characterCount: 412, tone: 'Professional / Thought Leadership', bestPostTime: 'Tue 8am',
    },
    {
      platform: 'tiktok',
      caption: `${topic} 🔥 Wait for the end!! #DonutTok #BakeryLife #FoodFactory #ASMR`,
      hashtags: ['#DonutTok','#BakeryLife','#FoodFactory','#ASMR','#CommercialBaking','#DonutEquipment'],
      characterCount: 78, tone: 'Casual / High Energy', bestPostTime: 'Thu 8pm',
    },
    {
      platform: 'x-twitter',
      caption: `${topic} — and yes, it ships same day if you order before 2pm 📦`,
      hashtags: ['#Bakery','#Donuts'],
      characterCount: 84, tone: 'Direct / Punchy', bestPostTime: 'Wed noon',
    },
    {
      platform: 'facebook',
      caption: `Exciting news from the shop 🎉\n\n${topic}\n\nWe've been working on this for months and are thrilled to finally share it with our bakery community. Click "Learn More" to get full details and early-bird pricing — available for the next 48 hours only!`,
      hashtags: ['#Bakery','#CommercialBaking','#DonutEquipment','#NewProduct'],
      characterCount: 284, tone: 'Community-Friendly', bestPostTime: 'Fri 11am',
    },
  ];
}

// ─── Post Approvals (Kanban) ──────────────────────────────────────────────────

export type ApprovalStatus = 'draft' | 'review' | 'approved' | 'published' | 'rejected';

export interface ApprovalPost {
  id: string;
  store: string;
  title: string;
  platforms: string[];
  status: ApprovalStatus;
  author: string;
  scheduledFor: string;
  content: string;
  rejectionNote?: string;
}

export const SAMPLE_APPROVAL_POSTS: ApprovalPost[] = [
  { id: 'ap-1', store: 'donut-equipment.com', title: 'Summer Fryer Promo — Instagram',   platforms: ['instagram', 'facebook'], status: 'review',   author: 'Sarah K.',   scheduledFor: '2026-05-15 10:00', content: '🍩 Summer savings are here! Get 20% off our pro donut fryers...' },
  { id: 'ap-2', store: 'donut-equipment.com', title: 'Bakery Tips Video — YouTube',       platforms: ['youtube'],               status: 'review',   author: 'Mike R.',    scheduledFor: '2026-05-16 14:00', content: 'New tutorial: 5 tips for perfect donuts every time...' },
  { id: 'ap-3', store: 'bakery-wholesalers.com', title: 'Wholesale Catalog — LinkedIn',      platforms: ['linkedin'],              status: 'approved', author: 'Sarah K.',   scheduledFor: '2026-05-14 09:00', content: 'Bakery Wholesalers Spring Catalog 2026 is live...' },
  { id: 'ap-4', store: 'donut-supplies.com', title: 'TikTok — Glaze Recipe Demo',        platforms: ['tiktok', 'instagram'],   status: 'draft',    author: 'Jenny L.',   scheduledFor: '2026-05-17 18:00', content: 'Watch us make 3 glaze flavors in under 60 seconds...' },
  { id: 'ap-5', store: 'donut-supplies.com', title: 'X/Twitter — Flash Sale Alert',      platforms: ['x-twitter'],             status: 'rejected', author: 'Mike R.',    scheduledFor: '2026-05-13 12:00', content: '⚡ 4-HOUR FLASH SALE — 30% off all supplies...', rejectionNote: 'Discount too aggressive — max 20%. Resubmit.' },
  { id: 'ap-6', store: 'donut-equipment.com', title: 'FB — Customer Spotlight',           platforms: ['facebook'],              status: 'published', author: 'Jenny L.',  scheduledFor: '2026-05-12 11:00', content: 'Meet Oak Street Bakery — they\'ve been using our fryers for 5 years...' },
  { id: 'ap-7', store: 'donut-equipment.com', title: 'Instagram Reel — Behind the Scenes', platforms: ['instagram'],            status: 'draft',    author: 'Sarah K.',   scheduledFor: '2026-05-18 15:00', content: 'Go behind the scenes at our warehouse — see how your order ships...' },
];

// ─── DM Automation ────────────────────────────────────────────────────────────

export type DMPlatform = 'instagram' | 'facebook' | 'tiktok';
export type DMTrigger = 'comment_keyword' | 'story_reply' | 'first_dm' | 'post_reaction';

export interface DMRule {
  id: string;
  store: string;
  name: string;
  platform: DMPlatform;
  trigger: DMTrigger;
  keyword?: string;
  replyMessage: string;
  dmMessage: string;
  status: 'active' | 'paused';
  triggeredCount: number;
  conversionCount: number;
}

export const SAMPLE_DM_RULES: DMRule[] = [
  { id: 'dm-1', store: 'donut-equipment.com', name: 'Fryer Info Comment Capture',     platform: 'instagram', trigger: 'comment_keyword', keyword: 'price',     replyMessage: 'Check your DMs! 📬',                      dmMessage: 'Hi! You asked about our fryer prices. Here\'s the link to our full catalog: [catalog-link]. Reply with any questions!', status: 'active', triggeredCount: 284, conversionCount: 47 },
  { id: 'dm-2', store: 'donut-equipment.com', name: 'Equipment Guide — "info" trigger', platform: 'instagram', trigger: 'comment_keyword', keyword: 'info',      replyMessage: 'Sending you our guide now! 🍩',            dmMessage: 'Hi! Here\'s our free Commercial Donut Equipment Guide: [guide-link]. Let me know if you have questions!',               status: 'active', triggeredCount: 192, conversionCount: 38 },
  { id: 'dm-3', store: 'donut-supplies.com', name: 'FB Story Reply Capture',          platform: 'facebook',  trigger: 'story_reply',    keyword: undefined,   replyMessage: '',                                         dmMessage: 'Thanks for the reply! Want to know more about our donut supplies? Click here: [link]',                                  status: 'active', triggeredCount: 64,  conversionCount: 12 },
  { id: 'dm-4', store: 'donut-equipment.com', name: 'TikTok Comment — "how much"',     platform: 'tiktok',    trigger: 'comment_keyword', keyword: 'how much',  replyMessage: 'Check DMs for pricing! 💬',               dmMessage: 'Hey! Pricing starts at $299 for our entry-level fryers. Full catalog: [link]',                                         status: 'paused', triggeredCount: 89,  conversionCount: 9  },
  { id: 'dm-5', store: 'donut-equipment.com', name: 'New Follower Welcome',             platform: 'instagram', trigger: 'first_dm',       keyword: undefined,   replyMessage: '',                                         dmMessage: 'Welcome to Donut Equipment! 🍩 Here\'s a 10% welcome discount for your first order: WELCOME10. Shop here: [link]',    status: 'active', triggeredCount: 420, conversionCount: 53 },
];
