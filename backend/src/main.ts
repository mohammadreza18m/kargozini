import { createServer } from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

const httpServer = createServer(app);

httpServer.listen(env.port, () => {
  logger.info({ port: env.port }, 'Backend server listening');
});
