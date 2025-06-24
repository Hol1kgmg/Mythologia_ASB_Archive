// Authentication infrastructure exports

export type { ApplicationAuthOptions } from './middleware/auth.js';
// Unified middleware exports
export {
  adminAuth,
  applicationAuth,
  getAdminInfo,
  getAuthInfo,
  requireAdminPermission,
  requireAdminRole,
} from './middleware/auth.js';
export {
  adminGeneralRateLimit,
  adminLoginRateLimit,
  adminRateLimit,
  adminRefreshRateLimit,
  generalRateLimit,
  getAdminRateLimitStatus,
  resetAdminRateLimit,
} from './middleware/rate-limit.js';
export {
  adminAPISecurity,
  adminAPISecurityDevelopment,
  adminAPISecurityProduction,
  adminSecretURL,
  getAdminAccessStats,
} from './middleware/security.js';

// Utility exports
export type { HMACValidationOptions } from './utils/hmac.js';
export { generateHMACSignature, validateHMACSignature } from './utils/hmac.js';
export type { ApplicationJWTPayload } from './utils/jwt.js';
export { validateJWTPayload, verifyJWT } from './utils/jwt.js';
