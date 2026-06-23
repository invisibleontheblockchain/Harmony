'use client';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';

export default function HistoryPage() {
  const history = [
    { id: '1', title: 'Midnight Echoes', artist: 'Aurora Veil', playedAt: '2 hours ago' },
    { id: '2', title: 'Neon Drift', artist: 'Solar Flare', playedAt: '5 hours ago' },
    { id: '3', title: 'Crystal Caves', artist: 'Deep Resonance', playedAt: 'Yesterday' },
  ];

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Recently Played</h1>
        <button className="text-sm text-[var(--error)] hover:underline">Clear History</button>
      </div>
      <div className="space-y-2">
        {history.map((track) => <TrackCard key={track.id} track={track} variant="list" />)}
      </div>
      {!history.length && <EmptyState title="No history" description="Tracks you play will appear here." />}
    </div>
  );
}
