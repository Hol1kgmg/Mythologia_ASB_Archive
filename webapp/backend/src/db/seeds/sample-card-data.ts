import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import { db } from '../client.js';
import { cards } from '../schema/index.js';

/**
 * サンプルカードデータ投入スクリプト
 *
 * .agent/mythologia_card.csvからサンプルカードデータを読み込み、
 * データベースに投入する
 */

interface CsvCardData {
  CardNum: string;
  name: string;
  tribe_id: string;
  category_id: string;
  rarity_id: string;
  card_type_id: string;
  cost: string;
  power: string;
  effect1_type: string;
  effect1: string;
  effect2_type: string;
  effect2: string;
}

/**
 * CSVファイルを解析してカードデータを抽出
 */
function parseCsvCardData(csvContent: string): CsvCardData[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  return lines
    .slice(1)
    .filter((line) => line.trim()) // 空行のみ除外
    .map((line) => {
      // CSVの値解析（カンマが含まれる可能性を考慮）
      const values = line.split(',').map((v) => v.trim());
      const data: any = {};

      headers.forEach((header, index) => {
        data[header.trim()] = values[index] || '';
      });

      return data as CsvCardData;
    })
    .filter((data) => data.CardNum && data.name); // 有効なデータのみ
}

/**
 * CSVデータをデータベース形式に変換
 */
function transformCardData(csvData: CsvCardData[]): any[] {
  return csvData.map((row, _index) => {
    // エフェクトをJSON形式に変換
    const effects: any[] = [];
    if (row.effect1 && row.effect1_type) {
      effects.push({
        type: row.effect1_type,
        description: row.effect1,
        timing: 'trigger', // デフォルト値
      });
    }
    if (row.effect2 && row.effect2_type) {
      effects.push({
        type: row.effect2_type,
        description: row.effect2,
        timing: 'trigger', // デフォルト値
      });
    }

    return {
      id: randomUUID(), // 正しいUUID形式のID生成
      cardNumber: row.CardNum,
      name: row.name,
      tribeId: parseInt(row.tribe_id) || null,
      categoryId: row.category_id ? parseInt(row.category_id) : null,
      rarityId: parseInt(row.rarity_id),
      cardTypeId: parseInt(row.card_type_id),
      cost: parseInt(row.cost),
      power: parseInt(row.power),
      effects: effects.length > 0 ? effects : null,
      flavorText: null, // CSVにないため
      imageUrl: null, // CSVにないため
      artist: null, // CSVにないため
      cardSetId: '00000000-0000-0000-0000-000000000001', // 第1弾セットID
      isActive: true,
    };
  });
}

/**
 * サンプルカードデータ投入
 */
export async function seedSampleCardData() {
  console.log('🎴 Loading sample card data from CSV...');

  try {
    // CSVファイルのパス解決（環境に応じて）
    const basePath = process.cwd();
    let csvPath: string;

    // Dockerコンテナ内の場合、Volume mountされたパスを確認
    if (fs.existsSync('/workspace/.agent/mythologia_card.csv')) {
      csvPath = '/workspace/.agent/mythologia_card.csv';
    } else if (fs.existsSync(path.join(basePath, '../../../.agent/mythologia_card.csv'))) {
      csvPath = path.join(basePath, '../../../.agent/mythologia_card.csv');
    } else if (fs.existsSync(path.join(basePath, '../../.agent/mythologia_card.csv'))) {
      csvPath = path.join(basePath, '../../.agent/mythologia_card.csv');
    } else {
      throw new Error(
        'mythologia_card.csv not found. Please ensure the file exists in .agent directory'
      );
    }

    console.log(`  📂 Reading CSV from: ${csvPath}`);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // CSVデータの解析
    const csvData = parseCsvCardData(csvContent);
    console.log(`  📄 Parsed ${csvData.length} cards from CSV`);

    // データ変換
    const cardData = transformCardData(csvData);
    console.log(`  🔄 Transformed ${cardData.length} cards for database`);

    // バッチ投入（重複スキップ）
    await db.insert(cards).values(cardData).onConflictDoNothing();

    console.log('✅ Sample card data seeded successfully!');
    console.log(`  📊 Cards processed: ${cardData.length}`);
    console.log(`  🎯 Card types: ${new Set(cardData.map((c) => c.cardTypeId)).size} types`);
    console.log(`  🏆 Rarities: ${new Set(cardData.map((c) => c.rarityId)).size} rarities`);
    console.log(
      `  🐉 Tribes: ${new Set(cardData.map((c) => c.tribeId).filter(Boolean)).size} tribes`
    );
  } catch (error) {
    console.error('❌ Error seeding sample card data:', error);
    throw error;
  }
}

/**
 * サンプルカードデータのクリア
 */
export async function clearSampleCardData() {
  console.log('🧹 Clearing sample card data...');

  try {
    // カード番号が5桁の数字形式のカードを削除（サンプルデータの特徴）
    await db.delete(cards).where(sql`${cards.cardNumber} ~ '^[0-9]{5}$'`);

    console.log('✅ Sample card data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing sample card data:', error);
    throw error;
  }
}
