import { FastifyInstance } from 'fastify';
import { db } from '../db.js';

export async function recommendationRoutes(fastify: FastifyInstance) {
  // Get personalized recommendations for a user
  fastify.get('/api/recommendations', async (request, reply) => {
    const { userId } = request.query as { userId: string };
    if (!userId) {
      return reply.status(400).send({ error: 'Missing userId parameter' });
    }

    try {
      // Fetch recent active tracks joined with artist info
      // TODO: Wire in the Python ALS recommender via a microservice bridge
      const recommendations = await db.query(
        `SELECT t.id, t.artist_id, t.title, t.duration_seconds, t.file_url_hls, 
                t.genre, t.bpm, t.created_at,
                u.display_name AS artist_name, u.avatar_url AS artist_avatar
         FROM tracks t
         JOIN users u ON t.artist_id = u.id
         WHERE t.status = 'active'
         ORDER BY t.created_at DESC 
         LIMIT 20`
      );

      return recommendations;
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to generate recommendations', details: error.message });
    }
  });
}
