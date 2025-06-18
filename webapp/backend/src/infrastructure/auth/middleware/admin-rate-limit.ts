import type { Context, Next } from 'hono';
import { logger } from '../../../utils/logger';

interface AdminRateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (c: Context) => string; // Function to generate rate limit key
  skipSuccessfulLogin?: boolean; // Skip rate limiting for successful logins
}

// Simple in-memory rate limiter for admin endpoints
// For production, consider using Redis for distributed rate limiting
const adminRateLimitStore = new Map<string, { 
  count: number; 
  resetTime: number;
  blockedUntil?: number; // Account lockout time
}>();

export function adminRateLimit(options: AdminRateLimitOptions) {
  const { 
    windowMs, 
    maxRequests, 
    keyGenerator = defaultAdminKeyGenerator,
    skipSuccessfulLogin = false
  } = options;
  
  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.05) { // 5% chance
      cleanupExpiredAdminEntries(now);
    }
    
    // Get or create rate limit entry
    let entry = adminRateLimitStore.get(key);
    
    // Check if account is temporarily blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      const blockedFor = Math.ceil((entry.blockedUntil - now) / 1000 / 60); // minutes
      logger.warn(`Admin login blocked for key: ${key} (blocked for ${blockedFor} more minutes)`);
      return c.json({
        error: 'Account temporarily locked',
        message: `Too many failed login attempts. Try again in ${blockedFor} minutes.`,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      }, 429);
    }
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs
      };
      adminRateLimitStore.set(key, entry);
    } else {
      // Increment count
      entry.count++;
    }
    
    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const resetTime = Math.ceil((entry.resetTime - now) / 1000);
      
      // For login endpoints, implement progressive lockout
      if (c.req.path.includes('/login')) {
        // Block account for increasing duration based on attempts
        const blockDuration = Math.min(entry.count - maxRequests, 10) * 5 * 60 * 1000; // 5-50 minutes
        entry.blockedUntil = now + blockDuration;
        
        logger.warn(`Admin login rate limit exceeded for key: ${key} (${entry.count}/${maxRequests} requests, blocked for ${blockDuration / 1000 / 60} minutes)`);
        
        return c.json({
          error: 'Too many login attempts',
          message: `Account temporarily locked due to too many failed login attempts. Try again in ${Math.ceil(blockDuration / 1000 / 60)} minutes.`,
          retryAfter: Math.ceil(blockDuration / 1000),
        }, 429);
      }
      
      logger.warn(`Admin rate limit exceeded for key: ${key} (${entry.count}/${maxRequests} requests)`);
      return c.json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: resetTime
      }, 429);
    }
    
    // Add rate limit headers
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    c.header('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
    
    await next();
    
    // Reset count on successful login (if enabled)
    if (skipSuccessfulLogin && 
        c.req.path.includes('/login') && 
        c.res.status === 200) {
      const successEntry = adminRateLimitStore.get(key);
      if (successEntry) {
        successEntry.count = 0;
        delete successEntry.blockedUntil;
        logger.info(`Rate limit reset for successful login: ${key}`);
      }
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
  const ip = c.req.header('x-forwarded-for') || 
            c.req.header('x-real-ip') || 
            c.env?.ip || 
            'unknown';
  
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

function cleanupExpiredAdminEntries(now: number): void {
  for (const [key, entry] of adminRateLimitStore.entries()) {
    // Remove expired entries (both rate limit and block time)
    if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
      adminRateLimitStore.delete(key);
    }
  }
}

/**
 * Manually reset rate limit for a specific key (admin use)
 */
export function resetAdminRateLimit(key: string): boolean {
  const deleted = adminRateLimitStore.delete(key);
  if (deleted) {
    logger.info(`Admin rate limit manually reset for key: ${key}`);
  }
  return deleted;
}

/**
 * Get current rate limit status for a key (admin use)
 */
export function getAdminRateLimitStatus(key: string): {
  count: number;
  maxRequests: number;
  resetTime: number;
  blockedUntil?: number;
} | null {
  const entry = adminRateLimitStore.get(key);
  if (!entry) {
    return null;
  }
  
  return {
    count: entry.count,
    maxRequests: 5, // Default max for login
    resetTime: entry.resetTime,
    blockedUntil: entry.blockedUntil,
  };
}