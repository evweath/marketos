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

export const SOCIAL_POSTS: SocialPost[] = [
  // — Published ————————————————
  {
    id: 'sp-001', platforms: ['facebook', 'instagram'], status: 'published', category: 'product',
    caption: "🍩 New arrival: our AutoFryer XL 40L is here! Commercial-grade performance, whisper-quiet operation. Your donut shop deserves the best equipment. Link in bio for full specs. #DonutEquipment #CommercialBaking #DonutShop",
    hashtags: ['#DonutEquipment','#CommercialBaking','#DonutShop','#NewArrival'],
    mediaType: 'image', author: 'Sarah M.', store: 'donut-equipment.com',
    scheduledFor: daysFromNow(-3, 9, 0), publishedAt: daysFromNow(-3, 9, 0),
    likes: 284, comments: 47, shares: 31, reach: 8420, impressions: 12300, engagementRate: 4.3,
    boostEligible: true,
  },
  {
    id: 'sp-002', platforms: ['linkedin'], status: 'published', category: 'educational',
    caption: "3 signs your commercial donut fryer needs replacing:\n\n1. Inconsistent oil temperature → uneven browning\n2. Recovery time >90 seconds → production bottleneck\n3. Oil capacity degrading → increased waste\n\nWe work with 200+ bakeries nationwide. Here's what the high-volume shops prioritize when upgrading. Thread 🧵",
    hashtags: ['#BakeryBusiness','#FoodService','#CommercialKitchen'],
    mediaType: 'text', author: 'James K.', store: 'donut-equipment.com',
    scheduledFor: daysFromNow(-1, 8, 30), publishedAt: daysFromNow(-1, 8, 30),
    likes: 142, comments: 38, shares: 64, reach: 4280, impressions: 6700, engagementRate: 7.2,
    boostEligible: false,
  },
  {
    id: 'sp-003', platforms: ['tiktok', 'instagram'], status: 'published', category: 'behind-scenes',
    caption: "Watch 500 donuts get glazed in 60 seconds using our commercial glaze station 🤤 This is what efficiency looks like. Comment 'GLAZE' for pricing info!",
    hashtags: ['#DonutTok','#FoodFactory','#ASMR','#BakeryLife','#CommercialBaking'],
    mediaType: 'video', author: 'Sarah M.', store: 'donut-supplies.com',
    scheduledFor: daysFromNow(-2, 17, 0), publishedAt: daysFromNow(-2, 17, 0),
    likes: 1847, comments: 312, shares: 208, reach: 42000, impressions: 67000, engagementRate: 11.2,
    boostEligible: true,
  },

  // — Scheduled ————————————————
  {
    id: 'sp-004', platforms: ['facebook', 'instagram', 'x-twitter'], status: 'scheduled', category: 'promotional',
    caption: "🎉 FLASH SALE: 20% off all glazing mixes this weekend only! Stock up before summer donut season peaks. Use code GLAZE20 at checkout. Shop donut-supplies.com",
    hashtags: ['#FlashSale','#DonutSupplies','#BakeryDeals','#GlazingMix'],
    mediaType: 'image', author: 'Sarah M.', store: 'donut-supplies.com',
    scheduledFor: daysFromNow(1, 9, 0), aiOptimalTime: 'Tomorrow 9:00 AM',
  },
  {
    id: 'sp-005', platforms: ['linkedin'], status: 'scheduled', category: 'educational',
    caption: "Wholesale buyers: here's how the top bakery wholesalers are reducing ingredient costs by 18% in 2026.\n\nKey strategy: bulk AP flour + consolidated supplier relationships.\n\nWe've run the numbers for 50+ bakeries. Happy to share the framework — comment below.",
    hashtags: ['#WholesaleBaking','#BakeryROI','#FoodCost'],
    mediaType: 'text', author: 'James K.', store: 'bakerywholesalers.com',
    scheduledFor: daysFromNow(2, 8, 0), aiOptimalTime: 'Wed 8:00 AM',
  },
  {
    id: 'sp-006', platforms: ['tiktok'], status: 'scheduled', category: 'product',
    caption: "POV: you just received a pallet of premium donut mix 📦 The satisfying unboxing your bakery deserves. 50lb bags, bulk pricing, same-day shipping on orders before 2pm.",
    hashtags: ['#DonutTok','#BakingSupplies','#Unboxing','#BakeryLife'],
    mediaType: 'reel', author: 'Sarah M.', store: 'donut-supplies.com',
    scheduledFor: daysFromNow(1, 19, 0), aiOptimalTime: 'Tomorrow 7:00 PM',
  },
  {
    id: 'sp-007', platforms: ['instagram'], status: 'scheduled', category: 'seasonal',
    caption: "Summer donut flavors are hitting different this year 🍓🫐 Our seasonal glaze collection just dropped — strawberry basil, blueberry lavender, and citrus burst. Your customers will love it.",
    hashtags: ['#SummerFlavors','#SeasonalBaking','#DonutGlaze','#ArtisanDonuts','#BakeryLife'],
    mediaType: 'carousel', author: 'Sarah M.', store: 'donut-supplies.com',
    scheduledFor: daysFromNow(3, 10, 30), aiOptimalTime: 'Thu 10:30 AM',
  },
  {
    id: 'sp-008', platforms: ['youtube'], status: 'scheduled', category: 'educational',
    caption: "How to Set Up a Commercial Donut Production Line: Complete Guide (2026) | DonutEquipment.com\n\nIn this video we cover: equipment selection, workflow layout, fryer maintenance, and scaling from 200 to 2000 donuts/day.",
    hashtags: ['#CommercialBaking','#DonutEquipment','#BakeryStartup'],
    mediaType: 'video', author: 'James K.', store: 'donut-equipment.com',
    scheduledFor: daysFromNow(4, 12, 0), aiOptimalTime: 'Fri 12:00 PM',
  },
  {
    id: 'sp-009', platforms: ['facebook', 'linkedin'], status: 'scheduled', category: 'educational',
    caption: "Bulk buying guide for bakery wholesalers: how to calculate your monthly flour needs and negotiate volume discounts. We put together a free calculator — link in comments.",
    hashtags: ['#WholesaleBaking','#BakeryCosts','#BulkBuying'],
    mediaType: 'image', author: 'James K.', store: 'bakerywholesalers.com',
    scheduledFor: daysFromNow(5, 9, 0),
  },
  {
    id: 'sp-010', platforms: ['instagram', 'tiktok'], status: 'scheduled', category: 'ugc',
    caption: "Reposting @sweetdonuts_chicago's incredible maple bacon donut made with our glazing mix 🔥 Tag us in your creations! #MadeWithUs",
    hashtags: ['#UGC','#CustomerSpotlight','#DonutArtistry','#MadeWithUs'],
    mediaType: 'image', author: 'Sarah M.', store: 'donut-supplies.com',
    scheduledFor: daysFromNow(6, 15, 0),
  },

  // — Draft ————————————————————
  {
    id: 'sp-011', platforms: ['instagram'], status: 'draft', category: 'promotional',
    caption: "[DRAFT] New product announcement — wholesale pack pricing update. Need to add specifics and finalize creative.",
    hashtags: [],
    mediaType: 'image', author: 'Sarah M.', store: 'bakerywholesalers.com',
    scheduledFor: daysFromNow(7, 10, 0),
  },
  {
    id: 'sp-012', platforms: ['linkedin', 'x-twitter'], status: 'draft', category: 'educational',
    caption: "[DRAFT] Q2 bakery industry trend report. Waiting for design to finish infographic.",
    hashtags: ['#BakeryIndustry','#FoodTrends'],
    mediaType: 'image', author: 'James K.', store: 'donut-equipment.com',
    scheduledFor: daysFromNow(8, 9, 0),
  },

  // — In Review ————————————————
  {
    id: 'sp-013', platforms: ['facebook', 'instagram', 'linkedin'], status: 'review', category: 'promotional',
    caption: "🍩 Introducing our new B2B loyalty program for wholesale bakeries. Spend $5,000+/month and unlock exclusive pricing, priority shipping, and dedicated account management. Apply now at bakerywholesalers.com/loyalty",
    hashtags: ['#BakeryBusiness','#WholesalePartners','#LoyaltyProgram'],
    mediaType: 'image', author: 'James K.', approver: 'Michael D.', store: 'bakerywholesalers.com',
    scheduledFor: daysFromNow(2, 11, 0),
  },
];

// ─── Inbox Messages ───────────────────────────────────────────────────────────

export const INBOX_MESSAGES: InboxMessage[] = [
  {
    id: 'im-001', platform: 'instagram', type: 'comment', author: 'Sweet Rings Bakery', authorHandle: '@sweetrings_bklyn',
    avatarInitials: 'SR', sentiment: 'positive',
    content: 'Just got our AutoFryer XL and honestly it changed our production COMPLETELY. 400 donuts/hour with zero supervision 😭🙌 worth every penny!!',
    receivedAt: daysFromNow(0, 8, 14), replied: false, postCaption: 'New arrival: AutoFryer XL 40L is here!',
    requiresAttention: true,
  },
  {
    id: 'im-002', platform: 'facebook', type: 'comment', author: 'Marco Pellegrino', authorHandle: 'Marco Pellegrino',
    avatarInitials: 'MP', sentiment: 'negative',
    content: 'Ordered 3 weeks ago and still waiting. Customer service hasn\'t responded to 2 emails. Very disappointed.',
    receivedAt: daysFromNow(0, 7, 42), replied: false,
    requiresAttention: true,
  },
  {
    id: 'im-003', platform: 'linkedin', type: 'comment', author: 'Linda Hawthorne', authorHandle: 'Linda Hawthorne · Procurement Dir.',
    avatarInitials: 'LH', sentiment: 'positive',
    content: 'Great thread James! We switched our supplier last year and the bulk AP flour deal saved us ~$40k annually. Would love to connect and compare notes.',
    receivedAt: daysFromNow(0, 9, 5), replied: true,
    postCaption: 'Wholesale buyers: here\'s how to reduce ingredient costs by 18%',
    requiresAttention: false,
  },
  {
    id: 'im-004', platform: 'tiktok', type: 'comment', author: 'user4821009', authorHandle: '@user4821009',
    avatarInitials: 'U4', sentiment: 'positive',
    content: 'GLAZE',
    receivedAt: daysFromNow(0, 6, 22), replied: false, postCaption: '500 donuts get glazed in 60 seconds 🤤',
    requiresAttention: true,
  },
  {
    id: 'im-005', platform: 'tiktok', type: 'comment', author: 'donuttwin__', authorHandle: '@donuttwin__',
    avatarInitials: 'DT', sentiment: 'positive',
    content: 'How much is the glaze station?? Need this for my shop',
    receivedAt: daysFromNow(0, 5, 58), replied: false,
    requiresAttention: true,
  },
  {
    id: 'im-006', platform: 'instagram', type: 'dm', author: 'Sunrise Pastry Co', authorHandle: '@sunrisepastry',
    avatarInitials: 'SP', sentiment: 'neutral',
    content: 'Hi! Do you offer quantity discounts on the commercial donut mix? We\'re looking at ordering 200+ bags per month.',
    receivedAt: daysFromNow(0, 10, 30), replied: false,
    requiresAttention: true,
  },
  {
    id: 'im-007', platform: 'x-twitter', type: 'mention', author: 'bakery_insider', authorHandle: '@bakery_insider',
    avatarInitials: 'BI', sentiment: 'positive',
    content: 'Shoutout to @donutequipment for the fastest shipping I\'ve seen from a B2B supplier. Ordered Tuesday, arrived Thursday. 10/10',
    receivedAt: daysFromNow(-1, 14, 15), replied: true,
    requiresAttention: false,
  },
  {
    id: 'im-008', platform: 'facebook', type: 'review', author: 'Glazed & Confused LLC', authorHandle: 'Glazed & Confused LLC',
    avatarInitials: 'GC', sentiment: 'neutral',
    content: 'Good products overall. The fryer is excellent. Shipping took longer than expected but customer service was helpful when we called. 4/5 stars.',
    receivedAt: daysFromNow(-1, 11, 0), replied: false,
    requiresAttention: false,
  },
];

// ─── Social Listening ──────────────────────────────────────────────────────────

export const LISTENING_ITEMS: SocialListeningItem[] = [
  {
    id: 'sl-001', keyword: 'donut equipment', platform: 'x-twitter', author: '@ChefRamseyFan',
    content: 'Looking for recommendations on commercial donut equipment for a new shop opening in Austin. Anyone used donut-equipment.com?',
    sentiment: 'positive', reach: 420, foundAt: daysFromNow(0, 7, 30),
    url: 'https://x.com/post/123',
  },
  {
    id: 'sl-002', keyword: 'donut-equipment.com', platform: 'facebook', author: 'Bakers United Group',
    content: 'Has anyone ordered from donut-equipment.com lately? Seeing mixed reviews online.',
    sentiment: 'neutral', reach: 1840, foundAt: daysFromNow(0, 9, 10),
    url: 'https://facebook.com/post/456',
  },
  {
    id: 'sl-003', keyword: 'commercial donut fryer', platform: 'tiktok', author: '@bakery_builds',
    content: 'POV: installing a new commercial donut fryer. This thing is a BEAST 🤩 #DonutEquipment #BakeryLife',
    sentiment: 'positive', reach: 28400, foundAt: daysFromNow(0, 6, 0),
    url: 'https://tiktok.com/@bakery_builds/video/789',
  },
  {
    id: 'sl-004', keyword: 'bakery wholesale', platform: 'linkedin', author: 'National Bakery Association',
    content: 'New report: wholesale bakery ingredient costs rising 12% YoY. Smart procurement strategies can offset 60% of the impact. #BakeryBusiness',
    sentiment: 'neutral', reach: 8400, foundAt: daysFromNow(-1, 10, 0),
    url: 'https://linkedin.com/post/1001',
  },
];

// ─── Platform Engagement Stats ────────────────────────────────────────────────

export interface PlatformStats {
  platform: SocialPlatform;
  followers: number;
  followerDelta: number;
  avgEngagementRate: number;
  postsThisMonth: number;
  reachThisMonth: number;
  topPost: string;
}

export const PLATFORM_STATS: PlatformStats[] = [
  { platform: 'instagram',  followers: 14820, followerDelta: +342, avgEngagementRate: 4.8, postsThisMonth: 18, reachThisMonth: 142000, topPost: '500 donuts glazed in 60 sec 🤤' },
  { platform: 'facebook',   followers: 8240,  followerDelta: +87,  avgEngagementRate: 2.1, postsThisMonth: 14, reachThisMonth: 64000,  topPost: 'AutoFryer XL launch post' },
  { platform: 'tiktok',     followers: 22400, followerDelta: +1840,avgEngagementRate: 9.4, postsThisMonth: 12, reachThisMonth: 480000, topPost: '500 donuts glazed in 60 sec 🤤' },
  { platform: 'linkedin',   followers: 3120,  followerDelta: +64,  avgEngagementRate: 7.2, postsThisMonth: 8,  reachThisMonth: 28000,  topPost: '3 signs your fryer needs replacing' },
  { platform: 'youtube',    followers: 4780,  followerDelta: +124, avgEngagementRate: 3.1, postsThisMonth: 4,  reachThisMonth: 38000,  topPost: 'Commercial fryer setup guide' },
  { platform: 'x-twitter',  followers: 2840,  followerDelta: -12,  avgEngagementRate: 1.4, postsThisMonth: 22, reachThisMonth: 18000,  topPost: 'Shoutout via @bakery_insider' },
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
