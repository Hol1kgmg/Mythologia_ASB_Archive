import { createHash, createHmac } from 'crypto';

export interface HMACValidationOptions {
  method: string;
  path: string;
  timestamp: string;
  body?: string;
  signature: string;
  secret: string;
  maxAge?: number; // Maximum age in milliseconds (default: 5 minutes)
}

export function generateHMACSignature(
  method: string,
  path: string,
  timestamp: string,
  body: string | undefined,
  secret: string
): string {
  // Create body hash (empty string if no body)
  const bodyHash = body ? createHash('sha256').update(body).digest('hex') : '';

  // Create message to sign
  const message = `${method}:${path}:${timestamp}:${bodyHash}`;

  // Generate HMAC signature
  return createHmac('sha256', secret).update(message).digest('hex');
}

export function validateHMACSignature(options: HMACValidationOptions): void {
  const { method, path, timestamp, body, signature, secret, maxAge = 300000 } = options;

  // Validate timestamp (prevent replay attacks)
  const requestTime = parseInt(timestamp);
  const now = Date.now();
  const age = Math.abs(now - requestTime);

  if (age > maxAge) {
    throw new Error('Request expired');
  }

  // Generate expected signature
  const expectedSignature = generateHMACSignature(method, path, timestamp, body, secret);

  // Compare signatures (constant-time comparison to prevent timing attacks)
  if (!constantTimeEquals(signature, expectedSignature)) {
    throw new Error('Invalid signature');
  }
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
