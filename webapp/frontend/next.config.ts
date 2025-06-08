import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker用のstandaloneビルド有効化
  output: 'standalone',
  
  // 開発用設定
  experimental: {
    // 必要に応じて実験的機能を有効化
  },
  
  // 環境変数
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  },
  
  // 外部ドメインの画像読み込み許可（必要に応じて）
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
