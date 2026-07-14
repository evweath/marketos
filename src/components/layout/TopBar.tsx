'use client';

import { useState, useEffect } from 'react';
import { Bell, RefreshCw, ChevronRight, Sun, Moon } from 'lucide-react';
import { ALERTS } from '@/lib/mockData';
import { useTheme } from '@/lib/ThemeProvider';

interface TopBarProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
}

export default function TopBar({ title, subtitle, breadcrumbs }: TopBarProps) {
  const [time, setTime] = useState('');
  const [rotating, setRotating] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const unacknowledgedAlerts = ALERTS.filter(a => !a.acknowledged);
  const criticalCount = unacknowledgedAlerts.filter(a => a.severity === 'critical').length;

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setRotating(true);
    setTimeout(() => setRotating(false), 800);
  };

  return (
    <header
      className="flex items-center justify-between px-5 shrink-0"
      style={{
        background: 'var(--bg-nav)',
        borderBottom: '1px solid var(--border-subtle)',
        height: 52,
        boxShadow: '0 1px 0 var(--border-subtle)',
      }}
    >
      {/* Left: breadcrumb + title */}
      <div className="flex items-center gap-3">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <span
                  className="text-[11px]"
                  style={{
                    color: i === breadcrumbs.length - 1 ? 'var(--text-muted)' : 'var(--text-muted)',
                    fontFamily: 'DM Mono',
                    letterSpacing: '0.04em',
                  }}
                >
                  {crumb}
                </span>
                {i < breadcrumbs.length - 1 && (
                  <ChevronRight size={10} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                )}
              </span>
            ))}
          </div>
        )}

        <div
          className="w-px h-4"
          style={{ background: 'var(--border-dim)' }}
        />

        <div className="flex items-center gap-2.5">
          <h1
            className="text-[15px] font-semibold tracking-tight leading-none"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-md font-mono"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right: live indicator, clock, actions */}
      <div className="flex items-center gap-1">

        {/* Live indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md mr-2"
          style={{
            background: 'rgba(16,217,138,0.07)',
            border: '1px solid rgba(16,217,138,0.15)',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full live-dot"
            style={{ background: '#10d98a' }}
          />
          <span
            className="text-[10px] font-mono font-semibold"
            style={{ color: '#10d98a', letterSpacing: '0.08em' }}
          >
            LIVE
          </span>
        </div>

        {/* Clock */}
        <div
          className="px-2.5 py-1 rounded-md"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span
            className="data-value text-[12px] tabular-nums"
            style={{ color: 'var(--text-secondary)' }}
          >
            {time}
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--overlay-rgb),0.04)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--overlay-rgb),0.04)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Refresh data"
        >
          <RefreshCw size={14} className={rotating ? 'animate-spin' : ''} />
        </button>

        {/* Alerts bell */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: criticalCount > 0 ? '#ff4444' : unacknowledgedAlerts.length > 0 ? '#ffb347' : 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--overlay-rgb),0.04)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell size={14} />
          {unacknowledgedAlerts.length > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold leading-none"
              style={{
                background: criticalCount > 0 ? '#ff4444' : '#ffb347',
                color: '#080b18',
                boxShadow: `0 0 0 2px var(--bg-surface)`,
              }}
            >
              {unacknowledgedAlerts.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
