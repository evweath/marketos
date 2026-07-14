import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/ThemeProvider';

export const metadata: Metadata = {
  title: 'MarketOS — Marketing Automation Platform',
  description: 'Unified marketing automation for donut-equipment.com, donut-supplies.com, bakerywholesalers.com',
};

// Sets the theme attribute (and any saved light-theme appearance overrides)
// synchronously before paint, mirroring the effect in ThemeProvider, so
// returning users don't see a flash of un-customized colors while React hydrates.
const THEME_INIT_SCRIPT = `
try {
  var t = JSON.parse(localStorage.getItem('marketos.theme') || '"dark"');
  document.documentElement.dataset.theme = t;
  var a = JSON.parse(localStorage.getItem('marketos.appearance') || 'null');
  if (a && t === 'light') {
    var root = document.documentElement.style;
    if (a.bgColor) root.setProperty('--bg-base', a.bgColor);
    if (a.menuColor) root.setProperty('--bg-nav', a.menuColor);
    if (a.textColor) root.setProperty('--text-primary', a.textColor);
    root.setProperty('--font-scale', String(a.fontScale || 1));
    document.documentElement.dataset.bold = String(!!a.bold);
    document.documentElement.dataset.italic = String(!!a.italic);
  }
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
