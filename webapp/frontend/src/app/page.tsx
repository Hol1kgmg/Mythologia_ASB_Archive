'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [apiUrl, setApiUrl] = useState('');
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787');
  }, []);

  const checkAPIHealth = async () => {
    setHealthStatus('loading');
    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      setHealthData(data);
      setHealthStatus('success');
    } catch (error) {
      console.error('API Health Check Failed:', error);
      setHealthData({ error: 'API接続に失敗しました' });
      setHealthStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      <main className="container mx-auto px-4 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🚢 Mythologia Admiral Ship Bridge
          </h1>
          <p className="text-xl text-blue-200 mb-2">神託のメソロギア 非公式ファンサイト</p>
          <p className="text-sm text-gray-300">カード情報データベース・デッキ構築サポート</p>
        </div>

        {/* 環境情報 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🔧 開発環境情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">フロントエンド:</span>
              <span className="ml-2">Next.js (Vercel)</span>
            </div>
            <div>
              <span className="font-semibold">バックエンドAPI:</span>
              <span className="ml-2 font-mono text-sm">{apiUrl}</span>
            </div>
            <div>
              <span className="font-semibold">環境:</span>
              <span className="ml-2">{process.env.NODE_ENV}</span>
            </div>
            <div>
              <span className="font-semibold">Docker:</span>
              <span className="ml-2">✅ 対応</span>
            </div>
          </div>
        </div>

        {/* API接続テスト */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🌐 API接続テスト</h2>
          <div className="flex gap-4 items-center mb-4">
            <button
              onClick={checkAPIHealth}
              disabled={healthStatus === 'loading'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {healthStatus === 'loading' ? '接続中...' : 'ヘルスチェック実行'}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold">状態:</span>
              {healthStatus === 'idle' && <span className="text-gray-400">未実行</span>}
              {healthStatus === 'loading' && <span className="text-yellow-400">🔄 接続中</span>}
              {healthStatus === 'success' && <span className="text-green-400">✅ 正常</span>}
              {healthStatus === 'error' && <span className="text-red-400">❌ エラー</span>}
            </div>
          </div>
          
          {healthData && (
            <div className="bg-black/20 rounded p-4">
              <h3 className="font-semibold mb-2">API応答:</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(healthData, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* システム情報 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📋 システム構成</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">🚀 フロントエンド</h3>
              <ul className="space-y-1 text-sm">
                <li>• Next.js 15 + React 19</li>
                <li>• TailwindCSS</li>
                <li>• TypeScript</li>
                <li>• Vercel デプロイ</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🚂 バックエンド</h3>
              <ul className="space-y-1 text-sm">
                <li>• Hono API Framework</li>
                <li>• PostgreSQL + Redis</li>
                <li>• TypeScript</li>
                <li>• Railway デプロイ</li>
              </ul>
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer className="text-center mt-12 text-gray-400">
          <p>⚠️ これは非公式のファンプロジェクトです。公式運営とは関係ありません。</p>
        </footer>
      </main>
    </div>
  );
}
