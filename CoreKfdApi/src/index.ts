import { deleteKfd, putKfd } from './controllers/kfd-controller.js';

import { appLogger } from './logConfig.js';
import { authMiddleware } from './middlewares/auth-middleware.js';
import { contentTypeValidator } from './middlewares/content-type-validator.js';
import { customErrorHandler } from './middlewares/error-handler.js';
import express from 'express';
import { methodValidator } from './middlewares/method-validator.js';
import nocache from 'nocache';
import { securityHeaders } from './middlewares/security-headers.js';

export function createApp(): express.Express {
  appLogger.info(`environment variable: NODE_DEV=${process.env.NODE_ENV}`);
  appLogger.info(`environment variable: LOG_LEVEL=${process.env.LOG_LEVEL}`);

  const app = express();
  app.use(securityHeaders);
  app.use(nocache());
  app.use(express.json({ limit: '6MB' }));
  app.use(express.urlencoded({ extended: true, limit: '6MB' }));
  app.use(authMiddleware);
  app.use(contentTypeValidator);
  app.use(methodValidator);

  app.delete('/services/:id', deleteKfd);
  app.put('/services', putKfd);

  app.use((req, res) => {
    appLogger.warn('req path: ' + req.originalUrl);
    res.status(404).json({ message: 'not known path:' + req.originalUrl });
  });

  app.use(customErrorHandler);

  return app;
}
