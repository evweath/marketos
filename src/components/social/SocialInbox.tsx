'use client';

import { useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { INBOX_MESSAGES, PLATFORM_CONFIG } from '@/lib/socialData';
import type { InboxMessage } from '@/lib/socialData';
import { MessageSquare, AtSign, Star, Send } from 'lucide-react';

const SENTIMENT_CONFIG = {
  positive: { color: '#10d98a', bg: 'rgba(16,217,138,0.12)',  icon: '😊', label: 'Positive sentiment — great engagement opportunity'       },
  neutral:  { color: '#7b93ff', bg: 'rgba(123,147,255,0.12)', icon: '😐', label: 'Neutral — standard response recommended'                  },
  negative: { color: '#ff4444', bg: 'rgba(255,68,68,0.12)',   icon: '😠', label: 'Negative sentiment — respond promptly to avoid escalation' },
};

const TYPE_CONFIG = {
  comment: { Icon: MessageSquare, label: 'Comment' },
  dm:      { Icon: MessageSquare, label: 'DM'      },
  mention: { Icon: AtSign,        label: 'Mention' },
  review:  { Icon: Star,          label: 'Review'  },
};

const PLATFORM_TABS = ['all', 'instagram', 'facebook', 'tiktok', 'linkedin', 'x-twitter'] as const;
type PlatformTab = typeof PLATFORM_TABS[number];

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function MessageCard({ msg, selected, onClick }: { msg: InboxMessage; selected: boolean; onClick: () => void }) {
  const pCfg = PLATFORM_CONFIG[msg.platform];
  const sCfg = SENTIMENT_CONFIG[msg.sentiment];
  const tCfg = TYPE_CONFIG[msg.type];
  const isUnread = !msg.replied && msg.requiresAttention;

  return (
    <button
      onClick={onClick}
      className="w-full text-left border-b transition-colors hover:bg-white/[0.025]"
      style={{
        borderColor: 'var(--border-subtle)',
        background: selected ? 'rgba(0,217,255,0.04)' : 'transparent',
        borderLeft: isUnread
          ? `3px solid ${pCfg.color}`
          : selected
            ? '3px solid rgba(0,217,255,0.5)'
            : '3px solid transparent',
      }}>
      <div className="flex items-start gap-2.5 px-3 py-3">
        {/* Avatar with platform-colored ring */}
        <div className="relative shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[16px] font-bold"
            style={{
              background: pCfg.color + '22',
              color: pCfg.color,
              border: `2px solid ${pCfg.color}50`,
            }}>
            {msg.avatarInitials}
          </div>
          {isUnread && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: '#ff4444', border: '1.5px solid var(--bg-surface)' }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)', maxWidth: 110 }}>
                {msg.author}
              </span>
              <span className="text-[16px] font-mono px-1.5 py-0.5 rounded shrink-0"
                style={{ background: pCfg.color + '18', color: pCfg.color }}>
                {pCfg.label}
              </span>
            </div>
            <span className="text-[16px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
              {timeAgo(msg.receivedAt)}
            </span>
          </div>

          <p className="text-base line-clamp-2 mb-1.5" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {msg.content}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {tCfg.label}
            </span>
            {/* Sentiment pill */}
            <span
              className="flex items-center gap-0.5 text-[16px] px-1.5 py-0.5 rounded"
              style={{ background: sCfg.bg, color: sCfg.color }}>
              {sCfg.icon}
            </span>
            {msg.replied && (
              <span className="ml-auto text-[16px] font-mono" style={{ color: '#10d98a' }}>✓ Replied</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function SocialInbox() {
  const [messages, setMessages] = usePersistentState<InboxMessage[]>('social.inboxMessages', INBOX_MESSAGES);
  const [selected, setSelected] = useState<InboxMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformTab>('all');

  const unread = messages.filter(m => !m.replied && m.requiresAttention).length;
  const filtered = messages.filter(m =>
    platformFilter === 'all' || m.platform === platformFilter
  );

  const platformTabCount = (p: PlatformTab) =>
    p === 'all'
      ? messages.length
      : messages.filter(m => m.platform === p).length;

  const sendReply = () => {
    if (!selected || !replyText.trim()) return;
    setMessages(prev => prev.map(m => m.id !== selected.id ? m : { ...m, replied: true }));
    setSelected(prev => prev ? { ...prev, replied: true } : prev);
    setReplyText('');
  };

  return (
    <div className="glass-card flex overflow-hidden" style={{ height: 520 }}>
      {/* Message list */}
      <div className="flex flex-col border-r shrink-0" style={{ width: 340, borderColor: 'var(--border-subtle)' }}>
        {/* List header */}
        <div className="px-3 py-3 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="section-label">Unified Inbox</span>
            {unread > 0 && (
              <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,68,68,0.15)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.25)' }}>
                {unread} new
              </span>
            )}
          </div>

          {/* Platform filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {PLATFORM_TABS.map(p => {
              const isActive = platformFilter === p;
              const color = p !== 'all' ? PLATFORM_CONFIG[p]?.color : undefined;
              const count = platformTabCount(p);
              return (
                <button key={p}
                  onClick={() => setPlatformFilter(p)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[16px] transition-all"
                  style={{
                    background: isActive
                      ? (color ? color + '20' : 'var(--bg-overlay)')
                      : 'transparent',
                    color: isActive ? (color ?? 'var(--text-primary)') : 'var(--text-muted)',
                    border: isActive
                      ? `1px solid ${color ? color + '40' : 'var(--border-dim)'}`
                      : '1px solid transparent',
                  }}>
                  {p === 'all' ? 'All' : (PLATFORM_CONFIG[p]?.label?.slice(0, 3) ?? p)}
                  <span className="font-mono text-[16px]" style={{ color: 'inherit', opacity: 0.7 }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(msg => (
            <MessageCard key={msg.id} msg={msg} selected={selected?.id === msg.id} onClick={() => setSelected(msg)} />
          ))}
        </div>
      </div>

      {/* Reply panel */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Detail header */}
          <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{selected.author}</span>
              <span className="text-[16px] font-mono" style={{ color: PLATFORM_CONFIG[selected.platform].color }}>
                {selected.authorHandle}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[16px]">
              <span style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>{timeAgo(selected.receivedAt)}</span>
              <span className="font-mono" style={{ color: PLATFORM_CONFIG[selected.platform].color }}>
                via {PLATFORM_CONFIG[selected.platform].label}
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {/* Original message bubble */}
            <div>
              <div className="section-label mb-1.5">Message</div>
              <div className="rounded-xl px-4 py-3 text-base leading-relaxed"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
                {selected.content}
              </div>
              {selected.postCaption && (
                <div className="mt-1.5 text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  In response to: "{selected.postCaption}"
                </div>
              )}
            </div>

            {/* Sentiment indicator */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-base"
              style={{
                background: SENTIMENT_CONFIG[selected.sentiment].bg,
                color: SENTIMENT_CONFIG[selected.sentiment].color,
                border: `1px solid ${SENTIMENT_CONFIG[selected.sentiment].color}25`,
              }}>
              <span>{SENTIMENT_CONFIG[selected.sentiment].icon}</span>
              <span>{SENTIMENT_CONFIG[selected.sentiment].label}</span>
            </div>
          </div>

          {/* Reply box */}
          {!selected.replied ? (
            <div className="p-4 border-t shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="section-label mb-2">
                Reply as {PLATFORM_CONFIG[selected.platform].label} Page
              </div>
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={2}
                  placeholder="Write a reply..."
                  className="flex-1 text-base px-3 py-2.5 rounded-xl resize-none outline-none transition-colors"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim()}
                  className="px-3 py-2 rounded-xl text-base font-semibold self-end transition-all"
                  style={{
                    background: replyText.trim() ? '#00d9ff' : 'var(--bg-elevated)',
                    color: replyText.trim() ? '#080b18' : 'var(--text-muted)',
                    border: replyText.trim() ? 'none' : '1px solid var(--border-subtle)',
                  }}>
                  <Send size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t text-base text-center shrink-0"
              style={{ borderColor: 'var(--border-subtle)', color: '#10d98a' }}>
              ✓ Already replied to this message
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
          <div className="text-center">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
            <div className="text-base">Select a message to reply</div>
          </div>
        </div>
      )}
    </div>
  );
}
