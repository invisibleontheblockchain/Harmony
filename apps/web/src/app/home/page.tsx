'use client';
import { useQuery } from '@tanstack/react-query';
import TrackCard from '@/components/cards/TrackCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';
import { fetchTracks, fetchRecommendations } from '@/lib/api-client';

export default function HomePage() {
  const { data: allTracks, isLoading: loadingAll } = useQuery({ queryKey: ['/api/tracks'] });
  const { data: recommendations, isLoading: loadingRecs } = useQuery({ queryKey: ['/api/recommendations?userId=me'] });

  const rows = [
    { title: 'Continue Listening', data: allTracks?.slice(0, 4) || [] },
    { title: 'New Releases', data: allTracks?.slice(4, 8) || [] },
    { title: 'Trending Now', data: allTracks?.slice(0, 6).reverse() || [] },
    { title: 'Recommended For You', data: recommendations || allTracks?.slice(2, 8) || [] },
  ];

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Good evening</h1>
      {rows.map((row) => (
        <section key={row.title} className="mb-10">
          <SectionHeader title={row.title} href={`/search?genre=${encodeURIComponent(row.title)}`} />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {loadingAll || loadingRecs ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonLoader key={i} variant="track" />)
            ) : row.data.length > 0 ? (
              row.data.map((track: any) => <TrackCard key={track.id} track={track} variant="horizontal" />)
            ) : (
              <EmptyState title="No tracks" description="Check back later for new releases." />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
