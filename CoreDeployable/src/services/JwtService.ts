import { Request, Response } from 'express';

import { SamlUser } from 'core-runtime/lib/SamlUser.js';
import envConfig from '../config/envConfig.js';
import jwt from 'jsonwebtoken';
import { logger } from 'core-runtime';

export interface JwtPayload {
  user: SamlUser;
  issuer: string;
  iat: number;
  exp: number;
}

export class JwtService {
  private static readonly JWT_SECRET = envConfig.sessionSecret;
  private static readonly JWT_EXPIRY = '24h';

  static createToken(user: SamlUser): string {
    try {
      logger.debug(`JWT Token Creation - User data`, user);

      const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
        user,
        issuer: user.issuer || 'unknown',
      };

      logger.debug(`JWT Token Creation - Payload`, payload);

      const token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRY,
        algorithm: 'HS256',
      });

      logger.info(`JWT Token Created`);
      logger.debug(`JWT Token Preview`, token);

      return token;
    } catch (error) {
      logger.error('JWT Token Creation Failed:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userProvided: !!user,
        userNameID: user?.nameID,
        userEmail: user?.email,
      });
      throw new Error('Failed to create authentication token');
    }
  }

  static verifyToken(token: string): JwtPayload | null {
    try {
      logger.debug(`JWT Verification - Starting for token`);

      const decoded = jwt.verify(token, this.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as JwtPayload;

      logger.info(`JWT Verification Success`);
      logger.debug(`JWT Verification - Decoded payload:`, {
        issuer: decoded.issuer,
        iat: new Date(decoded.iat * 1000).toISOString(),
        exp: new Date(decoded.exp * 1000).toISOString(),
        timeUntilExpiry: decoded.exp - Math.floor(Date.now() / 1000),
        userNameID: decoded.user?.nameID,
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
        logger.debug(`JWT Token Extraction - JWT Token From Cookie`, cookieToken);
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
