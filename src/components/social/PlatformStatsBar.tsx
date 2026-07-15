'use client';

import { PLATFORM_STATS, PLATFORM_CONFIG } from '@/lib/socialData';
import { TrendingUp, TrendingDown } from 'lucide-react';

const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();

export default function PlatformStatsBar() {
  return (
    <div className="grid grid-cols-6 gap-2 mb-4">
      {PLATFORM_STATS.map(stat => {
        const cfg = PLATFORM_CONFIG[stat.platform];
        const positive = stat.followerDelta >= 0;
        const engColor = stat.avgEngagementRate >= 4 ? '#10d98a' : stat.avgEngagementRate >= 2 ? '#ffb347' : '#ff4444';

        return (
          <div key={stat.platform} className="glass-card relative overflow-hidden flex flex-col">
            {/* Top platform color border */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: cfg.color }} />

            <div className="px-3 pt-4 pb-3 flex flex-col gap-2 flex-1">
              {/* Platform icon + name */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[16px] font-bold shrink-0"
                  style={{ background: cfg.color + '22', color: cfg.color, boxShadow: `0 0 0 1px ${cfg.color}30` }}>
                  {cfg.label.charAt(0)}
                </div>
                <span className="text-base font-semibold truncate" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>

              {stat.started === false ? (
                <div className="flex-1 flex items-center justify-center py-2">
                  <span
                    className="text-[16px] px-2 py-0.5 rounded-full font-mono"
                    style={{ background: 'rgba(var(--overlay-rgb),0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                  >
                    Not Started
                  </span>
                </div>
              ) : (
                <>
                  {/* Follower count */}
                  <div>
                    <div className="data-value text-xl font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
                      {fmt(stat.followers)}
                    </div>
                    <div className="section-label mt-0.5">Followers</div>
                  </div>

                  {/* Delta */}
                  <div className="flex items-center gap-1 text-[16px] font-mono"
                    style={{ color: positive ? '#10d98a' : '#ff4444' }}>
                    {positive
                      ? <TrendingUp size={10} />
                      : <TrendingDown size={10} />}
                    <span>{positive ? '+' : ''}{stat.followerDelta} this mo.</span>
                  </div>

                  {/* Engagement + posts */}
                  <div className="grid grid-cols-2 gap-1.5 mt-auto">
                    <div className="rounded-lg px-1.5 py-1.5 text-center"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <div className="text-[16px] font-bold font-mono leading-none" style={{ color: engColor }}>
                        {stat.avgEngagementRate}%
                      </div>
                      <div className="section-label mt-0.5" style={{ fontSize: 16 }}>Eng.</div>
                    </div>
                    <div className="rounded-lg px-1.5 py-1.5 text-center"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <div className="text-[16px] font-bold font-mono leading-none" style={{ color: 'var(--text-primary)' }}>
                        {stat.postsThisMonth}
                      </div>
                      <div className="section-label mt-0.5" style={{ fontSize: 16 }}>Posts</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
