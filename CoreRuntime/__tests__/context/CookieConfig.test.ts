import { CookieConfig, buildDataCookieConfig } from '../../src/context/CookieConfig.js';

import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { Service } from '../../src/service/Service.js';
import express from 'express';

describe('buildDataCookieConfig', () => {
  let service: Service;
  let req: express.Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;

  beforeEach(() => {
    service = new Service();
    req = {
      params: {
        form: '/test-form'
      }
    } as unknown as express.Request;
  });

  it('should create a CookieConfig with the service hash', () => {
    service.hash = 'test-hash';
    const result = buildDataCookieConfig(service, req);

    expect(result).toBeInstanceOf(CookieConfig);
    expect(result.name).toBe('test-hash');
    expect(result.purpose).toBe('core:cookie-table.session-data-cookie.purpose');
    expect(result.expires).toBe('core:cookie-table.session-data-cookie.expires');
    expect(result.cookieOptions).toEqual({
      path: '/test-form',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 5 * 60 * 60 * 1000,
    });
  });

  it('should create a CookieConfig with a session_data value if service hash is not set', () => {
    service.hash = undefined;
    const result = buildDataCookieConfig(service, req);

    expect(result).toBeInstanceOf(CookieConfig);
    expect(result.name).toBe('session_data');
    expect(result.purpose).toBe('core:cookie-table.session-data-cookie.purpose');
    expect(result.expires).toBe('core:cookie-table.session-data-cookie.expires');
    expect(result.cookieOptions).toEqual({
      path: '/test-form',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 5 * 60 * 60 * 1000,
    });
  });

  it('should set the default path if req.params.form is not provided', () => {
    req.params = {};
    const result = buildDataCookieConfig(service, req);

    expect(result.cookieOptions.path).toBe('/');
  });
});