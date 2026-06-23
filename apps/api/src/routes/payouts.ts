import { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function payoutRoutes(fastify: FastifyInstance) {
  fastify.post('/api/payouts/request', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = (request as any).userId;
    const body = request.body as { amountCents?: number };

    const holders = await db.query(
      'SELECT id, stripe_connect_account_id, payout_threshold_cents FROM rights_holders WHERE user_id = $1',
      [userId]
    );
    const holder = holders[0];
    if (!holder || !holder.stripe_connect_account_id) {
      return reply.status(400).send({ error: 'Stripe Connect account not linked' });
    }

    const pendingPayouts = await db.query(
      `SELECT COALESCE(SUM(amount_cents), 0) AS pending_balance
       FROM royalty_ledger
       WHERE rights_holder_id = $1
         AND ledger_type = 'stream_credit'
         AND created_at <= NOW()
         AND id NOT IN (
           SELECT l.id FROM royalty_ledger l
           JOIN payout_batches pb ON pb.rights_holder_id = l.rights_holder_id
           WHERE pb.status IN ('completed', 'processing')
             AND pb.period_end >= l.created_at
         )`,
      [holder.id]
    );

    const balance = Number(pendingPayouts[0].pending_balance);
    const threshold = holder.payout_threshold_cents || 10000;
    const requested = body.amountCents || balance;

    if (requested < threshold) {
      return reply.status(400).send({ error: `Minimum payout is $${threshold / 100}`, available: false });
    }
    if (requested > balance) {
      return reply.status(400).send({ error: 'Requested amount exceeds available balance' });
    }

    const batchId = await db.insertPayoutBatch(holder.id, requested);
    try {
      const transfer = await stripe.transfers.create({
        amount: requested,
        currency: 'usd',
        destination: holder.stripe_connect_account_id,
        metadata: { batch_id: batchId },
      });
      await db.updatePayoutBatchStatus(batchId, 'completed', transfer.id);
      await db.insertLedgerDebit(holder.id, requested, batchId);
      return { batchId, status: 'completed', transferId: transfer.id };
    } catch (error: any) {
      await db.updatePayoutBatchStatus(batchId, 'failed');
      return reply.status(500).send({ error: 'Payout failed', details: error.message });
    }
  });
}
