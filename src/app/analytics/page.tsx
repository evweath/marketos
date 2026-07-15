'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import KpiRow from '@/components/analytics/KpiRow';
import ChannelTable from '@/components/analytics/ChannelTable';
import RevenueSpendChart from '@/components/analytics/RevenueSpendChart';
import SpendBudgetChart from '@/components/analytics/SpendBudgetChart';
import AttributionPanel from '@/components/analytics/AttributionPanel';
import AIInsightsPanel from '@/components/analytics/AIInsightsPanel';
import RoasChart from '@/components/analytics/RoasChart';
import DateRangePicker from '@/components/analytics/DateRangePicker';
import { scaledTotals, DATE_RANGE_LABELS } from '@/lib/analyticsData';
import type { DateRange } from '@/lib/analyticsData';
import { Download, Share2, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';

interface SharedReport {
  id: string;
  name: string;
  platform: string;
  lastUpdated: string;
  views: number;
  shareUrl: string;
  live: boolean;
}

const SHARED_REPORTS: SharedReport[] = [
  { id: 'sr-1', name: 'Monthly Performance — All Stores', platform: 'Looker Studio', lastUpdated: '2h ago', views: 14, shareUrl: 'https://lookerstudio.google.com/r/abc123', live: true },
  { id: 'sr-2', name: 'Q1 Ad Spend Summary',              platform: 'Google Slides', lastUpdated: '3d ago', views: 8,  shareUrl: 'https://docs.google.com/presentation/d/xyz789', live: true },
  { id: 'sr-3', name: 'Channel Attribution Deep-Dive',    platform: 'Looker Studio', lastUpdated: '1w ago', views: 5,  shareUrl: 'https://lookerstudio.google.com/r/def456', live: false },
];

function ShareableReportsPanel({ onClose, reports, onCreate }: { onClose: () => void; reports: SharedReport[]; onCreate: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center' style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className='rounded-2xl p-5 flex flex-col gap-4 w-[560px]'
        style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)' }}
        onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>Shareable Reports</div>
            <div className='text-base' style={{ color: 'var(--text-muted)' }}>Looker Studio · Google Slides exports</div>
          </div>
          <button onClick={onClose} className='text-base px-2.5 py-1 rounded-lg' style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>✕</button>
        </div>

        <div className='flex flex-col gap-2'>
          {reports.map(r => (
            <div key={r.id} className='rounded-xl px-4 py-3 flex items-center gap-3'
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className='flex-1 min-w-0'>
                <div className='text-base font-medium mb-0.5' style={{ color: 'var(--text-primary)' }}>{r.name}</div>
                <div className='flex items-center gap-2 text-[16px]'>
                  <span className='px-1.5 py-0.5 rounded' style={{ background: r.platform === 'Looker Studio' ? 'rgba(0,217,255,.1)' : 'rgba(123,147,255,.1)', color: r.platform === 'Looker Studio' ? 'var(--cyan)' : '#7b93ff' }}>{r.platform}</span>
                  <span style={{ color: 'var(--text-muted)' }}>Updated {r.lastUpdated} · {r.views} views</span>
                  {r.live && <span className='px-1.5 py-0.5 rounded' style={{ background: 'rgba(16,217,138,.1)', color: '#10d98a' }}>Live</span>}
                </div>
              </div>
              <div className='flex items-center gap-1.5'>
                <button onClick={() => handleCopy(r.id)}
                  className='p-1.5 rounded-lg transition-all'
                  style={{ background: copied === r.id ? 'rgba(16,217,138,.1)' : 'var(--bg-base)', color: copied === r.id ? '#10d98a' : 'var(--text-muted)' }}>
                  {copied === r.id ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                </button>
                <a href={r.shareUrl} target='_blank' rel='noreferrer'
                  className='p-1.5 rounded-lg transition-all'
                  style={{ background: 'var(--bg-base)', color: 'var(--cyan)' }}>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className='pt-2 border-t flex items-center justify-between' style={{ borderColor: 'var(--border-subtle)' }}>
          <span className='text-base' style={{ color: 'var(--text-muted)' }}>Connected: Google Looker Studio, Google Slides</span>
          <button onClick={onCreate} className='text-base px-3 py-1.5 rounded-lg font-medium'
            style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.25)' }}>
            + Create Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = usePersistentState<SharedReport[]>('analytics.reports', SHARED_REPORTS);

  // Runs only in a click handler (never during render), so browser-only APIs
  // and non-deterministic values are safe here — no hydration impact.
  const handleCreateReport = () => {
    setReports(prev => [
      {
        id: `sr-${Date.now()}`,
        name: `Custom Report — ${DATE_RANGE_LABELS[dateRange]}`,
        platform: 'Looker Studio',
        lastUpdated: 'just now',
        views: 0,
        shareUrl: 'https://lookerstudio.google.com/r/new',
        live: true,
      },
      ...prev,
    ]);
  };

  const handleExport = () => {
    if (typeof window === 'undefined') return;
    const t = scaledTotals(dateRange);
    const payload = {
      range: DATE_RANGE_LABELS[dateRange],
      generatedAt: new Date().toISOString(),
      totals: t,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${dateRange}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title="Analytics" subtitle="All Channels" breadcrumbs={['MarketOS', 'Analytics']} />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                Marketing Performance — All 3 Stores
              </h2>
              <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                Google Ads · Meta Ads · TikTok · YouTube · X/Twitter · LinkedIn · Email · Organic
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <div className="flex items-center gap-1.5">
                <button onClick={() => setShowReports(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base transition-all hover:bg-white/5"
                  style={{ border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}>
                  <Share2 size={12} />Share
                </button>
                <button onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base transition-all"
                  style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                  <Download size={12} />Export Report
                </button>
              </div>
            </div>
          </div>
          <KpiRow dateRange={dateRange} />
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="col-span-2"><RevenueSpendChart dateRange={dateRange} /></div>
            <RoasChart dateRange={dateRange} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <SpendBudgetChart dateRange={dateRange} />
            <AttributionPanel dateRange={dateRange} />
          </div>
          <div className="mb-3"><ChannelTable dateRange={dateRange} /></div>
          <AIInsightsPanel />
        </main>
        {showReports && <ShareableReportsPanel onClose={() => setShowReports(false)} reports={reports} onCreate={handleCreateReport} />}
      </div>
    </div>
  );
}
