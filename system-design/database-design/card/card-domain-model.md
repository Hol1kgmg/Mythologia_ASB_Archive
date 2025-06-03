# カードドメインモデル

## 概要

神託のメソロギアにおけるカードの概念とビジネスルールを整理したドメインモデルです。カードシステムの設計・実装の基盤となる知識を体系化しています。

## カードの概念

### カードとは
神託のメソロギアにおいて、プレイヤーが戦闘で使用する基本単位。以下の特徴を持ちます：

- **ユニークな効果**: 各カードは固有の効果・能力を持つ
- **戦略的価値**: コスト・パワー・効果のバランスで戦略が決まる
- **リーダーとの相性**: 特定のリーダーとの組み合わせで真価を発揮
- **収集要素**: レアリティによる希少性とコレクション性

## ドメインルール

### 1. カード基本属性ルール

#### カード番号体系
```
フォーマット: [セット番号][カード番号]
例: 
- 10015: 基本セット(1) + カード番号(0015)
- 20032: 拡張1(2) + カード番号(0032)
- 80012: 特別セット(8) + カード番号(0012)
```

#### レアリティシステム
```typescript
enum Rarity {
  BRONZE = 1,     // 基本カード - 最も入手しやすい
  SILVER = 2,     // 強化カード - 中程度の希少性
  GOLD = 3,       // 希少カード - 高い希少性
  LEGEND = 4      // 伝説カード - 最高の希少性
}

// レアリティ別期待値
interface RarityExpectation {
  [Rarity.BRONZE]: {
    powerRange: [1, 8],     // パワー範囲
    costRange: [1, 5],      // コスト範囲
    dropRate: 60            // 排出率（%）
  },
  [Rarity.SILVER]: {
    powerRange: [3, 12],
    costRange: [2, 7],
    dropRate: 25
  },
  [Rarity.GOLD]: {
    powerRange: [5, 15],
    costRange: [3, 8],
    dropRate: 12
  },
  [Rarity.LEGEND]: {
    powerRange: [8, 20],
    costRange: [4, 10],
    dropRate: 3
  }
}
```

#### カードタイプシステム
```typescript
enum CardType {
  ATTACKER = 1,   // 攻撃特化 - 高パワー、攻撃的効果
  BLOCKER = 2,    // 防御特化 - 防御効果、味方保護
  CHARGER = 3     // 機動特化 - 特殊効果、戦術的役割
}

// タイプ別特性
interface TypeCharacteristics {
  [CardType.ATTACKER]: {
    averagePower: 8,        // 平均パワーが高い
    commonEffects: ["damage", "buff", "destroy"],
    role: "主力アタッカー"
  },
  [CardType.BLOCKER]: {
    averagePower: 5,        // パワーは控えめ
    commonEffects: ["heal", "debuff", "shield"],
    role: "サポート・防御"
  },
  [CardType.CHARGER]: {
    averagePower: 6,        // バランス型
    commonEffects: ["draw", "search", "summon"],
    role: "戦術・ユーティリティ"
  }
}
```

#### 種族システム
```typescript
// 種族はデータベーステーブルで管理（動的データ）
interface TribeDomain {
  id: number;                    // 種族ID
  name: string;                  // 種族名
  leaderId?: number;             // リーダーID（1-5）
  thematic?: string;             // テーマ特性
  description?: string;          // 種族説明
  isActive: boolean;             // アクティブフラグ
  createdAt: Date;               // 作成日時
  updatedAt: Date;               // 更新日時
  MasterCardId?: string;         // マスターカードID
}

// 初期データとして想定される種族（データベースに保存）
const INITIAL_TRIBES: Omit<TribeDomain, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'ドラゴン',
    leaderId: 1,
    thematic: '力と威厳',
    description: '古代より存在する強大な竜族'
  },
  {
    name: 'ロボット',
    leaderId: 2,
    thematic: '論理と効率',
    description: '高度な技術で作られた機械生命体'
  },
  {
    name: 'エレメンタル',
    leaderId: 3,
    thematic: '自然の調和',
    description: '自然の力を宿す精霊たち'
  },
  {
    name: 'アンジェル',
    leaderId: 4,
    thematic: '神聖な力',
    description: '天界からの使者'
  },
  {
    name: 'デーモン',
    leaderId: 5,
    thematic: '闇の誘惑',
    description: '闇の力を操る魔族'
  },
  {
    name: 'ビースト',
    thematic: '野生の本能',
    description: '野生の力を持つ獣族'
  },
  {
    name: 'ヒューマン',
    thematic: '多様性と適応',
    description: '様々な技能を持つ人間'
  },
  {
    name: 'アンデッド',
    thematic: '死を超越',
    description: '死を超越した不死の存在'
  }
];
```

#### カードセットシステム
```typescript
interface CardSet {
  id: string;               // セットID（UUID）
  name: string;             // セット名
  code: string;             // セットコード
  releaseDate: Date;        // リリース日
  cardCount: number;        // 収録カード数
  description?: string;     // セット説明
}

// 標準的なカードセット
const STANDARD_CARD_SETS = {
  CORE: {
    code: "CORE",
    name: "基本セット",
    theme: "ゲームの基礎となるバランス取れたカード群",
    targetCardCount: 200,
    rarityDistribution: {
      [Rarity.BRONZE]: 120,   // 60%
      [Rarity.SILVER]: 50,    // 25%
      [Rarity.GOLD]: 24,      // 12%
      [Rarity.LEGEND]: 6      // 3%
    }
  },
  EXPANSION: {
    code: "EXP1",
    name: "拡張パック第1弾", 
    theme: "新戦略と特殊効果の追加",
    targetCardCount: 100,
    rarityDistribution: {
      [Rarity.BRONZE]: 50,    // 50%
      [Rarity.SILVER]: 30,    // 30%
      [Rarity.GOLD]: 15,      // 15%
      [Rarity.LEGEND]: 5      // 5%
    }
  },
  SPECIAL: {
    code: "SPECIAL",
    name: "特別版",
    theme: "限定カードと特別イラスト",
    targetCardCount: 50,
    rarityDistribution: {
      [Rarity.BRONZE]: 15,    // 30%
      [Rarity.SILVER]: 15,    // 30%
      [Rarity.GOLD]: 15,      // 30%
      [Rarity.LEGEND]: 5      // 10%
    }
  }
};
```

### 2. リーダーとの相性システム

#### リーダー適性
```typescript
interface LeaderAffinity {
  leaderId?: number;        // 専用リーダー（null = 汎用）
  synergyBonus: number;     // 相性ボーナス
  restrictions?: string[];  // 制限事項
}

// リーダー別戦略特性（種族IDは動的に参照）
const LEADER_STRATEGIES = {
  [Leader.DRAGON]: {
    focus: "aggro",           // 速攻重視
    preferredTypes: [CardType.ATTACKER],
    preferredTribesNames: ['ドラゴン', 'ビースト', 'デーモン'], // 種族名で指定
    averageCost: 3.2,
    keyEffects: ["damage", "buff"]
  },
  [Leader.ANDROID]: {
    focus: "control",         // 制圧重視
    preferredTypes: [CardType.BLOCKER, CardType.CHARGER],
    preferredTribesNames: ['ロボット', 'ヒューマン'],
    averageCost: 4.1,
    keyEffects: ["draw", "search", "debuff"]
  },
  [Leader.ELEMENTAL]: {
    focus: "midrange",        // バランス重視
    preferredTypes: [CardType.ATTACKER, CardType.BLOCKER],
    preferredTribesNames: ['エレメンタル', 'ヒューマン', 'ビースト'],
    averageCost: 3.5,
    keyEffects: ["heal", "buff", "damage"]
  },
  [Leader.LUMINUS]: {
    focus: "defense",         // 守備重視
    preferredTypes: [CardType.BLOCKER],
    preferredTribesNames: ['アンジェル', 'ヒューマン', 'エレメンタル'],
    averageCost: 3.8,
    keyEffects: ["heal", "shield", "debuff"]
  },
  [Leader.SHADE]: {
    focus: "combo",           // 連携重視
    preferredTypes: [CardType.CHARGER],
    preferredTribesNames: ['デーモン', 'アンデッド', 'ヒューマン'],
    averageCost: 3.0,
    keyEffects: ["draw", "search", "summon"]
  }
};
```

### 3. 効果システムルール

#### 効果の分類
```typescript
interface EffectClassification {
  // 即座効果（プレイ時に発動）
  immediate: {
    examples: ["damage", "heal", "draw", "search"],
    timing: "onPlay",
    persistent: false
  },
  
  // 継続効果（場にいる間継続）
  persistent: {
    examples: ["buff", "aura", "shield"],
    timing: "passive",
    persistent: true
  },
  
  // トリガー効果（条件で発動）
  triggered: {
    examples: ["onDeath", "onTurnStart", "onAttack"],
    timing: "conditional",
    persistent: true
  }
}
```

#### 効果強度バランス
```typescript
interface EffectPowerLevel {
  cost: number;             // 効果のコスト換算値
  power: number;            // 効果のパワー換算値
  complexity: number;       // 効果の複雑さ（1-5）
  rarity: Rarity;          // 効果の希少性
}

// 効果バランス例
const EFFECT_BALANCE = {
  "damage_3": {
    cost: 2,               // 3ダメージ = コスト2相当
    power: 3,              // パワー3相当
    complexity: 1,         // シンプル
    rarity: Rarity.BRONZE
  },
  "draw_2": {
    cost: 3,               // ドロー2 = コスト3相当
    power: 0,              // パワーなし
    complexity: 2,         // 中程度
    rarity: Rarity.SILVER
  },
  "destroy_enemy": {
    cost: 5,               // 破壊効果 = コスト5相当
    power: 0,              // パワーなし
    complexity: 4,         // 複雑
    rarity: Rarity.GOLD
  }
};
```

## ビジネス概念

### カードの基本分類

#### アーキタイプ分類
```typescript
// カードの基本的な役割分類
enum CardArchetype {
  EARLY_GAME = "EARLY_GAME",    // 序盤用カード（コスト1-3）
  MID_GAME = "MID_GAME",        // 中盤用カード（コスト4-6）  
  LATE_GAME = "LATE_GAME",      // 終盤用カード（コスト7+）
  UTILITY = "UTILITY",          // ユーティリティカード
  REMOVAL = "REMOVAL",          // 除去カード
  ENGINE = "ENGINE"             // エンジンカード（リソース生成）
}

// 基本的な判定ロジック
function getCardArchetype(card: Card): CardArchetype {
  if (card.cost <= 3) return CardArchetype.EARLY_GAME;
  if (card.cost <= 6) return CardArchetype.MID_GAME;
  if (card.cost >= 7) return CardArchetype.LATE_GAME;
  
  // 効果による特殊分類
  const hasDrawEffect = card.effects.some(e => 
    e.abilities?.some(a => a.type === 'draw')
  );
  if (hasDrawEffect) return CardArchetype.ENGINE;
  
  const hasDestroyEffect = card.effects.some(e => 
    e.abilities?.some(a => a.type === 'destroy')
  );
  if (hasDestroyEffect) return CardArchetype.REMOVAL;
  
  return CardArchetype.UTILITY;
}

// レアリティ・カードタイプのヘルパー関数
function getRarityName(rarityId: number): string {
  const names = {
    1: 'ブロンズ',
    2: 'シルバー', 
    3: 'ゴールド',
    4: 'レジェンド'
  };
  return names[rarityId] || '不明';
}

function getCardTypeName(cardTypeId: number): string {
  const names = {
    1: 'アタッカー',
    2: 'ブロッカー',
    3: 'チャージャー'
  };
  return names[cardTypeId] || '不明';
}

// 動的種族データ取得関数（実際の実装ではデータベースから取得）
async function getTribeById(tribeId: number, tribes: TribeDomain[]): Promise<TribeDomain | null> {
  return tribes.find(tribe => tribe.id === tribeId && tribe.isActive) || null;
}

async function getTribeName(tribeId: number, tribes: TribeDomain[]): Promise<string> {
  const tribe = await getTribeById(tribeId, tribes);
  return tribe?.name || '不明';
}

function getLeaderName(leaderId: number): string {
  const names = {
    1: 'ドラゴン',
    2: 'アンドロイド',
    3: 'エレメンタル', 
    4: 'ルミナス',
    5: 'シェイド'
  };
  return names[leaderId] || '不明';
}

// 種族シナジー判定（動的種族データ対応）
async function getTribeSynergy(
  cards: CardDomain[], 
  tribes: TribeDomain[]
): Promise<TribeSynergyEffect[]> {
  const tribeCount = new Map<number, number>();
  
  // 種族別カウント
  cards.forEach(card => {
    if (card.tribeId) {
      tribeCount.set(card.tribeId, (tribeCount.get(card.tribeId) || 0) + 1);
    }
  });
  
  const activeSynergies: TribeSynergyEffect[] = [];
  
  // シナジー効果チェック（データベースから取得した種族データを使用）
  for (const [tribeId, count] of tribeCount.entries()) {
    const tribe = await getTribeById(tribeId, tribes);
    if (tribe && count >= tribe.synergyThreshold) {
      activeSynergies.push({
        tribeId,
        tribeName: tribe.name,
        bonusType: tribe.synergyType,
        effect: tribe.synergyEffect,
        cardCount: count,
        threshold: tribe.synergyThreshold
      });
    }
  }
  
  return activeSynergies;
}

interface TribeSynergyEffect {
  tribeId: number;
  tribeName: string;
  bonusType: string;
  effect: string;
  cardCount: number;
  threshold: number;
}

// 種族・リーダー相性チェック（動的データ対応）
async function checkTribeLeaderAffinity(
  tribeId: number, 
  leaderId: number,
  tribes: TribeDomain[]
): Promise<boolean> {
  const tribe = await getTribeById(tribeId, tribes);
  if (!tribe) return false;
  
  const leaderStrategy = LEADER_STRATEGIES[leaderId];
  if (!leaderStrategy) return false;
  
  return leaderStrategy.preferredTribesNames.includes(tribe.name);
}
```

## データモデルとの対応

### カードエンティティ
```typescript
interface CardDomain {
  // 基本アイデンティティ
  id: CardId;                    // カードの一意識別子
  number: CardNumber;            // カード番号（ゲーム内ID）
  name: CardName;                // カード名
  
  // 戦略属性
  leaderId?: LeaderType;         // 専用リーダーID
  tribeId?: Tribe;               // 種族ID
  typeId: CardType;              // カードタイプID
  rarityId: Rarity;              // レアリティID
  
  // 戦闘属性
  cost: Cost;                    // コスト
  power: Power;                  // パワー
  effects: CardEffect[];         // 効果リスト
  
  // メタ情報
  cardSetId: string;             // 所属カードセットID
  artist?: ArtistName;           // イラストレーター
  flavorText?: string;           // フレーバーテキスト
  
  // システム属性
  isActive: boolean;             // アクティブ状態
  imageUrl: string;              // 画像URL
  translations: Translation[];   // 多言語対応
  
  // ライフサイクル
  releaseDate: Date;             // リリース日
  createdAt: Date;               // 作成日時
  updatedAt: Date;               // 更新日時
}
```

### 値オブジェクト
```typescript
// カード番号（ゲーム内での識別子）
class CardNumber {
  constructor(private readonly value: string) {
    this.validate();
  }
  
  private validate(): void {
    // フォーマット: 数字5桁（例: "10015"）
    if (!/^\d{5}$/.test(this.value)) {
      throw new Error('カード番号は5桁の数字である必要があります');
    }
  }
  
  getSetNumber(): number {
    return parseInt(this.value.charAt(0));
  }
  
  getCardNumber(): number {
    return parseInt(this.value.substring(1));
  }
  
  toString(): string {
    return this.value;
  }
}

// コスト（ゲーム内での使用コスト）
class Cost {
  constructor(private readonly value: number) {
    this.validate();
  }
  
  private validate(): void {
    if (this.value < 0 || this.value > 10) {
      throw new Error('コストは0-10の範囲である必要があります');
    }
  }
  
  getValue(): number {
    return this.value;
  }
  
  isFree(): boolean {
    return this.value === 0;
  }
  
  isExpensive(): boolean {
    return this.value >= 7;
  }
}

// パワー（戦闘力）
class Power {
  constructor(private readonly value: number) {
    this.validate();
  }
  
  private validate(): void {
    if (this.value < 0 || this.value > 20) {
      throw new Error('パワーは0-20の範囲である必要があります');
    }
  }
  
  getValue(): number {
    return this.value;
  }
  
  isWeak(): boolean {
    return this.value <= 3;
  }
  
  isStrong(): boolean {
    return this.value >= 10;
  }
}
```

## ビジネスルールの実装

### 基本バリデーション
```typescript
class CardValidationRules {
  static validateBasicRules(card: CardDomain): ValidationResult {
    const errors: string[] = [];
    
    // 基本制約チェック
    if (!Number.isInteger(card.cost) || card.cost < 0) {
      errors.push('コストは0以上の自然数である必要があります');
    }
    
    if (!Number.isInteger(card.power) || card.power < 0) {
      errors.push('パワーは0以上の自然数である必要があります');
    }
    
    // カード番号フォーマット
    if (!/^\d{5}$/.test(card.number.toString())) {
      errors.push('カード番号は5桁の数字である必要があります');
    }
    
    // 必須フィールド
    if (!card.name || card.name.length === 0) {
      errors.push('カード名は必須です');
    }
    
    if (!card.rarity) {
      errors.push('レアリティは必須です');
    }
    
    if (!card.type) {
      errors.push('カードタイプは必須です');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateCardSet(cards: CardDomain[]): ValidationResult {
    const errors: string[] = [];
    
    // カード番号の重複チェック
    const numbers = cards.map(card => card.number.toString());
    const duplicates = numbers.filter((num, index) => numbers.indexOf(num) !== index);
    if (duplicates.length > 0) {
      errors.push(`重複したカード番号: ${duplicates.join(', ')}`);
    }
    
    // カード名の重複チェック
    const names = cards.map(card => card.name);
    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicateNames.length > 0) {
      errors.push(`重複したカード名: ${duplicateNames.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## 設計原則

### 1. ドメイン純粋性
- カードのビジネスルールはドメイン層に集約
- 技術的詳細（DB、UI）からの独立性
- ゲームバランスの一貫性保証

### 2. 拡張性の確保
- 新しいカードタイプの追加に対応
- 新しい効果システムへの適応
- 将来的なルール変更への準備

### 3. バランス維持
- カードパワーレベルの一貫性
- コスト・効果・レアリティの適切な関係
- メタゲームの健全性

この知識体系を基に、データベース設計とアプリケーション実装を行うことで、ゲームバランスと拡張性を両立したカードシステムを構築できます。