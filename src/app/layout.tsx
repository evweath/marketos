import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarketOS — Marketing Automation Platform',
  description: 'Unified marketing automation for donut-equipment.com, donut-supplies.com, bakerywholesalers.com',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
