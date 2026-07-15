'use client';

import type { Transaction } from '@/types';
import { formatCurrency, formatMinutesAgo } from '@/lib/mockData';
import { Package } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  storeColor: string;
}

const CHANNEL_CONFIG: Record<string, { label: string; color: string }> = {
  'organic':     { label: 'Organic',    color: '#10d98a' },
  'paid-google': { label: 'Google',     color: 'var(--cyan)' },
  'email':       { label: 'Email',      color: '#ffb347' },
  'social':      { label: 'Social',     color: '#ff4444' },
  'direct':      { label: 'Direct',     color: '#7b93ff' },
};

export default function TransactionFeed({ transactions, storeColor }: Props) {
  if (transactions.length === 0) {
    return (
      <div className='glass-card p-4'>
        <div className='section-label mb-3'>Live Orders</div>
        <div className='flex items-center justify-center py-8' style={{ color: 'var(--text-muted)' }}>
          <span className='text-base'>No recent orders</span>
        </div>
      </div>
    );
  }

  return (
    <div className='glass-card p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div>
          <div className='section-label mb-1.5'>Live Orders</div>
          <div className='flex items-center gap-2'>
            <div className='w-1.5 h-1.5 rounded-full live-dot' style={{ background: storeColor }} />
            <span className='font-mono text-base font-bold' style={{ color: 'var(--text-primary)' }}>
              {transactions.length}
            </span>
            <span className='text-base' style={{ color: 'var(--text-muted)' }}>recent orders</span>
          </div>
        </div>
        <Package size={14} style={{ color: 'var(--text-muted)' }} />
      </div>

      <div className='space-y-px'>
        {transactions.map((tx, i) => {
          const ch = CHANNEL_CONFIG[tx.channel] ?? { label: tx.channel, color: 'var(--text-secondary)' };
          const isEven = i % 2 === 0;
          return (
            <div key={tx.id}
              className='group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors'
              style={{
                background: isEven ? 'var(--bg-elevated)' : 'rgba(var(--overlay-rgb),0.015)',
              }}>

              {/* Order # */}
              <span className='font-mono text-[16px] shrink-0 w-20 tabular-nums' style={{ color: 'var(--text-muted)' }}>
                {tx.orderNumber}
              </span>

              {/* Customer */}
              <span className='text-base flex-1 truncate' style={{ color: 'var(--text-secondary)' }}>
                {tx.customerName}
              </span>

              {/* Channel pill */}
              <span className='text-[16px] font-mono font-medium px-2 py-0.5 rounded-full shrink-0'
                style={{
                  background: ch.color + '18',
                  color: ch.color,
                  border: `1px solid ${ch.color}28`,
                }}>
                {ch.label}
              </span>

              {/* Amount */}
              <span className='font-mono text-base font-bold shrink-0' style={{ color: '#10d98a' }}>
                {formatCurrency(tx.amount)}
              </span>

              {/* Time */}
              <span className='font-mono text-[16px] shrink-0 tabular-nums'
                style={{ color: 'var(--text-muted)', minWidth: 44, textAlign: 'right' }}>
                {formatMinutesAgo(tx.minutesAgo)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
