'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchTracks } from '@/lib/api-client';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function ArtistPage({ params }: { params: { slug: string } }) {
  const name = decodeURIComponent(params.slug);
  const { data: tracks } = useQuery({ queryKey: ['/api/tracks'], queryFn: () => fetchTracks() });

  return (
    <div>
      <div className="h-64 bg-gradient-to-br from-[var(--accent-purple)]/30 to-[var(--accent-pink)]/20 flex items-end p-8">
        <div className="flex items-end gap-6">
          <div className="w-32 h-32 rounded-full bg-[var(--bg-secondary)] shadow-xl" />
          <div>
            <h1 className="text-5xl font-bold">{name}</h1>
            <p className="text-[var(--text-secondary)] mt-1">Artist • 24.5K monthly listeners</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="flex gap-2 mb-6">
          <button className="btn-primary">Follow</button>
          <button className="btn-secondary">Subscribe</button>
        </div>

        <h2 className="text-lg font-semibold mb-4">Popular</h2>
        <div className="space-y-1 mb-8">
          {tracks?.slice(0, 5).map((t: any) => <TrackCard key={t.id} track={t} variant="list" />)}
        </div>

        <h2 className="text-lg font-semibold mb-4">Discography</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tracks?.slice(0, 4).map((t: any, i: number) => (
            <div key={t.id} className="card">
              <div className="aspect-square rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-[var(--text-tertiary)]">{['Ethereal', 'Neon Dreams', 'Crystal', 'Pulse'][i]}</span>
              </div>
              <p className="font-medium truncate">{['Ethereal', 'Neon Dreams', 'Crystal EP', 'Pulse'][i]}</p>
              <p className="text-xs text-[var(--text-secondary)]">Album • 2024</p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mt-8 mb-4">About</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">Aurora Veil creates atmospheric electronic music blending ambient textures with driving rhythms.</p>

        <h2 className="text-lg font-semibold mt-8 mb-4">Fan Subscriptions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'Supporter', price: '$5/mo', benefits: ['Early access', 'Exclusive posts'] },
            { name: 'Superfan', price: '$15/mo', benefits: ['All Supporter benefits', 'Monthly demo feedback', 'Discord access'] },
            { name: 'VIP', price: '$50/mo', benefits: ['All Superfan benefits', 'Monthly 1:1', 'Production tutorials'] },
          ].map((tier) => (
            <div key={tier.name} className="card">
              <h3 className="font-semibold">{tier.name}</h3>
              <p className="text-[var(--accent-purple)] font-bold mt-1">{tier.price}</p>
              <ul className="mt-3 text-sm text-[var(--text-secondary)] space-y-1">
                {tier.benefits.map((b) => (<li key={b}>• {b}</li>))}
              </ul>
              <button className="btn-secondary w-full mt-4">Subscribe</button>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mt-8 mb-4">NFTs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <div className="aspect-square rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] mb-2" />
              <p className="text-sm font-medium">Limited Edition #{i + 1}</p>
              <p className="text-xs text-[var(--text-secondary)]">0.5 ETH</p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mt-8 mb-4">Similar Artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Solar Flare', 'Rhythm Theory', 'Deep Resonance', 'Nova Echo'].map((a) => (
            <div key={a} className="card flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)]" />
              <span className="font-medium">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
