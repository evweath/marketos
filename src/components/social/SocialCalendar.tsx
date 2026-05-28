'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { SOCIAL_POSTS, PLATFORM_CONFIG } from '@/lib/socialData';
import type { SocialPost, SocialPlatform } from '@/lib/socialData';

interface Props {
  onSelectPost: (post: SocialPost | null) => void;
  onNewPost: (date: Date) => void;
  filterPlatform: SocialPlatform | 'all';
}

const STATUS_COLORS = {
  published: '#10d98a',
  scheduled: '#00d9ff',
  draft:     '#7b93ff',
  failed:    '#ff4444',
  review:    '#ffb347',
};

const STATUS_LABELS: (keyof typeof STATUS_COLORS)[] = ['published', 'scheduled', 'review', 'draft'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function sameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SocialCalendar({ onSelectPost, onNewPost, filterPlatform }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const calDays = getCalendarDays(year, month);
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const postsForDay = (day: number) => {
    const dayDate = new Date(year, month, day);
    return SOCIAL_POSTS.filter(p => {
      const pDate = new Date(p.scheduledFor);
      if (!sameDay(dayDate, pDate)) return false;
      if (filterPlatform !== 'all' && !p.platforms.includes(filterPlatform)) return false;
      return true;
    });
  };

  return (
    <div className="glass-card flex flex-col flex-1" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}>
        {/* Month navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <ChevronLeft size={14} />
          </button>
          <h3 className="text-base font-bold px-3" style={{ color: 'var(--text-primary)', minWidth: 160, textAlign: 'center' }}>
            {monthLabel}
          </h3>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Status legend */}
        <div className="flex items-center gap-3">
          {STATUS_LABELS.map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
              <span className="text-[10px] font-mono capitalize" style={{ color: 'var(--text-muted)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="py-2 text-center section-label tracking-wide">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: '1fr' }}>
        {calDays.map((day, idx) => {
          if (day === null) {
            return (
              <div key={`empty-${idx}`} className="border-b border-r"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-base)', opacity: 0.4 }} />
            );
          }

          const isToday = sameDay(new Date(year, month, day), today);
          const dayPosts = postsForDay(day);
          const isPast = new Date(year, month, day) < today && !isToday;
          const MAX_SHOWN = 3;

          return (
            <div key={`day-${day}`}
              className="border-b border-r p-1.5 flex flex-col gap-0.5 cursor-pointer group transition-colors hover:bg-white/[0.025] relative"
              style={{
                borderColor: 'var(--border-subtle)',
                minHeight: 80,
                outline: isToday ? '1.5px solid #00d9ff' : 'none',
                outlineOffset: '-1.5px',
              }}
              onClick={() => { if (dayPosts.length === 0) onNewPost(new Date(year, month, day)); }}>

              {/* Day number */}
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className="flex items-center justify-center font-mono text-[11px]"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: isToday ? '#00d9ff' : 'transparent',
                    color: isToday ? '#080b18' : isPast ? 'var(--text-muted)' : 'var(--text-secondary)',
                    fontWeight: isToday ? 700 : 400,
                  }}>
                  {day}
                </span>
                {!isPast && (
                  <button
                    onClick={e => { e.stopPropagation(); onNewPost(new Date(year, month, day)); }}
                    className="opacity-0 group-hover:opacity-100 transition-all w-4 h-4 rounded flex items-center justify-center hover:bg-white/10"
                    style={{ color: '#00d9ff' }}>
                    <Plus size={9} />
                  </button>
                )}
              </div>

              {/* Post pills */}
              <div className="flex flex-col gap-0.5">
                {dayPosts.slice(0, MAX_SHOWN).map(post => {
                  const firstPlatform = post.platforms[0];
                  const platColor = PLATFORM_CONFIG[firstPlatform].color;
                  return (
                    <button key={post.id}
                      onClick={e => { e.stopPropagation(); onSelectPost(post); }}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate transition-all hover:brightness-125 flex items-center gap-1"
                      style={{
                        background: STATUS_COLORS[post.status] + '18',
                        borderLeft: `2px solid ${STATUS_COLORS[post.status]}`,
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: platColor }} />
                      <span className="truncate" style={{ color: 'var(--text-secondary)' }}>
                        {post.caption.replace(/\[DRAFT\]\s*/, '').substring(0, 24)}
                      </span>
                    </button>
                  );
                })}
                {dayPosts.length > MAX_SHOWN && (
                  <span className="text-[9px] font-mono px-1.5" style={{ color: 'var(--text-muted)' }}>
                    +{dayPosts.length - MAX_SHOWN} more
                  </span>
                )}
              </div>

              {/* Empty hover state */}
              {dayPosts.length === 0 && !isPast && (
                <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>+ New Post</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
