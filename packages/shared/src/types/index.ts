export * from './enums';
export * from './validation';

// APIレスポンス共通型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  total?: number;
  pagination?: {
    offset: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// エラーレスポンス型
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: any;
}

// 成功レスポンス型
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  count?: number;
  total?: number;
  pagination?: {
    offset: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}