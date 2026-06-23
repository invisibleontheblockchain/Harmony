import Image from 'next/image';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TrackCardProps {
  track: {
    id: string;
    title: string;
    artist?: string;
    artist_name?: string;
    artist_avatar?: string;
    duration_seconds?: number;
    genre?: string;
  };
  variant?: 'horizontal' | 'vertical' | 'compact' | 'list';
}

export default function TrackCard({ track, variant = 'vertical' }: TrackCardProps) {
  const title = track.title;
  const artist = track.artist || track.artist_name || 'Unknown';
  const duration = track.duration_seconds ? `${Math.floor(track.duration_seconds / 60)}:${String(track.duration_seconds % 60).padStart(2, '0')}` : '';

  if (variant === 'horizontal') {
    return (
      <Link href={`/track/${track.id}`} className="group">
        <div className="w-[140px]">
          <div className="aspect-square rounded-[var(--radius-md)] bg-[var(--bg-secondary)] relative mb-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-purple)]/20 to-[var(--accent-pink)]/20" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
              <Play size={32} className="text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</p>
          <p className="text-xs text-[var(--text-secondary)] truncate">{artist}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'compact' || variant === 'list') {
    return (
      <Link href={`/track/${track.id}`} className={`group ${variant === 'list' ? 'flex items-center gap-4' : ''}`}>
        <div className={`${variant === 'list' ? 'w-12 h-12' : 'w-10 h-10'} rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] relative overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-purple)]/20 to-[var(--accent-pink)]/20" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</p>
          <p className="text-xs text-[var(--text-secondary)] truncate">{artist}</p>
        </div>
        {duration && <span className="text-xs text-[var(--text-tertiary)]">{duration}</span>}
      </Link>
    );
  }

  return (
    <Link href={`/track/${track.id}`} className="group">
      <div className="card p-3 hover:border-[var(--border-accent)] transition">
        <div className="aspect-square rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--accent-purple)]/20 to-[var(--accent-pink)]/20 relative mb-3 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
            <Play size={40} className="text-white" />
          </div>
        </div>
        <p className="font-medium text-sm text-[var(--text-primary)] truncate">{title}</p>
        <p className="text-xs text-[var(--text-secondary)] truncate">{artist}</p>
      </div>
    </Link>
  );
}
