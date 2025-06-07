# デッキドメインモデル

## 概要

神託のメソロギアにおけるデッキの概念とビジネスルールを整理したドメインモデルです。データベース設計やアプリケーション実装の基盤となる知識を体系化しています。

## デッキの概念

### デッキとは
神託のメソロギアにおいて、プレイヤーが戦闘で使用するカードの集合体。以下の特徴を持ちます：

- **固定枚数制**: 30~40枚で構成される
- **戦略的構築**: プレイヤーの戦術に基づいて選択される
- **リーダー依存**: 選択したリーダーに応じて戦略が変わる
- **個人資産**: プレイヤーが所有・管理する

## ドメインルール

### 1. デッキ構築ルール

#### 基本制約
```
- 総枚数: 30~40枚（固定ではなく幅がある）
- 同名カード制限: 最大3枚まで
- リーダー選択: 必須（5種類から1つ）
- カード重複: 同じカードIDは1つのデッキに1回のみ登録
- 種族制限: 旧神種族のカードはデッキに1枚まで
- 重複定義: 同名カードとカードIDの重複は同義
```

#### リーダーシステム
```
1. ドラゴン (ID: 1) - 竜族の力を操る攻撃的戦略
2. アンドロイド (ID: 2) - 機械の論理性を活かした計算戦略  
3. エレメンタル (ID: 3) - 自然の調和を重視したバランス戦略
4. ルミナス (ID: 4) - 光の力による守備的戦略
5. シェイド (ID: 5) - 影の力を使ったトリッキー戦略
```

### 2. デッキの状態管理

#### ライフサイクル
```
作成 → 編集 → 公開/非公開 → 削除 → (復元可能) → 完全削除
```

#### 状態定義
- **アクティブ**: `is_deleted = false` - 通常使用可能
- **論理削除**: `is_deleted = true` - 一時的に削除、復元可能
- **公開設定**: `is_public = true/false` - 他ユーザーへの可視性制御

### 3. デッキの社会的側面

#### 共有とコミュニティ
- **公開デッキ**: 他のプレイヤーが閲覧・参考にできる
- **いいね機能**: デッキの評価システム
- **閲覧数**: デッキの人気度指標
- **タグ付け**: デッキの分類・検索用メタデータ

## ビジネス概念

### デッキアーキタイプ（戦略分類）

#### 1. アグロ（速攻）
```
特徴: 序盤から積極的に攻撃
枚数傾向: 30枚（最小構成で速度重視）
リーダー適性: ドラゴン、シェイド
```

#### 2. コントロール（制圧）
```
特徴: 長期戦で相手を制圧
枚数傾向: 35~40枚（多様な対応カードを含む）
リーダー適性: アンドロイド、ルミナス
```

#### 3. ミッドレンジ（中速）
```
特徴: バランスの取れた中庸戦略
枚数傾向: 32~35枚（標準的な構成）
リーダー適性: エレメンタル、全リーダー対応可能
```

#### 4. コンボ（連携）
```
特徴: 特定カードの組み合わせで勝利
枚数傾向: 30~32枚（キーカードを確実に引くため）
リーダー適性: シェイド、アンドロイド
```

### デッキの価値指標

#### パフォーマンス指標
```
- いいね数: コミュニティでの評価
- 閲覧数: 注目度・参考度
- 複製数: デッキレシピとしての実用性
- コメント数: 議論の活発さ
```

#### 戦略指標
```
- 平均コスト: デッキの速度感
- 平均パワー: デッキの攻撃力
- カードタイプ分布: 戦略バランス
- レアリティ分布: デッキの構築コスト
```

## データモデルとの対応

### デッキエンティティ

```typescript
interface DeckDomain {
  // アイデンティティ
  id: DeckId;                    // デッキの一意識別子
  name: DeckName;                // プレイヤーが付けた名前
  
  // 所有関係
  owner: PlayerId;               // デッキの所有者
  
  // 戦略設計
  leader: LeaderType;            // 選択されたリーダー
  cardComposition: DeckCode;     // カード構成（圧縮形式）
  totalCards: CardCount;        // 総枚数（30-40）
  
  // メタデータ
  description?: string;          // デッキコンセプトの説明
  tags: ArchetypeTag[];         // 戦略分類タグ
  
  // 社会的属性
  visibility: PublicityLevel;    // 公開レベル
  communityMetrics: {
    likes: number;               // いいね数
    views: number;               // 閲覧数
    forks: number;              // 複製数
  };
  
  // ライフサイクル
  status: DeckStatus;           // デッキの状態
  timestamps: {
    created: Date;              // 作成日時
    modified: Date;             // 最終更新日時
    deleted?: Date;             // 削除日時
  };
}
```

### 値オブジェクト

```typescript
// デッキコード（カード構成の圧縮表現）
class DeckCode {
  constructor(private readonly value: string) {
    this.validate();
  }
  
  private validate(): void {
    // フォーマット: "cardId:quantity,cardId:quantity,..."
    const pattern = /^[a-zA-Z0-9\-]+:[1-3](,[a-zA-Z0-9\-]+:[1-3])*$/;
    if (!pattern.test(this.value)) {
      throw new Error('無効なデッキコード形式');
    }
    
    // 重複チェック（同名カードとカードIDの重複は同義）
    const cardIds = this.getCardIds();
    if (new Set(cardIds).size !== cardIds.length) {
      throw new Error('重複したカードが含まれています');
    }
    
    // 枚数チェック
    const totalCards = this.getTotalCardCount();
    if (totalCards < 30 || totalCards > 40) {
      throw new Error('デッキは30-40枚である必要があります');
    }
    
    // 旧神種族制限チェック（実装時にカード詳細情報と照合）
    // Note: ここでは旧神カードの詳細情報が必要なため、
    // 実際のバリデーションはDeckBuildingRulesで行う
  }
  
  getCardIds(): string[] {
    return this.value.split(',').map(entry => entry.split(':')[0]);
  }
  
  getTotalCardCount(): number {
    return this.value.split(',')
      .map(entry => parseInt(entry.split(':')[1]))
      .reduce((sum, quantity) => sum + quantity, 0);
  }
  
  toString(): string {
    return this.value;
  }
}

// リーダータイプ
enum LeaderType {
  DRAGON = 1,
  ANDROID = 2,
  ELEMENTAL = 3,
  LUMINUS = 4,
  SHADE = 5
}

// デッキステータス
enum DeckStatus {
  ACTIVE = 'active',           // アクティブ
  DELETED = 'deleted',         // 論理削除済み
  ARCHIVED = 'archived'        // アーカイブ済み
}

// 公開レベル
enum PublicityLevel {
  PRIVATE = 'private',         // 非公開（本人のみ）
  PUBLIC = 'public',           // 完全公開
  FRIENDS_ONLY = 'friends'     // フレンドのみ（将来拡張）
}
```

## ビジネスルールの実装

### デッキ構築ルール

```typescript
class DeckBuildingRules {
  static validateCardQuantity(cards: DeckCard[]): ValidationResult {
    for (const card of cards) {
      if (card.quantity < 1 || card.quantity > 3) {
        return {
          isValid: false,
          error: `カード「${card.cardId}」の枚数が無効です（${card.quantity}枚）`
        };
      }
    }
    return { isValid: true };
  }
  
  static validateTotalCards(cards: DeckCard[]): ValidationResult {
    const total = cards.reduce((sum, card) => sum + card.quantity, 0);
    if (total < 30 || total > 40) {
      return {
        isValid: false,
        error: `デッキの総枚数が無効です（${total}枚）。30-40枚である必要があります。`
      };
    }
    return { isValid: true };
  }
  
  static validateLeaderSelection(leaderId: number): ValidationResult {
    if (!Object.values(LeaderType).includes(leaderId)) {
      return {
        isValid: false,
        error: `無効なリーダーIDです（${leaderId}）`
      };
    }
    return { isValid: true };
  }
  
  static validateOldGodRestriction(cards: DeckCard[], cardDetails: Card[]): ValidationResult {
    // 旧神種族のカードをチェック
    const oldGodCards = cards.filter(deckCard => {
      const cardDetail = cardDetails.find(c => c.id === deckCard.cardId);
      return cardDetail?.tribeId === 9; // 旧神種族のID
    });
    
    // 旧神カードの総枚数チェック
    const totalOldGodCards = oldGodCards.reduce((sum, card) => sum + card.quantity, 0);
    if (totalOldGodCards > 1) {
      return {
        isValid: false,
        error: `旧神種族のカードはデッキに1枚までしか採用できません（現在${totalOldGodCards}枚）`
      };
    }
    
    return { isValid: true };
  }
  
  static validateCardDuplication(cards: DeckCard[]): ValidationResult {
    // カードIDの重複チェック（同名カードとカードIDの重複は同義）
    const cardIds = cards.map(card => card.cardId);
    const duplicates = cardIds.filter((id, index) => cardIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      return {
        isValid: false,
        error: `同じカードが重複して登録されています: ${duplicates.join(', ')}`
      };
    }
    
    return { isValid: true };
  }
}
```

### デッキ分析ロジック

```typescript
class DeckAnalyzer {
  static analyzeArchetype(deck: DeckDomain, cards: Card[]): DeckArchetype {
    const stats = this.calculateStats(deck, cards);
    
    // 平均コストによる分類
    if (stats.avgCost <= 2.5 && deck.totalCards <= 32) {
      return DeckArchetype.AGGRO;
    }
    
    if (stats.avgCost >= 3.5 && deck.totalCards >= 35) {
      return DeckArchetype.CONTROL;
    }
    
    // カードタイプ分布による分析
    const { attacker, blocker, charger } = stats.cardTypes;
    const attackerRatio = attacker / deck.totalCards;
    
    if (attackerRatio >= 0.6) {
      return DeckArchetype.AGGRO;
    }
    
    if (blocker / deck.totalCards >= 0.5) {
      return DeckArchetype.CONTROL;
    }
    
    return DeckArchetype.MIDRANGE;
  }
  
  static calculateSynergyScore(deck: DeckDomain, cards: Card[]): number {
    // リーダーとカードの相性分析
    const leaderCompatibleCards = cards.filter(card => 
      card.leader === deck.leader || card.leader === null
    );
    
    const compatibilityRatio = leaderCompatibleCards.length / cards.length;
    
    // 種族シナジー分析
    const tribeDistribution = this.analyzeTribeDistribution(cards);
    const dominantTribeRatio = Math.max(...Object.values(tribeDistribution)) / cards.length;
    
    // 0-100のスコア
    return Math.round((compatibilityRatio * 0.6 + dominantTribeRatio * 0.4) * 100);
  }
}
```

## ユースケースシナリオ

### 1. デッキ作成フロー
```
1. プレイヤーがリーダーを選択
2. カードプールからカードを選択（最大40枚）
3. 構築ルールの自動チェック
4. デッキ名・説明の入力
5. 公開設定の選択
6. デッキコード生成・保存
```

### 2. デッキ共有フロー
```
1. 作成者がデッキを公開設定
2. デッキがコミュニティに表示
3. 他プレイヤーが閲覧（閲覧数カウント）
4. 気に入ったらいいね（いいね数カウント）
5. デッキをコピーして改造可能
```

### 3. デッキメタ分析フロー
```
1. 公開デッキから統計データ収集
2. リーダー別使用率算出
3. 人気カードランキング生成
4. デッキアーキタイプ分布分析
5. メタゲーム傾向レポート作成
```

## 設計原則

### 1. ドメイン純粋性
- ビジネスルールはドメイン層に集約
- 技術的詳細（DB、UI）からの独立性
- テスタビリティの確保

### 2. 不変性の保持
- デッキコードは一度生成されたら変更不可
- 履歴の追跡可能性
- データ整合性の保証

### 3. 拡張性の考慮
- 新しいリーダーの追加に対応
- 新しいゲームルールへの適応
- 将来的な機能拡張への準備

この知識体系を基に、データベース設計とアプリケーション実装を行うことで、ゲームの本質を正しく表現したシステムを構築できます。