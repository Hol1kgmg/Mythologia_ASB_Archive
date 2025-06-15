import { db, closeDb } from '../src/db/client.js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test query
    const result = await db.execute(sql`SELECT current_database(), version()`);
    
    console.log('✅ Database connection successful!');
    console.log('📊 Database info:', result);
    
    // Test if we can query the schema
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Existing tables:', tables);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await closeDb();
    console.log('🔒 Connection closed');
  }
}

// Run the test
testConnection();