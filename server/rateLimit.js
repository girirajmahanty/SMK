// Small in-memory rate limiter, counted per visitor IP.
// Old entries are swept away regularly so the map can't grow without end.
export function createRateLimit({ windowMs, max, error = 'Too many requests. Please try again in a few minutes.' }) {
  const hits = new Map();

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
  }, windowMs);
  sweep.unref(); // never keeps the process (or a test run) alive on its own

  // true while this key is still under the limit; counts the hit.
  const allow = (key) => {
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  };

  const middleware = (req, res, next) => {
    if (allow(req.ip)) return next();
    res.status(429).json({ code: 'TOO_MANY', error });
  };
  middleware.allow = allow;
  middleware.size = () => hits.size;
  return middleware;
}
