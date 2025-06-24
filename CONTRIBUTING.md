# Contributing Guide

## 開発参加ガイドライン

このプロジェクトはプライベートリポジトリとして管理されています。

### ブランチ戦略

```
main
├── develop
│   ├── feature/#001_admin-auth
│   ├── feature/#002_card-crud
│   └── feature/#003_deck-builder
└── release/v1.0.0
```

### ブランチ命名規則
- `feature/#000_branch-name` - 新機能開発
- `bugfix/#000_branch-name` - バグ修正
- `hotfix/#000_branch-name` - 緊急修正
- `release/vX.X.X` - リリース準備

#### 命名例
```bash
# Issue #5: 管理者認証システム実装
feature/#005_admin-auth-system

# Issue #12: カード検索バグ修正
bugfix/#012_card-search-fix

# Issue #23: 本番環境のメモリリーク修正
hotfix/#023_memory-leak-fix
```

#### ブランチ作成手順
```bash
# Issue番号を確認してからブランチ作成
git checkout develop
git pull origin develop
git checkout -b feature/#005_admin-auth-system

# 開発環境セットアップ（チーム標準）
docker-compose up -d postgres redis
cd webapp/backend
npm run db:migrate:docker  # 重要: Docker使用
```

### コミットメッセージ規約

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更（動作に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスや補助ツールの変更
- `docs`: ドキュメント更新

#### 例
```
feat(auth): スーパー管理者認証機能を追加

- JWTトークンベースの認証実装
- ロール別アクセス制御の基礎実装
- 管理者アクティビティログの記録

Closes #5
```

### Pull Request ガイドライン

1. **PRテンプレート使用**
2. **Issue番号とブランチ名の対応確認**
   - ブランチ名に対応するIssue番号が含まれている
   - PRのタイトルにIssue番号を記載
   - PR説明にて`Closes #000`形式でIssueリンク

3. **レビュー必須項目**
   - [ ] テストが追加/更新されている
   - [ ] ドキュメントが更新されている
   - [ ] TypeScriptの型エラーがない
   - [ ] ESLintエラーがない
   - [ ] Issue要件を満たしている

4. **PRサイズ**
   - 1つのPRは1つの機能/修正に限定
   - 大きな機能は段階的に分割

#### PRタイトル例
```
feat: 管理者認証システムの実装 (#5 )
fix: カード検索結果の表示バグを修正 (#12 )  
docs: API仕様書の更新 (#18 )
```

### Issue・PR番号の表記ルール

Issue番号やPR番号を参照する際は、**数字の後に必ず半角スペースを設ける**表記を使用してください。

#### ✅ 正しい表記
```markdown
# Issue参照
- issue #53
- Issue #46
- 関連: issue #28

# PR参照  
- PR #54
- (#53 )
- (issue #46 )

# 文中での参照
Issue #53 で実装された秘匿URL機能により...
PR #54 では管理API保護を追加...
```

#### ❌ 間違った表記
```markdown
# スペースなし（NG）
- issue#53
- Issue#46  
- PR#54
- (#53)
- (issue#46)

# 文中での参照（NG）
Issue#53で実装された...
PR#54では...
```

#### 適用範囲
この表記ルールは以下の場所で適用してください：

1. **PRタイトル・説明文**
   ```
   feat: 管理者画面秘匿URL機能の実装 (#53 )
   ```

2. **Issueタイトル・説明文**
   ```
   Issue #46 の認証API基盤を前提として...
   ```

3. **コミットメッセージ**
   ```
   feat: 管理者認証実装 (issue #46)
   ```

4. **ドキュメント内の参照**
   ```markdown
   - Issue #53: 管理者画面秘匿URL機能の実装 - ✅ 完了
   ```

5. **コメント・レビュー**
   ```
   Issue #28 で予定されている認証UI実装時に...
   ```

#### 理由
- **可読性向上**: 数字とカッコの区別が明確
- **一貫性確保**: プロジェクト全体で統一された表記
- **自動リンク**: GitHubの自動リンク機能との互換性
- **検索性**: 文書内検索時の精度向上

### コードスタイル

#### TypeScript
```typescript
// インターフェースは大文字始まり
interface UserData {
  id: string;
  name: string;
}

// 関数は明確な型定義
function processUser(user: UserData): Promise<void> {
  // 実装
}

// エラーハンドリングは明示的に
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed:', error);
  throw new AppError('USER_PROCESS_FAILED', error);
}
```

### セキュリティガイドライン

1. **秘密情報の取り扱い**
   - 環境変数は`.env.example`に例を記載
   - 実際の値は絶対にコミットしない
   - APIキーやトークンはコードに直接記載しない

2. **依存関係**
   - 定期的な`npm audit`実行
   - 不要な依存関係は削除
   - 本番環境用とdev用を明確に分離

3. **データ検証**
   - すべての入力はZodでバリデーション
   - SQLインジェクション対策必須
   - XSS対策必須

### テスト方針

```typescript
// ユニットテストの例
describe('AdminService', () => {
  describe('createAdmin', () => {
    it('should create admin with hashed password', async () => {
      // Arrange
      const adminData = { ... };
      
      // Act
      const result = await adminService.createAdmin(adminData);
      
      // Assert
      expect(result.password_hash).not.toBe(adminData.password);
    });
  });
});
```

### ドキュメント更新

変更時に更新が必要なドキュメント：
- [ ] API仕様（変更がある場合）
- [ ] README.md（セットアップ手順変更時）
- [ ] CLAUDE.md（AI開発支援設定変更時）
- [ ] 関連する設計ドキュメント

### Issue 管理

#### Issue テンプレート
```markdown
## 概要
[問題/機能の簡潔な説明]

## 期待される動作
[どうあるべきか]

## 現在の動作
[現状の問題]

## 再現手順
1. 
2. 
3. 

## 環境
- OS: 
- Node.js: 
- Database: 
```

#### ラベル
- `priority:high` - 優先度高
- `priority:medium` - 優先度中
- `priority:low` - 優先度低
- `type:bug` - バグ
- `type:feature` - 新機能
- `type:enhancement` - 改善
- `status:in-progress` - 作業中
- `status:review` - レビュー中

#### Issue番号の管理
- Issue番号は3桁ゼロパディング（#001, #002, ...）
- ブランチ作成前にIssue作成を推奨
- 1つのIssueに対して1つのブランチ
- Issue CloseはPRマージ時に自動実行
- **表記は必ず半角スペース付き**: issue #53、Issue #46、(#53 )

### 開発環境セットアップ

#### 初期セットアップ（チーム標準）

1. **リポジトリのクローン**
   ```bash
   git clone [private-repo-url]
   cd Mythologia_AdmiralsShipBridge
   ```

2. **Docker環境起動**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **依存関係インストール**
   ```bash
   cd webapp/backend && npm install
   cd ../frontend && npm install
   ```

4. **環境変数設定**
   ```bash
   cd webapp/backend
   cp .env.example .env.local
   # .env.localを編集
   ```

5. **データベース初期化（Docker経由）**
   ```bash
   npm run db:migrate:docker
   npm run db:seed:docker  # シードデータ投入
   ```

6. **開発サーバー起動**
   ```bash
   npm run dev  # バックエンド
   # 別ターミナルで
   cd webapp/frontend && npm run dev  # フロントエンド
   ```

#### 開発前の動作確認

**必須確認項目:**

```bash
# 1. Docker環境確認
docker-compose ps  # 全サービスが "Up" であること

# 2. DB接続確認
cd webapp/backend
npm run db:test:docker

# 3. テーブル確認
docker exec mythologia-postgres psql -U mythologia_user -d mythologia_dev -c "\dt"

# 4. API動作確認（サーバー起動後）
curl http://localhost:8787/health

# 5. 管理UI確認
open http://localhost:8080  # Adminer
```

### Docker環境の詳細

#### 環境の使い分け

1. **データベースのみ（推奨開発方法）**
   ```bash
   # PostgreSQL + Redis + 管理ツールのみ起動
   docker-compose up -d postgres redis
   
   # 各アプリは個別に起動
   cd webapp/backend && npm run dev    # バックエンド開発サーバー
   cd webapp/frontend && npm run dev   # フロントエンド開発サーバー
   ```

2. **フルスタック統合環境**
   ```bash
   # 全サービスを一括起動（新規参加者向け）
   docker-compose -f docker-compose.full.yml up -d
   ```

3. **個別Docker実行（本番環境テスト用）**
   ```bash
   # バックエンド（Railway環境テスト）
   cd webapp/backend
   docker build -t mythologia-backend .
   docker run -p 8787:8787 mythologia-backend
   ```

#### 管理UIアクセス

- **Adminer (PostgreSQL管理)**: http://localhost:8080
  - Server: `postgres`
  - Username: `mythologia_user`
  - Password: `mythologia_pass`
  - Database: `mythologia_dev`

- **RedisInsight (Redis管理)**: http://localhost:8001
  - Host: `localhost`
  - Port: `6379`
  - Password: `mythologia_redis_pass`

### トラブルシューティング

#### よくある問題と解決方法

1. **"Cannot connect to database"エラー**
   ```bash
   # Dockerサービス確認
   docker-compose ps
   # postgresがUpでない場合、再起動
   docker-compose restart postgres
   ```

2. **"relation already exists"エラー**
   ```bash
   # マイグレーション履歴確認
   docker exec mythologia-postgres psql -U mythologia_user -d mythologia_dev -c "SELECT * FROM drizzle.__drizzle_migrations;"
   # 必要に応じて手動でマーク
   ```

3. **"password authentication failed"エラー**
   ```bash
   # .env.localファイル確認
   cat webapp/backend/.env.local
   # DATABASE_URLが正しいことを確認
   ```

4. **Dockerコンテナが起動しない**
   ```bash
   # ログ確認
   docker-compose logs postgres
   # ボリューム初期化（データ削除注意）
   docker-compose down -v
   docker-compose up -d
   ```

5. **マイグレーションが適用されない**
   ```bash
   # 直接確認
   docker exec -it mythologia-postgres psql -U mythologia_user -d mythologia_dev
   # \dt でテーブル一覧確認
   # \d admins でテーブル構造確認
   ```

#### データベース操作コマンド集

```bash
# PostgreSQL直接アクセス
docker exec -it mythologia-postgres psql -U mythologia_user -d mythologia_dev

# 基本的なPSQLコマンド
\dt                    # テーブル一覧
\d table_name          # テーブル構造
\du                    # ユーザー一覧
\l                     # データベース一覧
\q                     # 終了

# Redis直接アクセス
docker exec -it mythologia-redis redis-cli -a mythologia_redis_pass

# 基本的なRedisコマンド
keys *                 # 全キー表示
get key_name          # 値取得
del key_name          # キー削除
flushall              # 全データ削除（注意！）
exit                  # 終了
```

#### Docker環境メンテナンス

```bash
# サービス停止
docker-compose down

# データ削除（初期化）
docker-compose down -v

# ログ確認
docker-compose logs -f postgres redis

# コンテナ再構築
docker-compose build --no-cache
```

### レビュープロセス

1. **セルフレビュー**: PR作成前に自己チェック
2. **自動テスト**: CI/CDでの自動テスト通過
3. **コードレビュー**: 最低1名のレビュー必須
4. **マージ**: レビュー承認後、作成者がマージ

### リリースプロセス

1. `develop`から`release/vX.X.X`ブランチ作成
2. バージョン番号更新
3. CHANGELOG.md更新
4. テスト実施
5. `main`へマージ
6. タグ作成
7. `develop`へマージバック