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
// データベースのrarity_idに対応する数値ID
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
// データベースのcard_type_idに対応する数値ID
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
    description: '古代より存在する強大な竜族'
  },
  {
    name: 'ロボット',
    leaderId: 2,
    description: '高度な技術で作られた機械生命体'
  },
  {
    name: 'エレメンタル',
    leaderId: 3,
    description: '自然の力を宿す精霊たち'
  },
  {
    name: 'アンジェル',
    leaderId: 4,
    description: '天界からの使者'
  },
  {
    name: 'デーモン',
    leaderId: 5,
    description: '闇の力を操る魔族'
  },
  {
    name: 'ビースト',
    description: '野生の力を持つ獣族'
  },
  {
    name: 'ヒューマン',
    description: '様々な技能を持つ人間'
  },
  {
    name: 'アンデッド',
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

// リーダー戦略特性（動的leadersテーブルから取得）
// このデータはleadersテーブルに移行済み
// 実装時はデータベースから動的に取得する
interface LeaderStrategy {
  id: number;
  name: string;
  focus: 'aggro' | 'control' | 'midrange' | 'defense' | 'combo';
  preferredTypes: CardType[];
  preferredTribesNames: string[];
  averageCost: number;
  keyEffects: string[];
}

// サンプルデータ（実際はデータベースから取得）
const SAMPLE_LEADER_STRATEGIES: LeaderStrategy[] = [
  {
    id: 1,
    name: 'ドラゴン',
    focus: 'aggro',
    preferredTypes: [CardType.ATTACKER],
    preferredTribesNames: ['ドラゴン', 'ビースト', 'デーモン'],
    averageCost: 3.2,
    keyEffects: ['damage', 'buff']
  },
  {
    id: 2,
    name: 'アンドロイド',
    focus: 'control',
    preferredTypes: [CardType.BLOCKER, CardType.CHARGER],
    preferredTribesNames: ['ロボット', 'ヒューマン'],
    averageCost: 4.1,
    keyEffects: ['draw', 'search', 'debuff']
  },
  {
    id: 3,
    name: 'エレメンタル',
    focus: 'midrange',
    preferredTypes: [CardType.ATTACKER, CardType.BLOCKER],
    preferredTribesNames: ['エレメンタル', 'ヒューマン', 'ビースト'],
    averageCost: 3.5,
    keyEffects: ['heal', 'buff', 'damage']
  },
  {
    id: 4,
    name: 'ルミナス',
    focus: 'defense',
    preferredTypes: [CardType.BLOCKER],
    preferredTribesNames: ['アンジェル', 'ヒューマン', 'エレメンタル'],
    averageCost: 3.8,
    keyEffects: ['heal', 'shield', 'debuff']
  },
  {
    id: 5,
    name: 'シェイド',
    focus: 'combo',
    preferredTypes: [CardType.CHARGER],
    preferredTribesNames: ['デーモン', 'アンデッド', 'ヒューマン'],
    averageCost: 3.0,
    keyEffects: ['draw', 'search', 'summon']
  }
];
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
// カードの基本的な役割分類（アーキタイプID付き）
enum CardArchetype {
  EARLY_GAME = 1,    // 序盤用カード（コスト1-3）
  MID_GAME = 2,      // 中盤用カード（コスト4-6）  
  LATE_GAME = 3,     // 終盤用カード（コスト7+）
  UTILITY = 4,       // ユーティリティカード
  REMOVAL = 5,       // 除去カード
  ENGINE = 6         // エンジンカード（リソース生成）
}

// アーキタイプ詳細情報
interface ArchetypeInfo {
  id: CardArchetype;
  name: string;
  nameEn: string;
  description: string;
  costRange: [number, number];
  typicalEffects: string[];
  strategicRole: string;
}

const ARCHETYPE_INFO: Record<CardArchetype, ArchetypeInfo> = {
  [CardArchetype.EARLY_GAME]: {
    id: CardArchetype.EARLY_GAME,
    name: '序盤型',
    nameEn: 'Early Game',
    description: 'ゲーム開始直後にプレイされる低コストカード',
    costRange: [1, 3],
    typicalEffects: ['quick_deploy', 'early_pressure', 'board_presence'],
    strategicRole: '盤面形成・初期圧力'
  },
  [CardArchetype.MID_GAME]: {
    id: CardArchetype.MID_GAME,
    name: '中盤型',
    nameEn: 'Mid Game',
    description: 'ゲーム中盤の主力となるバランス型カード',
    costRange: [4, 6],
    typicalEffects: ['value_trade', 'board_control', 'tempo_swing'],
    strategicRole: '盤面コントロール・交換'
  },
  [CardArchetype.LATE_GAME]: {
    id: CardArchetype.LATE_GAME,
    name: '終盤型',
    nameEn: 'Late Game',
    description: 'ゲーム終盤の勝負を決する高コストカード',
    costRange: [7, 10],
    typicalEffects: ['game_ending', 'massive_impact', 'win_condition'],
    strategicRole: 'フィニッシャー・勝利条件'
  },
  [CardArchetype.UTILITY]: {
    id: CardArchetype.UTILITY,
    name: 'ユーティリティ',
    nameEn: 'Utility',
    description: '特殊な効果やサポート機能を持つカード',
    costRange: [1, 8],
    typicalEffects: ['card_draw', 'search', 'resource_generation'],
    strategicRole: 'サポート・リソース管理'
  },
  [CardArchetype.REMOVAL]: {
    id: CardArchetype.REMOVAL,
    name: '除去',
    nameEn: 'Removal',
    description: '相手のカードや脇威を除去するカード',
    costRange: [2, 6],
    typicalEffects: ['destroy', 'damage', 'debuff', 'exile'],
    strategicRole: '脇威処理・盤面クリア'
  },
  [CardArchetype.ENGINE]: {
    id: CardArchetype.ENGINE,
    name: 'エンジン',
    nameEn: 'Engine',
    description: '継続的なアドバンテージを生み出すカード',
    costRange: [3, 7],
    typicalEffects: ['recurring_value', 'synergy_enabler', 'combo_piece'],
    strategicRole: 'アドバンテージエンジン・コンボ'
  }
};

// 基本的な判定ロジック
// アーキタイプ判定ロジック
function getCardArchetype(card: Card): CardArchetype {
  // 効果優先判定
  const hasDrawEffect = card.effects.some(e => 
    e.abilities?.some(a => ['draw', 'search', 'resource'].includes(a.type))
  );
  if (hasDrawEffect) return CardArchetype.ENGINE;
  
  const hasDestroyEffect = card.effects.some(e => 
    e.abilities?.some(a => ['destroy', 'damage', 'debuff', 'exile'].includes(a.type))
  );
  if (hasDestroyEffect) return CardArchetype.REMOVAL;
  
  // コストベース判定
  if (card.cost <= 3) return CardArchetype.EARLY_GAME;
  if (card.cost <= 6) return CardArchetype.MID_GAME;
  if (card.cost >= 7) return CardArchetype.LATE_GAME;
  
  return CardArchetype.UTILITY;
}

// アーキタイプ情報取得
function getArchetypeInfo(archetype: CardArchetype): ArchetypeInfo {
  return ARCHETYPE_INFO[archetype];
}

function getArchetypeName(archetype: CardArchetype): string {
  return ARCHETYPE_INFO[archetype].name;
}

function getArchetypeNameEn(archetype: CardArchetype): string {
  return ARCHETYPE_INFO[archetype].nameEn;
}

// enumベースのヘルパー関数（ID付き）
function getRarityName(rarityId: Rarity): string {
  const names: Record<Rarity, string> = {
    [Rarity.BRONZE]: 'ブロンズ',
    [Rarity.SILVER]: 'シルバー',
    [Rarity.GOLD]: 'ゴールド',
    [Rarity.LEGEND]: 'レジェンド'
  };
  return names[rarityId] || '不明';
}

function getCardTypeName(cardTypeId: CardType): string {
  const names: Record<CardType, string> = {
    [CardType.ATTACKER]: 'アタッカー',
    [CardType.BLOCKER]: 'ブロッカー',
    [CardType.CHARGER]: 'チャージャー'
  };
  return names[cardTypeId] || '不明';
}

// 新たに追加：アーキタイプ関連ヘルパー
function getArchetypeById(archetypeId: CardArchetype): ArchetypeInfo {
  return ARCHETYPE_INFO[archetypeId];
}

// 全enumの一覧取得
function getAllRarities(): Array<{id: Rarity, name: string}> {
  return Object.values(Rarity)
    .filter(value => typeof value === 'number')
    .map(id => ({ id: id as Rarity, name: getRarityName(id as Rarity) }));
}

function getAllCardTypes(): Array<{id: CardType, name: string}> {
  return Object.values(CardType)
    .filter(value => typeof value === 'number')
    .map(id => ({ id: id as CardType, name: getCardTypeName(id as CardType) }));
}

function getAllArchetypes(): Array<ArchetypeInfo> {
  return Object.values(ARCHETYPE_INFO);
}

// 動的種族データ取得関数（実際の実装ではデータベースから取得）
async function getTribeById(tribeId: number, tribes: TribeDomain[]): Promise<TribeDomain | null> {
  return tribes.find(tribe => tribe.id === tribeId && tribe.isActive) || null;
}

async function getTribeName(tribeId: number, tribes: TribeDomain[]): Promise<string> {
  const tribe = await getTribeById(tribeId, tribes);
  return tribe?.name || '不明';
}

// 動的リーダーデータ取得関数（実装時はデータベースから取得）
async function getLeaderById(leaderId: number, leaders: LeaderStrategy[]): Promise<LeaderStrategy | null> {
  return leaders.find(leader => leader.id === leaderId) || null;
}

async function getLeaderName(leaderId: number, leaders: LeaderStrategy[]): Promise<string> {
  const leader = await getLeaderById(leaderId, leaders);
  return leader?.name || '不明';
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
  tribes: TribeDomain[],
  leaders: LeaderStrategy[]
): Promise<boolean> {
  const tribe = await getTribeById(tribeId, tribes);
  if (!tribe) return false;
  
  const leaderStrategy = await getLeaderById(leaderId, leaders);
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
  leaderId?: number;             // 専用リーダーID（leaders.id）
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