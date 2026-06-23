export default function AccountPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Account</h1>
      <div className="flex gap-6 h-[calc(100vh-10rem)]">
        <nav className="w-48 space-y-1">
          {[
            { href: '/account/profile', label: 'Edit Profile' },
            { href: '/account/preferences', label: 'App Preferences' },
            { href: '/account/subscription', label: 'Subscription' },
            { href: '/account/wallet', label: 'Wallet' },
            { href: '/account/payouts', label: 'Payout Setup' },
            { href: '/account/security', label: 'Security' },
          ].map((item) => (
            <a key={item.href} href={item.href} className="block px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex-1">
          <p className="text-[var(--text-secondary)]">Select a section from the left to manage your account settings.</p>
          <div className="space-y-3 mt-4">
            {[
              { href: '/account/profile', title: 'Edit Profile', desc: 'Avatar, header, bio, social links' },
              { href: '/account/preferences', title: 'App Preferences', desc: 'Audio quality, autoplay, notifications' },
              { href: '/account/subscription', title: 'Subscription', desc: 'Current plan, upgrade, billing' },
              { href: '/account/wallet', title: 'Wallet', desc: 'Connected wallets, Web3' },
              { href: '/account/payouts', title: 'Payout Setup', desc: 'Stripe Connect configuration' },
              { href: '/account/security', title: 'Security', desc: 'Password, 2FA, active sessions' },
            ].map((item) => (
              <a key={item.href} href={item.href} className="card flex items-center justify-between hover:border-[var(--border-accent)] transition">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
