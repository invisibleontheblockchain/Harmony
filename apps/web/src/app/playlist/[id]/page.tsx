'use client';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';
import { Play } from 'lucide-react';

export default function PlaylistPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="h-48 bg-gradient-to-br from-[var(--accent-purple)]/30 to-transparent flex items-end p-6">
        <div>
          <h1 className="text-4xl font-bold">Chill Vibes</h1>
          <p className="text-[var(--text-secondary)] mt-1">12 tracks • 48 min</p>
        </div>
      </div>
      <div className="px-6 py-4">
        <button className="btn-primary mb-6"><Play size={18} /> Play All</button>
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrackCard key={i} track={{ id: `${params.id}-${i}`, title: `Track ${i + 1}`, artist: 'Various Artists' }} variant="list" />
          ))}
        </div>
      </div>
    </div>
  );
}
