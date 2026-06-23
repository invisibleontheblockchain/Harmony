'use client';
import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTracks } from '@/lib/api-client';
import TrackCard from '@/components/cards/TrackCard';
import SectionHeader from '@/components/ui/SectionHeader';

export default function LibraryPage() {
  const { data: tracks } = useQuery({ queryKey: ['/api/tracks'], queryFn: () => fetchTracks() });

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Library</h1>

      <div className="flex gap-2 mb-6 border-b border-[var(--border-subtle)] pb-2">
        {['Playlists', 'Liked', 'History', 'Following'].map((tab) => (
          <button key={tab} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-b-2 border-transparent hover:border-[var(--border-default)] transition">
            {tab}
          </button>
        ))}
      </div>

      <section className="mb-10">
        <SectionHeader title="Liked Tracks" href="/library/liked" />
        <div className="space-y-2">
          {tracks?.slice(0, 6).map((track: any) => <TrackCard key={track.id} track={track} variant="compact" />)}
        </div>
      </section>
    </div>
  );
}
