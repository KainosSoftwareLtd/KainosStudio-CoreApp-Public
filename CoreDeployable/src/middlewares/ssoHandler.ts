import { AuthConfigurationService } from '../services/AuthConfigurationService.js';
import { MultiSamlStrategy } from '@node-saml/passport-saml';
import { logger } from 'core-runtime';
import passport from 'passport';

const strategy = new MultiSamlStrategy(
  {
    passReqToCallback: true,
    getSamlOptions(request, done) {
      // Debug session information
      logger.debug(`Session ID: ${request.sessionID || 'undefined'}`);
      logger.debug(`Session exists: ${!!request.session}`);
      logger.debug(`Session returnTo: ${request.session?.returnTo || 'undefined'}`);
      logger.debug(`RelayState query param: ${request.query?.RelayState || 'undefined'}`);
      
      // Try to get returnTo from session first, then fallback to RelayState from query params
      let returnToPath = request.session?.returnTo;
      
      if (!returnToPath) {
        // Fallback to RelayState from query parameters for Azure Functions compatibility
        const relayState = request.query?.RelayState as string;
        if (relayState) {
          returnToPath = decodeURIComponent(relayState);
          logger.debug(`Using RelayState as returnTo: ${returnToPath}`);
        }
      } else {
        logger.debug(`Using session returnTo: ${returnToPath}`);
      }

      if (!returnToPath) {
        logger.error('Both session.returnTo and RelayState are empty');
        return done(new Error('returnTo is empty and RelayState is not available'));
      }

      const serviceName = decodeURI(returnToPath.split('/')[1]);

      logger.debug(`Getting saml options for: ${serviceName}`);
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
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  done(null, user as any);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.use(strategy as any);

export default passport;
