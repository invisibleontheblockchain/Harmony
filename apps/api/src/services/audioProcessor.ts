import axios from 'axios';

const AUDIO_PROCESSOR_URL: string =
  process.env.AUDIO_PROCESSOR_URL || 'http://localhost:8001';

export async function triggerAudioProcessing(
  trackId: string,
  audioUrl: string,
): Promise<void> {
  try {
    await axios.post(`${AUDIO_PROCESSOR_URL}/process`, {
      track_id: trackId,
      audio_url: audioUrl,
    });
    console.log(`Audio processing queued for track ${trackId}`);
  } catch (error: any) {
    console.error(
      `Failed to queue audio processing for ${trackId}:`,
      error.message,
    );
  }
}
