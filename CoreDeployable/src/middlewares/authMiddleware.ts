import { AuthConfigurationService } from '../services/AuthConfigurationService.js';
import express from 'express';
import { logger } from 'core-runtime';

const skipUrls = ['/public/govuk-frontend.min.js.map'];

async function ensureLoggedInMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const path = req.originalUrl || req.url;
    if (skipUrls.includes(path)) {
      return next();
    }

    logger.debug(`Checking access to endpoint: ${path}`);
    const serviceName = path.split('/')[1];

    const authService = new AuthConfigurationService();

    const hasConfig = await authService.hasConfiguration(serviceName);
    if (hasConfig) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        logger.debug(`User is not logged in`);
        return redirectToLoginWithReturnPath(path);
      } else {
        const config = await authService.getConfiguration(serviceName);
        logger.debug(`Checking if the user is signed in to the expected provider`);

        if (!config || typeof config !== 'object' || !('issuer' in config)) {
          logger.error(`Invalid configuration or missing issuer for service: ${serviceName}`);
          return redirectToLoginWithReturnPath(path);
        }

        const issuerInConfig = (config as { issuer: string }).issuer;
        const issuerInCookie = req.session.passport.user.issuer;

        if (issuerInConfig != issuerInCookie) {
          logger.debug(`Non matching issuers`);
          logger.debug(`Issuer in config: ${issuerInConfig}`);
          logger.debug(`Issuer in cookie: ${issuerInCookie}`);

          return redirectToLoginWithReturnPath(path);
        }
      }
    }

    next();
  } catch (err) {
    next(err);
  }

  function redirectToLoginWithReturnPath(returnToPath: string) {
    if (req.session) {
      req.session.returnTo = returnToPath;
    }

    // RelayState is SAML mechanism for preserving and conveying state information.
    const redirectUrl = `/login?RelayState=${encodeURIComponent(returnToPath)}`;
    logger.debug(`Redirect to: ${redirectUrl}`);

    return res.redirect(redirectUrl);
  }
}

export default ensureLoggedInMiddleware;
