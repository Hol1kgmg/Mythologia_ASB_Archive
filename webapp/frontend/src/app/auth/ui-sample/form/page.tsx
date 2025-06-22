import NotFoundPage from '../../../../components/page/NotFoundPage';
import { Alert, BackgroundPattern, Box } from '../../../../components/ui';
import Phase2FormSampleContainer from '../../../../feature/authOther/UISample/components/Phase2FormSampleContainer';

// ステージング環境（開発・ステージング両方）でのみUIサンプルページを有効化
const isUISampleEnabled = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

export default function FormSamplePage() {
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
            UIコンポーネントサンプル - Phase 2 フォーム系
          </h1>

          <Alert variant="warning" title="開発者向け機能" className="w-full max-w-4xl mx-auto my-8">
            共通UIコンポーネントのサンプルページです
          </Alert>

          <Phase2FormSampleContainer />
        </Box>
      </Box>
    </div>
  );
}
