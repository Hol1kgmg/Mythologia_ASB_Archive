'use client';

import NotFoundPage from "@/components/page/NotFoundPage";
import ApplicationLevelTestPage from "@/feature/authOther/applicationLevelTest/components/ApplicationLevelTestPage";

// ステージング環境（開発・ステージング両方）でのみ認証テストページを有効化
const isAuthTestEnabled = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

// Middleware動作確認コンポーネント

function MiddlewareTestComponent() {
  const handleMiddlewareTest = () => {
    fetch(window.location.href)
      .then(response => {
        const middlewareHeader = response.headers.get('X-Middleware-Test');
        console.log('🔍 Middleware Test Result:', middlewareHeader || 'NOT_FOUND');
        alert(`Middleware実行状況: ${middlewareHeader || 'NOT_EXECUTED'}`);
      });
  };

  return (
    <div style={{ 
      backgroundColor: '#f0f0f0', 
      padding: '20px', 
      margin: '20px 0', 
      border: '2px solid #007acc',
      borderRadius: '8px' 
    }}>
      <h3>🔍 Middleware動作確認</h3>
      <p>ブラウザ開発者ツール（F12）→ Network タブでページを更新して確認:</p>
      <ul>
        <li><strong>期待するヘッダー</strong>: X-Middleware-Test: EXECUTED</li>
        <li><strong>確認方法</strong>: 最初のリクエスト → Response Headers</li>
      </ul>
      <button 
        onClick={handleMiddlewareTest}
        style={{
          backgroundColor: '#007acc',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Middlewareテスト実行
      </button>
    </div>
  );
}

export default function AuthTestPage() {
  // 本番環境では認証テストページを無効化
  if (!isAuthTestEnabled) {
    return <NotFoundPage />;
  }

  return (
    <div>
      <MiddlewareTestComponent />
      <ApplicationLevelTestPage />
    </div>
  );
}
