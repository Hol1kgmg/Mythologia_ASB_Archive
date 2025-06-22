import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { closeDb, db } from './client.js';

// Load environment variables
dotenv.config();

async function runMigrations() {
  console.log('Starting database migrations...');

  try {
    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

// Run migrations if this file is executed directly
runMigrations();
