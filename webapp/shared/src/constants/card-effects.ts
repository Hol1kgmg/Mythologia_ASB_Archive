export enum EffectType {
  DAMAGE = 1,       // ダメージ
  HEAL = 2,         // 回復
  BUFF = 3,         // 強化
  DEBUFF = 4,       // 弱体化
  DRAW = 5,         // ドロー
  SEARCH = 6,       // 検索
  SUMMON = 7,       // 召喚
  DESTROY = 8,      // 破壊
  SHIELD = 9,       // シールド
  FIELD = 10,       // フィールド変更
}

export enum TriggerType {
  ON_PLAY = 1,          // プレイ時
  ON_TURN_START = 2,    // ターン開始時
  ON_TURN_END = 3,      // ターン終了時
  ON_DAMAGE = 4,        // ダメージ受信時
  ON_DESTROY = 5,       // 破壊時
  ON_SUMMON = 6,        // 召喚時
  ON_DEATH = 7,         // 死亡時
  PASSIVE = 8,          // 常時効果
}

export enum TargetType {
  SELF = 1,             // 自分
  ENEMY = 2,            // 敵
  ALL = 3,              // 全体
  ALLY = 4,             // 味方
  RANDOM = 5,           // ランダム
  FIELD = 6,            // フィールド
}

export const EFFECT_TYPES = {
  [EffectType.DAMAGE]: {
    id: EffectType.DAMAGE,
    name: 'ダメージ',
    nameEn: 'Damage',
    description: '対象にダメージを与える',
    icon: '💥',
  },
  [EffectType.HEAL]: {
    id: EffectType.HEAL,
    name: '回復',
    nameEn: 'Heal',
    description: '対象を回復する',
    icon: '💚',
  },
  [EffectType.BUFF]: {
    id: EffectType.BUFF,
    name: '強化',
    nameEn: 'Buff',
    description: '対象を強化する',
    icon: '⬆️',
  },
  [EffectType.DEBUFF]: {
    id: EffectType.DEBUFF,
    name: '弱体化',
    nameEn: 'Debuff',
    description: '対象を弱体化する',
    icon: '⬇️',
  },
  [EffectType.DRAW]: {
    id: EffectType.DRAW,
    name: 'ドロー',
    nameEn: 'Draw',
    description: 'カードを引く',
    icon: '🎴',
  },
  [EffectType.SEARCH]: {
    id: EffectType.SEARCH,
    name: '検索',
    nameEn: 'Search',
    description: 'デッキからカードを検索する',
    icon: '🔍',
  },
  [EffectType.SUMMON]: {
    id: EffectType.SUMMON,
    name: '召喚',
    nameEn: 'Summon',
    description: 'カードを召喚する',
    icon: '✨',
  },
  [EffectType.DESTROY]: {
    id: EffectType.DESTROY,
    name: '破壊',
    nameEn: 'Destroy',
    description: '対象を破壊する',
    icon: '💀',
  },
  [EffectType.SHIELD]: {
    id: EffectType.SHIELD,
    name: 'シールド',
    nameEn: 'Shield',
    description: 'ダメージを軽減する',
    icon: '🛡️',
  },
  [EffectType.FIELD]: {
    id: EffectType.FIELD,
    name: 'フィールド効果',
    nameEn: 'Field Effect',
    description: 'フィールドを変更する',
    icon: '🌍',
  },
} as const;

export const TRIGGER_TYPES = {
  [TriggerType.ON_PLAY]: {
    id: TriggerType.ON_PLAY,
    name: 'プレイ時',
    nameEn: 'On Play',
    description: 'カードがプレイされた時に発動',
  },
  [TriggerType.ON_TURN_START]: {
    id: TriggerType.ON_TURN_START,
    name: 'ターン開始時',
    nameEn: 'Turn Start',
    description: 'ターン開始時に発動',
  },
  [TriggerType.ON_TURN_END]: {
    id: TriggerType.ON_TURN_END,
    name: 'ターン終了時',
    nameEn: 'Turn End',
    description: 'ターン終了時に発動',
  },
  [TriggerType.ON_DAMAGE]: {
    id: TriggerType.ON_DAMAGE,
    name: 'ダメージ時',
    nameEn: 'On Damage',
    description: 'ダメージを受けた時に発動',
  },
  [TriggerType.ON_DESTROY]: {
    id: TriggerType.ON_DESTROY,
    name: '破壊時',
    nameEn: 'On Destroy',
    description: '破壊された時に発動',
  },
  [TriggerType.ON_SUMMON]: {
    id: TriggerType.ON_SUMMON,
    name: '召喚時',
    nameEn: 'On Summon',
    description: '召喚された時に発動',
  },
  [TriggerType.ON_DEATH]: {
    id: TriggerType.ON_DEATH,
    name: '死亡時',
    nameEn: 'On Death',
    description: '死亡した時に発動',
  },
  [TriggerType.PASSIVE]: {
    id: TriggerType.PASSIVE,
    name: '常時効果',
    nameEn: 'Passive',
    description: '常に効果が発動している',
  },
} as const;

export const TARGET_TYPES = {
  [TargetType.SELF]: {
    id: TargetType.SELF,
    name: '自分',
    nameEn: 'Self',
    description: '自分を対象とする',
  },
  [TargetType.ENEMY]: {
    id: TargetType.ENEMY,
    name: '敵',
    nameEn: 'Enemy',
    description: '敵を対象とする',
  },
  [TargetType.ALL]: {
    id: TargetType.ALL,
    name: '全体',
    nameEn: 'All',
    description: '全体を対象とする',
  },
  [TargetType.ALLY]: {
    id: TargetType.ALLY,
    name: '味方',
    nameEn: 'Ally',
    description: '味方を対象とする',
  },
  [TargetType.RANDOM]: {
    id: TargetType.RANDOM,
    name: 'ランダム',
    nameEn: 'Random',
    description: 'ランダムに対象を選択',
  },
  [TargetType.FIELD]: {
    id: TargetType.FIELD,
    name: 'フィールド',
    nameEn: 'Field',
    description: 'フィールド全体を対象とする',
  },
} as const;