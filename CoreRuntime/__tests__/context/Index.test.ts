import { CookieConfig, buildDataCookieConfig } from '../../src/context/CookieConfig.js';
import { Page, Service } from '../../src/service/index.js';

import { Context } from '../../src/context/index.js';
import { Element } from '../../src/service/Element.js';
import { Resource } from 'i18next';
import express from 'express';
import { langKey } from '../../src/consts.js';

describe('Context', () => {
  let req: express.Request;
  let service: Service;
  let cookieConfig: CookieConfig;
  let formData: Record<string, string>;

  beforeEach(() => {
    req = {
      params: { page: 'test-page' },
      cookies: {},
      body: {},
      query: {},
    } as unknown as express.Request;
    service = new (require('../../src/service/Service').Service)();
    service.pages = [{ id: 'cookie', nextPage: null } as Page, { id: 'test-page', nextPage: null } as Page];
    service.footer = { type: 'Footer', links: [] };
    cookieConfig = buildDataCookieConfig(service, req);
    formData = {};
  });

  test('constructor should not add cookie footer link if service does not have cookie page', () => {
    service.pages = [{ id: 'test-page', nextPage: null } as Page];
    const context = new Context(req, service, formData, cookieConfig);
    if (service.footer) {
      expect(service.footer.links).toHaveLength(0);
    }
  });

  test('should handle default language when no language specified', () => {
    service.i18n = {
      default: 'en-GB',
      resources: {} as Resource,
    };
    const context = new Context(req, service, formData, cookieConfig);
    expect(context.service.defaultLang).toBe('en-GB');
    expect(context.service.selectedLang).toBeUndefined();
  });

  test('should handle language from initial data', () => {
    const context = new Context(req, service, { [langKey]: 'pl-PL'}, cookieConfig);
    expect(context.service.selectedLang).toBe('pl-PL');
  });

  test('should handle not found page', () => {
    req.params.page = 'non-existent';
    const context = new Context(req, service, formData, cookieConfig);
    expect(context.page.id).toBe('not-found');
  });

  test('should sanitize body data', () => {
    req.body = {
      field1: '<script>alert("xss")</script>Hello',
      field2: 'Normal text',
    };

    const context = new Context(req, service, formData, cookieConfig);
    expect(context.data.field1).not.toContain('<script>');
    expect(context.data.field2).toBe('Normal text');
  });

  test('should truncate long input data', () => {
    const longString = 'a'.repeat(3000);
    req.body = {
      field: longString,
    };

    const context = new Context(req, service, formData, cookieConfig);
    expect(context.data.field.length).toBe(2500);
  });

  test('should handle empty body', () => {
    req.body = {};
    const context = new Context(req, service, formData, cookieConfig);
    expect(context.data).toEqual(expect.objectContaining({}));
  });

  test('should flatten nested elements', () => {
    const page = {
      id: 'test-page',
      nextPage: null,
      elements: [
        { id: 'el1', type: 'text' } as Element,
        {
          id: 'container',
          type: 'container',
          elements: [{ id: 'el2', type: 'text' } as Element],
        },
      ],
    } as Page;

    service.pages = [page];
    const context = new Context(req, service, formData, cookieConfig);

    expect(context.allElements.length).toBe(3);
    expect(context.allElements.find((el) => (el as any).id === 'el1')).toBeTruthy();
    expect(context.allElements.find((el) => (el as any).id === 'el2')).toBeTruthy();
  });
});
