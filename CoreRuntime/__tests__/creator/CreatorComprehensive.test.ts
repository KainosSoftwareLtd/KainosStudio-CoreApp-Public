import { Context } from '../../src/context/index.js';
import { Creator } from '../../src/creator/index.js';
import { FormSession } from '../../src/store/FormSession.js';
import { IDataStore } from '../../src/store/DataStore.js';
import { IFileService } from '../../src/files/FileService.js';
import { Renderer } from '../../src/rendering/Renderer.js';
import { Service } from '../../src/service/Service.js';
import express from 'express';

// Mock external dependencies
jest.mock('../../src/rendering/Renderer.js');
jest.mock('../../src/files/FileService.js');
jest.mock('../../src/context/index.js');
jest.mock('../../src/context/ContextBuilder.js');
jest.mock('../../src/context/Enricher.js');
jest.mock('../../src/context/Validator.js');
jest.mock('../../src/rendering/RenderControl.js');
jest.mock('../../src/creator/ObjectBuilder.js');
jest.mock('../../src/store/FormSessionService.js');
jest.mock('express', () => {
  const mockExpress = () => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  });
  mockExpress.static = jest.fn();
  return mockExpress;
});

// Mock global fetch
global.fetch = jest.fn();

process.env.FORM_SESSION_TABLE_NAME = 'fake_value';

describe('Creator - Comprehensive Tests', () => {
  let creator: Creator;
  let mockServiceRetriever: jest.Mock;
  let mockRendererFunc: (context: Context) => jest.Mocked<Renderer>;
  let mockFileService: jest.Mocked<IFileService>;
  let mockDataStore: jest.Mocked<IDataStore<FormSession>>;
  let mockReq: Partial<express.Request>;
  let mockRes: Partial<express.Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock service retriever
    mockServiceRetriever = jest.fn();

    // Setup mock renderer function
    mockRendererFunc = (context: Context) => {
      return {
        renderDocument: jest.fn().mockReturnValue('rendered-content'),
        getNunjucksPaths: jest.fn().mockReturnValue([]),
      } as any;
    };

    // Setup mock file service
    mockFileService = {
      saveFile: jest.fn().mockResolvedValue({ isSuccesfull: true, value: 'file-id' }),
      getPresignedPost: jest.fn().mockResolvedValue({
        isSuccesfull: true,
        value: { url: 'https://upload.url', fields: {} },
      }),
      getPresignedUrlForDownload: jest.fn().mockResolvedValue({
        isSuccesfull: true,
        value: 'https://download.url',
      }),
    } as any;

    // Setup mock data store
    mockDataStore = {
      getItem: jest.fn().mockResolvedValue(null),
      removeItem: jest.fn().mockResolvedValue(true),
      saveItem: jest.fn().mockResolvedValue(true),
    };

    // Create Creator instance
    creator = new Creator(mockServiceRetriever, mockRendererFunc, mockFileService, mockDataStore, [
      { key: '/test', value: '/test/path' },
      { key: '/assets', value: '/assets/path' },
    ]);

    // Setup mock request
    mockReq = {
      params: { form: 'test-form', page: 'test-page' },
      query: {},
      cookies: {},
      body: {},
      originalUrl: '/test-form/test-page',
      user: undefined,
    };

    // Setup mock response
    mockRes = {
      send: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      headersSent: false,
    };

    // Setup mock next function
    mockNext = jest.fn();

    // Mock fetch globally
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize all dependencies correctly', () => {
      expect(creator).toBeDefined();
      expect(creator['serviceRetriever']).toBe(mockServiceRetriever);
      expect(creator['fileService']).toBe(mockFileService);
      expect(creator['staticPaths']).toEqual([
        { key: '/test', value: '/test/path' },
        { key: '/assets', value: '/assets/path' },
      ]);
    });

    it('should create express app instance', () => {
      expect(creator['app']).toBeDefined();
    });

    it('should initialize enricher, validator, and other components', () => {
      expect(creator['enricher']).toBeDefined();
      expect(creator['validator']).toBeDefined();
      expect(creator['renderControl']).toBeDefined();
      expect(creator['objectBuilder']).toBeDefined();
      expect(creator['formSessionService']).toBeDefined();
      expect(creator['contextBuilder']).toBeDefined();
    });
  });

  describe('Express Configuration', () => {
    it('should configure express with default auth middleware when none provided', () => {
      const app = creator.express();

      expect(app).toBeDefined();
      expect(creator['app'].get).toHaveBeenCalled();
      expect(creator['app'].post).toHaveBeenCalled();
    });

    it('should configure express with custom pre-config callback', () => {
      const preConfigCallback = jest.fn();

      creator.express(preConfigCallback);

      expect(preConfigCallback).toHaveBeenCalledWith(creator['app']);
    });

    it('should configure express with custom auth middleware', () => {
      const customAuthMiddleware = jest.fn();

      creator.express(undefined, customAuthMiddleware);

      // The middleware should be used in route configuration
      expect(creator['app'].get).toHaveBeenCalled();
      expect(creator['app'].post).toHaveBeenCalled();
    });

    it('should configure static paths correctly', () => {
      creator['configureStaticPaths']();

      expect(creator['app'].use).toHaveBeenCalledTimes(2);
      expect(express.static).toHaveBeenCalledWith('/test/path');
      expect(express.static).toHaveBeenCalledWith('/assets/path');
    });
  });

  describe('Service Retrieval', () => {
    it('should return service when found', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const result = await creator['getFormService']('test-form');

      expect(result).toBe(mockService);
      expect(mockServiceRetriever).toHaveBeenCalledWith('test-form');
    });

    it('should return not found service when service retriever returns undefined', async () => {
      mockServiceRetriever.mockResolvedValue(undefined);

      const result = await creator['getFormService']('nonexistent-form');

      // Should return the not found service
      expect(result).toBeDefined();
      expect(result.name).toBe('Form not found');
    });
  });

  describe('API Presigned Post Handler', () => {
    beforeEach(() => {
      mockReq.query = {
        sessionId: 'test-session-id',
        fileName: 'test-file.txt',
        serviceName: 'test-service',
        elementId: 'file-upload-element',
      };
    });

    it('should return presigned post URL for valid request', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        allElements: [
          {
            type: 'FileUpload',
            name: 'file-upload-element',
            maxFileSize: 1024000,
          },
        ],
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        url: 'https://upload.url',
        fields: {},
      });
    });

    it('should return 400 for missing sessionId', async () => {
      delete mockReq.query!.sessionId;

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid session' });
    });

    it('should return 400 for missing fileName', async () => {
      delete mockReq.query!.fileName;

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid file name' });
    });

    it('should return 400 for missing serviceName', async () => {
      delete mockReq.query!.serviceName;

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid service name' });
    });

    it('should return 400 for missing elementId', async () => {
      delete mockReq.query!.elementId;

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid element id' });
    });

    it('should return 500 when service not found', async () => {
      mockServiceRetriever.mockResolvedValue(undefined);

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to get service' });
    });

    it('should return 500 when file upload element not found', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        allElements: [
          {
            type: 'TextField',
            name: 'different-element',
          },
        ],
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to find file upload element' });
    });

    it('should return 500 when file service fails', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        allElements: [
          {
            type: 'FileUpload',
            name: 'file-upload-element',
            maxFileSize: 1024000,
          },
        ],
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      mockFileService.getPresignedPost.mockResolvedValue({
        isSuccesfull: false,
        error: 'File service error',
      });

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'File service error' });
    });

    it('should handle exceptions and return 500', async () => {
      mockServiceRetriever.mockRejectedValue(new Error('Unexpected error'));

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unexpected error' });
    });

    it('should handle URL decoding correctly', async () => {
      mockReq.query = {
        sessionId: 'test-session-id',
        fileName: 'test%20file.txt',
        serviceName: 'test%20service',
        elementId: 'file%20upload%20element',
      };

      const mockService = {
        name: 'test service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        allElements: [
          {
            type: 'FileUpload',
            name: 'file upload element',
            maxFileSize: 1024000,
          },
        ],
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);

      await creator['apiGetPresignedPostHandler'](mockReq as any, mockRes as any);

      expect(mockFileService.getPresignedPost).toHaveBeenCalledWith('test-session-id/test file.txt', 1024000);
    });
  });

  describe('Root GET Handler', () => {
    it('should redirect to default form', () => {
      creator['rootGetHandler'](mockReq as any, mockRes as any);

      expect(mockRes.redirect).toHaveBeenCalledWith('/form');
    });
  });

  describe('Form Root GET Handler', () => {
    it('should redirect to first page of service', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start-page',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      await creator['formRootGetHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith('/test-form/start-page');
    });

    it('should skip reserved resource names', async () => {
      mockReq.params = { form: 'assets' };

      await creator['formRootGetHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockServiceRetriever).not.toHaveBeenCalled();
    });

    it('should handle errors and call next', async () => {
      mockServiceRetriever.mockRejectedValue(new Error('Service error'));

      await creator['formRootGetHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Page GET Handler', () => {
    it('should render page successfully for valid context', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        isValid: () => true,
        page: { id: 'test-page', allElements: [] },
        getDataForCookie: jest.fn().mockReturnValue('cookie-data'),
        getDataCookieConfig: jest.fn().mockReturnValue({
          name: 'test-cookie',
          cookieOptions: { secure: true },
        }),
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['enricher'], 'enrichPage').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichSummaryElements').mockImplementation();
      jest.spyOn(creator['renderControl'], 'renderDocument').mockReturnValue('rendered-page');

      await creator['pageGetHandler'](mockReq as any, mockRes as any, mockNext);

      expect(creator['enricher'].enrichPage).toHaveBeenCalledWith(mockContext.page, mockContext);
      expect(creator['enricher'].enrichSummaryElements).toHaveBeenCalledWith(mockContext.page, mockContext);
      expect(mockRes.cookie).toHaveBeenCalledWith('test-cookie', 'cookie-data', { secure: true });
      expect(mockRes.send).toHaveBeenCalledWith('rendered-page');
    });

    it('should redirect to first page for invalid context', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        isValid: () => false,
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);

      await creator['pageGetHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith('/test-form/start');
    });

    it('should skip reserved resource names', async () => {
      mockReq.params = { form: 'public', page: 'some-page' };

      await creator['pageGetHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockServiceRetriever).not.toHaveBeenCalled();
    });

    it('should handle errors and call next', async () => {
      mockServiceRetriever.mockRejectedValue(new Error('Service error'));

      await creator['pageGetHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('createDataCookie', () => {
    it('should create cookie with context data', () => {
      const mockContext = {
        getDataForCookie: jest.fn().mockReturnValue('cookie-data'),
        getDataCookieConfig: jest.fn().mockReturnValue({
          name: 'test-cookie',
          cookieOptions: { httpOnly: true, secure: true },
        }),
      };

      creator['createDataCookie'](mockContext as any, mockRes as any);

      expect(mockContext.getDataForCookie).toHaveBeenCalled();
      expect(mockContext.getDataCookieConfig).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith('test-cookie', 'cookie-data', { httpOnly: true, secure: true });
    });
  });

  describe('Page POST Handler - Comprehensive', () => {
    beforeEach(() => {
      mockReq.body = { action: 'submit', fieldName: 'fieldValue' };
    });

    it('should handle successful form submission with API call', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: {
          paths: {
            '/api/submit': {
              post: {
                operationId: 'submit-operation',
              },
            },
          },
        },
        apiMappings: {
          'submit-operation': {
            request: {},
            response: 'data.referenceNumber',
            apiKey: 'test-api-key',
          },
        },
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
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
                operation: 'submit-operation',
              },
            },
          ],
        },
        data: {
          action: 'submit',
          '_SESSION-ID_': 'test-session-id',
          fieldName: 'fieldValue',
          referenceNumber: '',
        },
        service: mockService,
        allElements: [],
        getDataForCookie: jest.fn().mockReturnValue('cookie-data'),
        getDataCookieConfig: jest.fn().mockReturnValue({
          name: 'test-cookie',
          cookieOptions: {},
        }),
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['enricher'], 'enrichPage').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichSummaryElements').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichErrorElements').mockImplementation();
      jest.spyOn(creator['validator'], 'validatePage').mockImplementation();
      jest.spyOn(creator['objectBuilder'], 'create').mockResolvedValue({ transformedData: 'value' });
      jest.spyOn(creator['formSessionService'], 'removeSession').mockResolvedValue();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ data: { referenceNumber: 'REF123456' } }),
      });

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);

      expect(global.fetch).toHaveBeenCalledWith(
        'undefined/api/submit',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          }),
          body: JSON.stringify({ transformedData: 'value' }),
        }),
      );
      expect(creator['formSessionService'].removeSession).toHaveBeenCalledWith('test-form', 'test-session-id');
      expect(mockRes.redirect).toHaveBeenCalled();
    });

    it('should handle form submission with validation errors', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        isValid: () => true,
        page: {
          valid: false,
          invalid: true,
          allElements: [],
        },
        data: { action: 'submit' },
        service: mockService,
        allElements: [],
        getDataForCookie: jest.fn().mockReturnValue('cookie-data'),
        getDataCookieConfig: jest.fn().mockReturnValue({
          name: 'test-cookie',
          cookieOptions: {},
        }),
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['enricher'], 'enrichPage').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichSummaryElements').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichErrorElements').mockImplementation();
      jest.spyOn(creator['validator'], 'validatePage').mockImplementation();
      jest.spyOn(creator['formSessionService'], 'saveSession').mockResolvedValue();
      jest.spyOn(creator['renderControl'], 'renderDocument').mockReturnValue('rendered-with-errors');

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);

      expect(creator['formSessionService'].saveSession).toHaveBeenCalledWith('test-form', mockContext.data);
      expect(mockRes.send).toHaveBeenCalledWith('rendered-with-errors');
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should handle API errors and set error response', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: {
          paths: {
            '/api/submit': {
              post: {
                operationId: 'submit-operation',
              },
            },
          },
        },
        apiMappings: {
          'submit-operation': {
            request: {},
            response: {},
          },
        },
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
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
                operation: 'submit-operation',
              },
            },
          ],
        },
        data: { action: 'submit' },
        service: mockService,
        allElements: [],
        getDataForCookie: jest.fn().mockReturnValue('cookie-data'),
        getDataCookieConfig: jest.fn().mockReturnValue({
          name: 'test-cookie',
          cookieOptions: {},
        }),
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['enricher'], 'enrichPage').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichSummaryElements').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichErrorElements').mockImplementation();
      jest.spyOn(creator['validator'], 'validatePage').mockImplementation();
      jest.spyOn(creator['objectBuilder'], 'create').mockResolvedValue({ data: 'value' });
      jest.spyOn(creator['formSessionService'], 'saveSession').mockResolvedValue();
      jest.spyOn(creator['renderControl'], 'renderDocument').mockReturnValue('rendered-with-api-error');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Internal server error', code: 'ERR_500' }),
      });

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);

      expect((mockContext.service as any).errorResponse).toEqual({ error: 'Internal server error', code: 'ERR_500' });
      expect(mockContext.page.valid).toBe(false);
      expect(mockContext.page.invalid).toBe(true);
      expect(mockRes.send).toHaveBeenCalledWith('rendered-with-api-error');
    });

    it('should handle file upload elements in API request', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: {
          paths: {
            '/api/submit': {
              post: {
                operationId: 'submit-operation',
              },
            },
          },
        },
        apiMappings: {
          'submit-operation': {
            request: {},
            response: {},
          },
        },
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
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
                operation: 'submit-operation',
              },
            },
          ],
        },
        data: {
          action: 'submit',
          '_SESSION-ID_': 'test-session-id',
          fileField: 'uploaded-file.txt',
        },
        service: mockService,
        allElements: [
          {
            type: 'FileUpload',
            name: 'fileField',
          },
        ],
        getDataForCookie: jest.fn().mockReturnValue('cookie-data'),
        getDataCookieConfig: jest.fn().mockReturnValue({
          name: 'test-cookie',
          cookieOptions: {},
        }),
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['enricher'], 'enrichPage').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichSummaryElements').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichErrorElements').mockImplementation();
      jest.spyOn(creator['validator'], 'validatePage').mockImplementation();

      // Mock the objectBuilder.create to return a model that can be modified
      const mockRequestModel = { data: 'value' };
      jest.spyOn(creator['objectBuilder'], 'create').mockResolvedValue(mockRequestModel);
      jest.spyOn(creator['formSessionService'], 'removeSession').mockResolvedValue();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ referenceNumber: 'REF123' }),
      });

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockFileService.getPresignedUrlForDownload).toHaveBeenCalledWith('test-session-id/uploaded-file.txt');
      // Verify that the file URL was added to the request model
      expect((mockRequestModel as any)['fileField-url']).toBe('https://download.url');
    });

    it('should handle file download URL errors', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: {
          paths: {
            '/api/submit': {
              post: {
                operationId: 'submit-operation',
              },
            },
          },
        },
        apiMappings: {
          'submit-operation': {
            request: {},
            response: {},
          },
        },
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
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
                operation: 'submit-operation',
              },
            },
          ],
        },
        data: {
          action: 'submit',
          '_SESSION-ID_': 'test-session-id',
          fileField: 'uploaded-file.txt',
        },
        service: mockService,
        allElements: [
          {
            type: 'FileUpload',
            name: 'fileField',
          },
        ],
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['enricher'], 'enrichPage').mockImplementation();
      jest.spyOn(creator['validator'], 'validatePage').mockImplementation();
      jest.spyOn(creator['objectBuilder'], 'create').mockResolvedValue({ data: 'value' });

      mockFileService.getPresignedUrlForDownload.mockResolvedValue({
        isSuccesfull: false,
        error: 'File download error',
      });

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle validation exceptions', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        isValid: () => true,
        page: {
          valid: true,
          invalid: false,
          allElements: [],
        },
        data: { action: 'submit' },
        service: mockService,
        allElements: [],
        getDataForCookie: jest.fn().mockReturnValue('cookie-data'),
        getDataCookieConfig: jest.fn().mockReturnValue({
          name: 'test-cookie',
          cookieOptions: {},
        }),
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['enricher'], 'enrichPage').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichSummaryElements').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichErrorElements').mockImplementation();
      jest.spyOn(creator['validator'], 'validatePage').mockRejectedValue(new Error('Validation error'));
      jest.spyOn(creator['formSessionService'], 'saveSession').mockResolvedValue();
      jest.spyOn(creator['renderControl'], 'renderDocument').mockReturnValue('rendered-with-validation-error');

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockContext.page.valid).toBe(false);
      expect(mockContext.page.invalid).toBe(true);
      expect(mockRes.send).toHaveBeenCalledWith('rendered-with-validation-error');
    });

    it('should handle missing endpoint error', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {
          'missing-operation': {
            request: {},
            response: {},
          },
        },
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
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
                operation: 'missing-operation',
              },
            },
          ],
        },
        data: { action: 'submit' },
        service: mockService,
        allElements: [],
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['enricher'], 'enrichPage').mockImplementation();
      jest.spyOn(creator['validator'], 'validatePage').mockImplementation();

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should redirect to first page for invalid context', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        isValid: () => false,
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith('/test-form/start');
    });

    it('should handle date field value setting', async () => {
      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: {
          paths: {
            '/api/submit': {
              post: {
                operationId: 'submit-operation',
              },
            },
          },
        },
        apiMappings: {
          'submit-operation': {
            request: {},
            response: {},
          },
        },
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
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
                operation: 'submit-operation',
              },
            },
          ],
        },
        data: {
          action: 'submit',
          '_SESSION-ID_': 'test-session-id',
          'date-day': '15',
          'date-month': '03',
          'date-year': '2024',
          referenceNumber: 'should-be-deleted',
        },
        service: mockService,
        allElements: [
          {
            type: 'DatePickerField',
            name: 'date',
            value: '2024-03-15',
          },
        ],
        getDataForCookie: jest.fn().mockReturnValue('cookie-data'),
        getDataCookieConfig: jest.fn().mockReturnValue({
          name: 'test-cookie',
          cookieOptions: {},
        }),
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['enricher'], 'enrichPage').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichSummaryElements').mockImplementation();
      jest.spyOn(creator['enricher'], 'enrichErrorElements').mockImplementation();
      jest.spyOn(creator['validator'], 'validatePage').mockImplementation();

      // Mock objectBuilder.create to capture the modified data
      const mockCreate = jest.spyOn(creator['objectBuilder'], 'create');
      mockCreate.mockImplementation((data, mapping) => {
        // Verify the date field was set correctly
        expect(data.date).toBe('2024-03-15');
        expect(data.referenceNumber).toBeUndefined();
        return Promise.resolve({ data: 'value' });
      });

      jest.spyOn(creator['formSessionService'], 'removeSession').mockResolvedValue();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ referenceNumber: 'REF123' }),
      });

      await creator['pagePostHandler'](mockReq as any, mockRes as any, mockNext);

      expect(mockCreate).toHaveBeenCalled();
    });
  });

  describe('setDateFieldValueInData', () => {
    it('should set date field values for DatePickerField elements', () => {
      const mockContext = {
        allElements: [
          {
            type: 'DatePickerField',
            name: 'birthDate',
            value: '1990-05-15',
          },
          {
            type: 'TextField',
            name: 'textField',
            value: 'some text',
          },
          {
            type: 'DatePickerField',
            name: 'startDate',
            value: '2024-01-01',
          },
        ],
        data: {} as Record<string, any>,
      };

      creator['setDateFieldValueInData'](mockContext as any);

      expect(mockContext.data.birthDate).toBe('1990-05-15');
      expect(mockContext.data.startDate).toBe('2024-01-01');
      expect(mockContext.data.textField).toBeUndefined();
    });

    it('should not set date field values when value is empty', () => {
      const mockContext = {
        allElements: [
          {
            type: 'DatePickerField',
            name: 'emptyDate',
            value: '',
          },
          {
            type: 'DatePickerField',
            name: 'nullDate',
            value: null,
          },
        ],
        data: {} as Record<string, any>,
      };

      creator['setDateFieldValueInData'](mockContext as any);

      expect(mockContext.data.emptyDate).toBeUndefined();
      expect(mockContext.data.nullDate).toBeUndefined();
    });
  });

  describe('getNextPagePath', () => {
    it('should return redirect path when action has redirect', () => {
      const pageAction = {
        value: 'submit',
        redirect: 'confirmation-page',
      };
      const context = {
        page: { nextPage: 'default-next' },
      };

      const result = creator['getNextPagePath'](pageAction as any, context as any);

      expect(result).toBe('confirmation-page');
    });

    it('should return nextPage when it is a string', () => {
      const pageAction = {
        value: 'submit',
      };
      const context = {
        page: { nextPage: 'next-page' },
      };

      const result = creator['getNextPagePath'](pageAction as any, context as any);

      expect(result).toBe('next-page');
    });

    it('should handle conditional next page with matching rule', () => {
      const pageAction = {
        value: 'submit',
      };
      const context = {
        data: {
          userType: 'premium',
          age: '25',
        },
        page: {
          nextPage: {
            rules: [
              {
                match: {
                  userType: 'premium',
                },
                page: 'premium-page',
              },
              {
                match: {
                  userType: 'basic',
                },
                page: 'basic-page',
              },
            ],
          },
        },
      };

      const result = creator['getNextPagePath'](pageAction as any, context as any);

      expect(result).toBe('premium-page');
    });

    it('should handle conditional next page with multiple matching conditions', () => {
      const pageAction = {
        value: 'submit',
      };
      const context = {
        data: {
          userType: 'premium',
          hasSubscription: 'true',
        },
        page: {
          nextPage: {
            rules: [
              {
                match: {
                  userType: 'premium',
                  hasSubscription: 'true',
                },
                page: 'premium-subscriber-page',
              },
            ],
          },
        },
      };

      const result = creator['getNextPagePath'](pageAction as any, context as any);

      expect(result).toBe('premium-subscriber-page');
    });

    it('should return empty string when no rules match', () => {
      const pageAction = {
        value: 'submit',
      };
      const context = {
        data: {
          userType: 'guest',
        },
        page: {
          nextPage: {
            rules: [
              {
                match: {
                  userType: 'premium',
                },
                page: 'premium-page',
              },
            ],
          },
        },
      };

      const result = creator['getNextPagePath'](pageAction as any, context as any);

      expect(result).toBe('');
    });

    it('should return empty string when rule has null page', () => {
      const pageAction = {
        value: 'submit',
      };
      const context = {
        data: {
          userType: 'premium',
        },
        page: {
          nextPage: {
            rules: [
              {
                match: {
                  userType: 'premium',
                },
                page: null,
              },
            ],
          },
        },
      };

      const result = creator['getNextPagePath'](pageAction as any, context as any);

      expect(result).toBe('');
    });

    it('should return empty string when no action provided', () => {
      const context = {
        page: { nextPage: 'default-page' },
      };

      const result = creator['getNextPagePath'](undefined, context as any);

      expect(result).toBe('default-page');
    });
  });

  describe('Custom Error Handler', () => {
    it('should build error page and return 500 status', async () => {
      const error = new Error('Test error');

      jest.spyOn(creator, 'buildProblemWithServicePage' as any).mockResolvedValue('error-page-content');

      await creator['customErrorHandler'](error, mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('error-page-content');
    });

    it('should call next when headers are already sent', async () => {
      const error = new Error('Test error');
      mockRes.headersSent = true;

      await creator['customErrorHandler'](error, mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.send).not.toHaveBeenCalled();
    });

    it('should handle errors during error page building', async () => {
      const error = new Error('Test error');

      jest.spyOn(creator, 'buildProblemWithServicePage' as any).mockRejectedValue(new Error('Error page error'));

      await creator['customErrorHandler'](error, mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Unexpected internal server error.');
    });
  });

  describe('buildProblemWithServicePage', () => {
    it('should build error page with error service', async () => {
      const mockErrorContext = {
        isValid: () => true,
        page: { id: 'error-page' },
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockErrorContext as any);
      jest.spyOn(creator['renderControl'], 'renderDocument').mockReturnValue('error-page-html');

      const result = await creator['buildProblemWithServicePage'](mockReq as any);

      expect(result).toBe('error-page-html');
      expect(mockReq.params!.page).toBe('problem');
      expect(creator['contextBuilder'].build).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({ name: 'Sorry, there is a problem with the service' }),
        true,
      );
    });
  });

  describe('Wildcard Route Handler', () => {
    it('should handle wildcard routes for non-reserved forms', async () => {
      mockReq.params = { form: 'test-form', 0: 'extra', 1: 'path' };

      const mockService = {
        name: 'test-service',
        firstPage: 'start',
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        cookieSecret: 'secret',
        cookieBanner: null,
        footer: null,
        hash: 'hash',
      };
      mockServiceRetriever.mockResolvedValue(mockService);

      const mockContext = {
        isValid: () => true,
        page: { id: 'not-found' },
      };

      jest.spyOn(creator['contextBuilder'], 'build').mockResolvedValue(mockContext as any);
      jest.spyOn(creator['renderControl'], 'renderDocument').mockReturnValue('404-page');

      // Simulate the wildcard route handler
      const wildcardHandler = async (req: any, res: any, next: any) => {
        const form = req.params.form;
        if (['assets', 'public', 'favicon.ico', '.well-known'].includes(form)) {
          return next();
        }
        const service = await creator['getFormService'](form);
        const context = await creator['contextBuilder'].build(req, service);
        res.status(404).send(creator['renderControl'].renderDocument(context));
      };

      await wildcardHandler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('404-page');
    });
  });
});
