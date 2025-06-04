// 共通ユーティリティ関数

/**
 * APIエンドポイントのベースURL生成
 */
export function createApiUrl(endpoint: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/api/${endpoint.replace(/^\//, '')}`;
}

/**
 * リクエストID生成
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * カード番号フォーマット関数
 */
export function formatCardNumber(cardNumber: string): string {
  return cardNumber.padStart(5, '0');
}

/**
 * コスト表示用フォーマット
 */
export function formatCost(cost: number): string {
  return cost.toString();
}

/**
 * パワー表示用フォーマット
 */
export function formatPower(power: number): string {
  return power.toLocaleString();
}