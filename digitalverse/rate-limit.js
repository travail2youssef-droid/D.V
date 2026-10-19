// Small in-process fixed-window limiter. Production deployments with multiple Node
// workers/instances should use a shared store (for example Redis) instead.
export function createThrottle({
  windowMs,
  max,
  keyOf = req => req?.ip || 'unknown',
  now = Date.now,
  maxEntries = 4096,
}) {
  if (!Number.isFinite(windowMs) || windowMs <= 0) throw new TypeError('windowMs must be positive');
  if (!Number.isInteger(max) || max <= 0) throw new TypeError('max must be a positive integer');
  if (!Number.isInteger(maxEntries) || maxEntries <= 0) throw new TypeError('maxEntries must be a positive integer');

  const hits = new Map();
  const keyFor = subject => String(keyOf(subject) ?? 'unknown');

  function liveEntry(key, at) {
    const entry = hits.get(key);
    if (entry && entry.until <= at) {
      hits.delete(key);
      return null;
    }
    return entry || null;
  }

  function pruneExpired(at) {
    for (const [key, entry] of hits) {
      if (entry.until <= at) hits.delete(key);
    }
  }

  function isLimited(subject) {
    const at = now();
    const entry = liveEntry(keyFor(subject), at);
    return Boolean(entry && entry.count >= max);
  }

  function retryAfterMs(subject) {
    const at = now();
    const entry = liveEntry(keyFor(subject), at);
    return entry && entry.count >= max ? Math.max(0, entry.until - at) : 0;
  }

  function bump(subject) {
    const at = now();
    const key = keyFor(subject);
    let entry = liveEntry(key, at);

    if (!entry) {
      // Expired keys are removed on access; opportunistically sweep before evicting
      // an active key when the map is at capacity.
      if (hits.size >= maxEntries) {
        pruneExpired(at);
        while (hits.size >= maxEntries) {
          hits.delete(hits.keys().next().value);
        }
      }
      entry = { count: 0, until: at + windowMs };
    }

    entry.count += 1;
    // Keep frequently used keys at the end so capacity eviction is least-recently-used.
    hits.delete(key);
    hits.set(key, entry);
    return entry.count;
  }

  function reset(subject) {
    hits.delete(keyFor(subject));
  }

  return {
    isLimited,
    retryAfterMs,
    bump,
    reset,
    size: () => hits.size,
  };
}
