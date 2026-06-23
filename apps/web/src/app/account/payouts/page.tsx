'use client';

export default function AccountPayoutsPage() {
  return (
    <div className="px-6 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Payout Setup</h1>

      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Stripe Connect</h2>
            <p className="text-sm text-[var(--success)] mt-1">Connected</p>
            <p className="text-xs text-[var(--text-secondary)]">stripe.connect@harmony.fm</p>
          </div>
          <button className="btn-secondary">Manage</button>
        </div>
      </div>

      <div className="card bg-[var(--bg-tertiary)] mb-6">
        <p className="text-sm text-[var(--text-secondary)]">Minimum payout threshold: <span className="text-[var(--accent-purple)] font-semibold">$10.00</span></p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">You must accumulate at least $10 in royalties before requesting a payout.</p>
      </div>

      <button className="btn-primary">Request Payout</button>
    </div>
  );
}
