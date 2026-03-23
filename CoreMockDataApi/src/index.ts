import { contentTypeValidator } from './middlewares/content-type-validator.js';
import { customErrorHandler } from './middlewares/error-handler.js';
import { retrieveData } from './controllers/retrieve-controller.js';
import { securityHeaders } from './middlewares/security-headers.js';
import { appLogger } from './logConfig.js';
import express from 'express';
import nocache from 'nocache';

export function createApp(): express.Express {
  appLogger.info(`environment variable: NODE_ENV=${process.env.NODE_ENV}`);
  appLogger.info(`environment variable: LOG_LEVEL=${process.env.LOG_LEVEL}`);

  const app = express();
  app.use(securityHeaders);
  app.use(nocache());
  app.use(express.json());
  app.use(contentTypeValidator);

  app.post('/retrieve', retrieveData);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use((req, res) => {
    appLogger.warn('Unknown path: ' + req.originalUrl);
    res.status(404).json({ message: 'Not found: ' + req.originalUrl });
  });

  app.use(customErrorHandler);

  return app;
}
