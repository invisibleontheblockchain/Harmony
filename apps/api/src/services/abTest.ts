import crypto from 'crypto';
import { db } from '../db.js';

export type Variant = 'control' | 'treatment_a' | 'treatment_b';

export function assignVariant(userId: string, testName: string): Variant {
  const hash = crypto.createHash('md5').update(`${testName}:${userId}`).digest('hex');
  const bucket = parseInt(hash.slice(0, 8), 16) % 100;
  if (bucket < 20) return 'control';
  if (bucket < 60) return 'treatment_a';
  return 'treatment_b';
}

export async function logExposure(
  userId: string,
  variant: Variant,
  testName: string,
): Promise<void> {
  await db.query(
    `
    INSERT INTO ab_test_exposures (user_id, test_name, variant, exposed_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (user_id, test_name) DO NOTHING
    `,
    [userId, testName, variant],
  );
}
