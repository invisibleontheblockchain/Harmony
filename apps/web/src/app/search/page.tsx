'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchTracks } from '@/lib/api-client';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: results, isLoading } = useQuery({
    queryKey: ['/api/tracks/search', query],
    queryFn: () => searchTracks(query, 40),
    enabled: query.length > 2,
  });

  const categories = ['Electronic', 'Hip-Hop', 'Rock', 'Jazz', 'Classical', 'Pop', 'Ambient', 'Techno', 'R&B', 'Lo-Fi'];

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Discover</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tracks, artists, albums..."
        className="input mb-6 max-w-xl"
      />

      {!query && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Browse Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setQuery(c.toLowerCase())}
                className="px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm hover:border-[var(--accent-purple)] transition"
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      )}

      {query && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Results for &quot;{query}&quot;</h2>
          <div className="flex gap-2 mb-6">
            {['all', 'tracks', 'artists', 'albums', 'playlists', 'nfts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-sm capitalize transition ${activeTab === tab ? 'bg-[var(--accent-purple)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonLoader key={i} variant="track" />)}
            </div>
          ) : results?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((track: any) => <TrackCard key={track.id} track={track} variant="vertical" />)}
            </div>
          ) : (
            <EmptyState title="No results" description="Try another search term." />
          )}
        </section>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
