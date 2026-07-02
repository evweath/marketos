'use client';

import { useState } from 'react';
import { Search, X, BarChart2, TrendingUp } from 'lucide-react';
import { COMPETITOR_ADS } from '@/lib/contentData';
import type { CompetitorAd, ContentPlatform, PerformanceIndicator } from '@/lib/contentData';

type PlatformFilter = 'all' | ContentPlatform;
type AdTypeFilter = 'all' | 'image' | 'video' | 'carousel';
type PerfFilter = 'all' | PerformanceIndicator;

const PLATFORM_LABELS: Record<ContentPlatform, { label: string; color: string }> = {
  google:    { label: 'Google',    color: '#4285F4' },
  meta:      { label: 'Meta',      color: '#0866FF' },
  tiktok:    { label: 'TikTok',    color: '#FF0050' },
  youtube:   { label: 'YouTube',   color: '#FF0000' },
  instagram: { label: 'Instagram', color: '#E1306C' },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2' },
};

const PERF_CONFIG: Record<PerformanceIndicator, { color: string; label: string }> = {
  high:   { color: '#10d98a', label: 'High'   },
  medium: { color: '#ffb347', label: 'Medium' },
  low:    { color: '#ff4444', label: 'Low'    },
};

interface AnalysisModal {
  ad: CompetitorAd;
}

function AdCard({ ad, onAnalyze }: { ad: CompetitorAd; onAnalyze: (ad: CompetitorAd) => void }) {
  const plat = PLATFORM_LABELS[ad.platform];
  const perf = PERF_CONFIG[ad.performanceIndicator];

  return (
    <div className="glass-card-elevated overflow-hidden">
      {/* Visual Placeholder */}
      <div className="h-28 flex items-center justify-center relative"
        style={{ background: ad.thumbnailColor }}>
        <div className="text-white/30 text-xs font-mono">{ad.adType.toUpperCase()} AD</div>
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.5)', color: plat.color }}>
            {plat.label}
          </span>
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)' }}>
            {ad.adType}
          </span>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: perf.color }} />
          <span className="text-[8px] font-mono" style={{ background: 'rgba(0,0,0,0.5)', color: perf.color, padding: '1px 4px', borderRadius: 4 }}>
            {perf.label}
          </span>
        </div>
        <div className="absolute bottom-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.6)' }}>
          {ad.competitor}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{ad.headline}</h3>
        <p className="text-[10px] leading-relaxed mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {ad.description}
        </p>

        {/* CTA Preview */}
        <div className="mb-2.5">
          <span className="inline-block px-3 py-1 rounded text-[10px] font-medium"
            style={{ background: plat.color + '18', color: plat.color, border: `1px solid ${plat.color}30` }}>
            {ad.cta}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-2.5">
          <div>
            <div className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>Est. Spend</div>
            <div className="text-[11px] font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{ad.estimatedSpend}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>Running</div>
            <div className="text-[11px] font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{ad.daysRunning}d</div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: perf.color }} />
            <span className="text-[10px]" style={{ color: perf.color }}>{perf.label}</span>
          </div>
        </div>

        <button onClick={() => onAnalyze(ad)}
          className="w-full py-1.5 rounded-lg text-[10px] font-medium transition-all hover:opacity-80"
          style={{ background: 'rgba(0,217,255,0.1)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.2)' }}>
          Analyze
        </button>
      </div>
    </div>
  );
}

function AnalysisPanel({ modal, onClose }: { modal: AnalysisModal; onClose: () => void }) {
  const { ad } = modal;
  const plat = PLATFORM_LABELS[ad.platform];
  const perf = PERF_CONFIG[ad.performanceIndicator];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,14,26,0.85)' }}
      onClick={onClose}>
      <div className="glass-card w-[520px] max-h-[80vh] overflow-y-auto p-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{ad.headline}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: plat.color + '18', color: plat.color }}>{plat.label}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{ad.adType}</span>
              <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{ad.competitor}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Ad Preview */}
        <div className="h-36 rounded-xl mb-4 flex items-center justify-center"
          style={{ background: ad.thumbnailColor }}>
          <div className="text-white/40 text-sm font-mono">{ad.adType.toUpperCase()} PREVIEW</div>
        </div>

        {/* Analysis Sections */}
        <div className="space-y-3">
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
            <div className="section-label mb-2">Performance Indicators</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>Est. Monthly Spend</div>
                <div className="text-sm font-bold font-mono" style={{ color: '#ffb347' }}>{ad.estimatedSpend}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>Days Running</div>
                <div className="text-sm font-bold font-mono" style={{ color: '#00d9ff' }}>{ad.daysRunning}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>Performance</div>
                <div className="text-sm font-bold" style={{ color: perf.color }}>{perf.label}</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
            <div className="section-label mb-2">Copy Analysis</div>
            <div className="space-y-2">
              <div>
                <div className="text-[9px] font-mono mb-0.5" style={{ color: 'var(--text-muted)' }}>HEADLINE</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{ad.headline}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono mb-0.5" style={{ color: 'var(--text-muted)' }}>DESCRIPTION</div>
                <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ad.description}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>CTA:</div>
                <span className="text-[10px] px-2 py-0.5 rounded font-medium"
                  style={{ background: plat.color + '18', color: plat.color }}>{ad.cta}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
            <div className="section-label mb-2">AI Insights</div>
            <div className="space-y-1.5">
              {[
                `This ad has been running for ${ad.daysRunning} days — longevity typically indicates strong performance. Ads that survive 30+ days are usually profitable.`,
                `The ${ad.adType} format on ${plat.label} at ${ad.estimatedSpend} spend suggests a ${ad.performanceIndicator}-confidence bet — this competitor is ${ad.daysRunning > 30 ? 'scaling a winner' : 'in the testing phase'}.`,
                `The CTA "${ad.cta}" combined with urgency/value copy is a ${ad.performanceIndicator === 'high' ? 'proven' : 'testable'} combination in the ${ad.category} vertical. Consider testing a similar structure.`,
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: '#00d9ff' }} />
                  <span className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompetitorAdAnalysis() {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [adTypeFilter, setAdTypeFilter] = useState<AdTypeFilter>('all');
  const [perfFilter, setPerfFilter] = useState<PerfFilter>('all');
  const [modal, setModal] = useState<AnalysisModal | null>(null);
  const [searching, setSearching] = useState(false);

  const filtered = COMPETITOR_ADS.filter(ad => {
    const matchSearch = !searchQuery || ad.competitor.includes(searchQuery.toLowerCase()) || ad.headline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlatform = platformFilter === 'all' || ad.platform === platformFilter;
    const matchType = adTypeFilter === 'all' || ad.adType === adTypeFilter;
    const matchPerf = perfFilter === 'all' || ad.performanceIndicator === perfFilter;
    return matchSearch && matchPlatform && matchType && matchPerf;
  });

  const avgDays = Math.round(COMPETITOR_ADS.reduce((s, a) => s + a.daysRunning, 0) / COMPETITOR_ADS.length);
  const platformCounts = COMPETITOR_ADS.reduce((acc, ad) => {
    acc[ad.platform] = (acc[ad.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'meta';
  const highCount = COMPETITOR_ADS.filter(a => a.performanceIndicator === 'high').length;

  return (
    <div className="space-y-4">
      {modal && <AnalysisPanel modal={modal} onClose={() => setModal(null)} />}

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Ads Tracked', value: COMPETITOR_ADS.length.toString(), color: '#00d9ff' },
          { label: 'Avg Days Running', value: `${avgDays}d`, color: '#ffb347' },
          { label: 'Top Platform', value: PLATFORM_LABELS[topPlatform as ContentPlatform]?.label ?? topPlatform, color: '#7b93ff' },
          { label: 'High Performers', value: `${highCount} / ${COMPETITOR_ADS.length}`, color: '#10d98a' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Enter competitor domain or brand name..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>
          <button onClick={() => { setSearching(true); setTimeout(() => setSearching(false), 1200); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90"
            style={{ background: '#00d9ff', color: '#0a0e1a' }}>
            <Search size={12} />{searching ? 'Searching…' : 'Search'}
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Platform filter */}
          <div className="flex items-center gap-1.5">
            <span className="section-label">Platform:</span>
            {(['all', 'google', 'meta', 'tiktok', 'youtube'] as const).map(p => (
              <button key={p} onClick={() => setPlatformFilter(p)}
                className="px-2.5 py-1 rounded-lg text-[10px] capitalize transition-all"
                style={{
                  background: platformFilter === p ? (p === 'all' ? 'rgba(0,217,255,0.12)' : PLATFORM_LABELS[p]?.color + '18') : 'var(--bg-elevated)',
                  color: platformFilter === p ? (p === 'all' ? '#00d9ff' : PLATFORM_LABELS[p]?.color) : 'var(--text-muted)',
                  border: `1px solid ${platformFilter === p ? (p === 'all' ? 'rgba(0,217,255,0.25)' : PLATFORM_LABELS[p]?.color + '35') : 'var(--border-subtle)'}`,
                }}>
                {p === 'all' ? 'All' : PLATFORM_LABELS[p]?.label}
              </button>
            ))}
          </div>

          {/* Ad Type filter */}
          <div className="flex items-center gap-1.5">
            <span className="section-label">Type:</span>
            {(['all', 'image', 'video', 'carousel'] as const).map(t => (
              <button key={t} onClick={() => setAdTypeFilter(t)}
                className="px-2.5 py-1 rounded-lg text-[10px] capitalize transition-all"
                style={{
                  background: adTypeFilter === t ? 'rgba(123,147,255,0.12)' : 'var(--bg-elevated)',
                  color: adTypeFilter === t ? '#7b93ff' : 'var(--text-muted)',
                  border: `1px solid ${adTypeFilter === t ? 'rgba(123,147,255,0.25)' : 'var(--border-subtle)'}`,
                }}>
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>

          {/* Performance filter */}
          <div className="flex items-center gap-1.5">
            <span className="section-label">Performance:</span>
            {(['all', 'high', 'medium', 'low'] as const).map(p => {
              const cfg = p !== 'all' ? PERF_CONFIG[p] : null;
              return (
                <button key={p} onClick={() => setPerfFilter(p)}
                  className="px-2.5 py-1 rounded-lg text-[10px] capitalize transition-all"
                  style={{
                    background: perfFilter === p ? (cfg ? cfg.color + '18' : 'rgba(0,217,255,0.12)') : 'var(--bg-elevated)',
                    color: perfFilter === p ? (cfg ? cfg.color : '#00d9ff') : 'var(--text-muted)',
                    border: `1px solid ${perfFilter === p ? (cfg ? cfg.color + '35' : 'rgba(0,217,255,0.25)') : 'var(--border-subtle)'}`,
                  }}>
                  {p === 'all' ? 'All' : p}
                </button>
              );
            })}
          </div>

          <div className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} ads
          </div>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(ad => (
          <AdCard key={ad.id} ad={ad} onAnalyze={a => setModal({ ad: a })} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-8 flex flex-col items-center justify-center">
          <BarChart2 size={24} className="mb-3" style={{ color: 'var(--text-muted)' }} />
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No ads match your filters</div>
          <button onClick={() => { setPlatformFilter('all'); setAdTypeFilter('all'); setPerfFilter('all'); setSearchQuery(''); }}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-dim)' }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
