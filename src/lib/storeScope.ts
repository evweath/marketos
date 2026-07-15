import { usePersistentState } from './usePersistentState';

// ─── Canonical store identity ──────────────────────────────────────────────
//
// The store list is user-mutable (Settings → Stores → Add Store), so store
// identity can't be a fixed union type — it's whatever's in the persisted
// `stores` list at runtime. Every other data file in the app that references
// a store does so via either its `id` (e.g. 'donut-equipment') or its
// `domain` (e.g. 'donut-equipment.com') — `resolveStoreId` reconciles both
// formats back to the canonical `id` so filtering logic only has to deal
// with one shape.

export interface StoreRecord {
  id: string;
  name: string;
  domain: string;
  color: string;
  status: 'connected' | 'error';
  lastSync: string;
  apiKeyMasked: string;
  products: number;
  orders30d: number;
  activeCampaigns: number;
  webhooks: string[];
}

export const STORE_COLORS = ['#00d9ff', '#ffb347', '#10d98a', '#7b93ff', '#ff6ac1', '#f5c542'];

export const INITIAL_STORES: StoreRecord[] = [
  {
    id: 'donut-equipment',
    name: 'Donut Equipment',
    domain: 'donut-equipment.myshopify.com',
    color: STORE_COLORS[0],
    status: 'connected',
    lastSync: new Date(Date.now() - 4 * 60000).toISOString(),
    apiKeyMasked: '',
    products: 0,
    orders30d: 0,
    activeCampaigns: 0,
    webhooks: ['orders/create', 'orders/updated', 'products/update', 'checkouts/create', 'customers/create'],
  },
  {
    id: 'donut-supplies',
    name: 'Donut Supplies',
    domain: 'donut-supplies.myshopify.com',
    color: STORE_COLORS[1],
    status: 'connected',
    lastSync: new Date(Date.now() - 4 * 60000).toISOString(),
    apiKeyMasked: '',
    products: 0,
    orders30d: 0,
    activeCampaigns: 0,
    webhooks: ['orders/create', 'products/update', 'checkouts/create'],
  },
  {
    id: 'bakery-wholesalers',
    name: 'Bakery Wholesalers',
    domain: 'bakery-wholesalers.myshopify.com',
    color: STORE_COLORS[2],
    status: 'connected',
    lastSync: new Date(Date.now() - 4 * 60000).toISOString(),
    apiKeyMasked: '',
    products: 0,
    orders30d: 0,
    activeCampaigns: 0,
    webhooks: ['orders/create', 'orders/updated', 'products/update', 'checkouts/create', 'customers/create'],
  },
];

/** Shared source of truth for the store list — same localStorage key every screen reads/writes. */
export function useStores() {
  return usePersistentState<StoreRecord[]>('stores', INITIAL_STORES);
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    // Strip any domain suffix (.com, .myshopify.com, etc.) — not just
    // .myshopify.com — since data files reference stores by bare .com
    // domain too. Bare ids/names have no dot, so this is a no-op for them.
    .split('.')[0];
}

/**
 * Resolves any store-identifying string this codebase uses in the wild
 * (canonical id, bare domain, or full domain incl. protocol/www) back to the
 * canonical `StoreRecord.id`. Returns null if no store matches.
 */
export function resolveStoreId(value: string | null | undefined, stores: StoreRecord[]): string | null {
  if (!value) return null;
  const needle = normalize(value);
  for (const store of stores) {
    if (normalize(store.id) === needle) return store.id;
    if (normalize(store.domain) === needle) return store.id;
    if (normalize(store.name) === needle) return store.id;
  }
  return null;
}

// ─── Store scope (group / individual store view) ──────────────────────────

export interface StoreScopeState {
  /** 'all' = every store selected (the default "group view"). Otherwise an explicit id set. */
  mode: 'all' | 'subset';
  selectedIds: string[];
}

const DEFAULT_SCOPE: StoreScopeState = { mode: 'all', selectedIds: [] };

/**
 * Persisted, per-section store selection used by the checkbox-based
 * <StoreScopeBar>. `sectionKey` should be unique per page (e.g. 'analytics',
 * 'ads') so each module remembers its own selection independently.
 */
export function useStoreScope(sectionKey: string) {
  const [stores] = useStores();
  const [scope, setScope] = usePersistentState<StoreScopeState>(`scope.${sectionKey}`, DEFAULT_SCOPE);

  const selectedStoreIds = scope.mode === 'all'
    ? stores.map(s => s.id)
    : scope.selectedIds.filter(id => stores.some(s => s.id === id));

  const isSelected = (storeId: string) => selectedStoreIds.includes(storeId);

  const toggleStore = (storeId: string) => {
    setScope(prev => {
      const current = prev.mode === 'all' ? stores.map(s => s.id) : prev.selectedIds;
      const next = current.includes(storeId) ? current.filter(id => id !== storeId) : [...current, storeId];
      if (next.length === stores.length) return { mode: 'all', selectedIds: [] };
      return { mode: 'subset', selectedIds: next };
    });
  };

  const selectAll = () => setScope({ mode: 'all', selectedIds: [] });

  return { stores, selectedStoreIds, isSelected, toggleStore, selectAll, isAll: scope.mode === 'all' };
}
