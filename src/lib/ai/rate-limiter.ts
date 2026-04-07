interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TOKENS = 20;
const REFILL_INTERVAL = 60_000; // 1 minute

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(key, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  const refills = Math.floor(elapsed / REFILL_INTERVAL);
  if (refills > 0) {
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refills * MAX_TOKENS);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) return false;
  bucket.tokens--;
  return true;
}
