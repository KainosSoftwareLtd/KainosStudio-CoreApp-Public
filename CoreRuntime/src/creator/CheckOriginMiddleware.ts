import express from 'express';
import { logger } from '../index.js';

export const allowedOrigin = process.env.ALLOWED_ORIGIN || '';

export function checkOrigin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const origin = req.get('Origin') || req.get('Referer');
  logger.debug(`Origin: ${origin}; Allowed Origin: ${allowedOrigin}`);

  if (origin && origin.startsWith(allowedOrigin)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}
