'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import PlatformStatsBar from '@/components/social/PlatformStatsBar';
import SocialCalendar from '@/components/social/SocialCalendar';
import PostComposer from '@/components/social/PostComposer';
import ContentQueue from '@/components/social/ContentQueue';
import SocialInbox from '@/components/social/SocialInbox';
import SocialListening from '@/components/social/SocialListening';
import { PLATFORM_CONFIG, INBOX_MESSAGES, SOCIAL_POSTS } from '@/lib/socialData';
import type { SocialPost, SocialPlatform } from '@/lib/socialData';
import {
  Plus, Calendar, List, Inbox, Search, Grid3X3, RefreshCw, ChevronUp, ChevronDown,
  CheckSquare, Bot, Trash2, MessageCircle, Hash, ArrowRight, Edit3, Upload,
  CheckCircle2, XCircle, Clock, Eye, AlertCircle, Wand2, Youtube, Rocket, TrendingUp,
} from 'lucide-react';

type Tab = 'calendar' | 'queue' | 'inbox' | 'listening' | 'grid' | 'approvals' | 'dmauto' | 'aitools';

const TABS: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
  { key: 'calendar',  label: 'Calendar',     icon: Calendar },
  { key: 'queue',     label: 'Queue',        icon: List },
  { key: 'approvals', label: 'Approvals',    icon: CheckSquare },
  { key: 'inbox',     label: 'Inbox',        icon: Inbox, badge: INBOX_MESSAGES.filter(m => !m.replied && m.requiresAttention).length },
  { key: 'listening', label: 'Listening',    icon: Search },
  { key: 'dmauto',    label: 'DM Automation', icon: Bot },
  { key: 'aitools',   label: 'AI Tools',      icon: Wand2 },
  { key: 'grid',      label: 'Grid Preview', icon: Grid3X3 },
];

const ALL_PLATFORMS: SocialPlatform[] = ['facebook','instagram','youtube','x-twitter','linkedin','tiktok'];

// ─── Grid Preview stores ───────────────────────────────────────────────────────

const GRID_STORES = [
  { id: 'donut-equipment',  username: 'donut_equipment' },
  { id: 'donut-supplies',   username: 'donut_supplies' },
  { id: 'bakery-wholesalers', username: 'bakery_wholesalers' },
];

// ─── Status dot config ─────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  published: '#10d98a',
  scheduled:  '#00d9ff',
  review:     '#ffb347',
  draft:      '#555e7a',
  failed:     '#ff4444',
};

// ─── Gradient shade per post index (instagram palette) ────────────────────────

function cellGradient(idx: number): string {
  const stops: [string, string][] = [
    ['#833ab4', '#fd1d1d'],
    ['#fd1d1d', '#fcb045'],
    ['#fcb045', '#833ab4'],
    ['#c13584', '#e1306c'],
    ['#405de6', '#833ab4'],
    ['#e1306c', '#fd1d1d'],
    ['#833ab4', '#405de6'],
    ['#fcb045', '#e1306c'],
    ['#fd1d1d', '#833ab4'],
    ['#405de6', '#fcb045'],
    ['#833ab4', '#c13584'],
    ['#fd1d1d', '#405de6'],
  ];
  const [a, b] = stops[idx % stops.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

// ─── Instagram Grid Preview ────────────────────────────────────────────────────

function InstagramGridPreview({ onEditPost, onNewPost }: { onEditPost: (post: SocialPost) => void; onNewPost: () => void }) {
  const [gridStoreIdx, setGridStoreIdx] = useState(0);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [cellOrder, setCellOrder] = useState<number[]>(() =>
    Array.from({ length: 12 }, (_, i) => i)
  );

  const currentStore = GRID_STORES[gridStoreIdx];

  // Filter instagram posts and sort
  const instagramPosts: SocialPost[] = SOCIAL_POSTS
    .filter(p => p.platforms.includes('instagram'))
    .sort((a, b) => {
      if (showUpcoming) {
        return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
      }
      return new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime();
    });

  // Fill grid to 12 cells
  const GRID_SIZE = 12;
  const filledCells = Array.from({ length: GRID_SIZE }, (_, i) => {
    const postIdx = cellOrder[i];
    return postIdx < instagramPosts.length ? instagramPosts[postIdx] : null;
  });

  const selectedPost = selectedIdx !== null ? filledCells[selectedIdx] : null;

  const moveCell = (dir: 'up' | 'down') => {
    if (selectedIdx === null) return;
    const newOrder = [...cellOrder];
    const target = dir === 'up' ? selectedIdx - 1 : selectedIdx + 1;
    if (target < 0 || target >= GRID_SIZE) return;
    [newOrder[selectedIdx], newOrder[target]] = [newOrder[target], newOrder[selectedIdx]];
    setCellOrder(newOrder);
    setSelectedIdx(target);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex gap-5 h-full min-h-0 overflow-hidden">
      {/* Left: controls + phone */}
      <div className="flex flex-col gap-4 min-w-0" style={{ flex: '0 0 auto' }}>

        {/* Controls row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Store selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            {GRID_STORES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setGridStoreIdx(i)}
                className="px-2.5 py-1 rounded-md text-[11px] transition-all"
                style={{
                  background: gridStoreIdx === i ? 'var(--bg-elevated)' : 'transparent',
                  color: gridStoreIdx === i ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: gridStoreIdx === i ? '1px solid var(--border-dim)' : '1px solid transparent',
                  fontWeight: gridStoreIdx === i ? 500 : 400,
                }}>
                @{s.username}
              </button>
            ))}
          </div>

          {/* Current / Upcoming toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            {(['Current Feed', 'Upcoming Feed'] as const).map((label, i) => {
              const active = showUpcoming === (i === 1);
              return (
                <button
                  key={label}
                  onClick={() => setShowUpcoming(i === 1)}
                  className="px-2.5 py-1 rounded-md text-[11px] transition-all"
                  style={{
                    background: active ? 'var(--bg-elevated)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: active ? '1px solid var(--border-dim)' : '1px solid transparent',
                    fontWeight: active ? 500 : 400,
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => { setSelectedIdx(null); setCellOrder(Array.from({ length: GRID_SIZE }, (_, i) => i)); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            <RefreshCw size={11} />
            Refresh Preview
          </button>
        </div>

        {/* Phone mockup */}
        <div
          style={{
            width: 375,
            height: 667,
            background: 'var(--bg-elevated)',
            border: '2px solid var(--border-dim)',
            borderRadius: 48,
            padding: 12,
            boxShadow: '0 0 0 1px rgba(0,217,255,0.08), 0 24px 64px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}>

          {/* Inner phone screen */}
          <div style={{
            flex: 1,
            background: '#0a0e1a',
            borderRadius: 36,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Status bar */}
            <div style={{ height: 24, background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>9:41</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>●●● WiFi 🔋</span>
            </div>

            {/* Instagram header */}
            <div style={{ padding: '8px 14px 12px', borderBottom: '1px solid #1e2538', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Username row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: 'system-ui' }}>
                  {currentStore.username}
                </span>
                <div style={{ display: 'flex', gap: 10, color: 'var(--text-muted)', fontSize: 18 }}>
                  <span>+</span>
                  <span>☰</span>
                </div>
              </div>

              {/* Avatar + stats row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Avatar */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {currentStore.username.charAt(0).toUpperCase()}
                </div>
                {/* Stats */}
                <div style={{ display: 'flex', gap: 20, flex: 1, justifyContent: 'center' }}>
                  {[
                    { label: 'Posts', value: instagramPosts.length.toString() },
                    { label: 'Followers', value: '14.8K' },
                    { label: 'Following', value: '284' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Profile button */}
              <button style={{
                width: '100%', padding: '5px 0', borderRadius: 6,
                background: 'transparent', border: '1px solid #3a4460',
                color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                Edit Profile
              </button>
            </div>

            {/* Grid area */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              {/* Grid tab indicator */}
              <div style={{ display: 'flex', borderBottom: '1px solid #1e2538' }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '8px 0', borderBottom: '1px solid white' }}>
                  <Grid3X3 size={14} color='white' />
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>☰</span>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>♡</span>
                </div>
              </div>

              {/* 3-column grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
                {filledCells.map((post, i) => {
                  const isSelected = selectedIdx === i;
                  const cellSize = Math.floor((375 - 24 - 4) / 3); // ~117px
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedIdx(isSelected ? null : i)}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        position: 'relative',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        background: post ? cellGradient(i) : '#1e2538',
                        outline: isSelected ? '2px solid #00d9ff' : 'none',
                        outlineOffset: '-2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                      {post ? (
                        <>
                          {/* Caption initial */}
                          <span style={{ fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.6)', userSelect: 'none', textTransform: 'uppercase' }}>
                            {post.caption.replace(/[^a-zA-Z]/g, '').charAt(0) || '?'}
                          </span>
                          {/* Status dot */}
                          <div style={{
                            position: 'absolute', bottom: 5, left: 5,
                            width: 7, height: 7, borderRadius: '50%',
                            background: STATUS_DOT[post.status] ?? '#888',
                            border: '1px solid rgba(0,0,0,0.4)',
                          }} />
                          {/* Media type badge */}
                          {(post.mediaType === 'carousel' || post.mediaType === 'video' || post.mediaType === 'reel') && (
                            <div style={{
                              position: 'absolute', top: 5, right: 5,
                              fontSize: 9, color: 'white',
                              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                            }}>
                              {post.mediaType === 'carousel' ? '⧉' : post.mediaType === 'reel' ? '▶' : '🎬'}
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: 22, color: '#3a4460', userSelect: 'none' }}>+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: post detail panel */}
      {selectedIdx !== null && (
        <div
          className="glass-card flex flex-col gap-4 animate-slide-in"
          style={{ width: 280, flexShrink: 0, padding: '20px', alignSelf: 'flex-start', marginTop: 52 }}>

          {selectedPost ? (
            <>
              {/* Platform badge */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: 'rgba(225,48,108,0.15)', color: '#E1306C', border: '1px solid rgba(225,48,108,0.3)' }}>
                  Instagram
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                  style={{
                    background: `${STATUS_DOT[selectedPost.status]}20`,
                    color: STATUS_DOT[selectedPost.status],
                    border: `1px solid ${STATUS_DOT[selectedPost.status]}40`,
                  }}>
                  {selectedPost.status}
                </span>
              </div>

              {/* Gradient thumbnail */}
              <div style={{
                height: 80, borderRadius: 10, background: cellGradient(selectedIdx),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: 'rgba(255,255,255,0.5)' }}>
                  {selectedPost.caption.replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Caption */}
              <div>
                <div className="section-label mb-1">Caption</div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {selectedPost.caption}
                </p>
              </div>

              {/* Scheduled date */}
              <div>
                <div className="section-label mb-1">Scheduled</div>
                <p style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
                  {new Date(selectedPost.scheduledFor).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>

              {/* Author */}
              <div>
                <div className="section-label mb-1">Author</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedPost.author}</p>
              </div>

              {/* Hashtags */}
              {selectedPost.hashtags.length > 0 && (
                <div>
                  <div className="section-label mb-1.5">Hashtags</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedPost.hashtags.slice(0, 5).map(tag => (
                      <span key={tag} style={{ fontSize: 10, color: '#E1306C', background: 'rgba(225,48,108,0.1)', padding: '2px 6px', borderRadius: 10 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => onEditPost(selectedPost)}
                  className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: '#00d9ff', color: '#0a0e1a' }}>
                  Edit Post
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveCell('up')}
                    disabled={selectedIdx === 0}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-all"
                    style={{
                      background: 'var(--bg-surface)',
                      color: selectedIdx === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      opacity: selectedIdx === 0 ? 0.4 : 1,
                    }}>
                    <ChevronUp size={11} /> Move Up
                  </button>
                  <button
                    onClick={() => moveCell('down')}
                    disabled={selectedIdx === GRID_SIZE - 1}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-all"
                    style={{
                      background: 'var(--bg-surface)',
                      color: selectedIdx === GRID_SIZE - 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      opacity: selectedIdx === GRID_SIZE - 1 ? 0.4 : 1,
                    }}>
                    <ChevronDown size={11} /> Move Down
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty cell selected */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 8, color: 'var(--text-muted)' }}>+</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Empty slot</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Schedule a post to fill this position</p>
              <button
                onClick={onNewPost}
                className="mt-4 flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: '#00d9ff', color: '#0a0e1a' }}>
                <Plus size={11} /> New Post
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const GRID_SIZE = 12;

// ─── Post Approval Workflow ────────────────────────────────────────────────────

type ApprovalStatus = 'draft' | 'review' | 'approved' | 'published' | 'rejected';
interface ApprovalPost {
  id: string;
  title: string;
  platforms: string[];
  status: ApprovalStatus;
  author: string;
  scheduledFor: string;
  content: string;
  rejectionNote?: string;
}

const APPROVAL_POSTS: ApprovalPost[] = [
  { id: 'ap-1', title: 'Summer Fryer Promo — Instagram',   platforms: ['instagram', 'facebook'], status: 'review',   author: 'Sarah K.',   scheduledFor: '2026-05-15 10:00', content: '🍩 Summer savings are here! Get 20% off our pro donut fryers...' },
  { id: 'ap-2', title: 'Bakery Tips Video — YouTube',       platforms: ['youtube'],               status: 'review',   author: 'Mike R.',    scheduledFor: '2026-05-16 14:00', content: 'New tutorial: 5 tips for perfect donuts every time...' },
  { id: 'ap-3', title: 'Wholesale Catalog — LinkedIn',      platforms: ['linkedin'],              status: 'approved', author: 'Sarah K.',   scheduledFor: '2026-05-14 09:00', content: 'Bakery Wholesalers Spring Catalog 2026 is live...' },
  { id: 'ap-4', title: 'TikTok — Glaze Recipe Demo',        platforms: ['tiktok', 'instagram'],   status: 'draft',    author: 'Jenny L.',   scheduledFor: '2026-05-17 18:00', content: 'Watch us make 3 glaze flavors in under 60 seconds...' },
  { id: 'ap-5', title: 'X/Twitter — Flash Sale Alert',      platforms: ['x-twitter'],             status: 'rejected', author: 'Mike R.',    scheduledFor: '2026-05-13 12:00', content: '⚡ 4-HOUR FLASH SALE — 30% off all supplies...', rejectionNote: 'Discount too aggressive — max 20%. Resubmit.' },
  { id: 'ap-6', title: 'FB — Customer Spotlight',           platforms: ['facebook'],              status: 'published', author: 'Jenny L.',  scheduledFor: '2026-05-12 11:00', content: 'Meet Oak Street Bakery — they\'ve been using our fryers for 5 years...' },
  { id: 'ap-7', title: 'Instagram Reel — Behind the Scenes', platforms: ['instagram'],            status: 'draft',    author: 'Sarah K.',   scheduledFor: '2026-05-18 15:00', content: 'Go behind the scenes at our warehouse — see how your order ships...' },
];

const APPROVAL_CONFIG: Record<ApprovalStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft:     { label: 'Draft',     color: '#555e7a', bg: 'rgba(85,94,122,.15)',  icon: Edit3       },
  review:    { label: 'In Review', color: '#ffb347', bg: 'rgba(255,179,71,.12)', icon: Eye         },
  approved:  { label: 'Approved',  color: '#10d98a', bg: 'rgba(16,217,138,.12)', icon: CheckCircle2 },
  published: { label: 'Published', color: '#7b93ff', bg: 'rgba(123,147,255,.12)', icon: CheckSquare },
  rejected:  { label: 'Rejected',  color: '#ff4444', bg: 'rgba(255,68,68,.12)',  icon: XCircle     },
};

const PLT_COLOR: Record<string, string> = {
  instagram: '#e1306c', facebook: '#1877f2', youtube: '#ff0000',
  'x-twitter': '#1da1f2', linkedin: '#0a66c2', tiktok: '#010101',
};

function PostApprovalsPanel() {
  const [posts, setPosts] = useState<ApprovalPost[]>(APPROVAL_POSTS);
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('all');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [csvText, setCsvText] = useState('');
  const [showCsv, setShowCsv] = useState(false);

  const pending = posts.filter(p => p.status === 'review').length;

  const updateStatus = (id: string, status: ApprovalStatus, note?: string) => {
    setPosts(prev => prev.map(p => p.id !== id ? p : { ...p, status, rejectionNote: note }));
    setRejectingId(null);
    setRejectNote('');
  };

  const importCsv = () => {
    const lines = csvText.trim().split('\n').filter(Boolean);
    const newPosts: ApprovalPost[] = lines.slice(1).map((line, i) => {
      const parts = line.split(',');
      return {
        id: `csv-${Date.now()}-${i}`,
        title: parts[0]?.trim() || `Imported Post ${i + 1}`,
        platforms: (parts[1]?.trim() || 'instagram').split(';'),
        scheduledFor: parts[2]?.trim() || '2026-05-20 10:00',
        content: parts[3]?.trim() || '',
        status: 'draft' as ApprovalStatus,
        author: 'CSV Import',
      };
    });
    setPosts(prev => [...newPosts, ...prev]);
    setCsvText('');
    setShowCsv(false);
  };

  const visible = filterStatus === 'all' ? posts : posts.filter(p => p.status === filterStatus);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-5 gap-3">
        {([['draft', posts], ['review', posts], ['approved', posts], ['published', posts], ['rejected', posts]] as const).map(([s, arr]) => {
          const cfg = APPROVAL_CONFIG[s];
          const count = (arr as ApprovalPost[]).filter(p => p.status === s).length;
          const Icon = cfg.icon;
          return (
            <div key={s} className="glass-card px-3 py-3 flex items-center gap-2 cursor-pointer" onClick={() => setFilterStatus(s === filterStatus ? 'all' : s)}
              style={{ border: filterStatus === s ? `1px solid ${cfg.color}44` : '1px solid var(--border-subtle)' }}>
              <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
              <div>
                <div className="data-value text-lg font-bold" style={{ color: cfg.color }}>{count}</div>
                <div className="section-label text-[10px]">{cfg.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {pending > 0 && (
        <div className="rounded-xl px-3 py-2 flex items-center gap-2 text-xs" style={{ background: 'rgba(255,179,71,.08)', border: '1px solid rgba(255,179,71,.25)' }}>
          <AlertCircle size={13} style={{ color: '#ffb347' }} />
          <span style={{ color: '#ffb347' }}>{pending} post{pending > 1 ? 's' : ''} awaiting your review</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {(['all', 'draft', 'review', 'approved', 'published', 'rejected'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-2.5 py-1 rounded-md text-[11px] capitalize transition-all"
              style={{ background: filterStatus === s ? 'var(--bg-elevated)' : 'transparent', color: filterStatus === s ? 'var(--text-primary)' : 'var(--text-muted)', border: filterStatus === s ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCsv(!showCsv)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(0,217,255,.1)', color: '#00d9ff', border: '1px solid rgba(0,217,255,.2)' }}>
          <Upload size={12} /> Bulk CSV Import
        </button>
      </div>

      {showCsv && (
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>CSV Bulk Import</div>
          <div className="section-label text-[10px]">Format: Title, Platforms (semicolon-separated), Scheduled Date (YYYY-MM-DD HH:MM), Content</div>
          <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
            placeholder={'title,platforms,scheduledFor,content\n"Summer Post","instagram;facebook","2026-05-20 10:00","Summer sale content..."'}
            rows={5} className="w-full px-3 py-2 rounded-lg text-xs font-mono" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', resize: 'none' }} />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCsv(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)' }}>Cancel</button>
            <button onClick={importCsv} disabled={!csvText.trim()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--accent-blue)', color: '#fff', opacity: csvText.trim() ? 1 : 0.5 }}>
              <Upload size={11} /> Import Posts
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {visible.map(post => {
          const cfg = APPROVAL_CONFIG[post.status];
          const Icon = cfg.icon;
          return (
            <div key={post.id} className="glass-card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{post.title}</span>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
                      <Icon size={10} /> {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="section-label">by {post.author}</span>
                    <span className="flex items-center gap-1 section-label"><Clock size={10} /> {post.scheduledFor}</span>
                    <div className="flex gap-1">
                      {post.platforms.map(p => (
                        <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize" style={{ color: PLT_COLOR[p] || '#888', background: `${PLT_COLOR[p] || '#888'}18` }}>{p.replace('x-twitter', 'X')}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>
                  {post.rejectionNote && (
                    <div className="mt-2 px-2 py-1.5 rounded-lg text-xs flex gap-1.5" style={{ background: 'rgba(255,68,68,.08)', color: '#ff4444' }}>
                      <XCircle size={11} className="mt-0.5 shrink-0" />
                      {post.rejectionNote}
                    </div>
                  )}
                </div>
                {post.status === 'review' && (
                  <div className="flex gap-2 shrink-0">
                    {rejectingId === post.id ? (
                      <div className="flex flex-col gap-2 w-56">
                        <input value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Rejection reason..."
                          className="px-2 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
                        <div className="flex gap-1.5">
                          <button onClick={() => updateStatus(post.id, 'rejected', rejectNote)} className="flex-1 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(255,68,68,.15)', color: '#ff4444' }}>Reject</button>
                          <button onClick={() => setRejectingId(null)} className="flex-1 py-1 rounded-lg text-xs" style={{ color: 'var(--text-muted)' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => updateStatus(post.id, 'approved')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(16,217,138,.12)', color: '#10d98a' }}>
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button onClick={() => setRejectingId(post.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(255,68,68,.1)', color: '#ff4444' }}>
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
                {post.status === 'approved' && (
                  <button onClick={() => updateStatus(post.id, 'published')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0" style={{ background: 'rgba(123,147,255,.12)', color: '#7b93ff' }}>
                    <CheckSquare size={12} /> Mark Published
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="glass-card p-8 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: '#10d98a' }} />
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No posts in this state</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Tools (YouTube Description + Auto-Boost) ─────────────────────────────

const HIGH_ENGAGEMENT_POSTS = SOCIAL_POSTS
  .filter(p => p.status === 'published' && (p.engagementRate ?? 0) > 5)
  .sort((a, b) => (b.engagementRate ?? 0) - (a.engagementRate ?? 0))
  .slice(0, 5);

function AIToolsPanel() {
  // YouTube AI Description Generator
  const [yt_topic,   setYtTopic]   = useState('');
  const [yt_kws,     setYtKws]     = useState('');
  const [yt_tone,    setYtTone]    = useState<'professional' | 'conversational' | 'educational'>('professional');
  const [yt_output,  setYtOutput]  = useState('');
  const [yt_loading, setYtLoading] = useState(false);

  const generateDescription = () => {
    if (!yt_topic.trim()) return;
    setYtLoading(true);
    setTimeout(() => {
      const kws = yt_kws.split(',').map(k => k.trim()).filter(Boolean);
      setYtOutput(
        `🎬 ${yt_topic}\n\n` +
        `In this video, we dive deep into everything you need to know about ${yt_topic.toLowerCase()}. Whether you're a seasoned professional or just getting started, this guide covers the key steps to help your bakery business thrive.\n\n` +
        `📌 WHAT YOU'LL LEARN:\n` +
        `• Step-by-step breakdown of ${yt_topic.toLowerCase()}\n` +
        `• Pro tips from our commercial kitchen team\n` +
        `• Common mistakes to avoid\n` +
        `• How to scale your results\n\n` +
        `🔗 LINKS & RESOURCES:\n` +
        `• Our full product catalog: donut-equipment.com/catalog\n` +
        `• Free buyer's guide: donut-equipment.com/guide\n` +
        `• Contact our team: donut-equipment.com/contact\n\n` +
        `⏱️ TIMESTAMPS:\n` +
        `00:00 — Introduction\n` +
        `01:20 — ${yt_topic} overview\n` +
        `04:45 — Key considerations\n` +
        `08:30 — Pro tips\n` +
        `12:00 — Summary & next steps\n\n` +
        `🔔 Subscribe for weekly bakery business tips!\n\n` +
        `#️⃣ TAGS:\n` +
        `${kws.length > 0 ? kws.map(k => '#' + k.replace(/\s+/g, '')).join(' ') + ' ' : ''}` +
        `#donutequipment #commercialbaking #bakeryequipment #foodservice #donutshop #bakerybusiness`
      );
      setYtLoading(false);
    }, 1200);
  };

  // Auto-boost
  const [boostThreshold, setBoostThreshold] = useState(5);
  const [boostedIds, setBoostedIds] = useState<Set<string>>(new Set());
  const eligible = HIGH_ENGAGEMENT_POSTS.filter(p => (p.engagementRate ?? 0) >= boostThreshold);

  const boost = (id: string) => setBoostedIds(prev => new Set(Array.from(prev).concat(id)));

  return (
    <div className="flex flex-col gap-5">

      {/* YouTube AI Description Generator */}
      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,0,0,.1)' }}>
            <Youtube size={14} style={{ color: '#ff0000' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>YouTube Description Generator</span>
          <span className="section-label">— SEO-optimized (D-17)</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input value={yt_topic} onChange={e => setYtTopic(e.target.value)} placeholder="Video topic or title..."
            className="col-span-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
          <select value={yt_tone} onChange={e => setYtTone(e.target.value as typeof yt_tone)}
            className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="educational">Educational</option>
          </select>
          <input value={yt_kws} onChange={e => setYtKws(e.target.value)} placeholder="SEO keywords (comma-separated)..."
            className="col-span-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
          <button onClick={generateDescription} disabled={!yt_topic.trim() || yt_loading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50"
            style={{ background: 'rgba(255,0,0,.12)', color: '#ff4d4d', border: '1px solid rgba(255,0,0,.2)' }}>
            <Wand2 size={12} />{yt_loading ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {yt_output && (
          <div className="relative">
            <textarea readOnly value={yt_output} rows={12}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)', resize: 'none' }} />
            <button onClick={() => { navigator.clipboard?.writeText(yt_output); }}
              className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)', color: '#00d9ff' }}>
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Auto-Boost */}
      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(123,147,255,.1)' }}>
            <Rocket size={14} style={{ color: '#7b93ff' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Auto-Boost Top Organic Posts</span>
          <span className="section-label">— D-20</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="section-label">Boost threshold: {boostThreshold}% engagement</span>
            <input type="range" min={2} max={15} value={boostThreshold} onChange={e => setBoostThreshold(Number(e.target.value))}
              className="w-24 accent-violet-400" />
          </div>
        </div>

        {eligible.length === 0 ? (
          <div className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            No posts above {boostThreshold}% engagement threshold. Lower the threshold to see more.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {eligible.map(post => {
              const isBooted = boostedIds.has(post.id);
              const platColor = post.platforms[0] === 'instagram' ? '#e1306c' : post.platforms[0] === 'facebook' ? '#1877f2' : '#7b93ff';
              return (
                <div key={post.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: `1px solid ${isBooted ? '#10d98a44' : 'var(--border-subtle)'}` }}>
                  <TrendingUp size={14} style={{ color: '#10d98a', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{post.caption.slice(0, 60)}…</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-medium" style={{ color: platColor }}>{post.platforms[0]}</span>
                      <span className="section-label">{(post.engagementRate ?? 0).toFixed(1)}% engagement · {(post.reach ?? 0).toLocaleString()} reach · {post.likes} likes</span>
                    </div>
                  </div>
                  {isBooted ? (
                    <span className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: '#10d98a', background: 'rgba(16,217,138,.1)' }}>
                      <CheckCircle2 size={10} /> Boosting
                    </span>
                  ) : (
                    <button onClick={() => boost(post.id)}
                      className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg font-medium"
                      style={{ background: 'rgba(123,147,255,.12)', color: '#7b93ff', border: '1px solid rgba(123,147,255,.25)' }}>
                      <Rocket size={10} /> Boost to Paid
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DM Automation ────────────────────────────────────────────────────────────

type DMPlatform = 'instagram' | 'facebook' | 'tiktok';
type DMTrigger = 'comment_keyword' | 'story_reply' | 'first_dm' | 'post_reaction';
interface DMRule {
  id: string;
  name: string;
  platform: DMPlatform;
  trigger: DMTrigger;
  keyword?: string;
  replyMessage: string;
  dmMessage: string;
  status: 'active' | 'paused';
  triggeredCount: number;
  conversionCount: number;
}

const INITIAL_DM_RULES: DMRule[] = [
  { id: 'dm-1', name: 'Fryer Info Comment Capture',     platform: 'instagram', trigger: 'comment_keyword', keyword: 'price',     replyMessage: 'Check your DMs! 📬',                      dmMessage: 'Hi! You asked about our fryer prices. Here\'s the link to our full catalog: [catalog-link]. Reply with any questions!', status: 'active', triggeredCount: 284, conversionCount: 47 },
  { id: 'dm-2', name: 'Equipment Guide — "info" trigger', platform: 'instagram', trigger: 'comment_keyword', keyword: 'info',      replyMessage: 'Sending you our guide now! 🍩',            dmMessage: 'Hi! Here\'s our free Commercial Donut Equipment Guide: [guide-link]. Let me know if you have questions!',               status: 'active', triggeredCount: 192, conversionCount: 38 },
  { id: 'dm-3', name: 'FB Story Reply Capture',          platform: 'facebook',  trigger: 'story_reply',    keyword: undefined,   replyMessage: '',                                         dmMessage: 'Thanks for the reply! Want to know more about our donut supplies? Click here: [link]',                                  status: 'active', triggeredCount: 64,  conversionCount: 12 },
  { id: 'dm-4', name: 'TikTok Comment — "how much"',     platform: 'tiktok',    trigger: 'comment_keyword', keyword: 'how much',  replyMessage: 'Check DMs for pricing! 💬',               dmMessage: 'Hey! Pricing starts at $299 for our entry-level fryers. Full catalog: [link]',                                         status: 'paused', triggeredCount: 89,  conversionCount: 9  },
  { id: 'dm-5', name: 'New Follower Welcome',             platform: 'instagram', trigger: 'first_dm',       keyword: undefined,   replyMessage: '',                                         dmMessage: 'Welcome to Donut Equipment! 🍩 Here\'s a 10% welcome discount for your first order: WELCOME10. Shop here: [link]',    status: 'active', triggeredCount: 420, conversionCount: 53 },
];

const TRIGGER_LABELS: Record<DMTrigger, string> = {
  comment_keyword: 'Comment Keyword',
  story_reply:     'Story Reply',
  first_dm:        'First DM / New Follower',
  post_reaction:   'Post Reaction',
};

const PLT_DM_COLOR: Record<DMPlatform, string> = { instagram: '#e1306c', facebook: '#1877f2', tiktok: '#010101' };

function DMAutomationPanel() {
  const [rules, setRules] = useState<DMRule[]>(INITIAL_DM_RULES);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]               = useState('');
  const [newPlatform, setNewPlatform]       = useState<DMPlatform>('instagram');
  const [newTrigger, setNewTrigger]         = useState<DMTrigger>('comment_keyword');
  const [newKeyword, setNewKeyword]         = useState('');
  const [newReply, setNewReply]             = useState('');
  const [newDm, setNewDm]                   = useState('');

  const toggleStatus = (id: string) => {
    setRules(prev => prev.map(r => r.id !== id ? r : { ...r, status: r.status === 'active' ? 'paused' : 'active' }));
  };

  const deleteRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id));

  const createRule = () => {
    if (!newName.trim() || !newDm.trim()) return;
    const r: DMRule = {
      id: `dm-${Date.now()}`, name: newName, platform: newPlatform, trigger: newTrigger,
      keyword: newKeyword || undefined, replyMessage: newReply, dmMessage: newDm,
      status: 'active', triggeredCount: 0, conversionCount: 0,
    };
    setRules(prev => [r, ...prev]);
    setNewName(''); setNewKeyword(''); setNewReply(''); setNewDm('');
    setShowCreate(false);
  };

  const totalTriggered   = rules.reduce((s, r) => s + r.triggeredCount,   0);
  const totalConversions = rules.reduce((s, r) => s + r.conversionCount, 0);
  const convRate = totalTriggered > 0 ? ((totalConversions / totalTriggered) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Rules',        value: rules.filter(r => r.status === 'active').length.toString(), color: '#10d98a' },
          { label: 'Total Triggered',     value: totalTriggered.toLocaleString(),                            color: '#00d9ff' },
          { label: 'Conversions',         value: totalConversions.toLocaleString(),                          color: '#7b93ff' },
          { label: 'Conversion Rate',     value: convRate + '%',                                             color: '#ffb347' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>DM Automation Rules</span>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--accent-blue)', color: '#fff' }}>
          <Plus size={13} /> New Rule
        </button>
      </div>

      {showCreate && (
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Create DM Rule</div>
          <div className="grid grid-cols-3 gap-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Rule name"
              className="col-span-3 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
            <select value={newPlatform} onChange={e => setNewPlatform(e.target.value as DMPlatform)}
              className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
            </select>
            <select value={newTrigger} onChange={e => setNewTrigger(e.target.value as DMTrigger)}
              className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {(Object.entries(TRIGGER_LABELS) as [DMTrigger, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Trigger keyword (optional)"
              className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
          </div>
          <input value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Public comment reply (e.g., 'Check your DMs!')"
            className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
          <textarea value={newDm} onChange={e => setNewDm(e.target.value)} placeholder="DM message to send..."
            rows={3} className="px-3 py-2 rounded-lg text-xs w-full" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)', resize: 'none' }} />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)' }}>Cancel</button>
            <button onClick={createRule} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--accent-blue)', color: '#fff' }}>Create Rule</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {rules.map(rule => {
          const isOpen = expanded === rule.id;
          const pColor = PLT_DM_COLOR[rule.platform];
          const rate = rule.triggeredCount > 0 ? ((rule.conversionCount / rule.triggeredCount) * 100).toFixed(1) : '0.0';
          return (
            <div key={rule.id} className="glass-card overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3">
                <button className="flex-1 min-w-0 flex items-center gap-3 text-left" onClick={() => setExpanded(isOpen ? null : rule.id)}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: rule.status === 'active' ? '#10d98a' : '#555e7a' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{rule.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize" style={{ color: pColor, background: `${pColor}18` }}>{rule.platform}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="section-label">{TRIGGER_LABELS[rule.trigger]}{rule.keyword ? ` → "${rule.keyword}"` : ''}</span>
                      <span className="section-label flex items-center gap-1"><MessageCircle size={10} /> {rule.triggeredCount.toLocaleString()} triggered</span>
                      <span className="section-label">{rate}% conv.</span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleStatus(rule.id)} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ color: rule.status === 'active' ? '#ffb347' : '#10d98a', background: rule.status === 'active' ? 'rgba(255,179,71,.1)' : 'rgba(16,217,138,.1)' }}>
                    {rule.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="p-1 rounded-lg" style={{ color: '#ff4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t px-4 pb-4 pt-3 flex flex-col gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="grid grid-cols-2 gap-3">
                    {rule.trigger === 'comment_keyword' && rule.replyMessage && (
                      <div className="rounded-xl p-3" style={{ background: 'var(--bg-base)' }}>
                        <div className="section-label text-[10px] mb-1">Public Comment Reply</div>
                        <div className="text-xs flex items-center gap-2">
                          <Hash size={10} style={{ color: '#7b93ff' }} />
                          <span style={{ color: 'var(--text-primary)' }}>{rule.replyMessage}</span>
                        </div>
                      </div>
                    )}
                    <div className="rounded-xl p-3 col-span-2" style={{ background: 'var(--bg-base)' }}>
                      <div className="section-label text-[10px] mb-1 flex items-center gap-1"><ArrowRight size={10} /> DM Message</div>
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{rule.dmMessage}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: 'Triggered', v: rule.triggeredCount.toLocaleString(), c: '#00d9ff' },
                      { l: 'Conversions', v: rule.conversionCount.toLocaleString(), c: '#10d98a' },
                      { l: 'Conv. Rate', v: rate + '%', c: '#ffb347' },
                    ].map(s => (
                      <div key={s.l} className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-base)' }}>
                        <div className="section-label text-[10px]">{s.l}</div>
                        <div className="text-sm font-bold mt-0.5" style={{ color: s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SocialPage() {
  const [tab, setTab] = useState<Tab>('calendar');
  const [posts, setPosts] = useState<SocialPost[]>(SOCIAL_POSTS);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newPostDate, setNewPostDate] = useState<Date | null>(null);
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'all'>('all');

  const handleAddPost = (post: SocialPost) => {
    setPosts(prev => [post, ...prev]);
  };

  const handleUpdatePost = (id: string, status: SocialPost['status']) => {
    setPosts(prev => prev.map(p => p.id !== id ? p : { ...p, status }));
    setSelectedPost(prev => prev && prev.id === id ? { ...prev, status } : prev);
  };

  const handleSelectPost = (post: SocialPost | null) => {
    setSelectedPost(post);
    setNewPostDate(null);
    setComposerOpen(true);
  };

  const handleNewPost = (date?: Date) => {
    setSelectedPost(null);
    setNewPostDate(date || new Date());
    setComposerOpen(true);
  };

  const showPanel = composerOpen || selectedPost;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title="Social Media" subtitle="6 Platforms" breadcrumbs={['MarketOS', 'Social']} />

        <main className="flex-1 overflow-hidden flex flex-col p-5 gap-4" style={{ minHeight: 0 }}>

          {/* Platform stats row */}
          <PlatformStatsBar />

          {/* Tab bar + actions */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {TABS.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.key}
                    onClick={() => setTab(t.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all relative"
                    style={{
                      background: tab === t.key ? 'var(--bg-elevated)' : 'transparent',
                      color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: tab === t.key ? 500 : 400,
                      border: tab === t.key ? '1px solid var(--border-dim)' : '1px solid transparent',
                    }}>
                    <Icon size={13} />
                    {t.label}
                    {t.badge ? (
                      <span className="text-[9px] px-1 py-0.5 rounded-full font-mono"
                        style={{ background: '#ff4444', color: 'white', minWidth: 16, textAlign: 'center' }}>
                        {t.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              {/* Platform filter */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPlatformFilter('all')}
                  className="px-2.5 py-1 rounded-lg text-[11px] transition-all"
                  style={{ background: platformFilter === 'all' ? 'var(--bg-elevated)' : 'transparent', color: platformFilter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)', border: platformFilter === 'all' ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
                  All
                </button>
                {ALL_PLATFORMS.map(p => {
                  const cfg = PLATFORM_CONFIG[p];
                  const active = platformFilter === p;
                  return (
                    <button key={p}
                      onClick={() => setPlatformFilter(p === platformFilter ? 'all' : p)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all"
                      style={{ background: active ? cfg.color + '20' : 'var(--bg-elevated)', color: active ? cfg.color : 'var(--text-muted)', border: `1px solid ${active ? cfg.color + '40' : 'transparent'}` }}>
                      {cfg.label.charAt(0)}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handleNewPost()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: '#00d9ff', color: '#0a0e1a' }}>
                <Plus size={13} />
                New Post
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Left: main tab content */}
            <div className={`flex flex-col min-h-0 transition-all duration-300 ${showPanel ? 'flex-1' : 'flex-1'}`}>
              {tab === 'calendar' && (
                <SocialCalendar
                  posts={posts}
                  onSelectPost={handleSelectPost}
                  onNewPost={handleNewPost}
                  filterPlatform={platformFilter}
                />
              )}
              {tab === 'queue' && (
                <ContentQueue
                  posts={posts}
                  onSelectPost={handleSelectPost}
                  filterPlatform={platformFilter}
                />
              )}
              {tab === 'inbox' && <SocialInbox />}
              {tab === 'listening' && <SocialListening />}
              {tab === 'approvals' && <div className="flex-1 overflow-y-auto"><PostApprovalsPanel /></div>}
              {tab === 'dmauto'   && <div className="flex-1 overflow-y-auto"><DMAutomationPanel /></div>}
              {tab === 'aitools'  && <div className="flex-1 overflow-y-auto"><AIToolsPanel /></div>}
              {tab === 'grid' && (
                <div className="flex-1 overflow-y-auto overflow-x-auto">
                  <InstagramGridPreview
                    onEditPost={post => { setTab('calendar'); handleSelectPost(post); }}
                    onNewPost={() => { setTab('calendar'); handleNewPost(); }}
                  />
                </div>
              )}
            </div>

            {/* Right: composer panel (only for non-grid tabs) */}
            {showPanel && tab !== 'grid' && (
              <div className="w-80 shrink-0 rounded-xl overflow-hidden animate-slide-in"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}>
                <PostComposer
                  post={selectedPost}
                  defaultDate={newPostDate || undefined}
                  onAddPost={handleAddPost}
                  onUpdatePost={handleUpdatePost}
                  onClose={() => { setComposerOpen(false); setSelectedPost(null); }}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
