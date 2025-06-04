# 運用方針

## デプロイメント方針

### 1. 環境構成

```
開発フロー:
Local → Development → Staging → Production

環境の役割:
├── Local: 個人開発環境
├── Development: 結合テスト環境
├── Staging: 本番相当環境
└── Production: 本番環境
```

### 2. デプロイプロセス

#### 自動デプロイ（CI/CD）
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - develop  # → Development環境
      - main     # → Staging環境
  release:
    types: [published]  # → Production環境

jobs:
  deploy:
    steps:
      - name: Checkout
      - name: Install dependencies
      - name: Run tests
      - name: Build
      - name: Deploy
```

#### デプロイチェックリスト
- [ ] すべてのテストがパス
- [ ] セキュリティスキャン完了
- [ ] データベースマイグレーション確認
- [ ] 環境変数の設定確認
- [ ] ロールバック手順の準備
- [ ] 監視アラートの設定

### 3. Blue-Green デプロイメント

```
現行環境（Blue）稼働中
    ↓
新環境（Green）を並行構築
    ↓
動作確認・ヘルスチェック
    ↓
トラフィック切り替え
    ↓
問題があればBlueに戻す
```

## リリース管理

### 1. バージョニング（セマンティックバージョニング）

```
MAJOR.MINOR.PATCH

MAJOR: 後方互換性のない変更
MINOR: 後方互換性のある機能追加
PATCH: 後方互換性のあるバグ修正

例:
1.0.0 → 1.0.1 (バグ修正)
1.0.1 → 1.1.0 (新機能追加)
1.1.0 → 2.0.0 (破壊的変更)
```

### 2. リリースサイクル

```
定期リリース:
├── メジャー: 年1-2回
├── マイナー: 月1-2回
└── パッチ: 随時（緊急修正）

リリース前準備:
├── 2週間前: 機能フリーズ
├── 1週間前: コードフリーズ
├── 3日前: 最終テスト
└── 1日前: リリースノート作成
```

### 3. リリースノート

```markdown
# v1.2.0 リリースノート

## 新機能
- デッキ共有機能を追加 (#123)
- カード検索の高速化 (#124)

## 改善
- UIレスポンスの向上 (#125)
- エラーメッセージの改善 (#126)

## バグ修正
- デッキ保存時のエラーを修正 (#127)
- 画像読み込みエラーを修正 (#128)

## 既知の問題
- 特定条件下でのメモリリーク (#129)

## アップグレード手順
1. データベースマイグレーション実行
2. 環境変数 `NEW_FEATURE_FLAG` を追加
3. キャッシュクリア
```

## 監視・アラート

### 1. 監視項目

#### アプリケーション監視
```typescript
// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      disk: await checkDiskSpace(),
      memory: process.memoryUsage()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

#### メトリクス収集
```
システムメトリクス:
├── CPU使用率: < 70%
├── メモリ使用率: < 80%
├── ディスク使用率: < 80%
└── ネットワーク遅延: < 100ms

アプリケーションメトリクス:
├── レスポンスタイム: p95 < 200ms
├── エラー率: < 1%
├── リクエスト数: 監視のみ
└── 同時接続数: < 1000
```

### 2. アラート設定

```yaml
alerts:
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    notify: 
      - pagerduty
      - slack-critical

  - name: SlowResponse
    condition: response_time_p95 > 500ms
    duration: 10m
    severity: warning
    notify:
      - slack-alerts

  - name: DiskSpaceLow
    condition: disk_usage > 90%
    duration: 5m
    severity: critical
    notify:
      - pagerduty
      - email-oncall
```

### 3. ログ管理

```typescript
// 構造化ログ
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      hostname: bindings.hostname,
      node_version: process.version
    })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // 本番環境では個人情報をマスク
  redact: ['req.headers.authorization', 'user.email']
});

// ログレベル
logger.trace('詳細なデバッグ情報');
logger.debug('デバッグ情報');
logger.info('通常の情報');
logger.warn('警告');
logger.error('エラー');
logger.fatal('致命的エラー');
```

## バックアップ・リカバリ

### 1. バックアップ戦略

```
バックアップスケジュール:
├── データベース
│   ├── フルバックアップ: 毎日 02:00
│   ├── 差分バックアップ: 6時間ごと
│   └── トランザクションログ: リアルタイム
├── アップロードファイル
│   ├── 増分バックアップ: 毎日
│   └── S3クロスリージョンレプリケーション
└── 設定ファイル
    └── Git管理（暗号化）

保持期間:
├── 日次バックアップ: 7日間
├── 週次バックアップ: 4週間
├── 月次バックアップ: 12ヶ月
└── 年次バックアップ: 5年間
```

### 2. リストア手順

```bash
# データベースリストア
## 1. 最新のフルバックアップをリストア
pg_restore -d mythologia_restore backup_20250601_0200.dump

## 2. 差分バックアップを適用
pg_restore -d mythologia_restore diff_20250601_0800.dump

## 3. トランザクションログを適用
pg_restore -d mythologia_restore --recovery-target-time="2025-06-01 12:00:00"

## 4. 整合性チェック
npm run db:check-integrity

## 5. アプリケーション起動
npm run start:production
```

### 3. 災害復旧計画（DRP）

```
RTO (Recovery Time Objective): 4時間
RPO (Recovery Point Objective): 1時間

復旧優先順位:
1. 認証システム
2. カードデータベース
3. デッキ機能
4. コミュニティ機能

復旧手順:
1. インシデント宣言
2. 復旧チーム招集
3. 被害状況評価
4. 復旧作業開始
5. 動作確認
6. サービス再開
7. 事後レポート
```

## メンテナンス

### 1. 定期メンテナンス

```
月次メンテナンス（第1日曜日 02:00-04:00）:
├── セキュリティパッチ適用
├── 依存関係の更新
├── データベース最適化
├── ログローテーション
└── 不要データクリーンアップ

四半期メンテナンス:
├── パフォーマンスチューニング
├── インデックス再構築
├── ストレージ最適化
└── セキュリティ監査
```

### 2. 緊急メンテナンス

```typescript
// メンテナンスモード
export function maintenanceMode(app: Application) {
  app.use((req, res, next) => {
    if (process.env.MAINTENANCE_MODE === 'true') {
      res.status(503).json({
        error: 'MAINTENANCE',
        message: 'システムメンテナンス中です',
        estimatedEndTime: process.env.MAINTENANCE_END_TIME
      });
    } else {
      next();
    }
  });
}
```

## パフォーマンス最適化

### 1. 定期的な最適化

```sql
-- インデックスの再構築
REINDEX INDEX CONCURRENTLY idx_cards_name;

-- テーブルの最適化
VACUUM ANALYZE cards;

-- 統計情報の更新
ANALYZE cards;

-- 不要データの削除
DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

### 2. キャッシュ管理

```typescript
// キャッシュウォーミング
export async function warmCache() {
  // よく使われるデータを事前キャッシュ
  const popularCards = await getPopularCards();
  await Promise.all(
    popularCards.map(card => cache.set(`card:${card.id}`, card))
  );
  
  // キャッシュ統計
  const stats = await cache.getStats();
  logger.info('Cache warmed', { 
    hitRate: stats.hitRate,
    memory: stats.memoryUsage 
  });
}
```

## コスト管理

### 1. リソース最適化

```
コスト削減施策:
├── 自動スケーリングの調整
├── 未使用リソースの削除
├── リザーブドインスタンスの活用
├── CDNの積極活用
└── データ転送の最適化
```

### 2. 予算アラート

```yaml
budgets:
  - name: monthly-infrastructure
    amount: $500
    alerts:
      - threshold: 80%
        notify: finance-team
      - threshold: 90%
        notify: 
          - finance-team
          - tech-lead
      - threshold: 100%
        notify:
          - all-stakeholders
        action: review-and-optimize
```

## SLA（Service Level Agreement）

### 1. 可用性目標

```
月間稼働率: 99.9%（ダウンタイム: 43.2分/月）

計画メンテナンス:
├── 通知: 1週間前
├── 実施: 深夜帯
└── 最大時間: 2時間/月

除外事項:
├── 計画メンテナンス
├── 不可抗力（天災等）
└── 外部サービス障害
```

### 2. パフォーマンス目標

```
レスポンスタイム:
├── API: 95% < 200ms
├── ページロード: 95% < 2秒
└── 検索: 95% < 500ms

エラー率:
├── 5xx エラー: < 0.1%
├── 4xx エラー: < 5%
└── タイムアウト: < 0.01%
```

## まとめ

運用は開発と同じくらい重要です。これらの方針に従い、安定したサービス提供を実現します。定期的な見直しと改善により、より良い運用体制を構築していきます。