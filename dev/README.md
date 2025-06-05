# 開発ガイド

Mythologia Admiral Ship Bridgeプロジェクトの開発環境セットアップと開発ガイドを提供します。

## ドキュメント一覧

### [setup-guide.md](setup-guide.md)
**全体セットアップガイド**
- **前提条件**: Node.js、npm、Gitの要件
- **ワークスペース構成**: monorepo構造の初期化
- **共有パッケージ**: 型定義・スキーマ・定数の共有設定
- **開発サーバー**: 全サービス同時起動方法
- **トラブルシューティング**: よくある問題と解決方法

### [backend-setup.md](backend-setup.md)  
**Honoバックエンド開発ガイド**
- **Honoフレームワーク**: 軽量・高速・エッジ対応
- **アーキテクチャ**: レイヤードアーキテクチャによる実装
- **API設計**: RESTful API、認証、エラーハンドリング
- **データベース統合**: アダプターパターンによるマルチ環境対応
- **デプロイメント**: Cloudflare Workers / Vercel対応

### [frontend-setup.md](frontend-setup.md)
**Next.js + FSDフロントエンド開発ガイド**
- **Next.js App Router**: 最新のファイルベースルーティング
- **Feature-Sliced Design**: 機能別階層アーキテクチャ
- **状態管理**: TanStack Query + Jotai
- **フォーム管理**: React Hook Form + Zod
- **UIコンポーネント**: TailwindCSS + shadcn/ui
- **パフォーマンス最適化**: 画像・コード分割

## 技術スタック概要

```
システム全体
├── 共有パッケージ: TypeScript + Zod
├── バックエンド: Hono + TypeScript + マルチDB
├── フロントエンド: Next.js 14 + App Router + FSD
├── デプロイ: Vercel / Cloudflare Workers
└── 開発ツール: VS Code + ESLint + Prettier
```

## クイックスタート

### 1. 環境確認
```bash
node --version  # v20.0.0+
npm --version   # v10.0.0+
git --version   # v2.20+
```

### 2. プロジェクトセットアップ
```bash
# リポジトリクローン
git clone https://github.com/your-username/mythologia-admiral-ship-bridge.git
cd mythologia-admiral-ship-bridge

# ワークスペース初期化
npm install

# 全サービス起動
npm run dev
```

### 3. アクセス確認
- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:8787
- **API確認**: http://localhost:8787/health

## 開発フロー

### 1. 機能開発
```bash
# 新機能ブランチ作成
git checkout -b feature/card-search

# 共有パッケージ更新（必要に応じて）
cd webapp/shared
npm run build

# バックエンドAPI実装
cd ../backend
# API実装...

# フロントエンド実装
cd ../frontend  
# コンポーネント実装...

# テスト実行
npm run test

# 型チェック
npm run type-check

# リント
npm run lint
```

### 2. コミット & PR
```bash
# 変更をコミット
git add .
git commit -m "feat: カード検索機能を追加"

# プッシュ & PR作成
git push origin feature/card-search
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

### デバッグツール
- **API開発**: Thunder Client / Postman
- **DB管理**: TablePlus / DBeaver  
- **パフォーマンス**: Chrome DevTools
- **状態管理**: React DevTools + TanStack Query DevTools

## 参考リンク

### 公式ドキュメント
- [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation)
- [Hono Framework](https://hono-ja.pages.dev/docs/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [TanStack Query](https://tanstack.com/query/latest)

### プロジェクト設計ドキュメント
- [技術方針](../docs/development-policy/architecture/technical-decisions.md)
- [ドメイン分離ポリシー](../docs/development-policy/architecture/domain-separation-policy.md)
- [型共有アーキテクチャ](../docs/development-policy/architecture/type-sharing-architecture.md)
- [データベース設計](../docs/system-design/database-design/)

## サポート

質問や問題がある場合は：
1. このガイドのトラブルシューティングセクションを確認
2. プロジェクトのIssueを検索
3. 新しいIssueを作成して質問

---

**重要**: 
- このプロジェクトは**非公式ファンサイト**です
- 公式運営とは関係ありません
- 開発は設計段階が完了し、実装段階に移行予定です