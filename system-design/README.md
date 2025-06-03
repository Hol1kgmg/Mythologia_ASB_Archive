# システム設計ドキュメント

このディレクトリには、神託のメソロギア Webアプリケーションのシステム設計に関するドキュメントを管理します。

## ドキュメント構成

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
- `database-design/` - データベース設計（階層化）
  - `deck/` - デッキシステム関連設計
    - `deck-domain-model.md` - デッキドメインモデル（ビジネス知識）
    - `deck-minimal-crud.md` - デッキ最小CRUD設計（データ最小化）
    - `deck-database-design.md` - デッキデータベース設計（データベース層）
    - `deck-application-layer.md` - デッキアプリケーション層設計
    - `deck-migration-tools.md` - デッキ移行・運用ツール
  - `card/` - カードシステム関連設計
    - `card-domain-model.md` - カードドメインモデル（ビジネス知識）
    - `card-database-design.md` - カードデータベース設計（データベース層）
    - `card-application-layer.md` - カードアプリケーション層設計
  - `tables.md` - 全テーブル定義
  - `relationships.md` - テーブル間のリレーション

## 目的

カード情報データベースとデッキ構築をサポートするWebアプリケーションの開発に必要な設計情報を体系的に管理します。