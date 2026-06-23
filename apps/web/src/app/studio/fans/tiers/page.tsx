'use client';
import { useState } from 'react';

export default function FansTiersPage() {
  const [tiers, setTiers] = useState([
    { id: '1', name: 'Supporter', price: 500, benefits: ['Early access', 'Exclusive posts'] },
    { id: '2', name: 'Superfan', price: 1500, benefits: ['All Supporter benefits', 'Monthly demo feedback', 'Discord access'] },
    { id: '3', name: 'VIP', price: 5000, benefits: ['All Superfan benefits', 'Monthly 1:1', 'Production tutorials'] },
  ]);

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Subscription Tiers</h1>
      <div className="space-y-4">
        {tiers.map((tier) => (
          <div key={tier.id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold">{tier.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">${tier.price / 100}/mo</p>
              <p className="text-xs text-[var(--text-tertiary)]">{tier.benefits.join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary">Edit</button>
              <button className="text-[var(--error)] text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-primary mt-6">Create Tier</button>
    </div>
  );
}
