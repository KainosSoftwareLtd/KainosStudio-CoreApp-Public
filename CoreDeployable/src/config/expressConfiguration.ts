import { RedisStore } from 'connect-redis';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import envConfig from './envConfig.js';
import express from 'express';
import { getCloudServices } from '../container/CloudServicesRegistry.js';
import helmet from 'helmet';
import { logger } from 'core-runtime';
import nocache from 'nocache';
import passport from '../middlewares/ssoHandler.js';
import { permissionsPolicy } from '../middlewares/permissionsPolicy.js';
import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    returnTo: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport: any;
  }
}

export const expressConfiguration = async (app: express.Express) => {
  const storageUrl = getCloudServices().fileService.getStorageUrl();

  app.use(
    helmet({
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://*.googletagmanager.com'],
          'img-src': [
            "'self'",
            'https://*.google-analytics.com',
            'https://*.googletagmanager.com',
            'data: w3.org/2000/svg',
          ],
          'connect-src': [
            "'self'",
            storageUrl,
            'https://*.google-analytics.com',
            'https://*.analytics.google.com',
            'https://*.googletagmanager.com',
          ],
        },
      },
    }),
  );

  app.use(permissionsPolicy());
  app.use(nocache());

  app.use(bodyParser.json({ type: 'application/json' }));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true }));

  let store: session.Store | undefined = undefined;
  if (envConfig.redisConnectionString) {
    const redisClient = createClient({
      url: envConfig.redisConnectionString,
      socket: {
        tls: true,
        timeout: envConfig.redisTimeout,
        connectTimeout: envConfig.redisConnectionTimeout,
        reconnectStrategy: 500,
      },
    });

    await redisClient.connect();

    store = new RedisStore({
      client: redisClient,
      prefix: 'CoreApp:',
    });
  } else {
    logger.warn(
      'REDIS_CONNECTION_STRING is not configured. Using in-memory session store. This is not suitable for production.',
    );
  }

  app.use(
    session({
      secret: envConfig.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: store,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/login', passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function (_req, res) {
    res.redirect('/');
  });

  app.post(
    '/login/callback',
    passport.authenticate('saml', {
      failureRedirect: '/',
      failureFlash: true,
    }),
    function (req, res) {
      // Handle RelayState from either body or query parameters, with fallback to session
      const bodyRelayState = req.body?.RelayState;
      const queryRelayState = req.query?.RelayState;
      const sessionReturnTo = req.session?.returnTo;

      // Debug logging for all individual values
      logger.debug(`SAML callback debug - Body RelayState: ${bodyRelayState}`);
      logger.debug(`SAML callback debug - Query RelayState: ${queryRelayState}`);
      logger.debug(`SAML callback debug - Session returnTo: ${sessionReturnTo}`);

      const relayState = bodyRelayState || queryRelayState || sessionReturnTo;
      const redirectUrl = relayState ? decodeURIComponent(relayState) : '/';

      logger.debug(`SAML callback - Final RelayState: ${relayState}, Redirect to: ${redirectUrl}`);
      logger.debug(`Request body:`, req.body);
      logger.debug(`Request query:`, req.query);
      logger.debug(`Session returnTo:`, req.session?.returnTo);

      // Clear the returnTo from session after using it
      if (req.session?.returnTo) {
        delete req.session.returnTo;
      }

      res.redirect(redirectUrl);
    },
  );
};
