'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchTracks } from '@/lib/api-client';
import TrackCard from '@/components/cards/TrackCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import EmptyState from '@/components/ui/EmptyState';

export default function SearchQueryPage({ params }: { params: { query: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/tracks/search', params.query],
    queryFn: () => fetch('/api/tracks/search').then(r => r.json()),
  });

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Results for &quot;{params.query}&quot;</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonLoader key={i} variant="track" />)}
        </div>
      ) : data?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((track: any) => <TrackCard key={track.id} track={track} variant="vertical" />)}
        </div>
      ) : (
        <EmptyState title="No results" description="Try another search term." />
      )}
    </div>
  );
}
