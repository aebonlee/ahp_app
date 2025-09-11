import fs from 'fs';
import path from 'path';
import { query } from './connection';

const migrationsDir = path.join(__dirname, 'migrations');

export async function runMigrations(): Promise<void> {
  try {
    console.log('🔧 Running database migrations...');
    
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`📄 Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await query(sql);
      console.log(`✅ Migration ${file} completed successfully`);
    }
    
    console.log('🎉 All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}