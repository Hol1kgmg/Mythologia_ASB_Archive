// リーダー情報はleadersテーブルから動的に取得
export interface LeaderDto {
  id: number;
  name: string;                // 日本語名
  nameEn: string;              // 英語名
  description: string;         // 説明
  color: string;               // テーマカラー（HEX）
  thematic: string;            // テーマ特性
  iconUrl?: string;            // アイコンURL
  focus: 'aggro' | 'control' | 'midrange' | 'defense' | 'combo';
  averageCost: number;         // 推奨平均コスト
  preferredCardTypes: string[]; // 推奨カードタイプ
  keyEffects: string[];        // 主要効果
  sortOrder: number;           // 表示順序
  isActive: boolean;           // アクティブフラグ
}

// レガシー互換性のためのヘルパー定数（実装初期のみ使用）
export const LEADER_IDS = {
  DRAGON: 1,
  ANDROID: 2, 
  ELEMENTAL: 3,
  LUMINUS: 4,
  SHADE: 5,
} as const;