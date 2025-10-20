import { Request, Response } from 'express';

import { Profile } from '@node-saml/passport-saml';
import { SAML_CLAIM_TYPES } from '../constants/samlClaims.js';
import { SamlUser } from 'core-runtime/lib/SamlUser.js';
import envConfig from '../config/envConfig.js';
import jwt from 'jsonwebtoken';
import { logger } from 'core-runtime';

const JWT_EXPIRY = '24h';

export interface JwtPayload {
  user: SamlUser;
  issuer: string;
  iat: number;
  exp: number;
}

export class JwtService {
  static createToken(profile: Profile): string {
    try {
      logger.debug(`JWT Token Creation - User data`, profile);

      const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
        user: {
          id: profile.nameID,
          name: profile[SAML_CLAIM_TYPES.NAME]?.toString(),
          email: profile[SAML_CLAIM_TYPES.EMAIL_ADDRESS]?.toString(),
        },
        issuer: profile.issuer || 'unknown',
      };

      logger.debug(`JWT Token Creation - Payload`, payload);

      const token = jwt.sign(payload, envConfig.sessionSecret, {
        expiresIn: JWT_EXPIRY,
      });

      logger.info(`JWT Token Created`);
      logger.debug(`JWT Token Preview: ${token.slice(0, 6)}...${token.slice(-6)} (length: ${token.length})`);

      return token;
    } catch (error) {
      logger.error('JWT Token Creation Failed:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userProvided: !!profile,
        userId: profile?.nameID,
        userEmail: profile?.email,
      });
      throw new Error('Failed to create authentication token');
    }
  }

  static verifyToken(token: string): JwtPayload | null {
    try {
      logger.debug(`JWT Verification - Starting for token`);

      const decoded = jwt.verify(token, envConfig.sessionSecret, {
        algorithms: ['HS256'],
      }) as JwtPayload;

      logger.info(`JWT Verification Success`);
      logger.debug(`JWT Verification - Decoded payload:`, {
        issuer: decoded.issuer,
        iat: new Date(decoded.iat * 1000).toISOString(),
        exp: new Date(decoded.exp * 1000).toISOString(),
        timeUntilExpiry: decoded.exp - Math.floor(Date.now() / 1000),
        userId: decoded.user?.id,
        userName: decoded.user?.name,
        userEmail: decoded.user?.email,
      });

      return decoded;
    } catch (error) {
      logger.warn(`JWT Verification Failed:`, {
        error: error instanceof Error ? error.message : error,
        errorType: error?.constructor?.name,
        tokenProvided: !!token,
      });

      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('JWT token expired - user needs to re-authenticate');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid JWT token format or signature');
      } else {
        logger.error('Unexpected JWT verification error:', error);
      }
      return null;
    }
  }

  static extractTokenFromRequest(req: Request): string | null {
    logger.debug(`JWT Token Extraction - Starting for ${req.method} ${req.path}`);
    if (req.cookies) {
      logger.debug(`JWT Token Extraction - Available cookies:`, Object.keys(req.cookies));

      if (req.cookies['auth-token']) {
        const cookieToken = req.cookies['auth-token'];
        logger.info(`JWT Token Extraction - JWT Token Found`);
        logger.debug(
          `JWT Token Extraction - JWT Token From Cookie: ${cookieToken.slice(0, 6)}...${cookieToken.slice(-6)} (length: ${cookieToken.length})`,
        );
        return cookieToken;
      }
      logger.warn(`JWT Token Not Found - No auth-token cookie`);
    }

    return null;
  }

  static setTokenCookie(res: Response, token: string): void {
    logger.info(`JWT Cookie Setting`);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    };

    logger.debug(`JWT Cookie Options:`, cookieOptions);

    const cookieName = 'auth-token';
    res.cookie(cookieName, token, cookieOptions);

    logger.info(`JWT Cookie Set Successfully - Name: ${cookieName}, MaxAge: ${cookieOptions.maxAge}ms`);
  }
}
