# 開発者TODO

## スーパー管理者データ登録の実装フロー

### 1. データベーステーブル作成
- [ ] `admins`テーブルのマイグレーションファイル作成
  ```sql
  -- migrations/001_create_admins_table.sql
  CREATE TABLE admins (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    permissions JSON DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(36),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] `admin_activity_logs`テーブルのマイグレーションファイル作成
  ```sql
  -- migrations/002_create_admin_activity_logs_table.sql
  CREATE TABLE admin_activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
  );
  ```

- [ ] マイグレーション実行コマンドの準備
  ```json
  // package.json
  "scripts": {
    "db:migrate": "tsx scripts/migrate.ts",
    "db:migrate:rollback": "tsx scripts/migrate.ts rollback"
  }
  ```

### 2. 環境変数設定
- [ ] `.env.example`ファイルの作成
  ```env
  # Database
  DATABASE_URL=
  
  # Super Admin Initial Setup
  SUPER_ADMIN_EMAIL=
  SUPER_ADMIN_USERNAME=
  SUPER_ADMIN_PASSWORD=
  
  # Security
  JWT_SECRET=
  JWT_REFRESH_SECRET=
  BCRYPT_ROUNDS=12
  ```

- [ ] `.env.local`を`.gitignore`に追加
- [ ] 環境変数バリデーションスクリプトの作成

### 3. スーパー管理者作成スクリプト実装
- [ ] `scripts/seed-super-admin.ts`の作成
  ```typescript
  // 実装内容:
  // 1. 環境変数の読み込みとバリデーション
  // 2. 既存スーパー管理者のチェック
  // 3. パスワードのハッシュ化
  // 4. データベースへの挿入
  // 5. 成功/失敗のログ出力
  ```

- [ ] npmスクリプトの追加
  ```json
  "scripts": {
    "db:seed:super-admin": "tsx scripts/seed-super-admin.ts"
  }
  ```

### 4. パスワードユーティリティ実装
- [ ] `src/utils/password.ts`の作成
  - [ ] パスワードハッシュ化関数
  - [ ] パスワード検証関数
  - [ ] パスワード強度チェック関数

- [ ] パスワードハッシュ生成スクリプト
  ```json
  "scripts": {
    "generate:password-hash": "tsx scripts/generate-password-hash.ts"
  }
  ```

### 5. 初回セットアップフロー実装
- [ ] `scripts/initial-setup.ts`の作成
  - [ ] データベース接続確認
  - [ ] マイグレーション実行
  - [ ] スーパー管理者作成
  - [ ] 初期データ投入

- [ ] セットアップコマンド
  ```json
  "scripts": {
    "setup": "tsx scripts/initial-setup.ts"
  }
  ```

### 6. セキュリティ対策実装
- [ ] 初回ログイン時のパスワード変更強制
  - [ ] `must_change_password`フラグの追加
  - [ ] ミドルウェアでのチェック

- [ ] 環境変数の暗号化
  - [ ] 本番環境での秘密管理方法の決定
  - [ ] CI/CDでの環境変数注入

### 7. バックアップ・リカバリー機能
- [ ] スーパー管理者リセットスクリプト
  ```json
  "scripts": {
    "admin:reset-password": "tsx scripts/reset-admin-password.ts",
    "admin:activate": "tsx scripts/activate-admin.ts"
  }
  ```

- [ ] 緊急アクセス手順書の作成

### 8. テスト実装
- [ ] スーパー管理者作成のユニットテスト
- [ ] 認証フローの統合テスト
- [ ] セキュリティテスト（SQLインジェクション等）

### 9. ドキュメント作成
- [ ] 開発環境セットアップガイド
- [ ] 本番環境デプロイガイド
- [ ] トラブルシューティングガイド

### 10. CI/CD設定
- [ ] GitHub Actionsでの自動テスト
- [ ] 環境変数の安全な管理
- [ ] デプロイ時の自動セットアップ

## 実装順序（推奨）

1. **Week 1前半**: データベース関連（項目1-2）
2. **Week 1後半**: スクリプト実装（項目3-5）
3. **Week 2前半**: セキュリティ実装（項目6-7）
4. **Week 2後半**: テスト・ドキュメント（項目8-10）

## 注意事項

### 開発時の確認事項
- [ ] `.env.local`がGitにコミットされていないか
- [ ] パスワードが平文でログに出力されていないか
- [ ] エラーメッセージに機密情報が含まれていないか

### デプロイ前チェックリスト
- [ ] 本番環境の環境変数が設定されているか
- [ ] スーパー管理者のパスワードが十分強力か
- [ ] バックアップ手順が準備されているか
- [ ] 監査ログが適切に設定されているか

## 参考リンク
- [bcrypt公式ドキュメント](https://www.npmjs.com/package/bcrypt)
- [JWT実装ガイド](https://jwt.io/introduction)
- [OWASP認証チートシート](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)