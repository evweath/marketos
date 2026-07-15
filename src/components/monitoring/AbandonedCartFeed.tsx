'use client';

import { usePersistentState } from '@/lib/usePersistentState';
import type { AbandonedCart } from '@/types';
import { formatCurrency, formatMinutesAgo } from '@/lib/mockData';
import { Mail, MessageSquare, MapPin, ShoppingBag, CheckCircle, Send } from 'lucide-react';

interface Props {
  carts: AbandonedCart[];
  storeColor: string;
}

function CustomerAvatar({ name }: { name: string }) {
  const initial = name.trim()[0]?.toUpperCase() ?? '?';
  // Pick a deterministic hue from the name
  const hue = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;
  return (
    <div
      className='w-7 h-7 rounded-full flex items-center justify-center text-[16px] font-bold shrink-0'
      style={{
        background: `hsla(${hue},55%,35%,0.4)`,
        border: `1px solid hsla(${hue},55%,55%,0.3)`,
        color: `hsla(${hue},80%,75%,1)`,
      }}>
      {initial}
    </div>
  );
}

interface RecoveryIconProps {
  sent: boolean;
  icon: React.ReactNode;
  sentTitle: string;
  pendingTitle: string;
  onSend?: () => void;
}

function RecoveryIcon({ sent, icon, sentTitle, pendingTitle, onSend }: RecoveryIconProps) {
  const style: React.CSSProperties = {
    background: sent ? 'rgba(16,217,138,0.12)' : 'rgba(123,147,255,0.1)',
    border: `1px solid ${sent ? 'rgba(16,217,138,0.25)' : 'rgba(123,147,255,0.2)'}`,
    color: sent ? '#10d98a' : '#7b93ff',
  };
  const content = sent ? <CheckCircle size={10} /> : icon;
  if (sent || !onSend) {
    return (
      <div
        className='flex items-center justify-center w-6 h-6 rounded'
        title={sent ? sentTitle : pendingTitle}
        style={style}>
        {content}
      </div>
    );
  }
  return (
    <button
      onClick={onSend}
      className='flex items-center justify-center w-6 h-6 rounded transition-all'
      title={pendingTitle}
      style={style}>
      {content}
    </button>
  );
}

export default function AbandonedCartFeed({ carts: initialCarts, storeColor: _storeColor }: Props) {
  const [carts, setCarts] = usePersistentState('monitoring.carts', initialCarts);

  const triggerAllRecovery = () =>
    setCarts(prev => prev.map(c => ({ ...c, recoveryEmailSent: true, smsSent: true })));

  const sendRecovery = (id: string, channel: 'email' | 'sms') =>
    setCarts(prev => prev.map(c => c.id !== id ? c
      : channel === 'email' ? { ...c, recoveryEmailSent: true } : { ...c, smsSent: true }));

  if (carts.length === 0) {
    return (
      <div className='glass-card p-4'>
        <div className='section-label mb-3'>Abandoned Carts — Live</div>
        <div className='flex items-center justify-center py-8' style={{ color: 'var(--text-muted)' }}>
          <span className='text-base'>No abandoned carts right now</span>
        </div>
      </div>
    );
  }

  const totalValue = carts.reduce((sum, c) => sum + c.cartValue, 0);

  return (
    <div className='glass-card p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div>
          <div className='section-label mb-1.5'>Abandoned Carts — Live</div>
          <div className='flex items-center gap-2'>
            <div className='w-1.5 h-1.5 rounded-full live-dot-amber' style={{ background: '#ffb347' }} />
            <span className='font-mono text-xl font-bold' style={{ color: '#ffb347' }}>
              {carts.length}
            </span>
            <span className='text-base' style={{ color: 'var(--text-muted)' }}>
              active —{' '}
              <span style={{ color: '#ffb347' }}>{formatCurrency(totalValue)}</span>
              {' '}at risk
            </span>
          </div>
        </div>
        <button onClick={triggerAllRecovery}
          className='flex items-center gap-1.5 text-base px-3 py-1.5 rounded-lg font-medium transition-all'
          style={{
            background: 'rgba(0,217,255,0.08)',
            color: 'var(--cyan)',
            border: '1px solid rgba(0,217,255,0.2)',
          }}>
          <Send size={11} />
          Trigger All Recovery
        </button>
      </div>

      <div className='space-y-2'>
        {carts.map(cart => {
          const timeColor = cart.minutesAgo < 10 ? '#ff4444' : cart.minutesAgo < 30 ? '#ffb347' : 'var(--text-muted)';
          return (
            <div key={cart.id} className='rounded-lg p-3'
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>

              {/* Main row */}
              <div className='flex items-start gap-2.5'>
                <CustomerAvatar name={cart.customerName} />

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-0.5'>
                    <span className='text-base font-semibold truncate' style={{ color: 'var(--text-primary)' }}>
                      {cart.customerName}
                    </span>
                    <span className='text-[16px] font-mono shrink-0' style={{ color: timeColor }}>
                      {formatMinutesAgo(cart.minutesAgo)}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-[16px]' style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={9} />
                    <span>{cart.location}</span>
                    <span>·</span>
                    <ShoppingBag size={9} />
                    <span>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className='shrink-0 text-right'>
                  <div className='font-mono text-base font-bold mb-1' style={{ color: '#ffb347' }}>
                    {formatCurrency(cart.cartValue)}
                  </div>
                  <div className='flex items-center gap-1 justify-end'>
                    <RecoveryIcon
                      sent={cart.recoveryEmailSent}
                      icon={<Mail size={10} />}
                      sentTitle='Email sent'
                      pendingTitle='Send recovery email'
                      onSend={() => sendRecovery(cart.id, 'email')}
                    />
                    <RecoveryIcon
                      sent={cart.smsSent}
                      icon={<MessageSquare size={10} />}
                      sentTitle='SMS sent'
                      pendingTitle='Send recovery SMS'
                      onSend={() => sendRecovery(cart.id, 'sms')}
                    />
                  </div>
                </div>
              </div>

              {/* Item preview */}
              <div className='mt-2 pt-2 border-t' style={{ borderColor: 'var(--border-subtle)' }}>
                {cart.items.slice(0, 2).map((item, i) => (
                  <div key={i} className='flex items-center justify-between text-[16px] py-0.5'>
                    <span className='truncate' style={{ color: 'var(--text-secondary)', maxWidth: '70%' }}>
                      {item.qty > 1 && <span style={{ color: 'var(--text-muted)' }}>{item.qty}× </span>}
                      {item.name}
                    </span>
                    <span className='font-mono' style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(item.qty * item.price)}
                    </span>
                  </div>
                ))}
                {cart.items.length > 2 && (
                  <div className='text-[16px] pt-0.5' style={{ color: 'var(--text-muted)' }}>
                    +{cart.items.length - 2} more item{cart.items.length - 2 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
