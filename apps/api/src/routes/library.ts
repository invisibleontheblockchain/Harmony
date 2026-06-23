import { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';

export async function libraryRoutes(fastify: FastifyInstance) {
  fastify.register(async (f) => {
    await f.register(requireAuth as any);

    f.get('/api/library/liked', async (request, reply) => {
      const userId = (request as any).userId;
      const tracks = await db.query(
        `SELECT t.id, t.title, t.duration_seconds, t.file_url_hls, t.genre, t.bpm,
                u.display_name AS artist_name, u.avatar_url AS artist_avatar
         FROM likes l
         JOIN tracks t ON t.id = l.track_id
         JOIN users u ON u.id = t.artist_id
         WHERE l.user_id = $1
         ORDER BY l.created_at DESC`,
        [userId]
      );
      return tracks;
    });

    f.post('/api/library/liked/:trackId', async (request, reply) => {
      const userId = (request as any).userId;
      const { trackId } = request.params as { trackId: string };
      await db.query('INSERT INTO likes (user_id, track_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, trackId]);
      return { liked: true };
    });

    f.delete('/api/library/liked/:trackId', async (request, reply) => {
      const userId = (request as any).userId;
      const { trackId } = request.params as { trackId: string };
      await db.query('DELETE FROM likes WHERE user_id = $1 AND track_id = $2', [userId, trackId]);
      return { unliked: true };
    });

    f.get('/api/library/history', async (request) => {
      const userId = (request as any).userId;
      const history = await db.query(
        `SELECT t.id, t.title, t.duration_seconds, t.file_url_hls, t.genre,
                u.display_name AS artist_name, u.avatar_url AS artist_avatar,
                ph.played_at, ph.completed
         FROM play_history ph
         JOIN tracks t ON t.id = ph.track_id
         JOIN users u ON u.id = t.artist_id
         WHERE ph.user_id = $1
         ORDER BY ph.played_at DESC
         LIMIT 100`,
        [userId]
      );
      return history;
    });

    f.get('/api/library/following', async (request) => {
      const userId = (request as any).userId;
      const following = await db.query(
        `SELECT u.id, u.display_name, u.avatar_url,
                COUNT(l.id) AS latest_release_count
         FROM follows f
         JOIN users u ON u.id = f.following_id
         LEFT JOIN tracks t ON t.artist_id = u.id AND t.status = 'active'
         LEFT JOIN likes l ON l.track_id = t.id
         WHERE f.follower_id = $1
         GROUP BY u.id
         ORDER BY MAX(t.created_at) DESC`,
        [userId]
      );
      return following;
    });
  });
}
