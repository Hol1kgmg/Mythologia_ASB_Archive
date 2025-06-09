import React from 'react';
import ApplicationLevelTestPage from '../../feature/authOther/applicationLevelTest/conponents/ApplicationLevelTestPage';
import NotFoundPage from '../../components/NotFoundPage';

// ビルド時に環境変数を評価
const isAuthTestEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTH_TEST === 'true';

export default function AuthTestPage() {
  // 認証テストページの無効化（ステージング環境以外）
  if (!isAuthTestEnabled) {
    return <NotFoundPage />;
  }

  return <ApplicationLevelTestPage />;
}