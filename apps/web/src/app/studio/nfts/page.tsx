'use client';
import { useState } from 'react';
import NFTCard from '@/components/cards/NFTCard';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';

export default function NFTsPage() {
  const [activeTab, setActiveTab] = useState<'listed' | 'owned' | 'minted'>('listed');
  const nfts = [
    { id: '1', title: 'Midnight Echoes — Edition 1/10', price: '0.5 ETH', status: 'listed' },
    { id: '2', title: 'Neon Drift — Edition 1/1', price: '0.8 ETH', status: 'listed' },
  ];

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">NFT Collection</h1>
        <Link href="/studio/nfts/mint/1" className="btn-primary">Mint New NFT</Link>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[var(--border-subtle)] pb-2">
        {(['listed', 'owned', 'minted'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize transition ${activeTab === tab ? 'text-[var(--accent-purple)] border-b-2 border-[var(--accent-purple)]' : 'text-[var(--text-secondary)]'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.filter((n) => n.status === activeTab || activeTab === 'listed').map((nft) => (
          <NFTCard key={nft.id} id={nft.id} title={nft.title} artist="Aurora Veil" price={parseFloat(nft.price)} />
        ))}
        {!nfts.length && <EmptyState title="No NFTs" description={`No ${activeTab} NFTs yet.`} />}
      </div>
    </div>
  );
}
