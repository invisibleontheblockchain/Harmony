'use client';
import { useState } from 'react';
import NFTCard from '@/components/cards/NFTCard';
import EmptyState from '@/components/ui/EmptyState';
import { Play, Wallet } from 'lucide-react';

export default function NFTDetailPage({ params }: { params: { nftId: string } }) {
  const [purchasing, setPurchasing] = useState(false);
  return (
    <div className="px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="aspect-square rounded-[var(--radius-xl)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center">
            <span className="text-6xl font-bold text-[var(--text-tertiary)]">🎵</span>
          </div>
        </div>
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold">{params.nftId === 'featured' ? 'Midnight Echoes — Limited Edition #1/10' : `NFT #${params.nftId}`}</h1>
          <p className="text-[var(--text-secondary)] mt-2">by Aurora Veil</p>

          <div className="mt-6 space-y-4">
            <div className="card flex items-center gap-4">
              <Play size={20} />
              <span className="text-sm">Embedded player with full track playback</span>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Ownership History</h3>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <p>Minted by AuroraVeil...</p>
                <p>Sold to Collector123 for 0.5 ETH</p>
              </div>
            </div>
            <div className="card bg-[var(--bg-tertiary)]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Price</p>
                  <p className="text-2xl font-bold">0.5 ETH</p>
                </div>
                <button onClick={() => setPurchasing(true)} className="btn-primary"><Wallet size={18} /> Buy Now</button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-3">10% royalty on every secondary sale goes to the artist.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
