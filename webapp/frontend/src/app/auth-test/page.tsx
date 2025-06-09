import React from 'react';
import ApplicationLevelTestPage from '../../feature/authOther/applicationLevelTest/conponents/ApplicationLevelTestPage';
import NotFoundPage from '../../components/NotFoundPage';

export default function AuthTestPage() {
  // 環境変数の値をそのまま確認（Vercelでは文字列として設定される）
  const authTestEnv = process.env.NEXT_PUBLIC_ENABLE_AUTH_TEST;
  
  // 環境変数が'true'の場合のみ有効
  const isAuthTestEnabled = authTestEnv === 'true';

  // 認証テストページの無効化（ステージング環境以外）  
  if (!isAuthTestEnabled) {
    return <NotFoundPage />;
  }

  return <ApplicationLevelTestPage />;
}