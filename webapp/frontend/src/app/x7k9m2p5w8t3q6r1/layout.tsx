interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * 管理者ページ用ハードコードレイアウト（仮対応）
 * x7k9m2p5w8t3q6r1 ディレクトリ直下でのアクセスを許可
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  // 🚨 HARDCODED: 動的ルーティング問題の仮対応
  console.log('🔒 HARDCODED Admin Layout - Direct access to x7k9m2p5w8t3q6r1');
  console.log('📝 Environment info:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_IS_STAGING: process.env.NEXT_PUBLIC_IS_STAGING,
    timestamp: new Date().toISOString(),
  });
  
  // ハードコードディレクトリでは環境変数チェックを省略
  return <>{children}</>;
}