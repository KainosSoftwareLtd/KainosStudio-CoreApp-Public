import { Footer } from '../../src/elements/index.js';
import { Page } from '../../src/service/index.js';
import { Resource } from 'i18next';
import { Service } from '../../src/service/Service.js';

describe('Service', () => {
  let service: Service;

  beforeEach(() => {
    service = new Service();
  });

  describe('default values', () => {
    it('should initialize with default values', () => {
      expect(service.name).toBe('myname');
      expect(service.cookieSecret).toBe('mysecret');
      expect(service.firstPage).toBe('landing');
      expect(service.defaultLang).toBe('en-GB');
      expect(service.pages).toEqual([]);
      expect(service.apiMappings).toEqual({});
    });

    it('should initialize nullable properties as null', () => {
      expect(service.cookieBanner).toBeNull();
      expect(service.footer).toBeNull();
    });

    it('should initialize optional properties as undefined', () => {
      expect(service.hash).toBeUndefined();
      expect(service.errorResponse).toBeUndefined();
      expect(service.hasCookiePage).toBeUndefined();
      expect(service.selectedLang).toBeUndefined();
      expect(service.i18n).toBeUndefined();
    });
  });

  describe('property assignments', () => {
    it('should allow setting apiServiceDefinition', () => {
      const apiDef = {
        paths: {
          '/test': {
            get: {
              operationId: 'testOp',
            },
          },
        },
      };
      service.apiServiceDefinition = apiDef;
      expect(service.apiServiceDefinition).toEqual(apiDef);
    });

    it('should allow setting pages', () => {
      const testPage: Page = {
        id: 'test',
        nextPage: null,
        elements: [],
      };
      service.pages = [testPage];
      expect(service.pages).toHaveLength(1);
      expect(service.pages[0]).toEqual(testPage);
    });

    it('should allow setting footer', () => {
      const footer: Footer = {
        type: 'Footer',
        links: [],
      };
      service.footer = footer;
      expect(service.footer).toEqual(footer);
    });

    it('should allow setting i18n configuration', () => {
      const i18nConfig = {
        default: 'pl-PL',
        resources: {} as Resource,
      };
      service.i18n = i18nConfig;
      expect(service.i18n).toEqual(i18nConfig);
    });

    it('should allow setting API mappings', () => {
      const apiMappings = {
        testOperation: {
          request: {
            sourceField: 'targetField',
          },
          response: {
            title: 'Test Response',
            fieldNames: 'fields',
            fieldErrorMessages: 'errors',
            numErrors: 'count',
          },
        },
      };
      service.apiMappings = apiMappings;
      expect(service.apiMappings).toEqual(apiMappings);
    });
  });

  describe('language handling', () => {
    it('should allow changing default language', () => {
      service.defaultLang = 'pl-PL';
      expect(service.defaultLang).toBe('pl-PL');
    });

    it('should allow setting selected language', () => {
      service.selectedLang = 'de-DE';
      expect(service.selectedLang).toBe('de-DE');
    });
  });

  describe('cookie configuration', () => {
    it('should allow setting cookie secret', () => {
      service.cookieSecret = 'newSecret123';
      expect(service.cookieSecret).toBe('newSecret123');
    });

    it('should allow setting cookie banner', () => {
      const banner = {};
      service.cookieBanner = banner;
      expect(service.cookieBanner).toEqual(banner);
    });

    it('should allow setting cookie page flag', () => {
      service.hasCookiePage = true;
      expect(service.hasCookiePage).toBe(true);
    });
  });
});
