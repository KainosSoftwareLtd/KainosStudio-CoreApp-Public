import { appLogger } from '../logConfig.js';
import express from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function customErrorHandler(err: any, _req: express.Request, res: express.Response, next: express.NextFunction) {
  if (res.headersSent) {
    return next(err);
  }
  appLogger.error(err);
  return res.status(500).json({ error: 'Something went wrong!' });
}
