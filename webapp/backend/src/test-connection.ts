import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { admins } from './schema.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🔍 Testing Railway connection...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema: { admins } });

  try {
    // Test connection
    const result = await sql`SELECT current_database(), version()`;
    console.log('✅ Connected to:', result[0]);

    // Test table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admins'
      );
    `;
    
    if (tableCheck[0].exists) {
      console.log('✅ admins table exists');
      
      // Count records
      const count = await db.select().from(admins);
      console.log('📊 admins table records:', count.length);
    } else {
      console.log('⚠️  admins table does not exist - run migration first');
    }

  } catch (error) {
    console.error('❌ Connection failed:', error);
    throw error;
  } finally {
    await sql.end();
    console.log('🔒 Connection closed');
  }
}

testConnection().catch(console.error);