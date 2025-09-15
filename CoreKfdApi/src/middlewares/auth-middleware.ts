import { NextFunction, Request, Response } from 'express';

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

  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/);

  if (!bearerMatch) {
    res.status(401).json({ message: 'Authorization header must be in format: Bearer <api-key>' });
    return;
  }

  const providedKey = bearerMatch[1];

  if (!apiKeys.includes(providedKey)) {
    res.status(401).json({ message: 'Invalid API key' });
    return;
  }

  return next();
};
