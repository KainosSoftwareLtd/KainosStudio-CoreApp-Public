import { NextFunction, Request, Response } from 'express';

import { AuthConfigurationService } from '../services/AuthConfigurationService.js';
import { JwtService } from '../services/JwtService.js';
import { SamlUser } from 'core-runtime/lib/SamlUser.js';
import envConfig from '../config/envConfig.js';
import { logger } from 'core-runtime';

const reservedResourceNames = ['assets', 'public', 'favicon.ico', '.well-known', 'login'];

interface JwtRequest extends Request {
  jwtUser?: SamlUser;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  const jwtReq = req as JwtRequest;
  jwtReq.jwtUser = undefined;

  try {
    const path = req.originalUrl || req.url;
    const serviceName = req.params.form;

    if (reservedResourceNames.includes(serviceName)) {
      return next();
    }

    logger.info(`AuthMiddleware - Starting for path: ${req.method} ${path}, service: ${serviceName}`);
    logger.debug(`AuthMiddleware - Checking if service ${serviceName} requires authentication`);
    const authService = new AuthConfigurationService();
    const hasConfig = await authService.hasConfiguration(serviceName);

    if (hasConfig) {
      logger.info(`AuthMiddleware - Service ${serviceName} has auth config: ${hasConfig}`);

      const token = JwtService.extractTokenFromRequest(jwtReq);
      if (token) {
        logger.info(`AuthMiddleware - JWT token found, verifying`);

        const payload = JwtService.verifyToken(token);
        if (payload) {
          jwtReq.jwtUser = payload.user;

          logger.info(`AuthMiddleware - JWT verified for user: ${payload.user.id || payload.user.email || 'unknown'}`);
          logger.debug(`AuthMiddleware - Token details:`, {
            user: payload.user,
            issuer: payload.issuer,
            tokenAge: Math.floor(Date.now() / 1000) - payload.iat,
            timeToExpiry: payload.exp - Math.floor(Date.now() / 1000),
          });

          if (!envConfig.skipAuthIssuerCheck) {
            logger.debug(`AuthMiddleware - Validating SAML issuer`);
            const config = await authService.getConfiguration(serviceName);

            if (!config || typeof config !== 'object' || !('issuer' in config)) {
              logger.error(`AuthMiddleware - Invalid config for service: ${serviceName}`);
              return redirectToLogin(res, path, serviceName);
            }

            const issuerInConfig = (config as { issuer: string }).issuer;
            const issuerInJwt = payload.issuer;

            logger.info(`AuthMiddleware - Issuer validation:`, {
              serviceName,
              configIssuer: issuerInConfig,
              jwtIssuer: issuerInJwt,
              isMatch: issuerInConfig === issuerInJwt,
            });

            if (issuerInConfig !== issuerInJwt) {
              logger.warn(`AuthMiddleware - Issuer mismatch for service: ${serviceName}`);
              return redirectToLogin(res, path, serviceName);
            }

            logger.info(`AuthMiddleware - Issuer validation passed`);
            logger.info(`AuthMiddleware - User authenticated: ${payload.user.id || payload.user.email || 'unknown'}`);
          } else {
            logger.info(`AuthMiddleware - Skiping SAML issuer validation`);
          }
        } else {
          logger.warn(`AuthMiddleware - JWT verification failed`);
          logger.warn(`AuthMiddleware - User not authenticated, redirecting for service: ${serviceName}`);
          return redirectToLogin(res, path, serviceName);
        }
      } else {
        logger.info(`AuthMiddleware - No JWT token found`);
      }

      logger.info(`AuthMiddleware - Authentication successful for service: ${serviceName}`);
    } else {
      logger.info(`AuthMiddleware - No auth required for service: ${serviceName}`);
    }

    const duration = Date.now() - startTime;
    logger.debug(`AuthMiddleware - Completed in ${duration}ms`);
    next();
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Auth Error - Duration: ${duration}ms:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      path: req.path,
      method: req.method,
      serviceName: req.params.form,
    });

    next();
  }
};

function redirectToLogin(res: Response, returnToPath: string, serviceName: string): void {
  logger.info(`AuthMiddleware - Redirecting to login for service: ${serviceName}`);

  const redirectUrl = `/login?RelayState=${encodeURIComponent(returnToPath)}`;
  logger.info(`AuthMiddleware - Redirect URL: ${redirectUrl}`);

  res.redirect(redirectUrl);
}
