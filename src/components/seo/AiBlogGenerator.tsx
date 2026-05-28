'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Edit2, Upload, ChevronDown } from 'lucide-react';
import type { StoreId } from '@/lib/seoData';

type Tone = 'informative' | 'conversational' | 'persuasive' | 'technical';
type WordCount = 500 | 1000 | 1500 | 2000;

interface SeoScoreBreakdown {
  titleOptimization: number;
  keywordDensity: number;
  readability: number;
  internalLinks: number;
  metaDescription: number;
}

interface GeneratedBlog {
  id: string;
  title: string;
  metaDescription: string;
  store: StoreId;
  wordCount: number;
  readingTime: number;
  seoScore: number;
  breakdown: SeoScoreBreakdown;
  content: string;
  generatedAt: string;
  tone: Tone;
}

const PREVIOUS_BLOGS: GeneratedBlog[] = [
  {
    id: 'blog-001',
    title: 'How to Choose the Right Commercial Donut Fryer for Your Bakery',
    metaDescription: 'Discover the key factors for selecting a commercial donut fryer — capacity, oil recovery, and energy efficiency — with expert recommendations for every production volume.',
    store: 'donut-equipment',
    wordCount: 1480,
    readingTime: 6,
    seoScore: 94,
    breakdown: { titleOptimization: 96, keywordDensity: 91, readability: 94, internalLinks: 88, metaDescription: 100 },
    content: '',
    generatedAt: 'May 9, 2026',
    tone: 'informative',
  },
  {
    id: 'blog-002',
    title: '7 Bulk Donut Mix Brands Compared: Quality, Price & Yield',
    metaDescription: 'We tested 7 wholesale donut mix brands head-to-head. See which delivers the best rise, flavor, and cost-per-dozen for high-volume bakeries.',
    store: 'donut-supplies',
    wordCount: 1620,
    readingTime: 7,
    seoScore: 88,
    breakdown: { titleOptimization: 90, keywordDensity: 84, readability: 92, internalLinks: 82, metaDescription: 94 },
    content: '',
    generatedAt: 'May 6, 2026',
    tone: 'informative',
  },
  {
    id: 'blog-003',
    title: 'Bakery Supply Chain 2026: Why Wholesale Sourcing Beats Retail',
    metaDescription: 'Switching to wholesale bakery ingredients can cut costs by 35-50%. Here\'s a step-by-step guide to transitioning your procurement strategy.',
    store: 'bakery-wholesalers',
    wordCount: 1920,
    readingTime: 8,
    seoScore: 91,
    breakdown: { titleOptimization: 93, keywordDensity: 88, readability: 90, internalLinks: 92, metaDescription: 96 },
    content: '',
    generatedAt: 'May 3, 2026',
    tone: 'persuasive',
  },
  {
    id: 'blog-004',
    title: 'Donut Glazing Machine Setup: A Step-by-Step Technical Guide',
    metaDescription: 'Complete installation and calibration guide for commercial donut glazing machines. Includes belt speed settings, temperature profiles, and maintenance schedule.',
    store: 'donut-equipment',
    wordCount: 980,
    readingTime: 4,
    seoScore: 82,
    breakdown: { titleOptimization: 85, keywordDensity: 78, readability: 86, internalLinks: 74, metaDescription: 90 },
    content: '',
    generatedAt: 'Apr 28, 2026',
    tone: 'technical',
  },
];

const STORE_OPTIONS: { value: StoreId; label: string }[] = [
  { value: 'donut-equipment',    label: 'Donut Equipment' },
  { value: 'donut-supplies',     label: 'Donut Supplies' },
  { value: 'bakery-wholesalers', label: 'Bakery Wholesale' },
];

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'informative',    label: 'Informative' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'persuasive',     label: 'Persuasive' },
  { value: 'technical',      label: 'Technical' },
];

const WORD_COUNTS: WordCount[] = [500, 1000, 1500, 2000];

function seoScoreColor(score: number): string {
  if (score >= 90) return '#10d98a';
  if (score >= 75) return '#ffb347';
  return '#ff4444';
}

function ScoreGauge({ score }: { score: number }) {
  const color = seoScoreColor(score);
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  return (
    <div className='relative flex items-center justify-center shrink-0' style={{ width: 100, height: 100 }}>
      <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={50} cy={50} r={r} fill='none' stroke='var(--bg-overlay)' strokeWidth={8} />
        <circle
          cx={50} cy={50} r={r} fill='none'
          stroke={color} strokeWidth={8}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap='round'
        />
      </svg>
      <div className='absolute text-center'>
        <div className='font-bold text-2xl leading-none' style={{ fontFamily: 'DM Mono', color }}>{score}</div>
        <div className='text-[9px] mt-0.5 font-mono uppercase tracking-wide' style={{ color: 'var(--text-muted)' }}>SEO</div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = seoScoreColor(score);
  return (
    <div>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-[11px]' style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className='text-[11px] font-mono font-semibold' style={{ color }}>{score}</span>
      </div>
      <div className='h-2.5 rounded-full overflow-hidden' style={{ background: 'var(--bg-overlay)' }}>
        <div className='h-full rounded-full transition-all' style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function generateBlogContent(topic: string, store: StoreId, tone: Tone, wordCount: WordCount): GeneratedBlog {
  const storeName = STORE_OPTIONS.find(s => s.value === store)?.label ?? store;
  const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)}: Complete Guide for ${storeName}`;
  const metaDescription = `Everything you need to know about ${topic.toLowerCase()}. Expert insights from ${storeName} — actionable tips, buying guidance, and industry best practices for 2026.`;

  const content = `# ${title}

${metaDescription}

## Introduction

Whether you're scaling production or just starting out, understanding ${topic.toLowerCase()} is essential for running a profitable bakery operation. In this guide, we cover everything from selection criteria to cost optimization — drawing on real-world insights from ${storeName}'s catalog of professional-grade products.

## Why ${topic} Matters in 2026

The commercial bakery equipment market has evolved significantly. Modern ${topic.toLowerCase()} solutions offer:

- **Automation** that reduces labor costs by 25-40%
- **Consistency** across every production run, reducing waste
- **Energy efficiency** improvements of up to 30% over legacy models
- **Smart controls** with remote monitoring and predictive maintenance alerts

According to industry data, bakeries that invest in the right equipment see average ROI within 18 months of purchase.

## Choosing the Right Solution

When evaluating ${topic.toLowerCase()}, consider the following key factors:

### 1. Production Capacity
Assess your peak hourly output requirements. Undersizing your equipment creates bottlenecks; oversizing inflates capital costs unnecessarily.

### 2. Space Constraints
Measure your production floor carefully. Allow for maintenance access — most equipment requires at minimum 18 inches of clearance on all sides.

### 3. Total Cost of Ownership
Purchase price is only part of the equation. Factor in energy consumption, consumables, maintenance contracts, and training costs.

### 4. Compliance & Safety
Ensure any equipment meets NSF, UL, and your local health department requirements. ${storeName} products carry full commercial certifications.

## Expert Recommendations

After analyzing hundreds of customer installations, our team at ${storeName} recommends a tiered approach based on production volume:

| Volume (units/day) | Recommended Category | Est. Investment |
|---|---|---|
| Under 200 | Entry-level commercial | $2,000–$5,000 |
| 200–800 | Mid-range production | $5,000–$12,000 |
| 800+ | Industrial / continuous | $12,000–$40,000+ |

## Maintenance Best Practices

Proper maintenance extends equipment life by 3-5 years on average. Key practices:

1. **Daily**: clean all contact surfaces, check oil/fluid levels, inspect seals
2. **Weekly**: deep-clean conveyor belts, calibrate temperature sensors
3. **Monthly**: lubricate moving parts, inspect electrical connections, test safety cutoffs
4. **Annually**: professional service inspection, replace wear components

## Conclusion

Investing in the right ${topic.toLowerCase()} solution pays dividends in product quality, labor efficiency, and uptime. Browse ${storeName}'s full catalog for detailed specifications, or contact our sales team for a free consultation tailored to your production goals.

*Ready to upgrade? [View our full product range](/products) or [request a quote](/contact).*`;

  const seoScore = Math.round(82 + Math.random() * 15);
  return {
    id: `blog-new-${Date.now()}`,
    title,
    metaDescription,
    store,
    wordCount,
    readingTime: Math.round(wordCount / 238),
    seoScore,
    breakdown: {
      titleOptimization: Math.min(100, seoScore + Math.round((Math.random() - 0.5) * 10)),
      keywordDensity:     Math.min(100, seoScore - 4 + Math.round((Math.random() - 0.5) * 8)),
      readability:        Math.min(100, seoScore + 2 + Math.round((Math.random() - 0.5) * 6)),
      internalLinks:      Math.min(100, seoScore - 8 + Math.round((Math.random() - 0.5) * 10)),
      metaDescription:    Math.min(100, seoScore + 4 + Math.round((Math.random() - 0.5) * 6)),
    },
    content,
    generatedAt: 'Just now',
    tone,
  };
}

const SELECT_STYLE: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-dim)',
  color: 'var(--text-primary)',
  fontFamily: 'DM Sans, sans-serif',
};

export function AiBlogGenerator() {
  const [topic, setTopic]             = useState('');
  const [store, setStore]             = useState<StoreId>('donut-equipment');
  const [tone, setTone]               = useState<Tone>('informative');
  const [wordCount, setWordCount]     = useState<WordCount>(1000);
  const [generating, setGenerating]   = useState(false);
  const [generated, setGenerated]     = useState<GeneratedBlog | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [prevBlogs, setPrevBlogs]     = useState<GeneratedBlog[]>(PREVIOUS_BLOGS);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const blog = generateBlogContent(topic, store, tone, wordCount);
      setGenerated(blog);
      setGenerating(false);
      setShowContent(false);
    }, 2000);
  };

  const handlePublish = (blog: GeneratedBlog) => {
    setPrevBlogs(prev => prev.filter(b => b.id !== blog.id));
  };

  return (
    <div className='space-y-4'>
      {/* Generator form */}
      <div className='glass-card p-5'>
        <div className='flex items-center gap-2 mb-4'>
          <Sparkles size={14} style={{ color: '#7b93ff' }} />
          <div className='section-label'>AI Blog Generator</div>
        </div>

        {/* Topic input — full width */}
        <div className='mb-4'>
          <label className='section-label block mb-1.5'>Topic / Target Keyword</label>
          <input
            type='text'
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder='e.g. commercial donut fryer maintenance'
            className='w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all'
            style={{
              ...SELECT_STYLE,
              fontSize: 13,
            }}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          />
        </div>

        {/* Store + Tone row */}
        <div className='grid grid-cols-2 gap-3 mb-4'>
          <div>
            <label className='section-label block mb-1.5'>Target Store</label>
            <div className='relative'>
              <select
                value={store}
                onChange={e => setStore(e.target.value as StoreId)}
                className='w-full px-3 py-2 rounded-xl text-sm appearance-none outline-none'
                style={SELECT_STYLE}
              >
                {STORE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label className='section-label block mb-1.5'>Tone</label>
            <div className='relative'>
              <select
                value={tone}
                onChange={e => setTone(e.target.value as Tone)}
                className='w-full px-3 py-2 rounded-xl text-sm appearance-none outline-none'
                style={SELECT_STYLE}
              >
                {TONE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Word count toggle */}
        <div className='mb-5'>
          <label className='section-label block mb-1.5'>Word Count</label>
          <div
            className='flex items-center gap-0.5 p-1'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10, width: 'fit-content' }}
          >
            {WORD_COUNTS.map(wc => (
              <button
                key={wc}
                onClick={() => setWordCount(wc)}
                className='px-4 py-1.5 text-xs font-mono transition-all'
                style={{
                  borderRadius: 7,
                  background: wordCount === wc ? 'rgba(123,147,255,0.2)' : 'transparent',
                  color: wordCount === wc ? '#7b93ff' : 'var(--text-secondary)',
                  border: wordCount === wc ? '1px solid rgba(123,147,255,0.4)' : '1px solid transparent',
                  fontWeight: wordCount === wc ? 600 : 400,
                }}
              >
                {wc.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button — prominent primary */}
        <button
          onClick={handleGenerate}
          disabled={generating || !topic.trim()}
          className='w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all'
          style={{
            background: generating || !topic.trim() ? 'rgba(0,217,255,0.08)' : '#00d9ff',
            color: generating || !topic.trim() ? '#00d9ff' : '#080b18',
            border: generating || !topic.trim() ? '1px solid rgba(0,217,255,0.25)' : 'none',
            opacity: !topic.trim() ? 0.5 : 1,
            cursor: generating || !topic.trim() ? 'default' : 'pointer',
          }}
        >
          {generating
            ? <><Loader2 size={14} className='animate-spin' />Generating blog post…</>
            : <><Sparkles size={14} />Generate Blog</>}
        </button>
      </div>

      {/* Generated result */}
      {generated && (
        <div className='glass-card p-5'>
          <div className='flex items-start justify-between gap-4 mb-4'>
            <div className='flex-1 min-w-0'>
              <div className='section-label mb-2'>Generated Blog Post</div>
              <div className='text-sm font-semibold mb-2 leading-snug' style={{ color: 'var(--text-primary)' }}>
                {generated.title}
              </div>
              <div className='text-xs leading-relaxed' style={{ color: 'var(--text-secondary)' }}>
                {generated.metaDescription}
              </div>
            </div>
            {/* Large prominent gauge */}
            <ScoreGauge score={generated.seoScore} />
          </div>

          {/* Meta chips */}
          <div className='flex items-center gap-2 flex-wrap mb-4'>
            {[
              { label: `${generated.wordCount.toLocaleString()} words` },
              { label: `${generated.readingTime} min read` },
              { label: STORE_OPTIONS.find(s => s.value === generated.store)?.label ?? '' },
              { label: generated.tone },
            ].map(chip => (
              <span
                key={chip.label}
                className='text-[10px] font-mono px-2 py-0.5 rounded-full'
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                {chip.label}
              </span>
            ))}
          </div>

          {/* Score breakdown */}
          <div className='rounded-xl p-4 mb-4 space-y-3' style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className='section-label'>SEO Score Breakdown</div>
            <ScoreBar label='Title Optimization' score={generated.breakdown.titleOptimization} />
            <ScoreBar label='Keyword Density'    score={generated.breakdown.keywordDensity} />
            <ScoreBar label='Readability'         score={generated.breakdown.readability} />
            <ScoreBar label='Internal Links'      score={generated.breakdown.internalLinks} />
            <ScoreBar label='Meta Description'    score={generated.breakdown.metaDescription} />
          </div>

          {/* Content preview toggle */}
          <button
            onClick={() => setShowContent(s => !s)}
            className='w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono mb-3 transition-colors hover:bg-white/5'
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            <span>{showContent ? 'Hide' : 'Preview'} full article</span>
            <ChevronDown size={12} className={`transition-transform ${showContent ? 'rotate-180' : ''}`} />
          </button>

          {showContent && (
            <div
              className='rounded-xl p-4 mb-4 overflow-y-auto text-xs leading-relaxed whitespace-pre-wrap'
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                maxHeight: 400,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {generated.content}
            </div>
          )}

          <div className='flex gap-2'>
            <button
              onClick={() => setPrevBlogs(prev => [generated, ...prev])}
              className='flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all'
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-dim)' }}
            >
              <Edit2 size={12} />Edit Draft
            </button>
            <button
              onClick={() => {
                setPrevBlogs(prev => [{ ...generated, generatedAt: 'Just now' }, ...prev.filter(b => b.id !== generated.id)]);
                setGenerated(null);
              }}
              className='flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all'
              style={{ background: '#10d98a', color: '#080b18' }}
            >
              <Upload size={12} />Publish
            </button>
          </div>
        </div>
      )}

      {/* Previously generated */}
      <div className='glass-card p-4'>
        <div className='section-label mb-3'>Previously Generated ({prevBlogs.length})</div>
        <div className='space-y-2'>
          {prevBlogs.map(blog => {
            const color      = seoScoreColor(blog.seoScore);
            const storeLabel = STORE_OPTIONS.find(s => s.value === blog.store)?.label ?? blog.store;
            return (
              <div
                key={blog.id}
                className='rounded-xl p-3.5 flex items-center gap-3 transition-colors hover:bg-white/[0.02]'
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                {/* SEO score badge */}
                <div
                  className='w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm'
                  style={{ background: color + '18', color, fontFamily: 'DM Mono', border: `1px solid ${color}30` }}
                >
                  {blog.seoScore}
                </div>

                {/* Info */}
                <div className='flex-1 min-w-0'>
                  <div className='text-xs font-medium truncate mb-1' style={{ color: 'var(--text-primary)' }}>
                    {blog.title}
                  </div>
                  <div className='flex items-center gap-2 flex-wrap text-[10px] font-mono' style={{ color: 'var(--text-muted)' }}>
                    <span>{storeLabel}</span>
                    <span>·</span>
                    <span>{blog.wordCount.toLocaleString()}w</span>
                    <span>·</span>
                    <span>{blog.tone}</span>
                    <span>·</span>
                    <span>{blog.generatedAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-1.5 shrink-0'>
                  <button
                    className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all hover:bg-white/5'
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <Edit2 size={10} />Edit
                  </button>
                  <button
                    onClick={() => handlePublish(blog)}
                    className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold font-mono transition-all'
                    style={{ background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }}
                  >
                    <Upload size={10} />Publish
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
