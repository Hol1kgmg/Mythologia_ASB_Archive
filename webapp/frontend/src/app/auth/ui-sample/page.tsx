import Link from 'next/link';
import NotFoundPage from '../../../components/page/NotFoundPage';
import { Box, BackgroundPattern, Alert } from '../../../components/ui';

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
      status: 'completed',
    },
    {
      href: '/auth/ui-sample/layout',
      title: 'Phase 3: レイアウト系',
      description: 'Card, Grid, Stack - レイアウト用コンポーネント',
      status: 'completed',
    },
    {
      href: '/auth/ui-sample/interaction',
      title: 'Phase 4: インタラクション系',
      description: 'Modal, Tabs, Popover, Accordion - インタラクティブコンポーネント',
      status: 'completed',
    },
    {
      href: '/auth/ui-sample/feedback',
      title: 'Phase 5: フィードバック系',
      description: 'Alert, Toast, Progress, Skeleton, Spinner - フィードバック表示コンポーネント',
      status: 'completed',
    },
    {
      href: '/auth/ui-sample/typography',
      title: 'Phase 6: タイポグラフィ系',
      description: 'Heading, Text, Label, Caption, Code - テキスト表示コンポーネント',
      status: 'completed',
    },
    {
      href: '/auth/ui-sample/common',
      title: 'Phase 7: 背景・共通コンポーネント',
      description: 'BackgroundPattern, Container, Section - 背景とレイアウトコンポーネント',
      status: 'completed',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden text-white">
      {/* 背景パターン */}
      <BackgroundPattern />

      {/* メインコンテナ */}
      <Box className="relative z-10 min-h-screen py-8">
        <Box className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-center text-gray-300 mb-2">
            UIコンポーネントサンプル
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Headless UIを使用した共通コンポーネントライブラリ
          </p>

          <Alert
            variant="warning"
            title="開発者向け機能"
            className="w-full max-w-3xl mx-auto my-8"
          >
            共通UIコンポーネントのサンプルページです
          </Alert>
          
          <Box className="space-y-6">
            {samplePages.map((page) => (
              <Link key={page.href} href={page.href} className="block mb-6">
                <Box
                  padding="md"
                  background="none"
                  border="default"
                  rounded="lg"
                  className={`cursor-pointer transition-all duration-200 bg-gray-800/40 hover:bg-gray-700/60 hover:border-gray-500 ${
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