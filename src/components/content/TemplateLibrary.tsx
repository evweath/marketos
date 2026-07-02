'use client';

import { useState } from 'react';
import { Search, Star, LayoutGrid, ChevronRight, X } from 'lucide-react';
import { TEMPLATE_CATEGORIES } from '@/lib/contentData';

type PlatformFilter = 'all' | 'google' | 'meta' | 'tiktok' | 'instagram' | 'youtube' | 'linkedin' | 'email';
type SortOption = 'newest' | 'popular' | 'performing';

interface Template {
  id: string;
  name: string;
  category: string;
  platforms: string[];
  gradient: string;
  rating: number;
  uses: number;
  dimensions: string;
  description: string;
}

const TEMPLATES: Template[] = [
  { id: 't-001', name: 'Bold Product Hero', category: 'Social Media', platforms: ['meta', 'instagram'], gradient: 'linear-gradient(135deg, #0866FF, #00d9ff)', rating: 4.9, uses: 12840, dimensions: '1080×1080', description: 'High-contrast product feature template with bold typography. Best for showcasing single flagship products with a strong CTA overlay.' },
  { id: 't-002', name: 'Minimal White Space', category: 'Display Ads', platforms: ['google', 'meta'], gradient: 'linear-gradient(135deg, #374151, #6b7280)', rating: 4.7, uses: 8420, dimensions: '300×250', description: 'Clean, minimal design with generous white space. Proven to perform in premium B2B contexts where trust signals matter most.' },
  { id: 't-003', name: 'TikTok Native Story', category: 'Stories', platforms: ['tiktok', 'instagram'], gradient: 'linear-gradient(135deg, #FF0050, #FF8C00)', rating: 4.8, uses: 19200, dimensions: '1080×1920', description: 'Feels native to TikTok\'s interface — uses in-app text styles and caption overlays to blend with organic content.' },
  { id: 't-004', name: 'YouTube Thumbnail Pro', category: 'YouTube Thumbnails', platforms: ['youtube'], gradient: 'linear-gradient(135deg, #FF0000, #cc0000)', rating: 4.6, uses: 6840, dimensions: '1280×720', description: 'High CTR thumbnail design with face placeholder zone, bold title overlay, and contrast-optimized color backgrounds.' },
  { id: 't-005', name: 'B2B LinkedIn Post', category: 'Social Media', platforms: ['linkedin'], gradient: 'linear-gradient(135deg, #0A66C2, #004182)', rating: 4.5, uses: 4210, dimensions: '1200×627', description: 'Professional LinkedIn-optimized layout with data visualization placeholder and corporate typography. Converts well for lead gen.' },
  { id: 't-006', name: 'Email Header — Promo', category: 'Email Headers', platforms: ['email'], gradient: 'linear-gradient(135deg, #10d98a, #00a86b)', rating: 4.8, uses: 15640, dimensions: '600×200', description: 'Email-safe HTML header template with promotion banner, countdown timer placeholder, and mobile-responsive layout.' },
  { id: 't-007', name: '5-Card Product Carousel', category: 'Carousels', platforms: ['meta', 'instagram'], gradient: 'linear-gradient(135deg, #7b93ff, #5900d3)', rating: 4.9, uses: 9840, dimensions: '1080×1080', description: 'Five-card carousel with consistent visual language across cards. Includes a hook card, 3 feature cards, and a CTA card.' },
  { id: 't-008', name: 'UGC-Style Video Frame', category: 'Video Ads', platforms: ['tiktok', 'instagram', 'meta'], gradient: 'linear-gradient(135deg, #FF0050, #7b93ff)', rating: 4.7, uses: 7280, dimensions: '1080×1920', description: 'Authentic UGC-style video frame with caption stickers, emoji overlays, and trending audio placeholder indicators.' },
  { id: 't-009', name: 'Holiday Sale Countdown', category: 'Display Ads', platforms: ['google', 'meta'], gradient: 'linear-gradient(135deg, #ff4444, #ffb347)', rating: 4.6, uses: 22400, dimensions: '728×90', description: 'Urgency-optimized banner with animated countdown timer and promotional pricing layout. Peak performance in Q4.' },
  { id: 't-010', name: 'Brand Story Reel', category: 'Video Ads', platforms: ['instagram', 'tiktok'], gradient: 'linear-gradient(135deg, #E1306C, #F77737)', rating: 4.8, uses: 11200, dimensions: '1080×1920', description: 'Three-scene reel structure: problem hook → solution demo → CTA. 85% retention rate template based on top-performing content.' },
  { id: 't-011', name: 'Wholesale B2B Flyer', category: 'Print', platforms: ['email', 'linkedin'], gradient: 'linear-gradient(135deg, #374151, #0A66C2)', rating: 4.4, uses: 2840, dimensions: '2480×3508', description: 'A4 print-ready wholesale price list and product catalogue template. CMYK color profile with 3mm bleed and crop marks.' },
  { id: 't-012', name: 'Agency Pitch Deck', category: 'Presentations', platforms: ['linkedin', 'email'], gradient: 'linear-gradient(135deg, #1a2240, #7b93ff)', rating: 4.7, uses: 3640, dimensions: '1920×1080', description: '16-slide pitch deck template with executive summary, market analysis, strategy, and case study sections. Google Slides compatible.' },
  { id: 't-013', name: 'Landing Page Hero', category: 'Landing Pages', platforms: ['google', 'meta'], gradient: 'linear-gradient(135deg, #00d9ff, #0866FF)', rating: 4.9, uses: 16840, dimensions: '1440×800', description: 'Above-the-fold landing page section with headline, subheadline, hero image zone, trust badges, and CTA button. Figma-ready.' },
  { id: 't-014', name: 'Instagram Stories Poll', category: 'Stories', platforms: ['instagram'], gradient: 'linear-gradient(135deg, #F77737, #E1306C)', rating: 4.5, uses: 8420, dimensions: '1080×1920', description: 'Interactive Stories template with poll sticker placement, question box, and countdown. Optimized for engagement-first campaigns.' },
  { id: 't-015', name: 'Google Smart Display', category: 'Display Ads', platforms: ['google'], gradient: 'linear-gradient(135deg, #34A853, #4285F4)', rating: 4.6, uses: 6840, dimensions: '300×600', description: 'Responsive display ad template that adapts to Google\'s smart display placements. Includes logo, headline, and image zones.' },
  { id: 't-016', name: 'Testimonial Showcase', category: 'Social Media', platforms: ['meta', 'instagram', 'linkedin'], gradient: 'linear-gradient(135deg, #10d98a, #7b93ff)', rating: 4.8, uses: 13240, dimensions: '1080×1080', description: 'Social proof template featuring customer photo, quote overlay, star rating, and brand credibility indicators. High-trust design.' },
  { id: 't-017', name: 'Before & After Split', category: 'Video Ads', platforms: ['meta', 'tiktok'], gradient: 'linear-gradient(135deg, #ff4444, #10d98a)', rating: 4.7, uses: 9640, dimensions: '1080×1920', description: 'Split-screen before/after reveal with animated transition. Top-performing format for transformation products and services.' },
  { id: 't-018', name: 'Countdown Flash Sale', category: 'Email Headers', platforms: ['email'], gradient: 'linear-gradient(135deg, #ff4444, #ffb347)', rating: 4.9, uses: 28400, dimensions: '600×300', description: 'High-urgency flash sale email header with real-time countdown timer, offer highlight, and mobile-responsive design.' },
  { id: 't-019', name: 'Product Feature Grid', category: 'Carousels', platforms: ['meta', 'instagram'], gradient: 'linear-gradient(135deg, #7b93ff, #00d9ff)', rating: 4.6, uses: 7840, dimensions: '1080×1080', description: 'Six-feature grid carousel showing product specs, benefits, or comparison points. Clean icon-plus-text layout.' },
  { id: 't-020', name: 'YouTube End Screen', category: 'YouTube Thumbnails', platforms: ['youtube'], gradient: 'linear-gradient(135deg, #FF0000, #7b93ff)', rating: 4.5, uses: 4280, dimensions: '1920×1080', description: 'End screen template with subscribe button zone, recommended video slot, and channel watermark positioning guidelines.' },
  { id: 't-021', name: 'Dark Mode Ad Banner', category: 'Display Ads', platforms: ['google', 'meta'], gradient: 'linear-gradient(135deg, #0a0e1a, #151c35)', rating: 4.7, uses: 5640, dimensions: '728×90', description: 'Premium dark-themed display banner that stands out on OLED screens and dark-mode browser environments.' },
  { id: 't-022', name: 'Influencer Collab Frame', category: 'Social Media', platforms: ['instagram', 'tiktok'], gradient: 'linear-gradient(135deg, #E1306C, #FF0050)', rating: 4.8, uses: 10240, dimensions: '1080×1080', description: 'Co-branded collaboration frame template with dual-brand zone, influencer photo placeholder, and hashtag section.' },
];

const PLATFORM_BADGES: Record<string, { label: string; color: string }> = {
  meta:      { label: 'Meta',      color: '#0866FF' },
  google:    { label: 'Google',    color: '#4285F4' },
  tiktok:    { label: 'TikTok',    color: '#FF0050' },
  instagram: { label: 'IG',        color: '#E1306C' },
  youtube:   { label: 'YT',        color: '#FF0000' },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2' },
  email:     { label: 'Email',     color: '#10d98a' },
};

export function TemplateLibrary() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [sort, setSort] = useState<SortOption>('popular');
  const [selected, setSelected] = useState<Template | null>(null);
  const [customizing, setCustomizing] = useState(false);

  const filtered = TEMPLATES.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || t.category === TEMPLATE_CATEGORIES.find(c => c.id === categoryFilter)?.name;
    const matchPlatform = platformFilter === 'all' || t.platforms.includes(platformFilter);
    return matchSearch && matchCat && matchPlatform;
  }).sort((a, b) => {
    if (sort === 'popular')    return b.uses - a.uses;
    if (sort === 'performing') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="flex gap-4">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header + Search */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>20,000+ Templates</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {filtered.length} matching your filters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="pl-7 pr-3 py-2 rounded-lg text-xs outline-none w-48"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
              />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              <option value="popular">Most Popular</option>
              <option value="performing">Best Performing</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setCategoryFilter('all')}
            className="px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all shrink-0"
            style={{
              background: categoryFilter === 'all' ? 'rgba(0,217,255,0.12)' : 'var(--bg-elevated)',
              color: categoryFilter === 'all' ? '#00d9ff' : 'var(--text-muted)',
              border: `1px solid ${categoryFilter === 'all' ? 'rgba(0,217,255,0.25)' : 'var(--border-subtle)'}`,
            }}>
            All Categories
          </button>
          {TEMPLATE_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}
              className="px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all shrink-0"
              style={{
                background: categoryFilter === cat.id ? 'rgba(0,217,255,0.12)' : 'var(--bg-elevated)',
                color: categoryFilter === cat.id ? '#00d9ff' : 'var(--text-muted)',
                border: `1px solid ${categoryFilter === cat.id ? 'rgba(0,217,255,0.25)' : 'var(--border-subtle)'}`,
              }}>
              {cat.name} <span className="opacity-50">{cat.count.toLocaleString()}</span>
            </button>
          ))}
        </div>

        {/* Platform Filter */}
        <div className="flex items-center gap-2">
          <span className="section-label">Platform:</span>
          <div className="flex gap-1">
            {(['all', 'google', 'meta', 'tiktok', 'instagram', 'youtube', 'linkedin', 'email'] as const).map(p => (
              <button key={p} onClick={() => setPlatformFilter(p)}
                className="px-2.5 py-1 rounded-lg text-[10px] capitalize transition-all"
                style={{
                  background: platformFilter === p ? (p === 'all' ? 'rgba(0,217,255,0.12)' : PLATFORM_BADGES[p]?.color + '20') : 'var(--bg-elevated)',
                  color: platformFilter === p ? (p === 'all' ? '#00d9ff' : PLATFORM_BADGES[p]?.color) : 'var(--text-muted)',
                  border: `1px solid ${platformFilter === p ? (p === 'all' ? 'rgba(0,217,255,0.25)' : PLATFORM_BADGES[p]?.color + '40') : 'var(--border-subtle)'}`,
                }}>
                {p === 'all' ? 'All' : PLATFORM_BADGES[p]?.label ?? p}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-3 gap-3">
          {filtered.map(template => (
            <button key={template.id} onClick={() => setSelected(template)}
              className="text-left rounded-xl overflow-hidden transition-all hover:scale-[1.01]"
              style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${selected?.id === template.id ? 'rgba(0,217,255,0.4)' : 'var(--border-dim)'}`,
              }}>
              {/* Gradient Preview */}
              <div className="h-28 flex items-center justify-center relative"
                style={{ background: template.gradient }}>
                <LayoutGrid size={20} color="rgba(255,255,255,0.3)" />
                <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                  {template.platforms.slice(0, 2).map(p => (
                    <span key={p} className="text-[8px] font-mono px-1 py-0.5 rounded"
                      style={{ background: 'rgba(0,0,0,0.4)', color: PLATFORM_BADGES[p]?.color ?? 'white' }}>
                      {PLATFORM_BADGES[p]?.label ?? p}
                    </span>
                  ))}
                  {template.platforms.length > 2 && (
                    <span className="text-[8px] font-mono px-1 py-0.5 rounded"
                      style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.6)' }}>
                      +{template.platforms.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5">
                <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{template.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{template.category}</span>
                  <div className="flex items-center gap-1">
                    <Star size={9} fill="#ffb347" stroke="none" />
                    <span className="text-[9px] font-mono" style={{ color: '#ffb347' }}>{template.rating}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <button onClick={e => { e.stopPropagation(); setSelected(template); }}
                    className="w-full py-1.5 rounded-lg text-[10px] font-medium transition-all hover:opacity-90"
                    style={{ background: 'rgba(0,217,255,0.1)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.2)' }}>
                    Use Template
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Template Panel */}
      {selected && (
        <div className="w-64 shrink-0">
          <div className="glass-card p-4 sticky top-0">
            <div className="flex items-center justify-between mb-3">
              <span className="section-label">Template Details</span>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            </div>

            <div className="h-32 rounded-xl mb-3 flex items-center justify-center"
              style={{ background: selected.gradient }}>
              <LayoutGrid size={24} color="rgba(255,255,255,0.4)" />
            </div>

            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{selected.name}</h3>
            <p className="text-[10px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              {selected.description}
            </p>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="section-label">Dimensions</span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-primary)' }}>{selected.dimensions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="section-label">Category</span>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{selected.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="section-label">Rating</span>
                <div className="flex items-center gap-1">
                  <Star size={9} fill="#ffb347" stroke="none" />
                  <span className="text-[10px] font-mono" style={{ color: '#ffb347' }}>{selected.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="section-label">Times Used</span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-primary)' }}>{selected.uses.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-3">
              <span className="section-label block mb-1.5">Platforms</span>
              <div className="flex flex-wrap gap-1">
                {selected.platforms.map(p => (
                  <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: PLATFORM_BADGES[p]?.color + '18', color: PLATFORM_BADGES[p]?.color }}>
                    {PLATFORM_BADGES[p]?.label ?? p}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={() => { setCustomizing(true); setTimeout(() => setCustomizing(false), 2000); }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: '#00d9ff', color: '#0a0e1a' }}>
              <ChevronRight size={13} />{customizing ? 'Opening Editor…' : 'Customize in Editor'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
