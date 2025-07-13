/**
 * セキュアな管理者API（認証情報をサーバーサイドで処理）
 * 
 * 🔒 セキュリティ修正:
 * - NEXT_PUBLIC_環境変数の使用を廃止
 * - 認証情報処理をサーバーサイドプロキシに移行
 * - クライアントサイドからの認証情報露出を完全防止
 */

export interface AdminAPIRequestOptions {
  method: string;
  path: string;
  body?: string;
  token?: string; // JWT token for authenticated requests
}

/**
 * セキュアな管理者API用fetch関数
 * サーバーサイドプロキシ経由で認証処理
 */
export async function secureAdminAPIFetch(
  options: AdminAPIRequestOptions
): Promise<Response> {
  const { method, path, body, token } = options;

  try {
    // サーバーサイドプロキシ経由でリクエスト
    const response = await fetch('/api/admin/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method,
        path,
        body,
        token,
      }),
    });

    return response;
  } catch (error) {
    console.error('Secure admin API request failed:', error);
    throw error;
  }
}

/**
 * 管理者ログイン（セキュア版）
 */
export async function secureAdminLogin(username: string, password: string): Promise<Response> {
  const path = '/api/admin/auth/login';
  const body = JSON.stringify({ username, password });

  return secureAdminAPIFetch({
    method: 'POST',
    path,
    body,
  });
}

/**
 * 管理者トークン更新（セキュア版）
 */
export async function secureAdminRefreshToken(refreshToken: string): Promise<Response> {
  const path = '/api/admin/auth/refresh';
  const body = JSON.stringify({ refreshToken });

  return secureAdminAPIFetch({
    method: 'POST',
    path,
    body,
  });
}

/**
 * 管理者情報取得（セキュア版）
 */
export async function secureAdminGetMe(token: string): Promise<Response> {
  const path = '/api/admin/auth/me';

  return secureAdminAPIFetch({
    method: 'GET',
    path,
    token,
  });
}

/**
 * 管理者ログアウト（セキュア版）
 */
export async function secureAdminLogout(token: string): Promise<Response> {
  const path = '/api/admin/auth/logout';

  return secureAdminAPIFetch({
    method: 'POST',
    path,
    token,
  });
}

// 下位互換性のためのエイリアス（段階的移行用）
export const adminLogin = secureAdminLogin;
export const adminRefreshToken = secureAdminRefreshToken;
export const adminGetMe = secureAdminGetMe;
export const adminLogout = secureAdminLogout;
export const adminAPIFetch = secureAdminAPIFetch;