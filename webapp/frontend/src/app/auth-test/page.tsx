'use client';

import React from 'react';
import ApplicationLevelTestPage from '../../feature/authOther/applicationLevelTest/conponents/ApplicationLevelTestPage';
import NotFoundPage from '../../components/NotFoundPage';

export default function AuthTestPage() {
  // 認証テストページの無効化（ステージング環境以外）
  if (!process.env.NEXT_PUBLIC_ENABLE_AUTH_TEST) {
    return <NotFoundPage />;
  }

  return <ApplicationLevelTestPage />;
}