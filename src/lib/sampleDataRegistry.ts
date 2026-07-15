import { SAMPLE_CAMPAIGNS, SAMPLE_AD_SETS, SAMPLE_CREATIVES, SAMPLE_AUTOMATION_RULES, SAMPLE_HEALTH_CHECKS } from './campaignData';
import { SAMPLE_ALERT_RULES, SAMPLE_FIRED_ALERTS } from './alertData';
import { SAMPLE_STORE_HEALTH, SAMPLE_TRAFFIC, SAMPLE_CONVERSIONS, SAMPLE_ABANDONED_CARTS, SAMPLE_TRANSACTIONS, SAMPLE_PAGE_CHANGES, SAMPLE_SEO_SNAPSHOTS } from './mockData';

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
