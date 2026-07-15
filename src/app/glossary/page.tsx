'use client';

import { useMemo, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { GLOSSARY, GLOSSARY_CATEGORY_LABELS, type GlossaryCategory } from '@/lib/glossaryData';

type CategoryFilter = 'all' | GlossaryCategory;

const CATEGORY_COLORS: Record<GlossaryCategory, string> = {
  acronym: 'var(--purple)',
  kpi: 'var(--cyan)',
  term: 'var(--green)',
};

const FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'acronym', label: 'Acronyms' },
  { key: 'kpi', label: 'KPIs' },
  { key: 'term', label: 'Terms' },
];

function alphaKey(term: string): string {
  const ch = term.trim()[0]?.toUpperCase() ?? '#';
  return /[A-Z]/.test(ch) ? ch : '#';
}

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY
      .filter(e => category === 'all' || e.category === category)
      .filter(e => !q || e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [search, category]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const entry of filtered) {
      const key = alphaKey(entry.term);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const availableLetters = useMemo(() => new Set(groups.map(([letter]) => letter)), [groups]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          title="Glossary"
          subtitle={`${GLOSSARY.length} terms`}
          breadcrumbs={['MarketOS', 'Glossary']}
        />
        <main className="flex-1 overflow-hidden flex flex-col p-5 gap-4" style={{ minHeight: 0 }}>

          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.2)' }}
              >
                <BookOpen size={15} style={{ color: 'var(--cyan)' }} />
              </div>
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Marketing Glossary</h2>
                <p className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>
                  Every marketing term, acronym, and performance KPI used across MarketOS
                </p>
              </div>
            </div>

            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search the glossary…"
                className="pl-7 pr-3 py-2 rounded-lg text-base outline-none w-64"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl shrink-0"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
            {FILTERS.map(f => (
              <button key={f.key}
                onClick={() => setCategory(f.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base transition-all"
                style={{
                  background: category === f.key ? 'var(--bg-elevated)' : 'transparent',
                  color: category === f.key ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: category === f.key ? 500 : 400,
                  border: category === f.key ? '1px solid var(--border-dim)' : '1px solid transparent',
                }}>
                {f.label}
                <span className="text-[16px] opacity-60">
                  {f.key === 'all' ? GLOSSARY.length : GLOSSARY.filter(e => e.category === f.key).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 flex gap-4">
            {/* A-Z jump strip */}
            <div className="hidden md:flex flex-col gap-0.5 shrink-0 pt-1">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                const has = availableLetters.has(letter);
                return (
                  <a
                    key={letter}
                    href={has ? `#glossary-${letter}` : undefined}
                    className="text-[16px] font-mono w-5 h-5 flex items-center justify-center rounded transition-colors"
                    style={{
                      color: has ? 'var(--text-secondary)' : 'var(--text-muted)',
                      opacity: has ? 1 : 0.3,
                      pointerEvents: has ? 'auto' : 'none',
                      cursor: has ? 'pointer' : 'default',
                    }}
                  >
                    {letter}
                  </a>
                );
              })}
            </div>

            {/* Entries */}
            <div className="flex-1 min-w-0 overflow-y-auto pr-1 space-y-5">
              {groups.length === 0 && (
                <div className="glass-card p-8 text-center">
                  <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                    No terms match “{search}”.
                  </p>
                </div>
              )}

              {groups.map(([letter, entries]) => (
                <div key={letter} id={`glossary-${letter}`}>
                  <div className="section-label mb-2">{letter}</div>
                  <div className="space-y-2">
                    {entries.map(entry => (
                      <div key={entry.term} className="glass-card p-3.5">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {entry.term}
                          </h3>
                          <span
                            className="text-[16px] font-mono px-1.5 py-0.5 rounded uppercase"
                            style={{
                              color: CATEGORY_COLORS[entry.category],
                              background: `${CATEGORY_COLORS[entry.category]}18`,
                              border: `1px solid ${CATEGORY_COLORS[entry.category]}30`,
                              letterSpacing: '0.06em',
                            }}
                          >
                            {GLOSSARY_CATEGORY_LABELS[entry.category]}
                          </span>
                        </div>
                        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {entry.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
