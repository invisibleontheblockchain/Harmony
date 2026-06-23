'use client';
import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlayerBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  return (
    <div className="fixed bottom-0 left-60 right-0 h-[72px] bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--border-subtle)] z-50">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--bg-tertiary)]">
        <div className="h-full bg-[var(--accent-purple)] w-[35%]" />
      </div>

      <div className="h-full flex items-center px-4 gap-4">
        <div className="flex items-center gap-3 w-[30%] min-w-[200px]">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">Midnight Echoes</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">Aurora Veil</p>
          </div>
          <button className="text-[var(--text-secondary)] hover:text-[var(--error)] transition ml-1">
            <Heart size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="flex items-center gap-3">
            <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"><Shuffle size={18} /></button>
            <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"><SkipBack size={20} /></button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"><SkipForward size={20} /></button>
            <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"><Repeat size={18} /></button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-[600px]">
            <span className="text-[10px] text-[var(--text-tertiary)] w-10 text-right">1:14</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="flex-1 h-1 appearance-none bg-[var(--bg-tertiary)] rounded-full cursor-pointer accent-[var(--accent-purple)]"
            />
            <span className="text-[10px] text-[var(--text-tertiary)] w-10">3:45</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-[30%] min-w-[200px] justify-end">
          <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"><ListMusic size={18} /></button>
          <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"><Volume2 size={18} /></button>
        </div>
      </div>
    </div>
  );
}
