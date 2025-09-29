import { AuthConfigurationService } from '../services/AuthConfigurationService.js';
import express from 'express';
import { logger } from 'core-runtime';

const reservedResourceNames = ['assets', 'public', 'favicon.ico', '.well-known'];

async function ensureLoggedInMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const path = req.originalUrl || req.url;
    const serviceName = req.params.form;

    logger.debug(`Auth middleware - path: ${path}, serviceName: ${serviceName}`);
    logger.debug(`Auth middleware - isAuthenticated: ${req.isAuthenticated ? req.isAuthenticated() : 'undefined'}`);

    if (reservedResourceNames.includes(serviceName)) {
      logger.debug(`Skipping auth for reserved resource: ${serviceName}`);
      return next();
    }

    logger.debug(`Checking access to endpoint: ${path}`);
    const authService = new AuthConfigurationService();

    const hasConfig = await authService.hasConfiguration(serviceName);
    logger.debug(`Service ${serviceName} has auth config: ${hasConfig}`);

    if (hasConfig) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        logger.debug(`User is not logged in, redirecting to login`);
        return redirectToLoginWithReturnPath(path);
      } else {
        logger.debug(`User is authenticated, checking provider`);
        const config = await authService.getConfiguration(serviceName);
        logger.debug(`Checking if the user is signed in to the expected provider`);

        if (!config || typeof config !== 'object' || !('issuer' in config)) {
          logger.error(`Invalid configuration or missing issuer for service: ${serviceName}`);
          return redirectToLoginWithReturnPath(path);
        }

        const issuerInConfig = (config as { issuer: string }).issuer;
        const issuerInCookie = req.session?.passport?.user?.issuer;

        logger.debug(`Issuer in config: ${issuerInConfig}`);
        logger.debug(`Issuer in cookie: ${issuerInCookie}`);

        if (issuerInConfig != issuerInCookie) {
          logger.debug(`Non matching issuers - redirecting to login`);
          return redirectToLoginWithReturnPath(path);
        }

        logger.debug(`Authentication successful for ${serviceName}`);
      }
    } else {
      logger.debug(`No auth config for service: ${serviceName}, proceeding without auth`);
    }

    next();
  } catch (err) {
    logger.error(`Auth middleware error: ${err}`);
    next(err);
  }

  function redirectToLoginWithReturnPath(returnToPath: string) {
    if (req.session) {
      req.session.returnTo = returnToPath;
    }

    // RelayState is SAML mechanism for preserving and conveying state information.
    const redirectUrl = `/login?RelayState=${encodeURIComponent(returnToPath)}`;
    logger.debug(`Redirect to login: ${redirectUrl}`);

    return res.redirect(redirectUrl);
  }
}

export default ensureLoggedInMiddleware;
