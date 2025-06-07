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
feat: 管理者認証システムの実装 (#5)
fix: カード検索結果の表示バグを修正 (#12)  
docs: API仕様書の更新 (#18)
```

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

### 開発環境セットアップ

1. **リポジトリのクローン**
   ```bash
   git clone [private-repo-url]
   cd Mythologia_AdmiralsShipBridge
   ```

2. **依存関係インストール**
   ```bash
   npm install
   ```

3. **環境変数設定**
   ```bash
   cp .env.example .env.local
   # .env.localを編集
   ```

4. **データベース初期化**
   ```bash
   npm run db:migrate
   npm run db:seed:super-admin
   ```

5. **開発サーバー起動**
   ```bash
   npm run dev
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