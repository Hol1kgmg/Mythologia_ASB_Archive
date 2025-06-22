import { generateHMACSignature } from './hmac';

export interface AdminAPIRequestOptions {
  method: string;
  path: string;
  body?: string;
  token?: string; // JWT token for authenticated requests
}

export interface AdminAPIHeaders {
  'Content-Type': string;
  Authorization?: string;
  'X-HMAC-Signature': string;
  'X-Timestamp': string;
  'X-API-Key': string;
}

/**
 * 管理者API用の認証ヘッダーを生成
 */
export async function generateAdminAPIHeaders(
  options: AdminAPIRequestOptions
): Promise<AdminAPIHeaders> {
  const { method, path, body, token } = options;

  // 環境変数から秘密鍵とAPIキーを取得
  const hmacSecret = process.env.NEXT_PUBLIC_ADMIN_HMAC_SECRET;
  const apiKey = process.env.NEXT_PUBLIC_VERCEL_API_KEY;

  if (!hmacSecret) {
    throw new Error('ADMIN_HMAC_SECRET is not configured');
  }

  if (!apiKey) {
    throw new Error('VERCEL_API_KEY is not configured');
  }

  // HMAC署名を生成
  const { signature, timestamp } = await generateHMACSignature(method, path, body, hmacSecret);

  const headers: AdminAPIHeaders = {
    'Content-Type': 'application/json',
    'X-HMAC-Signature': signature,
    'X-Timestamp': timestamp,
    'X-API-Key': apiKey,
  };

  // JWTトークンが提供されている場合は追加
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * 管理者API用の安全なfetch関数
 */
export async function adminAPIFetch(
  url: string,
  options: RequestInit & AdminAPIRequestOptions
): Promise<Response> {
  const { method = 'GET', path, body: requestBody, token, ...fetchOptions } = options;

  try {
    const headers = await generateAdminAPIHeaders({
      method,
      path,
      body: requestBody,
      token,
    });

    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
      body: requestBody,
    });

    return response;
  } catch (error) {
    console.error('Admin API request failed:', error);
    throw error;
  }
}

/**
 * 管理者ログイン
 */
export async function adminLogin(username: string, password: string): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const path = '/api/admin/auth/login';
  const body = JSON.stringify({ username, password });

  return adminAPIFetch(`${apiUrl}${path}`, {
    method: 'POST',
    path,
    body,
  });
}

/**
 * 管理者トークン更新
 */
export async function adminRefreshToken(refreshToken: string): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const path = '/api/admin/auth/refresh';
  const body = JSON.stringify({ refreshToken });

  return adminAPIFetch(`${apiUrl}${path}`, {
    method: 'POST',
    path,
    body,
  });
}

/**
 * 管理者情報取得
 */
export async function adminGetMe(token: string): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const path = '/api/admin/auth/me';

  return adminAPIFetch(`${apiUrl}${path}`, {
    method: 'GET',
    path,
    token,
  });
}

/**
 * 管理者ログアウト
 */
export async function adminLogout(token: string): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const path = '/api/admin/auth/logout';

  return adminAPIFetch(`${apiUrl}${path}`, {
    method: 'POST',
    path,
    token,
  });
}
