# カード効果データモデル

カードの効果に関するデータモデル定義です。

## CardEffect（カード効果）

```typescript
interface CardEffect {
  description: string;           // 効果の説明テキスト
  abilities?: Ability[];         // 個別の能力
  triggers?: Trigger[];          // トリガー条件
  targets?: Target[];            // 対象
  values?: EffectValue[];        // 数値パラメータ
}
```

## Ability（能力）

```typescript
interface Ability {
  type: string;                  // 能力タイプ（例: "damage", "heal", "draw"）
  value?: number;                // 数値
  condition?: string;            // 発動条件
}
```

### 能力タイプ一覧

| タイプ | 説明 | 使用例 |
|--------|------|--------|
| damage | ダメージを与える | `{ type: "damage", value: 3 }` |
| heal | 回復する | `{ type: "heal", value: 2 }` |
| draw | カードを引く | `{ type: "draw", value: 1 }` |
| discard | 手札を捨てる | `{ type: "discard", value: 2 }` |
| buff | 強化する | `{ type: "buff" }` ※valuesで詳細指定 |
| debuff | 弱体化する | `{ type: "debuff" }` ※valuesで詳細指定 |
| destroy | 破壊する | `{ type: "destroy" }` |
| summon | 召喚する | `{ type: "summon" }` |
| search | デッキから検索する | `{ type: "search", value: 1 }` |
| return | 手札に戻す | `{ type: "return" }` |

## Trigger（トリガー）

```typescript
interface Trigger {
  type: string;                  // トリガータイプ（例: "onPlay", "onDeath", "onTurnStart"）
  condition?: string;            // 追加条件
}
```

### トリガータイプ一覧

| タイプ | 説明 | 発動タイミング |
|--------|------|---------------|
| onPlay | プレイ時 | カードをプレイした時 |
| onDeath | 破壊時 | ユニットが破壊された時 |
| onTurnStart | ターン開始時 | 自分のターン開始時 |
| onTurnEnd | ターン終了時 | 自分のターン終了時 |
| onAttack | 攻撃時 | ユニットが攻撃した時 |
| onDamage | ダメージを受けた時 | ダメージを受けた時 |
| onDraw | ドロー時 | カードを引いた時 |
| onHandFull | 手札満タン時 | 手札が4枚になった時 |

## Target（対象）

```typescript
interface Target {
  type: string;                  // 対象タイプ（例: "self", "enemy", "ally", "all"）
  filter?: string;               // フィルター条件（例: "dragon", "cost<=3"）
}
```

### 対象タイプ一覧

| タイプ | 説明 | 選択方法 |
|--------|------|---------|
| self | 自身 | 自動選択 |
| enemy | 敵 | プレイヤーが選択 |
| ally | 味方 | プレイヤーが選択 |
| all | 全体 | 自動（条件に合う全て） |
| player | プレイヤー | 自動（プレイヤー本体） |
| random | ランダム | 自動（ランダム選択） |

### フィルター条件の例

- `"all"`: 全ての対象
- `"single"`: 単体
- `"dragon"`: ドラゴンのみ
- `"cost<=3"`: コスト3以下
- `"damaged"`: ダメージを受けている
- `"hand"`: 手札のカード
- `"field"`: 場のユニット

## EffectValue（効果値）

```typescript
interface EffectValue {
  key: string;                   // パラメータ名
  value: number | string;        // 値
}
```

### 使用可能なパラメータキー

| キー | 説明 | 値の型 |
|------|------|--------|
| attack | 攻撃力 | number |
| health | 体力 | number |
| cost | コスト | number |
| cardType | カードタイプ | string |
| leader | リーダー | string |
| duration | 持続ターン数 | number |

## 条件式（condition）の記述方法

条件式は文字列で記述し、以下の要素を使用できます：

### プレイヤー情報
- `player.handCount`: 手札の枚数
- `player.life`: ライフ
- `player.deckCount`: デッキ残り枚数

### カード情報
- `self.leader`: カードのリーダー
- `self.cost`: カードのコスト
- `self.cardType`: カードタイプ

### 比較演算子
- `==`: 等しい
- `!=`: 等しくない
- `>`, `>=`, `<`, `<=`: 大小比較

### 論理演算子
- `&&`: かつ（AND）
- `||`: または（OR）

### 条件式の例
- `"player.handCount == 4"`: 手札が4枚の時
- `"self.leader == 'DRAGON'"`: 自身がドラゴンリーダーの時
- `"player.life <= 10"`: ライフが10以下の時
- `"player.handCount >= 3 && self.cost <= 2"`: 手札3枚以上かつコスト2以下