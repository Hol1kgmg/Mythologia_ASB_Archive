# シードデータ生成ガイド

## 概要

このドキュメントは、開発環境用のダミーデータ（シードデータ）を生成するための手順を説明します。

## 使用方法

### 基本的な使用方法

```bash
# すべてのシードデータを生成（チーム標準）
npm run db:seed:docker

# ローカル環境で実行（高速プロトタイピング用）
npm run db:seed:local
```

### コマンドラインオプション

```bash
# 既存データをクリアしてから生成
npm run db:seed -- --clear

# 管理者データのみ生成
npm run db:seed -- --admins-only

# 生成数を指定
npm run db:seed -- --count-admins=10
npm run db:seed -- --count-users=200  # 未実装
npm run db:seed -- --count-cards=1000 # 未実装

# 複数のオプションを組み合わせ
npm run db:seed -- --clear --admins-only --count-admins=3
```

## 生成されるデータ

### 管理者データ (admins)

- **スーパー管理者**: 1名（固定）
  - Username: `super_admin`
  - Email: `super@mythologia.test`
  - すべての権限を保持

- **一般管理者**: 指定数-1名
  - Username: `admin_1`, `admin_2`, ...
  - Email: `admin1@mythologia.test`, `admin2@mythologia.test`, ...
  - ロールは `admin` または `viewer` をローテーション

### 開発用認証情報

すべての管理者アカウントのパスワードは共通です：

```
Password: Demo123!@#
```

⚠️ **注意**: これらの認証情報は開発環境専用です。本番環境では使用しないでください。

## 実装状況

- ✅ 管理者データ生成 (`seedAdmins`)
- ⬜ ユーザーデータ生成 (`seedUsers`)
- ⬜ カードデータ生成 (`seedCards`)
- ⬜ デッキデータ生成 (`seedDecks`)
- ⬜ 種族・リーダーデータ生成
- ⬜ お知らせデータ生成

## 技術詳細

### ファイル構成

```
src/db/seeds/
├── index.ts           # メインシードスクリプト
├── admin-seeds.ts     # 管理者データ生成
├── user-seeds.ts      # ユーザーデータ生成（未実装）
├── card-seeds.ts      # カードデータ生成（未実装）
└── deck-seeds.ts      # デッキデータ生成（未実装）
```

### データ生成の流れ

1. **オプション解析**: CLIパラメータを解析
2. **データクリア**: `--clear`オプション時は既存データを削除
3. **順次生成**: 依存関係を考慮して順番にデータ生成
   - 管理者 → ユーザー → カード → デッキ
4. **結果表示**: 生成されたデータのサマリーを表示

### セキュリティ考慮事項

- パスワードは bcrypt でハッシュ化
- 開発環境でのみ使用することを前提
- 本番環境では別の方法で初期データを作成

## トラブルシューティング

### "Cannot find module" エラー

```bash
# 依存関係を再インストール
cd webapp/backend
npm install
```

### "Database connection failed" エラー

```bash
# Docker環境が起動しているか確認
docker-compose ps

# データベースが起動していない場合
docker-compose up -d postgres
```

### "Permission denied" エラー

```bash
# 実行権限を付与
chmod +x src/db/seeds/index.ts
```

## 今後の拡張予定

1. **ユーザーデータ生成**
   - ランダムなプロフィール情報
   - デッキ所有情報
   - プレイ履歴

2. **カードデータ生成**
   - 各種族・レアリティのカード
   - 効果テキストのバリエーション
   - 画像URLのダミーデータ

3. **デッキデータ生成**
   - 有効なデッキ構成
   - 人気デッキのテンプレート
   - デッキ評価・コメント

4. **インタラクティブモード**
   - 対話的にオプションを選択
   - プログレスバー表示
   - 詳細なログ出力