# 開発ポリシー

神託のメソロギア非公式Webアプリケーション開発における方針・原則を定めたドキュメントを管理します。

## ディレクトリ構成

```
development-policy/
├── README.md              # このファイル
├── core/                  # コア開発方針
│   ├── README.md
│   ├── development-principles.md    # 開発の基本原則
│   ├── quality-standards.md        # 品質基準とテスト方針
│   └── security-guidelines.md      # セキュリティガイドライン
├── architecture/          # アーキテクチャ・技術方針
│   ├── README.md
│   ├── technical-decisions.md      # 技術選定と全体設計
│   └── domain-separation-policy.md # ドメイン分離とレイヤー責務
├── frontend/              # フロントエンド方針
│   ├── README.md
│   ├── frontend-architecture.md    # FSD + App Router アーキテクチャ
│   └── naming-conventions.md       # BCDデザインパターン命名規則
└── operations/            # 運用・インフラ方針
    ├── README.md
    └── operation-policy.md         # 運用方針とプロセス
```

## 概要

### 🎯 目的
- **一貫性**: チーム全体で統一された開発アプローチ
- **品質保証**: 高品質なコードベースの維持
- **効率性**: 明確な方針による意思決定の迅速化
- **持続可能性**: 長期的なプロジェクト運営の実現

### 📋 ポリシーカテゴリ

#### 1. [コア開発方針](core/)
プロジェクト全体に関わる基本的な開発原則とガイドライン
- 開発の基本原則（ユーザーファースト、非公式責任、持続可能性）
- 品質基準とテスト方針（カバレッジ、パフォーマンス指標）
- セキュリティガイドライン（認証、データ保護、監査）

#### 2. [フロントエンド方針](frontend/)
Next.js + React を使用したクライアントサイド開発方針
- Feature-Sliced Design + App Router アーキテクチャ
- BCDデザインパターンに基づく命名規則
- 状態管理戦略（useState, Zustand, TanStack Query）

#### 3. [アーキテクチャ・技術方針](architecture/)
システム全体の設計と技術選定に関する横断的方針
- 技術選定と全体設計（フロントエンド・バックエンド・インフラ）
- ドメイン分離とレイヤー責務（責務分離、型定義戦略）
- プラットフォーム非依存設計（PostgreSQL/D1両対応）

#### 4. [運用・インフラ方針](operations/)
デプロイメント、監視、保守に関する運用方針
- デプロイメント戦略とリリース管理
- 監視・アラート、バックアップ・リカバリ
- パフォーマンス最適化とコスト管理

## 🚀 開始ガイド

### 新規参加者向け
1. **[core/development-principles.md](core/development-principles.md)** - プロジェクトの価値観を理解
2. **担当領域のREADME** - フロントエンド/バックエンド/運用の方針を確認
3. **[core/quality-standards.md](core/quality-standards.md)** - 品質基準を把握

### 技術決定時
1. **該当領域のポリシー** を確認
2. **[core/security-guidelines.md](core/security-guidelines.md)** でセキュリティ要件をチェック
3. **技術選定基準** に従って評価・決定

## 📈 技術スタック概要

### フロントエンド
- **Next.js 14.x** (App Router) + **TypeScript 5.x**
- **Feature-Sliced Design** アーキテクチャ
- **TailwindCSS** + **shadcn/ui**
- **Jotai** + **TanStack Query**

### アーキテクチャ
- **レイヤードアーキテクチャ** + **ドメイン分離**
- **TypeScript 5.x** + **Hono 3.x** (バックエンド)
- **PostgreSQL** (Railway) + **Redis** (Railway)
- **Zod** バリデーション + **JWT** 認証
- **アダプターパターン** による環境抽象化

### 運用
- **Railway** (バックエンド) / **Vercel** (フロントエンド) デプロイメント
- **Blue-Green** デプロイメント
- **セマンティックバージョニング**
- **監視・アラート** システム

## 🔄 更新履歴

| 日付 | バージョン | 内容 |
|------|-----------|------|
| 2025-06-XX | 1.0.0 | 初版作成・ディレクトリ構造整理 |

## 📞 連絡先

- ポリシーに関する質問・提案: プロジェクトIssueにて
- セキュリティ関連: プライベート連絡
- 技術的な議論: 開発チャンネルにて

---

これらのポリシーは、プロジェクトの成長とともに進化します。定期的な見直しと改善により、より良い開発環境を構築していきます。