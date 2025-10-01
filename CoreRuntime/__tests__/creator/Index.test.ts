import { Action } from '../../src/service/Element.js';
import { Context } from '../../src/context/index.js';
import { ContextBuilder } from '../../src/context/ContextBuilder.js';
import { Creator } from '../../src/creator/index.js';
import { FormSession } from '../../src/store/FormSession.js';
import { IDataStore } from '../../src/store/DataStore.js';
import { IFileService } from '../../src/files/FileService.js';
import { Renderer } from '../../src/rendering/Renderer.js';
import express from 'express';

jest.mock('../../src/rendering/Renderer.js');
jest.mock('../../src/files/FileService.js');
jest.mock('../../src/context/index.js');
jest.mock('../../src/context/ContextBuilder.js');
jest.mock('express', () => {
  const mockExpress = () => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  });
  mockExpress.static = jest.fn();
  return mockExpress;
});

process.env.FORM_SESSION_TABLE_NAME='fake_value'

describe('Creator', () => {
  let creator: Creator;
  let mockServiceRetriever: jest.Mock;
  let mockRendererFunc: (context: Context) => jest.Mocked<Renderer>;
  let mockDataStore: jest.Mocked<IDataStore<FormSession>>;
  let mockFileManager: jest.Mocked<IFileService>;
  let mockReq: Partial<express.Request>;
  let mockRes: Partial<express.Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockServiceRetriever = jest.fn();
    mockRendererFunc = (context: Context) => {
      return {
        renderDocument: jest.fn().mockReturnValue('rendered-content'),
        getNunjucksPaths: jest.fn().mockReturnValue([]),
      } as any;
    };
    mockFileManager = {
      saveFile: jest.fn().mockResolvedValue({ isSuccessful: true }),
    } as any;

    mockDataStore = {
      getItem: jest.fn(),
      removeItem: jest.fn(),
      saveItem: jest.fn(),
    };

    creator = new Creator(mockServiceRetriever, mockRendererFunc, mockFileManager, mockDataStore, [
      { key: '/test', value: '/test/path' },
      { key: '/assets', value: '/assets/path' },
    ]);

    jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue({} as any);

    mockReq = {
      params: { form: 'test-form', page: 'test-page' },
      cookies: {},
      body: {},
    };

    mockRes = {
      send: jest.fn(),
      redirect: jest.fn(),
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('pagePostHandler', () => {
    it('should handle successful form submission', async () => {
      const mockService = {
        firstPage: 'start',
        apiServiceDefinition: {},
        apiMappings: {
          'test-operation': {
            request: {},
            response: {},
          },
        },
      };

      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        isValid: () => true,
        page: {
          valid: true,
          invalid: false,
          allElements: [
            {
              type: 'SubmitButton',
              action: {
                value: 'submit',
                operation: 'test-operation',
              },
            },
          ],
        },
        data: { action: 'submit', referenceNumber: '' },
        service: mockService,
      };

      (Context as jest.Mock).mockImplementation(() => mockContext);

      global.fetch = jest.fn().mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ reference: '123' }),
      });

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);
    });
  });

  describe('pageGetHandler', () => {
    it('should handle reserved resource names', async () => {
      await creator['pageGetHandler'](mockReq as any, mockRes as any, mockNext);
      expect(mockServiceRetriever).toHaveBeenCalledTimes(1);
      expect(mockServiceRetriever).toHaveBeenCalledWith('test-form');
    });

    it('should redirect on invalid context', async () => {
      const mockContext = {
        isValid: () => false,
      };
      
      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValueOnce(mockContext as any);

      await creator['pageGetHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockRes.redirect).toHaveBeenCalled();
    });
  });

  describe('pagePostHandler additional scenarios', () => {
    it('should handle missing endpoint', async () => {
      const mockService = {
        apiServiceDefinition: {},
        apiMappings: {
          'test-operation': {
            request: {},
            response: {},
          },
        },
      };

      const mockContext = {
        isValid: () => true,
        page: {
          valid: true,
          allElements: [
            {
              type: 'SubmitButton',
              action: {
                value: 'submit',
                operation: 'test-operation',
              },
            },
          ],
        },
        data: { action: 'submit' },
        service: mockService,
      };

      (Context as jest.Mock).mockImplementation(() => mockContext);
      mockServiceRetriever.mockResolvedValue(mockService);

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle JMESPath reference number extraction', async () => {
      const mockService = {
        apiServiceDefinition: {},
        apiMappings: {
          'test-operation': {
            request: {},
            response: 'data.reference',
          },
        },
      };

      const mockContext = {
        isValid: () => true,
        page: {
          valid: true,
          allElements: [
            {
              type: 'SubmitButton',
              action: {
                value: 'submit',
                operation: 'test-operation',
              },
            },
          ],
        },
        data: { action: 'submit' },
        service: mockService,
        getDataForCookie: jest.fn(),
        dataCookieConfig: { name: 'testCookie', cookieOptions: {} },
      };

      mockServiceRetriever.mockResolvedValue(mockService);
      (Context as jest.Mock).mockImplementation(() => mockContext);

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);
    });
  });

  describe('rootGetHandler', () => {
    it('should redirect to default form', () => {
      creator['rootGetHandler'](mockReq as any, mockRes as any);
      expect(mockRes.redirect).toHaveBeenCalledWith('/form');
    });
  });

  describe('configureStaticPaths', () => {
    it('should configure static paths', () => {
      creator['configureStaticPaths']();

      expect(creator['app'].use).toHaveBeenCalledTimes(2);
      expect(express.static).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should handle service retrieval errors', async () => {
      mockServiceRetriever.mockRejectedValue(new Error('Service error'));

      await creator['pageGetHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle custom error handler', async () => {
      const error = new Error('Test error');

      await creator['customErrorHandler'](error, mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('getNextPagePath', () => {
    it('should return redirect path when action has redirect', () => {
      const pageAction: Action = {
        value: 'submit',
        redirect: 'redirect-page',
      };
      const context = { page: {} } as any;

      const result = creator['getNextPagePath'](pageAction, context);
      expect(result).toBe('redirect-page');
    });

    it('should return string nextPage when page has string nextPage', () => {
      const pageAction: Action = {
        value: 'submit',
      };
      const context = {
        page: {
          nextPage: 'next-page',
        },
      } as any;

      const result = creator['getNextPagePath'](pageAction, context);
      expect(result).toBe('next-page');
    });

    it('should handle conditional next page rules', () => {
      const pageAction: Action = {
        value: 'submit',
      };
      const context = {
        data: {
          testKey: 'testValue',
        },
        page: {
          nextPage: {
            rules: [
              {
                match: {
                  testKey: 'testValue',
                },
                page: 'conditional-page',
              },
            ],
          },
        },
      } as any;

      const result = creator['getNextPagePath'](pageAction, context);
      expect(result).toBe('conditional-page');
    });

    it('should return empty string when no matching rules found', () => {
      const pageAction: Action = {
        value: 'submit',
      };
      const context = {
        data: {
          testKey: 'differentValue',
        },
        page: {
          nextPage: {
            rules: [
              {
                match: {
                  testKey: 'testValue',
                },
                page: 'conditional-page',
              },
            ],
          },
        },
      } as any;

      const result = creator['getNextPagePath'](pageAction, context);
      expect(result).toBe('');
    });
  });

  describe('setDateFieldValueInData', () => {
    it('should set date field values in context data', () => {
      const context = {
        allElements: [
          {
            type: 'DatePickerField',
            name: 'testDate',
            value: '2024-02-24',
          },
        ],
        data: {} as Record<string, string>,
      };

      creator['setDateFieldValueInData'](context as any);
      expect(context.data.testDate).toBe('2024-02-24');
    });
  });
});
