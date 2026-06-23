'use client';
import { useQuery } from '@tanstack/react-query';

export default function AnalyticsPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Audience Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Streams Over Time</h2>
          <div className="h-48 flex items-end gap-2">
            {[120, 190, 150, 220, 280, 350, 310].map((val, i) => (
              <div key={i} className="flex-1 bg-[var(--accent-purple)] rounded-t-md" style={{ height: `${(val / 350) * 100}%` }} />
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Listener Growth</h2>
          <div className="h-48 flex items-end gap-2">
            {[50, 80, 120, 180, 240, 310, 420].map((val, i) => (
              <div key={i} className="flex-1 bg-[var(--accent-cyan)] rounded-t-md" style={{ height: `${(val / 420) * 100}%` }} />
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Top Sources</h2>
          <div className="space-y-2">
            {[{ source: 'Direct', pct: 40 }, { source: 'Search', pct: 30 }, { source: 'Playlists', pct: 20 }, { source: 'Social', pct: 10 }].map((s) => (
              <div key={s.source} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1"><span>{s.source}</span><span className="text-[var(--text-secondary)]">{s.pct}%</span></div>
                  <div className="h-2 rounded-full bg-[var(--bg-tertiary)]"><div className="h-2 rounded-full bg-[var(--accent-purple)]" style={{ width: `${s.pct}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Per-Track Performance</h2>
          <div className="space-y-3">
            {[{ title: 'Midnight Echoes', streams: 4520 }, { title: 'Neon Drift', streams: 3180 }, { title: 'Crystal Caves', streams: 2100 }].map((t) => (
              <div key={t.title} className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.title}</span>
                <span className="text-sm text-[var(--text-secondary)]">{t.streams.toLocaleString()} streams</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
