# 開発ガイド

Mythologia Admiral Ship Bridgeプロジェクトの開発環境セットアップと開発ガイドを提供します。

## ドキュメント一覧

### 🚀 セットアップガイド

#### [setup-guide.md](setup-guide.md)
**全体セットアップガイド**
- **前提条件**: Node.js、npm、Gitの要件
- **ワークスペース構成**: monorepo構造の初期化
- **共有パッケージ**: 型定義・スキーマ・定数の共有設定
- **開発サーバー**: 全サービス同時起動方法
- **トラブルシューティング**: よくある問題と解決方法

#### [backend-setup.md](backend-setup.md)  
**Honoバックエンド開発ガイド**
- **Honoフレームワーク**: 軽量・高速・Railway対応
- **アーキテクチャ**: レイヤードアーキテクチャによる実装
- **API設計**: RESTful API、認証、エラーハンドリング
- **データベース統合**: Drizzle ORM + PostgreSQL
- **デプロイメント**: Railway + Vercel分離アーキテクチャ

#### [frontend-setup.md](frontend-setup.md)
**Next.js + FSDフロントエンド開発ガイド**
- **Next.js App Router**: 最新のファイルベースルーティング
- **Feature-Sliced Design**: 機能別階層アーキテクチャ
- **状態管理**: TanStack Query + Jotai
- **フォーム管理**: React Hook Form + Zod
- **UIコンポーネント**: TailwindCSS + shadcn/ui
- **パフォーマンス最適化**: 画像・コード分割

### 🗄️ データベース管理

#### [database-local-setup.md](database-local-setup.md)
**ローカルデータベース環境構築**
- **Docker環境**: PostgreSQL + Redis構成
- **環境変数設定**: .env.local設定方法
- **初期設定**: マイグレーション・シードデータ
- **管理UI**: Adminer + RedisInsight
- **トラブルシューティング**: 接続問題・設定エラーの解決

#### [database-operations-manual.md](database-operations-manual.md) 📖 **NEW**
**SQLによるデータベース操作マニュアル**
- **接続方法**: docker exec、Adminer、単発コマンド
- **基本操作**: psqlコマンド、テーブル確認、構造表示
- **CRUD操作**: SELECT/INSERT/UPDATE/DELETE の実例
- **高度なクエリ**: 結合・集計・パフォーマンス分析
- **セキュリティ**: パスワード管理・アクセス制御
- **メンテナンス**: システム監視・データ整合性確認

#### [verification-procedures.md](verification-procedures.md) 🔍 **NEW**
**開発環境動作確認手順**
- **Phase 1**: 基本動作確認（TypeScript・Docker・DB接続）
- **Phase 2**: Drizzle ORM動作確認（スキーマ・マイグレーション）
- **Phase 3**: テーブル構造確認（存在・構造・インデックス・外部キー）
- **Phase 4**: Repository動作確認（インポート・型定義）
- **Phase 5**: 実データ動作確認（サンプルデータ・整合性・制約）
- **Phase 6**: パフォーマンス確認（インデックス効果・最適化）
- **Phase 7**: 管理UI確認（Adminer・RedisInsight）
- **チェックリスト**: 段階的な確認項目とトラブルシューティング

#### [railway-postgresql-setup.md](railway-postgresql-setup.md)
**Railway PostgreSQL本番環境セットアップ**
- **Railway接続設定**: DATABASE_URLの取得と設定方法
- **Drizzle ORM統合**: スキーマ適用とマイグレーション
- **接続テスト**: 接続確認とトラブルシューティング
- **セキュリティ**: 環境変数管理のベストプラクティス
- **開発ワークフロー**: 日常的な開発からデプロイまで

### 📋 認証・アプリケーションテスト

#### [application-auth-testing.md](application-auth-testing.md)
**認証システムテストガイド**
- **認証フロー**: 管理者ログイン・セッション管理
- **API テスト**: 認証エンドポイントの動作確認
- **フロントエンド統合**: 認証状態管理とリダイレクト
- **セキュリティテスト**: 権限確認・不正アクセス防止

## 🛠️ 技術スタック概要

### 最新アーキテクチャ（2024年実装）
```
システム全体
├── 共有パッケージ: TypeScript + Zod
├── バックエンド: Hono + TypeScript + Drizzle ORM
├── データベース: PostgreSQL + Redis（Docker/Railway）
├── フロントエンド: Next.js 15 + App Router + FSD
├── デプロイ: Railway（バックエンド）+ Vercel（フロントエンド）
└── 開発ツール: Docker + VS Code + ESLint + Prettier
```

### 開発環境構成
```
ローカル開発
├── PostgreSQL 16（Docker）
├── Redis 7（Docker）
├── Adminer（DB管理UI）
├── RedisInsight（Redis管理UI）
└── Hono開発サーバー（localhost:8787）

本番環境
├── Railway（PostgreSQL + Redis + API）
└── Vercel（フロントエンド）
```

## 🚀 クイックスタート

### 1. 環境確認
```bash
node --version  # v18.0.0+
npm --version   # v8.0.0+
git --version   # v2.20+
docker --version # v20.0.0+
docker-compose --version # v2.0.0+
```

### 2. 基本セットアップ
```bash
# リポジトリクローン
git clone <repository-url>
cd Mythologia_AdmiralsShipBridge

# Docker環境起動（データベースのみ）
docker-compose up -d postgres redis

# バックエンドセットアップ
cd webapp/backend
npm install
cp .env.example .env.local
# .env.localを編集（DATABASE_URL等）

# データベース初期化
npm run db:migrate

# 開発サーバー起動
npm run dev
```

### 3. 動作確認
```bash
# データベース接続確認
npm run db:test

# API動作確認
curl http://localhost:8787/health

# 管理UI確認
open http://localhost:8080  # Adminer
open http://localhost:8001  # RedisInsight
```

### 4. フロントエンド（別ターミナル）
```bash
cd webapp/frontend
npm install
npm run dev
# http://localhost:3000 でアクセス
```

## 📋 開発フロー

### 1. 新機能開発手順
```bash
# Issue番号でブランチ作成
git checkout develop
git pull origin develop
git checkout -b feature/#000_feature-name

# Docker環境起動
docker-compose up -d postgres redis

# バックエンド開発
cd webapp/backend

# データベーススキーマ変更（必要に応じて）
# 1. src/db/schema/ でスキーマ定義
# 2. npm run db:generate でマイグレーション生成
# 3. npm run db:migrate でローカル適用

# Repository実装
# src/infrastructure/database/ にRepository追加

# API実装
# src/routes/ にエンドポイント追加

# 型チェック・ビルド
npm run build

# データベース動作確認
npm run db:test
```

### 2. データベース操作の流れ
```bash
# スキーマ変更後の確認
npm run db:generate  # マイグレーション生成
npm run db:migrate   # ローカル適用
npm run db:test      # 接続確認

# SQL直接操作（デバッグ時）
docker exec -it mythologia-postgres psql -U mythologia_user -d mythologia_dev

# 管理UI確認
open http://localhost:8080  # Adminer でテーブル確認
```

### 3. 動作確認手順
```bash
# Phase別確認（詳細は verification-procedures.md 参照）
# Phase 1: 基本動作確認
npm run build && npm run db:test

# Phase 2: スキーマ確認
npm run db:generate

# Phase 3-7: 詳細確認
# dev/verification-procedures.md の手順に従って実行
```

### 4. コミット & PR
```bash
# 変更をコミット
git add .
git commit -m "feat(admin): add session management functionality (#035)"

# プッシュ & PR作成
git push origin feature/#035_admin-sessions-logs

# PR作成（GitHub CLI使用）
gh pr create --title "feat: Phase 2実装 - admin_sessionsとadmin_activity_logsテーブル追加 (#35)" --body "..."
```

## 設計方針

### アーキテクチャ原則
1. **ドメイン分離**: ビジネスロジックと技術詳細の分離
2. **型安全性**: TypeScript strict modeによる厳密な型チェック
3. **プラットフォーム非依存**: アダプターパターンによる環境抽象化
4. **責務の明確化**: 各層の役割と境界の明確な定義

### 開発指針
- **共有パッケージ**: 型定義・スキーマ・定数のみ共有
- **ドメインロジック**: バックエンドに集約、フロントエンドは表示のみ
- **エラーハンドリング**: 統一的なエラーレスポンス形式
- **パフォーマンス**: キャッシュ戦略とコード分割

## 推奨開発環境

### VS Code拡張機能
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss", 
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### デバッグツール・管理UI
- **データベース管理**: Adminer（http://localhost:8080）
- **Redis管理**: RedisInsight（http://localhost:8001）
- **API開発**: curl / Thunder Client / Postman
- **パフォーマンス**: Chrome DevTools
- **状態管理**: React DevTools + TanStack Query DevTools

## 📚 よく使用するコマンド

### データベース関連
```bash
# 基本操作
docker-compose up -d postgres redis  # DB環境起動
npm run db:test                       # 接続確認
npm run db:migrate                    # マイグレーション適用
npm run db:generate                   # スキーマからマイグレーション生成

# 直接SQL操作
docker exec -it mythologia-postgres psql -U mythologia_user -d mythologia_dev

# スクリプト実行
npx dotenv -e .env.local -- npx tsx scripts/test-db-connection.ts
npx dotenv -e .env.local -- npx tsx scripts/reset-db.ts
```

### 開発・ビルド
```bash
# 開発サーバー
npm run dev                          # バックエンド開発サーバー
npm run build                        # TypeScriptビルド
npm run db:test                      # データベース接続テスト

# 管理UI
open http://localhost:8080           # Adminer
open http://localhost:8001           # RedisInsight
```

## 🔗 参考リンク

### 公式ドキュメント
- [Hono Framework](https://hono.dev/) - Webフレームワーク
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Next.js App Router](https://nextjs.org/docs/app) - フロントエンドフレームワーク
- [Railway](https://railway.app/docs) - バックエンドホスティング
- [Vercel](https://vercel.com/docs) - フロントエンドホスティング

### プロジェクト設計ドキュメント
- [データベース設計](../docs/system-design/database-design/) - スキーマ設計
- [開発方針](../docs/development-policy/) - アーキテクチャ原則
- [技術決定記録](../docs/development-policy/architecture/) - 技術選択理由

### 新規作成ドキュメント
- [database-operations-manual.md](./database-operations-manual.md) - SQL操作完全ガイド
- [verification-procedures.md](./verification-procedures.md) - 動作確認手順書

## 🆘 サポート・トラブルシューティング

### 段階的な問題解決

1. **基本確認**
   - [verification-procedures.md](./verification-procedures.md) のPhase 1を実行
   - Docker環境とTypeScriptビルドを確認

2. **データベース問題**
   - [database-operations-manual.md](./database-operations-manual.md) のトラブルシューティング参照
   - 接続問題・マイグレーション問題の解決

3. **開発環境問題**
   - 各セットアップガイドのトラブルシューティングセクション確認
   - 環境変数・依存関係の再確認

4. **チーム支援**
   - プロジェクトのIssueを検索
   - 新しいIssueを作成して質問

### クイック診断コマンド
```bash
# 環境確認
docker-compose ps                    # Docker状態確認
npm run build                        # TypeScript確認
npm run db:test                      # DB接続確認

# ログ確認
docker-compose logs postgres redis  # Docker logs
```

---

## ⚠️ 重要事項

- **非公式プロジェクト**: このプロジェクトは有志による非公式ファンサイトです
- **公式運営とは無関係**: 公式運営とは一切関係がありません
- **開発段階**: 設計完了・実装段階（admin機能→カード管理→デッキ機能の順で実装中）

---

**最終更新**: 2024年6月 - Issue #35 Phase 2 完了時点