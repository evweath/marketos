'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { AdCreativeGenerator } from '@/components/content/AdCreativeGenerator';
import { CopywritingTool } from '@/components/content/CopywritingTool';
import { BrandVoicePanel } from '@/components/content/BrandVoicePanel';
import { TemplateLibrary } from '@/components/content/TemplateLibrary';
import { CampaignBriefGenerator } from '@/components/content/CampaignBriefGenerator';
import { PerformanceScorer } from '@/components/content/PerformanceScorer';
import { CompetitorAdAnalysis } from '@/components/content/CompetitorAdAnalysis';
import { CONTENT_STATS } from '@/lib/contentData';
import {
  Image, PenLine, Mic, LayoutGrid, FileText, TrendingUp, BarChart2,
  TrendingDown, Camera, Video, Upload, Wand2, Play, Download, Captions,
  Scissors, CheckCircle,
} from 'lucide-react';

type Tab =
  | 'creative'
  | 'copy'
  | 'brand'
  | 'templates'
  | 'brief'
  | 'scoring'
  | 'competitor'
  | 'photos'
  | 'video';

interface TabConfig {
  key: Tab;
  label: string;
  icon: typeof Image;
}

const TABS: TabConfig[] = [
  { key: 'creative',   label: 'Ad Creative',   icon: Image      },
  { key: 'copy',       label: 'Copywriting',    icon: PenLine    },
  { key: 'brand',      label: 'Brand Voice',    icon: Mic        },
  { key: 'templates',  label: 'Templates',      icon: LayoutGrid },
  { key: 'brief',      label: 'Campaign Brief', icon: FileText   },
  { key: 'scoring',    label: 'Perf. Scoring',  icon: TrendingUp },
  { key: 'competitor', label: 'Competitor Ads', icon: BarChart2  },
  { key: 'photos',     label: 'Photo Studio',   icon: Camera     },
  { key: 'video',      label: 'Video Tools',    icon: Video      },
];

interface KpiCard {
  label: string;
  value: string;
  color: string;
  delta: number;
  deltaLabel: string;
}

// ─── Photo Studio (E-06 background removal / E-07 AI styling) ────────────────

type PhotoJob = { id: string; name: string; original: string; result: 'bg_removed' | 'styled' | 'pending'; style?: string; time: string };

const PHOTO_JOBS: PhotoJob[] = [
  { id: 'pj-1', name: 'ProFryer-3000.jpg',         original: '1.2 MB', result: 'bg_removed', time: '2m ago' },
  { id: 'pj-2', name: 'GlazeKit-Pro.png',           original: '840 KB', result: 'styled', style: 'Studio White', time: '5m ago' },
  { id: 'pj-3', name: 'DeckOven-Series7.jpg',       original: '2.1 MB', result: 'styled', style: 'Lifestyle Kitchen', time: '18m ago' },
  { id: 'pj-4', name: 'MixerAttachment-Set.png',    original: '560 KB', result: 'bg_removed', time: '31m ago' },
  { id: 'pj-5', name: 'DonutCutter-Bundle.jpg',     original: '1.8 MB', result: 'pending', time: 'Processing…' },
];

const STYLE_PRESETS = ['Studio White', 'Lifestyle Kitchen', 'Dark Dramatic', 'Flat Lay', 'Outdoor Market', 'Minimalist'];

function PhotoStudioPanel() {
  const [activeStyle, setActiveStyle] = useState<string>('Studio White');
  const [mode, setMode] = useState<'bg_remove' | 'style'>('bg_remove');
  const [jobs, setJobs] = useState<PhotoJob[]>(PHOTO_JOBS);

  const runJob = () => {
    const id = `pj-new-${Date.now()}`;
    const newJob: PhotoJob = mode === 'bg_remove'
      ? { id, name: `Upload-${jobs.length + 1}.jpg`, original: '1.0 MB', result: 'pending', time: 'Processing…' }
      : { id, name: `Upload-${jobs.length + 1}.png`, original: '1.0 MB', result: 'pending', style: activeStyle, time: 'Processing…' };
    setJobs(prev => [newJob, ...prev]);
  };

  const done = jobs.filter(j => j.result !== 'pending');
  const pending = jobs.filter(j => j.result === 'pending');

  return (
    <div className='flex flex-col gap-4'>
      {/* Stats */}
      <div className='grid grid-cols-4 gap-3'>
        {[
          { label: 'Photos Processed (30d)', value: '1,248', color: '#00d9ff' },
          { label: 'Backgrounds Removed',    value: '842',   color: '#10d98a' },
          { label: 'AI Styles Applied',       value: '406',   color: '#7b93ff' },
          { label: 'Avg Processing Time',     value: '8s',    color: '#ffb347' },
        ].map(s => (
          <div key={s.label} className='glass-card px-4 py-3'>
            <div className='section-label mb-1'>{s.label}</div>
            <div className='data-value text-xl font-bold' style={{ color: s.color, fontFamily: 'DM Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-3 gap-4'>
        {/* Upload + controls */}
        <div className='flex flex-col gap-3'>
          <div className='glass-card p-4'>
            <div className='section-label mb-3'>Upload Product Photo</div>
            <div className='rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8 mb-3 cursor-pointer hover:bg-white/[0.02] transition-colors'
              style={{ borderColor: 'var(--border-dim)' }}>
              <Upload size={20} style={{ color: 'var(--text-muted)' }} />
              <div className='text-xs text-center' style={{ color: 'var(--text-secondary)' }}>
                Drop images here or<br />
                <span style={{ color: '#00d9ff' }}>browse files</span>
              </div>
              <div className='text-[10px]' style={{ color: 'var(--text-muted)' }}>JPG, PNG, WebP · max 10 MB</div>
            </div>

            <div className='flex flex-col gap-2 mb-3'>
              <div className='text-xs font-medium mb-1' style={{ color: 'var(--text-primary)' }}>Mode</div>
              {([['bg_remove', 'Background Removal'], ['style', 'AI Style Transfer']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setMode(k)}
                  className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left'
                  style={{ background: mode === k ? 'rgba(0,217,255,0.08)' : 'var(--bg-elevated)', color: mode === k ? '#00d9ff' : 'var(--text-secondary)', border: `1px solid ${mode === k ? 'rgba(0,217,255,0.3)' : 'transparent'}` }}>
                  {mode === k ? <CheckCircle size={12} /> : <div className='w-3 h-3 rounded-full' style={{ border: '1px solid var(--border-dim)' }} />}
                  {l}
                </button>
              ))}
            </div>

            {mode === 'style' && (
              <div>
                <div className='text-xs font-medium mb-2' style={{ color: 'var(--text-primary)' }}>Style Preset</div>
                <div className='flex flex-wrap gap-1.5'>
                  {STYLE_PRESETS.map(s => (
                    <button key={s} onClick={() => setActiveStyle(s)}
                      className='text-[10px] px-2 py-1 rounded-lg transition-all'
                      style={{ background: activeStyle === s ? 'rgba(123,147,255,0.12)' : 'var(--bg-elevated)', color: activeStyle === s ? '#7b93ff' : 'var(--text-muted)', border: `1px solid ${activeStyle === s ? 'rgba(123,147,255,0.3)' : 'transparent'}` }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={runJob} className='w-full mt-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2'
              style={{ background: 'rgba(0,217,255,0.1)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.25)' }}>
              <Wand2 size={12} />
              {mode === 'bg_remove' ? 'Remove Background' : 'Apply AI Style'}
            </button>
          </div>
        </div>

        {/* Job history */}
        <div className='col-span-2 glass-card overflow-hidden'>
          <div className='px-4 py-3 border-b flex items-center justify-between' style={{ borderColor: 'var(--border-subtle)' }}>
            <span className='section-label'>Recent Jobs</span>
            {pending.length > 0 && (
              <span className='text-[10px] px-2 py-0.5 rounded-full' style={{ background: 'rgba(0,217,255,.1)', color: '#00d9ff' }}>
                {pending.length} processing
              </span>
            )}
          </div>
          <table className='w-full text-xs'>
            <thead style={{ background: 'var(--bg-elevated)' }}>
              <tr>
                {['Filename', 'Original Size', 'Result', 'Processed'].map(h => (
                  <th key={h} className='px-4 py-2.5 text-left font-medium' style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className='border-b hover:bg-white/[0.02] transition-colors' style={{ borderColor: 'var(--border-subtle)' }}>
                  <td className='px-4 py-2.5 font-medium' style={{ color: 'var(--text-primary)' }}>{job.name}</td>
                  <td className='px-4 py-2.5 font-mono' style={{ color: 'var(--text-muted)' }}>{job.original}</td>
                  <td className='px-4 py-2.5'>
                    {job.result === 'pending'
                      ? <span className='text-[10px] px-1.5 py-0.5 rounded' style={{ background: 'rgba(255,179,71,.1)', color: '#ffb347' }}>Processing</span>
                      : job.result === 'bg_removed'
                        ? <span className='text-[10px] px-1.5 py-0.5 rounded' style={{ background: 'rgba(16,217,138,.1)', color: '#10d98a' }}>BG Removed</span>
                        : <span className='text-[10px] px-1.5 py-0.5 rounded' style={{ background: 'rgba(123,147,255,.1)', color: '#7b93ff' }}>{job.style}</span>
                    }
                  </td>
                  <td className='px-4 py-2.5'>
                    <div className='flex items-center gap-2' style={{ color: 'var(--text-muted)' }}>
                      <span>{job.time}</span>
                      {job.result !== 'pending' && (
                        <button
                          onClick={() => {
                            const content = `Photo Job\nFilename: ${job.name}\nOriginal Size: ${job.original}\nResult: ${job.result === 'bg_removed' ? 'Background Removed' : job.style}\nProcessed: ${job.time}`;
                            const blob = new Blob([content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${job.name.replace(/\.[^.]+$/, '')}-processed.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className='p-1 rounded hover:bg-white/[0.05]' style={{ color: '#00d9ff' }}>
                          <Download size={11} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Video Tools (E-08 text-to-video / E-09 AI editing) ──────────────────────

type VideoJob = { id: string; title: string; type: 'text_to_video' | 'edit'; platform: string; duration: string; status: 'done' | 'rendering' | 'draft'; captions: boolean; time: string };

const VIDEO_JOBS: VideoJob[] = [
  { id: 'vj-1', title: 'Spring Sale — Donut Equipment',       type: 'text_to_video', platform: 'TikTok', duration: '0:30', status: 'done',      captions: true,  time: '12m ago' },
  { id: 'vj-2', title: 'ProFryer-3000 Product Showcase',     type: 'edit',          platform: 'YouTube', duration: '1:45', status: 'done',      captions: true,  time: '1h ago'  },
  { id: 'vj-3', title: 'Behind the Bakery — Maker Story',    type: 'text_to_video', platform: 'YouTube', duration: '2:00', status: 'rendering', captions: false, time: '2m ago'  },
  { id: 'vj-4', title: 'Flash Sale Countdown',                type: 'text_to_video', platform: 'TikTok', duration: '0:15', status: 'done',      captions: true,  time: '3h ago'  },
  { id: 'vj-5', title: 'Wholesale Intro — Bakers B2B',       type: 'edit',          platform: 'LinkedIn', duration: '0:60', status: 'draft',    captions: false, time: '1d ago'  },
];

function VideoToolsPanel() {
  const [videoMode, setVideoMode] = useState<'t2v' | 'edit'>('t2v');
  const [t2vPrompt, setT2vPrompt] = useState('');
  const [t2vPlatform, setT2vPlatform] = useState('TikTok');
  const [t2vLen, setT2vLen] = useState('0:30');
  const [jobs, setJobs] = useState<VideoJob[]>(VIDEO_JOBS);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const createVideo = () => {
    const id = `vj-new-${Date.now()}`;
    const newJob: VideoJob = videoMode === 't2v'
      ? {
          id,
          title: t2vPrompt.trim() ? t2vPrompt.trim().slice(0, 60) : 'Untitled Text-to-Video',
          type: 'text_to_video',
          platform: t2vPlatform,
          duration: t2vLen,
          status: 'rendering',
          captions: true,
          time: 'Just now',
        }
      : {
          id,
          title: 'Uploaded Footage — AI Edit',
          type: 'edit',
          platform: t2vPlatform,
          duration: t2vLen,
          status: 'rendering',
          captions: true,
          time: 'Just now',
        };
    setJobs(prev => [newJob, ...prev]);
    if (videoMode === 't2v') setT2vPrompt('');
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Stats */}
      <div className='grid grid-cols-4 gap-3'>
        {[
          { label: 'Videos Created (30d)', value: '84',   color: '#00d9ff' },
          { label: 'Avg Render Time',       value: '42s',  color: '#10d98a' },
          { label: 'Auto-Captions Added',   value: '71',   color: '#7b93ff' },
          { label: 'Platforms Covered',     value: '4',    color: '#ffb347' },
        ].map(s => (
          <div key={s.label} className='glass-card px-4 py-3'>
            <div className='section-label mb-1'>{s.label}</div>
            <div className='data-value text-xl font-bold' style={{ color: s.color, fontFamily: 'DM Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-3 gap-4'>
        {/* Create panel */}
        <div className='flex flex-col gap-3'>
          <div className='glass-card p-4'>
            <div className='section-label mb-3'>Create Video</div>

            <div className='flex items-center gap-1 p-1 rounded-xl mb-4'
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              {([['t2v', 'Text-to-Video'], ['edit', 'AI Edit Footage']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setVideoMode(k)}
                  className='flex-1 px-2 py-1.5 rounded-lg text-[11px] transition-all'
                  style={{ background: videoMode === k ? 'var(--bg-overlay)' : 'transparent', color: videoMode === k ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: videoMode === k ? 500 : 400 }}>
                  {l}
                </button>
              ))}
            </div>

            {videoMode === 't2v' ? (
              <div className='flex flex-col gap-3'>
                <div>
                  <label className='text-[10px] section-label block mb-1.5'>Script / Prompt</label>
                  <textarea rows={4} value={t2vPrompt} onChange={e => setT2vPrompt(e.target.value)}
                    placeholder='Describe your video: products, mood, messaging…'
                    className='w-full px-3 py-2 rounded-xl text-xs resize-none'
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='text-[10px] section-label block mb-1.5'>Platform</label>
                    <select value={t2vPlatform} onChange={e => setT2vPlatform(e.target.value)}
                      className='w-full px-2 py-1.5 rounded-lg text-xs'
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                      {['TikTok', 'YouTube', 'Instagram', 'LinkedIn'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className='text-[10px] section-label block mb-1.5'>Length</label>
                    <select value={t2vLen} onChange={e => setT2vLen(e.target.value)}
                      className='w-full px-2 py-1.5 rounded-lg text-xs'
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                      {['0:15', '0:30', '0:60', '2:00', '5:00'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <label className='flex items-center gap-2 text-xs cursor-pointer' style={{ color: 'var(--text-secondary)' }}>
                  <Captions size={12} style={{ color: '#7b93ff' }} />
                  Auto-generate captions
                  <input type='checkbox' defaultChecked className='ml-auto' />
                </label>
              </div>
            ) : (
              <div className='flex flex-col gap-3'>
                <div className='rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:bg-white/[0.02] transition-colors'
                  style={{ borderColor: 'var(--border-dim)' }}>
                  <Upload size={18} style={{ color: 'var(--text-muted)' }} />
                  <div className='text-xs text-center' style={{ color: 'var(--text-secondary)' }}>Upload footage<br /><span style={{ color: '#00d9ff' }}>browse files</span></div>
                  <div className='text-[10px]' style={{ color: 'var(--text-muted)' }}>MP4, MOV · max 500 MB</div>
                </div>
                <div className='flex flex-col gap-2'>
                  {[
                    { label: 'Auto-generate transcript', checked: true },
                    { label: 'Add auto-captions', checked: true },
                    { label: 'Remove filler words', checked: false },
                    { label: 'AI scene cut optimization', checked: true },
                  ].map(opt => (
                    <label key={opt.label} className='flex items-center gap-2 text-xs cursor-pointer' style={{ color: 'var(--text-secondary)' }}>
                      <input type='checkbox' defaultChecked={opt.checked} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button onClick={createVideo} className='w-full mt-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2'
              style={{ background: 'rgba(0,217,255,0.1)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.25)' }}>
              {videoMode === 't2v' ? <><Wand2 size={12} />Generate Video</> : <><Scissors size={12} />Process Footage</>}
            </button>
          </div>
        </div>

        {/* Job history */}
        <div className='col-span-2 glass-card overflow-hidden'>
          <div className='px-4 py-3 border-b flex items-center justify-between' style={{ borderColor: 'var(--border-subtle)' }}>
            <span className='section-label'>Recent Videos</span>
            {jobs.filter(j => j.status === 'rendering').length > 0 && (
              <span className='text-[10px] px-2 py-0.5 rounded-full' style={{ background: 'rgba(0,217,255,.1)', color: '#00d9ff' }}>
                {jobs.filter(j => j.status === 'rendering').length} rendering
              </span>
            )}
          </div>
          <table className='w-full text-xs'>
            <thead style={{ background: 'var(--bg-elevated)' }}>
              <tr>
                {['Title', 'Type', 'Platform', 'Duration', 'Status', ''].map(h => (
                  <th key={h} className='px-4 py-2.5 text-left font-medium' style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className='border-b hover:bg-white/[0.02] transition-colors' style={{ borderColor: 'var(--border-subtle)' }}>
                  <td className='px-4 py-2.5 font-medium max-w-[160px] truncate' style={{ color: 'var(--text-primary)' }}>{job.title}</td>
                  <td className='px-4 py-2.5'>
                    <span className='text-[10px] px-1.5 py-0.5 rounded' style={{ background: job.type === 'text_to_video' ? 'rgba(0,217,255,.1)' : 'rgba(123,147,255,.1)', color: job.type === 'text_to_video' ? '#00d9ff' : '#7b93ff' }}>
                      {job.type === 'text_to_video' ? 'Text→Video' : 'AI Edit'}
                    </span>
                  </td>
                  <td className='px-4 py-2.5' style={{ color: 'var(--text-secondary)' }}>{job.platform}</td>
                  <td className='px-4 py-2.5 font-mono' style={{ color: 'var(--text-muted)' }}>{job.duration}</td>
                  <td className='px-4 py-2.5'>
                    {job.status === 'rendering'
                      ? <span className='text-[10px] px-1.5 py-0.5 rounded' style={{ background: 'rgba(255,179,71,.1)', color: '#ffb347' }}>Rendering</span>
                      : job.status === 'done'
                        ? <span className='text-[10px] px-1.5 py-0.5 rounded' style={{ background: 'rgba(16,217,138,.1)', color: '#10d98a' }}>Done</span>
                        : <span className='text-[10px] px-1.5 py-0.5 rounded' style={{ background: 'rgba(123,147,255,.1)', color: '#7b93ff' }}>Draft</span>
                    }
                  </td>
                  <td className='px-4 py-2.5'>
                    {job.status === 'done' && (
                      <div className='flex items-center gap-1.5'>
                        <button
                          onClick={() => { setPlayingId(job.id); setTimeout(() => setPlayingId(null), 1500); }}
                          className='p-1 rounded hover:bg-white/[0.05]'
                          style={{ color: playingId === job.id ? '#10d98a' : '#00d9ff' }}>
                          <Play size={11} />
                        </button>
                        <button
                          onClick={() => {
                            const content = `Video\nTitle: ${job.title}\nType: ${job.type === 'text_to_video' ? 'Text-to-Video' : 'AI Edit'}\nPlatform: ${job.platform}\nDuration: ${job.duration}\nCaptions: ${job.captions ? 'Yes' : 'No'}\nCreated: ${job.time}`;
                            const blob = new Blob([content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${job.title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className='p-1 rounded hover:bg-white/[0.05]' style={{ color: '#7b93ff' }}>
                          <Download size={11} />
                        </button>
                        {job.captions && <Captions size={11} style={{ color: '#10d98a' }} />}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>('creative');

  const kpiCards: KpiCard[] = [
    {
      label: 'Creatives Generated (30d)',
      value: CONTENT_STATS.creativesGenerated30d.toLocaleString(),
      color: '#00d9ff',
      delta: 12.4,
      deltaLabel: 'vs prior 30d',
    },
    {
      label: 'Avg Performance Score',
      value: `${CONTENT_STATS.avgPerformanceScore}/100`,
      color: '#10d98a',
      delta: 3.1,
      deltaLabel: 'vs prior 30d',
    },
    {
      label: 'Templates Used',
      value: CONTENT_STATS.templatesUsed.toLocaleString(),
      color: '#7b93ff',
      delta: 8.0,
      deltaLabel: 'this month',
    },
    {
      label: 'Campaigns Generated',
      value: CONTENT_STATS.campaignBriefs.toString(),
      color: '#ffb347',
      delta: 5.0,
      deltaLabel: 'this month',
    },
  ];

  return (
    <div className='flex h-screen overflow-hidden' style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className='flex flex-col flex-1 min-w-0 overflow-hidden'>
        <TopBar
          title='AI Content'
          subtitle='15 modules'
          breadcrumbs={['MarketOS', 'Content']}
        />

        <main className='flex-1 overflow-y-auto p-5'>

          {/* KPI Stats */}
          <div className='grid grid-cols-4 gap-3 mb-5'>
            {kpiCards.map(card => {
              const positive = card.delta >= 0;
              return (
                <div key={card.label} className='glass-card px-4 py-3.5 relative overflow-hidden'>
                  <div
                    className='absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none'
                    style={{ background: card.color, opacity: 0.06, transform: 'translate(40%, -40%)' }}
                  />
                  <div className='section-label mb-2'>{card.label}</div>
                  <div
                    className='font-bold text-2xl mb-2 leading-none'
                    style={{ fontFamily: 'DM Mono', color: card.color }}
                  >
                    {card.value}
                  </div>
                  <div
                    className='flex items-center gap-1 text-[10px] font-mono'
                    style={{ color: positive ? '#10d98a' : '#ff4444' }}
                  >
                    {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    <span>{positive ? '+' : ''}{card.delta.toFixed(1)}%</span>
                    <span className='ml-1' style={{ color: 'var(--text-muted)' }}>{card.deltaLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tab Navigation — pill container, scrolls horizontally if needed */}
          <div
            className='flex items-center gap-0.5 p-1 mb-5 overflow-x-auto'
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              width: 'fit-content',
              maxWidth: '100%',
            }}
          >
            {TABS.map(t => {
              const Icon   = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className='flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-all whitespace-nowrap shrink-0'
                  style={{
                    borderRadius: 7,
                    background: active ? 'var(--bg-overlay)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: active ? '1px solid var(--border-dim)' : '1px solid transparent',
                    fontWeight: active ? 500 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={12} style={{ color: active ? '#00d9ff' : 'var(--text-muted)' }} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {tab === 'creative'   && <AdCreativeGenerator />}
          {tab === 'copy'       && <CopywritingTool />}
          {tab === 'brand'      && <BrandVoicePanel />}
          {tab === 'templates'  && <TemplateLibrary />}
          {tab === 'brief'      && <CampaignBriefGenerator />}
          {tab === 'scoring'    && <PerformanceScorer />}
          {tab === 'competitor' && <CompetitorAdAnalysis />}
          {tab === 'photos'     && <PhotoStudioPanel />}
          {tab === 'video'      && <VideoToolsPanel />}

        </main>
      </div>
    </div>
  );
}
