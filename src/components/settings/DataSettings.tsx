'use client';

import { useState, useEffect } from 'react';
import { Database, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { loadSampleData, clearAllData, hasSampleDataLoaded } from '@/lib/sampleDataRegistry';

export function DataSettings() {
  const [loaded, setLoaded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Reads localStorage directly, so this needs to run client-side post-mount.
  useEffect(() => setLoaded(hasSampleDataLoaded()), []);

  return (
    <div className='flex flex-col gap-4 max-w-2xl'>
      <div className='glass-card p-5'>
        <div className='flex items-center gap-2 mb-2'>
          <Database size={14} style={{ color: 'var(--cyan)' }} />
          <span className='text-base font-semibold' style={{ color: 'var(--text-primary)' }}>App data</span>
        </div>
        <p className='text-base leading-relaxed mb-4' style={{ color: 'var(--text-secondary)' }}>
          MarketOS ships empty — every campaign, post, email, alert, and metric starts at zero until real
          channel connections are pulling data. Use these controls to load realistic sample records for a
          demo, or reset everything back to a clean slate.
        </p>

        <div className='flex items-center gap-2 mb-4'>
          <span
            className='text-[16px] font-mono px-2 py-0.5 rounded-full'
            style={{
              background: loaded ? 'rgba(16,217,138,0.12)' : 'rgba(var(--overlay-rgb),0.06)',
              color: loaded ? '#10d98a' : 'var(--text-muted)',
              border: `1px solid ${loaded ? 'rgba(16,217,138,0.25)' : 'var(--border-subtle)'}`,
            }}
          >
            {loaded ? 'Sample data loaded' : 'No sample data loaded'}
          </span>
        </div>

        <div className='flex items-center gap-2 flex-wrap'>
          <button
            onClick={loadSampleData}
            className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-base font-semibold transition-all hover:opacity-90'
            style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}
          >
            <Sparkles size={13} /> Load Sample Data
          </button>

          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-base font-medium transition-all'
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              <Trash2 size={13} /> Clear All Data
            </button>
          ) : (
            <div className='flex items-center gap-2 px-3 py-2 rounded-lg' style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.22)' }}>
              <AlertTriangle size={13} style={{ color: '#ff6464' }} />
              <span className='text-base' style={{ color: '#ff6464' }}>Reset everything to empty?</span>
              <button onClick={clearAllData} className='text-base font-semibold px-2 py-1 rounded' style={{ color: '#ff6464' }}>Yes, clear</button>
              <button onClick={() => setConfirmClear(false)} className='text-base px-2 py-1 rounded' style={{ color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          )}
        </div>

        <p className='text-[16px] mt-3' style={{ color: 'var(--text-muted)' }}>
          Both actions reload the page after applying, since data is stored per-browser (localStorage) — there's no shared backend.
        </p>
      </div>
    </div>
  );
}
