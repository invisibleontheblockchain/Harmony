'use client';

export default function AccountPreferencesPage() {
  return (
    <div className="px-6 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">App Preferences</h1>
      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Audio Quality</p><p className="text-xs text-[var(--text-secondary)]">Default streaming bitrate</p></div>
          <select className="input w-auto"><option>High (320kbps)</option><option>Medium</option><option>Low</option></select>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Autoplay</p><p className="text-xs text-[var(--text-secondary)]">Continue playing similar tracks</p></div>
          <button className="w-12 h-6 rounded-full bg-[var(--accent-purple)]"><div className="w-5 h-5 rounded-full bg-white shadow translate-x-6 mt-0.5" /></button>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Explicit Content</p><p className="text-xs text-[var(--text-secondary)]">Show explicit tracks</p></div>
          <button className="w-12 h-6 rounded-full bg-[var(--accent-purple)]"><div className="w-5 h-5 rounded-full bg-white shadow translate-x-6 mt-0.5" /></button>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Push Notifications</p><p className="text-xs text-[var(--text-secondary)]">Email and push alerts</p></div>
          <button className="w-12 h-6 rounded-full bg-[var(--accent-purple)]"><div className="w-5 h-5 rounded-full bg-white shadow translate-x-6 mt-0.5" /></button>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Language</p></div>
          <select className="input w-auto"><option>English</option><option>Spanish</option><option>French</option></select>
        </div>
      </div>
    </div>
  );
}
