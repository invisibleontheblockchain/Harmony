'use client';
import Link from 'next/link';
import { Play, ListMusic } from 'lucide-react';

export default function QueuePage() {
  const queue = [
    { id: '1', title: 'Midnight Echoes', artist: 'Aurora Veil', isPlaying: true },
    { id: '2', title: 'Neon Drift', artist: 'Solar Flare' },
    { id: '3', title: 'Crystal Caves', artist: 'Deep Resonance' },
    { id: '4', title: 'Pulse', artist: 'Rhythm Theory' },
  ];

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Queue</h1>
        <button className="btn-secondary"><ListMusic size={18} /> Save as Playlist</button>
      </div>

      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-[var(--text-tertiary)] mb-3">NOW PLAYING</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)]" />
          <div className="flex-1">
            <p className="font-semibold">{queue[0].title}</p>
            <p className="text-sm text-[var(--text-secondary)]">{queue[0].artist}</p>
          </div>
          <button className="text-[var(--accent-purple)]"><Play size={24} /></button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[var(--text-tertiary)] mb-3">UP NEXT</h2>
        <div className="space-y-2">
          {queue.slice(1).map((track) => (
            <div key={track.id} className="card flex items-center gap-4">
              <div className="w-16 h-16 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)]" />
              <div className="flex-1">
                <p className="font-medium">{track.title}</p>
                <p className="text-sm text-[var(--text-secondary)]">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
