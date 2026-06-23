import { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import axios from 'axios';

const DISCOVERY_URL: string =
  process.env.DISCOVERY_URL || 'http://localhost:8001';

export async function recommendationRoutes(fastify: FastifyInstance) {
  // get personalized recommendations from the 4-layer Python engine (with cache + A/B testing)
  fastify.get('/api/recommendations', async (request, reply) => {
    const userId = (request.query as any)?.userId as string | undefined;
    if (!userId) {
      return reply.status(400).send({ error: 'Missing userId parameter' });
    }

    try {
      const limit = Math.min(parseInt((request.query as any)?.limit || '50'), 50);

      // Try local Python engine first
      try {
        const response = await axios.get(`${DISCOVERY_URL}/recommendations`, {
          params: { user_id: userId, limit },
          timeout: 3000,
        });
        return response.data;
      } catch (engineErr) {
        fastify.log.warn(
          { err: (engineErr as Error).message },
          'Discovery engine unreachable, falling back to DB',
        );
      }

      // Fallback: recent active tracks
      const rows = await db.query(
        `
        SELECT t.id, t.artist_id, t.title, t.duration_seconds, t.file_url_hls,
               t.genre, t.bpm, t.created_at,
               u.display_name AS artist_name, u.avatar_url AS artist_avatar
        FROM tracks t
        JOIN users u ON t.artist_id = u.id
        WHERE t.status = 'active'
        ORDER BY t.created_at DESC
        LIMIT $1
        `,
        [limit],
      );
      return { user_id: userId, recommendations: rows };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to generate recommendations',
        details: error.message,
      });
    }
  });

  // record an interaction event (used by mobile/web player)
  fastify.post('/api/recommendations/interactions', async (request, reply) => {
    const body = request.body as {
      userId: string;
      trackId: string;
      eventType: string;
      playDurationSeconds?: number;
      trackDurationSeconds?: number;
      sessionId?: string;
      deviceType?: string;
      context?: Record<string, any>;
    };

    if (!body?.userId || !body?.trackId || !body?.eventType) {
      return reply.status(400).send({ error: 'Missing required interaction fields' });
    }

    try {
      await db.query(
        `
        INSERT INTO interaction_events
          (user_id, track_id, event_type, play_duration_seconds, track_duration_seconds,
           session_id, device_type, context)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          body.userId,
          body.trackId,
          body.eventType,
          body.playDurationSeconds ?? null,
          body.trackDurationSeconds ?? null,
          body.sessionId || null,
          body.deviceType || null,
          JSON.stringify(body.context ?? {}),
        ],
      );
      return { ok: true };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to log interaction',
        details: error.message,
      });
    }
  });
}
