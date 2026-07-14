// ─── Per-store ad/analytics account connections ───────────────────────────────
//
// Distinct from `settingsData.ts`'s account-wide `INTEGRATIONS` list — these are
// the accounts a *specific* Shopify store is wired up to (one Google Ads account
// for this store, one GA4 property for this store, etc).

export type ConnectionGroup = 'Google' | 'Facebook' | 'Social';

export type ConnectionKey =
  | 'googleAds'
  | 'googleAnalytics'
  | 'merchantCenter'
  | 'facebookAds'
  | 'facebookAnalytics'
  | 'tiktokAds'
  | 'tiktokAnalytics'
  | 'youtubeAds'
  | 'youtubeAnalytics'
  | 'xTwitterAds'
  | 'xTwitterAnalytics'
  | 'linkedinAds'
  | 'linkedinAnalytics';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface StoreConnection {
  accountId: string;
  status: ConnectionStatus;
  lastTestedAt?: string;
  lastTestOk?: boolean;
  lastTestMessage?: string;
}

export interface ConnectionDefinition {
  key: ConnectionKey;
  label: string;
  group: ConnectionGroup;
  icon: string;
  placeholder: string;
}

export const CONNECTION_DEFINITIONS: ConnectionDefinition[] = [
  { key: 'googleAds',          label: 'Google Ads',            group: 'Google',   icon: '🎯', placeholder: 'Customer ID, e.g. 847-291-0034' },
  { key: 'googleAnalytics',    label: 'Google Analytics (GA4)', group: 'Google',   icon: '📊', placeholder: 'Measurement ID, e.g. G-8472910384' },
  { key: 'merchantCenter',     label: 'Google Merchant Center', group: 'Google',   icon: '🛒', placeholder: 'Merchant ID, e.g. 138472910' },
  { key: 'facebookAds',        label: 'Facebook Ads',          group: 'Facebook', icon: '📘', placeholder: 'Ad account ID, e.g. act_1847392847' },
  { key: 'facebookAnalytics',  label: 'Facebook Analytics',    group: 'Facebook', icon: '📈', placeholder: 'Pixel ID, e.g. 847291038472' },
  { key: 'tiktokAds',          label: 'TikTok Ads',            group: 'Social',   icon: '🎵', placeholder: 'Advertiser ID, e.g. TK-ACC-7483920' },
  { key: 'tiktokAnalytics',    label: 'TikTok Analytics',       group: 'Social',   icon: '🎵', placeholder: 'Business account handle' },
  { key: 'youtubeAds',         label: 'YouTube Ads',            group: 'Social',   icon: '▶️', placeholder: 'Linked Google Ads customer ID' },
  { key: 'youtubeAnalytics',   label: 'YouTube Analytics',      group: 'Social',   icon: '▶️', placeholder: 'Channel ID' },
  { key: 'xTwitterAds',        label: 'X (Twitter) Ads',        group: 'Social',   icon: '𝕏', placeholder: 'Ads account ID' },
  { key: 'xTwitterAnalytics',  label: 'X (Twitter) Analytics',  group: 'Social',   icon: '𝕏', placeholder: '@handle' },
  { key: 'linkedinAds',        label: 'LinkedIn Ads',           group: 'Social',   icon: '💼', placeholder: 'Sponsored account ID' },
  { key: 'linkedinAnalytics',  label: 'LinkedIn Analytics',     group: 'Social',   icon: '💼', placeholder: 'Company page ID' },
];

export function emptyConnections(): Record<ConnectionKey, StoreConnection> {
  const result = {} as Record<ConnectionKey, StoreConnection>;
  for (const def of CONNECTION_DEFINITIONS) {
    result[def.key] = { accountId: '', status: 'disconnected' };
  }
  return result;
}

// Defensive merge — never let a missing key (legacy localStorage record, or a
// slot added after a user already had data saved) crash the settings page.
export function withDefaults(
  connections: Partial<Record<ConnectionKey, StoreConnection>> | undefined,
): Record<ConnectionKey, StoreConnection> {
  const base = emptyConnections();
  if (!connections) return base;
  for (const def of CONNECTION_DEFINITIONS) {
    const existing = connections[def.key];
    if (existing) base[def.key] = existing;
  }
  return base;
}

function seedConnected(accountId: string): StoreConnection {
  return { accountId, status: 'connected' };
}

function seedError(accountId: string): StoreConnection {
  return { accountId, status: 'error' };
}

export const INITIAL_STORE_CONNECTIONS: Record<string, Record<ConnectionKey, StoreConnection>> = {
  'donut-equipment': {
    ...emptyConnections(),
    googleAds:         seedConnected('847-291-0034'),
    googleAnalytics:   seedConnected('G-8472910384'),
    merchantCenter:    seedConnected('138472910'),
    facebookAds:       seedConnected('act_1847392847'),
    facebookAnalytics: seedConnected('847291038472'),
    youtubeAnalytics:  seedConnected('UC-donutequipment'),
  },
  'donut-supplies': {
    ...emptyConnections(),
    googleAds:         seedConnected('552-108-4471'),
    googleAnalytics:   seedConnected('G-5521084471'),
    // Mirrors this store's overall "Auth Error" badge in the store card above.
    facebookAds:       seedError('act_5521084471'),
    facebookAnalytics: seedConnected('552108447100'),
  },
  'bakery-wholesalers': {
    ...emptyConnections(),
    googleAds:         seedConnected('219-847-3021'),
    googleAnalytics:   seedConnected('G-2198473021'),
    merchantCenter:    seedError('219847302'),
    facebookAds:       seedConnected('act_2198473021'),
    facebookAnalytics: seedConnected('219847302100'),
  },
};

// ─── Test Connection ───────────────────────────────────────────────────────────

const SUCCESS_MESSAGES: Record<ConnectionGroup, (accountId: string) => string[]> = {
  Google: (id) => [
    `Connection healthy. Account ${id} responded in ${180 + Math.floor(Math.random() * 220)}ms with scopes: adwords, analytics.readonly. Last data sync 4 minutes ago.`,
    `Authenticated successfully against ${id}. OAuth token valid for another 47 days. Most recent report row landed 2 minutes ago.`,
  ],
  Facebook: (id) => [
    `Connection healthy. Ad account ${id} responded in ${160 + Math.floor(Math.random() * 200)}ms with permissions: ads_read, ads_management. Last sync 3 minutes ago.`,
    `Authenticated successfully via Meta Business Manager for ${id}. System user token valid, no rate-limit warnings in the last 24h.`,
  ],
  Social: (id) => [
    `Connection healthy. Account ${id} responded in ${200 + Math.floor(Math.random() * 250)}ms. App review status: approved. Last sync 5 minutes ago.`,
    `Authenticated successfully for ${id}. API quota usage: 12% of daily limit. No permission warnings.`,
  ],
};

const ERROR_MESSAGES: Record<ConnectionGroup, (accountId: string) => string[]> = {
  Google: (id) => [
    `Authentication failed (401) for ${id}: the stored OAuth refresh token was revoked. Go to Google Ads → Account Access and re-authorize this app, then reconnect here.`,
    `Permission denied (403) for ${id}: the connected Google account no longer has "Standard" access on this account. Ask an admin to re-grant access in Google Ads → Access and Security.`,
    `No data returned for ${id} in the last 7 days. The linked property may have been deleted or moved — verify the ID under Admin → Property Settings in Google Analytics.`,
  ],
  Facebook: (id) => [
    `Authentication failed (401) for ${id}: the long-lived access token expired. Reconnect via Meta Business Manager → System Users and generate a new token with ads_read scope.`,
    `Permission denied (403) for ${id}: this app's access to the ad account was removed. Ask a Business Manager admin to re-add the app under Business Settings → Integrations.`,
    `Pixel ${id} is receiving no events in the last 24h. Check that the Conversions API and browser pixel are both firing — see Events Manager → Diagnostics for details.`,
  ],
  Social: (id) => [
    `Authentication failed (401) for ${id}: the access token was revoked, likely due to a password or app-permission change. Reconnect the account to generate a new token.`,
    `Rate limited (429) while querying ${id}. The app exceeded its API quota — data sync will retry automatically in 1 hour.`,
    `Permission denied (403) for ${id}: required scopes are missing. Reconnect and make sure to approve the ads/analytics permission prompt this time.`,
  ],
};

export function getTestResult(
  key: ConnectionKey,
  connection: StoreConnection,
): { ok: boolean; message: string } {
  const def = CONNECTION_DEFINITIONS.find(d => d.key === key)!;
  const pool = connection.status === 'error'
    ? ERROR_MESSAGES[def.group](connection.accountId || 'this account')
    : SUCCESS_MESSAGES[def.group](connection.accountId || 'this account');
  const message = pool[Math.floor(Math.random() * pool.length)];
  return { ok: connection.status !== 'error', message };
}
