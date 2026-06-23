import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import TrackPlayer, { State, usePlaybackState, useProgress } from 'react-native-track-player';
import { setupPlayer, playHlsStream } from '../utils/audio-player';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  artwork?: string;
  fileUrlHls?: string;
  genre?: string;
  durationSeconds?: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  progress: { position: number; duration: number };
  play: (track: Track) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  addToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const trackProgress = useProgress();
  const playerReady = useRef(false);

  const ensurePlayerReady = useCallback(async () => {
    if (!playerReady.current) {
      await setupPlayer();
      playerReady.current = true;
    }
  }, []);

  const play = useCallback(async (track: Track) => {
    try {
      await ensurePlayerReady();
      await TrackPlayer.reset();
      await playHlsStream(
        track.id,
        track.fileUrlHls || '',
        track.title,
        track.artist,
        track.artwork || ''
      );
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback error:', error);
    }
  }, [ensurePlayerReady]);

  const pause = useCallback(async () => {
    try {
      await TrackPlayer.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause error:', error);
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      await TrackPlayer.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Resume error:', error);
    }
  }, []);

  const skipNext = useCallback(async () => {
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex < queue.length - 1) {
      await play(queue[currentIndex + 1]);
    }
  }, [queue, currentTrack, play]);

  const skipPrevious = useCallback(async () => {
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      await play(queue[currentIndex - 1]);
    }
  }, [queue, currentTrack, play]);

  const seekTo = useCallback(async (position: number) => {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error('Seek error:', error);
    }
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => {
      if (prev.find((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        progress: { position: trackProgress.position, duration: trackProgress.duration },
        play,
        pause,
        resume,
        skipNext,
        skipPrevious,
        seekTo,
        addToQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
