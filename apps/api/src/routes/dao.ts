import { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';

export async function daoRoutes(fastify: FastifyInstance) {
  fastify.register(async (f) => {
    await f.register(requireAuth as any);

    f.get('/api/dao/active', async () => {
      const proposals = await db.query(
        `SELECT dp.id, dp.title, dp.description, dp.category, dp.voting_ends_at, dp.quorum,
                u.display_name AS proposer_name,
                COUNT(dv.id) FILTER (WHERE dv.choice = 'for') AS votes_for,
                COUNT(dv.id) FILTER (WHERE dv.choice = 'against') AS votes_against,
                COUNT(dv.id) FILTER (WHERE dv.choice = 'abstain') AS votes_abstain,
                dp.created_at
         FROM dao_proposals dp
         JOIN users u ON u.id = dp.proposer_id
         LEFT JOIN dao_votes dv ON dv.proposal_id = dp.id
         WHERE dp.status = 'active'
         GROUP BY dp.id, u.display_name
         ORDER BY dp.created_at DESC`
      );
      return proposals;
    });

    f.get('/api/dao/proposals', async (request) => {
      const { status = 'all', category = '' } = request.query as {
        status?: string;
        category?: string;
      };
      let sql = `SELECT dp.id, dp.title, dp.description, dp.category, dp.voting_ends_at, dp.status, dp.quorum,
                      u.display_name AS proposer_name, dp.created_at
               FROM dao_proposals dp
               JOIN users u ON u.id = dp.proposer_id
               WHERE 1=1`;
      const params: any[] = [];
      if (status && status !== 'all') {
        params.push(status);
        sql += ` AND dp.status = $${params.length}`;
      }
      if (category) {
        params.push(category);
        sql += ` AND dp.category = $${params.length}`;
      }
      sql += ' ORDER BY dp.created_at DESC';
      return db.query(sql, params);
    });

    f.get('/api/dao/proposals/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      const proposal = await db.query(
        `SELECT dp.*, u.display_name AS proposer_name
         FROM dao_proposals dp
         JOIN users u ON u.id = dp.proposer_id
         WHERE dp.id = $1`,
        [id]
      );
      if (!proposal.length) {
        return reply.status(404).send({ error: 'Proposal not found' });
      }
      const votes = await db.query(
        `SELECT dv.choice, COUNT(*) AS vote_count, SUM(dv.voting_power) AS total_power
         FROM dao_votes dv
         WHERE dv.proposal_id = $1
         GROUP BY dv.choice`,
        [id]
      );
      return { proposal: proposal[0], votes };
    });

    f.post('/api/dao/proposals', async (request, reply) => {
      const userId = (request as any).userId;
      const { title, description, category, voting_ends_at, quorum = 100 } = request.body as {
        title: string;
        description: string;
        category?: string;
        voting_ends_at: string;
        quorum?: number;
      };
      if (!title || !description || !voting_ends_at) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }
      const result = await db.query(
        `INSERT INTO dao_proposals (proposer_id, title, description, category, voting_ends_at, quorum)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, title, description, category || null, voting_ends_at, quorum]
      );
      return { proposalId: result[0].id };
    });

    f.post('/api/dao/proposals/:id/vote', async (request, reply) => {
      const userId = (request as any).userId;
      const { id } = request.params as { id: string };
      const { choice, voting_power = 1 } = request.body as { choice: string; voting_power?: number };
      if (!['for', 'against', 'abstain'].includes(choice)) {
        return reply.status(400).send({ error: 'Invalid vote choice' });
      }
      await db.query(
        `INSERT INTO dao_votes (proposal_id, voter_id, choice, voting_power)
         VALUES ($1, $2, $3, $4) ON CONFLICT (proposal_id, voter_id) DO UPDATE SET choice = $3, voting_power = $4`,
        [id, userId, choice, voting_power]
      );
      return { voted: true };
    });
  });
}
