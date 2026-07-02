import { useEffect, useState, Dispatch, SetStateAction } from 'react';

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
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* storage full/unavailable — best-effort persistence */
    }
  }, [storageKey, value, hydrated]);

  return [value, setValue];
}
