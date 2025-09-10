import { AuthConfigurationService } from '../services/AuthConfigurationService.js';
import { MultiSamlStrategy } from '@node-saml/passport-saml';
import { logger } from 'core-runtime';
import passport from 'passport';

const strategy = new MultiSamlStrategy(
  {
    passReqToCallback: true,
    getSamlOptions(request, done) {
      if (!request.session.returnTo) {
        return done(new Error('returnTo is empty'));
      }

      const serviceName = request.session.returnTo.split('/')[1];

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
