'use client';

import { useState } from 'react';
import { Clock, BarChart2, GripVertical, Check, X } from 'lucide-react';
import { PLATFORM_CONFIG, CATEGORY_CONFIG } from '@/lib/socialData';
import type { SocialPost, PostStatus, SocialPlatform } from '@/lib/socialData';
import { usePersistentState } from '@/lib/usePersistentState';

interface Props {
  posts: SocialPost[];
  onSelectPost: (post: SocialPost) => void;
  filterPlatform: SocialPlatform | 'all';
}

const STATUS_STYLE: Record<PostStatus, { color: string; bg: string; label: string }> = {
  published: { color: '#10d98a', bg: 'rgba(16,217,138,0.10)',  label: 'Published' },
  scheduled: { color: 'var(--cyan)', bg: 'rgba(0,217,255,0.10)',   label: 'Scheduled' },
  draft:     { color: '#7b93ff', bg: 'rgba(123,147,255,0.10)', label: 'Draft'     },
  failed:    { color: '#ff4444', bg: 'rgba(255,68,68,0.10)',   label: 'Failed'    },
  review:    { color: '#ffb347', bg: 'rgba(255,179,71,0.10)',  label: 'In Review' },
};

const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / 1000 / 60;
  if (diff > 0 && diff < 60) return `in ${Math.round(diff)}m`;
  if (diff > 0 && diff < 1440) return `in ${Math.round(diff / 60)}h`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_TABS: { key: PostStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'review',    label: 'Review'    },
  { key: 'draft',     label: 'Draft'     },
  { key: 'published', label: 'Published' },
];

export default function ContentQueue({ posts, onSelectPost, filterPlatform }: Props) {
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [, setAllPosts] = usePersistentState<SocialPost[]>('social.posts', []);
  const [order, setOrder] = usePersistentState<string[]>('social.queueOrder', []);
  const [dragId, setDragId] = useState<string | null>(null);

  const setStatus = (id: string, status: PostStatus) => {
    setAllPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const orderIdx = (id: string) => {
    const i = order.indexOf(id);
    return i === -1 ? Infinity : i;
  };
  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const ids = visiblePosts.map(p => p.id);
    const base = order.length ? order.filter(id => ids.includes(id)) : ids;
    const merged = [...base, ...ids.filter(id => !base.includes(id))];
    const from = merged.indexOf(fromId), to = merged.indexOf(toId);
    if (from === -1 || to === -1) return;
    merged.splice(to, 0, merged.splice(from, 1)[0]);
    setOrder(merged);
  };

  const visiblePosts = posts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (filterPlatform !== 'all' && !p.platforms.includes(filterPlatform)) return false;
    return true;
  }).sort((a, b) => {
    const oa = orderIdx(a.id), ob = orderIdx(b.id);
    if (oa !== ob) return oa - ob;
    return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
  });

  return (
    <div className="glass-card flex flex-col" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="section-label">Content Queue</div>

        {/* Status tabs */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
          {STATUS_TABS.map(tab => {
            const count = tab.key === 'all'
              ? posts.length
              : posts.filter(p => p.status === tab.key).length;
            const isActive = statusFilter === tab.key;
            const tabColor = tab.key !== 'all' ? STATUS_STYLE[tab.key as PostStatus]?.color : undefined;

            return (
              <button key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[16px] transition-all"
                style={{
                  background: isActive ? 'var(--bg-overlay)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border-dim)' : '1px solid transparent',
                }}>
                {tab.label}
                {count > 0 && (
                  <span
                    className="min-w-[16px] h-4 rounded-full flex items-center justify-center font-mono text-[16px] px-1"
                    style={{
                      background: tabColor ? tabColor + '22' : 'var(--bg-overlay)',
                      color: tabColor ?? 'var(--text-muted)',
                    }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts list */}
      <div className="flex-1 overflow-y-auto">
        {visiblePosts.map(post => {
          const ss = STATUS_STYLE[post.status];
          const catCfg = CATEGORY_CONFIG[post.category];
          const authorInitials = post.author.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

          return (
            <div key={post.id}
              draggable
              onDragStart={() => setDragId(post.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (dragId) reorder(dragId, post.id); setDragId(null); }}
              onDragEnd={() => setDragId(null)}
              className="border-b group hover:bg-white/[0.02] transition-colors cursor-pointer relative"
              style={{ borderColor: 'var(--border-subtle)', borderLeft: `3px solid ${ss.color}`, opacity: dragId === post.id ? 0.5 : 1 }}
              onClick={() => onSelectPost(post)}>

              <div className="flex items-start gap-3 px-4 py-3">
                {/* Drag handle */}
                <div className="mt-1 shrink-0 cursor-grab opacity-30 group-hover:opacity-70 transition-opacity"
                  onClick={e => e.stopPropagation()} style={{ color: 'var(--text-muted)' }}>
                  <GripVertical size={13} />
                </div>
                {/* Author avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[16px] font-bold shrink-0 mt-0.5"
                  style={{ background: ss.color + '20', color: ss.color, border: `1px solid ${ss.color}30` }}>
                  {authorInitials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {/* Platforms */}
                    <div className="flex gap-1">
                      {post.platforms.map(p => (
                        <span key={p}
                          className="text-[16px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: PLATFORM_CONFIG[p].color + '18', color: PLATFORM_CONFIG[p].color }}>
                          {PLATFORM_CONFIG[p].label.charAt(0)}
                        </span>
                      ))}
                    </div>

                    {/* Category */}
                    <span className="text-[16px] font-mono" style={{ color: catCfg.color }}>
                      {catCfg.icon} {catCfg.label}
                    </span>

                    {/* Status pill */}
                    <span
                      className="ml-auto text-[16px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.color}30` }}>
                      {ss.label}
                    </span>
                  </div>

                  {/* Caption — 2-line clamp */}
                  <p className="text-base line-clamp-2 mb-2"
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: 16 }}>
                    {post.caption.replace(/\[DRAFT\]\s*/, '')}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Schedule time */}
                    <div className="flex items-center gap-1 font-mono text-[16px]" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={9} />
                      {formatDate(post.scheduledFor)}
                    </div>

                    {/* Published engagement metrics */}
                    {post.status === 'published' && post.reach && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="flex items-center gap-0.5 text-[16px] font-mono px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.2)' }}>
                          <BarChart2 size={8} />
                          {fmt(post.reach)}
                        </span>
                        <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {post.engagementRate?.toFixed(1)}% eng.
                        </span>
                      </div>
                    )}

                    {/* Boost badge */}
                    {post.boostEligible && (
                      <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(0,217,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.15)' }}>
                        ⚡ Boost
                      </span>
                    )}

                    {/* Inline approve / reject for posts in review */}
                    {post.status === 'review' && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button onClick={e => { e.stopPropagation(); setStatus(post.id, 'scheduled'); }}
                          className="flex items-center gap-1 text-[16px] px-2 py-0.5 rounded font-medium"
                          style={{ background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }}>
                          <Check size={10} />Approve
                        </button>
                        <button onClick={e => { e.stopPropagation(); setStatus(post.id, 'draft'); }}
                          className="flex items-center gap-1 text-[16px] px-2 py-0.5 rounded font-medium"
                          style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }}>
                          <X size={10} />Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {visiblePosts.length === 0 && (
          <div className="flex items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
            <span className="text-base">No posts match this filter</span>
          </div>
        )}
      </div>
    </div>
  );
}
