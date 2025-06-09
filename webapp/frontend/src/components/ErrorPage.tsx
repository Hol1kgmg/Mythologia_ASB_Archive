'use client';

import React, { useEffect } from 'react';
import HomeButton from './HomeButton';

interface ErrorPageProps {
  title?: string;
  message?: string;
  subMessage?: string;
  error?: Error & { digest?: string };
  onRetry?: () => void;
  showRetryButton?: boolean;
  showHomeButton?: boolean;
  showErrorDetails?: boolean;
}

export default function ErrorPage({
  title = "ERROR",
  message = "予期しないエラーが発生しました",
  subMessage = "申し訳ございませんが、一時的な問題が発生している可能性があります。",
  error,
  onRetry,
  showRetryButton = true,
  showHomeButton = true,
  showErrorDetails = true
}: ErrorPageProps) {
  useEffect(() => {
    if (error) {
      console.error('Application Error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen relative overflow-x-hidden text-white bg-gradient-to-b from-black via-gray-900 to-black">
      {/* 背景パターン */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.2) 0%, transparent 50%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.01) 10px,
              rgba(255, 255, 255, 0.01) 20px
            )
          `
        }}
      />

      {/* メインコンテナ */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-5 text-center">
        
        <div className="max-w-2xl mx-auto">
          {/* エラータイトル */}
          <h1 
            className="mb-6"
            aria-label={`エラー: ${title}`}
            style={{
              fontSize: '6rem',
              fontWeight: 700,
              letterSpacing: '2px',
              color: '#ef4444',
            }}
          >
            {title}
          </h1>
          
          {/* エラーメッセージ */}
          <p 
            className="text-xl text-slate-300 mb-4 font-light tracking-wide"
            role="alert"
            aria-live="polite"
          >
            {message}
          </p>
          
          {subMessage && (
            <p className="text-slate-400 mb-12">
              {subMessage}
            </p>
          )}

          {/* 再試行ボタン */}
          {showRetryButton && onRetry && (
            <div className="flex justify-center mb-8">
              <button
                onClick={onRetry}
                className="text-slate-400 no-underline py-3 px-12 border border-white border-opacity-20 rounded-md transition-all duration-300 text-sm hover:text-red-400 hover:border-red-400 hover:bg-opacity-5 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="ページを再試行"
              >
                🔄 再試行
              </button>
            </div>
          )}

          {/* ステージング環境でのみエラー詳細を表示 */}
          {showErrorDetails && error && process.env.NEXT_PUBLIC_IS_STAGING === 'true' && (
            <details className="text-left bg-black/30 rounded-xl p-6 border border-red-500/20 mb-8">
              <summary className="cursor-pointer text-red-300 mb-3 font-semibold">
                🐛 エラー詳細 (ステージング環境)
              </summary>
              <pre className="text-red-400 whitespace-pre-wrap overflow-auto text-sm bg-gray-900 rounded p-4">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}

          {/* ホームボタン */}
          {showHomeButton && (
            <div className="flex justify-center mt-8">
              <HomeButton>
                ← ホームに戻る
              </HomeButton>
            </div>
          )}

        </div>
      </div>

      {/* レスポンシブ対応 */}
      <style jsx>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 4rem !important;
          }
        }
      `}</style>
    </div>
  );
}