import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercelでは自動的に最適化されるため、standaloneは不要
  // Docker用にはDOCKER_BUILD環境変数で切り替え
  ...(process.env.DOCKER_BUILD === 'true' && { output: 'standalone' }),
  
  // 開発用設定
  experimental: {
    // 必要に応じて実験的機能を有効化
  },
  
  // 環境変数
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://placeholder-api.example.com',
  },
  
  // 外部ドメインの画像読み込み許可（必要に応じて）
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
