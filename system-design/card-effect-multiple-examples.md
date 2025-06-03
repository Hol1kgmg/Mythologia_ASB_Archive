# 複数効果を持つカードの例

カードが複数の独立した効果を持つ場合のJSON構造例です。

## 基本効果 + 条件効果

```json
{
  "effects": [
    {
      "description": "相手に2ダメージを与える",
      "abilities": [
        {
          "type": "damage",
          "value": 2
        }
      ],
      "targets": [
        {
          "type": "enemy"
        }
      ]
    },
    {
      "description": "自分の手札が3枚以下なら、カードを1枚引く",
      "abilities": [
        {
          "type": "draw",
          "value": 1,
          "condition": "player.handCount <= 3"
        }
      ]
    }
  ]
}
```

## 選択式効果

```json
{
  "effects": [
    {
      "description": "以下から1つを選ぶ：",
      "selectionMode": "choose_one"
    },
    {
      "description": "・相手に3ダメージを与える",
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
    },
    {
      "description": "・味方を2回復する",
      "abilities": [
        {
          "type": "heal",
          "value": 2
        }
      ],
      "targets": [
        {
          "type": "ally"
        }
      ]
    }
  ]
}
```

## 段階的効果

```json
{
  "effects": [
    {
      "description": "カードを1枚引く",
      "abilities": [
        {
          "type": "draw",
          "value": 1
        }
      ]
    },
    {
      "description": "引いたカードがドラゴンなら、追加で1枚引く",
      "triggers": [
        {
          "type": "afterDraw",
          "condition": "drawnCard.leader == 'DRAGON'"
        }
      ],
      "abilities": [
        {
          "type": "draw",
          "value": 1
        }
      ]
    }
  ]
}
```

## 異なるタイミングの効果

```json
{
  "effects": [
    {
      "description": "プレイ時：相手に1ダメージを与える",
      "triggers": [
        {
          "type": "onPlay"
        }
      ],
      "abilities": [
        {
          "type": "damage",
          "value": 1
        }
      ],
      "targets": [
        {
          "type": "enemy"
        }
      ]
    },
    {
      "description": "ターン終了時：自分のライフを1回復する",
      "triggers": [
        {
          "type": "onTurnEnd"
        }
      ],
      "abilities": [
        {
          "type": "heal",
          "value": 1
        }
      ],
      "targets": [
        {
          "type": "player"
        }
      ]
    }
  ]
}
```

## リーダー別効果

```json
{
  "effects": [
    {
      "description": "基本効果：カードを1枚引く",
      "abilities": [
        {
          "type": "draw",
          "value": 1
        }
      ]
    },
    {
      "description": "ドラゴンリーダー：追加で相手に2ダメージ",
      "abilities": [
        {
          "type": "damage",
          "value": 2,
          "condition": "self.leader == 'DRAGON'"
        }
      ],
      "targets": [
        {
          "type": "enemy"
        }
      ]
    },
    {
      "description": "エレメンタルリーダー：追加で味方を2回復",
      "abilities": [
        {
          "type": "heal",
          "value": 2,
          "condition": "self.leader == 'ELEMENTAL'"
        }
      ],
      "targets": [
        {
          "type": "ally"
        }
      ]
    }
  ]
}
```

## 連鎖効果

```json
{
  "effects": [
    {
      "description": "全ての敵に1ダメージを与える",
      "abilities": [
        {
          "type": "damage",
          "value": 1
        }
      ],
      "targets": [
        {
          "type": "enemy",
          "filter": "all"
        }
      ]
    },
    {
      "description": "ダメージを与えた敵1体につき、カードを1枚引く",
      "triggers": [
        {
          "type": "afterDamage"
        }
      ],
      "abilities": [
        {
          "type": "draw",
          "value": "damagedCount"
        }
      ]
    }
  ]
}
```