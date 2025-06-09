import ApplicationLevelTestPage from '../../feature/authOther/applicationLevelTest/conponents/ApplicationLevelTestPage';
import NotFoundPage from '../../components/NotFoundPage';

// ステージング環境（開発・ステージング両方）でのみ認証テストページを有効化
const isAuthTestEnabled = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

export default function AuthTestPage() {
  // 本番環境では認証テストページを無効化
  if (!isAuthTestEnabled) {
    return <NotFoundPage />;
  }

  return <ApplicationLevelTestPage />;
}