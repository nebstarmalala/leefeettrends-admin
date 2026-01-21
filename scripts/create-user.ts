import { execute, query, closePool } from '../src/lib/database';
import { RowDataPacket } from 'mysql2/promise';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function createUser(
  username: string,
  email: string,
  password: string
): Promise<void> {
  try {
    // Check if user already exists
    const existing = await query<UserRow[]>(
      'SELECT id, username, email FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      const existingUser = existing[0];
      if (existingUser.username === username) {
        console.error(`Error: Username "${username}" already exists.`);
      } else {
        console.error(`Error: Email "${email}" already exists.`);
      }
      process.exit(1);
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Insert the user
    const result = await execute(
      'INSERT INTO users (username, email, password_hash, is_active) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, true]
    );

    console.log(`User created successfully!`);
    console.log(`  ID: ${result.insertId}`);
    console.log(`  Username: ${username}`);
    console.log(`  Email: ${email}`);

  } catch (error) {
    console.error('Failed to create user:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: npm run create-user <username> <email> <password>');
  console.log('');
  console.log('Arguments:');
  console.log('  username  - Unique username for the user');
  console.log('  email     - Unique email address');
  console.log('  password  - User password');
  console.log('');
  console.log('Example:');
  console.log('  npm run create-user admin admin@example.com mypassword');
  process.exit(1);
}

const [username, email, password] = args;

createUser(username, email, password);
