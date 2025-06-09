import { getOrGenerateJWT } from './auth/jwt';
import { generateHMACSignature } from './auth/hmac';

export interface ApiClientOptions {
  baseURL: string;
  appId: string;
  jwtSecret: string;
  hmacSecret: string;
}

export interface ApiRequestOptions {
  method?: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiClient {
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions) {
    this.options = options;
  }

  async request<T = unknown>(requestOptions: ApiRequestOptions): Promise<T> {
    const {
      method = 'GET',
      path,
      body,
      headers = {}
    } = requestOptions;

    try {
      // Generate JWT token
      const token = await getOrGenerateJWT(
        this.options.appId,
        this.options.jwtSecret
      );

      // Prepare request body
      const requestBody = body ? JSON.stringify(body) : undefined;

      // Generate HMAC signature
      const { signature, timestamp } = await generateHMACSignature(
        method,
        path,
        requestBody,
        this.options.hmacSecret
      );

      // Prepare headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-HMAC-Signature': signature,
        'X-Timestamp': timestamp,
        ...headers
      };

      // Make request
      const response = await fetch(`${this.options.baseURL}${path}`, {
        method,
        headers: requestHeaders,
        body: requestBody
      });

      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          `Request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        { originalError: error }
      );
    }
  }

  // Convenience methods
  async get<T = unknown>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'GET', path, headers });
  }

  async post<T = unknown>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, headers });
  }

  async put<T = unknown>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body, headers });
  }

  async delete<T = unknown>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, headers });
  }
}

export class ApiError extends Error {
  public status: number;
  public data: unknown;

  constructor(message: string, status: number, data: unknown = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Create default API client instance
export function createApiClient(): ApiClient {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const appId = process.env.NEXT_PUBLIC_APP_ID || 'mythologia-frontend';
  const jwtSecret = process.env.JWT_SECRET;
  const hmacSecret = process.env.HMAC_SECRET;

  if (!baseURL) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
  }

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (!hmacSecret) {
    throw new Error('HMAC_SECRET environment variable is required');
  }

  return new ApiClient({
    baseURL,
    appId,
    jwtSecret,
    hmacSecret
  });
}