import { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.register(async (f) => {
    await f.register(requireAuth as any);

    f.get('/api/notifications', async (request) => {
      const userId = (request as any).userId;
      const { limit = '50', offset = '0', unread_only = 'false' } = request.query as {
        limit?: string;
        offset?: string;
        unread_only?: string;
      };

      let query = `SELECT id, type, title, body, data, is_read, created_at FROM notifications WHERE user_id = $1`;
      const params: any[] = [userId];

      if (unread_only === 'true') {
        query += ' AND is_read = FALSE';
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), Number(offset));

      const notifications = await db.query(query, params);
      return notifications;
    });

    f.patch('/api/notifications/read-all', async (request, reply) => {
      const userId = (request as any).userId;
      await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE', [userId]);
      return { updated: true };
    });

    f.patch('/api/notifications/:id/read', async (request, reply) => {
      const userId = (request as any).userId;
      const { id } = request.params as { id: string };
      await db.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, userId]);
      return { updated: true };
    });
  });
}
