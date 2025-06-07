# Admin API テスト

## 概要

このディレクトリには、管理者API（Admin API）のテストファイルが含まれています。
Vitestを使用してHonoアプリケーションのAPIエンドポイントをテストします。

## テストファイル構成

### テストファイル

- **auth.test.ts** - 管理者認証API のテスト
- **admin.test.ts** - 管理者CRUD API のテスト
- **setup.ts** - テスト共通設定とユーティリティ

### 設定ファイル

- **vitest.config.ts** - Vitestの設定
- **README.md** - このファイル

## テスト対象API

### 認証API (`/api/admin/auth/*`)
- `POST /api/admin/auth/login` - ログイン
- `POST /api/admin/auth/logout` - ログアウト
- `POST /api/admin/auth/refresh` - トークン更新
- `GET /api/admin/auth/profile` - プロフィール取得
- `PUT /api/admin/auth/profile` - プロフィール更新
- `PUT /api/admin/auth/password` - パスワード変更
- `GET /api/admin/auth/sessions` - セッション一覧
- `DELETE /api/admin/auth/sessions/:id` - セッション終了

### 管理者CRUD API (`/api/admin/admins/*`)
- `GET /api/admin/admins` - 管理者一覧取得
- `GET /api/admin/admins/:id` - 管理者詳細取得
- `POST /api/admin/admins` - 管理者作成
- `PUT /api/admin/admins/:id` - 管理者更新
- `DELETE /api/admin/admins/:id` - 管理者削除
- `GET /api/admin/admins/:id/activity` - アクティビティ履歴取得

## テスト実行方法

### 基本的なテスト実行
```bash
# 全テストを実行
npm test

# ウォッチモードでテスト実行
npm run test:watch

# カバレッジ付きでテスト実行
npm run test:coverage

# UIモードでテスト実行
npm run test:ui
```

### 個別テストファイルの実行
```bash
# 認証APIのテストのみ実行
npx vitest run __tests__/auth.test.ts

# 管理者CRUD APIのテストのみ実行
npx vitest run __tests__/admin.test.ts
```

### パターンマッチでのテスト実行
```bash
# 特定のテストケースのみ実行
npx vitest run -t "ログイン"

# 特定のdescribeブロックのみ実行
npx vitest run -t "Admin Auth API"
```

## テストデータ

`setup.ts` に以下のテストデータが定義されています：

### 認証テストデータ
- `TestData.validLogin` - 正常なログイン情報
- `TestData.invalidLogin` - 無効なログイン情報
- `TestData.profileUpdate` - プロフィール更新データ
- `TestData.passwordChange` - パスワード変更データ

### 管理者テストデータ
- `TestData.validAdmin` - 正常な管理者作成データ
- `TestData.invalidAdmin` - 無効な管理者作成データ

## テストユーティリティ

`setup.ts` には以下のヘルパー関数が含まれています：

### `createTestApp()`
テスト用のHonoアプリケーションインスタンスを作成します。
実際のAPIエンドポイントをモック実装でシミュレートします。

### `AssertionHelpers`
- `expectSuccessResponse()` - 成功レスポンスの検証
- `expectErrorResponse()` - エラーレスポンスの検証
- `expectValidAdmin()` - 管理者オブジェクトの構造検証
- `expectValidAuthResult()` - 認証結果の構造検証

## テスト内容

### 正常系テスト
- 各APIエンドポイントの正常な動作確認
- レスポンスデータの形式・型チェック
- ページネーション・フィルタリング機能
- 各種パラメータでの動作確認

### 異常系テスト
- 無効なリクエストデータでのエラーハンドリング
- 存在しないリソースへのアクセス
- 不正なHTTPメソッドの使用
- バリデーションエラーの確認

### セキュリティテスト
- 認証失敗時の適切なエラーレスポンス
- 権限チェック（モック実装での基本確認）
- 入力値検証

## モック実装について

現在のテストは **モック実装** を使用しています：

### モック実装の特徴
- 実際のデータベース接続は行わない
- 固定のテストデータを返却
- 基本的なバリデーションロジックを含む
- HTTPステータスコードは適切に設定

### 実際の実装との違い
- 認証ミドルウェアは未実装
- データベース操作は行わない
- 一部のエラーハンドリングは簡略化

### 今後の拡張
実際のAPI実装が完了次第、以下を追加予定：
- 実際のデータベース接続テスト
- 認証ミドルウェアの統合テスト
- より詳細なエラーハンドリングテスト
- パフォーマンステスト

## カバレッジ

テストカバレッジは以下のコマンドで確認できます：

```bash
npm run test:coverage
```

カバレッジレポートは `coverage/` ディレクトリに生成されます。

## CI/CD統合

このテストは CI/CD パイプラインで自動実行されます：

```yaml
# GitHub Actions例
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

## トラブルシューティング

### よくある問題

1. **モジュール解決エラー**
   ```bash
   # 依存関係を再インストール
   npm install
   ```

2. **型エラー**
   ```bash
   # 型チェックを実行
   npm run type-check
   ```

3. **テスト実行時間が長い**
   ```bash
   # 並列実行数を調整
   npx vitest run --reporter=verbose --threads=false
   ```

### デバッグ方法

```bash
# デバッグモードでテスト実行
npx vitest run --reporter=verbose

# 特定のテストのみデバッグ
npx vitest run -t "特定のテスト名" --reporter=verbose
```

## 貢献方法

新しいテストを追加する場合：

1. 適切なテストファイルに追加（auth.test.ts または admin.test.ts）
2. `setup.ts` にテストデータを追加（必要に応じて）
3. `AssertionHelpers` にヘルパー関数を追加（必要に応じて）
4. テストが正常に実行されることを確認
5. カバレッジが向上していることを確認

## 関連ドキュメント

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Hono公式ドキュメント](https://hono.dev/)
- [管理者API設計ドキュメント](../../../docs/system-design/database-design/account/)