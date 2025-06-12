import ErrorTestPage from '../../../feature/authOther/errorTest/ErrorTestPage';
import NotFoundPage from '../../../components/page/NotFoundPage';

// ステージング環境（開発・ステージング両方）でのみエラーテストページを有効化
const isErrorTestEnabled = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

export default function ErrorTestPageRoute() {
  // 本番環境ではエラーテストページを無効化
  if (!isErrorTestEnabled) {
    return <NotFoundPage />;
  }

  return <ErrorTestPage />;
}