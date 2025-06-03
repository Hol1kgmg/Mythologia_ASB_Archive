# 開発マイルストーン

このディレクトリは「神託のメソロギア」Webアプリケーションの開発マイルストーンを管理します。

## ディレクトリ構造

```
development-milestones/
├── README.md                   # このファイル
├── roadmap.md                  # 全体ロードマップ
├── milestone-1-foundation.md   # マイルストーン1: 基盤構築
├── milestone-2-core.md         # マイルストーン2: コア機能実装
├── milestone-3-ui.md           # マイルストーン3: UI/UX実装
├── milestone-4-production.md   # マイルストーン4: 本番環境準備
└── release-notes/              # リリースノート
    └── v1.0.0.md              # バージョン1.0.0リリースノート
```

## 概要

各マイルストーンファイルには以下の情報を含みます：

- **目標**: 達成すべき成果物
- **期間**: 予定期間
- **タスク**: 具体的な実装タスク
- **成功基準**: 完了判定基準
- **依存関係**: 他のマイルストーンとの関係

## ステータス凡例

- 🔴 未開始
- 🟡 進行中
- 🟢 完了
- ⏸️ 一時停止
- ❌ キャンセル

## スーパー管理者アカウントの初期登録手順

### 概要
スーパー管理者アカウントは、システム全体の管理権限を持つ特別なアカウントです。このアカウントは、他の管理者アカウントの作成・管理を行うために必要です。

### 初期登録方法

#### 方法1: 環境変数による自動生成（推奨）

1. **環境変数の設定**
   ```bash
   # .env.local または .env.production
   SUPER_ADMIN_EMAIL=super@yourdomain.com
   SUPER_ADMIN_USERNAME=superadmin
   SUPER_ADMIN_PASSWORD=ChangeThisImmediately123!
   ```

2. **初期化スクリプトの実行**
   ```bash
   npm run db:seed:super-admin
   ```

3. **実行確認**
   - スクリプトは既存のスーパー管理者がいない場合のみ実行されます
   - 成功すると、設定した資格情報でログイン可能になります

#### 方法2: データベース直接操作（緊急時のみ）

1. **パスワードハッシュの生成**
   ```bash
   npm run generate:password-hash "YourSecurePassword123!"
   ```

2. **SQLの実行**
   ```sql
   INSERT INTO admins (
     id,
     username,
     email,
     password_hash,
     role,
     is_active,
     is_super_admin,
     created_at,
     updated_at
   ) VALUES (
     'uuid-generate-here',
     'superadmin',
     'super@yourdomain.com',
     '$2b$10$...', -- 生成されたハッシュ
     'super_admin',
     true,
     true,
     CURRENT_TIMESTAMP,
     CURRENT_TIMESTAMP
   );
   ```

#### 方法3: CLI ツールによる対話的作成

```bash
npm run admin:create-super
```

このコマンドは対話的にスーパー管理者の情報を入力できます：
- ユーザー名
- メールアドレス
- パスワード（確認付き）

### セキュリティ上の注意事項

1. **初回ログイン後は必ずパスワードを変更する**
   - デフォルトパスワードは一時的なものです
   - 強力なパスワードに変更してください

2. **環境変数の管理**
   - 本番環境では環境変数を安全に管理してください
   - `.env`ファイルをGitにコミットしないでください

3. **アクセス制限**
   - スーパー管理者アカウントへのアクセスは最小限に制限してください
   - 定期的にアクティビティログを確認してください

4. **バックアップ**
   - スーパー管理者のアカウント情報は別途安全な場所に保管してください
   - 緊急時のリカバリープランを準備してください

### トラブルシューティング

#### スーパー管理者アカウントにアクセスできない場合

1. **パスワードリセット**
   ```bash
   npm run admin:reset-password --username=superadmin
   ```

2. **アカウントの有効化**
   ```bash
   npm run admin:activate --username=superadmin
   ```

3. **新しいスーパー管理者の作成**（既存のスーパー管理者が完全にアクセス不可の場合）
   - データベースに直接アクセスして、既存のスーパー管理者の`is_super_admin`フラグを一時的にfalseに設定
   - 新しいスーパー管理者を作成
   - 問題を解決後、必要に応じて権限を調整

### 監査とログ

スーパー管理者のすべてのアクションは`admin_activity_logs`テーブルに記録されます：
- ログイン/ログアウト
- 他の管理者アカウントの作成/更新/削除
- 権限の変更
- システム設定の変更

定期的にログを確認し、不審なアクティビティがないか監視してください。