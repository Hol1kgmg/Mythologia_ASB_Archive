import { notFound } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ 'admin-secret': string }>;
}

/**
 * 管理者ページ用動的レイアウト
 * 正しい秘匿パスでない場合は404を返す
 */
export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const secret = (await params)['admin-secret'];
  
  // 環境変数から現在の秘匿パスを取得
  const currentSecretPath = process.env.ADMIN_SECRET_PATH;
  const nextSecretPath = process.env.ADMIN_SECRET_PATH_NEXT;
  
  // デバッグ情報を出力
  console.log('AdminLayout Debug:', {
    secret,
    currentSecretPath,
    nextSecretPath,
  });
  
  // 秘匿パスが設定されていない場合は開発環境として許可
  if (!currentSecretPath) {
    console.log('Admin secret path not configured - allowing access for development');
    return <>{children}</>;
  }
  
  // 正しい秘匿パスかチェック
  const validSecrets = [
    currentSecretPath,
    ...(nextSecretPath ? [nextSecretPath] : []),
  ];
  
  console.log('Valid secrets check:', {
    validSecrets,
    isValid: validSecrets.includes(secret),
  });
  
  if (!validSecrets.includes(secret)) {
    // 不正なパスの場合は404
    console.warn('Invalid admin secret path attempted:', secret);
    notFound();
  }
  
  // 正しいパスの場合はページを表示
  return <>{children}</>;
}