import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  const db = drizzle(pool);

  await migrate(db, {
    migrationsFolder: './drizzle',
  });

  console.log('Migration successful');
} catch (error) {
  console.error('Migration failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}