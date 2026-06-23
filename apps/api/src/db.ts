import pg from 'pg';
const { Pool } = pg;

export class Database {
  private pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async query(text: string, params?: any[]) {
    const res = await this.pool.query(text, params);
    return res.rows;
  }

  async insertPayoutBatch(rightsHolderId: string, amountCents: number): Promise<string> {
    const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
    const periodEnd = new Date();
    const rows = await this.query(
      `INSERT INTO payout_batches (rights_holder_id, total_amount_cents, status, period_start, period_end)
       VALUES ($1, $2, 'pending', $3, $4)
       RETURNING id`,
      [rightsHolderId, amountCents, periodStart, periodEnd]
    );
    return rows[0].id;
  }

  async updatePayoutBatchStatus(batchId: string, status: string, transferId?: string): Promise<void> {
    await this.query(
      `UPDATE payout_batches 
       SET status = $1, stripe_transfer_id = $2, completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE NULL END
       WHERE id = $3`,
      [status, transferId || null, batchId]
    );
  }

  async insertLedgerDebit(rightsHolderId: string, amountCents: number, batchId: string): Promise<void> {
    await this.query(
      `INSERT INTO royalty_ledger (rights_holder_id, amount_cents, ledger_type, description)
       VALUES ($1, $2, 'payout_debit', $3)`,
      [rightsHolderId, -amountCents, `Payout batch ${batchId}`]
    );
  }

  async close() {
    await this.pool.end();
  }
}
export const db = new Database();
