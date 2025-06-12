import Phase7CommonSampleContainer from '../../../../feature/authOther/UISample/components/Phase7CommonSampleContainer';
import NotFoundPage from '../../../../components/page/NotFoundPage';

// ステージング環境（開発・ステージング両方）でのみUIサンプルページを有効化
const isUISampleEnabled = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

export default function UISampleCommonPage() {
  // 本番環境ではUIサンプルページを無効化
  if (!isUISampleEnabled) {
    return <NotFoundPage />;
  }

  return <Phase7CommonSampleContainer />;
}