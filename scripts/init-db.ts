import { testConnection } from '../src/lib/database';
import { runMigrations } from '../database/migrate';

async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }
    
    await runMigrations();
    console.log('Database initialized successfully!');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();