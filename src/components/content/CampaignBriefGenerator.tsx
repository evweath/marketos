'use client';

import { useState } from 'react';
import {
  FileText, Loader2, Download, Share2, Target, Users, MessageSquare,
  BarChart2, Clock, ChevronRight, Zap
} from 'lucide-react';
import { CAMPAIGN_BRIEFS } from '@/lib/contentData';
import type { CampaignBrief, CampaignObjective } from '@/lib/contentData';

const OBJECTIVE_CONFIG: Record<CampaignObjective, { color: string; bg: string }> = {
  'Brand Awareness':  { color: 'var(--cyan)', bg: 'rgba(0,217,255,0.12)'   },
  'Lead Generation':  { color: '#7b93ff', bg: 'rgba(123,147,255,0.12)' },
  'Sales':            { color: '#10d98a', bg: 'rgba(16,217,138,0.12)'  },
  'Retargeting':      { color: '#ffb347', bg: 'rgba(255,179,71,0.12)'  },
  'Product Launch':   { color: '#ff4444', bg: 'rgba(255,68,68,0.12)'   },
};

const CHANNEL_OPTIONS = ['Google', 'Meta', 'TikTok', 'YouTube', 'LinkedIn', 'Email'];

const GENERATED_BRIEF_TEMPLATE: CampaignBrief = {
  id: 'generated',
  title: 'AI-Generated Campaign Brief',
  objective: 'Sales',
  executiveSummary: 'Drive direct sales and maximize ROAS for your target product across selected channels. This multi-channel campaign leverages AI-optimized creative and audience targeting to reach high-intent buyers at the right moment in their purchase journey.',
  targetAudience: {
    demographics: 'Primary buyers matching your specified audience profile, targeted by platform behavioral data and interest signals',
    psychographics: 'Intent-driven purchasers who are actively researching solutions in your category. They respond to social proof, ROI-focused messaging, and urgency-based creative.',
    behaviors: 'Recent category searches, competitor site visits, email newsletter engagement, and social content interaction patterns',
  },
  keyMessages: [
    'Lead with your strongest value proposition — the benefit that no competitor can match',
    'Use social proof (reviews, customer count, case studies) to reduce purchase anxiety',
    'Create urgency through time-limited offers, stock scarcity, or seasonal relevance',
    'Address the top 3 objections your customers raise before buying',
  ],
  channelStrategy: [
    { channel: 'Primary Channel', budgetPercent: 50, recommendation: 'Allocate the majority of budget to your highest-ROAS channel based on historical performance data.', formats: ['Image Ads', 'Video', 'Carousel'] },
    { channel: 'Secondary Channel', budgetPercent: 30, recommendation: 'Use a secondary channel to reach prospects at a different stage of the funnel or on different devices.', formats: ['Display', 'Native'] },
    { channel: 'Retention Layer', budgetPercent: 20, recommendation: 'Email and retargeting to recapture interested visitors and nurture existing leads toward conversion.', formats: ['Email Sequence', 'Retargeting Ads'] },
  ],
  creativeRequirements: [
    '3× hero images in platform-specific sizes (square, portrait, landscape)',
    '1× 15-second video optimized for mobile-first viewing',
    'Email sequence: welcome → product highlight → urgency/offer → social proof',
  ],
  kpiTargets: { impressions: '1.2M', clicks: '14,400', conversions: '288', roas: '6.0×', cpa: '$35' },
  timeline: '4 weeks',
  milestones: [
    'Week 1: Asset production and campaign setup',
    'Week 2: Launch — learning phase monitoring',
    'Week 3: First optimization — pause underperformers, scale winners',
    'Week 4: Final push and report preparation',
  ],
  budget: '$10,000',
  channels: ['Google', 'Meta', 'Email'],
  generatedAt: 'Just now',
};

export function CampaignBriefGenerator() {
  const [objective, setObjective] = useState<CampaignObjective>('Sales');
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [budget, setBudget] = useState('$5K–$20K');
  const [timeline, setTimeline] = useState('1 month');
  const [channels, setChannels] = useState<string[]>(['Google', 'Meta']);
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState<CampaignBrief | null>(null);
  const [shared, setShared] = useState(false);
  const [viewedId, setViewedId] = useState<string | null>(null);

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  const briefToText = (b: CampaignBrief) =>
    `${b.title}\n${'='.repeat(b.title.length)}\n\n` +
    `Objective: ${b.objective}\nBudget: ${b.budget}\nTimeline: ${b.timeline}\nChannels: ${b.channels.join(', ')}\n\n` +
    `EXECUTIVE SUMMARY\n${b.executiveSummary}\n\n` +
    `TARGET AUDIENCE\n- Demographics: ${b.targetAudience.demographics}\n- Psychographics: ${b.targetAudience.psychographics}\n- Behaviors: ${b.targetAudience.behaviors}\n\n` +
    `KEY MESSAGES\n${b.keyMessages.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\n` +
    `CHANNEL STRATEGY\n${b.channelStrategy.map(c => `- ${c.channel} (${c.budgetPercent}%): ${c.recommendation}`).join('\n')}\n\n` +
    `KPI TARGETS\nImpressions: ${b.kpiTargets.impressions} · Clicks: ${b.kpiTargets.clicks} · Conversions: ${b.kpiTargets.conversions} · ROAS: ${b.kpiTargets.roas} · CPA: ${b.kpiTargets.cpa}\n\n` +
    `MILESTONES\n${b.milestones.join('\n')}`;

  const handleShare = (b: CampaignBrief) => {
    navigator.clipboard?.writeText(briefToText(b)).catch(() => undefined);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleExportPdf = (b: CampaignBrief) => {
    const blob = new Blob([briefToText(b)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${b.title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setBrief(null);
    setTimeout(() => {
      const title = product
        ? `${product} — ${objective} Campaign Brief`
        : `${objective} Campaign Brief`;
      setBrief({ ...GENERATED_BRIEF_TEMPLATE, title, objective, budget, channels, timeline });
      setGenerating(false);
    }, 2500);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4">
        {/* Input Form */}
        <div className="glass-card p-4 space-y-3 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={13} style={{ color: '#ffb347' }} />
            <span className="section-label">Brief Generator</span>
          </div>

          <div>
            <label className="section-label block mb-1.5">Campaign Objective</label>
            <select value={objective} onChange={e => setObjective(e.target.value as CampaignObjective)}
              className="w-full px-3 py-2 rounded-lg text-base outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {(['Brand Awareness', 'Lead Generation', 'Sales', 'Retargeting', 'Product Launch'] as CampaignObjective[]).map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="section-label block mb-1.5">Product / Service Description</label>
            <textarea value={product} onChange={e => setProduct(e.target.value)}
              placeholder="Describe what you're promoting — include key features, benefits, and differentiators..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-base outline-none resize-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">Target Audience</label>
            <textarea value={audience} onChange={e => setAudience(e.target.value)}
              placeholder="Describe your ideal customer — demographics, interests, pain points, buying behavior..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-base outline-none resize-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="section-label block mb-1.5">Budget Range</label>
              <select value={budget} onChange={e => setBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                <option>Under $1K</option>
                <option>$1K–$5K</option>
                <option>$5K–$20K</option>
                <option>$20K–$100K</option>
                <option>$100K+</option>
              </select>
            </div>
            <div>
              <label className="section-label block mb-1.5">Timeline</label>
              <select value={timeline} onChange={e => setTimeline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                <option>1 week</option>
                <option>2 weeks</option>
                <option>1 month</option>
                <option>3 months</option>
                <option>6 months</option>
              </select>
            </div>
          </div>

          <div>
            <label className="section-label block mb-1.5">Platforms</label>
            <div className="flex flex-wrap gap-1.5">
              {CHANNEL_OPTIONS.map(ch => {
                const active = channels.includes(ch);
                return (
                  <button key={ch} onClick={() => toggleChannel(ch)}
                    className="px-2.5 py-1 rounded-lg text-[16px] transition-all"
                    style={{
                      background: active ? 'rgba(255,179,71,0.12)' : 'var(--bg-elevated)',
                      color: active ? '#ffb347' : 'var(--text-muted)',
                      border: `1px solid ${active ? 'rgba(255,179,71,0.3)' : 'var(--border-subtle)'}`,
                    }}>
                    {active && '✓ '}{ch}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-base font-semibold transition-all"
            style={{
              background: generating ? 'rgba(255,179,71,0.3)' : '#ffb347',
              color: '#0a0e1a',
              cursor: generating ? 'not-allowed' : 'pointer',
            }}>
            {generating ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
            {generating ? 'Generating Brief...' : 'Generate Brief'}
          </button>
        </div>

        {/* Brief Display */}
        <div className="col-span-3">
          {generating && (
            <div className="glass-card h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: '#ffb347' }} />
                <div className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Generating your campaign brief...</div>
                <div className="text-base" style={{ color: 'var(--text-muted)' }}>Analyzing objectives, audience, and channel mix</div>
              </div>
            </div>
          )}

          {!generating && !brief && (
            <div className="glass-card h-full flex items-center justify-center">
              <div className="text-center">
                <FileText size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <div className="text-base font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No brief generated yet</div>
                <div className="text-base" style={{ color: 'var(--text-muted)' }}>Fill in the form and click Generate Brief</div>
              </div>
            </div>
          )}

          {brief && !generating && (
            <div className="space-y-3">
              {/* Header */}
              <div className="glass-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{brief.title}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: OBJECTIVE_CONFIG[brief.objective].bg, color: OBJECTIVE_CONFIG[brief.objective].color }}>
                        {brief.objective}
                      </span>
                      <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {brief.budget} · {brief.timeline}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleShare(brief)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[16px] hover:bg-white/5 transition-colors"
                      style={{ color: shared ? '#10d98a' : 'var(--text-secondary)', border: `1px solid ${shared ? 'rgba(16,217,138,0.3)' : 'var(--border-subtle)'}` }}>
                      <Share2 size={10} />{shared ? 'Copied!' : 'Share'}
                    </button>
                    <button onClick={() => handleExportPdf(brief)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[16px] hover:bg-white/5 transition-colors"
                      style={{ color: '#ffb347', border: '1px solid rgba(255,179,71,0.25)' }}>
                      <Download size={10} />Export PDF
                    </button>
                  </div>
                </div>
                <p className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {brief.executiveSummary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Target Audience */}
                <div className="glass-card-elevated p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users size={11} style={{ color: 'var(--cyan)' }} />
                    <span className="section-label">Target Audience</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Demographics', value: brief.targetAudience.demographics },
                      { label: 'Psychographics', value: brief.targetAudience.psychographics },
                      { label: 'Behaviors', value: brief.targetAudience.behaviors },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="text-[16px] font-mono uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                        <div className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Messages */}
                <div className="glass-card-elevated p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MessageSquare size={11} style={{ color: '#7b93ff' }} />
                    <span className="section-label">Key Messages</span>
                  </div>
                  <ol className="space-y-1.5">
                    {brief.keyMessages.map((msg, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[16px] font-mono shrink-0 mt-0.5" style={{ color: '#7b93ff' }}>{i + 1}.</span>
                        <span className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{msg}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Channel Strategy */}
              <div className="glass-card-elevated p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Target size={11} style={{ color: '#ffb347' }} />
                  <span className="section-label">Channel Strategy</span>
                </div>
                <div className="space-y-2">
                  {brief.channelStrategy.map((ch, i) => (
                    <div key={i} className="flex gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                      <div className="w-10 shrink-0 text-center">
                        <div className="text-base font-bold" style={{ color: '#ffb347' }}>{ch.budgetPercent}%</div>
                        <div className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>budget</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[16px] font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{ch.channel}</div>
                        <div className="text-[16px] mb-1" style={{ color: 'var(--text-secondary)' }}>{ch.recommendation}</div>
                        <div className="flex gap-1">
                          {ch.formats.map(f => (
                            <span key={f} className="text-[16px] font-mono px-1 py-0.5 rounded"
                              style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs + Timeline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card-elevated p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <BarChart2 size={11} style={{ color: '#10d98a' }} />
                    <span className="section-label">KPI Targets</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Impressions', value: brief.kpiTargets.impressions },
                      { label: 'Clicks', value: brief.kpiTargets.clicks },
                      { label: 'Conversions', value: brief.kpiTargets.conversions },
                      { label: 'Target ROAS', value: brief.kpiTargets.roas },
                      { label: 'Target CPA', value: brief.kpiTargets.cpa },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-1.5 rounded" style={{ background: 'var(--bg-surface)' }}>
                        <div className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>{label}</div>
                        <div className="text-base font-bold font-mono" style={{ color: '#10d98a' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card-elevated p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock size={11} style={{ color: 'var(--cyan)' }} />
                    <span className="section-label">Timeline & Milestones</span>
                  </div>
                  <div className="space-y-1.5">
                    {brief.milestones.map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: 'rgba(0,217,255,0.15)', border: '1px solid rgba(0,217,255,0.3)' }}>
                          <ChevronRight size={7} style={{ color: 'var(--cyan)' }} />
                        </div>
                        <span className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Briefs */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={13} style={{ color: 'var(--text-secondary)' }} />
          <span className="section-label">Recent Briefs</span>
        </div>
        <div className="space-y-2">
          {CAMPAIGN_BRIEFS.map(b => {
            const oc = OBJECTIVE_CONFIG[b.objective];
            return (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/3 cursor-pointer"
                style={{ border: '1px solid var(--border-subtle)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-medium truncate mb-1" style={{ color: 'var(--text-primary)' }}>{b.title}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-mono px-1.5 py-0.5 rounded" style={{ background: oc.bg, color: oc.color }}>
                      {b.objective}
                    </span>
                    {b.channels.map(ch => (
                      <span key={ch} className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>{ch}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>{b.generatedAt}</span>
                  <button onClick={() => { setBrief(b); setViewedId(b.id); }}
                    className="px-2.5 py-1 rounded-lg text-[16px] font-medium transition-all hover:opacity-80"
                    style={{ background: 'var(--bg-elevated)', color: viewedId === b.id ? '#ffb347' : 'var(--text-secondary)', border: `1px solid ${viewedId === b.id ? 'rgba(255,179,71,0.3)' : 'var(--border-dim)'}` }}>
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
