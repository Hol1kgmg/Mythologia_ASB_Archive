# デッキシステム設計

## 概要

神託のメソロギアのデッキ構築・管理システムの設計ドキュメントです。

## デッキ基本仕様

### デッキ構成ルール
- **固定枚数**: 30~40枚（必須）
- **同名カード制限**: 最大3枚まで（推定）
- **リーダー選択**: 5種類のリーダーから1つを選択

### リーダーシステム
1. **ドラゴン (Dragon)** - 竜族
2. **アンドロイド (Android)** - 機械生命体
3. **エレメンタル (Elemental)** - 自然の力を操る種族
4. **ルミナス (Luminus)** - 光の種族
5. **シェイド (Shade)** - 影や闇の力を使う種族

## デッキコードフォーマット

### JSON構造
```json
{
  "leaderId": 1,              // リーダーID (1-5)
  "name": "デッキ名",
  "description": "デッキ説明",
  "cards": [
    {
      "cardId": "card-001",
      "quantity": 3
    },
    {
      "cardId": "card-002", 
      "quantity": 2
    }
  ],
  "keyCardId": "card-001",    // キーカードID（オプション）
  "tags": ["速攻", "ドラゴン"],
  "version": "1.0"
}
```

### 圧縮フォーマット（共有用）
URLやQRコードでの共有を想定した圧縮フォーマット

```
構造: [リーダーID][カードデータ][チェックサム]
例: 1-C001x3,C002x2,C003x3...-ABC123
```

## データモデル拡張

### Deckモデル拡張
```typescript
interface Deck {
  id: string;
  userId: string;
  leaderId: number;           // リーダーID (1-5)
  name: string;
  description?: string;
  cards: DeckCard[];
  keyCardId?: string;         // キーカードID
  isValid: boolean;           // 30枚チェック
  isPublic: boolean;
  tags: string[];
  version: string;            // デッキフォーマットバージョン
  stats?: DeckStatistics;     // 統計情報
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  views: number;
}

interface DeckStatistics {
  totalCards: number;         // 合計枚数（必ず30）
  uniqueCards: number;        // ユニークカード数
  averageCost: number;
  averagePower: number;
  costCurve: Record<number, number>;
  powerDistribution: Record<number, number>;
  cardTypeDistribution: {
    attacker: number;
    blocker: number;
    charger: number;
  };
  rarityDistribution: {
    legend: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  leaderCardCount: number;    // リーダーに対応するカード数
  tribeDistribution: Record<string, number>;
}
```

## デッキ検証ルール

### バリデーション
```typescript
interface DeckValidation {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  type: 'CARD_COUNT' | 'DUPLICATE_LIMIT' | 'INVALID_CARD' | 'MISSING_LEADER';
  message: string;
  details?: any;
}

// 検証ルール
const validateDeck = (deck: Deck): DeckValidation => {
  const errors: ValidationError[] = [];
  
  // 1. 30枚チェック
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
  if (totalCards !== 30) {
    errors.push({
      type: 'CARD_COUNT',
      message: `デッキは30枚である必要があります（現在: ${totalCards}枚）`,
      details: { current: totalCards, required: 30 }
    });
  }
  
  // 2. 同名カード3枚制限
  deck.cards.forEach(deckCard => {
    if (deckCard.quantity > 3) {
      errors.push({
        type: 'DUPLICATE_LIMIT',
        message: `同名カードは3枚までです`,
        details: { cardId: deckCard.cardId, quantity: deckCard.quantity }
      });
    }
  });
  
  // 3. リーダー検証
  if (!deck.leaderId || deck.leaderId < 1 || deck.leaderId > 5) {
    errors.push({
      type: 'MISSING_LEADER',
      message: 'リーダーを選択してください'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## デッキ分析機能

### デッキタイプ分類
```typescript
enum DeckArchetype {
  AGGRO = 'AGGRO',           // 速攻型
  CONTROL = 'CONTROL',       // コントロール型
  MIDRANGE = 'MIDRANGE',     // ミッドレンジ型
  COMBO = 'COMBO',           // コンボ型
  TRIBAL = 'TRIBAL'          // 種族統一型
}

interface DeckAnalysis {
  archetype: DeckArchetype;
  strengthScore: number;      // デッキ強度スコア（0-100）
  synergyScore: number;      // シナジースコア（0-100）
  consistency: number;       // 安定性スコア（0-100）
  weaknesses: string[];      // 弱点
  suggestions: string[];     // 改善提案
}
```

## デッキ共有システム

### 共有URL生成
```typescript
interface DeckShareData {
  deckId?: string;           // 既存デッキのID
  deckCode: string;          // エンコードされたデッキデータ
  format: 'full' | 'compact';
}

// デッキコードエンコード
const encodeDeck = (deck: Deck): string => {
  // Base64エンコードまたは独自圧縮アルゴリズム
  const data = {
    l: deck.leaderId,
    c: deck.cards.map(c => `${c.cardId}:${c.quantity}`).join(','),
    n: deck.name
  };
  return btoa(JSON.stringify(data));
};

// デッキコードデコード
const decodeDeck = (code: string): Partial<Deck> => {
  try {
    const data = JSON.parse(atob(code));
    return {
      leaderId: data.l,
      name: data.n,
      cards: data.c.split(',').map(c => {
        const [cardId, quantity] = c.split(':');
        return { cardId, quantity: parseInt(quantity) };
      })
    };
  } catch (error) {
    throw new Error('無効なデッキコード');
  }
};
```

## デッキインポート/エクスポート

### エクスポート形式
1. **JSON形式**: 完全なデッキ情報
2. **CSV形式**: 表計算ソフト用
3. **テキスト形式**: 人間が読みやすい形式
4. **QRコード**: モバイル共有用

### インポート処理
```typescript
interface ImportResult {
  success: boolean;
  deck?: Deck;
  errors?: string[];
}

const importDeck = async (data: string, format: string): Promise<ImportResult> => {
  switch (format) {
    case 'json':
      return importFromJSON(data);
    case 'code':
      return importFromCode(data);
    case 'text':
      return importFromText(data);
    default:
      return { success: false, errors: ['サポートされていない形式'] };
  }
};
```

## デッキメタ分析

### 人気デッキランキング
```typescript
interface DeckMetaStats {
  deckId: string;
  usage: number;             // 使用率
  winRate: number;           // 勝率（将来実装）
  popularity: number;        // 人気度スコア
  lastUpdated: Date;
}

interface MetaSnapshot {
  date: Date;
  topDecks: DeckMetaStats[];
  leaderDistribution: Record<number, number>;
  archetypeDistribution: Record<DeckArchetype, number>;
}
```

## API設計拡張

### デッキ関連エンドポイント

#### デッキ検証
```
POST /api/decks/validate
```
Request:
```json
{
  "leaderId": 1,
  "cards": [
    { "cardId": "card-001", "quantity": 3 }
  ]
}
```

#### デッキ分析
```
GET /api/decks/:id/analysis
```
Response:
```json
{
  "archetype": "AGGRO",
  "strengthScore": 85,
  "synergyScore": 72,
  "consistency": 90,
  "weaknesses": ["高コストカードへの対処が困難"],
  "suggestions": ["除去カードの追加を検討"]
}
```

#### デッキコード生成
```
POST /api/decks/:id/share
```
Response:
```json
{
  "code": "encoded-deck-string",
  "url": "https://app.mythologia.com/deck/encoded-deck-string",
  "qrCode": "data:image/png;base64,..."
}
```

#### デッキインポート
```
POST /api/decks/import
```
Request:
```json
{
  "format": "code",
  "data": "encoded-deck-string"
}
```

## セキュリティ考慮事項

1. **デッキコード検証**: 不正なコードのインポート防止
2. **レート制限**: デッキ作成・インポートの頻度制限
3. **権限チェック**: プライベートデッキへのアクセス制御
4. **データサニタイゼーション**: XSS対策

## パフォーマンス最適化

1. **デッキ統計のキャッシング**: Redis等でキャッシュ
2. **人気デッキのプリロード**: 頻繁にアクセスされるデッキ
3. **バッチ処理**: メタ分析の定期実行
4. **インデックス最適化**: leaderId, isPublicでの検索