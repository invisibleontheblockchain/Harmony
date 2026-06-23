'use client';
import { useQuery } from '@tanstack/react-query';
import SubscriptionTierCard from '@/components/cards/SubscriptionTierCard';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';

export default function FansPage() {
  const { data: subscribers } = useQuery({
    queryKey: ['/api/studio/fans'],
    queryFn: () => fetch('/api/studio/fans').then(r => r.json()),
  });

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Fan Subscriptions</h1>
        <Link href="/studio/fans/tiers" className="btn-secondary">Manage Tiers</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Subscribers', value: '142' },
          { label: 'Monthly Revenue', value: '$1,240' },
          { label: 'Active Tiers', value: '3 of 3' },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Subscribers</h2>
        {subscribers?.length ? (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border-subtle)]"><th className="text-left py-2 text-[var(--text-tertiary)]">Fan</th><th className="text-left py-2 text-[var(--text-tertiary)]">Tier</th><th className="text-left py-2 text-[var(--text-tertiary)]">Status</th><th className="text-left py-2 text-[var(--text-tertiary)]">Renewal</th></tr></thead>
            <tbody>
              {subscribers.map((sub: any) => (
                <tr key={sub.id} className="border-b border-[var(--border-subtle)]">
                  <td className="py-2">{sub.fan_name}</td>
                  <td className="py-2">{sub.tier_name}</td>
                  <td className="py-2 capitalize">{sub.status}</td>
                  <td className="py-2 text-[var(--text-secondary)]">{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <EmptyState title="No subscribers yet" description="Create tiers to start accepting subscriptions." />}
      </div>
    </div>
  );
}
