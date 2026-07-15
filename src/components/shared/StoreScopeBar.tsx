'use client';

import { Check, Store as StoreIcon } from 'lucide-react';
import { useStoreScope } from '@/lib/storeScope';

interface StoreScopeBarProps {
  /** Unique per page, e.g. 'analytics', 'ads' — keeps each module's selection independent. */
  sectionKey: string;
}

/**
 * Checkbox-based store scope selector shared by every store-scoped module
 * page. "All Stores" is the default group view; checking one or more
 * individual stores narrows every list/chart/KPI on that page to just those
 * stores. Selection is persisted per `sectionKey` via `useStoreScope`.
 */
export function StoreScopeBar({ sectionKey }: StoreScopeBarProps) {
  const { stores, isSelected, toggleStore, selectAll, isAll } = useStoreScope(sectionKey);

  if (stores.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-1.5 mr-1" style={{ color: 'var(--text-muted)' }}>
        <StoreIcon size={12} />
        <span className="section-label">View</span>
      </div>

      <button
        onClick={selectAll}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[16px] font-medium transition-all"
        style={{
          background: isAll ? 'rgba(0,217,255,0.12)' : 'var(--bg-elevated)',
          color: isAll ? 'var(--cyan)' : 'var(--text-muted)',
          border: `1px solid ${isAll ? 'rgba(0,217,255,0.25)' : 'var(--border-subtle)'}`,
        }}
      >
        {isAll && <Check size={10} />}
        All Stores
      </button>

      {stores.map(store => {
        const selected = isSelected(store.id);
        return (
          <button
            key={store.id}
            onClick={() => toggleStore(store.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[16px] font-medium transition-all"
            style={{
              background: selected ? `${store.color}1f` : 'var(--bg-elevated)',
              color: selected ? store.color : 'var(--text-muted)',
              border: `1px solid ${selected ? `${store.color}40` : 'var(--border-subtle)'}`,
            }}
          >
            {selected && <Check size={10} />}
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: store.color, opacity: selected ? 1 : 0.5 }}
            />
            {store.name}
          </button>
        );
      })}
    </div>
  );
}
