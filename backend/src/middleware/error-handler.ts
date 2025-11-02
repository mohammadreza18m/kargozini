import type { ErrorRequestHandler } from 'express';
import { logger } from '../lib/logger';

interface AppError extends Error {
  status?: number;
  details?: unknown;
}

export const errorHandler: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
  const statusCode = err.status ?? 500;
  logger.error({ err, details: err.details }, 'Unhandled error');
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    details: err.details
  });
};
