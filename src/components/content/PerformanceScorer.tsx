'use client';

import { useState } from 'react';
import { Upload, Link2, Loader2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PERFORMANCE_SCORES } from '@/lib/contentData';
import type { ScoredCreative, PerformancePrediction } from '@/lib/contentData';

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

export function PerformanceScorer() {
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [selected, setSelected] = useState<ScoredCreative>(PERFORMANCE_SCORES[0]);

  const handleScore = () => {
    if (!urlInput.trim()) return;
    setScoring(true);
    setTimeout(() => {
      setSelected(PERFORMANCE_SCORES[Math.floor(Math.random() * PERFORMANCE_SCORES.length)]);
      setScoring(false);
    }, 2000);
  };

  const predCfg = PREDICTION_CONFIG[selected.prediction];
  const PredIcon = predCfg.icon;

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
            <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>— {selected.name}</span>
          </div>

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
                  style={{ background: predCfg.bg, color: predCfg.color }}>
                  <PredIcon size={11} />
                  {predCfg.label}
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
        </div>

        {/* Creative List */}
        <div className="glass-card p-4 col-span-1">
          <div className="section-label mb-3">Scored Creatives</div>
          <div className="space-y-2">
            {PERFORMANCE_SCORES.map(sc => {
              const color = scoreColor(sc.overallScore);
              const pc = PREDICTION_CONFIG[sc.prediction];
              const isActive = selected.id === sc.id;
              return (
                <button key={sc.id} onClick={() => setSelected(sc)}
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
        </div>
      </div>
    </div>
  );
}
