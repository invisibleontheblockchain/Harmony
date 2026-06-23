export default function page() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-purple)]/20 via-transparent to-[var(--accent-pink)]/20" />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] bg-clip-text text-transparent">
            Where Sound Lives on Chain
          </h1>
          <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Stream, own, and earn from music. Harmony connects artists directly to fans with transparent royalty splits, NFT collectibles, and community governance.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="/signup" className="btn-primary px-6 py-3 text-base">Start Listening Free</a>
            <a href="/onboarding" className="btn-secondary px-6 py-3 text-base">For Artists</a>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Built for the Future of Music</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'For Listeners', desc: 'Discover new artists, build playlists, own track NFTs, and support creators directly.' },
              { title: 'For Artists', desc: 'Upload tracks, split royalties automatically, mint NFTs, and keep 85% of revenue.' },
              { title: 'For Collectors', desc: 'Buy and sell music NFTs with on-chain provenance and enforced royalties on every sale.' },
            ].map((item) => (
              <div key={item.title} className="card">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Free', price: '$0', features: ['Unlimited streaming', 'Basic playlists', 'Community features'] },
              { name: 'Premium', price: '$9.99/mo', features: ['Lossless audio', 'Offline downloads', 'Ad-free', 'Exclusive drops'] },
              { name: 'Artist Pro', price: '$19.99/mo', features: ['All Premium features', 'Advanced analytics', 'Priority support', 'Early access'] },
            ].map((tier) => (
              <div key={tier.name} className="card text-center">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="text-3xl font-bold text-[var(--accent-purple)] mt-2">{tier.price}</p>
                <ul className="mt-4 text-sm text-[var(--text-secondary)] space-y-2">
                  {tier.features.map((f) => (<li key={f}>{f}</li>))}
                </ul>
                <button className="btn-primary w-full mt-6">{tier.name === 'Free' ? 'Get Started' : 'Subscribe'}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-[var(--text-tertiary)]">
          <p>Harmony Music Platform. Where Sound Lives on Chain.</p>
        </div>
      </footer>
    </div>
  );
}
