'use client';
import { useQuery } from '@tanstack/react-query';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';
import { Crown, Wallet } from 'lucide-react';

export default function TrackDetailPage({ params }: { params: { id: string } }) {
  const { data: track } = useQuery({
    queryKey: ['/api/tracks', params.id],
    queryFn: async () => (await fetch(`/api/tracks/${params.id}`)).json(),
  });

  return (
    <div className="px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="aspect-square rounded-[var(--radius-xl)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]" />
          <h1 className="text-4xl font-bold mt-6">{track?.title || 'Loading...'}</h1>
          <p className="text-lg text-[var(--text-secondary)] mt-1">{track?.artist_name || ''}</p>

          <div className="mt-6 space-y-4">
            <details className="card open:border-[var(--border-accent)]">
              <summary className="cursor-pointer font-semibold">Credits</summary>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Released on {track?.created_at ? new Date(track.created_at).toLocaleDateString() : 'Unknown'}</p>
              <p className="text-sm text-[var(--text-secondary)]">Genre: {track?.genre || 'N/A'}</p>
            </details>
            <details className="card">
              <summary className="cursor-pointer font-semibold">Splits & Royalties</summary>
              <div className="mt-2 text-sm text-[var(--text-secondary)]">100% split enforced by smart contract.</div>
            </details>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Wallet size={16} />
              <span>NFT Status: <span className="text-[var(--success)]">Minted</span></span>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            <div className="space-y-3">
              {[{ user: 'fan1', text: 'Incredible production!' }, { user: 'fan2', text: 'This is my new favorite.' }].map((c, i) => (
                <div key={i} className="card py-3">
                  <p className="text-sm font-medium">{c.user}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:w-1/2">
          <h2 className="text-lg font-semibold mb-4">Related Tracks</h2>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <TrackCard key={i} track={{ id: `${params.id}-r-${i}`, title: `Related Track ${i + 1}`, artist: 'Various Artists' }} variant="list" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
