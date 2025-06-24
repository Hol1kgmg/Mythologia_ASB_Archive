/**
 * Unified Rate Limiting Middleware
 *
 * This file consolidates all rate limiting functionality:
 * - Admin rate limiting (from admin-rate-limit.ts)
 * - General rate limiting (from rate-limit.ts)
 *
 * Refactoring: Issue #55
 */

import type { Context, Next } from 'hono';
import { logger } from '../../../utils/logger.js';
import { createRateLimitStore, type RateLimitStore } from '../stores/RateLimitStore.js';

// =============================================================================
// Types and Interfaces
// =============================================================================

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (c: Context) => string; // Function to generate rate limit key
}

interface AdminRateLimitOptions extends RateLimitOptions {
  skipSuccessfulLogin?: boolean; // Skip rate limiting for successful logins
}

// =============================================================================
// Storage
// =============================================================================

// Simple in-memory rate limiter for general use
const generalRateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Admin rate limit store - uses Redis in production, in-memory for development
const adminRateLimitStore: RateLimitStore = createRateLimitStore();

// =============================================================================
// General Rate Limiting (from rate-limit.ts)
// =============================================================================

/**
 * General rate limiting middleware for application endpoints
 */
export function generalRateLimit(options: RateLimitOptions) {
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
    let entry = generalRateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      generalRateLimitStore.set(key, entry);
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

// =============================================================================
// Admin Rate Limiting (from admin-rate-limit.ts)
// =============================================================================

/**
 * Admin rate limiting middleware with advanced features
 */
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
      adminRateLimitStore.cleanup();
    }

    // Check if account is temporarily blocked
    const isBlocked = await adminRateLimitStore.isBlocked(key);
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
    const entry = await adminRateLimitStore.increment(key, windowMs);

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const resetTime = Math.ceil((entry.resetTime - now) / 1000);

      // For login endpoints, implement progressive lockout
      if (c.req.path.includes('/login')) {
        // Block account for increasing duration based on attempts
        const blockDuration = Math.min(entry.count - maxRequests, 10) * 5 * 60 * 1000; // 5-50 minutes
        await adminRateLimitStore.block(key, blockDuration);

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
      await adminRateLimitStore.reset(key);
      logger.info(`Rate limit reset for successful login: ${key}`);
    }
  };
}

// =============================================================================
// Preconfigured Rate Limiters
// =============================================================================

/**
 * Stricter rate limit for admin login attempts
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
 * Rate limit for admin token refresh
 */
export function adminRefreshRateLimit() {
  return adminRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 refresh attempts per 5 minutes
  });
}

// =============================================================================
// Key Generators
// =============================================================================

/**
 * Default key generator for general rate limiting
 */
function defaultKeyGenerator(c: Context): string {
  // Use IP address and app ID from JWT if available
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const jwtPayload = c.get('jwtPayload');
  const appId = jwtPayload?.iss || 'anonymous';

  return `${ip}:${appId}`;
}

/**
 * Default key generator for admin rate limiting
 */
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

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Clean up expired entries from general rate limit store
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of generalRateLimitStore.entries()) {
    if (now > entry.resetTime) {
      generalRateLimitStore.delete(key);
    }
  }
}

/**
 * Manually reset admin rate limit for a specific key (admin use)
 */
export async function resetAdminRateLimit(key: string): Promise<void> {
  await adminRateLimitStore.reset(key);
  logger.info(`Admin rate limit manually reset for key: ${key}`);
}

/**
 * Get current admin rate limit status for a key (admin use)
 */
export async function getAdminRateLimitStatus(key: string): Promise<{
  isBlocked: boolean;
} | null> {
  try {
    const isBlocked = await adminRateLimitStore.isBlocked(key);
    return { isBlocked };
  } catch (error) {
    logger.warn(`Failed to get rate limit status for key: ${key}`, error);
    return null;
  }
}
