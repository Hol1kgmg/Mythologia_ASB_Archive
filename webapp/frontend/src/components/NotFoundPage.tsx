'use client';

import React from 'react';
import HomeButton from './HomeButton';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showHomeLink?: boolean;
  customActions?: React.ReactNode;
}

export default function NotFoundPage({
  title = "404",
  message = "ページが見つかりません",
  showHomeLink = true,
  customActions
}: NotFoundPageProps) {

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
          {/* エラーコード */}
          <h1 
            className="mb-6"
            aria-label={`エラーコード ${title}`}
            style={{
              fontSize: '6rem',
              fontWeight: 700,
              letterSpacing: '2px',
              color: '#e0e0e0',
            }}
          >
            {title}
          </h1>
          
          {/* エラーメッセージ */}
          <p 
            className="text-xl text-slate-300 mb-12 font-light tracking-wide"
            role="alert"
            aria-live="polite"
          >
            {message}
          </p>

          {/* ホームリンク */}
          {showHomeLink && (
            <div className="mb-8">
              <HomeButton>
                ← ホームに戻る
              </HomeButton>
            </div>
          )}

          {/* カスタムアクション */}
          {customActions && (
            <div className="mb-12">
              {customActions}
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