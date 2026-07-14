'use client';

import { useState } from 'react';
import { Plus, Clock, ArrowRight, Package, FileText, DollarSign, X } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { COMPETITOR_DATA } from '@/lib/seoData';
import type { CompetitorChangeType, CompetitorData } from '@/lib/seoData';

type ChangeTab = CompetitorChangeType;

const TABS: { key: ChangeTab; label: string; icon: typeof DollarSign }[] = [
  { key: 'price',   label: 'Price',   icon: DollarSign },
  { key: 'product', label: 'Products', icon: Package   },
  { key: 'content', label: 'Content',  icon: FileText  },
];

const SEVERITY_BADGE: Record<string, string> = {
  high:   'badge-critical',
  medium: 'badge-warning',
  low:    'badge-info',
};

function formatTime(iso: string): string {
  const now   = new Date('2026-05-11T09:00:00Z').getTime();
  const then  = new Date(iso).getTime();
  const hours = Math.floor((now - then) / 3_600_000);
  if (hours < 1)  return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CompetitorMonitor() {
  const [competitors, setCompetitors] = usePersistentState<CompetitorData[]>('seo.competitors', COMPETITOR_DATA);
  const [activeTabs, setActiveTabs] = useState<Record<string, ChangeTab>>(() =>
    Object.fromEntries(COMPETITOR_DATA.map(c => [c.id, 'price']))
  );
  const [adding, setAdding]           = useState(false);
  const [newName, setNewName]         = useState('');
  const [newDomain, setNewDomain]     = useState('');

  const setTab = (competitorId: string, tab: ChangeTab) => {
    setActiveTabs(prev => ({ ...prev, [competitorId]: tab }));
  };

  const resetForm = () => {
    setNewName('');
    setNewDomain('');
    setAdding(false);
  };

  const addCompetitor = () => {
    if (!newName.trim() || !newDomain.trim()) return;
    const id = `comp-${Date.now()}`;
    const competitor: CompetitorData = {
      id,
      domain: newDomain.trim().replace(/^https?:\/\//, ''),
      displayName: newName.trim(),
      lastChecked: new Date().toISOString(),
      totalChanges: 0,
      weeklyChanges: 0,
      changes: [],
    };
    setCompetitors(prev => [...prev, competitor]);
    setActiveTabs(prev => ({ ...prev, [id]: 'price' }));
    resetForm();
  };

  const totalChangesThisWeek = competitors.reduce((sum, c) => sum + c.weeklyChanges, 0);

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <div className='section-label mb-1'>Competitor Monitor</div>
          <div className='text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>
            {competitors.length} competitors · {totalChangesThisWeek} changes this week
          </div>
        </div>
        <button
          onClick={() => setAdding(a => !a)}
          className='flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all'
          style={adding
            ? { background: 'rgba(0,217,255,0.12)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.25)' }
            : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-dim)' }}
        >
          <Plus size={12} />Add Competitor
        </button>
      </div>

      {/* Inline add-competitor form */}
      {adding && (
        <div
          className='glass-card p-4 flex flex-col gap-2.5'
          style={{ border: '1px solid rgba(0,217,255,0.25)' }}
        >
          <div className='flex items-center justify-between'>
            <span className='section-label' style={{ color: '#00d9ff' }}>New Competitor</span>
            <button onClick={resetForm} style={{ color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          </div>
          <div className='flex items-center gap-2'>
            <input
              type='text'
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder='Competitor name'
              className='flex-1 text-xs px-2.5 py-1.5 rounded-lg outline-none'
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            />
            <input
              type='text'
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              placeholder='domain.com'
              className='flex-1 text-xs px-2.5 py-1.5 rounded-lg outline-none font-mono'
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            />
          </div>
          <div className='flex gap-2'>
            <button
              onClick={addCompetitor}
              disabled={!newName.trim() || !newDomain.trim()}
              className='flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all'
              style={{
                background: 'rgba(0,217,255,0.12)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.25)',
                opacity: newName.trim() && newDomain.trim() ? 1 : 0.5,
                cursor: newName.trim() && newDomain.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Add Competitor
            </button>
            <button
              onClick={resetForm}
              className='px-3 py-1.5 rounded-lg text-xs font-medium transition-all'
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Summary stats row */}
      <div className='grid grid-cols-3 gap-3'>
        {competitors.map(comp => (
          <div
            key={comp.id}
            className='glass-card-elevated px-4 py-3'
            style={{ borderLeft: '3px solid rgba(255,68,68,0.4)' }}
          >
            <div className='flex items-center justify-between mb-1.5'>
              <span className='text-xs font-semibold truncate' style={{ color: 'var(--text-primary)', maxWidth: '65%' }}>
                {comp.displayName}
              </span>
              <span
                className='text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold'
                style={{ background: 'rgba(255,68,68,0.14)', color: '#ff4444' }}
              >
                {comp.weeklyChanges} this wk
              </span>
            </div>
            <div className='text-[10px] font-mono' style={{ color: 'var(--text-muted)' }}>
              {comp.totalChanges} total · <span style={{ color: '#7b93ff' }}>{comp.domain}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Competitor cards */}
      {competitors.map(comp => {
        const activeTab  = activeTabs[comp.id] ?? 'price';
        const tabChanges = comp.changes.filter(c => c.type === activeTab);
        const lastChecked = formatTime(comp.lastChecked);

        return (
          <div key={comp.id} className='glass-card p-4'>
            {/* Card header */}
            <div className='flex items-start justify-between mb-3'>
              <div>
                <div className='flex items-center gap-2.5 mb-1'>
                  <span className='text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>
                    {comp.displayName}
                  </span>
                  <span
                    className='text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold'
                    style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444' }}
                  >
                    {comp.weeklyChanges} changes this week
                  </span>
                </div>
                <div className='flex items-center gap-1.5 text-[10px] font-mono' style={{ color: 'var(--text-muted)' }}>
                  <Clock size={9} />
                  <span>Checked {lastChecked}</span>
                  <span>·</span>
                  <span style={{ color: '#7b93ff' }}>{comp.domain}</span>
                </div>
              </div>
              <div
                className='text-[11px] px-2.5 py-1 rounded-lg font-mono'
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                {comp.totalChanges} total
              </div>
            </div>

            {/* Sub-tabs — pill style */}
            <div
              className='flex items-center gap-0.5 p-1 mb-3'
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 9,
                width: 'fit-content',
              }}
            >
              {TABS.map(tab => {
                const count  = comp.changes.filter(c => c.type === tab.key).length;
                const active = activeTab === tab.key;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setTab(comp.id, tab.key)}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-all'
                    style={{
                      borderRadius: 6,
                      background: active ? 'rgba(0,217,255,0.12)' : 'transparent',
                      color: active ? '#00d9ff' : 'var(--text-secondary)',
                      border: active ? '1px solid rgba(0,217,255,0.25)' : '1px solid transparent',
                    }}
                  >
                    <TabIcon size={10} />
                    {tab.label}
                    {count > 0 && (
                      <span
                        className='text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold'
                        style={{
                          background: active ? 'rgba(0,217,255,0.2)' : 'rgba(var(--overlay-rgb),0.06)',
                          color: active ? '#00d9ff' : 'var(--text-muted)',
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Change items */}
            {tabChanges.length === 0 ? (
              <div
                className='py-6 text-center text-xs rounded-xl'
                style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
              >
                No {activeTab} changes detected this period.
              </div>
            ) : (
              <div className='space-y-2'>
                {tabChanges.map(change => (
                  <div
                    key={change.id}
                    className='rounded-xl p-3.5'
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: `3px solid ${change.severity === 'high' ? '#ff4444' : change.severity === 'medium' ? '#ffb347' : '#7b93ff'}`,
                    }}
                  >
                    <div className='flex items-start justify-between gap-2 mb-2.5'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1 flex-wrap'>
                          <span className='text-xs font-medium' style={{ color: 'var(--text-primary)' }}>
                            {change.what}
                          </span>
                          <span className={`${SEVERITY_BADGE[change.severity]} text-[9px] px-1.5 py-0.5 rounded-full font-mono`}>
                            {change.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className='text-[10px] font-mono' style={{ color: '#7b93ff' }}>
                          {change.page}
                        </div>
                      </div>
                      <div className='text-[10px] font-mono shrink-0' style={{ color: 'var(--text-muted)' }}>
                        {formatTime(change.detectedAt)}
                      </div>
                    </div>

                    {/* Old → New value with strikethrough */}
                    {(change.oldValue || change.newValue) && (
                      <div className='flex items-center gap-2 text-[11px] font-mono'>
                        {change.oldValue && (
                          <span
                            className='px-2 py-0.5 rounded'
                            style={{
                              color: '#ff4444',
                              textDecoration: 'line-through',
                              background: 'rgba(255,68,68,0.08)',
                            }}
                          >
                            {change.oldValue}
                          </span>
                        )}
                        {change.oldValue && change.newValue && (
                          <ArrowRight size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        )}
                        {change.newValue && (
                          <span
                            className='px-2 py-0.5 rounded font-semibold'
                            style={{
                              color: '#10d98a',
                              background: 'rgba(16,217,138,0.1)',
                            }}
                          >
                            {change.newValue}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
