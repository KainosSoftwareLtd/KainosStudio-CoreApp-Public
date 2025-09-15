import { NextFunction, Request, Response } from 'express';

import crypto from 'crypto';
import envConfig from '../config/envConfig.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const apiKeys = envConfig.apiKeys;

  if (apiKeys.length === 0) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header is required' });
    return;
  }

  const bearerMatch = authHeader.match(/^Bearer\s+([A-Za-z0-9._-]*)$/);

  if (!bearerMatch) {
    res.status(401).json({ message: 'Authorization header must be in format: Bearer <api-key>' });
    return;
  }

  const providedKey = bearerMatch[1];

  const isValidKey = apiKeys.some((validKey) => {
    if (validKey.length !== providedKey.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(validKey, 'utf8'), Buffer.from(providedKey, 'utf8'));
  });

  if (!isValidKey) {
    res.status(401).json({ message: 'Invalid API key' });
    return;
  }

  return next();
};
