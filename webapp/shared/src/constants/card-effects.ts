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
  BP_INCREASE = 11, // BP増加
}

export enum TriggerType {
  ON_SUMMON = 1,        // 召喚時
  ON_ATTACK_SUCCESS = 2, // 攻撃成功時
  ON_DEFENSE_SUCCESS = 3, // 防御成功時
  HAND_ACTIVATE = 4,     // 手札発動
  FIELD_ACTIVATE = 5,    // 戦場発動
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
  [EffectType.BP_INCREASE]: {
    id: EffectType.BP_INCREASE,
    name: 'BP増加',
    nameEn: 'BP Increase',
    description: 'BPを増加させる',
    icon: '⚡',
  },
} as const;

export const TRIGGER_TYPES = {
  [TriggerType.ON_SUMMON]: {
    id: TriggerType.ON_SUMMON,
    name: '召喚時',
    nameEn: 'On Summon',
    description: 'カードが召喚された時に発動する効果',
    icon: '✨',
    color: '#3B88F2',        // ブルー
  },
  [TriggerType.ON_ATTACK_SUCCESS]: {
    id: TriggerType.ON_ATTACK_SUCCESS,
    name: '攻撃成功時',
    nameEn: 'On Attack Success',
    description: '攻撃が成功した時に発動する効果',
    icon: '⚔️',
    color: '#D72E21',        // レッド
  },
  [TriggerType.ON_DEFENSE_SUCCESS]: {
    id: TriggerType.ON_DEFENSE_SUCCESS,
    name: '防御成功時',
    nameEn: 'On Defense Success',
    description: '防御が成功した時に発動する効果',
    icon: '🛡️',
    color: '#535351',        // グレー
  },
  [TriggerType.HAND_ACTIVATE]: {
    id: TriggerType.HAND_ACTIVATE,
    name: '手札発動',
    nameEn: 'Hand Activate',
    description: '手札から発動できる効果',
    icon: '🎴',
    color: '#CD9814',        // 黄色
  },
  [TriggerType.FIELD_ACTIVATE]: {
    id: TriggerType.FIELD_ACTIVATE,
    name: '戦場発動',
    nameEn: 'Field Activate',
    description: '戦場にいる時に発動できる効果',
    icon: '🌍',
    color: '#662FA3',        // パープル
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