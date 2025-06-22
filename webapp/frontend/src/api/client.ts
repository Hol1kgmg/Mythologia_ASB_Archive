export interface ApiClientOptions {
  baseURL: string;
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
    const { method = 'GET', path, body, headers = {} } = requestOptions;

    try {
      // Prepare request body
      const requestBody = body ? JSON.stringify(body) : undefined;

      // Get authentication headers from server-side API route
      const authResponse = await fetch('/api/auth-headers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          path,
          body: requestBody,
          referrer: window.location.pathname, // 現在のページパスを送信
        }),
      });

      if (!authResponse.ok) {
        throw new Error('Failed to generate authentication headers');
      }

      const { headers: authHeaders } = await authResponse.json();

      // Prepare final headers
      const requestHeaders: Record<string, string> = {
        ...authHeaders,
        ...headers,
      };

      // Make request to external API
      const response = await fetch(`${this.options.baseURL}${path}`, {
        method,
        headers: requestHeaders,
        body: requestBody,
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

  async post<T = unknown>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, headers });
  }

  async put<T = unknown>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
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

  if (!baseURL) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
  }

  return new ApiClient({
    baseURL,
  });
}
