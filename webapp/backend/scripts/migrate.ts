#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// 環境変数読み込み
dotenv.config({ path: '.env.local' });

interface MigrationOptions {
  type: 'postgresql' | 'd1';
  dryRun?: boolean;
}

async function runPostgreSQLMigrations(options: MigrationOptions) {
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const sqlDir = join(__dirname, '../sql/postgresql');
    const files = readdirSync(sqlDir).filter(f => f.endsWith('.sql')).sort();
    
    console.log(`🚀 Running PostgreSQL migrations...`);
    
    for (const file of files) {
      console.log(`📄 Executing: ${file}`);
      const sql = readFileSync(join(sqlDir, file), 'utf8');
      
      if (options.dryRun) {
        console.log(`DRY RUN - Would execute:\n${sql.substring(0, 200)}...`);
      } else {
        await pool.query(sql);
        console.log(`✅ ${file} completed`);
      }
    }
    
    console.log('✨ All PostgreSQL migrations completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function runD1Migrations(options: MigrationOptions) {
  console.log('🚀 Running D1 migrations...');
  console.log('ℹ️  D1 migrations should be run using wrangler:');
  console.log('');
  console.log('# Create database');
  console.log('npx wrangler d1 create mythologia-db');
  console.log('');
  console.log('# Run migrations');
  
  const sqlDir = join(__dirname, '../sql/d1');
  const files = readdirSync(sqlDir).filter(f => f.endsWith('.sql')).sort();
  
  for (const file of files) {
    console.log(`npx wrangler d1 execute mythologia-db --file=sql/d1/${file}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const type = args[0] as 'postgresql' | 'd1';
  const dryRun = args.includes('--dry-run');
  
  if (!type || !['postgresql', 'd1'].includes(type)) {
    console.error('Usage: npm run migrate [postgresql|d1] [--dry-run]');
    process.exit(1);
  }
  
  const options: MigrationOptions = { type, dryRun };
  
  if (type === 'postgresql') {
    await runPostgreSQLMigrations(options);
  } else {
    await runD1Migrations(options);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});