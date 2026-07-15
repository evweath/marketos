import { useEffect, useState, Dispatch, SetStateAction } from 'react';

// In-memory pub-sub so multiple simultaneously-mounted usePersistentState
// instances of the *same* key (e.g. a page's own useStoreScope call and the
// <StoreScopeBar> it renders, both reading 'scope.<section>') stay in sync
// within a tab. localStorage's native 'storage' event only fires for OTHER
// tabs/windows, never same-tab writers, so without this a write from one
// instance is invisible to sibling instances until a remount/reload.
type Listener = (value: unknown) => void;
const listeners = new Map<string, Set<Listener>>();

function subscribe(storageKey: string, listener: Listener): () => void {
  if (!listeners.has(storageKey)) listeners.set(storageKey, new Set());
  listeners.get(storageKey)!.add(listener);
  return () => listeners.get(storageKey)?.delete(listener);
}

function broadcast(storageKey: string, value: unknown): void {
  listeners.get(storageKey)?.forEach(l => l(value));
}

/**
 * A drop-in replacement for useState that persists the value to localStorage so
 * it survives component unmounts (e.g. switching a settings sub-tab) and full
 * page reloads. Intended for user-mutable *domain data* in this no-backend mock
 * (added campaigns, rules, stores, status changes, settings values) — NOT for
 * transient UI state like open tabs, typed-but-unsubmitted inputs, filters, or
 * loading flags.
 *
 * SSR-safe: the first render always uses `initial`, matching the server-rendered
 * HTML, so there is no hydration mismatch. The persisted value is restored in an
 * effect after mount, and writes are gated behind a `hydrated` flag so the seed
 * default never clobbers saved data on first mount.
 *
 * Only pass JSON-serializable values — do not persist objects that hold
 * functions, React components (e.g. lucide icon refs), or JSX.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = `marketos.${key}`;
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* corrupt/unavailable storage — keep the seed value */
    }
    setHydrated(true);

    return subscribe(storageKey, (v) => setValue(v as T));
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* storage full/unavailable — best-effort persistence */
    }
    broadcast(storageKey, value);
  }, [storageKey, value, hydrated]);

  return [value, setValue];
}
