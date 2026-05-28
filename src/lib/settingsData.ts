// Types
export type IntegrationCategory =
  | 'advertising'
  | 'ecommerce'
  | 'social'
  | 'analytics'
  | 'automation'
  | 'communication'
  | 'crm'
  | 'design';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  icon: string;
  description: string;
  status: IntegrationStatus;
  accountName?: string;
  lastSync?: string;
  color: string;
}

export type TeamRole = 'admin' | 'editor' | 'viewer' | 'analyst';
export type TeamMemberStatus = 'active' | 'invited' | 'inactive';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar: string;
  lastActive: string;
  status: TeamMemberStatus;
}

export interface GeneralSettings {
  businessName: string;
  timezone: string;
  currency: string;
  fiscalYearStartMonth: number;
  dateFormat: string;
  language: string;
  reportLogoUrl: string;
}

export interface TrackingSettings {
  metaCapi: {
    enabled: boolean;
    pixelId: string;
    accessToken: string;
  };
  googleEnhanced: {
    enabled: boolean;
    conversionId: string;
    label: string;
  };
  serverSideEvents: string[];
}

export type NotificationChannel = 'email' | 'sms' | 'slack' | 'push';

export interface NotificationRule {
  id: string;
  label: string;
  email: boolean;
  sms: boolean;
  slack: boolean;
  push: boolean;
}

// ─── Integrations ─────────────────────────────────────────────────────────────

export const INTEGRATIONS: Integration[] = [
  {
    id: 'shopify-de',
    name: 'Shopify — Donut Equipment',
    category: 'ecommerce',
    icon: '🛍️',
    description: 'Sync orders, products, and customer data from your Shopify store.',
    status: 'connected',
    accountName: 'donut-equipment.myshopify.com',
    lastSync: new Date(Date.now() - 4 * 60000).toISOString(),
    color: '#10d98a',
  },
  {
    id: 'shopify-ds',
    name: 'Shopify — Donut Supplies',
    category: 'ecommerce',
    icon: '🛍️',
    description: 'Sync orders, products, and customer data from your Shopify store.',
    status: 'connected',
    accountName: 'donut-supplies.myshopify.com',
    lastSync: new Date(Date.now() - 7 * 60000).toISOString(),
    color: '#ffb347',
  },
  {
    id: 'shopify-bw',
    name: 'Shopify — Bakery Wholesale',
    category: 'ecommerce',
    icon: '🛍️',
    description: 'Sync orders, products, and customer data from your Shopify store.',
    status: 'connected',
    accountName: 'bakery-wholesalers.myshopify.com',
    lastSync: new Date(Date.now() - 2 * 60000).toISOString(),
    color: '#00d9ff',
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    category: 'advertising',
    icon: '🎯',
    description: 'Import campaign spend, impressions, clicks, and conversions.',
    status: 'connected',
    accountName: 'MKT-847-291-0034',
    lastSync: new Date(Date.now() - 12 * 60000).toISOString(),
    color: '#00d9ff',
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    category: 'advertising',
    icon: '📘',
    description: 'Sync Facebook and Instagram ad performance and audience data.',
    status: 'connected',
    accountName: 'act_1847392847',
    lastSync: new Date(Date.now() - 8 * 60000).toISOString(),
    color: '#7b93ff',
  },
  {
    id: 'tiktok-ads',
    name: 'TikTok Ads',
    category: 'advertising',
    icon: '🎵',
    description: 'Pull TikTok campaign data, spend, and video performance metrics.',
    status: 'connected',
    accountName: 'TK-ACC-7483920',
    lastSync: new Date(Date.now() - 15 * 60000).toISOString(),
    color: '#ff4444',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'social',
    icon: '▶️',
    description: 'Track video performance, views, subscribers, and ad revenue.',
    status: 'connected',
    accountName: 'MarketOS Brands',
    lastSync: new Date(Date.now() - 31 * 60000).toISOString(),
    color: '#ff4444',
  },
  {
    id: 'twitter-x',
    name: 'X / Twitter',
    category: 'social',
    icon: '𝕏',
    description: 'Monitor posts, engagement, follower growth, and ad campaigns.',
    status: 'connected',
    accountName: '@marketosbakery',
    lastSync: new Date(Date.now() - 22 * 60000).toISOString(),
    color: '#e8eaf3',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'social',
    icon: '💼',
    description: 'Sync LinkedIn company page analytics and sponsored content data.',
    status: 'disconnected',
    color: '#0077b5',
  },
  {
    id: 'google-search-console',
    name: 'Google Search Console',
    category: 'analytics',
    icon: '🔍',
    description: 'Import search impressions, clicks, position data, and indexing status.',
    status: 'connected',
    accountName: '3 properties verified',
    lastSync: new Date(Date.now() - 18 * 60000).toISOString(),
    color: '#10d98a',
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    category: 'analytics',
    icon: '📊',
    description: 'Pull session data, conversion events, and audience segments from GA4.',
    status: 'connected',
    accountName: 'G-8472910384',
    lastSync: new Date(Date.now() - 5 * 60000).toISOString(),
    color: '#ffb347',
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    category: 'automation',
    icon: '📧',
    description: 'Sync email flows, campaigns, revenue, and subscriber segments.',
    status: 'connected',
    accountName: 'pk_8f3a9b2c47e1d0...',
    lastSync: new Date(Date.now() - 9 * 60000).toISOString(),
    color: '#10d98a',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    icon: '🟠',
    description: 'Connect CRM contacts, deals, and pipeline data for full attribution.',
    status: 'disconnected',
    color: '#ff7a59',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    icon: '☁️',
    description: 'Import Salesforce leads, opportunities, and revenue attribution.',
    status: 'disconnected',
    color: '#00a1e0',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'automation',
    icon: '⚡',
    description: 'Trigger automations and data syncs across 5,000+ connected apps.',
    status: 'connected',
    accountName: '12 active zaps',
    lastSync: new Date(Date.now() - 42 * 60000).toISOString(),
    color: '#ff4a00',
  },
  {
    id: 'make',
    name: 'Make / Integromat',
    category: 'automation',
    icon: '🔄',
    description: 'Build visual automation workflows with advanced branching logic.',
    status: 'disconnected',
    color: '#6d00cc',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: '💬',
    description: 'Send alert notifications, reports, and daily summaries to Slack channels.',
    status: 'connected',
    accountName: '#marketOS-alerts',
    lastSync: new Date(Date.now() - 1 * 60000).toISOString(),
    color: '#4a154b',
  },
  {
    id: 'ms-teams',
    name: 'Microsoft Teams',
    category: 'communication',
    icon: '🟦',
    description: 'Push alerts and automated reports into Teams channels.',
    status: 'disconnected',
    color: '#6264a7',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'analytics',
    icon: '📊',
    description: 'Export campaign performance, revenue data, and custom reports directly to Google Sheets on a schedule.',
    status: 'disconnected',
    color: '#0f9d58',
  },
  {
    id: 'canva',
    name: 'Canva',
    category: 'design',
    icon: '🎨',
    description: 'Access brand assets and creative templates directly from your workspace.',
    status: 'disconnected',
    color: '#00c4cc',
  },
  {
    id: 'meta-capi',
    name: 'Meta Conversions API',
    category: 'advertising',
    icon: '🔌',
    description: 'Server-side event tracking for improved attribution and match quality.',
    status: 'connected',
    accountName: 'Pixel 847291038472',
    lastSync: new Date(Date.now() - 3 * 60000).toISOString(),
    color: '#7b93ff',
  },
  {
    id: 'google-enhanced',
    name: 'Google Enhanced Conversions',
    category: 'advertising',
    icon: '📡',
    description: 'Send hashed first-party conversion data to improve Google Ads measurement.',
    status: 'connected',
    accountName: 'AW-847291038',
    lastSync: new Date(Date.now() - 6 * 60000).toISOString(),
    color: '#00d9ff',
  },
];

// ─── General Settings ──────────────────────────────────────────────────────────

export const GENERAL_SETTINGS: GeneralSettings = {
  businessName: 'MarketOS Bakery Group',
  timezone: 'America/New_York',
  currency: 'USD',
  fiscalYearStartMonth: 1,
  dateFormat: 'MM/DD/YYYY',
  language: 'en-US',
  reportLogoUrl: '',
};

// ─── Team Members ─────────────────────────────────────────────────────────────

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-001',
    name: 'Rachel Thornton',
    email: 'rachel@marketosbakery.com',
    role: 'admin',
    avatar: 'RT',
    lastActive: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'tm-002',
    name: 'Derek Osei',
    email: 'derek@marketosbakery.com',
    role: 'editor',
    avatar: 'DO',
    lastActive: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: 'active',
  },
  {
    id: 'tm-003',
    name: 'Priya Menon',
    email: 'priya@marketosbakery.com',
    role: 'analyst',
    avatar: 'PM',
    lastActive: new Date(Date.now() - 1 * 3600000).toISOString(),
    status: 'active',
  },
  {
    id: 'tm-004',
    name: 'Jake Whitfield',
    email: 'jake@agency-partner.io',
    role: 'viewer',
    avatar: 'JW',
    lastActive: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: 'active',
  },
  {
    id: 'tm-005',
    name: 'Sam Castillo',
    email: 'sam.castillo@marketosbakery.com',
    role: 'editor',
    avatar: 'SC',
    lastActive: new Date(Date.now() - 3 * 3600000).toISOString(),
    status: 'invited',
  },
];

// ─── Tracking Settings ────────────────────────────────────────────────────────

export const TRACKING_SETTINGS: TrackingSettings = {
  metaCapi: {
    enabled: true,
    pixelId: '847291038472',
    accessToken: 'EAABcDE****************************Yk3x',
  },
  googleEnhanced: {
    enabled: true,
    conversionId: 'AW-847291038',
    label: 'Kx4jCLr8yNkDEMzS1r8B',
  },
  serverSideEvents: [
    'Purchase',
    'AddToCart',
    'ViewContent',
    'Lead',
    'CompleteRegistration',
    'InitiateCheckout',
    'AddPaymentInfo',
  ],
};

// ─── Notification Preferences ─────────────────────────────────────────────────

export const NOTIFICATION_PREFERENCES: NotificationRule[] = [
  { id: 'np-001', label: 'Critical alerts (downtime, errors)',         email: true,  sms: true,  slack: true,  push: true  },
  { id: 'np-002', label: 'SSL certificate expiration warnings',        email: true,  sms: false, slack: true,  push: false },
  { id: 'np-003', label: 'High response time / degraded performance',  email: true,  sms: false, slack: true,  push: true  },
  { id: 'np-004', label: 'Out-of-stock product detected',              email: true,  sms: false, slack: true,  push: false },
  { id: 'np-005', label: 'Price change detected',                      email: true,  sms: false, slack: false, push: false },
  { id: 'np-006', label: 'Daily performance summary',                  email: true,  sms: false, slack: true,  push: false },
  { id: 'np-007', label: 'Weekly report ready',                        email: true,  sms: false, slack: false, push: false },
  { id: 'np-008', label: 'Budget threshold reached (>90%)',            email: true,  sms: true,  slack: true,  push: true  },
  { id: 'np-009', label: 'Abandoned cart spike',                       email: false, sms: false, slack: true,  push: false },
  { id: 'np-010', label: 'New team member joined',                     email: true,  sms: false, slack: true,  push: false },
];
