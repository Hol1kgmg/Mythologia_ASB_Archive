import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Mythologia Admiral Ship Bridge
      </h1>
      <p className="text-center text-gray-600 mb-8">
        神託のメソロギア 非公式ファンサイト
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link 
          href="/cards" 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">カード検索</h2>
          <p className="text-gray-600">
            カード情報の検索・フィルタリング
          </p>
        </Link>
        
        <Link 
          href="/decks" 
          className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">デッキ構築</h2>
          <p className="text-gray-600">
            デッキの作成・編集・共有
          </p>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium mb-4">開発状況</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-green-800">
            🎉 バックエンド実装が完了しました。APIの準備ができています。
          </p>
          <div className="mt-2 text-sm text-green-600">
            <p>✅ ワークスペース設定完了</p>
            <p>✅ 共有パッケージ（型定義・定数）</p>
            <p>✅ ドメインモデル実装</p>
            <p>✅ リポジトリパターン</p>
            <p>✅ データベースアダプター</p>
            <p>✅ APIルートハンドラー</p>
          </div>
        </div>
      </div>
    </main>
  );
}
