# Drizzle ORM セットアップガイド

このドキュメントは、Mythologia Backend での Drizzle ORM の使用方法について説明します。

## 概要

Drizzle ORM を使用して、PostgreSQL データベースとの型安全な操作を実現します。

## セットアップ

### 1. 環境変数の設定

`.env` ファイルを作成し、以下の環境変数を設定します：

```env
# PostgreSQL接続文字列
DATABASE_URL=postgresql://user:password@localhost:5432/mythologia_dev

# 管理者初期設定
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=your-secure-password
INITIAL_ADMIN_EMAIL=admin@example.com
```

### 2. データベースのマイグレーション

```bash
# マイグレーションファイルの生成
npm run db:generate

# マイグレーションの実行
npm run db:migrate

# または、開発環境で直接スキーマをプッシュ
npm run db:push
```

### 3. Drizzle Studio（データベース管理UI）

```bash
npm run db:studio
```

## スキーマ定義

管理者関連のテーブルは `src/db/schema/admin.ts` で定義されています：

- `admins` - 管理者アカウント
- `admin_sessions` - 管理者セッション
- `admin_activity_logs` - 管理者活動ログ

## 使用例

```typescript
import { getDb } from './db/client';
import { admins } from './db/schema';
import { eq } from 'drizzle-orm';

// データベース接続の取得
const db = getDb();

// 管理者の検索
const admin = await db
  .select()
  .from(admins)
  .where(eq(admins.username, 'admin'))
  .limit(1);

// 新規管理者の作成
const newAdmin = await db
  .insert(admins)
  .values({
    username: 'newadmin',
    email: 'new@example.com',
    passwordHash: 'hashed_password',
    role: 'admin'
  })
  .returning();
```

## npm スクリプト

- `npm run db:generate` - マイグレーションファイルの生成
- `npm run db:migrate` - マイグレーションの実行
- `npm run db:push` - スキーマの直接プッシュ（開発用）
- `npm run db:studio` - Drizzle Studio の起動

## 注意事項

- 本番環境では必ず `db:migrate` を使用してください
- `db:push` は開発環境でのみ使用してください
- マイグレーションファイルは `drizzle/` ディレクトリに生成されます