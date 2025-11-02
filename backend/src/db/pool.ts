import { Pool } from 'pg';
import { env } from '../config/env';
import { logger } from '../lib/logger';

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected Postgres error');
});

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<T>(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}
