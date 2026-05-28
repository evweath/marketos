'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { ABANDONED_CARTS, formatCurrency, formatMinutesAgo, getStoreById } from '@/lib/mockData';
import {
  ShoppingCart, Mail, MessageSquare, Bell, TrendingUp, BarChart2, MapPin,
  MousePointer, Gift, ToggleLeft, ToggleRight, X, ChevronDown, ChevronUp,
  Pencil, Trash2, PauseCircle, PlayCircle, Plus,
  Package, TrendingDown, Users, Star, AlertTriangle, Tag,
} from 'lucide-react';

const c$ = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const RECOVERY_STATS = {
  cartsAbandoned30d: 847, cartsRecovered30d: 94, recoveryRate: 11.1,
  revenueRecovered30d: 48420, totalCartValue: ABANDONED_CARTS.reduce((s, c) => s + c.cartValue, 0),
  emailRecoveryRate: 8.4, smsRecoveryRate: 14.2, pushRecoveryRate: 4.1,
};

const SEQUENCES = [
  {
    id: 'seq-001', name: '3-Step Email + SMS Recovery', store: 'All Stores',
    steps: [
      { channel: 'email', delay: '1h',  subject: 'You left something behind 🛒',       openRate: 48.2, clickRate: 22.4, convRate: 6.8 },
      { channel: 'sms',   delay: '3h',  subject: 'Cart reminder + 5% off code',        openRate: 94.1, clickRate: 38.2, convRate: 4.2 },
      { channel: 'email', delay: '24h', subject: 'Last chance — your cart expires soon', openRate: 31.4, clickRate: 14.8, convRate: 3.1 },
    ],
    recovered30d: 62, revenue30d: 31840,
  },
  {
    id: 'seq-002', name: 'High-Value ($2K+) Priority Recovery', store: 'donut-equipment.com',
    steps: [
      { channel: 'email', delay: '30m', subject: 'Your equipment order is waiting',       openRate: 61.4, clickRate: 31.2, convRate: 14.2 },
      { channel: 'sms',   delay: '2h',  subject: 'Personal note from our team',          openRate: 97.2, clickRate: 48.4, convRate: 9.8  },
      { channel: 'email', delay: '6h',  subject: 'Financing options for your order',     openRate: 44.8, clickRate: 22.1, convRate: 7.4  },
    ],
    recovered30d: 18, revenue30d: 32480,
  },
  {
    id: 'seq-003', name: 'Browse Abandonment — Email Only', store: 'All Stores',
    steps: [
      { channel: 'email', delay: '4h',  subject: 'Still thinking about it?',            openRate: 32.1, clickRate: 11.4, convRate: 2.4 },
      { channel: 'email', delay: '48h', subject: "Here's what other bakers chose",      openRate: 24.8, clickRate: 8.2,  convRate: 1.8 },
    ],
    recovered30d: 14, revenue30d: 4100,
  },
];

const RECOVERED_LIST = [
  { id: 'r-001', customer: 'Riverside Donuts LLC',   value: 2340, channel: 'SMS',   minutesAgo: 84  },
  { id: 'r-002', customer: 'Sunrise Pastry Co',      value: 847,  channel: 'Email', minutesAgo: 142 },
  { id: 'r-003', customer: 'Golden Grain Bakeries',  value: 5640, channel: 'SMS',   minutesAgo: 214 },
  { id: 'r-004', customer: 'Metro Bread Corp',       value: 1240, channel: 'Email', minutesAgo: 284 },
  { id: 'r-005', customer: 'Dunkin Alternatives',    value: 3420, channel: 'SMS',   minutesAgo: 412 },
  { id: 'r-006', customer: 'Hole Foods Donut Bar',   value: 612,  channel: 'Push',  minutesAgo: 540 },
];

const CH_COLOR: Record<string, string> = { Email: '#ffb347', SMS: '#10d98a', Push: '#00d9ff' };
const CH_ICON_MAP: Record<string, React.ElementType> = { email: Mail, sms: MessageSquare, push: Bell };
const CH_COL_MAP: Record<string, string> = { email: '#ffb347', sms: '#10d98a', push: '#00d9ff' };

// ─── Exit-Intent Panel ────────────────────────────────────────────────────────

function ExitIntentPanel() {
  const EI_STATS = { shown: 4820, captured: 724, captureRate: 15.02, recovered: 412, conversionRate: 8.55, revenue: 38420, avgDiscount: '10%' };

  const [enabled, setEnabled]             = useState(true);
  const [headline, setHeadline]           = useState("Wait! Don't leave yet...");
  const [subheadline, setSubheadline]     = useState('Complete your order and save 10%');
  const [offerType, setOfferType]         = useState<'none' | 'pct' | 'dollar' | 'shipping'>('pct');
  const [discountAmt, setDiscountAmt]     = useState(10);
  const [coupon, setCoupon]               = useState('COMEBACK10');
  const [ctaText, setCtaText]             = useState('Claim My Discount');
  const [imageOption, setImageOption]     = useState<'none' | 'product' | 'banner'>('none');
  const [triggerType, setTriggerType]     = useState<'mouse' | 'idle' | 'scrollup' | 'exitbtn'>('mouse');
  const [delaySeconds, setDelaySeconds]   = useState(2);
  const [pageTypes, setPageTypes]         = useState({ product: true, cart: true, checkout: false });
  const [freqCap, setFreqCap]             = useState(7);
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
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Popup Configuration</div>

          {/* Enable toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Exit-Intent Popup</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Show popup when visitors attempt to leave</div>
            </div>
            <button onClick={() => setEnabled(e => !e)} className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: enabled ? '#10d98a' : 'var(--text-muted)' }}>
              {enabled ? <ToggleRight size={24} style={{ color: '#10d98a' }} /> : <ToggleLeft size={24} />}
              {enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Popup Settings */}
          <div className="space-y-3">
            <div className="section-label">Popup Settings</div>

            <div className="space-y-2">
              <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Headline</label>
              <input value={headline} onChange={e => setHeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Subheadline</label>
              <input value={subheadline} onChange={e => setSubheadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Offer Type</label>
                <select value={offerType} onChange={e => setOfferType(e.target.value as typeof offerType)}
                  className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <option value="none">No Discount</option>
                  <option value="pct">% Off</option>
                  <option value="dollar">$ Off</option>
                  <option value="shipping">Free Shipping</option>
                </select>
              </div>
              {(offerType === 'pct' || offerType === 'dollar') && (
                <div className="space-y-1">
                  <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {offerType === 'pct' ? 'Percent Off' : 'Dollar Off'}
                  </label>
                  <input type="number" value={discountAmt} onChange={e => setDiscountAmt(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Coupon Code</label>
              <input value={coupon} onChange={e => setCoupon(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: '#00d9ff' }} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>CTA Button Text</label>
              <input value={ctaText} onChange={e => setCtaText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Image / Graphic</label>
              <select value={imageOption} onChange={e => setImageOption(e.target.value as typeof imageOption)}
                className="w-full px-2 py-2 rounded-lg text-xs outline-none"
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
              <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Trigger Type</label>
              <select value={triggerType} onChange={e => setTriggerType(e.target.value as typeof triggerType)}
                className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                <option value="mouse">Mouse leaves viewport</option>
                <option value="idle">Idle &gt; 30s</option>
                <option value="scrollup">Scroll up</option>
                <option value="exitbtn">Exit button click</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Show after delay</label>
                <span className="text-[10px] font-mono" style={{ color: '#00d9ff' }}>{delaySeconds}s</span>
              </div>
              <input type="range" min={0} max={30} value={delaySeconds} onChange={e => setDelaySeconds(Number(e.target.value))}
                className="w-full" style={{ accentColor: '#00d9ff' }} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Show on page types</label>
              {([['product', 'Product pages'], ['cart', 'Cart page'], ['checkout', 'Checkout page']] as const).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={pageTypes[k]} onChange={() => togglePage(k)}
                    style={{ accentColor: '#00d9ff' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Frequency cap — don't show again for</label>
              <select value={freqCap} onChange={e => setFreqCap(Number(e.target.value))}
                className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                {[1, 3, 7, 14, 30].map(d => <option key={d} value={d}>{d} day{d !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSave}
            className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: saved ? 'rgba(16,217,138,0.15)' : 'rgba(0,217,255,0.12)',
              color: saved ? '#10d98a' : '#00d9ff',
              border: `1px solid ${saved ? 'rgba(16,217,138,0.3)' : 'rgba(0,217,255,0.25)'}`,
            }}>
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>

        {/* Right: Preview */}
        <div className="glass-card p-4 flex flex-col">
          <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Live Preview</div>

          {/* Browser mockup */}
          <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ background: '#0a0e1a', border: '1px solid var(--border-dim)' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2 shrink-0" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff4444' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffb347' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10d98a' }} />
              <div className="flex-1 mx-3 h-4 rounded text-[9px] flex items-center px-2" style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
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
                  <div className="text-sm font-bold leading-snug pr-6" style={{ color: 'var(--text-primary)' }}>
                    {headline || 'Your headline here'}
                  </div>
                  {/* Subheadline */}
                  <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {subheadline || 'Your subheadline here'}
                  </div>
                  {/* Discount */}
                  {discountLabel && (
                    <div className="text-center py-2">
                      <span className="text-2xl font-black" style={{ color: '#00d9ff' }}>{discountLabel}</span>
                    </div>
                  )}
                  {/* Coupon */}
                  {coupon && (
                    <div className="text-center">
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-widest"
                        style={{ background: 'rgba(0,217,255,0.1)', color: '#00d9ff', border: '1px dashed rgba(0,217,255,0.4)' }}>
                        {coupon}
                      </span>
                    </div>
                  )}
                  {/* CTA */}
                  <button className="w-full py-2 rounded-xl text-xs font-bold"
                    style={{ background: '#00d9ff', color: '#0a0e1a' }}>
                    {ctaText || 'Claim Discount'}
                  </button>
                  {/* No thanks */}
                  <div className="text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    No thanks, I'll pay full price
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10d98a' }} />
            Preview updates live as you edit settings
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card p-4">
        <div className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Exit-Intent Performance <span className="section-label font-normal ml-1">(30d)</span></div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Popups Shown',        value: EI_STATS.shown.toLocaleString(),      color: '#7b93ff' },
            { label: 'Emails Captured',     value: EI_STATS.captured.toLocaleString(),   color: '#00d9ff' },
            { label: 'Capture Rate',        value: EI_STATS.captureRate + '%',           color: '#00d9ff' },
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
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>A/B Testing</div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10d98a' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Currently testing · started May 1, 2026</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              variant: 'A', label: 'Control', headline: '"Wait! Don\'t leave yet..."',
              offer: '10% off', traffic: '48.2%', conv: '8.2%', winner: true,
            },
            {
              variant: 'B', label: 'Challenger', headline: '"Your cart is waiting..."',
              offer: 'Free shipping', traffic: '51.8%', conv: '7.4%', winner: false,
            },
          ].map(v => (
            <div key={v.variant} className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: `1px solid ${v.winner ? 'rgba(16,217,138,0.3)' : 'var(--border-subtle)'}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono"
                    style={{ background: 'rgba(123,147,255,0.15)', color: '#7b93ff' }}>
                    Variant {v.variant}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{v.label}</span>
                </div>
                {v.winner && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(16,217,138,0.15)', color: '#10d98a' }}>
                    Winner
                  </span>
                )}
              </div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{v.headline}</div>
              <div className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>Offer: {v.offer}</div>
              <div className="grid grid-cols-2 gap-2">
                {[['Traffic', v.traffic, '#7b93ff'], ['Conv Rate', v.conv, '#10d98a']].map(([lbl, val, col]) => (
                  <div key={lbl as string}>
                    <div className="section-label mb-0.5">{lbl as string}</div>
                    <div className="text-sm font-bold" style={{ color: col as string }}>{val as string}</div>
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

type UpsellStatus = 'active' | 'paused';
type UpsellType   = 'upsell' | 'cross-sell' | 'bundle';

interface UpsellOffer {
  id: string;
  name: string;
  type: UpsellType;
  trigger: string;
  offerProduct: string;
  originalPrice: number;
  offerPrice: number;
  discount: string;
  acceptRate: number;
  revenue30d: number;
  status: UpsellStatus;
}

const UPSELL_OFFERS: UpsellOffer[] = [
  { id: 'u-001', name: 'Donut Fryer Oil Bundle',          type: 'cross-sell', trigger: 'After purchase of Donut Fryer',               offerProduct: 'Commercial Frying Oil 5L x3',    originalPrice: 89,   offerPrice: 72,   discount: '19% off', acceptRate: 18.4, revenue30d: 8420,  status: 'active' },
  { id: 'u-002', name: 'Upgrade to Pro Package',          type: 'upsell',     trigger: 'After purchase of Standard Donut Equipment',  offerProduct: 'Pro Equipment Package',          originalPrice: 2400, offerPrice: 1980, discount: '17% off', acceptRate: 8.2,  revenue30d: 14200, status: 'active' },
  { id: 'u-003', name: 'Starter Supply Bundle',           type: 'bundle',     trigger: 'First purchase from any store',               offerProduct: 'Essential Baking Supplies Bundle', originalPrice: 180, offerPrice: 139,  discount: '23% off', acceptRate: 22.1, revenue30d: 6840,  status: 'active' },
  { id: 'u-004', name: 'Extended Warranty',               type: 'cross-sell', trigger: 'After purchase of any equipment',             offerProduct: 'Extended 3-Year Warranty',       originalPrice: 299,  offerPrice: 249,  discount: '17% off', acceptRate: 6.8,  revenue30d: 4200,  status: 'paused' },
];

const UPSELL_STATS = { upsellRevenue30d: 24840, acceptanceRate: 12.4, avgUpsellValue: 148, totalOffers: 847 };

const TYPE_COLOR: Record<UpsellType, string> = { 'upsell': '#00d9ff', 'cross-sell': '#7b93ff', 'bundle': '#ffb347' };

function UpsellPanel() {
  const [offers, setOffers] = useState<UpsellOffer[]>(UPSELL_OFFERS);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [addOpen, setAddOpen]           = useState(false);

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

  const handleCreate = () => {
    if (!newName.trim() || !newProduct.trim()) return;
    const offer: UpsellOffer = {
      id: `u-${Date.now()}`,
      name: newName,
      type: newType,
      trigger: newTrigger === 'after' ? 'After purchase' : newTrigger === 'first' ? 'First purchase' : newTrigger === 'specific' ? 'Specific product purchased' : 'Order value > $X',
      offerProduct: newProduct,
      originalPrice: Number(newOriginal) || 0,
      offerPrice: Number(newDiscounted) || 0,
      discount: newOriginal && newDiscounted ? `${Math.round((1 - Number(newDiscounted) / Number(newOriginal)) * 100)}% off` : '—',
      acceptRate: 0,
      revenue30d: 0,
      status: 'active',
    };
    setOffers(prev => [offer, ...prev]);
    setAddOpen(false);
    setNewName(''); setNewProduct(''); setNewOriginal(''); setNewDiscounted('');
  };

  return (
    <div className="space-y-4">
      {/* Stats header */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Upsell Revenue (30d)', value: c$(UPSELL_STATS.upsellRevenue30d), color: '#10d98a' },
          { label: 'Acceptance Rate',     value: UPSELL_STATS.acceptanceRate + '%',  color: '#00d9ff' },
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
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Active Upsell Offers</div>
          <button onClick={() => setAddOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(0,217,255,0.1)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.2)' }}>
            <Plus size={12} />Add Offer
            {addOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>

        {/* Add offer form */}
        {addOpen && (
          <div className="mb-4 p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>New Upsell Offer</div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Offer Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Pro Bundle Upgrade"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value as UpsellType)}
                  className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <option value="upsell">Upsell</option>
                  <option value="cross-sell">Cross-sell</option>
                  <option value="bundle">Bundle</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Trigger Event</label>
                <select value={newTrigger} onChange={e => setNewTrigger(e.target.value as typeof newTrigger)}
                  className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <option value="after">After purchase</option>
                  <option value="first">First purchase</option>
                  <option value="specific">Specific product purchased</option>
                  <option value="value">Order value &gt; $X</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Product to Offer</label>
                <input value={newProduct} onChange={e => setNewProduct(e.target.value)} placeholder="Product name"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Original Price ($)</label>
                <input type="number" value={newOriginal} onChange={e => setNewOriginal(e.target.value)} placeholder="0"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Discounted Price ($)</label>
                <input type="number" value={newDiscounted} onChange={e => setNewDiscounted(e.target.value)} placeholder="0"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Display Timing</label>
                <select value={newTiming} onChange={e => setNewTiming(e.target.value as typeof newTiming)}
                  className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  <option value="immediate">Immediately on confirmation</option>
                  <option value="email">Post-purchase email</option>
                  <option value="followup">24h follow-up</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                Cancel
              </button>
              <button onClick={handleCreate}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: '#00d9ff', color: '#0a0e1a' }}>
                Create Offer
              </button>
            </div>
          </div>
        )}

        {/* Offer cards */}
        <div className="space-y-3">
          {offers.map(offer => {
            const typeColor = TYPE_COLOR[offer.type];
            const isDeleting = deletingId === offer.id;
            return (
              <div key={offer.id} className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{ background: typeColor + '18', color: typeColor }}>
                        {offer.type}
                      </span>
                      <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{offer.name}</span>
                    </div>
                    <div className="text-[10px] mb-1.5" style={{ color: 'var(--text-muted)' }}>{offer.trigger}</div>
                    <div className="text-[11px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{offer.offerProduct}</div>

                    {/* Pricing */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{c$(offer.originalPrice)}</span>
                      <span className="text-sm font-bold" style={{ color: '#10d98a' }}>{c$(offer.offerPrice)}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: 'rgba(16,217,138,0.12)', color: '#10d98a' }}>
                        {offer.discount}
                      </span>
                    </div>
                  </div>

                  {/* Metrics + controls */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Status */}
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: offer.status === 'active' ? 'rgba(16,217,138,0.12)' : 'rgba(255,179,71,0.12)',
                        color: offer.status === 'active' ? '#10d98a' : '#ffb347',
                      }}>
                      {offer.status === 'active' ? 'Active' : 'Paused'}
                    </span>

                    {/* Metrics */}
                    <div className="text-right space-y-0.5">
                      <div className="text-[10px]"><span style={{ color: 'var(--text-muted)' }}>Accept Rate </span><span className="font-mono font-semibold" style={{ color: '#00d9ff' }}>{offer.acceptRate}%</span></div>
                      <div className="text-[10px]"><span style={{ color: 'var(--text-muted)' }}>Revenue (30d) </span><span className="font-mono font-semibold" style={{ color: '#10d98a' }}>{c$(offer.revenue30d)}</span></div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded-lg transition-colors"
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
                        className="px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all"
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

type StockStatus = 'out_of_stock' | 'low_stock' | 'in_stock';
interface WatchProduct {
  id: string;
  name: string;
  store: string;
  sku: string;
  currentPrice: number;
  targetPrice?: number;
  originalPrice?: number;
  stockStatus: StockStatus;
  watcherCount: number;
  notificationsSent: number;
  lastUpdated: string;
}

const WATCH_PRODUCTS: WatchProduct[] = [
  { id: 'wp-1', name: 'Pro Series Donut Fryer 24"',      store: 'donut-equipment.com',   sku: 'DF-PRO-24',  currentPrice: 2499, targetPrice: 2200,            stockStatus: 'out_of_stock', watcherCount: 47, notificationsSent: 0,  lastUpdated: '2026-05-10' },
  { id: 'wp-2', name: 'Commercial Donut Fryer — 18"',    store: 'donut-equipment.com',   sku: 'DF-COM-18',  currentPrice: 1649, targetPrice: 1500,            stockStatus: 'low_stock',    watcherCount: 31, notificationsSent: 0,  lastUpdated: '2026-05-12' },
  { id: 'wp-3', name: 'Bulk Glaze Mix — Chocolate 50lb', store: 'donut-supplies.com',    sku: 'GM-CHOC-50', currentPrice: 124,  targetPrice: 99,              stockStatus: 'out_of_stock', watcherCount: 83, notificationsSent: 0,  lastUpdated: '2026-05-11' },
  { id: 'wp-4', name: 'Yeast Donut Mix — 50lb Case',     store: 'donut-supplies.com',    sku: 'DM-YEAST-50',currentPrice: 189,  originalPrice: 220,           stockStatus: 'in_stock',     watcherCount: 22, notificationsSent: 22, lastUpdated: '2026-05-12' },
  { id: 'wp-5', name: 'Bakery Proofing Cabinet — 4-Tray', store: 'bakerywholesalers.com', sku: 'PC-4T',     currentPrice: 899,  targetPrice: 750, originalPrice: 1099, stockStatus: 'in_stock', watcherCount: 15, notificationsSent: 15, lastUpdated: '2026-05-09' },
  { id: 'wp-6', name: 'Cake Decorating Kit — Pro',       store: 'bakerywholesalers.com', sku: 'CK-DEC-PRO', currentPrice: 349,  targetPrice: 299,            stockStatus: 'out_of_stock', watcherCount: 29, notificationsSent: 0,  lastUpdated: '2026-05-08' },
];

const STOCK_CONFIG: Record<StockStatus, { label: string; color: string }> = {
  out_of_stock: { label: 'Out of Stock', color: '#ff4444' },
  low_stock:    { label: 'Low Stock',    color: '#ffb347' },
  in_stock:     { label: 'In Stock',     color: '#10d98a' },
};

function WatchlistsPanel() {
  const [products, setProducts] = useState<WatchProduct[]>(WATCH_PRODUCTS);
  const [filter, setFilter] = useState<StockStatus | 'all'>('all');

  const notify = (id: string) => {
    setProducts(prev => prev.map(p => p.id !== id ? p : { ...p, notificationsSent: p.notificationsSent + p.watcherCount }));
  };

  const visible = filter === 'all' ? products : products.filter(p => p.stockStatus === filter);
  const totalWatchers = products.reduce((s, p) => s + p.watcherCount, 0);
  const outOfStock    = products.filter(p => p.stockStatus === 'out_of_stock');
  const priceDrop     = products.filter(p => p.originalPrice && p.currentPrice < p.originalPrice);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Watchers',     value: totalWatchers.toString(),           color: '#00d9ff' },
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
        <div className="rounded-xl p-3 flex items-center gap-2 text-xs" style={{ background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.25)' }}>
          <AlertTriangle size={13} style={{ color: '#ff4444', flexShrink: 0 }} />
          <span style={{ color: '#ff4444' }}>
            {outOfStock.reduce((s, p) => s + p.watcherCount, 0)} customers are waiting for back-in-stock alerts — notify them when items restock to recover revenue.
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Watchlist Products</span>
        <div className="flex gap-1 p-1 rounded-lg ml-auto" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {(['all', 'out_of_stock', 'low_stock', 'in_stock'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-2.5 py-1 rounded-md text-[11px] capitalize transition-all"
              style={{ background: filter === s ? 'var(--bg-elevated)' : 'transparent', color: filter === s ? 'var(--text-primary)' : 'var(--text-muted)', border: filter === s ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              {['Product', 'Store', 'Price', 'Target / Drop', 'Status', 'Watchers', 'Action'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
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
                    <div className="section-label text-[10px]">{p.sku}</div>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{p.store}</td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: 'var(--text-primary)' }}>${p.currentPrice.toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    {isPriceDrop ? (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#10d98a' }}>
                        <Tag size={10} /> -{savings}% (was ${p.originalPrice?.toLocaleString()})
                      </span>
                    ) : p.targetPrice ? (
                      <span className="section-label">Target: ${p.targetPrice.toLocaleString()}</span>
                    ) : <span className="section-label">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ color: sc.color, background: `${sc.color}18` }}>{sc.label}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                      <Users size={11} /> {p.watcherCount}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {p.notificationsSent > 0 ? (
                      <span className="text-[10px]" style={{ color: '#10d98a' }}>✓ {p.notificationsSent} notified</span>
                    ) : (
                      <button onClick={() => notify(p.id)} disabled={p.stockStatus === 'out_of_stock'}
                        className="text-[10px] px-2 py-1 rounded-lg font-medium disabled:opacity-40"
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

type ChurnRisk = 'high' | 'medium' | 'low';
interface CustomerInsight {
  id: string;
  name: string;
  email: string;
  store: string;
  clv: number;
  totalOrders: number;
  lastOrderDays: number;
  avgOrderValue: number;
  churnRisk: ChurnRisk;
  repeatRate: number;
  predictedNextOrder?: number;
}

const CUSTOMERS: CustomerInsight[] = [
  { id: 'ci-1', name: 'Oak Street Bakery',    email: 'orders@oakstreet.com',    store: 'donut-equipment.com',   clv: 28400, totalOrders: 14, lastOrderDays: 8,  avgOrderValue: 2028, churnRisk: 'low',    repeatRate: 91, predictedNextOrder: 22 },
  { id: 'ci-2', name: 'Metro Donuts LLC',      email: 'metro@metrodo.com',       store: 'donut-equipment.com',   clv: 19200, totalOrders: 9,  lastOrderDays: 34, avgOrderValue: 2133, churnRisk: 'medium', repeatRate: 72, predictedNextOrder: 14 },
  { id: 'ci-3', name: 'Sweet Rings Co.',       email: 'buy@sweetrings.co',       store: 'donut-supplies.com',    clv: 6840,  totalOrders: 38, lastOrderDays: 12, avgOrderValue: 180,  churnRisk: 'low',    repeatRate: 88, predictedNextOrder: 18 },
  { id: 'ci-4', name: 'Baker Bros Wholesale',  email: 'orders@bakerbros.net',    store: 'bakerywholesalers.com', clv: 14200, totalOrders: 21, lastOrderDays: 62, avgOrderValue: 676,  churnRisk: 'high',   repeatRate: 45, predictedNextOrder: undefined },
  { id: 'ci-5', name: 'Sunrise Bakehouse',     email: 'hello@sunrisebh.com',     store: 'donut-supplies.com',    clv: 4100,  totalOrders: 8,  lastOrderDays: 91, avgOrderValue: 512,  churnRisk: 'high',   repeatRate: 28, predictedNextOrder: undefined },
  { id: 'ci-6', name: 'Artisan Donut Works',   email: 'ops@artisandonut.com',    store: 'donut-equipment.com',   clv: 11800, totalOrders: 6,  lastOrderDays: 19, avgOrderValue: 1966, churnRisk: 'low',    repeatRate: 83, predictedNextOrder: 41 },
  { id: 'ci-7', name: 'Golden Ring Suppliers', email: 'sales@goldenring.com',    store: 'bakerywholesalers.com', clv: 22100, totalOrders: 47, lastOrderDays: 4,  avgOrderValue: 470,  churnRisk: 'low',    repeatRate: 96, predictedNextOrder: 6  },
  { id: 'ci-8', name: 'Central City Bakers',   email: 'central@ccbakers.com',    store: 'donut-supplies.com',    clv: 3200,  totalOrders: 5,  lastOrderDays: 78, avgOrderValue: 640,  churnRisk: 'high',   repeatRate: 31, predictedNextOrder: undefined },
];

const CHURN_CONFIG: Record<ChurnRisk, { label: string; color: string }> = {
  high:   { label: 'High Risk',   color: '#ff4444' },
  medium: { label: 'Medium Risk', color: '#ffb347' },
  low:    { label: 'Low Risk',    color: '#10d98a' },
};

function CustomerInsightsPanel() {
  const [sort, setSort] = useState<'clv' | 'churn' | 'days'>('clv');
  const [churnFilter, setChurnFilter] = useState<ChurnRisk | 'all'>('all');

  const totalClv     = CUSTOMERS.reduce((s, c) => s + c.clv, 0);
  const avgRepeat    = (CUSTOMERS.reduce((s, c) => s + c.repeatRate, 0) / CUSTOMERS.length).toFixed(1);
  const highRisk     = CUSTOMERS.filter(c => c.churnRisk === 'high').length;
  const avgClv       = Math.round(totalClv / CUSTOMERS.length);

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
          { label: 'Total Customer CLV',   value: c$(totalClv),                color: '#00d9ff' },
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
        <div className="rounded-xl p-3 flex items-center gap-2 text-xs" style={{ background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.25)' }}>
          <AlertTriangle size={13} style={{ color: '#ff4444', flexShrink: 0 }} />
          <span style={{ color: '#ff4444' }}>{highRisk} high-churn-risk customers haven't ordered in 60+ days — consider a win-back campaign via Email/SMS.</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Customer CLV & Churn Risk</span>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button key={f} onClick={() => setChurnFilter(f)}
              className="px-2.5 py-1 rounded-md text-[11px] capitalize transition-all"
              style={{ background: churnFilter === f ? 'var(--bg-elevated)' : 'transparent', color: churnFilter === f ? 'var(--text-primary)' : 'var(--text-muted)', border: churnFilter === f ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
              {f === 'all' ? 'All' : f + ' risk'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-lg ml-auto" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {([['clv', 'CLV'], ['churn', 'Risk'], ['days', 'Days Since Order']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSort(key)}
              className="px-2.5 py-1 rounded-md text-[11px] transition-all"
              style={{ background: sort === key ? 'var(--bg-elevated)' : 'transparent', color: sort === key ? 'var(--text-primary)' : 'var(--text-muted)', border: sort === key ? '1px solid var(--border-dim)' : '1px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-xs">
          <thead style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              {['Customer', 'Store', 'CLV', 'Orders', 'Avg Order', 'Last Order', 'Repeat Rate', 'Churn Risk', 'Next Order'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(c => {
              const cc = CHURN_CONFIG[c.churnRisk];
              return (
                <tr key={c.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td className="px-3 py-2.5">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                    <div className="section-label text-[10px]">{c.email}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.store}</td>
                  <td className="px-3 py-2.5 font-bold" style={{ color: '#00d9ff' }}>{c$(c.clv)}</td>
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
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ color: cc.color, background: `${cc.color}18` }}>{cc.label}</span>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'live' | 'sequences' | 'recovered' | 'exitintent' | 'upsell' | 'watchlists' | 'insights';

export default function CartPage() {
  const [tab, setTab] = useState<Tab>('live');
  const s = RECOVERY_STATS;

  const TABS = [
    { key: 'live' as Tab,        label: 'Live Carts',           icon: ShoppingCart, badge: ABANDONED_CARTS.length },
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

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 shrink-0">
            {[
              { label: 'Abandoned (30d)',    value: s.cartsAbandoned30d.toString(),   color: '#ffb347' },
              { label: 'Recovered (30d)',    value: s.cartsRecovered30d.toString(),    color: '#10d98a' },
              { label: 'Recovery Rate',      value: s.recoveryRate.toFixed(1) + '%',  color: '#00d9ff' },
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
              { label: 'Push Recovery Rate',  value: s.pushRecoveryRate,  Icon: Bell,          color: '#00d9ff' },
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: tab === t.key ? 'var(--bg-elevated)' : 'transparent',
                    color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: tab === t.key ? 500 : 400,
                    border: tab === t.key ? '1px solid var(--border-dim)' : '1px solid transparent',
                  }}>
                  <Icon size={13} />{t.label}
                  {t.badge ? <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
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
                    <span className="data-value text-xl font-bold" style={{ color: '#ffb347' }}>{ABANDONED_CARTS.length}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      active carts · {formatCurrency(s.totalCartValue)} at risk
                    </span>
                  </div>
                  <button className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: 'rgba(255,179,71,0.1)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.2)' }}>
                    Trigger All Recovery
                  </button>
                </div>
                <div className="space-y-2">
                  {ABANDONED_CARTS.map(cart => {
                    const store = getStoreById(cart.storeId);
                    const urgent = cart.minutesAgo < 15;
                    return (
                      <div key={cart.id} className="rounded-xl p-3"
                        style={{ background: urgent ? 'rgba(255,68,68,0.04)' : 'var(--bg-elevated)', border: `1px solid ${urgent ? 'rgba(255,68,68,0.15)' : 'var(--border-subtle)'}` }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{cart.customerName}</span>
                              <span className="text-[9px] font-mono" style={{ color: urgent ? '#ff4444' : 'var(--text-muted)' }}>{formatMinutesAgo(cart.minutesAgo)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              <MapPin size={9} />{cart.location}{store && <span>· {store.domain.split('.')[0]}</span>}
                              <span>· {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="data-value text-sm font-bold" style={{ color: '#ffb347' }}>{formatCurrency(cart.cartValue)}</div>
                            <div className="flex items-center gap-1 mt-1 justify-end">
                              {[{ sent: cart.recoveryEmailSent, Icon: Mail }, { sent: cart.smsSent, Icon: MessageSquare }].map(({ sent, Icon }, i) => (
                                <div key={i} className="p-1 rounded" style={{ background: sent ? 'rgba(16,217,138,0.1)' : 'rgba(123,147,255,0.1)', color: sent ? '#10d98a' : '#7b93ff' }}>
                                  <Icon size={10} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-1.5 pt-1.5 border-t text-[10px] truncate" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                          {cart.items[0].name}{cart.items.length > 1 ? ` +${cart.items.length - 1} more` : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === 'sequences' && (
              <div className="space-y-3">
                {SEQUENCES.map(seq => (
                  <div key={seq.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{seq.name}</div>
                        <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {seq.steps.length} steps · {seq.store} · <span style={{ color: '#10d98a' }}>Active</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="data-value text-sm font-bold" style={{ color: '#10d98a' }}>{c$(seq.revenue30d)}</div>
                        <div className="section-label">recovered (30d)</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      {seq.steps.map((step, i) => {
                        const Icon = CH_ICON_MAP[step.channel];
                        const color = CH_COL_MAP[step.channel];
                        return (
                          <div key={i} className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="flex-1 rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: `1px solid ${color}20` }}>
                              <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: color + '20' }}>
                                  <Icon size={11} style={{ color }} />
                                </div>
                                <span className="text-[9px] font-mono" style={{ color }}>+{step.delay}</span>
                              </div>
                              <div className="text-[11px] font-medium mb-2 leading-snug" style={{ color: 'var(--text-secondary)' }}>{step.subject}</div>
                              {[
                                { label: 'Open', value: step.openRate + '%', color: step.openRate > 50 ? '#10d98a' : '#ffb347' },
                                { label: 'Click', value: step.clickRate + '%', color: '#00d9ff' },
                                { label: 'Conv.', value: step.convRate + '%', color: '#7b93ff' },
                              ].map(m => (
                                <div key={m.label} className="flex items-center justify-between text-[10px]">
                                  <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                  <span className="font-mono font-semibold" style={{ color: m.color }}>{m.value}</span>
                                </div>
                              ))}
                            </div>
                            {i < seq.steps.length - 1 && (
                              <div className="text-[10px] mt-6 shrink-0" style={{ color: 'var(--text-muted)' }}>→</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'recovered' && (
              <div className="glass-card overflow-hidden">
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="section-label">Recently Recovered Carts</span>
                </div>
                {RECOVERED_LIST.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: CH_COLOR[r.channel] + '20' }}>
                      {r.channel === 'Email' ? <Mail size={11} style={{ color: CH_COLOR[r.channel] }} />
                       : r.channel === 'SMS' ? <MessageSquare size={11} style={{ color: CH_COLOR[r.channel] }} />
                       : <Bell size={11} style={{ color: CH_COLOR[r.channel] }} />}
                    </div>
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{r.customer}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: CH_COLOR[r.channel] + '18', color: CH_COLOR[r.channel] }}>via {r.channel}</span>
                    <span className="data-value text-sm font-semibold shrink-0" style={{ color: '#10d98a' }}>{c$(r.value)}</span>
                    <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-muted)', minWidth: 44 }}>{formatMinutesAgo(r.minutesAgo)}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'exitintent' && <ExitIntentPanel />}

            {tab === 'upsell' && <UpsellPanel />}

            {tab === 'watchlists' && <WatchlistsPanel />}

            {tab === 'insights' && <CustomerInsightsPanel />}

          </div>
        </main>
      </div>
    </div>
  );
}
