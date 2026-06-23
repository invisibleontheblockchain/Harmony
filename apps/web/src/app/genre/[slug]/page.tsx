'use client';
import { useQuery } from '@tanstack/react-query';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';

export default function GenrePage({ params }: { params: { slug: string } }) {
  const genre = decodeURIComponent(params.slug);
  const { data: tracks } = useQuery({
    queryKey: ['/api/tracks', { genre }],
    queryFn: () => fetch(`/api/tracks?genre=${encodeURIComponent(genre)}`).then(r => r.json()),
  });

  return (
    <div className="px-6 py-8">
      <div className="h-48 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--accent-purple)]/30 to-[var(--accent-pink)]/20 mb-8 flex items-end p-6">
        <div>
          <h1 className="text-4xl font-bold capitalize">{genre}</h1>
          <p className="text-[var(--text-secondary)] mt-1">Top tracks and new releases</p>
        </div>
      </div>

      <section className="mb-10">
        <SectionHeader title="Top Tracks" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tracks?.length ? tracks.map((t: any) => <TrackCard key={t.id} track={t} variant="vertical" />) : <EmptyState title="No tracks" description="No tracks in this genre yet." />}
        </div>
      </section>
    </div>
  );
}
