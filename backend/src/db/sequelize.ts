import { Sequelize } from 'sequelize';
import { env } from '../config/env';

// Central Sequelize instance configured for Postgres
export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: false,
  // Ensure queries run against the intended schema by default
  define: { schema: 'var' }
});

