import Link from 'next/link';
import NotFoundPage from '../../../components/NotFoundPage';
import { Box } from '../../../components/ui';

// ステージング環境（開発・ステージング両方）でのみUIサンプルページを有効化
const isUISampleEnabled = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

export default function UISampleIndexPage() {
  // 本番環境ではUIサンプルページを無効化
  if (!isUISampleEnabled) {
    return <NotFoundPage />;
  }

  const samplePages = [
    {
      href: '/auth/ui-sample/components',
      title: 'Phase 1: 基盤コンポーネント',
      description: 'Button, Input, Select, Box - 基本的なUIコンポーネント',
      status: 'completed',
    },
    {
      href: '/auth/ui-sample/form',
      title: 'Phase 2: フォーム系',
      description: 'Textarea, Checkbox, Radio - フォーム関連コンポーネント',
      status: 'planned',
    },
    {
      href: '/auth/ui-sample/layout',
      title: 'Phase 3: レイアウト系',
      description: 'Card, Grid, Stack - レイアウト用コンポーネント',
      status: 'planned',
    },
    {
      href: '/auth/ui-sample/interaction',
      title: 'Phase 4: インタラクション系',
      description: 'Modal, Tabs, Popover, Accordion - インタラクティブコンポーネント',
      status: 'planned',
    },
    {
      href: '/auth/ui-sample/feedback',
      title: 'Phase 5: フィードバック系',
      description: 'Badge, Alert, Loading - フィードバック表示コンポーネント',
      status: 'planned',
    },
  ];

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
      <Box className="relative z-10 min-h-screen py-8">
        <Box className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-center text-gray-300 mb-2">
            UIコンポーネントサンプル
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Headless UIを使用した共通コンポーネントライブラリ
          </p>
          
          <Box className="space-y-4">
            {samplePages.map((page) => (
              <Link key={page.href} href={page.href}>
                <Box
                  padding="md"
                  background="default"
                  border="default"
                  rounded="lg"
                  className={`cursor-pointer transition-all duration-200 hover:bg-gray-700 hover:border-gray-500 ${
                    page.status === 'planned' ? 'opacity-60' : ''
                  }`}
                >
                  <Box display="flex" className="items-center justify-between">
                    <Box>
                      <h3 className="text-lg font-semibold text-gray-300 mb-1">
                        {page.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {page.description}
                      </p>
                    </Box>
                    <Box className="text-gray-400">
                      {page.status === 'completed' ? (
                        <span className="text-green-400">✓ 実装済み</span>
                      ) : (
                        <span className="text-gray-500">予定</span>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Link>
            ))}
          </Box>

          <Box className="text-center mt-12">
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
            >
              ← ホームに戻る
            </Link>
          </Box>
        </Box>
      </Box>
    </div>
  );
}