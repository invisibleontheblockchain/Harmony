import { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';

export async function dmcaRoutes(fastify: FastifyInstance) {
  fastify.register(async (f) => {
    await f.register(requireAuth as any);

    f.post('/api/dmca/takedown', async (request, reply) => {
      const userId = (request as any).userId;
      const { trackId, reason, evidenceUrl } = request.body as {
        trackId: string;
        reason: string;
        evidenceUrl?: string;
      };
      if (!trackId || !reason) {
        return reply.status(400).send({ error: 'Missing trackId or reason' });
      }
      await db.query(
        `UPDATE tracks SET status = 'dmca_hold', updated_at = NOW() WHERE id = $1`,
        [trackId]
      );
      await db.query(
        `INSERT INTO notifications (user_id, type, title, body)
         VALUES ($1, 'system', 'DMCA Notice', 'A DMCA takedown notice has been filed for one of your tracks.')`,
        [userId]
      );
      return { dmcaHold: true, trackId };
    });

    f.post('/api/dmca/counter', async (request, reply) => {
      const userId = (request as any).userId;
      const { trackId, counterReason, evidenceUrl } = request.body as {
        trackId: string;
        counterReason: string;
        evidenceUrl?: string;
      };
      if (!trackId || !counterReason) {
        return reply.status(400).send({ error: 'Missing trackId or counterReason' });
      }
      await db.query(
        `INSERT INTO notifications (user_id, type, title, body)
         VALUES ($1, 'system', 'Counter-Notice Filed', 'A counter-notice has been filed for your DMCA takedown.')`,
        [userId]
      );
      return { counterNotice: true };
    });

    f.get('/api/dmca/status/:trackId', async (request, reply) => {
      const { trackId } = request.params as { trackId: string };
      const track = await db.query(`SELECT id, title, status FROM tracks WHERE id = $1`, [trackId]);
      return track[0] || { error: 'Track not found' };
    });
  });
}
