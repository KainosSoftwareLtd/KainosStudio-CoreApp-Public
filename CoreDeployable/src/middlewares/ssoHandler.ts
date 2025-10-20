import { AuthConfigurationService } from '../services/AuthConfigurationService.js';
import { MultiSamlStrategy } from '@node-saml/passport-saml';
import { logger } from 'core-runtime';
import passport from 'passport';

const strategy = new MultiSamlStrategy(
  {
    passReqToCallback: true,
    getSamlOptions(request, done) {
      logger.info(`MultiSamlStrategy - Processing SAML options - Method: ${request.method} - URL: ${request.url}`);
      logger.debug(`MultiSamlStrategy - RelayState query param: ${request.query?.RelayState || 'undefined'}`);
      logger.debug(`MultiSamlStrategy - RelayState body param: ${request.body?.RelayState || 'undefined'}`);

      const relayState = (request.query?.RelayState || request.body?.RelayState) as string;
      if (!relayState) {
        logger.error('MultiSamlStrategy - RelayState parameter is required for SAML authentication');
        return done(new Error('RelayState parameter is missing'));
      }

      const relayStatePath = decodeURIComponent(relayState);
      const serviceName = decodeURI(relayStatePath.split('/')[1]);

      logger.debug(`MultiSamlStrategy - Getting saml options for: ${serviceName}`);
      const authService = new AuthConfigurationService();
      return authService.getConfiguration(serviceName).then((config) => done(null, config));
    },
  },
  (_req, profile, done) => {
    done(null, profile ?? undefined);
  },
  (_req, profile, done) => {
    done(null, profile ?? undefined);
  },
);

passport.serializeUser((user, done) => {
  logger.debug('Passport serializeUser called with user:', user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  logger.debug('Passport deserializeUser called with user:', user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  done(null, user as any);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.use(strategy as any);

export default passport;
