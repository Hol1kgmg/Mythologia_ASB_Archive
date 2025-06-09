import ApplicationLevelTestPage from '../../feature/authOther/applicationLevelTest/conponents/ApplicationLevelTestPage';
import NotFoundPage from '../../components/NotFoundPage';

// 環境変数が'true'の場合のみ有効
const isAuthTestEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTH_TEST === 'true';
export default function AuthTestPage() {
  // 認証テストページの無効化（ステージング環境以外）  
  if (!isAuthTestEnabled) {
    return <NotFoundPage />;
  }

  return <ApplicationLevelTestPage />;
}