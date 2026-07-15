import { SAMPLE_CAMPAIGNS, SAMPLE_AD_SETS, SAMPLE_CREATIVES, SAMPLE_AUTOMATION_RULES, SAMPLE_HEALTH_CHECKS } from './campaignData';
import { SAMPLE_ALERT_RULES, SAMPLE_FIRED_ALERTS } from './alertData';
import { SAMPLE_STORE_HEALTH, SAMPLE_TRAFFIC, SAMPLE_CONVERSIONS, SAMPLE_ABANDONED_CARTS, SAMPLE_TRANSACTIONS, SAMPLE_PAGE_CHANGES, SAMPLE_SEO_SNAPSHOTS } from './mockData';
import { SAMPLE_CHANNEL_METRICS, SAMPLE_TIME_SERIES, SAMPLE_ATTRIBUTION, SAMPLE_AI_INSIGHTS, SAMPLE_SHARED_REPORTS, emptyChannelMetrics, emptyTimeSeries, emptyAttribution } from './analyticsData';
import { SAMPLE_SOCIAL_POSTS, SAMPLE_INBOX_MESSAGES, SAMPLE_LISTENING_ITEMS, SAMPLE_PLATFORM_STATS, SAMPLE_APPROVAL_POSTS, SAMPLE_DM_RULES, emptyPlatformStats } from './socialData';
import { SAMPLE_EMAIL_FLOWS, SAMPLE_EMAIL_CAMPAIGNS, SAMPLE_SEGMENTS, SAMPLE_DELIVERABILITY } from './emailData';
import { SAMPLE_GENERATED_CREATIVES, SAMPLE_COMPETITOR_ADS, SAMPLE_PERFORMANCE_SCORES, SAMPLE_CAMPAIGN_BRIEFS, SAMPLE_BRAND_VOICE_SETTINGS, DEFAULT_BRAND_VOICE_SETTINGS } from './contentData';

// ─── Sample data registry ──────────────────────────────────────────────────
//
// The app boots with every persisted data key empty — no fabricated demo
// content ships as the default state. This registry is the single place
// that knows (a) every persisted-data key any module uses and (b) what
// realistic sample content to seed it with on demand. Settings → Data's
// "Load Sample Data" / "Clear All Data" controls just iterate this list.
//
// `usePersistentState` namespaces every key as `marketos.<key>` — this file
// writes/reads through that same prefix directly (bypassing React state)
// and reloads the page afterward, which is simpler and more robust than
// trying to keep N independent `usePersistentState` instances of the same
// key in sync client-side.
//
// Add one entry here per persisted data key as each module is retrofitted.

interface SampleDataEntry {
  key: string;
  sample: unknown;
  empty: unknown;
}

const REGISTRY: SampleDataEntry[] = [
  { key: 'ads.campaigns',        sample: SAMPLE_CAMPAIGNS,        empty: [] },
  { key: 'ads.adSets',           sample: SAMPLE_AD_SETS,          empty: [] },
  { key: 'ads.creatives',        sample: SAMPLE_CREATIVES,        empty: [] },
  { key: 'ads.automationRules',  sample: SAMPLE_AUTOMATION_RULES, empty: [] },
  { key: 'ads.healthChecks',     sample: SAMPLE_HEALTH_CHECKS,    empty: [] },
  { key: 'alerts.rules',         sample: SAMPLE_ALERT_RULES,      empty: [] },
  { key: 'alerts.list',          sample: SAMPLE_FIRED_ALERTS,     empty: [] },
  { key: 'monitoring.storeHealth', sample: SAMPLE_STORE_HEALTH,  empty: {} },
  { key: 'monitoring.traffic',     sample: SAMPLE_TRAFFIC,       empty: {} },
  { key: 'monitoring.conversions', sample: SAMPLE_CONVERSIONS,   empty: {} },
  { key: 'monitoring.abandonedCarts', sample: SAMPLE_ABANDONED_CARTS, empty: [] },
  { key: 'monitoring.transactions',   sample: SAMPLE_TRANSACTIONS,    empty: [] },
  { key: 'monitoring.pageChanges',    sample: SAMPLE_PAGE_CHANGES,    empty: [] },
  { key: 'monitoring.seoSnapshots',   sample: SAMPLE_SEO_SNAPSHOTS,   empty: {} },
  { key: 'analytics.channelMetrics',  sample: SAMPLE_CHANNEL_METRICS, empty: emptyChannelMetrics() },
  { key: 'analytics.timeSeries',      sample: SAMPLE_TIME_SERIES,     empty: emptyTimeSeries() },
  { key: 'analytics.attribution',     sample: SAMPLE_ATTRIBUTION,     empty: emptyAttribution() },
  { key: 'analytics.aiInsights',      sample: SAMPLE_AI_INSIGHTS,     empty: [] },
  { key: 'analytics.reports',         sample: SAMPLE_SHARED_REPORTS,  empty: [] },
  { key: 'social.posts',              sample: SAMPLE_SOCIAL_POSTS,     empty: [] },
  { key: 'social.inboxMessages',      sample: SAMPLE_INBOX_MESSAGES,   empty: [] },
  { key: 'social.listeningItems',     sample: SAMPLE_LISTENING_ITEMS,  empty: [] },
  { key: 'social.platformStats',      sample: SAMPLE_PLATFORM_STATS,   empty: emptyPlatformStats() },
  { key: 'social.approvalPosts',      sample: SAMPLE_APPROVAL_POSTS,   empty: [] },
  { key: 'social.dmRules',            sample: SAMPLE_DM_RULES,         empty: [] },
  { key: 'email.flows',               sample: SAMPLE_EMAIL_FLOWS,      empty: [] },
  { key: 'email.campaigns',           sample: SAMPLE_EMAIL_CAMPAIGNS,  empty: [] },
  { key: 'email.segments',            sample: SAMPLE_SEGMENTS,         empty: [] },
  { key: 'email.deliverability',      sample: SAMPLE_DELIVERABILITY,   empty: [] },
  { key: 'content.creatives',         sample: SAMPLE_GENERATED_CREATIVES, empty: [] },
  { key: 'content.competitorAds',     sample: SAMPLE_COMPETITOR_ADS,   empty: [] },
  { key: 'content.performanceScores', sample: SAMPLE_PERFORMANCE_SCORES, empty: [] },
  { key: 'content.briefs',            sample: SAMPLE_CAMPAIGN_BRIEFS,  empty: [] },
  { key: 'content.brandVoice.tone',           sample: SAMPLE_BRAND_VOICE_SETTINGS.toneValue,          empty: DEFAULT_BRAND_VOICE_SETTINGS.toneValue },
  { key: 'content.brandVoice.formality',      sample: SAMPLE_BRAND_VOICE_SETTINGS.formalityValue,     empty: DEFAULT_BRAND_VOICE_SETTINGS.formalityValue },
  { key: 'content.brandVoice.traits',         sample: SAMPLE_BRAND_VOICE_SETTINGS.personalityTraits,  empty: DEFAULT_BRAND_VOICE_SETTINGS.personalityTraits },
  { key: 'content.brandVoice.avoidWords',     sample: SAMPLE_BRAND_VOICE_SETTINGS.wordListAvoid,       empty: DEFAULT_BRAND_VOICE_SETTINGS.wordListAvoid },
  { key: 'content.brandVoice.useWords',       sample: SAMPLE_BRAND_VOICE_SETTINGS.wordListUse,         empty: DEFAULT_BRAND_VOICE_SETTINGS.wordListUse },
  { key: 'content.brandVoice.exampleCopy',    sample: SAMPLE_BRAND_VOICE_SETTINGS.exampleCopy,         empty: DEFAULT_BRAND_VOICE_SETTINGS.exampleCopy },
  { key: 'content.brandVoice.trainingDocFiles', sample: [
      { name: 'Brand_Guidelines_2026.pdf', size: '2.4 MB', status: 'Trained' },
      { name: 'Tone_of_Voice_Document.docx', size: '840 KB', status: 'Trained' },
      { name: 'Email_Copy_Examples.txt', size: '124 KB', status: 'Trained' },
      { name: 'Social_Media_Style_Guide.pdf', size: '1.8 MB', status: 'Trained' },
    ], empty: [] },
];

function storageKey(key: string): string {
  return `marketos.${key}`;
}

export function loadSampleData(): void {
  for (const entry of REGISTRY) {
    localStorage.setItem(storageKey(entry.key), JSON.stringify(entry.sample));
  }
  window.location.reload();
}

export function clearAllData(): void {
  for (const entry of REGISTRY) {
    localStorage.setItem(storageKey(entry.key), JSON.stringify(entry.empty));
  }
  window.location.reload();
}

/** Whether any registered key currently holds its (non-empty) sample content — used to reflect toggle state in the UI. */
export function hasSampleDataLoaded(): boolean {
  return REGISTRY.some(entry => {
    try {
      const raw = localStorage.getItem(storageKey(entry.key));
      if (raw === null) return false;
      return JSON.stringify(JSON.parse(raw)) === JSON.stringify(entry.sample);
    } catch {
      return false;
    }
  });
}
