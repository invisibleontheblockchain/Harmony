'use client';
import { useQuery } from '@tanstack/react-query';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';
import { Play } from 'lucide-react';

export default function AlbumPage({ params }: { params: { id: string } }) {
  const tracks = [
    { id: `${params.id}-1`, title: 'Intro', artist: 'Aurora Veil' },
    { id: `${params.id}-2`, title: 'Midnight Echoes', artist: 'Aurora Veil' },
    { id: `${params.id}-3`, title: 'Starlight', artist: 'Aurora Veil' },
  ];

  return (
    <div>
      <div className="h-64 bg-gradient-to-br from-[var(--accent-purple)]/20 to-transparent flex items-end p-8">
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] shadow-2xl" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Album</span>
            <h1 className="text-5xl font-bold mt-2">Ethereal</h1>
            <p className="text-[var(--text-secondary)] mt-2">Aurora Veil • 2024 • 12 tracks</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <button className="btn-primary mb-6"><Play size={18} /> Play All</button>
        <div className="space-y-1">
          {tracks.map((t, i) => (
            <div key={t.id} className="flex items-center gap-4 hover:bg-[var(--bg-hover)] rounded-md px-3 py-2 transition">
              <span className="w-6 text-center text-sm text-[var(--text-tertiary)]">{i + 1}</span>
              <TrackCard track={t} variant="compact" />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">More from Aurora Veil</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <TrackCard key={i} track={{ id: `more-${i}`, title: `Another Track ${i + 1}`, artist: 'Aurora Veil' }} variant="vertical" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
