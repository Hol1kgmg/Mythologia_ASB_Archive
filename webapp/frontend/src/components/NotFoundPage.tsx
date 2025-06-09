'use client';

import React from 'react';
import Link from 'next/link';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showHomeLink?: boolean;
}

export default function NotFoundPage({
  title = "404",
  message = "ページが見つかりません",
  showHomeLink = true
}: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400 mb-4">{message}</p>
        {showHomeLink && (
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ホームに戻る
          </Link>
        )}
      </div>
    </div>
  );
}