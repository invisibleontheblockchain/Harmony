import Image from 'next/image';
import Link from 'next/link';

interface NFTCardProps {
  id: string;
  title: string;
  artist: string;
  price: number;
  edition?: string;
  isOwned?: boolean;
}

export default function NFTCard({ id, title, artist, price, edition = '1/1', isOwned }: NFTCardProps) {
  return (
    <Link href={`/marketplace/${id}`} className="group">
      <div className="card p-3 hover:border-[var(--border-accent)] transition">
        <div className="aspect-square rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--accent-purple)]/20 to-[var(--accent-pink)]/20 relative mb-3 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-[var(--text-tertiary)]">
            🎵
          </div>
          {isOwned && <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--success)] text-white">OWNED</span>}
        </div>
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</p>
        <p className="text-xs text-[var(--text-secondary)] truncate">{artist}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-[var(--accent-purple)]">{price} ETH</span>
          <span className="text-xs text-[var(--text-tertiary)]">{edition}</span>
        </div>
      </div>
    </Link>
  );
}
