import type { Context, Next } from 'hono';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (c: Context) => string; // Function to generate rate limit key
}

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator = defaultKeyGenerator } = options;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      // 1% chance
      cleanupExpiredEntries(now);
    }

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      // Increment count
      entry.count++;
    }

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const resetTime = Math.ceil((entry.resetTime - now) / 1000);
      console.log(`Rate limit exceeded for key: ${key} (${entry.count}/${maxRequests} requests)`);
      return c.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: resetTime,
        },
        429
      );
    }

    // Add rate limit headers
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    c.header('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

    await next();
  };
}

function defaultKeyGenerator(c: Context): string {
  // Use IP address and app ID from JWT if available
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const jwtPayload = c.get('jwtPayload');
  const appId = jwtPayload?.iss || 'anonymous';

  return `${ip}:${appId}`;
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}
