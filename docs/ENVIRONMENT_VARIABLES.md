# 環境変数管理戦略

## 概要

Mythologia Admiral Ship Bridgeでは、チーム開発を効率化するための環境変数管理戦略を採用しています。

## 📋 ファイル構成

### チーム共有ファイル（Gitコミット対象）

#### `.env` - チーム共有設定
```bash
# 用途: チーム全体で共有できる非機密設定
# Git: コミット対象 ✅
# 内容: デフォルト値、開発設定、パブリック設定

NODE_ENV=development
PORT=8787
DATABASE_TYPE=postgresql
NEXT_PUBLIC_APP_NAME="Mythologia Admiral Ship Bridge"
```

#### `.env.local.example` - 個人設定テンプレート
```bash
# 用途: 個人が設定すべき機密情報のテンプレート
# Git: コミット対象 ✅
# 内容: 機密情報の設定例・説明

DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
```

### 個人ファイル（Gitignore対象）

#### `.env.local` - 個人の機密設定
```bash
# 用途: 個人の機密情報・カスタマイズ
# Git: gitignore対象 🚫
# 内容: パスワード、APIキー、個人設定

DATABASE_URL=postgresql://myuser:mypass@localhost:5432/mydb
JWT_SECRET=my-actual-secret-key
```

## 🔄 読み込み優先順位

Next.js・Node.jsは以下の順序で環境変数を読み込みます：

```
1. .env.local      (最優先 - 個人設定)
2. .env.development / .env.production
3. .env            (チーム共有設定)
4. システム環境変数
```

## 🎯 使い分けガイドライン

### ✅ .env (チーム共有) に含めるもの
- ポート番号
- デフォルト設定値
- 公開可能な設定
- データベースタイプ
- フィーチャーフラグ
- ログレベル

### 🔒 .env.local (個人) に含めるもの
- データベースURL（パスワード含む）
- APIキー・シークレット
- JWTシークレット
- 外部サービス認証情報
- 個人のカスタマイズ設定

## 📁 プロジェクト構成

```
/
├── .env                           # チーム共有設定 (Git: ✅)
├── .env.local.example            # 個人設定テンプレート (Git: ✅)
├── .env.local                    # 個人設定 (Git: 🚫)
├── webapp/
│   ├── backend/
│   │   └── .env.example          # バックエンド個人設定テンプレート
│   └── frontend/
│       └── .env.example          # フロントエンド個人設定テンプレート
```

## 🚀 セットアップ手順

### 1. 初回セットアップ
```bash
# 1. テンプレートをコピー
cp .env.local.example .env.local

# 2. 個人の機密情報を設定
vim .env.local

# 3. Docker環境起動
docker-compose up -d

# 4. 接続確認
npm run dev
```

### 2. チーム参加時
```bash
# 1. リポジトリクローン
git clone <repository>

# 2. 環境変数設定
cp .env.local.example .env.local
# .env.local を編集して個人の設定を追加

# 3. 開発開始
npm install
npm run dev
```

## 🔐 セキュリティ原則

### DO ✅
- 機密情報は `.env.local` に記載
- `.env.local.example` で設定例を提供
- チーム設定は `.env` で共有
- 本番環境変数は各プラットフォームで設定

### DON'T 🚫
- 機密情報を `.env` に記載しない
- `.env.local` をコミットしない
- 本番パスワードを例として記載しない
- ハードコードで機密情報を埋め込まない

## 🌍 環境別設定

### ローカル開発
```bash
# .env (チーム共有)
NODE_ENV=development
PORT=8787

# .env.local (個人設定)
DATABASE_URL=postgresql://local_user:local_pass@localhost:5432/mythologia_dev
```

### Railway（本番・ステージング）
```bash
# Railway環境変数設定
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
PORT=${{PORT}}
JWT_SECRET=production-secret-key
```

### Vercel（フロントエンド）
```bash
# Vercel環境変数設定
NEXT_PUBLIC_API_URL=https://mythologia-api.railway.app
ENVIRONMENT=production
```

## 🛠️ トラブルシューティング

### 環境変数が読み込まれない
1. ファイル名確認（`.env.local` か `.env` か）
2. 優先順位確認（`.env.local` が優先）
3. `NEXT_PUBLIC_` プレフィックス確認（フロントエンド用）
4. アプリケーション再起動

### 機密情報の誤コミット防止
```bash
# .gitignoreで必ず除外
.env.local
.env.production
.env.staging
.env.*.local
```

## 📚 参考資料

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Node.js dotenv](https://github.com/motdotla/dotenv)
- [Railway Environment Variables](https://docs.railway.app/deploy/variables)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)