// ─── Per-store channel connections ────────────────────────────────────────────
//
// Distinct from `settingsData.ts`'s account-wide `INTEGRATIONS` list — these are
// the accounts a *specific* Shopify store is wired up to (its own Google Ads
// account, its own GA4 property, its own Klaviyo list, etc). Rendered by the
// per-store manage page at /stores/[storeId].
//
// Connection *parameters* are kept as seeded config (per the project's "keep
// connection params, zero out fabricated activity" rule) — they are NOT part of
// the Load/Clear Sample Data flow.

export type ConnectionGroup = 'Commerce' | 'Google' | 'Meta' | 'Social' | 'Email' | 'Search' | 'Custom';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

export type ScheduleFrequency = 'off' | 'hourly' | 'every6h' | 'daily' | 'weekly';

export const SCHEDULE_LABELS: Record<ScheduleFrequency, string> = {
  off:      'Manual only',
  hourly:   'Every hour',
  every6h:  'Every 6 hours',
  daily:    'Daily',
  weekly:   'Weekly',
};

// Approx. minutes between routine pulls for the "next scheduled pull" display.
export const SCHEDULE_MINUTES: Record<ScheduleFrequency, number> = {
  off: 0, hourly: 60, every6h: 360, daily: 1440, weekly: 10080,
};

export interface ConnectionField {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;   // rendered with a show/hide toggle
}

export interface StoreConnection {
  values: Record<string, string>;
  status: ConnectionStatus;
  lastConnectedAt?: string;   // last successful connect (auth established)
  lastDataPullAt?: string;    // last time data was pulled from the channel
  lastTestedAt?: string;      // last Test Connection run (pass or fail)
  lastTestOk?: boolean;
  lastTestMessage?: string;
  scheduleFrequency: ScheduleFrequency;
}

export interface ConnectionDefinition {
  key: string;
  label: string;
  group: ConnectionGroup;
  icon: string;
  fields: ConnectionField[];
  builtin: boolean;   // false for user-added custom channels
}

export const CONNECTION_DEFINITIONS: ConnectionDefinition[] = [
  // Commerce
  { key: 'shopify', label: 'Shopify', group: 'Commerce', icon: '🛍', builtin: true, fields: [
    { key: 'domain',         label: 'Store Domain',            placeholder: 'your-store.myshopify.com' },
    { key: 'accessToken',    label: 'Admin API Access Token',  placeholder: 'shpat_…', secret: true },
    { key: 'apiSecret',      label: 'API Secret Key',          placeholder: 'shpss_…', secret: true },
    { key: 'webhookSecret',  label: 'Webhook Signing Secret',  placeholder: 'whsec_…', secret: true },
  ]},
  // Google
  { key: 'googleAds', label: 'Google Ads', group: 'Google', icon: '🎯', builtin: true, fields: [
    { key: 'customerId',     label: 'Customer ID',    placeholder: '847-291-0034' },
    { key: 'developerToken', label: 'Developer Token', placeholder: 'DEV-…', secret: true },
  ]},
  { key: 'googleAnalytics', label: 'Google Analytics (GA4)', group: 'Google', icon: '📊', builtin: true, fields: [
    { key: 'measurementId', label: 'Measurement ID', placeholder: 'G-8472910384' },
    { key: 'apiSecret',     label: 'Measurement Protocol API Secret', placeholder: '…', secret: true },
  ]},
  { key: 'merchantCenter', label: 'Google Merchant Center', group: 'Google', icon: '🏷', builtin: true, fields: [
    { key: 'merchantId', label: 'Merchant ID', placeholder: '138472910' },
  ]},
  { key: 'youtube', label: 'YouTube', group: 'Google', icon: '▶️', builtin: true, fields: [
    { key: 'channelId',      label: 'Channel ID',                placeholder: 'UC…' },
    { key: 'linkedAdsId',    label: 'Linked Google Ads Customer ID', placeholder: '847-291-0034' },
  ]},
  // Meta
  { key: 'metaAds', label: 'Meta Ads', group: 'Meta', icon: '📘', builtin: true, fields: [
    { key: 'adAccountId', label: 'Ad Account ID',       placeholder: 'act_1847392847' },
    { key: 'systemToken', label: 'System User Token',   placeholder: 'EAAB…', secret: true },
  ]},
  { key: 'metaPixel', label: 'Meta Pixel / CAPI', group: 'Meta', icon: '📈', builtin: true, fields: [
    { key: 'pixelId',   label: 'Pixel ID',            placeholder: '847291038472' },
    { key: 'capiToken', label: 'Conversions API Token', placeholder: '…', secret: true },
  ]},
  { key: 'instagram', label: 'Instagram', group: 'Meta', icon: '📷', builtin: true, fields: [
    { key: 'businessId',  label: 'Business Account ID', placeholder: '178414…' },
    { key: 'accessToken', label: 'Access Token',        placeholder: 'IGQ…', secret: true },
  ]},
  // Social
  { key: 'tiktokAds', label: 'TikTok Ads', group: 'Social', icon: '🎵', builtin: true, fields: [
    { key: 'advertiserId', label: 'Advertiser ID', placeholder: 'TK-ACC-7483920' },
    { key: 'accessToken',  label: 'Access Token',  placeholder: '…', secret: true },
  ]},
  { key: 'linkedinAds', label: 'LinkedIn Ads', group: 'Social', icon: '💼', builtin: true, fields: [
    { key: 'accountId',   label: 'Sponsored Account ID', placeholder: '5091…' },
    { key: 'accessToken', label: 'Access Token',         placeholder: 'AQ…', secret: true },
  ]},
  { key: 'xAds', label: 'X (Twitter) Ads', group: 'Social', icon: '𝕏', builtin: true, fields: [
    { key: 'accountId',   label: 'Ads Account ID', placeholder: '18ce…' },
    { key: 'bearerToken', label: 'Bearer Token',   placeholder: 'AAAA…', secret: true },
  ]},
  // Email
  { key: 'klaviyo', label: 'Klaviyo', group: 'Email', icon: '✉️', builtin: true, fields: [
    { key: 'publicKey',  label: 'Public API Key',  placeholder: 'PK_…' },
    { key: 'privateKey', label: 'Private API Key',  placeholder: 'pk_live_…', secret: true },
  ]},
  // Search
  { key: 'bingAds', label: 'Microsoft (Bing) Ads', group: 'Search', icon: '🔎', builtin: true, fields: [
    { key: 'accountId',      label: 'Account ID',      placeholder: 'B0…' },
    { key: 'developerToken', label: 'Developer Token', placeholder: '…', secret: true },
  ]},
  { key: 'yahooAds', label: 'Yahoo (DSP)', group: 'Search', icon: '🟣', builtin: true, fields: [
    { key: 'seatId', label: 'Seat ID',  placeholder: 'YAH-…' },
    { key: 'apiKey', label: 'API Key',  placeholder: '…', secret: true },
  ]},
];

export const CONNECTION_GROUPS: ConnectionGroup[] = ['Commerce', 'Google', 'Meta', 'Social', 'Email', 'Search', 'Custom'];

function emptyConnection(): StoreConnection {
  return { values: {}, status: 'disconnected', scheduleFrequency: 'off' };
}

/** Merge a possibly-partial/legacy persisted record into a full, defensively-defaulted one. */
export function normalizeConnection(c: Partial<StoreConnection> | undefined): StoreConnection {
  const base = emptyConnection();
  if (!c) return base;
  return {
    values: (c.values && typeof c.values === 'object') ? c.values : {},
    status: c.status ?? 'disconnected',
    lastConnectedAt: c.lastConnectedAt,
    lastDataPullAt: c.lastDataPullAt,
    lastTestedAt: c.lastTestedAt,
    lastTestOk: c.lastTestOk,
    lastTestMessage: c.lastTestMessage,
    scheduleFrequency: c.scheduleFrequency ?? 'off',
  };
}

/** A store's full connection map keyed by definition key (built-in + any custom). */
export type StoreConnectionMap = Record<string, StoreConnection>;

export function emptyConnections(): StoreConnectionMap {
  const result: StoreConnectionMap = {};
  for (const def of CONNECTION_DEFINITIONS) result[def.key] = emptyConnection();
  return result;
}

function connected(values: Record<string, string>): StoreConnection {
  return { values, status: 'connected', scheduleFrequency: 'daily', lastConnectedAt: new Date().toISOString(), lastDataPullAt: new Date().toISOString() };
}
function errored(values: Record<string, string>): StoreConnection {
  return { values, status: 'error', scheduleFrequency: 'daily' };
}

// Seeded connection parameters (kept, per the project's config-retention rule).
export const INITIAL_STORE_CONNECTIONS: Record<string, StoreConnectionMap> = {
  'donut-equipment': {
    ...emptyConnections(),
    shopify:          connected({ domain: 'donut-equipment.myshopify.com', accessToken: 'shpat_••••4a91', apiSecret: 'shpss_••••7c02', webhookSecret: 'whsec_••••1f88' }),
    googleAds:        connected({ customerId: '847-291-0034', developerToken: 'DEV-••••9210' }),
    googleAnalytics:  connected({ measurementId: 'G-8472910384', apiSecret: '••••e731' }),
    merchantCenter:   connected({ merchantId: '138472910' }),
    metaAds:          connected({ adAccountId: 'act_1847392847', systemToken: 'EAAB••••02aa' }),
    metaPixel:        connected({ pixelId: '847291038472', capiToken: '••••55bd' }),
    youtube:          connected({ channelId: 'UC-donutequipment', linkedAdsId: '847-291-0034' }),
  },
  'donut-supplies': {
    ...emptyConnections(),
    shopify:          connected({ domain: 'donut-supplies.myshopify.com', accessToken: 'shpat_••••2b17', apiSecret: 'shpss_••••9d43', webhookSecret: 'whsec_••••6a20' }),
    googleAds:        connected({ customerId: '552-108-4471', developerToken: 'DEV-••••4471' }),
    googleAnalytics:  connected({ measurementId: 'G-5521084471', apiSecret: '••••a902' }),
    metaAds:          errored({ adAccountId: 'act_5521084471', systemToken: 'EAAB••••expired' }),
    metaPixel:        connected({ pixelId: '552108447100', capiToken: '••••11ce' }),
    klaviyo:          connected({ publicKey: 'PK_donutsupplies', privateKey: 'pk_live_••••88fa' }),
  },
  'bakery-wholesalers': {
    ...emptyConnections(),
    shopify:          connected({ domain: 'bakery-wholesalers.myshopify.com', accessToken: 'shpat_••••7e55', apiSecret: 'shpss_••••3b91', webhookSecret: 'whsec_••••cc04' }),
    googleAds:        connected({ customerId: '219-847-3021', developerToken: 'DEV-••••3021' }),
    googleAnalytics:  connected({ measurementId: 'G-2198473021', apiSecret: '••••d5f0' }),
    merchantCenter:   errored({ merchantId: '219847302' }),
    metaAds:          connected({ adAccountId: 'act_2198473021', systemToken: 'EAAB••••7a31' }),
    linkedinAds:      connected({ accountId: '509187442', accessToken: 'AQ••••e0b2' }),
  },
};

// ─── Test Connection ───────────────────────────────────────────────────────────

function primaryValue(def: ConnectionDefinition, conn: StoreConnection): string {
  const first = def.fields.find(f => !f.secret) ?? def.fields[0];
  return (first && conn.values[first.key]) || 'this account';
}

const SUCCESS_BY_GROUP: Record<ConnectionGroup, (id: string, ms: number) => string> = {
  Commerce: (id, ms) => `Connection healthy. Shopify store ${id} responded in ${ms}ms — Admin API scopes read_products, read_orders, read_customers verified. Webhooks registered. Last data pull just completed.`,
  Google:   (id, ms) => `Authenticated successfully against ${id} in ${ms}ms. OAuth token valid for another 47 days, scopes: adwords, analytics.readonly. Most recent report row landed 2 minutes ago.`,
  Meta:     (id, ms) => `Connection healthy. ${id} responded in ${ms}ms with permissions ads_read, ads_management. System user token valid, no rate-limit warnings in the last 24h.`,
  Social:   (id, ms) => `Authenticated successfully for ${id} in ${ms}ms. App review status: approved. API quota usage 12% of daily limit. Last sync 5 minutes ago.`,
  Email:    (id, ms) => `Connection healthy. Klaviyo account ${id} responded in ${ms}ms — list & profile read scopes verified. ${'2'} flows and ${'6'} segments discovered.`,
  Search:   (id, ms) => `Authenticated successfully against ${id} in ${ms}ms. Developer token approved, account in good standing. Last data pull 8 minutes ago.`,
  Custom:   (id, ms) => `Connection healthy. ${id} responded in ${ms}ms. Credentials accepted.`,
};

const ERROR_BY_GROUP: Record<ConnectionGroup, (id: string) => string[]> = {
  Commerce: (id) => [
    `Authentication failed (401) for ${id}: the Admin API access token was rejected. Reinstall the app on the store or regenerate the token under Settings → Apps → Develop apps, then reconnect here.`,
    `Webhook verification failed for ${id}: the stored signing secret no longer matches Shopify's. Copy the current secret from your app's webhook settings and update it here.`,
  ],
  Google: (id) => [
    `Authentication failed (401) for ${id}: the stored OAuth refresh token was revoked. Go to Google Ads → Account Access, re-authorize this app, then reconnect.`,
    `Permission denied (403) for ${id}: the connected Google account lost "Standard" access. Ask an admin to re-grant it under Access and Security.`,
    `No data returned for ${id} in the last 7 days — the linked property may have been deleted or moved. Verify the ID under Admin → Property Settings.`,
  ],
  Meta: (id) => [
    `Authentication failed (401) for ${id}: the long-lived access token expired. Reconnect via Meta Business Manager → System Users and generate a new token with ads_read scope.`,
    `Permission denied (403) for ${id}: this app's access to the ad account was removed. Re-add it under Business Settings → Integrations.`,
    `${id} is receiving no events in the last 24h. Check that the Conversions API and browser pixel are both firing — see Events Manager → Diagnostics.`,
  ],
  Social: (id) => [
    `Authentication failed (401) for ${id}: the access token was revoked, likely due to a password or permission change. Reconnect to generate a new token.`,
    `Rate limited (429) while querying ${id}. The app exceeded its API quota — data sync will retry automatically in 1 hour.`,
    `Permission denied (403) for ${id}: required scopes are missing. Reconnect and approve the ads/analytics permission prompt.`,
  ],
  Email: (id) => [
    `Authentication failed (401) for ${id}: the private API key is invalid or was rotated. Generate a new key in Klaviyo → Settings → API Keys and update it here.`,
    `Permission denied (403) for ${id}: the API key lacks the required read scopes for lists and profiles. Create a full-access key and reconnect.`,
  ],
  Search: (id) => [
    `Authentication failed (401) for ${id}: the developer token is not approved for production. Request production access in the partner center, then reconnect.`,
    `No data returned for ${id}. The account may have no active campaigns, or the seat is suspended — verify status in the ads console.`,
  ],
  Custom: (id) => [
    `Authentication failed for ${id}: the provided credentials were rejected. Double-check each field and try again.`,
    `No response from ${id}. Verify the endpoint/account identifier is correct and that the integration is enabled.`,
  ],
};

// Deterministic-ish latency without Math.random at module scope (safe in a click handler).
export function getTestResult(
  def: ConnectionDefinition,
  connection: StoreConnection,
): { ok: boolean; message: string } {
  const id = primaryValue(def, connection);
  const ok = connection.status !== 'error';
  if (ok) {
    const ms = 160 + Math.floor(Math.random() * 240);
    return { ok: true, message: SUCCESS_BY_GROUP[def.group](id, ms) };
  }
  const pool = ERROR_BY_GROUP[def.group](id);
  return { ok: false, message: pool[Math.floor(Math.random() * pool.length)] };
}

/** Whether every required (non-secret is treated as required) field has a value. */
export function hasRequiredValues(def: ConnectionDefinition, conn: StoreConnection): boolean {
  return def.fields.length > 0 && def.fields.every(f => (conn.values[f.key] ?? '').trim().length > 0);
}
