'use client';

import { useState } from 'react';
import {
  PenLine, Copy, Check, Loader2, Sparkles, Clock, Bookmark
} from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';

type Formula = 'AIDA' | 'PAS' | 'BAB' | '4Ps' | 'Before-After';
type Tone = 'professional' | 'casual' | 'urgent' | 'witty' | 'empathetic';
type Platform = 'meta' | 'google' | 'tiktok' | 'linkedin' | 'email' | 'instagram';
type Strength = 'Strong' | 'Good' | 'Average';
type ContentType = 'ad' | 'headline' | 'email-subject' | 'product-desc' | 'social';

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'ad', label: 'Ad Copy' },
  { value: 'headline', label: 'Headline' },
  { value: 'email-subject', label: 'Email Subject' },
  { value: 'product-desc', label: 'Product Description' },
  { value: 'social', label: 'Social Caption' },
];

// Flesch Reading Ease approximation (0–100, higher = easier to read).
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  const groups = w.match(/[aeiouy]+/g);
  let n = groups ? groups.length : 1;
  if (w.endsWith('e') && n > 1) n -= 1;
  return Math.max(1, n);
}
function readabilityScore(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  const score = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount);
  return Math.max(0, Math.min(100, Math.round(score)));
}
function readabilityLabel(s: number): string {
  return s >= 70 ? 'Easy' : s >= 50 ? 'Standard' : 'Complex';
}

interface CopyVariant {
  id: string;
  text: string;
  charCount: number;
  strength: Strength;
  readability: number;
}

interface SavedCopy {
  id: string;
  contentType: ContentType;
  platform: Platform;
  text: string;
}

interface HistoryItem {
  id: string;
  platform: Platform;
  formula: Formula;
  text: string;
  generatedAt: string;
}

const FORMULA_DESCRIPTIONS: Record<Formula, string> = {
  'AIDA':         'Attention → Interest → Desire → Action',
  'PAS':          'Problem → Agitation → Solution',
  'BAB':          'Before → After → Bridge',
  '4Ps':          'Promise → Picture → Proof → Push',
  'Before-After': 'Before state vs. After transformation',
};

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; charLimit: number }> = {
  meta:      { label: 'Meta',      color: '#0866FF', charLimit: 125 },
  google:    { label: 'Google',    color: '#4285F4', charLimit: 90  },
  tiktok:    { label: 'TikTok',    color: '#FF0050', charLimit: 150 },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2', charLimit: 200 },
  email:     { label: 'Email',     color: '#10d98a', charLimit: 60  },
  instagram: { label: 'Instagram', color: '#E1306C', charLimit: 125 },
};

const VARIANT_TEMPLATES: Record<Formula, string[]> = {
  'AIDA': [
    '{product} is redefining what commercial kitchens expect. Imagine cutting your prep time in half. With {benefit}, your team can focus on what matters — creating. {cta}.',
    'Attention bakery owners: {product} has arrived. Industry-leading {benefit} means fewer delays, more output, and happier customers. Join 12,000+ food service operators who made the switch. {cta}.',
    'You noticed something was off. Your equipment wasn\'t keeping up. {product} solves that — {benefit}, backed by a 5-year commercial warranty. Ready to see it in action? {cta}.',
  ],
  'PAS': [
    'Inconsistent results are killing your margins. Every failed batch, every customer complaint, every minute of downtime compounds. {product} eliminates variability with {benefit}. Finally, consistency you can rely on. {cta}.',
    'Your current equipment is holding you back. Slow heat recovery means longer queues and smaller output windows. {product} solves this with {benefit} — and your competitors will wonder how you scaled so fast. {cta}.',
    'The problem isn\'t your team. It\'s the tools. {product} was engineered for the demands of professional kitchens with {benefit}. Less frustration, more production. {cta}.',
  ],
  'BAB': [
    'Before {product}: chasing temperatures, waiting between batches, inconsistent quality. After: {benefit}, every single time. The bridge? A 10-minute onboarding and you\'re running at full capacity. {cta}.',
    'Imagine your kitchen before the upgrade — and after. With {product}, {benefit} isn\'t a goal. It\'s the baseline. Make the switch today. {cta}.',
    'Before we helped bakeries like yours, equipment failure was a weekly headache. Now, with {product} and {benefit}, downtime is a thing of the past. {cta}.',
  ],
  '4Ps': [
    'Promise: the most efficient commercial fryer you\'ve ever operated. Picture your team hitting output targets without overtime. Proof: 4.9/5 stars from 2,400+ verified buyers. Push: limited inventory — {cta} now.',
    '{product} promises one thing: {benefit}, guaranteed. Picture serving 30% more customers with the same staff. Proof is in the numbers — request a demo. {cta}.',
    'We promise {product} will outperform your current setup or we\'ll refund it. Picture what {benefit} does for your bottom line. 2,400+ bakeries have already proven it. {cta}.',
  ],
  'Before-After': [
    'Before {product}: slow heat recovery, inconsistent batches, frustrated staff. After: {benefit}, a 40% productivity boost, and a kitchen that actually keeps up. {cta}.',
    'There\'s a before and after for every bakery that switches to {product}. The after includes {benefit} and the kind of consistency that builds a loyal customer base. {cta}.',
    'Your bakery before: equipment that slows you down. Your bakery after {product}: {benefit} and the confidence to take on bigger orders. Which do you prefer? {cta}.',
  ],
};

function fillTemplate(template: string, product: string, benefit: string, cta: string): string {
  return template
    .replace(/\{product\}/g, product || 'our solution')
    .replace(/\{benefit\}/g, benefit || 'unmatched performance')
    .replace(/\{cta\}/g, cta || 'Learn More');
}

const STRENGTH_CONFIG: Record<Strength, { color: string; bg: string }> = {
  Strong:  { color: '#10d98a', bg: 'rgba(16,217,138,0.12)'  },
  Good:    { color: '#ffb347', bg: 'rgba(255,179,71,0.12)'  },
  Average: { color: '#7b93ff', bg: 'rgba(123,147,255,0.12)' },
};

export function CopywritingTool() {
  const [formula, setFormula] = useState<Formula>('AIDA');
  const [platform, setPlatform] = useState<Platform>('meta');
  const [contentType, setContentType] = useState<ContentType>('ad');
  const [product, setProduct] = useState('');
  const [benefit, setBenefit] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [useBrandVoice, setUseBrandVoice] = useState(true);
  const [charLimit, setCharLimit] = useState(125);
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<CopyVariant[]>([]);
  const [history, setHistory] = usePersistentState<HistoryItem[]>('content.copyHistory', []);
  const [saved, setSaved] = usePersistentState<SavedCopy[]>('content.copySaved', []);
  const [copied, setCopied] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const templates = VARIANT_TEMPLATES[formula];
      const strengths: Strength[] = ['Strong', 'Good', 'Average'];
      const newVariants: CopyVariant[] = templates.map((t, i) => {
        const text = fillTemplate(t, product, benefit, 'Shop Now');
        return {
          id: `v-${Date.now()}-${i}`,
          text,
          charCount: text.length,
          strength: strengths[i] ?? 'Average',
          readability: readabilityScore(text),
        };
      });
      setVariants(newVariants);
      // Record the top variant into recent-copy history.
      if (newVariants[0]) {
        setHistory(prev => [
          { id: `h-${Date.now()}`, platform, formula, text: newVariants[0].text, generatedAt: 'just now' },
          ...prev,
        ].slice(0, 12));
      }
      setGenerating(false);
    }, 1500);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => undefined);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = (v: CopyVariant) => {
    setSaved(prev => [{ id: v.id, contentType, platform, text: v.text }, ...prev.filter(s => s.id !== v.id)].slice(0, 20));
    setSavedFlash(v.id);
    setTimeout(() => setSavedFlash(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4">
        {/* Left: Form */}
        <div className="glass-card p-4 space-y-3 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <PenLine size={13} style={{ color: '#7b93ff' }} />
            <span className="section-label">Copy Generator</span>
          </div>

          <div>
            <label className="section-label block mb-1.5">Copywriting Formula</label>
            <select value={formula} onChange={e => setFormula(e.target.value as Formula)}
              className="w-full px-3 py-2 rounded-lg text-base outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {(Object.keys(FORMULA_DESCRIPTIONS) as Formula[]).map(f => (
                <option key={f} value={f}>{f} — {FORMULA_DESCRIPTIONS[f]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="section-label block mb-1.5">Platform</label>
            <select value={platform} onChange={e => { setPlatform(e.target.value as Platform); setCharLimit(PLATFORM_CONFIG[e.target.value as Platform].charLimit); }}
              className="w-full px-3 py-2 rounded-lg text-base outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {(Object.entries(PLATFORM_CONFIG) as [Platform, { label: string; color: string; charLimit: number }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label} (max {v.charLimit} chars)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="section-label block mb-1.5">Content Type</label>
            <select value={contentType} onChange={e => setContentType(e.target.value as ContentType)}
              className="w-full px-3 py-2 rounded-lg text-base outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {CONTENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <button onClick={() => setUseBrandVoice(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-base transition-all"
            style={{ background: 'var(--bg-elevated)', border: `1px solid ${useBrandVoice ? 'rgba(123,147,255,0.3)' : 'var(--border-dim)'}` }}>
            <span style={{ color: 'var(--text-secondary)' }}>Apply Brand Voice</span>
            <span className="relative w-9 h-5 rounded-full transition-colors" style={{ background: useBrandVoice ? '#7b93ff' : 'var(--bg-overlay)' }}>
              <span className="absolute w-3.5 h-3.5 bg-white rounded-full top-0.5 transition-all" style={{ left: useBrandVoice ? '18px' : '2px' }} />
            </span>
          </button>

          <div>
            <label className="section-label block mb-1.5">Product / Service</label>
            <input value={product} onChange={e => setProduct(e.target.value)}
              placeholder="e.g. ProFry 3000 Commercial Fryer"
              className="w-full px-3 py-2 rounded-lg text-base outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">Key Benefit</label>
            <input value={benefit} onChange={e => setBenefit(e.target.value)}
              placeholder="e.g. 40% faster heat recovery"
              className="w-full px-3 py-2 rounded-lg text-base outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">Target Audience</label>
            <input value={audience} onChange={e => setAudience(e.target.value)}
              placeholder="e.g. Bakery owners, 35-55, food service"
              className="w-full px-3 py-2 rounded-lg text-base outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">Tone</label>
            <div className="flex flex-wrap gap-1.5">
              {(['professional', 'casual', 'urgent', 'witty', 'empathetic'] as Tone[]).map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className="px-2.5 py-1 rounded-lg text-[16px] capitalize transition-all"
                  style={{
                    background: tone === t ? 'rgba(123,147,255,0.15)' : 'var(--bg-elevated)',
                    color: tone === t ? '#7b93ff' : 'var(--text-muted)',
                    border: `1px solid ${tone === t ? 'rgba(123,147,255,0.3)' : 'var(--border-subtle)'}`,
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="section-label block mb-1.5">Character Limit</label>
            <div className="flex items-center gap-2">
              <input type="range" min={60} max={500} value={charLimit} onChange={e => setCharLimit(Number(e.target.value))}
                className="flex-1 accent-purple-400" />
              <span className="text-base font-mono w-10 text-right" style={{ color: '#7b93ff' }}>{charLimit}</span>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-base font-semibold transition-all"
            style={{
              background: generating ? 'rgba(123,147,255,0.3)' : '#7b93ff',
              color: '#0a0e1a',
              cursor: generating ? 'not-allowed' : 'pointer',
            }}>
            {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {generating ? 'Generating...' : 'Generate Copy'}
          </button>
        </div>

        {/* Right: Variants */}
        <div className="col-span-3 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles size={13} style={{ color: '#7b93ff' }} />
            <span className="section-label">Generated Variants</span>
            {generating && <Loader2 size={11} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
          </div>

          {variants.length === 0 && !generating && (
            <div className="glass-card p-8 text-center text-base" style={{ color: 'var(--text-muted)' }}>
              Fill out the form and click Generate Copy to see variants.
            </div>
          )}

          {variants.map((variant, idx) => {
            const sc = STRENGTH_CONFIG[variant.strength];
            const isOverLimit = variant.charCount > charLimit;
            return (
              <div key={variant.id} className="glass-card-elevated p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
                      Variant {idx + 1}
                    </span>
                    <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: sc.bg, color: sc.color }}>
                      {variant.strength}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                      title="Flesch reading ease"
                      style={{ background: variant.readability >= 70 ? 'rgba(16,217,138,0.12)' : variant.readability >= 50 ? 'rgba(255,179,71,0.12)' : 'rgba(255,68,68,0.12)', color: variant.readability >= 70 ? '#10d98a' : variant.readability >= 50 ? '#ffb347' : '#ff4444' }}>
                      {readabilityLabel(variant.readability)} · {variant.readability}
                    </span>
                    <span className="text-[16px] font-mono"
                      style={{ color: isOverLimit ? '#ff4444' : 'var(--text-muted)' }}>
                      {variant.charCount} / {charLimit} chars
                    </span>
                  </div>
                </div>

                <p className="text-base leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
                  {variant.text}
                </p>

                <div className="flex gap-2">
                  <button onClick={() => handleCopy(variant.id, variant.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[16px] transition-all hover:bg-white/5"
                    style={{ color: copied === variant.id ? '#10d98a' : 'var(--text-secondary)', border: `1px solid ${copied === variant.id ? 'rgba(16,217,138,0.3)' : 'var(--border-subtle)'}` }}>
                    {copied === variant.id ? <Check size={10} /> : <Copy size={10} />}
                    {copied === variant.id ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={() => handleSave(variant)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[16px] transition-all hover:bg-white/5"
                    style={{ color: savedFlash === variant.id ? '#10d98a' : '#7b93ff', border: `1px solid ${savedFlash === variant.id ? 'rgba(16,217,138,0.3)' : 'rgba(123,147,255,0.2)'}` }}>
                    <Bookmark size={10} />{savedFlash === variant.id ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved Copy */}
      {saved.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark size={13} style={{ color: '#7b93ff' }} />
            <span className="section-label">Saved Copy ({saved.length})</span>
          </div>
          <div className="space-y-2">
            {saved.map(item => {
              const pc = PLATFORM_CONFIG[item.platform];
              const ct = CONTENT_TYPES.find(c => c.value === item.contentType);
              return (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[16px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: '#7b93ff18', color: '#7b93ff' }}>{ct?.label}</span>
                  <span className="text-[16px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: pc.color + '18', color: pc.color }}>{pc.label}</span>
                  <span className="text-[16px] flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
                  <button onClick={() => setSaved(prev => prev.filter(s => s.id !== item.id))} className="shrink-0" style={{ color: 'var(--text-muted)' }}>
                    <Check size={12} style={{ display: 'none' }} />×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={13} style={{ color: 'var(--text-secondary)' }} />
          <span className="section-label">Recent Copy</span>
        </div>
        <div className="space-y-2">
          {history.length === 0 && (
            <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>
              No copy generated yet.
            </div>
          )}
          {history.map(item => {
            const pc = PLATFORM_CONFIG[item.platform];
            return (
              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-white/3"
                style={{ border: '1px solid var(--border-subtle)' }}>
                <span className="text-[16px] font-mono px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: pc.color + '18', color: pc.color }}>
                  {pc.label}
                </span>
                <span className="text-[16px] font-mono px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  {item.formula}
                </span>
                <span className="text-[16px] flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                  {item.text}
                </span>
                <span className="text-[16px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {item.generatedAt}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
