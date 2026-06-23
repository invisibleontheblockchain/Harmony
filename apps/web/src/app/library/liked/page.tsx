'use client';
import { useQuery } from '@tanstack/react-query';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';

export default function LikedTracksPage() {
  const { data: liked } = useQuery({ queryKey: ['/api/library/liked'], queryFn: () => fetch('/api/library/liked').then(r => r.json()) });

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Liked Tracks</h1>
      <div className="space-y-2">
        {liked?.length ? liked.map((track: any) => <TrackCard key={track.id} track={track} variant="list" />) : <EmptyState title="No liked tracks" description="Tracks you like will appear here." />}
      </div>
    </div>
  );
}
