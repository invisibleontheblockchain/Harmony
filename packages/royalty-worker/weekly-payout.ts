import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function processWeeklyPayouts(db) {
  const pendingPayouts = await db.query(`
    SELECT rh.id AS rights_holder_id, SUM(rl.amount_cents) AS pending_balance_cents
    FROM royalty_ledger rl
    JOIN rights_holders rh ON rl.rights_holder_id = rh.id
    WHERE rl.created_at <= NOW() 
      AND NOT EXISTS (
        SELECT 1 FROM payout_batches pb 
        WHERE pb.rights_holder_id = rh.id 
          AND pb.status IN ('completed', 'processing')
          AND pb.period_end >= rl.created_at
      )
    GROUP BY rh.id
    HAVING SUM(rl.amount_cents) >= MAX(rh.payout_threshold_cents)
  `);
  
  for (const payout of pendingPayouts) {
    try {
      const batchId = await db.insertPayoutBatch(payout.rights_holder_id, payout.pending_balance_cents);
      const transfer = await stripe.transfers.create({
        amount: payout.pending_balance_cents,
        currency: 'usd',
        destination: payout.stripe_connect_account_id,
        metadata: { batch_id: batchId },
      });
      await db.updatePayoutBatchStatus(batchId, 'completed', transfer.id);
      await db.insertLedgerDebit(payout.rights_holder_id, payout.pending_balance_cents, batchId);
    } catch (error) {
      console.error(`Payout failed for ${payout.rights_holder_id}:`, error);
      await db.updatePayoutBatchStatus(batchId, 'failed');
    }
  }
}