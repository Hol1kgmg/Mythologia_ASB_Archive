import Phase3LayoutSamplePage from '../../../../components/Phase3LayoutSamplePage';
import NotFoundPage from '../../../../components/NotFoundPage';
import { Box, BackgroundPattern } from '../../../../components/ui';

// ステージング環境（開発・ステージング両方）でのみUIサンプルページを有効化
const isUISampleEnabled = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

export default function LayoutSamplePage() {
  // 本番環境ではUIサンプルページを無効化
  if (!isUISampleEnabled) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden text-white">
      {/* 背景パターン */}
      <BackgroundPattern />

      {/* メインコンテナ */}
      <Box className="relative z-10 min-h-screen py-8">
        <Box className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-300 mb-8">
            UIコンポーネントサンプル - Phase 3 レイアウト系
          </h1>
          
          <Phase3LayoutSamplePage />
        </Box>
      </Box>
    </div>
  );
}