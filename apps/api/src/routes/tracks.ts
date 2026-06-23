import { FastifyInstance } from 'fastify';
import { generateUploadUrl } from '@harmony/stream-worker';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';

export async function trackRoutes(fastify: FastifyInstance) {
  // 1. Get Presigned Upload URL (auth required)
  fastify.get('/api/tracks/upload-url', { preHandler: [requireAuth] }, async (request, reply) => {
    const { trackId, fileExtension } = request.query as { trackId: string; fileExtension: string };
    if (!trackId || !fileExtension) {
      return reply.status(400).send({ error: 'Missing trackId or fileExtension parameters' });
    }
    try {
      const result = await generateUploadUrl(trackId, fileExtension);
      return result;
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to generate upload URL', details: error.message });
    }
  });

  // 2. Register Track & Splits (auth required)
  fastify.post('/api/tracks', { preHandler: [requireAuth] }, async (request, reply) => {
    const { 
      id, 
      artistId, 
      title, 
      durationSeconds, 
      fileUrlHls, 
      fileUrlRaw, 
      genre, 
      bpm, 
      keySignature, 
      isrcCode,
      splits 
    } = request.body as {
      id?: string;
      artistId: string;
      title: string;
      durationSeconds: number;
      fileUrlHls: string;
      fileUrlRaw: string;
      genre?: string;
      bpm?: number;
      keySignature?: string;
      isrcCode?: string;
      splits: { rightsHolderId: string; splitPercentage: number; role: string }[];
    };

    if (!artistId || !title || !durationSeconds || !fileUrlHls || !fileUrlRaw || !splits || splits.length === 0) {
      return reply.status(400).send({ error: 'Missing required track fields or splits' });
    }

    try {
      // Execute inserts inside a transaction to defer constraint validation till COMMIT
      await db.query('BEGIN');

      const trackId = id || crypto.randomUUID();

      await db.query(
        `INSERT INTO tracks (id, artist_id, title, duration_seconds, file_url_hls, file_url_raw, status, genre, bpm, key_signature, isrc_code)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10)`,
        [trackId, artistId, title, durationSeconds, fileUrlHls, fileUrlRaw, genre || null, bpm || null, keySignature || null, isrcCode || null]
      );

      for (const split of splits) {
        await db.query(
          `INSERT INTO royalty_splits (track_id, rights_holder_id, split_percentage, role)
           VALUES ($1, $2, $3, $4)`,
          [trackId, split.rightsHolderId, split.splitPercentage, split.role]
        );
      }

      // Deferrable trigger check_split_sum will run now
      await db.query('COMMIT');

      return reply.status(201).send({ message: 'Track registered successfully', trackId });
    } catch (error: any) {
      await db.query('ROLLBACK');
      fastify.log.error(error);
      return reply.status(400).send({ error: 'Failed to register track', details: error.message });
    }
  });

  // 3. List Tracks (public — used by home feed, search)
  fastify.get('/api/tracks', async (request, reply) => {
    const { genre, limit, offset } = request.query as {
      genre?: string;
      limit?: string;
      offset?: string;
    };

    try {
      const queryLimit = Math.min(parseInt(limit || '20'), 50);
      const queryOffset = parseInt(offset || '0');

      let queryText = `
        SELECT t.id, t.artist_id, t.title, t.duration_seconds, t.file_url_hls,
               t.genre, t.bpm, t.key_signature, t.created_at,
               u.display_name AS artist_name, u.avatar_url AS artist_avatar
        FROM tracks t
        JOIN users u ON t.artist_id = u.id
        WHERE t.status = 'active'
      `;
      const params: any[] = [];

      if (genre) {
        params.push(genre);
        queryText += ` AND t.genre = $${params.length}`;
      }

      queryText += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(queryLimit, queryOffset);

      const tracks = await db.query(queryText, params);
      return tracks;
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch tracks', details: error.message });
    }
  });

  // 4. Get Single Track by ID (public)
  fastify.get('/api/tracks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const tracks = await db.query(
        `SELECT t.*, u.display_name AS artist_name, u.avatar_url AS artist_avatar
         FROM tracks t
         JOIN users u ON t.artist_id = u.id
         WHERE t.id = $1 AND t.status = 'active'`,
        [id]
      );

      if (tracks.length === 0) {
        return reply.status(404).send({ error: 'Track not found' });
      }

      // Also fetch royalty splits
      const splits = await db.query(
        `SELECT rs.split_percentage, rs.role, rh.display_name
         FROM royalty_splits rs
         JOIN rights_holders rh ON rs.rights_holder_id = rh.id
         WHERE rs.track_id = $1`,
        [id]
      );

      return { ...tracks[0], splits };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch track', details: error.message });
    }
  });

  // 5. Search Tracks (public)
  fastify.get('/api/tracks/search', async (request, reply) => {
    const { q, limit } = request.query as { q: string; limit?: string };
    if (!q || q.trim().length === 0) {
      return reply.status(400).send({ error: 'Missing search query parameter q' });
    }

    try {
      const queryLimit = Math.min(parseInt(limit || '20'), 50);
      const searchPattern = `%${q.trim()}%`;

      const tracks = await db.query(
        `SELECT t.id, t.artist_id, t.title, t.duration_seconds, t.file_url_hls,
                t.genre, t.bpm, t.created_at,
                u.display_name AS artist_name, u.avatar_url AS artist_avatar
         FROM tracks t
         JOIN users u ON t.artist_id = u.id
         WHERE t.status = 'active'
           AND (t.title ILIKE $1 OR u.display_name ILIKE $1 OR t.genre ILIKE $1)
         ORDER BY t.created_at DESC
         LIMIT $2`,
        [searchPattern, queryLimit]
      );

      return tracks;
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Search failed', details: error.message });
    }
  });
}
