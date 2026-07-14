'use client';

import { createContext, useContext, useEffect, type Dispatch, type SetStateAction } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';

export type Theme = 'dark' | 'light';

// Only takes visual effect while `theme === 'light'` — the dark theme always
// stays the fixed default palette/typography.
export interface AppearanceSettings {
  bgColor: string | null;    // overrides --bg-base (page canvas)
  menuColor: string | null;  // overrides --bg-nav (sidebar/topbar/settings subnav)
  textColor: string | null;  // overrides --text-primary
  fontScale: number;         // multiplies the root font-size
  bold: boolean;
  italic: boolean;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  bgColor: null,
  menuColor: null,
  textColor: null,
  fontScale: 1,
  bold: false,
  italic: false,
};

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  appearance: AppearanceSettings;
  setAppearance: Dispatch<SetStateAction<AppearanceSettings>>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function setOrClear(prop: string, value: string | null) {
  if (value) document.documentElement.style.setProperty(prop, value);
  else document.documentElement.style.removeProperty(prop);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = usePersistentState<Theme>('theme', 'dark');
  const [appearance, setAppearance] = usePersistentState<AppearanceSettings>('appearance', DEFAULT_APPEARANCE);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const active = theme === 'light';
    setOrClear('--bg-base', active ? appearance.bgColor : null);
    setOrClear('--bg-nav', active ? appearance.menuColor : null);
    setOrClear('--text-primary', active ? appearance.textColor : null);
    document.documentElement.style.setProperty('--font-scale', String(active ? appearance.fontScale : 1));
    document.documentElement.dataset.bold = String(active && appearance.bold);
    document.documentElement.dataset.italic = String(active && appearance.italic);
  }, [theme, appearance]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, appearance, setAppearance }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
