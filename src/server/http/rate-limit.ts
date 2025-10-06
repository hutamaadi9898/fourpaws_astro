interface RateLimitOptions {
  points: number;
  windowMs: number;
}

interface RateLimitState {
  hits: number;
  resetAt: number;
}

const defaultOptions: RateLimitOptions = {
  points: 20,
  windowMs: 60 * 1000
};

const store = new Map<string, RateLimitState>();

export function consumeRateLimit(key: string, options: RateLimitOptions = defaultOptions) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const next = { hits: 1, resetAt: now + options.windowMs } satisfies RateLimitState;
    store.set(key, next);
    return { remaining: options.points - 1, resetAt: next.resetAt, limited: false };
  }

  if (current.hits >= options.points) {
    return { remaining: 0, resetAt: current.resetAt, limited: true };
  }

  current.hits += 1;
  store.set(key, current);
  return { remaining: options.points - current.hits, resetAt: current.resetAt, limited: false };
}
