'use client';

import React from 'react';
import Link from 'next/link';
import AuthTestButton from '../../components/AuthTestButton';

export default function AuthTestPage() {
  // 認証テストページの無効化（ステージング環境以外）
  if (!process.env.NEXT_PUBLIC_ENABLE_AUTH_TEST) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-400 mb-4">ページが見つかりません</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">ホームに戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              🔐 Application Level認証テスト
            </h1>
            <p className="text-gray-300 text-lg mb-2">
              Vercel ↔ Railway間のJWT + HMAC二重認証の動作確認
            </p>
            <p className="text-gray-400 text-sm">
              このページは開発者専用です。本番環境では無効化されます。
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <div>
                <h3 className="text-yellow-400 font-semibold">開発者向け機能</h3>
                <p className="text-yellow-200 text-sm">
                  このページは認証システムの動作確認専用です。直接URLを入力してアクセスしてください。
                </p>
              </div>
            </div>
          </div>

          {/* Auth Test Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Button */}
            <div className="bg-gray-800 bg-opacity-60 rounded-xl p-6 border border-gray-600">
              <h2 className="text-xl font-semibold mb-4 text-center">認証テスト実行</h2>
              <AuthTestButton />
            </div>

            {/* Information */}
            <div className="bg-gray-800 bg-opacity-60 rounded-xl p-6 border border-gray-600">
              <h2 className="text-xl font-semibold mb-4">認証システム情報</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-blue-400 mb-2">🛡️ セキュリティレイヤー</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• JWT（JSON Web Token）: アプリケーション識別</li>
                    <li>• HMAC署名: リクエスト完全性検証</li>
                    <li>• タイムスタンプ: リプレイ攻撃防止</li>
                    <li>• レート制限: 50リクエスト/分</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-green-400 mb-2">📡 通信フロー</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• フロントエンド: JWT生成 + HMAC署名</li>
                    <li>• バックエンド: 二重認証検証</li>
                    <li>• レスポンス: 認証結果 + メタ情報</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-purple-400 mb-2">🌐 環境設定</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• フロントエンド: Vercel</li>
                    <li>• バックエンド: Railway</li>
                    <li>• DB: Railway PostgreSQL</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mt-8 bg-gray-800 bg-opacity-40 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">🔧 技術仕様</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-cyan-400 mb-3">JWT設定</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>アルゴリズム: HS256</div>
                  <div>有効期限: 1時間</div>
                  <div>ペイロード: iss, exp, iat, jti</div>
                  <div>発行者: mythologia-frontend</div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-orange-400 mb-3">HMAC設定</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>アルゴリズム: SHA-256</div>
                  <div>署名対象: メソッド + パス + タイムスタンプ + ボディ</div>
                  <div>有効期限: 5分</div>
                  <div>検証: Constant-time比較</div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}