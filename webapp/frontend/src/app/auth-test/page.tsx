'use client';

import React, { useEffect } from 'react';
import ApplicationLevelTestPage from '../../feature/authOther/applicationLevelTest/conponents/ApplicationLevelTestPage';
import NotFoundPage from '../../components/NotFoundPage';

export default function AuthTestPage() {
  // 環境変数の値をそのまま確認（Vercelでは文字列として設定される）
  const authTestEnv = process.env.NEXT_PUBLIC_ENABLE_AUTH_TEST;
  
  // クライアントサイドでデバッグログを出力
  useEffect(() => {
    console.log('[DEBUG] NEXT_PUBLIC_ENABLE_AUTH_TEST value:', authTestEnv);
    console.log('[DEBUG] Type of NEXT_PUBLIC_ENABLE_AUTH_TEST:', typeof authTestEnv);
    console.log('[DEBUG] Comparison result (=== "true"):', authTestEnv === 'true');
    console.log('[DEBUG] NODE_ENV:', process.env.NODE_ENV);
    console.log('[DEBUG] Is undefined?:', authTestEnv === undefined);
    console.log('[DEBUG] Raw value:', JSON.stringify(authTestEnv));
    console.log('[DEBUG] Timestamp:', new Date().toISOString());
  }, []);
  
  // 環境変数が'true'の場合のみ有効
  const isAuthTestEnabled = authTestEnv === 'true';

  // 認証テストページの無効化（ステージング環境以外）  
  if (!isAuthTestEnabled) {
    return (
      <div>
        <NotFoundPage />
        <div style={{ display: 'none' }}>
          DEBUG: {authTestEnv || 'undefined'}
        </div>
      </div>
    );
  }

  return <ApplicationLevelTestPage />;
}