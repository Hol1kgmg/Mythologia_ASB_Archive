import { useState, useEffect } from 'react';

interface HealthStatus {
  status: string;
  timestamp: string;
  environment?: string;
}

interface ApiInfo {
  name: string;
  version: string;
  description: string;
}

function App() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // API健康状態チェック
        const healthResponse = await fetch('/api/health');
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          setHealthStatus(healthData);
        }

        // API情報取得
        const apiResponse = await fetch('/api');
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          setApiInfo(apiData);
        }
      } catch (error) {
        console.error('API接続エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            神託のメソロギア
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            非公式カード情報データベース・デッキ構築アプリ
          </p>
          <p className="text-sm text-red-500 font-medium">
            ⚠️ これは有志による非公式プロジェクトです。公式運営とは関係ありません。
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* API情報カード */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🚀 API情報
            </h2>
            {loading ? (
              <div className="text-gray-500">読み込み中...</div>
            ) : apiInfo ? (
              <div className="space-y-2">
                <p><span className="font-medium">アプリケーション:</span> {apiInfo.name}</p>
                <p><span className="font-medium">バージョン:</span> {apiInfo.version}</p>
                <p><span className="font-medium">説明:</span> {apiInfo.description}</p>
              </div>
            ) : (
              <div className="text-red-500">API情報の取得に失敗しました</div>
            )}
          </div>

          {/* ヘルスチェックカード */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              💚 システム状態
            </h2>
            {loading ? (
              <div className="text-gray-500">読み込み中...</div>
            ) : healthStatus ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">状態:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    healthStatus.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {healthStatus.status === 'healthy' ? '正常' : 'エラー'}
                  </span>
                </div>
                <p><span className="font-medium">更新時刻:</span> {new Date(healthStatus.timestamp).toLocaleString('ja-JP')}</p>
                {healthStatus.environment && (
                  <p><span className="font-medium">環境:</span> {healthStatus.environment}</p>
                )}
              </div>
            ) : (
              <div className="text-red-500">ヘルスチェックに失敗しました</div>
            )}
          </div>

          {/* 利用可能なAPIエンドポイント */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🔧 APIエンドポイント
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">基本</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">GET /</code> - アプリケーション情報</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">GET /api/health</code> - ヘルスチェック</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">種族管理</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">GET /api/tribes</code> - 種族一覧</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">POST /api/tribes</code> - 種族作成</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">カード管理</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">GET /api/cards</code> - カード一覧</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">POST /api/cards</code> - カード作成</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">カードセット管理</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">GET /api/card-sets</code> - セット一覧</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">POST /api/card-sets</code> - セット作成</li>
                </ul>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Made with ❤️ by the Mythologia Community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;