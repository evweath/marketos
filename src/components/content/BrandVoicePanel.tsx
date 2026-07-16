'use client';

import { useState, useRef } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { Mic, Plus, X, Upload, Check, BookOpen, RefreshCw } from 'lucide-react';
import { DEFAULT_BRAND_VOICE_SETTINGS as BRAND_VOICE_SETTINGS } from '@/lib/contentData';
import { useStores } from '@/lib/storeScope';

const PERSONALITY_OPTIONS = [
  'Bold', 'Trustworthy', 'Innovative', 'Friendly', 'Expert',
  'Approachable', 'Authoritative', 'Energetic', 'Empathetic', 'Concise',
  'Inspiring', 'Direct',
];

interface TrainingDoc { name: string; size: string; status: string }
interface BrandVoiceState {
  toneValue: number;
  formalityValue: number;
  traits: string[];
  avoidWords: string[];
  useWords: string[];
  exampleCopy: string;
  trainingDocs: TrainingDoc[];
}

const defaultVoice = (): BrandVoiceState => ({
  toneValue: BRAND_VOICE_SETTINGS.toneValue,
  formalityValue: BRAND_VOICE_SETTINGS.formalityValue,
  traits: BRAND_VOICE_SETTINGS.personalityTraits,
  avoidWords: BRAND_VOICE_SETTINGS.wordListAvoid,
  useWords: BRAND_VOICE_SETTINGS.wordListUse,
  exampleCopy: BRAND_VOICE_SETTINGS.exampleCopy,
  trainingDocs: [],
});

export function BrandVoicePanel() {
  const [stores] = useStores();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-store brand voice, all held in one persisted map keyed by store id.
  const [byStore, setByStore] = usePersistentState<Record<string, BrandVoiceState>>('content.brandVoice.byStore', {});
  const [activeStore, setActiveStore] = useState(stores[0]?.id ?? '');
  const storeId = stores.some(s => s.id === activeStore) ? activeStore : (stores[0]?.id ?? '');
  const v = byStore[storeId] ?? defaultVoice();

  const patch = (p: Partial<BrandVoiceState>) =>
    setByStore(prev => ({ ...prev, [storeId]: { ...(prev[storeId] ?? defaultVoice()), ...p } }));

  const toneValue = v.toneValue, formalityValue = v.formalityValue;
  const traits = v.traits, avoidWords = v.avoidWords, useWords = v.useWords;
  const exampleCopy = v.exampleCopy, trainingDocs = v.trainingDocs;
  const setToneValue = (n: number) => patch({ toneValue: n });
  const setFormalityValue = (n: number) => patch({ formalityValue: n });
  const setExampleCopy = (s: string) => patch({ exampleCopy: s });
  const setAvoidWords = (fn: (prev: string[]) => string[]) => patch({ avoidWords: fn(avoidWords) });
  const setUseWords = (fn: (prev: string[]) => string[]) => patch({ useWords: fn(useWords) });
  const setTraits = (fn: (prev: string[]) => string[]) => patch({ traits: fn(traits) });
  const setTrainingDocs = (fn: (prev: TrainingDoc[]) => TrainingDoc[]) => patch({ trainingDocs: fn(trainingDocs) });

  // Tag input state
  const [avoidInput, setAvoidInput] = useState('');
  const [useInput, setUseInput] = useState('');

  const addAvoidWord = () => {
    const w = avoidInput.trim();
    if (w && !avoidWords.includes(w)) setAvoidWords(prev => [...prev, w]);
    setAvoidInput('');
  };

  const addUseWord = () => {
    const w = useInput.trim();
    if (w && !useWords.includes(w)) setUseWords(prev => [...prev, w]);
    setUseInput('');
  };

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const docs = Array.from(files).map(f => ({
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`,
      status: 'Trained',
    }));
    setTrainingDocs(prev => [...prev, ...docs]);
  };

  const toggleTrait = (t: string) => {
    setTraits(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const toneLabel = toneValue < 33 ? 'Professional' : toneValue < 67 ? 'Professional with warmth' : 'Casual';
  const formalLabel = formalityValue < 33 ? 'Formal' : formalityValue < 67 ? 'Balanced' : 'Fun & conversational';

  return (
    <div className="space-y-4">
      {/* Per-store tabs */}
      {stores.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
          {stores.map(s => {
            const active = storeId === s.id;
            return (
              <button key={s.id} onClick={() => { setActiveStore(s.id); setEditing(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-medium transition-all"
                style={{ background: active ? s.color + '20' : 'transparent', color: active ? s.color : 'var(--text-muted)', border: active ? `1px solid ${s.color}40` : '1px solid transparent' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                {s.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Current Brand Voice Display */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mic size={14} style={{ color: '#7b93ff' }} />
            <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Current Brand Voice</span>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[16px]"
                style={{ background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }}>
                <Check size={10} />Saved
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <RefreshCw size={9} />
              {trainingDocs.length > 0 ? `Trained on ${trainingDocs.length} doc${trainingDocs.length === 1 ? '' : 's'}` : 'Not trained yet'}
            </div>
            <button onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 rounded-lg text-[16px] font-medium transition-all"
              style={{
                background: editing ? 'rgba(123,147,255,0.15)' : 'var(--bg-elevated)',
                color: editing ? '#7b93ff' : 'var(--text-secondary)',
                border: `1px solid ${editing ? 'rgba(123,147,255,0.3)' : 'var(--border-dim)'}`,
              }}>
              {editing ? 'Cancel' : 'Edit Brand Voice'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Tone */}
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="section-label mb-2">Tone</div>
            <div className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{toneLabel}</div>
            <div className="h-1 rounded-full mt-2" style={{ background: 'var(--bg-overlay)' }}>
              <div className="h-full rounded-full" style={{ width: `${toneValue}%`, background: 'linear-gradient(to right, #7b93ff, #00d9ff)' }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Professional</span>
              <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Casual</span>
            </div>
          </div>

          {/* Personality Traits */}
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="section-label mb-2">Personality Traits</div>
            <div className="flex flex-wrap gap-1">
              {traits.map(t => (
                <span key={t} className="text-[16px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(123,147,255,0.12)', color: '#7b93ff', border: '1px solid rgba(123,147,255,0.2)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Example Copy */}
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="section-label mb-2">Example Copy</div>
            <p className="text-[16px] leading-relaxed" style={{ color: exampleCopy ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              {exampleCopy || 'No example copy yet — add one below.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="section-label mb-2">Avoid These Words</div>
            <div className="flex flex-wrap gap-1">
              {avoidWords.map(w => (
                <span key={w} className="text-[16px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }}>
                  {w}
                </span>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="section-label mb-2">Preferred Words</div>
            <div className="flex flex-wrap gap-1">
              {useWords.map(w => (
                <span key={w} className="text-[16px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(16,217,138,0.1)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.2)' }}>
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Panel */}
      {editing && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={13} style={{ color: '#7b93ff' }} />
            <span className="section-label">Edit Brand Voice</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tone Slider */}
            <div>
              <label className="section-label block mb-2">
                Tone: <span style={{ color: '#7b93ff' }}>{toneLabel}</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Professional</span>
                <input type="range" min={0} max={100} value={toneValue}
                  onChange={e => setToneValue(Number(e.target.value))}
                  className="flex-1" style={{ accentColor: '#7b93ff' }} />
                <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Casual</span>
              </div>
            </div>

            {/* Formality Slider */}
            <div>
              <label className="section-label block mb-2">
                Formality: <span style={{ color: '#7b93ff' }}>{formalLabel}</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Formal</span>
                <input type="range" min={0} max={100} value={formalityValue}
                  onChange={e => setFormalityValue(Number(e.target.value))}
                  className="flex-1" style={{ accentColor: '#7b93ff' }} />
                <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Fun</span>
              </div>
            </div>
          </div>

          {/* Personality Checkboxes */}
          <div>
            <label className="section-label block mb-2">Personality Traits</label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_OPTIONS.map(opt => {
                const active = traits.includes(opt);
                return (
                  <button key={opt} onClick={() => toggleTrait(opt)}
                    className="px-2.5 py-1 rounded-lg text-[16px] transition-all"
                    style={{
                      background: active ? 'rgba(123,147,255,0.15)' : 'var(--bg-elevated)',
                      color: active ? '#7b93ff' : 'var(--text-muted)',
                      border: `1px solid ${active ? 'rgba(123,147,255,0.3)' : 'var(--border-subtle)'}`,
                    }}>
                    {active && '✓ '}{opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Word Lists */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-2">Words to Avoid</label>
              <div className="flex flex-wrap gap-1 mb-2 min-h-8">
                {avoidWords.map(w => (
                  <span key={w} className="flex items-center gap-1 text-[16px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }}>
                    {w}
                    <button onClick={() => setAvoidWords(prev => prev.filter(x => x !== w))} className="opacity-60 hover:opacity-100">
                      <X size={8} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input value={avoidInput} onChange={e => setAvoidInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAvoidWord()}
                  placeholder="Add word..."
                  className="flex-1 px-2 py-1.5 rounded-lg text-[16px] outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
                />
                <button onClick={addAvoidWord} className="px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}>
                  <Plus size={12} />
                </button>
              </div>
            </div>
            <div>
              <label className="section-label block mb-2">Preferred Words</label>
              <div className="flex flex-wrap gap-1 mb-2 min-h-8">
                {useWords.map(w => (
                  <span key={w} className="flex items-center gap-1 text-[16px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(16,217,138,0.1)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.2)' }}>
                    {w}
                    <button onClick={() => setUseWords(prev => prev.filter(x => x !== w))} className="opacity-60 hover:opacity-100">
                      <X size={8} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input value={useInput} onChange={e => setUseInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addUseWord()}
                  placeholder="Add word..."
                  className="flex-1 px-2 py-1.5 rounded-lg text-[16px] outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
                />
                <button onClick={addUseWord} className="px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}>
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Example Copy */}
          <div>
            <label className="section-label block mb-2">Example Copy</label>
            <textarea value={exampleCopy} onChange={e => setExampleCopy(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-base outline-none resize-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>

          <button onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-base font-semibold transition-all hover:opacity-90"
            style={{ background: '#7b93ff', color: '#0a0e1a' }}>
            Save Brand Voice
          </button>
        </div>
      )}

      {/* Train on Content */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Upload size={13} style={{ color: '#ffb347' }} />
          <span className="section-label">Train on Content</span>
        </div>
        <p className="text-[16px] mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Upload your brand guidelines, style documents, or example copy to fine-tune the AI to your brand voice.
          Supported formats: PDF, DOCX, TXT.
        </p>

        <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt" className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          className="rounded-xl flex flex-col items-center justify-center py-10 transition-all cursor-pointer"
          style={{
            border: `2px dashed ${dragOver ? '#ffb347' : 'var(--border-dim)'}`,
            background: dragOver ? 'rgba(255,179,71,0.04)' : 'var(--bg-elevated)',
          }}>
          <Upload size={20} className="mb-3" style={{ color: dragOver ? '#ffb347' : 'var(--text-muted)' }} />
          <div className="text-base font-medium mb-1" style={{ color: dragOver ? '#ffb347' : 'var(--text-primary)' }}>
            Drop files here to train your brand voice
          </div>
          <div className="text-base mb-3" style={{ color: 'var(--text-muted)' }}>
            PDF, DOCX, or TXT · Up to 50MB per file
          </div>
          <button onClick={() => { setBrowsing(true); fileInputRef.current?.click(); setTimeout(() => setBrowsing(false), 1500); }}
            className="px-4 py-2 rounded-lg text-base font-medium transition-all hover:opacity-90"
            style={{ background: 'rgba(255,179,71,0.12)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.25)' }}>
            {browsing ? 'Opening…' : 'Browse Files'}
          </button>
        </div>

        {trainingDocs.length === 0 ? (
          <div className="text-base text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No documents uploaded yet.
          </div>
        ) : (
        <div className="mt-3 space-y-1.5">
          {trainingDocs.map(doc => (
            <div key={doc.name} className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <BookOpen size={11} style={{ color: 'var(--text-muted)' }} />
                <span className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>{doc.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>{doc.size}</span>
                <span className="text-[16px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(16,217,138,0.1)', color: '#10d98a' }}>
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
