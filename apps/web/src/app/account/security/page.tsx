'use client';

export default function AccountSecurityPage() {
  return (
    <div className="px-6 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Security</h1>
      <div className="space-y-4">
        <div className="card">
          <h2 className="font-semibold">Password</h2>
          <p className="text-sm text-[var(--text-secondary)]">Change your account password</p>
          <button className="btn-secondary mt-3">Change Password</button>
        </div>
        <div className="card">
          <h2 className="font-semibold">Two-Factor Authentication</h2>
          <p className="text-sm text-[var(--text-secondary)]">Add an extra layer of security with TOTP</p>
          <button className="btn-primary mt-3">Enable 2FA</button>
        </div>
        <div className="card">
          <h2 className="font-semibold">Active Sessions</h2>
          <div className="mt-3 space-y-2">
            {[
              { device: 'Chrome on macOS — New York', active: true },
              { device: 'Safari on iPhone — Los Angeles', active: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                <div><p className="text-sm font-medium">{s.device}</p><p className="text-xs text-[var(--text-tertiary)]">{s.active ? 'Active now' : '2 hours ago'}</p></div>
                {!s.active && <button className="text-xs text-[var(--error)]">Revoke</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
