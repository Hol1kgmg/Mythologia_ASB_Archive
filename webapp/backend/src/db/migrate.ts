import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { getDb, closeDb } from './client';

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    const db = getDb();
    
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
if (require.main === module) {
  runMigrations();
}