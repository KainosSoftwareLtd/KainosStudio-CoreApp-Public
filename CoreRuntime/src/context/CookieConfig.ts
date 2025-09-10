import { dataCookieAgeInMilliseconds, langKey, sessionIdKey } from '../consts.js';
import express, { CookieOptions } from 'express';

import { Service } from '../service/index.js';
import { SessionManager } from './SessionManager.js';
import { v4 as UUID } from 'uuid';
import { decodeUrlEncodedCookie } from './CookieDecoder.js';
import { logger } from '../index.js';

export class CookieConfig {
  public name: string;
  public purpose: string;
  public expires: string;
  public cookieOptions: CookieOptions;

  constructor(name: string, purpose: string, expires: string, cookieOptions: CookieOptions) {
    this.name = name;
    this.purpose = purpose;
    this.expires = expires;
    this.cookieOptions = cookieOptions;
  }
}

export function loadCookieData(
  req: express.Request,
  service: Service,
  dataCookieConfig: CookieConfig,
): Record<string, string> {
  const sessionManager = new SessionManager();

  let data: Record<string, string> = {};
  if (req.cookies && dataCookieConfig.name && dataCookieConfig.name in req.cookies) {
    let encryptedReference: string = req.cookies[dataCookieConfig.name];

    logger.debug(`Original cookie value: ${encryptedReference}`);

    encryptedReference = decodeUrlEncodedCookie(encryptedReference);

    try {
      data = sessionManager.decodeSession(encryptedReference, service);
      logger.debug('Successfully decoded session data');
    } catch (error: any) {
      logger.error(`Failed to decrypt cookie: ${error.toString()}`);
      logger.debug(`Cookie value that failed: ${encryptedReference}`);
    }
  }

  if (!data[sessionIdKey]) {
    data[sessionIdKey] = UUID();
  }

  const lang = req.query && req.query['lang'] ? req.query['lang'].toString() : undefined;
  if (lang) {
    data[langKey] = lang;
  }

  return data;
}

export function buildDataCookieConfig(service: Service, req: express.Request): CookieConfig {
  let cookieName = service.hash || 'session_data';

  const cookieOptions = {
    path: req.params.form || '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: dataCookieAgeInMilliseconds,
  } as CookieOptions;

  return new CookieConfig(
    cookieName,
    'core:cookie-table.session-data-cookie.purpose',
    'core:cookie-table.session-data-cookie.expires',
    cookieOptions,
  );
}
