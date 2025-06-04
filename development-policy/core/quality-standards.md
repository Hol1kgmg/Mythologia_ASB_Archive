# 品質基準

## コード品質基準

### 1. 一般的な品質指標

#### 可読性
- **命名規則**: 意図が明確で一貫性のある命名
- **関数の長さ**: 20行以内を推奨、最大50行
- **ファイルの長さ**: 300行以内を推奨、最大500行
- **複雑度**: サイクロマティック複雑度 10以下

#### 保守性
- **DRY原則**: 重複コードの排除
- **SOLID原則**: 特に単一責任原則の遵守
- **結合度**: 疎結合な設計
- **凝集度**: 高凝集なモジュール

### 2. TypeScript固有の品質基準

```typescript
// tsconfig.json の strict 設定
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 3. コードレビューチェックリスト

#### 機能面
- [ ] 要件を満たしているか
- [ ] エッジケースが考慮されているか
- [ ] エラーハンドリングが適切か
- [ ] パフォーマンスへの影響は許容範囲か

#### 実装面
- [ ] 命名は適切か
- [ ] 型定義は明確か
- [ ] 不要なコメントはないか
- [ ] テストは十分か

#### セキュリティ面
- [ ] 入力値の検証があるか
- [ ] 機密情報の露出はないか
- [ ] SQLインジェクション対策はあるか
- [ ] XSS対策はあるか

## テスト品質基準

### 1. カバレッジ目標

```
全体カバレッジ: 80%以上
├── ステートメント: 80%
├── ブランチ: 75%
├── 関数: 85%
└── 行: 80%

重要モジュール: 90%以上
├── 認証関連: 95%
├── 決済関連: 95%
└── データ検証: 90%
```

### 2. テストの種類と比率

#### ユニットテスト（60%）
```typescript
describe('CardValidator', () => {
  describe('validateDeckSize', () => {
    it('should accept deck with 30-40 cards', () => {
      const deck = createMockDeck(30);
      expect(validateDeckSize(deck)).toBe(true);
    });

    it('should reject deck with less than 30 cards', () => {
      const deck = createMockDeck(29);
      expect(validateDeckSize(deck)).toBe(false);
    });
  });
});
```

#### 統合テスト（30%）
```typescript
describe('Card API', () => {
  it('should create and retrieve a card', async () => {
    // Arrange
    const cardData = createTestCard();
    
    // Act
    const createResponse = await api.post('/cards', cardData);
    const getResponse = await api.get(`/cards/${createResponse.data.id}`);
    
    // Assert
    expect(getResponse.data).toMatchObject(cardData);
  });
});
```

#### E2Eテスト（10%）
```typescript
test('user can build a valid deck', async ({ page }) => {
  // ログイン
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // デッキ作成
  await page.goto('/deck-builder');
  await page.click('[data-testid="create-deck"]');
  
  // カード追加
  for (let i = 0; i < 30; i++) {
    await page.click(`[data-card-id="${i}"]`);
  }
  
  // 保存確認
  await page.click('[data-testid="save-deck"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### 3. テスト作成ガイドライン

#### テストの構造
```typescript
// Arrange-Act-Assert パターン
it('should calculate total cost correctly', () => {
  // Arrange: テストデータの準備
  const cards = [
    { cost: 3, quantity: 2 },
    { cost: 5, quantity: 1 }
  ];
  
  // Act: テスト対象の実行
  const totalCost = calculateTotalCost(cards);
  
  // Assert: 結果の検証
  expect(totalCost).toBe(11);
});
```

#### テストデータ
```typescript
// テストデータファクトリー
export const TestDataFactory = {
  createCard: (overrides?: Partial<Card>): Card => ({
    id: 'test-card-id',
    name: 'Test Card',
    cost: 3,
    power: 3,
    ...overrides
  }),
  
  createDeck: (cardCount: number = 30): Deck => ({
    id: 'test-deck-id',
    name: 'Test Deck',
    cards: Array(cardCount).fill(null).map(() => TestDataFactory.createCard())
  })
};
```

## ドキュメント品質基準

### 1. コードコメント

#### 必要なコメント
```typescript
/**
 * デッキの妥当性を検証する
 * @param deck - 検証対象のデッキ
 * @returns 検証結果とエラーメッセージ
 * @throws {InvalidDeckError} デッキがnullの場合
 */
export function validateDeck(deck: Deck): ValidationResult {
  // ビジネスロジックの説明が必要な場合のみコメント
  // 30-40枚制限は公式ルールに基づく
  if (deck.cards.length < 30 || deck.cards.length > 40) {
    return { valid: false, error: 'デッキは30-40枚である必要があります' };
  }
  
  // 複雑なアルゴリズムの説明
  // レジェンドカードの制限チェック（各1枚まで）
  const legendCounts = countCardsByRarity(deck.cards, 'LEGEND');
  // ...
}
```

#### 不要なコメント
```typescript
// ❌ 悪い例：自明なコメント
// カードを追加する
function addCard(card: Card) {
  // カード配列にカードを追加
  this.cards.push(card);
}

// ✅ 良い例：コメントなしで自明
function addCard(card: Card) {
  this.cards.push(card);
}
```

### 2. API ドキュメント

#### OpenAPI仕様
```yaml
paths:
  /api/cards:
    get:
      summary: カード一覧取得
      description: |
        フィルター条件に基づいてカードの一覧を取得します。
        ページネーション対応。
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        200:
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CardListResponse'
```

### 3. README品質

#### 必須セクション
1. **プロジェクト概要**: 何をするアプリか
2. **セットアップ手順**: 環境構築方法
3. **使用方法**: 基本的な操作方法
4. **貢献方法**: 開発参加の手順
5. **ライセンス**: 利用条件

## パフォーマンス品質基準

### 1. レスポンスタイム目標

```
API エンドポイント:
├── 単純なGET: < 50ms
├── 複雑なクエリ: < 200ms
├── 書き込み操作: < 300ms
└── バッチ処理: < 1000ms

フロントエンド:
├── First Contentful Paint: < 1.5s
├── Time to Interactive: < 3s
├── Largest Contentful Paint: < 2.5s
└── Cumulative Layout Shift: < 0.1
```

### 2. リソース使用量

```
メモリ使用量:
├── Node.js プロセス: < 512MB
├── ブラウザ: < 200MB
└── キャッシュ: < 100MB

データベース:
├── 接続数: < 100
├── クエリ時間: < 100ms (95%)
└── インデックス使用率: > 90%
```

## セキュリティ品質基準

### 1. 脆弱性スキャン

```bash
# 依存関係の脆弱性チェック
npm audit

# 許容される脆弱性レベル
Critical: 0
High: 0
Medium: レビューの上判断
Low: 記録して監視
```

### 2. セキュアコーディング

```typescript
// 入力検証の例
const createCardSchema = z.object({
  name: z.string().min(1).max(100),
  cost: z.number().int().min(0).max(10),
  power: z.number().int().min(0).max(9999),
  effects: z.array(cardEffectSchema).max(5)
});

export async function createCard(data: unknown) {
  // 必ず検証を通す
  const validated = createCardSchema.parse(data);
  
  // SQLインジェクション対策（パラメータ化クエリ）
  const result = await db.query(
    'INSERT INTO cards (name, cost, power) VALUES ($1, $2, $3)',
    [validated.name, validated.cost, validated.power]
  );
  
  return result;
}
```

## 継続的改善

### 1. メトリクス収集

```typescript
// 品質メトリクスの定期測定
export const QualityMetrics = {
  // コード品質
  cyclomaticComplexity: 'npx eslint --format json',
  codeCoverage: 'npm test -- --coverage',
  
  // パフォーマンス
  bundleSize: 'npm run build && npm run analyze',
  lighthouse: 'npx lighthouse http://localhost:3000',
  
  // セキュリティ
  vulnerabilities: 'npm audit --json',
  dependencies: 'npx depcheck'
};
```

### 2. 改善サイクル

```
1. 測定: 現状の品質メトリクスを収集
2. 分析: 基準値との差分を確認
3. 計画: 改善項目の優先順位付け
4. 実行: 改善の実施
5. 検証: 改善効果の確認
```

## まとめ

品質は一度達成すれば終わりではなく、継続的な努力が必要です。これらの基準は最低ラインであり、常により高い品質を目指すべきです。重要なのは、チーム全体で品質意識を共有し、日々の開発で実践することです。