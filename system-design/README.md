# システム設計ドキュメント

このディレクトリには、神託のメソロギア Webアプリケーションのシステム設計に関するドキュメントを管理します。

## プロジェクト状況

### 完了済み設計
- **カードシステム**: 動的種族管理とリーダー関連システム
- **デッキシステム**: 最小CRUD設計とデータ圧縮
- **データベース設計**: PostgreSQL/D1両対応のテーブル構造
- **アプリケーション層**: プラットフォーム非依存アーキテクチャ

### 最新更新（Tribeテーブル仕様）
- `leaderId INTEGER NULL` - リーダーとの数値ID関連
- `thematic VARCHAR(100) NULL` - テーマ特性管理
- `MasterCardId VARCHAR(36) NULL` - マスターカード関連
- 動的種族データ対応のヘルパー関数実装済み

## ドキュメント構成

### 基本設計ドキュメント
- `requirements.md` - 機能要件と非機能要件
- `architecture.md` - システムアーキテクチャ
- `data-models.md` - データモデル定義
- `card-effect-models.md` - カード効果データモデル定義
- `card-effect-examples.md` - カード効果のJSON構造例
- `card-effect-multiple-examples.md` - 複数効果を持つカードの例
- `api-design.md` - API設計
- `ui-design.md` - UI/UX設計
- `tech-stack.md` - 技術スタック選定
- `deck-system-design.md` - デッキシステム設計
- `google-auth-design.md` - Google認証設計（ユーザー向け）
- `rbac-design.md` - ロール別アクセス制御設計（管理者向け）

### データベース設計（階層化）
```
database-design/
├── deck/                    # デッキシステム関連設計
│   ├── deck-domain-model.md      # ✅ デッキドメインモデル（ビジネス知識）
│   ├── deck-minimal-crud.md      # ✅ デッキ最小CRUD設計（データ最小化）
│   ├── deck-database-design.md   # ✅ デッキデータベース設計（データベース層）
│   ├── deck-application-layer.md # ✅ デッキアプリケーション層設計
│   └── deck-migration-tools.md   # ✅ デッキ移行・運用ツール
├── card/                    # カードシステム関連設計
│   ├── card-domain-model.md      # ✅ カードドメインモデル（動的種族対応済み）
│   ├── card-database-design.md   # ✅ カードデータベース設計（最新Tribe仕様）
│   └── card-application-layer.md # ✅ カードアプリケーション層設計
├── tables.md               # 📋 全テーブル定義（要更新）
└── relationships.md        # 📋 テーブル間のリレーション（要更新）
```

## 設計原則

### 1. プラットフォーム非依存
- **アダプターパターン**: Vercel（PostgreSQL）とCloudflare（D1）両対応
- **環境抽象化**: データベース固有の実装を隠蔽
- **統一インターフェース**: 同一APIでの操作

### 2. ドメイン駆動設計
- **ビジネスロジック分離**: 技術詳細からの独立
- **動的データ管理**: 種族システムの拡張性確保
- **純粋ドメインモデル**: ゲームルールの一貫性

### 3. データ最小化戦略
- **既存テーブル維持**: データベース構造はそのまま
- **API最適化**: レスポンスでのみデータ圧縮
- **効率的キャッシュ**: 階層的キャッシュ戦略

## 実装済み機能

### カードシステム
- [x] 動的種族管理（TribeDomain）
- [x] リーダーとの数値ID関連
- [x] JSON効果システム
- [x] 多言語対応構造
- [x] バリデーション（Zod）

### デッキシステム  
- [x] デッキコード圧縮
- [x] 最小CRUD操作
- [x] フォーク・コピー機能設計
- [x] ユーザー権限管理

### データベース層
- [x] PostgreSQL/D1両対応
- [x] インデックス最適化
- [x] 外部キー制約
- [x] JSON検索サポート

### アプリケーション層
- [x] サービス層実装
- [x] キャッシュ戦略
- [x] エラーハンドリング
- [x] パフォーマンス最適化

## 次期開発予定

### Phase 1: 実装準備
- [ ] `tables.md`の更新（最新Tribe仕様反映）
- [ ] `relationships.md`の更新（外部キー関係整理）
- [ ] 初期データ投入スクリプト

### Phase 2: API実装
- [ ] カードCRUD API
- [ ] デッキCRUD API  
- [ ] 検索・フィルタリング API
- [ ] 認証・認可システム

### Phase 3: UI実装
- [ ] カード管理画面
- [ ] デッキ構築画面
- [ ] 検索・閲覧機能
- [ ] レスポンシブ対応

## 技術スタック詳細

### コア技術
- **TypeScript** - 型安全性とドキュメント化
- **Hono** - 軽量高速Webフレームワーク
- **Zod** - ランタイムバリデーション

### データ層
- **PostgreSQL** (Vercel) - 本格的なリレーショナルDB
- **D1** (Cloudflare) - エッジ環境でのSQLite
- **KV Store** - 高速キャッシュ

### インフラ
- **Vercel** - メイン環境、PostgreSQL統合
- **Cloudflare Workers** - エッジ環境、D1統合

## 目的

カード情報データベースとデッキ構築をサポートするWebアプリケーションの開発に必要な設計情報を体系的に管理し、一貫性のある高品質なシステムを構築する。

## 参照優先度

新規開発時の参照順序：
1. **card/card-domain-model.md** - ビジネスルール理解
2. **card/card-database-design.md** - データベース構造確認  
3. **card/card-application-layer.md** - 実装パターン参照
4. **deck/deck-minimal-crud.md** - デッキ機能仕様
5. 個別の要件に応じて関連ドキュメント参照