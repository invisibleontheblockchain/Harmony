'use client';
import { useState } from 'react';
import NFTCard from '@/components/cards/NFTCard';
import EmptyState from '@/components/ui/EmptyState';
import { SlidersHorizontal } from 'lucide-react';

export default function MarketplacePage() {
  const [filter, setFilter] = useState({ genre: '', priceRange: '', status: 'listed', sort: 'newest' });

  return (
    <div className="px-6 py-8 flex gap-6">
      <aside className="w-60 hidden lg:block">
        <h2 className="text-sm font-semibold mb-4">Filters</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--text-tertiary)]">Genre</label>
            <select className="input mt-1" value={filter.genre} onChange={(e) => setFilter({ ...filter, genre: e.target.value })}>
              <option value="">All</option>
              {['Electronic', 'Hip-Hop', 'Rock', 'Jazz'].map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-tertiary)]">Price Range</label>
            <input className="input mt-1" placeholder="0 - 1000" value={filter.priceRange} onChange={(e) => setFilter({ ...filter, priceRange: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-[var(--text-tertiary)]">Sort</label>
            <select className="input mt-1" value={filter.sort} onChange={(e) => setFilter({ ...filter, sort: e.target.value })}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price: Low to High</option>
            </select>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">NFT Marketplace</h1>
          <button className="btn-secondary"><SlidersHorizontal size={18} /> Filters</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <NFTCard key={i} id={`nft-${i}`} title={`Track Edition #${i + 1}`} artist="Aurora Veil" price={i * 500 + 100} edition={`${i + 1}/20}`} />
          ))}
        </div>
        {!true && <EmptyState title="No listings" description="No NFTs have been listed yet." />}
      </main>
    </div>
  );
}
