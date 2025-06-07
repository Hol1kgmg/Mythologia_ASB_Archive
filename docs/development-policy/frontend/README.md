# フロントエンド開発方針

## 概要
Next.js + React を使用したフロントエンド開発における設計方針と実装ガイドラインを定義します。

## ドキュメント一覧

### [frontend-architecture.md](frontend-architecture.md)
**アーキテクチャ設計**
- Feature-Sliced Design (FSD) + Next.js App Router
- レイヤー構成と責務分離
- 状態管理戦略（useState, Jotai, TanStack Query）
- ディレクトリ構成とimport規則

### [naming-conventions.md](naming-conventions.md)
**命名規則（BCDデザインパターン）**
- Block-Case-Domain に基づくファイル命名
- コンポーネント、フック、Atomの命名パターン
- 変数・関数・定数の命名規則
- CSS/スタイルとインターフェースの命名

### [state-management-decision.md](state-management-decision.md)
**状態管理ライブラリ選定**
- Zustand vs Jotai の比較検討
- プロジェクト要件への適合性分析
- Jotai採用の決定理由と実装戦略

## 技術スタック

```
フロントエンド技術
├── フレームワーク: Next.js 14.x (App Router)
├── 言語: TypeScript 5.x (strict mode)
├── アーキテクチャ: Feature-Sliced Design
├── スタイリング: TailwindCSS + shadcn/ui
├── 状態管理: Jotai + TanStack Query
└── フォーム: React Hook Form + Zod
```

## 設計原則
1. **責務の分離**: UI表示とビジネスロジックを明確に分離
2. **型安全性**: TypeScriptの恩恵を最大化
3. **再利用性**: コンポーネントの効率的な再利用
4. **パフォーマンス**: ユーザー体験を最優先