'use client';

import { useState, Fragment } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { usePersistentState } from '@/lib/usePersistentState';
import { formatCurrency, formatMinutesAgo } from '@/lib/mockData';
import { useStores, useStoreScope, resolveStoreId, type StoreRecord } from '@/lib/storeScope';
import { StoreScopeBar } from '@/components/shared/StoreScopeBar';
import {
  SAMPLE_SEQUENCES, SAMPLE_RECOVERED_LIST, SAMPLE_UPSELL_OFFERS, SAMPLE_WATCH_PRODUCTS, SAMPLE_CUSTOMERS,
  computeUpsellStats,
} from '@/lib/cartData';
import type {
  RecoverySequence, SequenceStep, RecoveredCart, UpsellOffer, UpsellType, UpsellStatus,
  WatchProduct, StockStatus, CustomerInsight, ChurnRisk,
} from '@/lib/cartData';
import type { AbandonedCart } from '@/types';
import {
  ShoppingCart, Mail, MessageSquare, Bell, TrendingUp, BarChart2, MapPin,
  MousePointer, Gift, ToggleLeft, ToggleRight, X, ChevronDown, ChevronUp,
  Pencil, Trash2, PauseCircle, PlayCircle, Plus,
  Package, TrendingDown, Users, Star, AlertTriangle, Tag, ChevronRight, CheckCircle, Clock, Award,
} from 'lucide-react';

const c$ = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const CH_COLOR: Record<string, string> = { Email: '#ffb347', SMS: '#10d98a', Push: '#00d9ff' };
const CH_ICON_MAP: Record<string, React.ElementType> = { email: Mail, sms: MessageSquare, push: Bell };
const CH_COL_MAP: Record<string, string> = { email: '#ffb347', sms: '#10d98a', push: '#00d9ff' };

// ─── Exit-Intent Panel ────────────────────────────────────────────────────────

function ExitIntentPanel() {
  // No exit-intent impression/conversion tracking model exists yet — zeroed
  // honestly rather than fabricated until the popup is wired to real events.
  const EI_STATS = { shown: 0, captured: 0, captureRate: 0, recovered: 0, conversionRate: 0, revenue: 0, avgDiscount: '10%' };

  const [enabled, setEnabled]             = usePersistentState('cart.exitIntent.enabled', true);
  const [headline, setHeadline]           = usePersistentState('cart.exitIntent.headline', "Wait! Don't leave yet...");
  const [subheadline, setSubheadline]     = usePersistentState('cart.exitIntent.subheadline', 'Complete your order and save 10%');
  const [offerType, setOfferType]         = usePersistentState<'none' | 'pct' | 'dollar' | 'shipping'>('cart.exitIntent.offerType', 'pct');
  const [discountAmt, setDiscountAmt]     = usePersistentState('cart.exitIntent.discountAmt', 10);
  const [coupon, setCoupon]               = usePersistentState('cart.exitIntent.coupon', 'COMEBACK10');
  const [ctaText, setCtaText]             = usePersistentState('cart.exitIntent.ctaText', 'Claim My Discount');
  const [imageOption, setImageOption]     = usePersistentState<'none' | 'product' | 'banner'>('cart.exitIntent.imageOption', 'none');
  const [triggerType, setTriggerType]     = usePersistentState<'mouse' | 'idle' | 'scrollup' | 'exitbtn'>('cart.exitIntent.triggerType', 'mouse');
  const [delaySeconds, setDelaySeconds]   = usePersistentState('cart.exitIntent.delaySeconds', 2);
  const [pageTypes, setPageTypes]         = usePersistentState('cart.exitIntent.pageTypes', { product: true, cart: true, checkout: false });
  const [freqCap, setFreqCap]             = usePersistentState('cart.exitIntent.freqCap', 7);
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); }, 1500);
    setTimeout(() => setSaved(false), 3500);
  };

  const discountLabel = offerType === 'pct' ? `${discountAmt}% OFF`
    : offerType === 'dollar' ? `$${discountAmt} OFF`
    : offerType === 'shipping' ? 'FREE SHIPPING'
    : null;

  const togglePage = (k: keyof typeof pageTypes) =>
    setPageTypes(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-4">
      {/* Top row: config + preview */}
      <div className="grid grid-cols-2 gap-4">

        {/* Left: Config */}
        <div className="glass-card p-4 space-y-5">
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Popup Configuration</div>

          {/* Enable toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Exit-Intent Popup</div>
              <div className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Show popup when visitors attempt to leave</div>
            </div>
            <button onClick={() => setEnabled(e => !e)} className="flex items-center gap-1.5 text-base font-medium transition-colors"
              style={{ color: enabled ? '#10d98a' : 'var(--text-muted)' }}>
              {enabled ? <ToggleRight size={24} style={{ color: '#10d98a' }} /> : <ToggleLeft size={24} />}
              {enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Popup Settings */}
          <div className="space-y-3">
            <div className="section-label">Popup Settings</div>

            <div className="space-y-2">
              <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Headline</label>
              <input value={headline} onChange={e => setHeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>

            <div className="space-y-2">
              <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Subheadline</label>
              <input value={subheadline} onChange={e => setSubheadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Offer Type</label>
                <select value={offerType} onChange={e => setOfferType(e.target.value as typeof offerType)}
                  className="w-full px-2 py-2 rounded-lg text-base outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <option value="none">No Discount</option>
                  <option value="pct">% Off</option>
                  <option value="dollar">$ Off</option>
                  <option value="shipping">Free Shipping</option>
                </select>
              </div>
              {(offerType === 'pct' || offerType === 'dollar') && (
                <div className="space-y-1">
                  <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>
                    {offerType === 'pct' ? 'Percent Off' : 'Dollar Off'}
                  </label>
                  <input type="number" value={discountAmt} onChange={e => setDiscountAmt(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-lg text-base outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Coupon Code</label>
              <input value={coupon} onChange={e => setCoupon(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-base font-mono outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--cyan)' }} />
            </div>

            <div className="space-y-2">
              <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>CTA Button Text</label>
              <input value={ctaText} onChange={e => setCtaText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>

            <div className="space-y-1">
              <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Image / Graphic</label>
              <select value={imageOption} onChange={e => setImageOption(e.target.value as typeof imageOption)}
                className="w-full px-2 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                <option value="none">None</option>
                <option value="product">Product Image</option>
                <option value="banner">Branded Banner</option>
              </select>
            </div>
          </div>

          {/* Trigger Settings */}
          <div className="space-y-3">
            <div className="section-label">Trigger Settings</div>

            <div className="space-y-1">
              <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Trigger Type</label>
              <select value={triggerType} onChange={e => setTriggerType(e.target.value as typeof triggerType)}
                className="w-full px-2 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                <option value="mouse">Mouse leaves viewport</option>
                <option value="idle">Idle &gt; 30s</option>
                <option value="scrollup">Scroll up</option>
                <option value="exitbtn">Exit button click</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Show after delay</label>
                <span className="text-[16px] font-mono" style={{ color: 'var(--cyan)' }}>{delaySeconds}s</span>
              </div>
              <input type="range" min={0} max={30} value={delaySeconds} onChange={e => setDelaySeconds(Number(e.target.value))}
                className="w-full" style={{ accentColor: '#00d9ff' }} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Show on page types</label>
              {([['product', 'Product pages'], ['cart', 'Cart page'], ['checkout', 'Checkout page']] as const).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pageTypes[k]} onChange={() => togglePage(k)}
                    style={{ accentColor: '#00d9ff' }} />
                  <span className="text-base" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Frequency cap — don't show again for</label>
              <select value={freqCap} onChange={e => setFreqCap(Number(e.target.value))}
                className="w-full px-2 py-2 rounded-lg text-base outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                {[1, 3, 7, 14, 30].map(d => <option key={d} value={d}>{d} day{d !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSave}
            className="w-full py-2 rounded-xl text-base font-semibold transition-all"
            style={{
              background: saved ? 'rgba(16,217,138,0.15)' : 'rgba(0,217,255,0.12)',
              color: saved ? '#10d98a' : 'var(--cyan)',
              border: `1px solid ${saved ? 'rgba(16,217,138,0.3)' : 'rgba(0,217,255,0.25)'}`,
            }}>
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>

        {/* Right: Preview */}
        <div className="glass-card p-4 flex flex-col">
          <div className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Live Preview</div>

          {/* Browser mockup */}
          <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ background: '#0a0e1a', border: '1px solid var(--border-dim)' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2 shrink-0" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff4444' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffb347' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10d98a' }} />
              <div className="flex-1 mx-3 h-4 rounded text-[16px] flex items-center px-2" style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
                yourstore.com/cart
              </div>
            </div>

            {/* Page dimmed background with popup */}
            <div className="flex-1 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}>
                {/* Popup header accent */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #00d9ff, #7b93ff)' }} />
                <div className="p-5 space-y-3 relative">
                  {/* Close */}
                  <button className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                    <X size={10} />
                  </button>
                  {/* Headline */}
                  <div className="text-base font-bold leading-snug pr-6" style={{ color: 'var(--text-primary)' }}>
                    {headline || 'Your headline here'}
                  </div>
                  {/* Subheadline */}
                  <div className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>
                    {subheadline || 'Your subheadline here'}
                  </div>
                  {/* Discount */}
                  {discountLabel && (
                    <div className="text-center py-2">
                      <span className="text-2xl font-black" style={{ color: 'var(--cyan)' }}>{discountLabel}</span>
                    </div>
                  )}
                  {/* Coupon */}
                  {coupon && (
                    <div className="text-center">
                      <span className="px-3 py-1 rounded-lg text-base font-mono font-bold tracking-widest"
                        style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px dashed rgba(0,217,255,0.4)' }}>
                        {coupon}
                      </span>
                    </div>
                  )}
                  {/* CTA */}
                  <button className="w-full py-2 rounded-xl text-base font-bold"
                    style={{ background: '#00d9ff', color: '#0a0e1a' }}>
                    {ctaText || 'Claim Discount'}
                  </button>
                  {/* No thanks */}
                  <div className="text-center text-[16px]" style={{ color: 'var(--text-muted)' }}>
                    No thanks, I'll pay full price
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[16px]" style={{ color: 'var(--text-muted)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10d98a' }} />
            Preview updates live as you edit settings
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card p-4">
        <div className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Exit-Intent Performance <span className="section-label font-normal ml-1">(30d)</span></div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Popups Shown',        value: EI_STATS.shown.toLocaleString(),      color: '#7b93ff' },
            { label: 'Emails Captured',     value: EI_STATS.captured.toLocaleString(),   color: 'var(--cyan)' },
            { label: 'Capture Rate',        value: EI_STATS.captureRate + '%',           color: 'var(--cyan)' },
            { label: 'Converted to Purchase', value: EI_STATS.recovered.toLocaleString(), color: '#10d98a' },
            { label: 'Revenue Recovered',   value: c$(EI_STATS.revenue),                 color: '#10d98a' },
          ].map(st => (
            <div key={st.label} className="rounded-xl px-4 py-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="section-label mb-1.5">{st.label}</div>
              <div className="data-value text-lg font-bold" style={{ color: st.color }}>{st.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* A/B Testing */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>A/B Testing</div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
            <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>No test running yet</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              variant: 'A', label: 'Control', headline: '"Wait! Don\'t leave yet..."',
              offer: '10% off', traffic: '0%', conv: '0%', winner: false,
            },
            {
              variant: 'B', label: 'Challenger', headline: '"Your cart is waiting..."',
              offer: 'Free shipping', traffic: '0%', conv: '0%', winner: false,
            },
          ].map(v => (
            <div key={v.variant} className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: `1px solid ${v.winner ? 'rgba(16,217,138,0.3)' : 'var(--border-subtle)'}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold px-2 py-0.5 rounded font-mono"
                    style={{ background: 'rgba(123,147,255,0.15)', color: '#7b93ff' }}>
                    Variant {v.variant}
                  </span>
                  <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>{v.label}</span>
                </div>
                {v.winner && (
                  <span className="text-[16px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(16,217,138,0.15)', color: '#10d98a' }}>
                    Winner
                  </span>
                )}
              </div>
              <div className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{v.headline}</div>
              <div className="text-[16px] mb-3" style={{ color: 'var(--text-muted)' }}>Offer: {v.offer}</div>
              <div className="grid grid-cols-2 gap-2">
                {[['Traffic', v.traffic, '#7b93ff'], ['Conv Rate', v.conv, '#10d98a']].map(([lbl, val, col]) => (
                  <div key={lbl as string}>
                    <div className="section-label mb-0.5">{lbl as string}</div>
                    <div className="text-base font-bold" style={{ color: col as string }}>{val as string}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Upsell Panel ─────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<UpsellType, string> = { 'upsell': '#00d9ff', 'cross-sell': '#7b93ff', 'bundle': '#ffb347' };

function UpsellPanel() {
  const [offers, setOffers] = usePersistentState<UpsellOffer[]>('cart.upsellOffers', []);
  const UPSELL_STATS = computeUpsellStats(offers);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [addOpen, setAddOpen]           = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);

  // New offer form state
  const [newName, setNewName]             = useState('');
  const [newType, setNewType]             = useState<UpsellType>('upsell');
  const [newTrigger, setNewTrigger]       = useState<'after' | 'first' | 'specific' | 'value'>('after');
  const [newProduct, setNewProduct]       = useState('');
  const [newOriginal, setNewOriginal]     = useState('');
  const [newDiscounted, setNewDiscounted] = useState('');
  const [newTiming, setNewTiming]         = useState<'immediate' | 'email' | 'followup'>('immediate');

  const toggleStatus = (id: string) =>
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: o.status === 'active' ? 'paused' : 'active' } : o));

  const confirmDelete = (id: string) => {
    if (deletingId === id) {
      setOffers(prev => prev.filter(o => o.id !== id));
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  const resetForm = () => {
    setNewName(''); setNewType('upsell'); setNewTrigger('after'); setNewProduct('');
    setNewOriginal(''); setNewDiscounted(''); setNewTiming('immediate');
  };

  const startEdit = (offer: UpsellOffer) => {
    setEditingId(offer.id);
    setNewName(offer.name);
    setNewType(offer.type);
    setNewTrigger(offer.trigger.startsWith('First') ? 'first' : offer.trigger.startsWith('Specific') ? 'specific' : offer.trigger.startsWith('Order value') ? 'value' : 'after');
    setNewProduct(offer.offerProduct);
    setNewOriginal(String(offer.originalPrice));
    setNewDiscounted(String(offer.offerPrice));
    setAddOpen(true);
  };

  const handleCreate = () => {
    if (!newName.trim() || !newProduct.trim()) return;
    const trigger = newTrigger === 'after' ? 'After purchase' : newTrigger === 'first' ? 'First purchase' : newTrigger === 'specific' ? 'Specific product purchased' : 'Order value > $X';
    const discount = newOriginal && newDiscounted ? `${Math.round((1 - Number(newDiscounted) / Number(newOriginal)) * 100)}% off` : '—';
    if (editingId) {
      setOffers(prev => prev.map(o => o.id === editingId ? {
        ...o, name: newName, type: newType, trigger, offerProduct: newProduct,
        originalPrice: Number(newOriginal) || 0, offerPrice: Number(newDiscounted) || 0, discount,
      } : o));
      setEditingId(null);
    } else {
      const offer: UpsellOffer = {
        id: `u-${Date.now()}`,
        name: newName,
        type: newType,
        trigger,
        offerProduct: newProduct,
        originalPrice: Number(newOriginal) || 0,
        offerPrice: Number(newDiscounted) || 0,
        discount,
        acceptRate: 0,
        revenue30d: 0,
        status: 'active',
      };
      setOffers(prev => [offer, ...prev]);
    }
    setAddOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-4">
      {/* Stats header */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Upsell Revenue (30d)', value: c$(UPSELL_STATS.upsellRevenue30d), color: '#10d98a' },
          { label: 'Acceptance Rate',     value: UPSELL_STATS.acceptanceRate + '%',  color: 'var(--cyan)' },
          { label: 'Avg Upsell Value',    value: c$(UPSELL_STATS.avgUpsellValue),    color: '#ffb347' },
          { label: 'Total Offers Sent',   value: UPSELL_STATS.totalOffers.toLocaleString(), color: '#7b93ff' },
        ].map(st => (
          <div key={st.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1.5">{st.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Offers list */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Active Upsell Offers</div>
          <button onClick={() => { setAddOpen(o => !o); setEditingId(null); resetForm(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-medium transition-all"
            style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
            <Plus size={12} />Add Offer
            {addOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>

        {/* Add offer form */}
        {addOpen && (
          <div className="mb-4 p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
            <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit Upsell Offer' : 'New Upsell Offer'}</div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Offer Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Pro Bundle Upgrade"
                  className="w-full px-3 py-2 rounded-lg text-base outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
              <div className="space-y-1">
                <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value as UpsellType)}
                  className="w-full px-2 py-2 rounded-lg text-base outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <option value="upsell">Upsell</option>
                  <option value="cross-sell">Cross-sell</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Trigger Event</label>
                <select value={newTrigger} onChange={e => setNewTrigger(e.target.value as typeof newTrigger)}
                  className="w-full px-2 py-2 rounded-lg text-base outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <option value="after">After purchase</option>
                  <option value="first">First purchase</option>
                  <option value="specific">Specific product purchased</option>
                  <option value="value">Order value &gt; $X</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Product to Offer</label>
                <input value={newProduct} onChange={e => setNewProduct(e.target.value)} placeholder="Product name"
                  className="w-full px-3 py-2 rounded-lg text-base outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Original Price ($)</label>
                <input type="number" value={newOriginal} onChange={e => setNewOriginal(e.target.value)} placeholder="0"
                  className="w-full px-3 py-2 rounded-lg text-base outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
              <div className="space-y-1">
                <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Discounted Price ($)</label>
                <input type="number" value={newDiscounted} onChange={e => setNewDiscounted(e.target.value)} placeholder="0"
                  className="w-full px-3 py-2 rounded-lg text-base outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
              <div className="space-y-1">
                <label className="text-[16px]" style={{ color: 'var(--text-muted)' }}>Display Timing</label>
                <select value={newTiming} onChange={e => setNewTiming(e.target.value as typeof newTiming)}
                  className="w-full px-2 py-2 rounded-lg text-base outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <option value="immediate">Immediately on confirmation</option>
                  <option value="email">Post-purchase email</option>
                  <option value="followup">24h follow-up</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => { setAddOpen(false); setEditingId(null); resetForm(); }}
                className="px-4 py-1.5 rounded-lg text-base"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                Cancel
              </button>
              <button onClick={handleCreate}
                className="px-4 py-1.5 rounded-lg text-base font-semibold"
                style={{ background: '#00d9ff', color: '#0a0e1a' }}>
                {editingId ? 'Save Offer' : 'Create Offer'}
              </button>
            </div>
          </div>
        )}

        {/* Offer cards */}
        {offers.length === 0 && (
          <div className="text-base text-center py-6" style={{ color: 'var(--text-muted)' }}>
            No upsell offers yet — click Add Offer to create one.
          </div>
        )}
        <div className="space-y-3">
          {offers.map(offer => {
            const typeColor = TYPE_COLOR[offer.type];
            const isDeleting = deletingId === offer.id;
            return (
              <div key={offer.id} className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[16px] px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{ background: typeColor + '18', color: typeColor }}>
                        {offer.type}
                      </span>
                      <span className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{offer.name}</span>
                    </div>
                    <div className="text-[16px] mb-1.5" style={{ color: 'var(--text-muted)' }}>{offer.trigger}</div>
                    <div className="text-[16px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{offer.offerProduct}</div>

                    {/* Pricing */}
                    <div className="flex items-center gap-2">
                      <span className="text-base line-through" style={{ color: 'var(--text-muted)' }}>{c$(offer.originalPrice)}</span>
                      <span className="text-base font-bold" style={{ color: '#10d98a' }}>{c$(offer.offerPrice)}</span>
                      <span className="text-[16px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: 'rgba(16,217,138,0.12)', color: '#10d98a' }}>
                        {offer.discount}
                      </span>
                    </div>
                  </div>

                  {/* Metrics + controls */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Status */}
                    <span className="text-[16px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: offer.status === 'active' ? 'rgba(16,217,138,0.12)' : 'rgba(255,179,71,0.12)',
                        color: offer.status === 'active' ? '#10d98a' : '#ffb347',
                      }}>
                      {offer.status === 'active' ? 'Active' : 'Paused'}
                    </span>

                    {/* Metrics */}
                    <div className="text-right space-y-0.5">
                      <div className="text-[16px]"><span style={{ color: 'var(--text-muted)' }}>Accept Rate </span><span className="font-mono font-semibold" style={{ color: 'var(--cyan)' }}>{offer.acceptRate}%</span></div>
                      <div className="text-[16px]"><span style={{ color: 'var(--text-muted)' }}>Revenue (30d) </span><span className="font-mono font-semibold" style={{ color: '#10d98a' }}>{c$(offer.revenue30d)}</span></div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => startEdit(offer)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(123,147,255,0.1)', color: '#7b93ff', border: '1px solid rgba(123,147,255,0.2)' }}>
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => toggleStatus(offer.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{
                          background: offer.status === 'active' ? 'rgba(255,179,71,0.1)' : 'rgba(16,217,138,0.1)',
                          color: offer.status === 'active' ? '#ffb347' : '#10d98a',
                          border: `1px solid ${offer.status === 'active' ? 'rgba(255,179,71,0.2)' : 'rgba(16,217,138,0.2)'}`,
                        }}>
                        {offer.status === 'active' ? <PauseCircle size={11} /> : <PlayCircle size={11} />}
                      </button>
                      <button onClick={() => confirmDelete(offer.id)}
                        className="px-2 py-1.5 rounded-lg text-[16px] font-medium transition-all"
                        style={{
                          background: isDeleting ? 'rgba(255,68,68,0.15)' : 'rgba(255,68,68,0.08)',
                          color: '#ff4444',
                          border: `1px solid ${isDeleting ? 'rgba(255,68,68,0.4)' : 'rgba(255,68,68,0.15)'}`,
                        }}>
                        {isDeleting ? 'Confirm?' : <Trash2 size={11} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Watchlists (Back-in-Stock + Price Drops) ─────────────────────────────────

const STOCK_CONFIG: Record<StockStatus, { label: string; color: string }> = {
  out_of_stock: { label: 'Out of Stock', color: '#ff4444' },
  low_stock:    { label: 'Low Stock',    color: '#ffb347' },
  in_stock:     { label: 'In Stock',     color: '#10d98a' },
};

function WatchlistsPanel({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [allProducts, setProducts] = usePersistentState<WatchProduct[]>('cart.watchlists', []);
  const [filter, setFilter] = useState<StockStatus | 'all'>('all');

  const notify = (id: string) => {
    setProducts(prev => prev.map(p => p.id !== id ? p : { ...p, notificationsSent: p.notificationsSent + p.watcherCount }));
  };

  const products = allProducts.filter(p => selectedStoreIds.includes(resolveStoreId(p.store, stores) ?? ''));
  const visible = filter === 'all' ? products : products.filter(p => p.stockStatus === filter);
  const totalWatchers = products.reduce((s, p) => s + p.watcherCount, 0);
  const outOfStock    = products.filter(p => p.stockStatus === 'out_of_stock');
  const priceDrop     = products.filter(p => p.originalPrice && p.currentPrice < p.originalPrice);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Watchers',     value: totalWatchers.toString(),           color: 'var(--cyan)' },
          { label: 'Out of Stock',        value: outOfStock.length.toString(),       color: '#ff4444' },
          { label: 'Price Drop Alerts',   value: priceDrop.length.toString(),        color: '#10d98a' },
          { label: 'Notifications Sent',  value: products.reduce((s, p) => s + p.notificationsSent, 0).toString(), color: '#7b93ff' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {outOfStock.length > 0 && (
        <div className="rounded-xl p-3 flex items-center gap-2 text-base" style={{ background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.25)' }}>
          <AlertTriangle size={13} style={{ color: '#ff4444', flexShrink: 0 }} />
          <span style={{ color: '#ff4444' }}>
            {outOfStock.reduce((s, p) => s + p.watcherCount, 0)} customers are waiting for back-in-stock alerts — notify them when items restock to recover revenue.
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Watchlist Products</span>
        <div className="flex gap-1 p-1 rounded-lg ml-auto" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {(['all', 'out_of_stock', 'low_stock', 'in_stock'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-2.5 py-1 rounded-md text-[16px] capitalize transition-all"
              style={{ background: filter === s ? 'var(--bg-elevated)' : 'transparent', color: filter === s ? 'var(--text-primary)' : 'var(--text-muted)', border: filter === s ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-base">
          <thead style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              {['Product', 'Store', 'Price', 'Target / Drop', 'Status', 'Watchers', 'Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-base" style={{ color: 'var(--text-muted)' }}>
                  No watched products yet for the selected store{selectedStoreIds.length !== 1 ? 's' : ''}.
                </td>
              </tr>
            )}
            {visible.map(p => {
              const sc = STOCK_CONFIG[p.stockStatus];
              const isPriceDrop = p.originalPrice && p.currentPrice < p.originalPrice;
              const savings = isPriceDrop ? ((1 - p.currentPrice / p.originalPrice!) * 100).toFixed(0) : null;
              return (
                <tr key={p.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className="px-3 py-2.5 max-w-[180px]">
                    <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                    <div className="section-label text-[16px]">{p.sku}</div>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{p.store}</td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: 'var(--text-primary)' }}>${p.currentPrice.toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    {isPriceDrop ? (
                      <span className="flex items-center gap-1 text-base font-medium" style={{ color: '#10d98a' }}>
                        <Tag size={10} /> -{savings}% (was ${p.originalPrice?.toLocaleString()})
                      </span>
                    ) : p.targetPrice ? (
                      <span className="section-label">Target: ${p.targetPrice.toLocaleString()}</span>
                    ) : <span className="section-label">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[16px] px-1.5 py-0.5 rounded-full font-medium" style={{ color: sc.color, background: `${sc.color}18` }}>{sc.label}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                      <Users size={11} /> {p.watcherCount}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {p.notificationsSent > 0 ? (
                      <span className="text-[16px]" style={{ color: '#10d98a' }}>✓ {p.notificationsSent} notified</span>
                    ) : (
                      <button onClick={() => notify(p.id)} disabled={p.stockStatus === 'out_of_stock'}
                        className="text-[16px] px-2 py-1 rounded-lg font-medium disabled:opacity-40"
                        style={{ color: '#7b93ff', background: 'rgba(123,147,255,.1)' }}>
                        {p.stockStatus === 'out_of_stock' ? 'Awaiting Stock' : 'Send Alert'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Customer Insights (CLV + Churn) ──────────────────────────────────────────

const CHURN_CONFIG: Record<ChurnRisk, { label: string; color: string }> = {
  high:   { label: 'High Risk',   color: '#ff4444' },
  medium: { label: 'Medium Risk', color: '#ffb347' },
  low:    { label: 'Low Risk',    color: '#10d98a' },
};

function CustomerInsightsPanel({ selectedStoreIds }: { selectedStoreIds: string[] }) {
  const [stores] = useStores();
  const [allCustomers] = usePersistentState<CustomerInsight[]>('cart.customers', []);
  const [sort, setSort] = useState<'clv' | 'churn' | 'days'>('clv');
  const [churnFilter, setChurnFilter] = useState<ChurnRisk | 'all'>('all');

  const CUSTOMERS = allCustomers.filter(c => selectedStoreIds.includes(resolveStoreId(c.store, stores) ?? ''));
  const totalClv     = CUSTOMERS.reduce((s, c) => s + c.clv, 0);
  const avgRepeat    = CUSTOMERS.length > 0 ? (CUSTOMERS.reduce((s, c) => s + c.repeatRate, 0) / CUSTOMERS.length).toFixed(1) : '0.0';
  const highRisk     = CUSTOMERS.filter(c => c.churnRisk === 'high').length;
  const avgClv       = CUSTOMERS.length > 0 ? Math.round(totalClv / CUSTOMERS.length) : 0;

  const visible = (churnFilter === 'all' ? CUSTOMERS : CUSTOMERS.filter(c => c.churnRisk === churnFilter))
    .slice().sort((a, b) => {
      if (sort === 'clv')   return b.clv - a.clv;
      if (sort === 'days')  return b.lastOrderDays - a.lastOrderDays;
      const cr: Record<ChurnRisk, number> = { high: 2, medium: 1, low: 0 };
      return cr[b.churnRisk] - cr[a.churnRisk];
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Customer CLV',   value: c$(totalClv),                color: 'var(--cyan)' },
          { label: 'Avg CLV per Customer', value: c$(avgClv),                  color: '#7b93ff' },
          { label: 'Avg Repeat Rate',       value: avgRepeat + '%',             color: '#10d98a' },
          { label: 'High Churn Risk',       value: highRisk.toString(),         color: '#ff4444' },
        ].map(s => (
          <div key={s.label} className="glass-card px-4 py-3">
            <div className="section-label mb-1">{s.label}</div>
            <div className="data-value text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {highRisk > 0 && (
        <div className="rounded-xl p-3 flex items-center gap-2 text-base" style={{ background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.25)' }}>
          <AlertTriangle size={13} style={{ color: '#ff4444', flexShrink: 0 }} />
          <span style={{ color: '#ff4444' }}>{highRisk} high-churn-risk customers haven't ordered in 60+ days — consider a win-back campaign via Email/SMS.</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Customer CLV & Churn Risk</span>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button key={f} onClick={() => setChurnFilter(f)}
              className="px-2.5 py-1 rounded-md text-[16px] capitalize transition-all"
              style={{ background: churnFilter === f ? 'var(--bg-elevated)' : 'transparent', color: churnFilter === f ? 'var(--text-primary)' : 'var(--text-muted)', border: churnFilter === f ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
              {f === 'all' ? 'All' : f + ' risk'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-lg ml-auto" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {([['clv', 'CLV'], ['churn', 'Risk'], ['days', 'Days Since Order']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSort(key)}
              className="px-2.5 py-1 rounded-md text-[16px] transition-all"
              style={{ background: sort === key ? 'var(--bg-elevated)' : 'transparent', color: sort === key ? 'var(--text-primary)' : 'var(--text-muted)', border: sort === key ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-base">
          <thead style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              {['Customer', 'Store', 'CLV', 'Orders', 'Avg Order', 'Last Order', 'Repeat Rate', 'Churn Risk', 'Next Order'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-base" style={{ color: 'var(--text-muted)' }}>
                  No customer data yet for the selected store{selectedStoreIds.length !== 1 ? 's' : ''}.
                </td>
              </tr>
            )}
            {visible.map(c => {
              const cc = CHURN_CONFIG[c.churnRisk];
              return (
                <tr key={c.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className="px-3 py-2.5">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                    <div className="section-label text-[16px]">{c.email}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[16px]" style={{ color: 'var(--text-muted)' }}>{c.store}</td>
                  <td className="px-3 py-2.5 font-bold" style={{ color: 'var(--cyan)' }}>{c$(c.clv)}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--text-secondary)' }}>{c.totalOrders}</td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--text-secondary)' }}>{c$(c.avgOrderValue)}</td>
                  <td className="px-3 py-2.5" style={{ color: c.lastOrderDays > 60 ? '#ff4444' : c.lastOrderDays > 30 ? '#ffb347' : 'var(--text-secondary)' }}>
                    {c.lastOrderDays}d ago
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--bg-overlay)' }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${c.repeatRate}%`, background: c.repeatRate >= 70 ? '#10d98a' : c.repeatRate >= 40 ? '#ffb347' : '#ff4444' }} />
                      </div>
                      <span style={{ color: 'var(--text-secondary)' }}>{c.repeatRate}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[16px] px-1.5 py-0.5 rounded-full font-medium" style={{ color: cc.color, background: `${cc.color}18` }}>{cc.label}</span>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: c.predictedNextOrder ? '#7b93ff' : 'var(--text-muted)' }}>
                    {c.predictedNextOrder ? `~${c.predictedNextOrder}d` : <span style={{ color: '#ff4444' }}>At risk</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Recovery Sequence Builder ──────────────────────────────────────────────

function SequenceBuilderModal({ stores, onClose, onCreate }: {
  stores: StoreRecord[];
  onClose: () => void;
  onCreate: (seq: RecoverySequence) => void;
}) {
  const [name, setName] = useState('');
  const [store, setStore] = useState('All Stores');
  const [steps, setSteps] = useState<SequenceStep[]>([
    { channel: 'email', delay: '1h', subject: '', openRate: 0, clickRate: 0, convRate: 0 },
  ]);

  const inputStyle = { background: 'var(--bg-base)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' } as const;

  const updateStep = (i: number, patch: Partial<SequenceStep>) =>
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  const addStep = () => setSteps(prev => [...prev, { channel: 'email', delay: '24h', subject: '', openRate: 0, clickRate: 0, convRate: 0 }]);
  const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i));

  const canCreate = name.trim() !== '' && steps.length > 0 && steps.every(s => s.subject.trim() !== '');

  const create = () => {
    if (!canCreate) return;
    onCreate({ id: `seq-${Date.now()}`, name: name.trim(), store, steps, recovered30d: 0, revenue30d: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="rounded-2xl w-[620px] max-w-[92vw] flex flex-col max-h-[88vh]" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>New Recovery Sequence</div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-1.5">Sequence Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 3-Step Cart Recovery"
                className="w-full px-3 py-2 rounded-lg text-base outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="section-label block mb-1.5">Store</label>
              <select value={store} onChange={e => setStore(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-base outline-none" style={inputStyle}>
                <option value="All Stores">All Stores</option>
                {stores.map(s => <option key={s.id} value={s.domain}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="section-label">Steps</span>
              <button onClick={addStep} className="flex items-center gap-1 text-[16px] px-2 py-1 rounded-lg" style={{ color: 'var(--cyan)', background: 'rgba(0,217,255,0.08)' }}>
                <Plus size={11} />Add Step
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {steps.map((step, i) => {
                const color = CH_COL_MAP[step.channel];
                return (
                  <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: `1px solid ${color}25` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[16px] font-mono w-6 shrink-0" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                      <select value={step.channel} onChange={e => updateStep(i, { channel: e.target.value as 'email' | 'sms' })}
                        className="px-2 py-1 rounded-lg text-[16px] outline-none" style={inputStyle}>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-[16px]" style={{ color: 'var(--text-muted)' }}>delay</span>
                        <input value={step.delay} onChange={e => updateStep(i, { delay: e.target.value })} placeholder="1h"
                          className="w-16 px-2 py-1 rounded-lg text-[16px] outline-none font-mono" style={inputStyle} />
                      </div>
                      {steps.length > 1 && (
                        <button onClick={() => removeStep(i)} className="ml-auto p-1 rounded" style={{ color: '#ff4444' }}><Trash2 size={12} /></button>
                      )}
                    </div>
                    <input value={step.subject} onChange={e => updateStep(i, { subject: e.target.value })} placeholder="Message subject / preview…"
                      className="w-full px-2.5 py-1.5 rounded-lg text-[16px] outline-none" style={inputStyle} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-base" style={{ color: 'var(--text-muted)' }}>Cancel</button>
          <button onClick={create} disabled={!canCreate}
            className="px-4 py-1.5 rounded-lg text-base font-semibold disabled:opacity-50"
            style={{ background: '#00d9ff', color: '#0a0e1a' }}>Create Sequence</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'live' | 'sequences' | 'recovered' | 'exitintent' | 'upsell' | 'watchlists' | 'insights';

export default function CartPage() {
  const [tab, setTab] = useState<Tab>('live');
  const [stores] = useStores();
  const { selectedStoreIds } = useStoreScope('cart');
  // Shared with Site Monitoring's Abandoned Cart Feed — same underlying records.
  const [allLiveCarts, setLiveCarts] = usePersistentState<AbandonedCart[]>('monitoring.abandonedCarts', []);
  const [allSequences, setSequences] = usePersistentState<RecoverySequence[]>('cart.sequences', []);
  const [allRecovered] = usePersistentState<RecoveredCart[]>('cart.recovered', []);
  const [buildingSeq, setBuildingSeq] = useState(false);
  // Abandoned-cart table controls
  const [cartSort, setCartSort] = useState<{ key: 'cartValue' | 'minutesAgo'; asc: boolean }>({ key: 'minutesAgo', asc: true });
  const [cartStatusFilter, setCartStatusFilter] = useState<'all' | 'new' | 'recovering'>('all');
  const [expandedCart, setExpandedCart] = useState<string | null>(null);

  const inScope = (storeStr: string) => storeStr === 'All Stores' || selectedStoreIds.includes(resolveStoreId(storeStr, stores) ?? '');

  const liveCarts = allLiveCarts.filter(c => selectedStoreIds.includes(c.storeId));
  const SEQUENCES = allSequences.filter(seq => inScope(seq.store));
  const RECOVERED_LIST = allRecovered.filter(r => inScope(r.store));

  // Recovery stage / status derived from which channels have been sent.
  const cartStage = (c: AbandonedCart) => c.pushSent ? 'Push' : c.smsSent ? 'SMS' : c.recoveryEmailSent ? 'Email' : 'None';
  const cartStatus = (c: AbandonedCart): 'new' | 'recovering' => (c.recoveryEmailSent || c.smsSent || c.pushSent) ? 'recovering' : 'new';

  const cartRows = liveCarts
    .filter(c => cartStatusFilter === 'all' || cartStatus(c) === cartStatusFilter)
    .sort((a, b) => { const d = a[cartSort.key] - b[cartSort.key]; return cartSort.asc ? d : -d; });

  // Recovery metrics (honest derivations from real data)
  const avgRecoveryMins = RECOVERED_LIST.length
    ? Math.round(RECOVERED_LIST.reduce((sum, r) => sum + r.minutesAgo, 0) / RECOVERED_LIST.length) : 0;
  const bestStep = SEQUENCES.flatMap(seq => seq.steps.map(st => ({ ...st, seq: seq.name })))
    .sort((a, b) => b.convRate - a.convRate)[0] ?? null;

  // Recovery tracking (status/stage, recovered revenue, per-channel rates) isn't
  // modeled yet — zeroed honestly rather than fabricated until that data exists.
  const s = {
    cartsAbandoned30d: liveCarts.length,
    cartsRecovered30d: 0,
    recoveryRate: 0,
    revenueRecovered30d: 0,
    totalCartValue: liveCarts.reduce((sum, c) => sum + c.cartValue, 0),
    emailRecoveryRate: 0,
    smsRecoveryRate: 0,
    pushRecoveryRate: 0,
  };

  const triggerAllRecovery = () =>
    setLiveCarts(prev => prev.map(cart => selectedStoreIds.includes(cart.storeId) ? { ...cart, recoveryEmailSent: true, smsSent: true } : cart));

  const TABS = [
    { key: 'live' as Tab,        label: 'Live Carts',           icon: ShoppingCart, badge: liveCarts.length },
    { key: 'sequences' as Tab,   label: 'Recovery Sequences',   icon: BarChart2    },
    { key: 'recovered' as Tab,   label: 'Recovered',            icon: TrendingUp   },
    { key: 'exitintent' as Tab,  label: 'Exit-Intent',          icon: MousePointer },
    { key: 'upsell' as Tab,      label: 'Post-Purchase Upsell', icon: Gift         },
    { key: 'watchlists' as Tab,  label: 'Watchlists',           icon: Package      },
    { key: 'insights' as Tab,    label: 'Customer Insights',    icon: Users        },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title="Cart Recovery" subtitle={`${s.cartsAbandoned30d} abandoned (30d)`} breadcrumbs={['MarketOS', 'Cart Recovery']} />
        <main className="flex-1 overflow-hidden flex flex-col p-5 gap-4" style={{ minHeight: 0 }}>

          <div className="shrink-0"><StoreScopeBar sectionKey="cart" /></div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 shrink-0">
            {[
              { label: 'Abandoned (30d)',    value: s.cartsAbandoned30d.toString(),   color: '#ffb347' },
              { label: 'Recovered (30d)',    value: s.cartsRecovered30d.toString(),    color: '#10d98a' },
              { label: 'Recovery Rate',      value: s.recoveryRate.toFixed(1) + '%',  color: 'var(--cyan)' },
              { label: 'Revenue Recovered',  value: c$(s.revenueRecovered30d),         color: '#10d98a' },
              { label: 'At Risk Right Now',  value: formatCurrency(s.totalCartValue),  color: '#ff4444' },
            ].map(st => (
              <div key={st.label} className="glass-card px-4 py-3">
                <div className="section-label mb-1.5">{st.label}</div>
                <div className="data-value text-xl font-bold" style={{ color: st.color }}>{st.value}</div>
              </div>
            ))}
          </div>

          {/* Channel rates */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              { label: 'Email Recovery Rate', value: s.emailRecoveryRate, Icon: Mail,          color: '#ffb347' },
              { label: 'SMS Recovery Rate',   value: s.smsRecoveryRate,   Icon: MessageSquare, color: '#10d98a' },
              { label: 'Push Recovery Rate',  value: s.pushRecoveryRate,  Icon: Bell,          color: 'var(--cyan)' },
            ].map(ch => (
              <div key={ch.label} className="glass-card px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: ch.color + '18' }}>
                  <ch.Icon size={15} style={{ color: ch.color }} />
                </div>
                <div>
                  <div className="section-label mb-0.5">{ch.label}</div>
                  <div className="data-value text-lg font-bold" style={{ color: ch.color }}>{ch.value}%</div>
                </div>
                <div className="ml-auto w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                  <div className="h-full rounded-full" style={{ width: `${ch.value * 5}%`, background: ch.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 p-1 rounded-xl shrink-0"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base transition-all"
                  style={{
                    background: tab === t.key ? 'var(--bg-elevated)' : 'transparent',
                    color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: tab === t.key ? 500 : 400,
                    border: tab === t.key ? '1px solid var(--border-dim)' : '1px solid transparent',
                  }}>
                  <Icon size={13} />{t.label}
                  {t.badge ? <span className="text-[16px] px-1.5 py-0.5 rounded-full font-mono"
                    style={{ background: '#ffb347', color: '#0a0e1a' }}>{t.badge}</span> : null}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">

            {tab === 'live' && (
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full live-dot-amber" style={{ background: '#ffb347' }} />
                    <span className="data-value text-xl font-bold" style={{ color: '#ffb347' }}>{liveCarts.length}</span>
                    <span className="text-base" style={{ color: 'var(--text-muted)' }}>
                      active carts · {formatCurrency(s.totalCartValue)} at risk
                    </span>
                  </div>
                  <button onClick={triggerAllRecovery} className="text-base px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: 'rgba(255,179,71,0.1)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.2)' }}>
                    Trigger All Recovery
                  </button>
                </div>
                {/* Status filter */}
                {liveCarts.length > 0 && (
                  <div className="flex items-center gap-1 mb-3 p-1 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
                    {(['all', 'new', 'recovering'] as const).map(f => {
                      const active = cartStatusFilter === f;
                      return (
                        <button key={f} onClick={() => setCartStatusFilter(f)}
                          className="px-2.5 py-1 rounded-md text-[16px] font-mono capitalize transition-all"
                          style={{ background: active ? 'var(--bg-overlay)' : 'transparent', color: active ? 'var(--text-primary)' : 'var(--text-muted)', border: active ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
                          {f}
                        </button>
                      );
                    })}
                  </div>
                )}
                {liveCarts.length === 0 && (
                  <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-dim)' }}>
                    <ShoppingCart size={22} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>No abandoned carts yet</div>
                    <div className="text-[16px] mt-1" style={{ color: 'var(--text-muted)' }}>Connect a store's Shopify checkout events to start tracking abandoned carts here.</div>
                  </div>
                )}
                {liveCarts.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr className="section-label" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <th className="text-left font-normal pb-2 pr-2">Customer</th>
                          <th className="text-left font-normal pb-2 pr-2">Store</th>
                          <th className="text-right font-normal pb-2 pr-2 cursor-pointer select-none" onClick={() => setCartSort(s => ({ key: 'cartValue', asc: s.key === 'cartValue' ? !s.asc : false }))}>Value {cartSort.key === 'cartValue' ? (cartSort.asc ? '↑' : '↓') : ''}</th>
                          <th className="text-right font-normal pb-2 pr-2 cursor-pointer select-none" onClick={() => setCartSort(s => ({ key: 'minutesAgo', asc: s.key === 'minutesAgo' ? !s.asc : true }))}>Age {cartSort.key === 'minutesAgo' ? (cartSort.asc ? '↑' : '↓') : ''}</th>
                          <th className="text-center font-normal pb-2 pr-2">Stage</th>
                          <th className="text-center font-normal pb-2 pr-2">Push</th>
                          <th className="text-center font-normal pb-2 pr-2">Status</th>
                          <th className="text-right font-normal pb-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartRows.map(cart => {
                          const store = stores.find(st => st.id === cart.storeId);
                          const urgent = cart.minutesAgo < 15;
                          const status = cartStatus(cart);
                          const stage = cartStage(cart);
                          const expanded = expandedCart === cart.id;
                          const stageColor = stage === 'None' ? 'var(--text-muted)' : stage === 'Push' ? 'var(--cyan)' : stage === 'SMS' ? '#10d98a' : '#ffb347';
                          return (
                            <Fragment key={cart.id}>
                              <tr className="transition-colors hover:bg-white/[0.02] cursor-pointer"
                                onClick={() => setExpandedCart(expanded ? null : cart.id)}
                                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td className="py-2.5 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <ChevronRight size={12} className="transition-transform" style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(90deg)' : 'none' }} />
                                    <span style={{ color: 'var(--text-primary)' }}>{cart.customerName}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 pr-2 font-mono text-[16px]" style={{ color: '#7b93ff' }}>{store ? store.domain.split('.')[0] : cart.storeId}</td>
                                <td className="py-2.5 pr-2 text-right font-mono font-bold" style={{ color: '#ffb347' }}>{formatCurrency(cart.cartValue)}</td>
                                <td className="py-2.5 pr-2 text-right font-mono" style={{ color: urgent ? '#ff4444' : 'var(--text-muted)' }}>{formatMinutesAgo(cart.minutesAgo)}</td>
                                <td className="py-2.5 pr-2 text-center">
                                  <span className="text-[16px] font-mono px-1.5 py-0.5 rounded" style={{ background: stageColor + '18', color: stageColor }}>{stage}</span>
                                </td>
                                <td className="py-2.5 pr-2 text-center">
                                  {cart.pushSent ? <CheckCircle size={13} className="inline" style={{ color: '#10d98a' }} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                </td>
                                <td className="py-2.5 pr-2 text-center">
                                  <span className="text-[16px] font-mono px-1.5 py-0.5 rounded capitalize" style={{ background: status === 'recovering' ? 'rgba(16,217,138,0.14)' : 'rgba(255,179,71,0.14)', color: status === 'recovering' ? '#10d98a' : '#ffb347' }}>{status}</span>
                                </td>
                                <td className="py-2.5 text-right">
                                  {status === 'new' && (
                                    <button onClick={e => { e.stopPropagation(); setLiveCarts(prev => prev.map(c => c.id === cart.id ? { ...c, recoveryEmailSent: true } : c)); }}
                                      className="text-[16px] px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                                      Start Recovery
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {expanded && (
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                  <td colSpan={8} className="py-2.5 px-6" style={{ background: 'var(--bg-elevated)' }}>
                                    <div className="flex items-center gap-2 mb-2 text-[16px]" style={{ color: 'var(--text-muted)' }}>
                                      <MapPin size={10} />{cart.location} · {cart.customerEmail} · {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
                                    </div>
                                    <div className="space-y-1">
                                      {cart.items.map((it, i) => (
                                        <div key={i} className="flex items-center justify-between text-[16px]">
                                          <span style={{ color: 'var(--text-secondary)' }}>{it.name}</span>
                                          <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{formatCurrency(it.price)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === 'sequences' && (
              <div className="space-y-3">
                {buildingSeq && (
                  <SequenceBuilderModal
                    stores={stores}
                    onClose={() => setBuildingSeq(false)}
                    onCreate={(seq) => { setSequences(prev => [seq, ...prev]); setBuildingSeq(false); }}
                  />
                )}
                <div className="flex justify-end">
                  <button onClick={() => setBuildingSeq(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-medium"
                    style={{ background: 'rgba(0,217,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,217,255,0.2)' }}>
                    <Plus size={13} /> New Sequence
                  </button>
                </div>
                {SEQUENCES.length === 0 && (
                  <div className="glass-card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                    No recovery sequences yet for the selected store{selectedStoreIds.length !== 1 ? 's' : ''}.
                  </div>
                )}
                {SEQUENCES.map(seq => (
                  <div key={seq.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{seq.name}</div>
                        <div className="text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {seq.steps.length} steps · {seq.store} · <span style={{ color: '#10d98a' }}>Active</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="data-value text-base font-bold" style={{ color: '#10d98a' }}>{c$(seq.revenue30d)}</div>
                        <div className="section-label">recovered (30d)</div>
                      </div>
                    </div>
                    {/* Step table */}
                    <table className="w-full text-base" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr className="section-label" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <th className="text-left font-normal pb-2 pr-2">Step</th>
                          <th className="text-left font-normal pb-2 pr-2">Channel</th>
                          <th className="text-left font-normal pb-2 pr-2">Delay</th>
                          <th className="text-left font-normal pb-2 pr-2">Subject</th>
                          <th className="text-right font-normal pb-2 pr-2">Open</th>
                          <th className="text-right font-normal pb-2 pr-2">Click</th>
                          <th className="text-right font-normal pb-2">Conv.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seq.steps.map((step, i) => {
                          const Icon = CH_ICON_MAP[step.channel];
                          const color = CH_COL_MAP[step.channel];
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <td className="py-2 pr-2 font-mono" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                              <td className="py-2 pr-2">
                                <span className="inline-flex items-center gap-1.5" style={{ color }}>
                                  <Icon size={12} /> <span className="capitalize">{step.channel}</span>
                                </span>
                              </td>
                              <td className="py-2 pr-2 font-mono" style={{ color: 'var(--text-secondary)' }}>+{step.delay}</td>
                              <td className="py-2 pr-2 truncate" style={{ color: 'var(--text-primary)', maxWidth: 280 }}>{step.subject}</td>
                              <td className="py-2 pr-2 text-right font-mono" style={{ color: step.openRate > 50 ? '#10d98a' : '#ffb347' }}>{step.openRate}%</td>
                              <td className="py-2 pr-2 text-right font-mono" style={{ color: 'var(--cyan)' }}>{step.clickRate}%</td>
                              <td className="py-2 text-right font-mono" style={{ color: '#7b93ff' }}>{step.convRate}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="font-semibold" style={{ background: 'var(--bg-elevated)' }}>
                          <td className="py-2 pr-2 section-label" colSpan={4}>SEQUENCE AVG</td>
                          <td className="py-2 pr-2 text-right font-mono" style={{ color: '#10d98a' }}>{(seq.steps.reduce((s, x) => s + x.openRate, 0) / seq.steps.length).toFixed(1)}%</td>
                          <td className="py-2 pr-2 text-right font-mono" style={{ color: 'var(--cyan)' }}>{(seq.steps.reduce((s, x) => s + x.clickRate, 0) / seq.steps.length).toFixed(1)}%</td>
                          <td className="py-2 text-right font-mono" style={{ color: '#7b93ff' }}>{(seq.steps.reduce((s, x) => s + x.convRate, 0) / seq.steps.length).toFixed(1)}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {tab === 'recovered' && (
              <div className="space-y-3">
              {/* Recovery metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,217,255,0.15)' }}>
                    <Clock size={16} style={{ color: 'var(--cyan)' }} />
                  </div>
                  <div>
                    <div className="section-label mb-0.5">Avg Recovery Time</div>
                    <div className="data-value text-lg font-bold" style={{ color: 'var(--cyan)' }}>
                      {avgRecoveryMins > 0 ? formatMinutesAgo(avgRecoveryMins) : '—'}
                    </div>
                  </div>
                  <span className="ml-auto text-[16px] font-mono" style={{ color: 'var(--text-muted)' }}>across {RECOVERED_LIST.length} recoveries</span>
                </div>
                <div className="glass-card px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,217,138,0.15)' }}>
                    <Award size={16} style={{ color: '#10d98a' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="section-label mb-0.5">Best Performing Step</div>
                    {bestStep ? (
                      <div className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {bestStep.subject} <span className="font-mono" style={{ color: '#10d98a' }}>· {bestStep.convRate}% conv</span>
                      </div>
                    ) : (
                      <div className="text-base" style={{ color: 'var(--text-muted)' }}>No sequences yet</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="section-label">Recently Recovered Carts</span>
                </div>
                {RECOVERED_LIST.length === 0 && (
                  <div className="px-4 py-8 text-center text-base" style={{ color: 'var(--text-muted)' }}>
                    No recovered carts yet for the selected store{selectedStoreIds.length !== 1 ? 's' : ''}.
                  </div>
                )}
                {RECOVERED_LIST.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: CH_COLOR[r.channel] + '20' }}>
                      {r.channel === 'Email' ? <Mail size={11} style={{ color: CH_COLOR[r.channel] }} />
                       : r.channel === 'SMS' ? <MessageSquare size={11} style={{ color: CH_COLOR[r.channel] }} />
                       : <Bell size={11} style={{ color: CH_COLOR[r.channel] }} />}
                    </div>
                    <span className="text-base flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{r.customer}</span>
                    <span className="text-[16px] font-mono px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: CH_COLOR[r.channel] + '18', color: CH_COLOR[r.channel] }}>via {r.channel}</span>
                    <span className="data-value text-base font-semibold shrink-0" style={{ color: '#10d98a' }}>{c$(r.value)}</span>
                    <span className="text-[16px] font-mono shrink-0" style={{ color: 'var(--text-muted)', minWidth: 44 }}>{formatMinutesAgo(r.minutesAgo)}</span>
                  </div>
                ))}
              </div>
              </div>
            )}

            {tab === 'exitintent' && <ExitIntentPanel />}

            {tab === 'upsell' && <UpsellPanel />}

            {tab === 'watchlists' && <WatchlistsPanel selectedStoreIds={selectedStoreIds} />}

            {tab === 'insights' && <CustomerInsightsPanel selectedStoreIds={selectedStoreIds} />}

          </div>
        </main>
      </div>
    </div>
  );
}
