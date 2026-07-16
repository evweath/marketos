'use client';

import { useState } from 'react';
import {
  Image, Video, User, Download, Edit3, Send, Loader2,
  Zap, Star, LayoutGrid
} from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { useStores, resolveStoreId } from '@/lib/storeScope';
import type { GeneratedCreative, ContentPlatform } from '@/lib/contentData';

type SubTab = 'image' | 'video' | 'ugc';

const PLATFORM_CONFIG: Record<ContentPlatform, { label: string; color: string; abbr: string }> = {
  google:    { label: 'Google',    color: '#4285F4', abbr: 'G'  },
  meta:      { label: 'Meta',      color: '#0866FF', abbr: 'M'  },
  tiktok:    { label: 'TikTok',    color: '#FF0050', abbr: 'TK' },
  youtube:   { label: 'YouTube',   color: '#FF0000', abbr: 'YT' },
  instagram: { label: 'Instagram', color: '#E1306C', abbr: 'IG' },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2', abbr: 'LI' },
};

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     color: '#7b93ff', bg: 'rgba(123,147,255,0.12)' },
  ready:     { label: 'Ready',     color: '#ffb347', bg: 'rgba(255,179,71,0.12)'  },
  published: { label: 'Published', color: '#10d98a', bg: 'rgba(16,217,138,0.12)'  },
};

const SCORE_COLOR = (s: number) => s >= 80 ? '#10d98a' : s >= 60 ? '#ffb347' : '#ff4444';

interface GeneratedResult {
  name: string;
  platform: string;
  size: string;
  format: string;
  color: string;
}

type Tone = 'bold' | 'playful' | 'professional' | 'urgent';
const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'bold', label: 'Bold' }, { value: 'playful', label: 'Playful' },
  { value: 'professional', label: 'Professional' }, { value: 'urgent', label: 'Urgent' },
];

// Three distinct creative angles generated simultaneously.
const VARIANT_ANGLES = [
  { angle: 'Benefit-led',  color: 'linear-gradient(135deg, #00d9ff, #7b93ff)', score: 84 },
  { angle: 'Social proof', color: 'linear-gradient(135deg, #10d98a, #00d9ff)', score: 78 },
  { angle: 'Urgency',      color: 'linear-gradient(135deg, #ffb347, #ff4444)', score: 71 },
];

interface Variant { id: string; name: string; angle: string; size: string; format: string; color: string; score: number; }

export function AdCreativeGenerator({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [subTab, setSubTab] = useState<SubTab>('image');
  const [productName, setProductName] = useState('');
  const [platform, setPlatform] = useState<ContentPlatform>('meta');
  const [objective, setObjective] = useState('conversions');
  const [sellingPoints, setSellingPoints] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [store, setStore] = useState(stores[0]?.domain ?? '');
  const [tone, setTone] = useState<Tone>('bold');
  const [useBrandVoice, setUseBrandVoice] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<Variant[] | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [allCreatives, setCreatives] = usePersistentState<GeneratedCreative[]>('content.creatives', []);
  const creatives = allCreatives.filter(c => selectedStoreIds.includes(resolveStoreId(c.store, stores) ?? ''));

  const subTabs: { key: SubTab; label: string; icon: typeof Image }[] = [
    { key: 'image', label: 'Image Ads',  icon: Image  },
    { key: 'video', label: 'Video Ads',  icon: Video  },
    { key: 'ugc',   label: 'UGC',        icon: User   },
  ];

  const SIZES: Record<SubTab, Record<ContentPlatform, string>> = {
    image: { meta: '1080×1080', google: '728×90', tiktok: '1080×1920', youtube: '1920×1080', instagram: '1080×1350', linkedin: '1200×627' },
    video: { meta: '1080×1080', google: '300×250', tiktok: '1080×1920', youtube: '1920×1080', instagram: '1080×1920', linkedin: '1920×1080' },
    ugc:   { meta: '1080×1920', google: '1920×1080', tiktok: '1080×1920', youtube: '1080×1920', instagram: '1080×1920', linkedin: '1920×1080' },
  };
  const FORMATS: Record<SubTab, string> = { image: 'PNG', video: 'MP4', ugc: 'MP4' };

  const handleGenerate = () => {
    if (!productName.trim()) return;
    setGenerating(true);
    setVariants(null);
    setSavedIds(new Set());
    setTimeout(() => {
      const base = `${productName} — ${PLATFORM_CONFIG[platform].label} ${subTab === 'ugc' ? 'UGC' : subTab.charAt(0).toUpperCase() + subTab.slice(1)}`;
      // 3 simultaneous variations, one per creative angle. Tone + brand-voice
      // nudge the per-variant score so the controls visibly matter.
      const toneBonus = tone === 'urgent' ? 4 : tone === 'bold' ? 2 : 0;
      const bvBonus = useBrandVoice ? 3 : 0;
      const v: Variant[] = VARIANT_ANGLES.map((a, i) => ({
        id: `var-${Date.now()}-${i}`,
        name: `${base} · ${a.angle}`,
        angle: a.angle,
        size: SIZES[subTab][platform],
        format: FORMATS[subTab],
        color: a.color,
        score: Math.min(99, a.score + toneBonus + bvBonus),
      }));
      setVariants(v);
      setGenerating(false);
    }, 1600);
  };

  const saveToLibrary = (v: Variant) => {
    const initials = productName.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const newCreative: GeneratedCreative = {
      id: v.id, type: subTab, platform, name: v.name, status: 'draft',
      performanceScore: v.score, size: v.size, format: v.format, createdAt: 'just now',
      store, thumbnailColor: v.color, thumbnailInitials: initials || 'AD',
    };
    setCreatives(prev => [newCreative, ...prev]);
    setSavedIds(prev => new Set(prev).add(v.id));
  };

  const filteredCreatives = creatives.filter(c =>
    subTab === 'image' ? c.type === 'image' : subTab === 'video' ? c.type === 'video' : c.type === 'ugc'
  );

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
        {subTabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setSubTab(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base transition-all"
            style={{
              background: subTab === key ? 'var(--bg-overlay)' : 'transparent',
              color: subTab === key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: subTab === key ? 500 : 400,
              border: subTab === key ? '1px solid var(--border-bright)' : '1px solid transparent',
            }}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Form */}
        <div className="glass-card p-4 space-y-3 col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={13} style={{ color: 'var(--cyan)' }} />
            <span className="section-label">Generate Creative</span>
          </div>

          <div>
            <label className="section-label block mb-1.5">Product / Service Name</label>
            <input
              value={productName} onChange={e => setProductName(e.target.value)}
              placeholder="e.g. ProFry 3000 Commercial Fryer"
              className="w-full px-3 py-2 rounded-lg text-base outline-none transition-colors"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">Target Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value as ContentPlatform)}
              className="w-full px-3 py-2 rounded-lg text-base outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="section-label block mb-1.5">Ad Objective</label>
            <select value={objective} onChange={e => setObjective(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-base outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              <option value="awareness">Brand Awareness</option>
              <option value="traffic">Traffic</option>
              <option value="conversions">Conversions</option>
              <option value="retargeting">Retargeting</option>
            </select>
          </div>

          <div>
            <label className="section-label block mb-1.5">Key Selling Points</label>
            <textarea
              value={sellingPoints} onChange={e => setSellingPoints(e.target.value)}
              placeholder="e.g. 40% faster heat recovery, 5-year warranty, NSF-certified..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-base outline-none resize-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="section-label block mb-1.5">CTA Text</label>
              <input
                value={ctaText} onChange={e => setCtaText(e.target.value)}
                placeholder="Shop Now"
                className="w-full px-3 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="section-label block mb-1.5">Store</label>
              <select value={store} onChange={e => setStore(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                {stores.map(s => <option key={s.id} value={s.domain}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Tone selector */}
          <div>
            <label className="section-label block mb-1.5">Tone</label>
            <div className="grid grid-cols-4 gap-1">
              {TONE_OPTIONS.map(t => {
                const active = tone === t.value;
                return (
                  <button key={t.value} onClick={() => setTone(t.value)}
                    className="py-1.5 rounded-lg text-[16px] font-medium transition-all"
                    style={{ background: active ? 'rgba(0,217,255,0.12)' : 'var(--bg-elevated)', color: active ? 'var(--cyan)' : 'var(--text-muted)', border: `1px solid ${active ? 'rgba(0,217,255,0.3)' : 'var(--border-subtle)'}` }}>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand voice toggle */}
          <button onClick={() => setUseBrandVoice(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-base transition-all"
            style={{ background: 'var(--bg-elevated)', border: `1px solid ${useBrandVoice ? 'rgba(123,147,255,0.3)' : 'var(--border-dim)'}` }}>
            <span style={{ color: 'var(--text-secondary)' }}>Apply Brand Voice</span>
            <span className="relative w-9 h-5 rounded-full transition-colors" style={{ background: useBrandVoice ? '#7b93ff' : 'var(--bg-overlay)' }}>
              <span className="absolute w-3.5 h-3.5 bg-white rounded-full top-0.5 transition-all" style={{ left: useBrandVoice ? '18px' : '2px' }} />
            </span>
          </button>

          <button
            onClick={handleGenerate}
            disabled={generating || !productName.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-base font-semibold transition-all"
            style={{
              background: generating || !productName.trim() ? 'rgba(0,217,255,0.3)' : '#00d9ff',
              color: '#0a0e1a',
              cursor: generating || !productName.trim() ? 'not-allowed' : 'pointer',
            }}>
            {generating ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
            {generating ? 'Generating 3 variations…' : 'Generate 3 Variations'}
          </button>
        </div>

        {/* 3-way Variations */}
        <div className="glass-card p-4 col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Variations</span>
            {variants && (
              <button onClick={handleGenerate}
                className="flex items-center gap-1 text-[16px] px-2 py-1 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                <Zap size={10} />Regenerate
              </button>
            )}
          </div>
          {variants ? (
            <div className="flex flex-col gap-2.5 flex-1">
              {variants.map(v => {
                const saved = savedIds.has(v.id);
                const sColor = SCORE_COLOR(v.score);
                return (
                  <div key={v.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                    <div className="h-16 flex items-center justify-between px-3 relative" style={{ background: v.color }}>
                      <span className="text-white/80 text-base font-semibold">{v.angle}</span>
                      <span className="text-[16px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}>{v.size}</span>
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Predicted score</span>
                        <span className="text-[16px] font-mono font-bold" style={{ color: sColor }}>{v.score}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-overlay)' }}>
                        <div className="h-full rounded-full" style={{ width: `${v.score}%`, background: sColor }} />
                      </div>
                      <button onClick={() => saveToLibrary(v)} disabled={saved}
                        className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[16px] font-medium transition-all"
                        style={saved
                          ? { background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }
                          : { background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                        {saved ? <><Star size={10} fill="#10d98a" />Saved to Library</> : <><Send size={10} />Save to Library</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl min-h-48"
              style={{ background: 'var(--bg-elevated)', border: '2px dashed var(--border-dim)' }}>
              {generating ? (
                <div className="text-center">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: 'var(--cyan)' }} />
                  <div className="text-base" style={{ color: 'var(--text-secondary)' }}>Generating 3 variations…</div>
                </div>
              ) : (
                <div className="text-center">
                  <Image size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <div className="text-base" style={{ color: 'var(--text-muted)' }}>Fill out the form and click</div>
                  <div className="text-base" style={{ color: 'var(--text-muted)' }}>Generate to see 3 variations</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="glass-card p-4 col-span-1">
          <div className="section-label mb-3">Creative Tips</div>
          <div className="space-y-2.5">
            {[
              { tip: 'Hook in 2 seconds', detail: 'The first 2 seconds determine if your audience keeps scrolling. Lead with your strongest visual.' },
              { tip: 'One clear CTA', detail: 'Creatives with a single clear call-to-action outperform multi-CTA variants by 38% on average.' },
              { tip: 'Platform-native sizing', detail: 'Use the exact pixel dimensions for each platform. Off-spec creative gets auto-cropped and loses impact.' },
              { tip: 'Test 3–5 variants', detail: 'AI-generated creatives should be A/B tested. Even a 10% CTR improvement compounds significantly at scale.' },
              { tip: 'Brand consistency', detail: 'Consistent brand elements (logo, color, font) across creatives build recognition and reduce CPA over time.' },
            ].map((item, i) => (
              <div key={i} className="p-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div className="text-[16px] font-semibold mb-0.5" style={{ color: 'var(--cyan)' }}>{item.tip}</div>
                <div className="text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Creatives */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid size={13} style={{ color: 'var(--text-secondary)' }} />
            <span className="section-label">Recent Creatives</span>
            <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {filteredCreatives.length} items
            </span>
          </div>
        </div>
        {filteredCreatives.length === 0 ? (
          <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
            No creatives generated yet — use the form above to create one.
          </div>
        ) : (
        <div className="grid grid-cols-4 gap-3">
          {filteredCreatives.map(creative => (
            <CreativeCard key={creative.id} creative={creative} />
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

function CreativeCard({ creative }: { creative: GeneratedCreative }) {
  const pc = PLATFORM_CONFIG[creative.platform];
  const sc = STATUS_CONFIG[creative.status];
  const scoreColor = SCORE_COLOR(creative.performanceScore);
  const [editing, setEditing] = useState(false);
  const [starred, setStarred] = useState(false);

  const handleDownload = () => {
    const content = `Creative\nName: ${creative.name}\nPlatform: ${pc.label}\nSize: ${creative.size}\nStatus: ${sc.label}\nPerformance Score: ${creative.performanceScore}\nCreated: ${creative.createdAt}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${creative.name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl overflow-hidden transition-all hover:border-white/20 cursor-pointer"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
      {/* Thumbnail */}
      <div className="h-24 flex items-center justify-center relative"
        style={{ background: creative.thumbnailColor }}>
        <span className="text-white/60 text-lg font-bold" style={{ fontFamily: 'DM Mono' }}>
          {creative.thumbnailInitials}
        </span>
        <div className="absolute top-1.5 left-1.5 text-[16px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: sc.bg, color: sc.color }}>
          {sc.label}
        </div>
        <div className="absolute top-1.5 right-1.5 text-[16px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: pc.color + '22', color: pc.color }}>
          {pc.abbr}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <div className="text-[16px] font-medium mb-1.5 truncate" style={{ color: 'var(--text-primary)' }}>
          {creative.name}
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>{creative.size}</span>
          <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>{creative.createdAt}</span>
        </div>

        {/* Score bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Performance</span>
            <span className="text-[16px] font-mono font-bold" style={{ color: scoreColor }}>
              {creative.performanceScore}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${creative.performanceScore}%`, background: scoreColor }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <button onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[16px] transition-colors hover:bg-white/5"
            style={{ color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.15)' }}>
            <Download size={9} />DL
          </button>
          <button onClick={() => { setEditing(true); setTimeout(() => setEditing(false), 2000); }}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[16px] transition-colors hover:bg-white/5"
            style={{ color: '#7b93ff', border: '1px solid rgba(123,147,255,0.15)' }}>
            <Edit3 size={9} />{editing ? '…' : 'Edit'}
          </button>
          <button onClick={() => setStarred(s => !s)}
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded text-[16px] transition-colors hover:bg-white/5"
            style={{ color: '#10d98a', border: '1px solid rgba(16,217,138,0.15)' }}>
            <Star size={9} fill={starred ? '#10d98a' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}
