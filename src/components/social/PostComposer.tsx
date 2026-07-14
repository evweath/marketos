'use client';

import { useState } from 'react';
import { X, Sparkles, Clock, Save, Send } from 'lucide-react';
import { PLATFORM_CONFIG, CATEGORY_CONFIG, generateCaptions, NOT_STARTED_PLATFORMS } from '@/lib/socialData';
import type { SocialPost, SocialPlatform, PostCategory } from '@/lib/socialData';

interface Props {
  post?: SocialPost | null;
  defaultDate?: Date;
  onAddPost?: (post: SocialPost) => void;
  onUpdatePost?: (id: string, status: SocialPost['status']) => void;
  onClose: () => void;
}

const ALL_PLATFORMS: SocialPlatform[] = ['facebook', 'instagram', 'youtube', 'x-twitter', 'linkedin', 'tiktok'];
const ALL_CATEGORIES: PostCategory[] = ['promotional', 'educational', 'product', 'ugc', 'behind-scenes', 'seasonal'];

const STATUS_STYLE = {
  published: { color: '#10d98a', bg: 'rgba(16,217,138,0.10)',  label: 'Published' },
  scheduled: { color: '#00d9ff', bg: 'rgba(0,217,255,0.10)',   label: 'Scheduled' },
  draft:     { color: '#7b93ff', bg: 'rgba(123,147,255,0.10)', label: 'Draft'     },
  failed:    { color: '#ff4444', bg: 'rgba(255,68,68,0.10)',   label: 'Failed'    },
  review:    { color: '#ffb347', bg: 'rgba(255,179,71,0.10)',  label: 'In Review' },
};

interface AiSuggestion {
  platform: string;
  tone: string;
  caption: string;
  hashtags: string[];
}

export default function PostComposer({ post, defaultDate, onAddPost, onUpdatePost, onClose }: Props) {
  const [caption, setCaption] = useState(post?.caption ?? '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(post?.platforms ?? ['instagram']);
  const [category, setCategory] = useState<PostCategory>(post?.category ?? 'product');
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [aiTopic, setAiTopic] = useState('');
  const [activePlatformPreview, setActivePlatformPreview] = useState<SocialPlatform>(
    post?.platforms[0] ?? 'instagram'
  );
  const [feedback, setFeedback] = useState('');
  const [boosted, setBoosted] = useState(false);

  const isExisting = !!post;
  const charLimit = PLATFORM_CONFIG[activePlatformPreview].charLimit;
  const chars = caption.length;
  const charPct = Math.min((chars / charLimit) * 100, 100);
  const charColor = charPct >= 95 ? '#ff4444' : charPct >= 80 ? '#ffb347' : '#10d98a';
  const atLimit = chars >= charLimit * 0.95;

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? (prev.length > 1 ? prev.filter(x => x !== p) : prev) : [...prev, p]
    );
    setActivePlatformPreview(p);
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setAiSuggestions(generateCaptions(aiTopic) as AiSuggestion[]);
    setAiLoading(false);
  };

  const applySuggestion = (text: string) => {
    setCaption(text);
    setShowAI(false);
  };

  const schedDate = defaultDate || (post ? new Date(post.scheduledFor) : new Date());

  const createPost = (status: 'draft' | 'scheduled' | 'published') => {
    if (!caption.trim() || selectedPlatforms.length === 0) return;
    const now = new Date();
    const when = defaultDate || now;
    const newPost: SocialPost = {
      id: `sp-${now.getTime()}`,
      platforms: selectedPlatforms,
      status,
      category,
      caption: caption.trim(),
      hashtags: [],
      mediaType: 'image',
      scheduledFor: when.toISOString(),
      publishedAt: status === 'published' ? now.toISOString() : undefined,
      author: 'You',
      store: 'donut-equipment.com',
    };
    onAddPost?.(newPost);
    setFeedback(
      status === 'draft' ? 'Draft saved' : status === 'scheduled' ? 'Post scheduled' : 'Published now'
    );
    setTimeout(() => onClose(), 900);
  };

  const handleApproval = (status: 'published' | 'failed') => {
    if (!post) return;
    onUpdatePost?.(post.id, status);
    setFeedback(status === 'published' ? 'Post approved' : 'Post rejected');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {isExisting ? 'Post Details' : 'New Post'}
          </span>
          {post && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ background: STATUS_STYLE[post.status].bg, color: STATUS_STYLE[post.status].color }}>
              {STATUS_STYLE[post.status].label}
            </span>
          )}
        </div>
        <button onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]"
          style={{ color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Platform toggles */}
        <div>
          <div className="section-label mb-2">Platforms</div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_PLATFORMS.map(p => {
              const cfg = PLATFORM_CONFIG[p];
              const active = selectedPlatforms.includes(p);
              return (
                <button key={p}
                  onClick={() => !isExisting && togglePlatform(p)}
                  onMouseEnter={() => setActivePlatformPreview(p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: active ? cfg.color + '18' : 'var(--bg-elevated)',
                    color: active ? cfg.color : 'var(--text-muted)',
                    border: `1px solid ${active ? cfg.color + '45' : 'var(--border-subtle)'}`,
                    boxShadow: active ? `0 0 8px ${cfg.color}22` : 'none',
                    cursor: isExisting ? 'default' : 'pointer',
                  }}>
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: cfg.color + '30', color: cfg.color }}>
                    {cfg.label.charAt(0)}
                  </span>
                  {cfg.label}
                  {NOT_STARTED_PLATFORMS.includes(p) && (
                    <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>· Not started</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Caption */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="section-label">Caption</div>
            <div className="flex items-center gap-2">
              {/* Character counter */}
              <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: charColor }}>
                <span>{chars.toLocaleString()}</span>
                <span style={{ color: 'var(--text-muted)' }}>/ {charLimit.toLocaleString()}</span>
                <span style={{ color: 'var(--text-muted)' }}>({activePlatformPreview})</span>
              </div>
              {!isExisting && (
                <button
                  onClick={() => setShowAI(v => !v)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all"
                  style={{
                    background: showAI ? 'rgba(123,147,255,0.15)' : 'var(--bg-elevated)',
                    color: showAI ? '#7b93ff' : 'var(--text-secondary)',
                    border: `1px solid ${showAI ? 'rgba(123,147,255,0.3)' : 'var(--border-subtle)'}`,
                  }}>
                  <Sparkles size={10} />
                  AI Write
                </button>
              )}
            </div>
          </div>
          <textarea
            value={caption}
            onChange={e => !isExisting && setCaption(e.target.value)}
            readOnly={isExisting}
            rows={6}
            className="w-full text-sm rounded-xl px-3 py-3 resize-none outline-none transition-colors"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: `1px solid ${atLimit ? 'rgba(255,68,68,0.35)' : 'var(--border-subtle)'}`,
              lineHeight: 1.6,
            }}
            placeholder="Write your post caption..."
          />
          {/* Character progress bar */}
          <div className="mt-1.5 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${charPct}%`, background: charColor }} />
          </div>
        </div>

        {/* AI Caption Generator */}
        {showAI && (
          <div className="rounded-xl p-3 space-y-3 animate-fade-up"
            style={{
              background: 'linear-gradient(135deg, rgba(123,147,255,0.06) 0%, rgba(0,217,255,0.04) 100%)',
              border: '1px solid rgba(123,147,255,0.18)',
            }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center"
                style={{ background: 'rgba(123,147,255,0.2)' }}>
                <Sparkles size={11} style={{ color: '#7b93ff' }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: '#7b93ff' }}>AI Caption Generator</span>
              <span className="text-[9px] font-mono ml-auto" style={{ color: 'var(--text-muted)' }}>
                powered by Claude
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateAI()}
                placeholder="Describe your post topic..."
                className="flex-1 text-xs rounded-lg outline-none"
                style={{ padding: '8px 12px' }}
              />
              <button onClick={handleGenerateAI}
                disabled={aiLoading}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: aiLoading ? 'rgba(123,147,255,0.2)' : '#7b93ff',
                  color: aiLoading ? '#7b93ff' : '#080b18',
                  opacity: aiLoading ? 0.7 : 1,
                }}>
                {aiLoading ? '...' : 'Generate'}
              </button>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {aiSuggestions.map(s => (
                  <div key={s.platform} className="rounded-lg p-2.5"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono" style={{ color: PLATFORM_CONFIG[s.platform as SocialPlatform].color }}>
                        {PLATFORM_CONFIG[s.platform as SocialPlatform].label} · {s.tone}
                      </span>
                      <button onClick={() => applySuggestion(s.caption)}
                        className="text-[10px] px-2 py-0.5 rounded transition-colors"
                        style={{ background: 'rgba(0,217,255,0.12)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.2)' }}>
                        Use This
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                      {s.caption}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.hashtags.slice(0, 4).map(h => (
                        <span key={h} className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{h}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hashtags */}
        {post?.hashtags && post.hashtags.length > 0 && (
          <div>
            <div className="section-label mb-2">Hashtags</div>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map(h => (
                <span key={h} className="text-[11px] font-mono px-2 py-0.5 rounded"
                  style={{ background: 'rgba(123,147,255,0.10)', color: '#7b93ff', border: '1px solid rgba(123,147,255,0.2)' }}>
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <div>
          <div className="section-label mb-2">Category</div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CATEGORIES.map(cat => {
              const cfg = CATEGORY_CONFIG[cat];
              const active = (post?.category ?? category) === cat;
              return (
                <button key={cat}
                  onClick={() => !isExisting && setCategory(cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: active ? cfg.color + '18' : 'var(--bg-elevated)',
                    color: active ? cfg.color : 'var(--text-muted)',
                    border: `1px solid ${active ? cfg.color + '35' : 'var(--border-subtle)'}`,
                    cursor: isExisting ? 'default' : 'pointer',
                  }}>
                  <span style={{ fontSize: 10 }}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scheduled time */}
        <div>
          <div className="section-label mb-2">Scheduled For</div>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <Clock size={13} style={{ color: 'var(--text-muted)' }} />
            <span className="data-value text-sm" style={{ color: 'var(--text-primary)' }}>
              {schedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {' · '}
              {schedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {post?.aiOptimalTime && (
              <span className="ml-auto text-[10px] font-mono flex items-center gap-1" style={{ color: '#10d98a' }}>
                <Sparkles size={9} />
                AI optimal
              </span>
            )}
          </div>
        </div>

        {/* Performance (published posts) */}
        {post?.status === 'published' && post.reach && (
          <div>
            <div className="section-label mb-2">Performance</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Reach',       value: (post.reach / 1000).toFixed(1) + 'K' },
                { label: 'Impressions', value: ((post.impressions || 0) / 1000).toFixed(1) + 'K' },
                { label: 'Engagement',  value: post.engagementRate?.toFixed(1) + '%' },
                { label: 'Likes',       value: post.likes?.toLocaleString() || '—' },
                { label: 'Comments',    value: post.comments?.toLocaleString() || '—' },
                { label: 'Shares',      value: post.shares?.toLocaleString() || '—' },
              ].map(m => (
                <div key={m.label} className="rounded-lg p-2 text-center"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div className="data-value text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.value}</div>
                  <div className="section-label mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
            {post.boostEligible && (
              <div className="mt-2 px-3 py-2 rounded-lg flex items-center justify-between"
                style={{ background: 'rgba(0,217,255,0.05)', border: '1px solid rgba(0,217,255,0.15)' }}>
                <span className="text-xs" style={{ color: '#00d9ff' }}>⚡ High-performer — eligible for paid boost</span>
                <button onClick={() => setBoosted(true)}
                  className="text-[11px] px-2.5 py-1 rounded font-medium transition-colors hover:bg-cyan-400/20"
                  style={{ background: 'rgba(0,217,255,0.15)', color: '#00d9ff' }}>
                  {boosted ? '✓ Boosted' : 'Boost Post'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Review workflow */}
        {post?.status === 'review' && (
          <div className="rounded-xl p-3"
            style={{ background: 'rgba(255,179,71,0.05)', border: '1px solid rgba(255,179,71,0.2)' }}>
            <div className="section-label mb-1.5">Approval Required</div>
            <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              Waiting for approval from{' '}
              <span style={{ color: '#ffb347' }}>{post.approver}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleApproval('published')}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }}>
                ✓ Approve
              </button>
              <button onClick={() => handleApproval('failed')}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: 'rgba(255,68,68,0.10)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }}>
                ✗ Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success feedback */}
      {feedback && (
        <div className="px-4 py-2 text-xs font-medium text-center border-t shrink-0"
          style={{ borderColor: 'var(--border-subtle)', background: 'rgba(16,217,138,0.08)', color: '#10d98a' }}>
          ✓ {feedback}
        </div>
      )}

      {/* Footer actions — Draft (tertiary) / Schedule (secondary) / Publish (primary) */}
      {!isExisting && (
        <div className="flex items-center gap-2 p-4 border-t shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Draft — tertiary */}
          <button onClick={() => createPost('draft')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:bg-white/[0.05]"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            <Save size={12} />
            Draft
          </button>

          {/* Schedule — secondary */}
          <button onClick={() => createPost('scheduled')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all hover:bg-cyan-400/[0.12]"
            style={{ background: 'rgba(0,217,255,0.08)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.22)' }}>
            <Clock size={13} />
            Schedule
          </button>

          {/* Publish — primary */}
          <button onClick={() => createPost('published')}
            className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: '#00d9ff', color: '#080b18' }}>
            <Send size={13} />
            Publish Now
          </button>
        </div>
      )}
    </div>
  );
}
