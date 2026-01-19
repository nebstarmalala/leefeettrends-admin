import { query } from '../src/lib/database';
import fs from 'fs';
import path from 'path';

export async function runMigrations(): Promise<void> {
  try {
    console.log('Running database migrations...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement);
      }
    }
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function resetDatabase(): Promise<void> {
  try {
    console.log('Resetting database...');
    
    await query('DROP DATABASE IF EXISTS leefeettrends');
    await query('CREATE DATABASE leefeettrends CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    await runMigrations();
    
    console.log('Database reset completed');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
}

if (require.main === module) {
  (async () => {
    try {
      await runMigrations();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}