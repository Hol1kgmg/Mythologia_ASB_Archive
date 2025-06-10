import Phase2FormSamplePage from '../../../../components/Phase2FormSamplePage';
import NotFoundPage from '../../../../components/NotFoundPage';
import { Box } from '../../../../components/ui';

// ステージング環境（開発・ステージング両方）でのみUIサンプルページを有効化
const isUISampleEnabled = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

export default function FormSamplePage() {
  // 本番環境ではUIサンプルページを無効化
  if (!isUISampleEnabled) {
    return <NotFoundPage />;
  }

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
        <Box className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-300 mb-8">
            UIコンポーネントサンプル - Phase 2 フォーム系
          </h1>
          
          <Phase2FormSamplePage />
        </Box>
      </Box>
    </div>
  );
}