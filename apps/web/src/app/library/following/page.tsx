'use client';
import { Play } from 'lucide-react';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';

export default function FollowingPage() {
  const artists = [
    { id: '1', name: 'Aurora Veil', avatar: '', latestRelease: 'Midnight Echoes' },
    { id: '2', name: 'Solar Flare', avatar: '', latestRelease: 'Neon Drift' },
  ];

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Following Feed</h1>
      <div className="flex gap-2 mb-6 border-b border-[var(--border-subtle)] pb-2">
        {['All', 'Tracks', 'Albums', 'EPs'].map((tab) => (
          <button key={tab} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">{tab}</button>
        ))}
      </div>
      <div className="space-y-4">
        {artists.map((a) => (
          <div key={a.id} className="card flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">Latest: {a.latestRelease}</p>
            </div>
            <button className="btn-secondary"><Play size={16} /> Play All</button>
          </div>
        ))}
        {!artists.length && <EmptyState title="Not following anyone" description="Find artists to follow." />}
      </div>
    </div>
  );
}
