'use client';
import Link from 'next/link';
import { DollarSign, TrendingUp, Music2, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function StudioPage() {
  const { data: stats } = useQuery({
    queryKey: ['/api/studio/earnings'],
    queryFn: () => fetch('/api/studio/earnings').then(r => r.json()),
  });

  const placeholderStats = [
    { label: 'Total Earnings', value: '$3,240.50', icon: DollarSign },
    { label: 'This Month', value: '$420.00', icon: TrendingUp },
    { label: 'Total Streams', value: '48.2K', icon: Music2 },
    { label: 'NFT Sales', value: '12', icon: ShoppingBag },
  ];

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Artist Studio</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {placeholderStats.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[var(--radius-md)] bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]">
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Weekly Streams</h2>
          <div className="h-48 flex items-end gap-2">
            {[120, 190, 150, 220, 280, 350, 310].map((val, i) => (
              <div key={i} className="flex-1 bg-[var(--accent-purple)] rounded-t-md" style={{ height: `${(val / 350) * 100}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[var(--text-tertiary)]">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Revenue Breakdown</h2>
          <div className="space-y-3">
            {[{ label: 'Streaming', value: '65%', amount: '$2,106' }, { label: 'NFT Sales', value: '25%', amount: '$810' }, { label: 'Subscriptions', value: '10%', amount: '$324' }].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="text-[var(--text-secondary)]">{item.value} • {item.amount}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)]">
                  <div className="h-2 rounded-full bg-[var(--accent-purple)]" style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upload Track', href: '/studio/upload' },
          { label: 'Manage Catalog', href: '/studio/catalog' },
          { label: 'Earnings', href: '/studio/earnings' },
          { label: 'Analytics', href: '/studio/analytics' },
          { label: 'NFT Collection', href: '/studio/nfts' },
          { label: 'Fan Subscriptions', href: '/studio/fans' },
          { label: 'DAO Proposals', href: '/studio/dao/create' },
        ].map((action) => (
          <Link key={action.label} href={action.href} className="card hover:border-[var(--border-accent)] transition">
            <p className="font-medium">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
