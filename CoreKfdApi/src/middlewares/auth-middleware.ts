import { NextFunction, Request, Response } from 'express';

import crypto from 'crypto';
import envConfig from '../config/envConfig.js';

const apiKeyHeaderKeyName = 'X-API-Key';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const apiKeys = envConfig.apiKeys;

  if (apiKeys.length === 0) {
    return next();
  }

  const providedKey = req.get(apiKeyHeaderKeyName);
  if (!providedKey) {
    res.status(401).json({ message: `${apiKeyHeaderKeyName} header is required` });
    return;
  }

  const isValidKey = apiKeys.some((validKey) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(validKey, 'utf8'), Buffer.from(providedKey, 'utf8'));
    } catch {
      // timingSafeEqual throws if buffers have different lengths
      return false;
    }
  });

  if (!isValidKey) {
    res.status(401).json({ message: 'Invalid API key' });
    return;
  }

  return next();
};
