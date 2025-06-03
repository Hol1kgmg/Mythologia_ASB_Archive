# カード効果JSON構造の例

カード効果の具体的なJSON構造の例です。データモデルの詳細は `card-effect-models.md` を参照してください。

## 基本的な攻撃カード

```json
{
  "description": "相手に3ダメージを与える",
  "abilities": [
    {
      "type": "damage",
      "value": 3
    }
  ],
  "targets": [
    {
      "type": "enemy"
    }
  ]
}
```

## 条件付き効果カード

```json
{
  "description": "ドラゴンを場に出した時、カードを2枚引く",
  "triggers": [
    {
      "type": "onPlay",
      "condition": "self.leader == 'DRAGON'"
    }
  ],
  "abilities": [
    {
      "type": "draw",
      "value": 2
    }
  ]
}
```

## 複数効果カード

```json
{
  "description": "全ての味方ユニットに2点回復し、敵ユニット1体に1ダメージを与える",
  "abilities": [
    {
      "type": "heal",
      "value": 2
    },
    {
      "type": "damage",
      "value": 1
    }
  ],
  "targets": [
    {
      "type": "ally",
      "filter": "all"
    },
    {
      "type": "enemy",
      "filter": "single"
    }
  ]
}
```

## トリガー効果カード

```json
{
  "description": "このユニットが破壊された時、相手の手札を1枚ランダムに捨てる",
  "triggers": [
    {
      "type": "onDeath"
    }
  ],
  "abilities": [
    {
      "type": "discard",
      "value": 1
    }
  ],
  "targets": [
    {
      "type": "enemy",
      "filter": "hand"
    }
  ]
}
```

## パラメータ化された効果

```json
{
  "description": "コスト3以下の味方ユニット全てに+2/+2を付与",
  "abilities": [
    {
      "type": "buff"
    }
  ],
  "targets": [
    {
      "type": "ally",
      "filter": "cost<=3"
    }
  ],
  "values": [
    {
      "key": "attack",
      "value": 2
    },
    {
      "key": "health",
      "value": 2
    }
  ]
}
```

## 複雑な条件効果

```json
{
  "description": "手札が4枚の場合、全ての敵に2ダメージ。そうでない場合、カードを1枚引く",
  "abilities": [
    {
      "type": "damage",
      "value": 2,
      "condition": "player.handCount == 4"
    },
    {
      "type": "draw",
      "value": 1,
      "condition": "player.handCount != 4"
    }
  ],
  "targets": [
    {
      "type": "enemy",
      "filter": "all"
    }
  ]
}
```

