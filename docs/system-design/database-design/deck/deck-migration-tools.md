# デッキ移行ツール

## 概要

デッキシステムの運用・移行に関するツールとスクリプトです。開発環境での初期データ生成から、本番環境でのデータベース移行まで対応します。

## データ移行戦略

### Phase 1: ベータ版（Vercel PostgreSQL）
- 従来のdeck_cardsテーブル使用
- deck_codeカラム追加準備

### Phase 2: 最適化（PostgreSQL）
- deck_cardsからdeck_codeへの移行
- パフォーマンステスト

### Phase 3: プラットフォーム移行（Cloudflare D1）
- PostgreSQLからD1への段階的移行
- データ整合性チェック

## 移行ツール実装

### DatabaseMigrator（メインクラス）

```typescript
export interface MigrationConfig {
  batchSize: number;
  validateAfterMigration: boolean;
  dryRun: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export class DatabaseMigrator {
  private logger: Logger;
  
  constructor(
    private sourceAdapter: DatabaseAdapter,
    private targetAdapter: DatabaseAdapter,
    private config: MigrationConfig = {
      batchSize: 100,
      validateAfterMigration: true,
      dryRun: false,
      logLevel: 'info'
    }
  ) {
    this.logger = new Logger(config.logLevel);
  }
  
  async migrateDecks(): Promise<MigrationResult> {
    this.logger.info('デッキ移行を開始します...');
    
    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    try {
      // 移行対象のデッキ数を取得
      const totalCount = await this.sourceAdapter.countDecks();
      this.logger.info(`移行対象: ${totalCount}件のデッキ`);
      
      // バッチ処理で移行
      for (let offset = 0; offset < totalCount; offset += this.config.batchSize) {
        const decks = await this.sourceAdapter.getDecks(offset, this.config.batchSize);
        
        for (const deck of decks) {
          try {
            await this.migrateSingleDeck(deck);
            processedCount++;
            
            if (processedCount % 50 === 0) {
              this.logger.info(`進行状況: ${processedCount}/${totalCount}`);
            }
          } catch (error) {
            errorCount++;
            const errorMsg = `デッキ移行エラー (ID: ${deck.id}): ${error.message}`;
            errors.push(errorMsg);
            this.logger.error(errorMsg);
          }
        }
      }
      
      // 移行後検証
      if (this.config.validateAfterMigration && !this.config.dryRun) {
        this.logger.info('移行データの検証を開始します...');
        const validationResult = await this.validateMigration();
        
        if (!validationResult.isValid) {
          errors.push(...validationResult.errors);
        }
      }
      
      const duration = Date.now() - startTime;
      
      return {
        success: errorCount === 0,
        processedCount,
        errorCount,
        errors,
        duration
      };
      
    } catch (error) {
      this.logger.error(`移行処理中にエラーが発生しました: ${error.message}`);
      throw error;
    }
  }
  
  private async migrateSingleDeck(sourceDeck: any): Promise<void> {
    // deck_cardsテーブルからカード情報を取得
    const deckCards = await this.sourceAdapter.getDeckCards(sourceDeck.id);
    
    // デッキコードを生成
    const deckCode = DeckCodeParser.stringify(deckCards);
    
    // 移行データを準備
    const migrationDeck = {
      ...sourceDeck,
      deckCode,
      cardCount: deckCards.reduce((sum, card) => sum + card.quantity, 0)
    };
    
    if (this.config.dryRun) {
      this.logger.debug(`[DRY RUN] デッキ移行: ${sourceDeck.id} -> ${deckCode}`);
      return;
    }
    
    // ターゲットDBに挿入
    await this.targetAdapter.insertDeck(migrationDeck);
  }
  
  private async validateMigration(): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // 件数チェック
    const sourceCount = await this.sourceAdapter.countDecks();
    const targetCount = await this.targetAdapter.countDecks();
    
    if (sourceCount !== targetCount) {
      errors.push(`件数不一致: ソース=${sourceCount}, ターゲット=${targetCount}`);
    }
    
    // サンプリング検証
    const sampleDecks = await this.sourceAdapter.getDecks(0, 10);
    
    for (const sourceDeck of sampleDecks) {
      const targetDeck = await this.targetAdapter.findDeckById(sourceDeck.id);
      
      if (!targetDeck) {
        errors.push(`デッキが見つかりません: ${sourceDeck.id}`);
        continue;
      }
      
      // デッキコード検証
      const sourceDeckCards = await this.sourceAdapter.getDeckCards(sourceDeck.id);
      const expectedDeckCode = DeckCodeParser.stringify(sourceDeckCards);
      
      if (targetDeck.deckCode !== expectedDeckCode) {
        errors.push(`デッキコード不一致: ${sourceDeck.id}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### PostgreSQL → D1 移行アダプター

```typescript
// PostgreSQL移行用アダプター
export class PostgresMigrationAdapter implements DatabaseAdapter {
  constructor(private prisma: PrismaClient) {}
  
  async countDecks(): Promise<number> {
    return this.prisma.deck.count();
  }
  
  async getDecks(offset: number, limit: number): Promise<any[]> {
    return this.prisma.deck.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'asc' }
    });
  }
  
  async getDeckCards(deckId: string): Promise<DeckCard[]> {
    const deckCards = await this.prisma.deckCard.findMany({
      where: { deckId },
      include: { card: true }
    });
    
    return deckCards.map(dc => ({
      cardId: dc.cardId,
      quantity: dc.quantity
    }));
  }
  
  async insertDeck(deck: any): Promise<void> {
    await this.prisma.deck.create({
      data: deck
    });
  }
  
  async findDeckById(id: string): Promise<any> {
    return this.prisma.deck.findUnique({
      where: { id }
    });
  }
}

// D1移行用アダプター
export class D1MigrationAdapter implements DatabaseAdapter {
  constructor(private db: D1Database) {}
  
  async countDecks(): Promise<number> {
    const result = await this.db.prepare('SELECT COUNT(*) as count FROM decks').first();
    return result?.count as number || 0;
  }
  
  async getDecks(offset: number, limit: number): Promise<any[]> {
    const { results } = await this.db.prepare(`
      SELECT * FROM decks 
      ORDER BY created_at ASC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    return results as any[];
  }
  
  async getDeckCards(deckId: string): Promise<DeckCard[]> {
    // D1では既にdeck_codeが存在する前提
    // または別の方法でカード情報を取得
    const { results } = await this.db.prepare(`
      SELECT deck_code FROM decks WHERE id = ?
    `).bind(deckId).all();
    
    const deck = results[0] as any;
    return deck ? DeckCodeParser.parse(deck.deckCode) : [];
  }
  
  async insertDeck(deck: any): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO decks (
        id, user_id, leader_id, name, description, deck_code,
        card_count, is_public, tags, likes, views, is_deleted,
        deleted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      deck.id,
      deck.userId,
      deck.leaderId,
      deck.name,
      deck.description,
      deck.deckCode,
      deck.cardCount,
      deck.isPublic,
      JSON.stringify(deck.tags),
      deck.likes,
      deck.views,
      deck.isDeleted,
      deck.deletedAt?.toISOString(),
      deck.createdAt.toISOString(),
      deck.updatedAt.toISOString()
    ).run();
  }
  
  async findDeckById(id: string): Promise<any> {
    const result = await this.db.prepare(`
      SELECT * FROM decks WHERE id = ?
    `).bind(id).first();
    
    return result;
  }
}
```

## 運用スクリプト

### 開発環境セットアップ

```typescript
// scripts/setup-dev-data.ts
export async function setupDevData() {
  console.log('開発環境のテストデータを生成中...');
  
  const { database } = createAdapters();
  
  // テストユーザー作成
  const testUsers = await createTestUsers(database);
  
  // テストカード作成
  const testCards = await createTestCards(database);
  
  // テストデッキ作成
  const testDecks = await createTestDecks(database, testUsers, testCards);
  
  console.log(`作成完了:
    ユーザー: ${testUsers.length}件
    カード: ${testCards.length}件
    デッキ: ${testDecks.length}件
  `);
}

async function createTestDecks(
  database: DatabaseAdapter,
  users: User[],
  cards: Card[]
): Promise<Deck[]> {
  const deckTemplates = [
    {
      name: 'ドラゴンラッシュ',
      leaderId: 1,
      cardPattern: 'dragon-heavy'
    },
    {
      name: 'アンドロイドコントロール',
      leaderId: 2,
      cardPattern: 'control'
    },
    {
      name: 'エレメンタルバランス',
      leaderId: 3,
      cardPattern: 'balanced'
    }
  ];
  
  const decks: Deck[] = [];
  
  for (const user of users) {
    for (const template of deckTemplates) {
      const deckCards = generateDeckCards(cards, template.cardPattern);
      const deckCode = DeckCodeParser.stringify(deckCards);
      
      const deck = await database.createDeck({
        userId: user.id,
        leaderId: template.leaderId,
        name: `${template.name} - ${user.username}`,
        deckCode,
        cardCount: 30,
        isPublic: Math.random() > 0.5,
        tags: [template.cardPattern],
        likes: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 500),
        isDeleted: false
      });
      
      decks.push(deck);
    }
  }
  
  return decks;
}
```

### バックアップ・リストア

```typescript
// scripts/backup-restore.ts
export class DeckBackupManager {
  constructor(private adapter: DatabaseAdapter) {}
  
  async createBackup(filePath: string): Promise<void> {
    console.log('バックアップを作成中...');
    
    const decks = await this.adapter.getAllDecks();
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      deckCount: decks.length,
      decks: decks.map(deck => ({
        ...deck,
        // センシティブ情報を除外
        userId: this.hashUserId(deck.userId)
      }))
    };
    
    await fs.writeFile(filePath, JSON.stringify(backup, null, 2));
    console.log(`バックアップ完了: ${filePath} (${decks.length}件)`);
  }
  
  async restoreFromBackup(filePath: string, dryRun = true): Promise<void> {
    console.log(`バックアップから復元中: ${filePath}`);
    
    const backupData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    for (const deck of backupData.decks) {
      if (dryRun) {
        console.log(`[DRY RUN] デッキ復元: ${deck.id}`);
      } else {
        await this.adapter.insertDeck(deck);
      }
    }
    
    console.log(`復元完了: ${backupData.deckCount}件`);
  }
  
  private hashUserId(userId: string): string {
    // ユーザーIDをハッシュ化してプライバシー保護
    return createHash('sha256').update(userId).digest('hex').substr(0, 8);
  }
}
```

### パフォーマンステスト

```typescript
// scripts/performance-test.ts
export class DeckPerformanceTest {
  constructor(private service: DeckService) {}
  
  async runLoadTest(): Promise<TestResult> {
    console.log('パフォーマンステストを開始...');
    
    const testCases = [
      { name: 'デッキ作成', operation: this.testDeckCreation.bind(this) },
      { name: 'デッキ取得', operation: this.testDeckRetrieval.bind(this) },
      { name: 'デッキ検索', operation: this.testDeckSearch.bind(this) },
      { name: '統計計算', operation: this.testStatsCalculation.bind(this) }
    ];
    
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      console.log(`テスト実行中: ${testCase.name}`);
      const result = await this.measurePerformance(testCase.operation);
      results.push({ ...result, name: testCase.name });
    }
    
    this.printResults(results);
    return results;
  }
  
  private async measurePerformance(operation: () => Promise<void>): Promise<TestResult> {
    const iterations = 100;
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await operation();
      const duration = performance.now() - start;
      times.push(duration);
    }
    
    return {
      iterations,
      avgTime: times.reduce((sum, time) => sum + time, 0) / iterations,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      p95Time: this.percentile(times, 0.95)
    };
  }
  
  private async testDeckCreation(): Promise<void> {
    // テスト用デッキ作成
    const testCards = this.generateRandomCards();
    await this.service.createDeck('test-user', {
      name: 'テストデッキ',
      leaderId: 1,
      cards: testCards,
      isPublic: false,
      tags: []
    });
  }
  
  // その他のテストメソッド...
}
```

### CLI ツール

```typescript
// scripts/deck-cli.ts
import { Command } from 'commander';

const program = new Command();

program
  .name('deck-cli')
  .description('デッキシステム管理CLI')
  .version('1.0.0');

program
  .command('migrate')
  .description('データベース移行')
  .option('--source <type>', 'ソースDB (postgres|d1)', 'postgres')
  .option('--target <type>', 'ターゲットDB (postgres|d1)', 'd1')
  .option('--dry-run', 'ドライラン')
  .action(async (options) => {
    const migrator = new DatabaseMigrator(
      createSourceAdapter(options.source),
      createTargetAdapter(options.target),
      { dryRun: options.dryRun }
    );
    
    const result = await migrator.migrateDecks();
    
    if (result.success) {
      console.log('✅ 移行完了');
    } else {
      console.log('❌ 移行エラー');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
  });

program
  .command('backup')
  .description('データバックアップ')
  .option('-o, --output <file>', '出力ファイル', `backup-${Date.now()}.json`)
  .action(async (options) => {
    const backupManager = new DeckBackupManager(createAdapter());
    await backupManager.createBackup(options.output);
  });

program
  .command('test')
  .description('パフォーマンステスト')
  .action(async () => {
    const testRunner = new DeckPerformanceTest(createDeckService());
    await testRunner.runLoadTest();
  });

program.parse();
```

## 運用チェックリスト

### 移行前チェック

- [ ] バックアップ作成完了
- [ ] 移行スクリプトのドライラン実行
- [ ] パフォーマンステスト完了
- [ ] ロールバック手順の確認
- [ ] 監視設定の準備

### 移行後チェック

- [ ] データ整合性の検証
- [ ] 基本機能の動作確認
- [ ] パフォーマンスの確認
- [ ] エラーログの確認
- [ ] 旧環境の停止

### 定期運用

- [ ] 週次バックアップの実行
- [ ] パフォーマンス監視
- [ ] エラー率の監視
- [ ] ディスク使用量の監視