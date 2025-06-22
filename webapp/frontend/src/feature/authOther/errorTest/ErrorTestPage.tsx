'use client';

import { useState } from 'react';
import HomeButton from '../../../components/ui/feedback/HomeButton';

export default function ErrorTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('テスト用エラー: エラーページの動作確認');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">🧪 エラーページテスト</h1>

          <div className="bg-gray-800 bg-opacity-60 rounded-xl p-6 border border-gray-600 mb-6">
            <p className="text-gray-300 mb-2">
              以下のボタンをクリックすると、意図的にエラーを発生させてエラーページを表示できます。
            </p>
            <p className="text-gray-400 text-sm mb-4">
              このページは開発者専用です。本番環境では無効化されます。
            </p>

            <button
              type="button"
              onClick={() => setShouldThrow(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-300 font-semibold"
            >
              ⚠️ エラーを発生させる
            </button>
          </div>

          <div className="bg-yellow-900 bg-opacity-30 rounded-xl p-4 border border-yellow-600 border-opacity-30 mb-6">
            <p className="text-yellow-200 text-sm">
              💡 このページはステージング・開発環境でのみ表示されます
            </p>
          </div>

          <div className="mt-8">
            <HomeButton />
          </div>
        </div>
      </div>
    </div>
  );
}
