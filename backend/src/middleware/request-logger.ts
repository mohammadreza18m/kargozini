import type { RequestHandler } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '../lib/logger';

const pino = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  }
});

export const requestLogger: RequestHandler = (req, res, next) => {
  pino(req, res);
  next();
};
