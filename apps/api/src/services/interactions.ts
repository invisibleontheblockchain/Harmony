import { db } from '../db.js';

type EventType =
  | 'stream_complete'
  | 'stream_partial'
  | 'replay'
  | 'like'
  | 'unlike'
  | 'playlist_add'
  | 'playlist_remove'
  | 'share'
  | 'download'
  | 'skip_early'
  | 'skip_mid'
  | 'search_play'
  | 'follow_artist'
  | 'unfollow_artist';

export async function logInteraction(
  userId: string,
  trackId: string,
  eventType: EventType,
  playDurationSeconds?: number | null,
  trackDurationSeconds?: number | null,
  sessionId?: string,
  deviceType?: string,
  context?: Record<string, any>,
): Promise<void> {
  await db.query(
    `
    INSERT INTO interaction_events
      (user_id, track_id, event_type, play_duration_seconds, track_duration_seconds,
       session_id, device_type, context)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      userId,
      trackId,
      eventType,
      playDurationSeconds ?? null,
      trackDurationSeconds ?? null,
      sessionId || null,
      deviceType || null,
      context ? JSON.stringify(context) : JSON.stringify({}),
    ],
  );
}

export const INTERACTION_WEIGHTS: Record<EventType, number> = {
  stream_complete: 1.0,
  stream_partial: 0.5,
  replay: 2.0,
  like: 3.0,
  unlike: -2.0,
  playlist_add: 4.0,
  playlist_remove: -3.0,
  share: 5.0,
  download: 2.0,
  skip_early: -1.0,
  skip_mid: -0.3,
  search_play: 1.0,
  follow_artist: 2.0,
  unfollow_artist: -1.0,
};
