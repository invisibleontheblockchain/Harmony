import TrackPlayer, { Capability, AppKilledPlaybackBehavior, TrackType } from 'react-native-track-player';

export const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
    });
  } catch (error) {
    console.error("Error setting up TrackPlayer:", error);
  }
};

export const playHlsStream = async (trackId: string, title: string, artist: string, artworkUrl: string) => {
  await TrackPlayer.add({
    id: trackId,
    url: `https://cdn.harmony.fm/tracks/${trackId}/master.m3u8`,
    type: TrackType.HLS,
    title: title,
    artist: artist,
    artwork: artworkUrl,
  });
  await TrackPlayer.play();
};