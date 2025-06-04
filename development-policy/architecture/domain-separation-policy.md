# ドメイン分離ポリシー

## 概要

フロントエンドとバックエンドの責務を明確に分離し、ドメインロジックをバックエンド側に集約することで、セキュリティとメンテナンス性を向上させます。

## 基本原則

### 1. ドメイン知識の所在
- **バックエンド**: すべてのビジネスルール、検証ロジック、ドメインモデル
- **フロントエンド**: 表示用のDTO（Data Transfer Object）とUI状態のみ

### 2. 型定義の分離
```
backend/
├── domain/          # ドメインモデル（フロントエンドに公開しない）
├── dto/             # データ転送オブジェクト（APIレスポンス）
└── validation/      # バリデーションスキーマ

frontend/
├── types/           # API型定義（DTOのみ）
├── forms/           # フォーム用の型定義
└── ui/              # UI状態の型定義
```

## バックエンド型定義戦略

### 1. ドメインモデル（内部用）
```typescript
// backend/domain/card.domain.ts
export interface CardDomain {
  id: string;
  cardNumber: string;
  name: string;
  leaderId: number | null;
  tribeId: number | null;
  rarityId: number;
  cardTypeId: number;
  cost: number;
  power: number;
  effects: CardEffect[];
  
  // ビジネスロジック
  isValidForDeck(deck: DeckDomain): boolean;
  calculateModifiedPower(context: BattleContext): number;
  canBePlayedBy(player: PlayerDomain): boolean;
}

// backend/domain/deck.domain.ts
export interface DeckDomain {
  id: string;
  userId: string;
  leaderId: number;
  cards: DeckCardDomain[];
  
  // ドメインロジック
  validate(): ValidationResult;
  addCard(card: CardDomain): void;
  removeCard(cardId: string): void;
  calculateStatistics(): DeckStatistics;
}
```

### 2. DTO定義（公開用）
```typescript
// backend/dto/card.dto.ts
export interface CardResponseDto {
  id: string;
  name: string;
  cost: number;
  power: number;
  imageUrl: string;
  // ビジネスロジックは含まない
  // 計算済みの値のみ提供
  isPlayable?: boolean;
  modifiedPower?: number;
}

// backend/dto/deck.dto.ts
export interface DeckResponseDto {
  id: string;
  name: string;
  cardCount: number;
  isValid: boolean;
  validationErrors?: string[];
  // 統計情報は計算済みで提供
  statistics: {
    averageCost: number;
    cardTypeDistribution: Record<string, number>;
  };
}
```

### 3. フォーム入力スキーマ
```typescript
// backend/validation/schemas.ts
import { z } from 'zod';

// フォーム入力の検証スキーマ
export const createDeckSchema = z.object({
  name: z.string().min(1).max(50),
  leaderId: z.number().int().min(1).max(5),
  cardIds: z.array(z.string()).min(30).max(40)
});

// APIエンドポイントでの使用
export async function createDeck(input: unknown) {
  // 1. 入力検証
  const validated = createDeckSchema.parse(input);
  
  // 2. ドメインロジック実行
  const deck = new DeckDomain(validated);
  const validationResult = deck.validate();
  
  if (!validationResult.isValid) {
    throw new DomainError(validationResult.errors);
  }
  
  // 3. 保存
  const saved = await deckRepository.save(deck);
  
  // 4. DTOとして返却
  return toDeckResponseDto(saved);
}
```

## フロントエンド型定義戦略

### 1. API レスポンス型（自動生成推奨）
```typescript
// frontend/types/api/card.types.ts
// バックエンドのDTOから自動生成
export interface CardResponse {
  id: string;
  name: string;
  cost: number;
  power: number;
  imageUrl: string;
  isPlayable?: boolean;
  modifiedPower?: number;
}

// frontend/types/api/deck.types.ts
export interface DeckResponse {
  id: string;
  name: string;
  cardCount: number;
  isValid: boolean;
  validationErrors?: string[];
  statistics: DeckStatistics;
}
```

### 2. フォーム型定義
```typescript
// frontend/types/forms/deck-form.types.ts
export interface DeckFormData {
  name: string;
  leaderId: string;  // フォームは文字列
  selectedCards: string[];  // カードIDの配列
}

// frontend/hooks/useDeckForm.ts
export function useDeckForm() {
  const form = useForm<DeckFormData>({
    defaultValues: {
      name: '',
      leaderId: '',
      selectedCards: []
    }
  });
  
  const onSubmit = async (data: DeckFormData) => {
    // APIに送信する前に型変換
    const payload = {
      name: data.name,
      leaderId: parseInt(data.leaderId),
      cardIds: data.selectedCards
    };
    
    try {
      // バックエンドで完全な検証が行われる
      const response = await api.createDeck(payload);
      // 成功時の処理
    } catch (error) {
      // バックエンドからのエラーを表示
      if (error.type === 'VALIDATION_ERROR') {
        form.setError('root', { message: error.message });
      }
    }
  };
  
  return { form, onSubmit };
}
```

### 3. UI状態の型定義
```typescript
// frontend/types/ui/deck-builder.types.ts
export interface DeckBuilderState {
  // UI固有の状態
  isLoading: boolean;
  selectedTab: 'cards' | 'stats' | 'preview';
  filterOptions: FilterState;
  sortOrder: 'name' | 'cost' | 'power';
  
  // サーバーから取得したデータ（DTO）
  availableCards: CardResponse[];
  currentDeck?: DeckResponse;
  
  // UI用の計算値
  filteredCards: CardResponse[];
  canSaveDeck: boolean;
}
```

## API設計方針

### 1. エンドポイント設計
```typescript
// バックエンドAPI
app.post('/api/decks', async (req, res) => {
  try {
    // 入力検証（Zodスキーマ）
    const input = createDeckSchema.parse(req.body);
    
    // ドメインロジック実行
    const deck = await deckService.create(input);
    
    // DTOとして返却
    res.json({
      success: true,
      data: toDeckResponseDto(deck)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 検証エラーをわかりやすく返す
      res.status(400).json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'デッキの作成に失敗しました',
          details: formatZodErrors(error)
        }
      });
    }
  }
});
```

### 2. エラーレスポンス
```typescript
// backend/dto/error.dto.ts
export interface ErrorResponseDto {
  type: 'VALIDATION_ERROR' | 'BUSINESS_ERROR' | 'SYSTEM_ERROR';
  message: string;  // ユーザー向けメッセージ
  details?: Record<string, string[]>;  // フィールド別エラー
  errorId?: string;  // トラッキング用
}

// 使用例
{
  "type": "VALIDATION_ERROR",
  "message": "デッキの検証に失敗しました",
  "details": {
    "cardCount": ["カード枚数は30-40枚である必要があります"],
    "leader": ["選択したリーダーと一致しないカードが含まれています"]
  }
}
```

## フォーム処理のベストプラクティス

### 1. クライアント側検証（UX向上のみ）
```typescript
// frontend/components/DeckForm.tsx
export function DeckForm() {
  // 基本的なUI検証のみ
  const schema = z.object({
    name: z.string().min(1, 'デッキ名を入力してください'),
    leaderId: z.string().min(1, 'リーダーを選択してください')
  });
  
  // 注: ビジネスルールの検証はしない
  // （カード枚数、レアリティ制限等はバックエンドで）
}
```

### 2. プログレッシブエンハンスメント
```typescript
// frontend/hooks/useProgressiveValidation.ts
export function useProgressiveValidation() {
  const [validationHints, setValidationHints] = useState<ValidationHints>({});
  
  // カード追加時にヒントを表示（強制はしない）
  const onCardAdd = (cardId: string) => {
    if (deck.cards.length >= 40) {
      setValidationHints({
        cardCount: 'デッキの上限は40枚です'
      });
    }
  };
  
  // 最終的な検証はサーバー側
  const onSubmit = async () => {
    const response = await api.validateDeck(deck);
    if (!response.isValid) {
      // サーバーからの正式なエラーを表示
      setErrors(response.errors);
    }
  };
}
```

### 3. オプティミスティックUI
```typescript
// frontend/hooks/useOptimisticDeck.ts
export function useOptimisticDeck() {
  const [optimisticDeck, setOptimisticDeck] = useState<DeckResponse | null>(null);
  
  const addCard = async (cardId: string) => {
    // 1. 楽観的更新（即座にUIを更新）
    setOptimisticDeck(prev => ({
      ...prev,
      cardCount: prev.cardCount + 1
    }));
    
    try {
      // 2. サーバーに送信
      const updated = await api.addCardToDeck(deckId, cardId);
      
      // 3. サーバーレスポンスで上書き
      setOptimisticDeck(updated);
    } catch (error) {
      // 4. エラー時は元に戻す
      setOptimisticDeck(prev => ({
        ...prev,
        cardCount: prev.cardCount - 1
      }));
      
      // エラー表示
      showError(error.message);
    }
  };
}
```

## セキュリティ考慮事項

### 1. 情報の最小化
```typescript
// ❌ 悪い例：内部情報の露出
interface CardResponse {
  internalId: string;
  costFormula: string;  // 計算式
  effectImplementation: string;  // 実装詳細
}

// ✅ 良い例：必要最小限の情報
interface CardResponse {
  id: string;
  name: string;
  cost: number;  // 計算済みの値
  effects: string[];  // 表示用テキストのみ
}
```

### 2. 権限チェックの一元化
```typescript
// backend/services/deck.service.ts
export class DeckService {
  async updateDeck(userId: string, deckId: string, data: UpdateDeckDto) {
    // 権限チェックはバックエンドで必ず実施
    const deck = await this.deckRepo.findById(deckId);
    
    if (deck.userId !== userId) {
      throw new ForbiddenError('このデッキを編集する権限がありません');
    }
    
    // ビジネスロジック実行
    return this.deckRepo.update(deckId, data);
  }
}
```

## 実装チェックリスト

### バックエンド開発時
- [ ] ドメインモデルにすべてのビジネスロジックを実装
- [ ] DTOには計算済みの値のみ含める
- [ ] Zodスキーマで入力検証を定義
- [ ] エラーレスポンスをユーザーフレンドリーに

### フロントエンド開発時
- [ ] ドメインロジックを実装しない
- [ ] サーバーレスポンスを信頼する
- [ ] UI検証は最小限に留める
- [ ] エラーハンドリングを適切に実装

## まとめ

このポリシーにより：
1. **セキュリティ向上**: ビジネスロジックの隠蔽
2. **保守性向上**: 責務の明確な分離
3. **一貫性確保**: 単一の真実の源（バックエンド）
4. **開発効率**: 役割分担の明確化

フロントエンドは「表示」と「ユーザー体験」に集中し、バックエンドは「ビジネスロジック」と「データ整合性」に責任を持ちます。