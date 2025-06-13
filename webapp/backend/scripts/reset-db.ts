import { getDb, closeDb } from '../src/db/client.js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkDatabaseConnection() {
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    return false;
  }
}

async function resetDatabase() {
  console.log('🗑️  Starting database reset...');
  
  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('💡 Please create .env file with your database connection string');
    process.exit(1);
  }

  // Check if DATABASE_URL looks like a sample
  if (process.env.DATABASE_URL.includes('your_user') || 
      process.env.DATABASE_URL.includes('your_password') ||
      process.env.DATABASE_URL.includes('your_db')) {
    console.error('❌ DATABASE_URL appears to be using sample values');
    console.log('💡 Please update .env with your actual database credentials');
    process.exit(1);
  }

  // Test connection first
  console.log('🔍 Testing database connection...');
  if (!(await checkDatabaseConnection())) {
    console.error('❌ Cannot connect to database');
    console.log('💡 Please check your DATABASE_URL and database server');
    process.exit(1);
  }
  
  try {
    const db = getDb();
    
    // Drop all admin-related tables and types
    console.log('📋 Dropping admin tables...');
    await db.execute(sql`DROP TABLE IF EXISTS admin_activity_logs CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS admin_sessions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS admins CASCADE`);
    await db.execute(sql`DROP TYPE IF EXISTS admin_role CASCADE`);
    
    // Drop Drizzle migration tracking table
    console.log('🔄 Dropping migration tracking...');
    await db.execute(sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`);
    
    console.log('✅ Database reset completed!');
    console.log('💡 Next steps:');
    console.log('   1. npm run db:generate (to recreate migration files)');
    console.log('   2. npm run db:migrate (to apply fresh schema)');
    console.log('   or');
    console.log('   npm run db:push (for development)');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    console.log('💡 Common solutions:');
    console.log('   - Check DATABASE_URL in .env file');
    console.log('   - Ensure database server is running');
    console.log('   - Verify database credentials');
    process.exit(1);
  } finally {
    await closeDb();
    console.log('🔒 Connection closed');
  }
}

// Confirmation prompt in development
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  WARNING: This will delete ALL admin data!');
  console.log('🔍 Database:', process.env.DATABASE_URL?.split('@')[1] || 'Unknown');
  console.log('⏰ Starting reset in 3 seconds... (Ctrl+C to cancel)');
  
  setTimeout(() => {
    resetDatabase();
  }, 3000);
} else {
  console.error('❌ Reset not allowed in production environment');
  process.exit(1);
}