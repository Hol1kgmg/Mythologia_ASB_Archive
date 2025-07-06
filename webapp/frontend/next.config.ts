import type { Configuration } from 'webpack';
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!config.resolve) {
      config.resolve = {};
    }

    // sharedディレクトリへのエイリアス設定
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, '../shared'),
    };
    
    if (!config.module) {
      config.module = {};
    }
    if (!config.module.rules) {
      config.module.rules = [];
    }
    // 外部ディレクトリのファイルをコンパイル対象に含める
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: [
        path.resolve(__dirname, '../shared')
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel']
        }
      }
    });

    return config;
  },
  
  // 外部ディレクトリを含むように設定
  experimental: {
    externalDir: true
  }
};

module.exports = nextConfig;