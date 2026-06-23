import { useState } from 'react';

interface SubscriptionTierCardProps {
  tier: {
    id: string;
    name: string;
    description?: string;
    price_cents: number;
    benefits?: string[];
    is_active?: boolean;
  };
}

export default function SubscriptionTierCard({ tier }: SubscriptionTierCardProps) {
  const [subbing, setSubbing] = useState(false);
  return (
    <div className="card hover:border-[var(--border-accent)] transition">
      <h3 className="font-semibold">{tier.name}</h3>
      <p className="text-2xl font-bold text-[var(--accent-purple)] mt-2">${tier.price_cents / 100}<span className="text-sm text-[var(--text-tertiary)]">/mo</span></p>
      {tier.description && <p className="text-sm text-[var(--text-secondary)] mt-1">{tier.description}</p>}
      {tier.benefits?.length && (
        <ul className="mt-3 text-sm text-[var(--text-secondary)] space-y-1">
          {tier.benefits.map((b) => (<li key={b}>• {b}</li>))}
        </ul>
      )}
      <button
        onClick={() => setSubbing(true)}
        className={`w-full mt-4 py-2 rounded-[var(--radius-md)] font-medium text-sm transition ${subbing ? 'bg-[var(--accent-purple)] text-white' : 'btn-primary'}`}
      >
        {subbing ? 'Subscribed!' : 'Subscribe'}
      </button>
    </div>
  );
}
