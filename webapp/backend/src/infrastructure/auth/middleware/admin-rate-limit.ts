import type { Context, Next } from 'hono';
import { logger } from '../../../utils/logger.js';
import { createRateLimitStore, type RateLimitStore } from '../stores/RateLimitStore.js';

interface AdminRateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (c: Context) => string; // Function to generate rate limit key
  skipSuccessfulLogin?: boolean; // Skip rate limiting for successful logins
}

// Rate limit store - uses Redis in production, in-memory for development
const rateLimitStore: RateLimitStore = createRateLimitStore();

export function adminRateLimit(options: AdminRateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultAdminKeyGenerator,
    skipSuccessfulLogin = false,
  } = options;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    // Clean up expired entries periodically
    if (Math.random() < 0.05) {
      // 5% chance
      rateLimitStore.cleanup();
    }

    // Check if account is temporarily blocked
    const isBlocked = await rateLimitStore.isBlocked(key);
    if (isBlocked) {
      logger.warn(`Admin request blocked for key: ${key}`);
      return c.json(
        {
          error: 'Account temporarily locked',
          message: 'Too many failed attempts. Please try again later.',
          retryAfter: 300, // 5 minutes default
        },
        429
      );
    }

    // Get or increment rate limit entry
    const entry = await rateLimitStore.increment(key, windowMs);

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const resetTime = Math.ceil((entry.resetTime - now) / 1000);

      // For login endpoints, implement progressive lockout
      if (c.req.path.includes('/login')) {
        // Block account for increasing duration based on attempts
        const blockDuration = Math.min(entry.count - maxRequests, 10) * 5 * 60 * 1000; // 5-50 minutes
        await rateLimitStore.block(key, blockDuration);

        logger.warn(
          `Admin login rate limit exceeded for key: ${key} (${entry.count}/${maxRequests} requests, blocked for ${blockDuration / 1000 / 60} minutes)`
        );

        return c.json(
          {
            error: 'Too many login attempts',
            message: `Account temporarily locked due to too many failed login attempts. Try again in ${Math.ceil(blockDuration / 1000 / 60)} minutes.`,
            retryAfter: Math.ceil(blockDuration / 1000),
          },
          429
        );
      }

      logger.warn(
        `Admin rate limit exceeded for key: ${key} (${entry.count}/${maxRequests} requests)`
      );
      return c.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
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

    // Reset count on successful login (if enabled)
    if (skipSuccessfulLogin && c.req.path.includes('/login') && c.res.status === 200) {
      await rateLimitStore.reset(key);
      logger.info(`Rate limit reset for successful login: ${key}`);
    }
  };
}

/**
 * Stricter rate limit for login attempts
 */
export function adminLoginRateLimit() {
  return adminRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulLogin: true,
  });
}

/**
 * General rate limit for other admin endpoints
 */
export function adminGeneralRateLimit() {
  return adminRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  });
}

/**
 * Rate limit for token refresh
 */
export function adminRefreshRateLimit() {
  return adminRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 refresh attempts per 5 minutes
  });
}

function defaultAdminKeyGenerator(c: Context): string {
  // Combine IP address and username (if available in request body)
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.env?.ip || 'unknown';

  // For login endpoints, try to get username from request body
  const path = c.req.path;
  if (path.includes('/login')) {
    // Note: We can't easily get the username here without parsing the body
    // So we'll use IP-based rate limiting for login attempts
    return `admin-login:${ip}`;
  }

  // For authenticated endpoints, use admin ID if available
  const admin = c.get('admin');
  if (admin) {
    return `admin-${admin.id}:${ip}`;
  }

  return `admin:${ip}`;
}

// Note: This function is now handled by the RateLimitStore.cleanup() method
// and is called automatically in the main middleware

/**
 * Manually reset rate limit for a specific key (admin use)
 */
export async function resetAdminRateLimit(key: string): Promise<void> {
  await rateLimitStore.reset(key);
  logger.info(`Admin rate limit manually reset for key: ${key}`);
}

/**
 * Get current rate limit status for a key (admin use)
 * Note: This function is now limited in functionality due to the abstracted store interface
 * For detailed monitoring, use the store's management interface directly
 */
export async function getAdminRateLimitStatus(key: string): Promise<{
  isBlocked: boolean;
} | null> {
  try {
    const isBlocked = await rateLimitStore.isBlocked(key);
    return { isBlocked };
  } catch (error) {
    logger.warn(`Failed to get rate limit status for key: ${key}`, error);
    return null;
  }
}
