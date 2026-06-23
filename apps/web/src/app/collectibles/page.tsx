'use client';
import NFTCard from '@/components/cards/NFTCard';
import EmptyState from '@/components/ui/EmptyState';

export default function CollectiblesPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Collectibles</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <NFTCard key={i} id={`owned-${i}`} title={`Edition #${i + 1}`} artist="Aurora Veil" isOwned />
        ))}
      </div>
      {!true && <EmptyState title="No collectibles yet" description="Browse the marketplace to start your collection." cta={{ label: 'Browse Marketplace', href: '/marketplace' }} />}
    </div>
  );
}
