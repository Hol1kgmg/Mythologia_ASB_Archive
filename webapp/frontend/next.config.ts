import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercelビルド用に最小限の設定
  eslint: {
    // ビルド時のESLintエラーを警告に変更
    ignoreDuringBuilds: false,
  },
  typescript: {
    // ビルド時のTypeScriptエラーを無視しない
    ignoreBuildErrors: false,
  },
  
  // 外部ドメインの画像読み込み許可
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
