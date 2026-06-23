'use client';

export default function AccountSubscriptionPage() {
  return (
    <div className="px-6 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Subscription</h1>

      <div className="card mb-6 bg-gradient-to-r from-[var(--accent-purple)]/20 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-purple)]">Current Plan</span>
            <h2 className="text-2xl font-bold mt-1">Premium — $9.99/mo</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Renews Aug 15, 2026</p>
          </div>
          <button className="btn-secondary">Cancel Plan</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { name: 'Free', price: '$0', included: ['Streaming', 'Basic playlists'] },
          { name: 'Premium', price: '$9.99', current: true, included: ['Lossless audio', 'Offline downloads', 'Ad-free', 'Exclusive drops'] },
          { name: 'Artist Pro', price: '$19.99', included: ['All Premium', 'Advanced analytics', 'Priority support'] },
        ].map((tier) => (
          <div key={tier.name} className={`card ${tier.current ? 'border-[var(--accent-purple)]' : ''}`}>
            <h3 className="font-semibold">{tier.name} {tier.current && <span className="text-xs text-[var(--accent-purple)] ml-1">Current</span>}</h3>
            <p className="text-2xl font-bold mt-1">{tier.price}<span className="text-sm text-[var(--text-tertiary)]">{tier.price !== '$0' ? '/mo' : ''}</span></p>
            <ul className="mt-3 text-sm text-[var(--text-secondary)] space-y-1">
              {tier.included.map((f) => (<li key={f}>• {f}</li>))}
            </ul>
            <button className={tier.current ? 'btn-secondary w-full mt-4' : 'btn-primary w-full mt-4'}>{tier.current ? 'Current' : tier.price === 'Free' ? 'Downgrade' : 'Upgrade'}</button>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Billing History</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[var(--border-subtle)]"><th className="text-left py-2 text-[var(--text-tertiary)]">Date</th><th className="text-left py-2 text-[var(--text-tertiary)]">Amount</th><th className="text-left py-2 text-[var(--text-tertiary)]">Plan</th><th className="text-left py-2 text-[var(--text-tertiary)]">Status</th></tr></thead>
          <tbody>
            {[{ date: 'Jul 15, 2026', amount: '$9.99', plan: 'Premium', status: 'Paid' }, { date: 'Jun 15, 2026', amount: '$9.99', plan: 'Premium', status: 'Paid' }].map((b, i) => (
              <tr key={i} className="border-b border-[var(--border-subtle)]"><td className="py-2">{b.date}</td><td className="py-2">{b.amount}</td><td className="py-2">{b.plan}</td><td className="py-2 text-[var(--success)]">{b.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
