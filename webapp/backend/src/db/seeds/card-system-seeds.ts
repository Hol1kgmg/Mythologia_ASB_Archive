import { db } from '../client.js';
import { cardSets, cardTypes, categories, leaders, rarities, tribes } from '../schema/index.js';

/**
 * カードシステム基盤データのシード投入
 *
 * - レアリティ (1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND)
 * - カードタイプ (1:CHARGER, 2:ATTACKER, 3:BLOCKER)
 * - リーダー (1:DRAGON, 2:ANDROID, 3:ELEMENTAL, 4:LUMINUS, 5:SHADE)
 * - カードセット (第1弾)
 * - カテゴリ (サンプルデータ基準)
 */
export async function seedCardSystem() {
  console.log('🎴 Seeding card system data...');

  // 1. Rarities (レアリティ)
  console.log('  📊 Seeding rarities...');
  await db
    .insert(rarities)
    .values([
      {
        id: 1,
        name: 'ブロンズ',
        nameEn: 'Bronze',
        color: '#CD7F32', // ブロンズ色
        icon: '●',
        maxInDeck: 3,
        dropRate: '0.600', // 60%
        sortOrder: 1,
      },
      {
        id: 2,
        name: 'シルバー',
        nameEn: 'Silver',
        color: '#C0C0C0', // シルバー色
        icon: '◆',
        maxInDeck: 3,
        dropRate: '0.300', // 30%
        sortOrder: 2,
      },
      {
        id: 3,
        name: 'ゴールド',
        nameEn: 'Gold',
        color: '#FFD700', // ゴールド色
        icon: '★',
        maxInDeck: 2,
        dropRate: '0.090', // 9%
        sortOrder: 3,
      },
      {
        id: 4,
        name: 'レジェンド',
        nameEn: 'Legend',
        color: '#DDA0DD', // 薄紫色
        icon: '✦',
        maxInDeck: 1,
        dropRate: '0.010', // 1%
        sortOrder: 4,
      },
    ])
    .onConflictDoNothing();

  // 2. Card Types (カードタイプ)
  console.log('  ⚔️ Seeding card types...');
  await db
    .insert(cardTypes)
    .values([
      {
        id: 1,
        name: 'チャージャー',
        nameEn: 'Charger',
        description: '機動特化型。素早く戦場を駆け回り、機会を狙う',
        icon: '⚡',
        color: '#59E8F1', // 水色
        sortOrder: 1,
      },
      {
        id: 2,
        name: 'アタッカー',
        nameEn: 'Attacker',
        description: '攻撃特化型。高いパワーで敵を圧倒する',
        icon: '⚔️',
        color: '#E70EF4', // ピンク色
        sortOrder: 2,
      },
      {
        id: 3,
        name: 'ブロッカー',
        nameEn: 'Blocker',
        description: '防御特化型。相手の攻撃を防ぎ、守りを固める',
        icon: '🛡️',
        color: '#A9BBCF', // グレー色
        sortOrder: 3,
      },
    ])
    .onConflictDoNothing();

  // 3. Leaders (リーダー)
  console.log('  👑 Seeding leaders...');
  await db
    .insert(leaders)
    .values([
      {
        id: 1,
        name: 'ドラゴン',
        nameEn: 'Dragon',
        subName: '災龍種',
        description:
          '力と戦いを信条とする集団で、正々堂々とした戦いを好み、真の実力を試す場を求める戦士たちである。',
        color: '#A50C0D', // 赤色
        sortOrder: 1,
      },
      {
        id: 2,
        name: 'アンドロイド',
        nameEn: 'Android',
        subName: '機巧種',
        description:
          '先進技術と知識を崇拝する機械生命体で、好奇心旺盛に未知なる科学と宇宙の真理を追究する革新的存在である。',
        color: '#27DEE5', // 水色
        sortOrder: 2,
      },
      {
        id: 3,
        name: 'エレメンタル',
        nameEn: 'Elemental',
        subName: '森羅種',
        description:
          '自然との調和を重んじる精霊や獣の民で、警戒心と優しさを併せ持ち、平和と環境との共存に努める穏やかな住民である。',
        color: '#00A868', // 緑色
        sortOrder: 3,
      },
      {
        id: 4,
        name: 'ルミナス',
        nameEn: 'Luminus',
        subName: '聖導種',
        description:
          'イルノエナを信仰し、秩序と団結を重んじる者たち。光と規律を尊び、神聖なる力を信じる者が多いが、その解釈は多岐にわたる。',
        color: '#EED554', // 黄色
        sortOrder: 4,
      },
      {
        id: 5,
        name: 'シェード',
        nameEn: 'Shade',
        subName: '幽幻種',
        description:
          '霊と魂を信仰しており、流浪の性質を持ちながら死と生の狭間にある生きる神秘的な存在として人々を魅了する。',
        color: '#482D6C', // 深紫色
        sortOrder: 5,
      },
    ])
    .onConflictDoNothing();

  // 4. Tribes (種族)
  console.log('  🐉 Seeding tribes...');
  await db
    .insert(tribes)
    .values([
      {
        id: 1,
        name: 'ドラゴン',
        leaderId: 1, // ドラゴンリーダー
        description: 'ドラゴン種族',
      },
      {
        id: 2,
        name: 'アンドロイド',
        leaderId: 2, // アンドロイドリーダー
        description: 'アンドロイド種族',
      },
      {
        id: 3,
        name: 'エレメンタル',
        leaderId: 3, // エレメンタルリーダー
        description: 'エレメンタル種族',
      },
      {
        id: 4,
        name: 'ルミナス',
        leaderId: 4, // ルミナスリーダー
        description: 'ルミナス種族',
      },
      {
        id: 5,
        name: 'シェイド',
        leaderId: 5, // シェイドリーダー
        description: 'シェイド種族',
      },
      // ID 6, 7 は将来の拡張用として予約
      {
        id: 8,
        name: 'イノセント',
        description: 'イノセント種族',
      },
      {
        id: 9,
        name: '旧神',
        description: '旧神種族',
      },
    ])
    .onConflictDoNothing();

  // 5. Card Sets (カードセット)
  console.log('  📦 Seeding card sets...');
  await db
    .insert(cardSets)
    .values([
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Awakening The Oracle - 神託者の覚醒 -',
        code: 'MTG001',
        releaseDate: '2025-06-29',
        cardCount: 187,
        description: '神託のメソロギア第1弾カードセット。全187種のカードで構成される基本セット。',
      },
    ])
    .onConflictDoNothing();

  // 6. Categories (カテゴリ)
  console.log('  🏷️ Seeding categories...');
  await db
    .insert(categories)
    .values([
      // DRAGON種族のカテゴリ (tribe_id = 1)
      {
        id: 1,
        tribeId: 1, // DRAGON
        name: '聖焔龍',
        nameEn: 'Holy Flame Dragon',
        description: '聖なる炎を操る龍族',
      },
      {
        id: 2,
        tribeId: 1, // DRAGON
        name: 'ドラゴライダー',
        nameEn: 'Dragon Rider',
        description: 'ドラゴンと騎士の連携',
      },
      {
        id: 3,
        tribeId: 2, // ANDROID
        name: 'メイドロボ',
        nameEn: 'Maid Robot',
        description: 'サービス特化型アンドロイド',
      },
      {
        id: 4,
        tribeId: 2, // ANDROID
        name: 'アドミラルシップ',
        nameEn: 'Admiral Ship',
        description: '指揮艦型アンドロイド',
      },
      {
        id: 5,
        tribeId: 3, // ELEMENTAL
        name: 'ナチュリア',
        nameEn: 'Natura',
        description: '自然精霊エレメンタル',
      },
      {
        id: 6,
        tribeId: 3, // ELEMENTAL
        name: '鬼刹',
        nameEn: 'Oni Setsu',
        description: '鬼の力を宿すエレメンタル',
      },
      {
        id: 7,
        tribeId: 4, // LUMINUS
        name: 'ロスリス',
        nameEn: 'Losris',
        description: '光の戦士ルミナス',
      },
      {
        id: 8,
        tribeId: 4, // LUMINUS
        name: '白騎士',
        nameEn: 'White Knight',
        description: '聖なる白の騎士',
      },
      {
        id: 9,
        tribeId: 5, // SHADE
        name: '昏き霊園',
        nameEn: 'Dark Cemetery',
        description: '闇に佇む霊園の住人',
      },
      {
        id: 10,
        tribeId: 5, // SHADE
        name: 'マディスキア',
        nameEn: 'Madiskia',
        description: '狂気の影を纏う者',
      },
    ])
    .onConflictDoNothing();

  console.log('✅ Card system data seeded successfully!');
}

/**
 * カードシステムデータのクリア
 */
export async function clearCardSystemData() {
  console.log('🧹 Clearing card system data...');

  try {
    // 外部キー制約の順序に注意してクリア
    await db.delete(categories);
    await db.delete(cardSets);
    await db.delete(tribes);
    await db.delete(leaders);
    await db.delete(cardTypes);
    await db.delete(rarities);

    console.log('✅ Card system data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing card system data:', error);
    throw error;
  }
}
