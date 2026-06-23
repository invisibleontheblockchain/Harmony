import crypto from 'crypto';

export type Variant = 'control' | 'treatment_a' | 'treatment_b';

export function assignVariant(userId: string, testName: string): Variant {
  const hash = crypto.createHash('md5').update(`${testName}:${userId}`).digest('hex');
  const bucket = parseInt(hash.slice(0, 8), 16) % 100;
  if (bucket < 20) return 'control';
  if (bucket < 60) return 'treatment_a';
  return 'treatment_b';
}

export function bucketUser(
  userId: string,
  testName: string,
  variants: Record<string, number>,
): string {
  const hash = crypto.createHash('md5').update(`${testName}:${userId}`).digest('hex');
  const bucket = parseInt(hash.slice(0, 8), 16) % 100;
  let cumulative = 0;
  for (const [variant, weight] of Object.entries(variants)) {
    cumulative += weight * 100;
    if (bucket < cumulative) return variant;
  }
  return Object.keys(variants)[0];
}
