import { z } from 'zod';
import * as dotenv from 'dotenv';

// 開発環境の場合のみ.envファイルを読み込む
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

// 環境変数スキーマ
const envSchema = z.object({
  // 基本設定
  ENVIRONMENT: z.enum(['development', 'production']).default('development'),
  DATABASE_TYPE: z.enum(['postgresql', 'd1']).default('postgresql'),
  
  // PostgreSQL設定（Vercel用）
  DATABASE_URL: z.string().optional(),
  POSTGRES_POOL_TIMEOUT: z.string().transform(Number).default('60'),
  
  // API設定
  API_VERSION: z.string().default('1.0.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // CORS設定
  CORS_ALLOWED_ORIGINS: z.string()
    .transform(s => s.split(',').map(o => o.trim()))
    .default('http://localhost:3000'),
  
  // セキュリティ
  JWT_SECRET: z.string().optional(),
  SESSION_TIMEOUT: z.string().transform(Number).default('3600'),
});

// 環境変数バリデーション
export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.errors, null, 2));
    throw new Error('Invalid environment variables');
  }
  
  return parsed.data;
}

// 環境設定エクスポート
export const env = validateEnv();

// 環境判定ヘルパー
export const isProduction = env.ENVIRONMENT === 'production';
export const isDevelopment = env.ENVIRONMENT === 'development';
export const isPostgreSQL = env.DATABASE_TYPE === 'postgresql';
export const isD1 = env.DATABASE_TYPE === 'd1';

// Cloudflare Workers環境の型定義
export interface CloudflareEnv {
  DB?: D1Database;
  CACHE?: any; // KVNamespace型定義を一時的にanyに変更
  DATABASE_TYPE?: string;
  ENVIRONMENT?: string;
}

// 統合環境型
export type AppEnv = typeof env & CloudflareEnv;