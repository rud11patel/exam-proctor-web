import pkg from 'pg';
const { Pool } = pkg;
import { env } from './env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message?: string }> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return {
      connected: true,
      message: `PostgreSQL connection healthy (${result.rows[0].now})`,
    };
  } catch (error: any) {
    return {
      connected: false,
      message: error.message || 'Unable to connect to PostgreSQL database',
    };
  }
}
