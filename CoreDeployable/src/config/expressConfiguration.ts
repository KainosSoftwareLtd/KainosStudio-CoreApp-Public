import { JwtService } from '../services/JwtService.js';
import { SamlUser } from 'core-runtime/lib/SamlUser.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
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

export const expressConfiguration = (app: express.Express) => {
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

  // Simplified session configuration - only for SAML flow, not for user persistence
  app.use(
    session({
      secret: envConfig.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 10 * 60 * 1000,
        sameSite: 'lax',
      },
      name: 'saml-flow',
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get(
    '/login',
    (req, _res, next) => {
      logger.debug(`SAML Login - Starting authentication flow`);
      logger.debug(`SAML Login - RelayState: ${req.query?.RelayState || 'none'}`);
      next();
    },
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function (_req, res) {
      res.redirect('/');
    },
  );

  app.post(
    '/login/callback',
    (req, _res, next) => {
      logger.debug(`SAML Callback - Starting processing`);
      logger.debug(`SAML Callback - RelayState: ${req.body?.RelayState || 'none'}`);
      next();
    },
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function (req, res) {
      logger.info(`SAML Auth Success - Processing user data`);
      logger.debug(`SAML Auth Success - User object:`, {
        hasUser: !!req.user,
        userType: typeof req.user,
        userKeys: req.user ? Object.keys(req.user) : [],
      });

      if (req.user) {
        const samlUser = req.user as SamlUser;

        try {
          logger.info(`SAML Callback - Creating JWT for user`);

          const token = JwtService.createToken(samlUser);
          JwtService.setTokenCookie(res, token);
          logger.info(`SAML Callback - JWT token created and cookie set successfully`);
        } catch (error) {
          logger.error(`SAML Callback - JWT creation failed:`, {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            user: samlUser?.nameID || samlUser?.email || 'unknown',
          });
          throw new Error(
            `SAML authentication failed: JWT token creation failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      } else {
        logger.error(`SAML Callback - No user object received from SAML authentication`);
        throw new Error('SAML authentication failed: No user object received from SAML provider');
      }

      const relayState = req.body?.RelayState;
      const redirectUrl = relayState ? decodeURIComponent(relayState) : '/';

      logger.info(`SAML Callback - Final redirect: ${redirectUrl}`);
      res.redirect(redirectUrl);
    },
  );
};
