'use client';

import { useState } from 'react';
import { Upload, Link2, Loader2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { useStores, resolveStoreId } from '@/lib/storeScope';
import type { ScoredCreative, PerformancePrediction } from '@/lib/contentData';

// Simple string hash so the same input scores consistently, used only inside
// the click handler (not during render), so it doesn't affect SSR hydration.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

function scoreFromInput(input: string, store: string): ScoredCreative {
  const h = hashString(input);
  const metric = (offset: number, min: number, max: number) => min + ((h >> offset) % (max - min + 1));
  const metrics = {
    clarity: metric(0, 45, 98),
    emotionalAppeal: metric(3, 40, 95),
    brandConsistency: metric(6, 50, 97),
    callToAction: metric(9, 42, 96),
    visualHierarchy: metric(12, 45, 95),
    colorContrast: metric(15, 40, 92),
  };
  const overallScore = Math.round(Object.values(metrics).reduce((s, v) => s + v, 0) / 6);
  const prediction: PerformancePrediction = overallScore >= 80 ? 'strong' : overallScore >= 60 ? 'average' : 'weak';
  const weakest = (Object.entries(metrics) as [string, number][]).sort((a, b) => a[1] - b[1])[0][0];
  const IMPROVEMENT_HINTS: Record<string, string> = {
    clarity: 'Simplify the headline and remove competing visual elements to sharpen the core message.',
    emotionalAppeal: 'Add a human element or lifestyle context to create a stronger emotional connection.',
    brandConsistency: 'Align colors, fonts, and tone more closely with your brand voice guidelines.',
    callToAction: 'Make the CTA button more prominent and use action-oriented copy.',
    visualHierarchy: 'Restructure the layout so the eye is guided toward the product and CTA first.',
    colorContrast: 'Increase contrast between text and background to meet accessibility standards.',
  };
  return {
    id: `ps-${Date.now()}`,
    store,
    name: input.length > 40 ? input.slice(0, 40) + '…' : input,
    type: 'image',
    platform: 'meta',
    overallScore,
    prediction,
    metrics,
    commentary: `This creative scores ${overallScore}/100 overall. ${prediction === 'strong' ? 'Strong performance is predicted across most dimensions.' : prediction === 'average' ? 'Performance is predicted to be middle-of-the-pack — a few targeted fixes could meaningfully improve results.' : 'Several dimensions need attention before this is likely to perform well.'}`,
    improvements: [IMPROVEMENT_HINTS[weakest], 'Test an alternate variant with a different visual focus.', 'A/B test the headline against a benefit-led alternative.'],
    thumbnailColor: 'linear-gradient(135deg, #00d9ff33, #7b93ff33)',
  };
}

const METRIC_LABELS: Record<keyof ScoredCreative['metrics'], string> = {
  clarity:            'Clarity',
  emotionalAppeal:    'Emotional Appeal',
  brandConsistency:   'Brand Consistency',
  callToAction:       'Call to Action',
  visualHierarchy:    'Visual Hierarchy',
  colorContrast:      'Color Contrast',
};

const PREDICTION_CONFIG: Record<PerformancePrediction, { label: string; color: string; bg: string; icon: typeof TrendingUp }> = {
  strong:  { label: 'Strong Performer',  color: '#10d98a', bg: 'rgba(16,217,138,0.12)',  icon: TrendingUp     },
  average: { label: 'Average Performer', color: '#ffb347', bg: 'rgba(255,179,71,0.12)',  icon: AlertTriangle  },
  weak:    { label: 'Needs Improvement', color: '#ff4444', bg: 'rgba(255,68,68,0.12)',   icon: AlertTriangle  },
};

function scoreColor(s: number): string {
  if (s >= 80) return '#10d98a';
  if (s >= 60) return '#ffb347';
  return '#ff4444';
}

function ScoreGauge({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <svg width={108} height={108} className="rotate-[-90deg]">
      <circle cx={54} cy={54} r={r} fill="none" stroke="var(--bg-overlay)" strokeWidth={8} />
      <circle cx={54} cy={54} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-[16px] font-mono font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function PerformanceScorer({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [allScores, setScores] = usePersistentState<ScoredCreative[]>('content.performanceScores', []);
  const scores = allScores.filter(sc => selectedStoreIds.includes(resolveStoreId(sc.store, stores) ?? ''));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scoreStore, setScoreStore] = useState(stores[0]?.domain ?? '');

  const selected = scores.find(sc => sc.id === selectedId) ?? scores[0] ?? null;

  const handleScore = () => {
    if (!urlInput.trim()) return;
    setScoring(true);
    const input = urlInput;
    setTimeout(() => {
      const scored = scoreFromInput(input, scoreStore);
      setScores(prev => [scored, ...prev]);
      setSelectedId(scored.id);
      setScoring(false);
      setUrlInput('');
    }, 2000);
  };

  const predCfg = selected ? PREDICTION_CONFIG[selected.prediction] : null;
  const PredIcon = predCfg?.icon;

  return (
    <div className="space-y-4">
      {/* Input Area */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={13} style={{ color: 'var(--cyan)' }} />
          <span className="section-label">Score a Creative</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Upload */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); }}
            className="flex flex-col items-center justify-center py-8 rounded-xl cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragOver ? '#00d9ff' : 'var(--border-dim)'}`,
              background: dragOver ? 'rgba(0,217,255,0.04)' : 'var(--bg-elevated)',
            }}>
            <Upload size={20} className="mb-2" style={{ color: dragOver ? 'var(--cyan)' : 'var(--text-muted)' }} />
            <div className="text-base font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Drop creative to score</div>
            <div className="text-[16px]" style={{ color: 'var(--text-muted)' }}>JPG, PNG, MP4 · up to 50MB</div>
          </div>

          {/* URL Input */}
          <div className="flex flex-col justify-center gap-3">
            <div className="text-base text-center" style={{ color: 'var(--text-muted)' }}>— or paste a URL —</div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-7 pr-3 py-2 rounded-lg text-base outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
                />
              </div>
              <select value={scoreStore} onChange={e => setScoreStore(e.target.value)}
                className="px-2 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                {stores.map(s => <option key={s.id} value={s.domain}>{s.name}</option>)}
              </select>
              <button onClick={handleScore} disabled={scoring || !urlInput.trim()}
                className="px-4 py-2 rounded-lg text-base font-semibold transition-all whitespace-nowrap"
                style={{
                  background: scoring || !urlInput.trim() ? 'rgba(0,217,255,0.3)' : '#00d9ff',
                  color: '#0a0e1a',
                  cursor: scoring || !urlInput.trim() ? 'not-allowed' : 'pointer',
                }}>
                {scoring ? <Loader2 size={12} className="animate-spin" /> : 'Score'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Score Panel */}
        <div className="glass-card p-4 col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={13} style={{ color: 'var(--cyan)' }} />
            <span className="section-label">Score Results</span>
            {selected && (
              <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>— {selected.name}</span>
            )}
          </div>

          {!selected ? (
            <div className="text-base text-center py-10" style={{ color: 'var(--text-muted)' }}>
              No creatives scored yet — upload one or paste a URL above to get started.
            </div>
          ) : (
          <>
          <div className="flex gap-5 mb-5">
            {/* Gauge */}
            <div className="relative shrink-0">
              <ScoreGauge score={selected.overallScore} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono" style={{ color: scoreColor(selected.overallScore) }}>
                  {selected.overallScore}
                </span>
                <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>

            {/* Prediction + commentary */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-[16px] font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: predCfg!.bg, color: predCfg!.color }}>
                  {PredIcon && <PredIcon size={11} />}
                  {predCfg!.label}
                </span>
              </div>
              <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {selected.commentary}
              </p>
            </div>
          </div>

          {/* Metric Bars */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-4">
            {(Object.entries(selected.metrics) as [keyof ScoredCreative['metrics'], number][]).map(([key, val]) => (
              <MetricBar key={key} label={METRIC_LABELS[key]} value={val} />
            ))}
          </div>

          {/* Improvements */}
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
            <div className="section-label mb-2">Recommended Improvements</div>
            <div className="space-y-1.5">
              {selected.improvements.map((imp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,179,71,0.12)', border: '1px solid rgba(255,179,71,0.25)' }}>
                    <span className="text-[16px] font-mono font-bold" style={{ color: '#ffb347' }}>{i + 1}</span>
                  </div>
                  <span className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{imp}</span>
                </div>
              ))}
            </div>
          </div>
          </>
          )}
        </div>

        {/* Creative List */}
        <div className="glass-card p-4 col-span-1">
          <div className="section-label mb-3">Scored Creatives</div>
          {scores.length === 0 ? (
            <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
              No creatives scored yet.
            </div>
          ) : (
          <div className="space-y-2">
            {scores.map(sc => {
              const color = scoreColor(sc.overallScore);
              const pc = PREDICTION_CONFIG[sc.prediction];
              const isActive = selected?.id === sc.id;
              return (
                <button key={sc.id} onClick={() => setSelectedId(sc.id)}
                  className="w-full text-left p-2.5 rounded-xl transition-all"
                  style={{
                    background: isActive ? 'var(--bg-overlay)' : 'var(--bg-elevated)',
                    border: `1px solid ${isActive ? 'var(--border-bright)' : 'var(--border-subtle)'}`,
                  }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[16px] font-medium truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                      {sc.name}
                    </span>
                    <span className="text-base font-bold font-mono ml-2 shrink-0" style={{ color }}>
                      {sc.overallScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                      <div className="h-full rounded-full" style={{ width: `${sc.overallScore}%`, background: color }} />
                    </div>
                    <span className="text-[16px] font-mono px-1 py-0.5 rounded shrink-0"
                      style={{ background: pc.bg, color: pc.color }}>
                      {sc.prediction}
                    </span>
                  </div>
                  <div className="text-[16px] mt-1 capitalize" style={{ color: 'var(--text-muted)' }}>
                    {sc.type} · {sc.platform}
                  </div>
                </button>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
