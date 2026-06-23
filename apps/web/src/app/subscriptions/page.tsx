'use client';
import { useQuery } from '@tanstack/react-query';
import SubscriptionTierCard from '@/components/cards/SubscriptionTierCard';
import EmptyState from '@/components/ui/EmptyState';

export default function SubscriptionsPage() {
  const { data: tiers } = useQuery({
    queryKey: ['/api/subscriptions/tiers'],
    queryFn: () => fetch('/api/subscriptions/tiers').then(r => r.json()),
  });

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Subscriptions</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">My Subscriptions</h2>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Aurora Veil — Superfan</p>
              <p className="text-sm text-[var(--text-secondary)]">$15/mo • Renews Aug 15</p>
            </div>
            <button className="btn-secondary">Manage</button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Discover Artists</h2>
        {tiers?.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers.map((tier: any) => <SubscriptionTierCard key={tier.id} tier={tier} />)}
          </div>
        ) : (
          <EmptyState title="No subscription tiers" description="Check back later." />
        )}
      </section>
    </div>
  );
}
