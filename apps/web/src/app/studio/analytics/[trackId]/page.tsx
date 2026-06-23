'use client';
import { useQuery } from '@tanstack/react-query';

export default function TrackAnalyticsPage({ params }: { params: { trackId: string } }) {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics — Track {params.trackId}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Streams by Hour</h2>
          <div className="h-48 flex items-end gap-1">
            {Array.from({ length: 24 }).map((_, i) => <div key={i} className="flex-1 bg-[var(--accent-purple)] rounded-t" style={{ height: `${Math.random() * 100}%` }} />)}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Listener Retention</h2>
          <div className="h-48 flex items-end gap-2">
            {[100, 75, 60, 48, 38, 30].map((val, i) => (
              <div key={i} className="flex-1 bg-[var(--accent-cyan)] rounded-t" style={{ height: `${val}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
