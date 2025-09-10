import { Context } from '../../src/context/index.js';
import { Creator } from '../../src/creator/index.js';
import { FormSession } from '../../src/store/FormSession.js';
import { IDataStore } from '../../src/store/DataStore.js';
import { IFileService } from '../../src/files/FileService.js';
import { Renderer } from '../../src/rendering/Renderer.js';

jest.mock('../../src/rendering/Renderer.js');
jest.mock('../../src/files/FileService.js');
jest.mock('../../src/context/index.js');
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
  let mockFileManager: jest.Mocked<IFileService>;
  let mockDataStore: jest.Mocked<IDataStore<FormSession>>;
  let mockReq: any;
  let mockRes: any;
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
      saveFile: jest.fn().mockResolvedValue({ isSuccesfull: true }),
    } as any;

    mockDataStore = {
      getItem: jest.fn(),
      removeItem: jest.fn(),
      saveItem: jest.fn(),
    };

    creator = new Creator(mockServiceRetriever, mockRendererFunc, mockFileManager, mockDataStore, []);

    mockReq = {
      params: { form: 'test-form', page: 'test-page' },
      cookies: {},
      body: {},
    };

    mockRes = {
      send: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      headersSent: false,
    };

    mockNext = jest.fn();
  });

  describe('express configuration', () => {
    it('should configure express with custom middleware', () => {
      const customMiddleware = async (_req: any, _res: any, next: any) => {
        next();
      };

      creator.express(undefined, customMiddleware);
      expect(creator['app'].use).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle headers already sent', async () => {
      mockRes.headersSent = true;
      const error = new Error('Test error');

      await creator['customErrorHandler'](error, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle API errors', async () => {
      await creator['customErrorHandler'](new Error('Test'), mockReq, mockRes, mockNext);

      expect(mockRes.send).toHaveBeenCalledWith('Unexpected internal server error.');
    });
  });

  describe('page post handler', () => {
    it('should handle API errors', async () => {
      const mockService = {
        apiServiceDefinition: {
          paths: {
            '/test': {
              post: {
                operationId: 'test-operation',
              },
            },
          },
        },
        apiMappings: {
          'test-operation': {
            request: {},
            response: {},
          },
        },
      };

      mockServiceRetriever.mockResolvedValue(mockService);

      global.fetch = jest.fn().mockResolvedValueOnce({
        status: 500,
        statusText: 'Server Error',
        json: () => Promise.resolve({ error: 'Internal error' }),
      });

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
        data: { action: 'submit' },
        service: mockService,
        allElements: [
          {
            type: 'SubmitButton',
            action: {
              value: 'submit',
              operation: 'test-operation',
            },
          },
        ],
      };

      (Context as jest.Mock).mockImplementation(() => mockContext);

      await creator['pagePostHandler'](mockReq, mockRes, mockNext);

      expect(mockContext.page.valid).toBeFalsy();
      expect(mockContext.page.invalid).toBeTruthy();
      expect((mockContext.service as any).errorResponse).toStrictEqual({ error: 'Internal error' });
    });
  });

  describe('date field handling', () => {
    it('should set date field values in context data', () => {
      interface TestContext {
        allElements: Array<{
          type: string;
          name: string;
          value: string;
        }>;
        data: Record<string, string>;
      }

      const context: TestContext = {
        allElements: [
          {
            type: 'DatePickerField',
            name: 'testDate',
            value: '2024-02-24',
          },
        ],
        data: {},
      };

      creator['setDateFieldValueInData'](context as any);
      expect(context.data.testDate).toBe('2024-02-24');
    });
  });
});
