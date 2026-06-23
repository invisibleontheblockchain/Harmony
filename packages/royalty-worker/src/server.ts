import { Database } from '../../../apps/api/src/db.js';
import { processWeeklyPayouts } from '../weekly-payout.js';

const db = new Database();

const FIVE_MINUTES_MS = 5 * 60 * 1000;

/**
 * Royalty Worker Server
 * 
 * Runs two background jobs:
 * 1. Stream attribution — every 5 minutes, credits royalty ledger entries
 *    from uncredited stream_events based on royalty_splits.
 * 2. Weekly payouts — every Monday at 2:00 AM UTC, triggers Stripe transfers
 *    for all rights holders above their payout threshold.
 */

// ─── Job 1: Stream Attribution (every 5 minutes) ────────────────────────────

async function attributeStreamCredits(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Running stream attribution...`);

  try {
    // Find all uncredited stream events and attribute royalties based on splits
    const attributed = await db.query(`
      WITH uncredited AS (
        SELECT se.id AS stream_event_id, se.track_id, se.duration_seconds
        FROM stream_events se
        WHERE se.royalty_credited = FALSE
        LIMIT 1000
      ),
      credits AS (
        INSERT INTO royalty_ledger (rights_holder_id, track_id, stream_event_id, amount_cents, ledger_type, description)
        SELECT 
          rs.rights_holder_id,
          u.track_id,
          u.stream_event_id,
          GREATEST(1, FLOOR((u.duration_seconds::numeric / 30.0) * 0.4 * rs.split_percentage / 100.0)),
          'stream_credit',
          'Stream attribution'
        FROM uncredited u
        JOIN royalty_splits rs ON rs.track_id = u.track_id
        RETURNING stream_event_id
      )
      UPDATE stream_events
      SET royalty_credited = TRUE
      WHERE id IN (SELECT DISTINCT stream_event_id FROM credits)
      RETURNING id
    `);

    console.log(`  Attributed ${attributed.length} stream events`);
  } catch (error) {
    console.error('  Stream attribution error:', error);
  }
}

// ─── Job 2: Weekly Payouts (Monday 2:00 AM UTC) ─────────────────────────────

function isPayoutTime(): boolean {
  const now = new Date();
  return now.getUTCDay() === 1 && now.getUTCHours() === 2 && now.getUTCMinutes() < 5;
}

let lastPayoutDate = '';

async function checkWeeklyPayout(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  if (isPayoutTime() && lastPayoutDate !== today) {
    console.log(`[${new Date().toISOString()}] Triggering weekly payouts...`);
    lastPayoutDate = today;

    try {
      await processWeeklyPayouts(db);
      console.log('  Weekly payouts completed successfully');
    } catch (error) {
      console.error('  Weekly payout error:', error);
    }
  }
}

// ─── Main Loop ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🎵 Harmony Royalty Worker started');
  console.log(`  Stream attribution interval: ${FIVE_MINUTES_MS / 1000}s`);
  console.log('  Weekly payouts: Mondays at 02:00 UTC');

  // Run attribution immediately on startup
  await attributeStreamCredits();

  // Schedule recurring jobs
  setInterval(async () => {
    await attributeStreamCredits();
    await checkWeeklyPayout();
  }, FIVE_MINUTES_MS);
}

main().catch((err) => {
  console.error('Fatal error in royalty worker:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down royalty worker...');
  await db.close();
  process.exit(0);
});
