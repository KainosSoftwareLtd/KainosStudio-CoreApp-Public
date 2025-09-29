import { FormSession } from '../../src/store/FormSession';
import { FormSessionService } from '../../src/store/FormSessionService';
import { IDataStore } from '../../src/store/DataStore';

// Mock the consts module
jest.mock('../../src/consts', () => ({
  dataCookieAgeInMilliseconds: 18000000, // 5 hours in milliseconds (matches actual constant)
  sessionIdKey: '_SESSION-ID_', // Matches actual constant
}));

// Mock environment variables
const originalEnv = process.env;

describe('FormSessionService', () => {
  let mockDataStore: jest.Mocked<IDataStore<FormSession>>;
  let formSessionService: FormSessionService;

  beforeEach(() => {
    // Reset environment
    jest.resetModules();
    process.env = { ...originalEnv };

    // Create mock data store
    mockDataStore = {
      saveItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    };

    // Set required environment variable
    process.env.FORM_SESSION_TABLE_NAME = 'test_form_sessions';

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create FormSessionService with valid environment variable', () => {
      process.env.FORM_SESSION_TABLE_NAME = 'valid_table_name';

      const service = new FormSessionService(mockDataStore);

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(FormSessionService);
    });

    it('should throw error when FORM_SESSION_TABLE_NAME environment variable is not set', () => {
      // Remove the environment variable
      delete process.env.FORM_SESSION_TABLE_NAME;

      expect(() => {
        new FormSessionService(mockDataStore);
      }).toThrow('FORM_SESSION_TABLE_NAME environment variable is not set');
    });

    it('should throw error when FORM_SESSION_TABLE_NAME is empty string', () => {
      process.env.FORM_SESSION_TABLE_NAME = '';

      expect(() => {
        new FormSessionService(mockDataStore);
      }).toThrow('FORM_SESSION_TABLE_NAME environment variable is not set');
    });
  });

  describe('saveSession', () => {
    beforeEach(() => {
      formSessionService = new FormSessionService(mockDataStore);
    });

    it('should save session with correct data structure', async () => {
      const formId = 'test-form';
      const sessionData = {
        '_SESSION-ID_': 'test-session-id',
        field1: 'value1',
        field2: 'value2',
      };

      await formSessionService.saveSession(formId, sessionData);

      expect(mockDataStore.saveItem).toHaveBeenCalledWith(
        'test_form_sessions',
        expect.objectContaining({
          form_id: formId,
          session_id: 'test-session-id',
          form_data: sessionData,
          expires_at: expect.any(Number),
        }),
      );
      expect(mockDataStore.saveItem).toHaveBeenCalledTimes(1);
    });

    it('should handle session data without sessionId gracefully', async () => {
      const formId = 'test-form';
      const sessionData = {
        field1: 'value1',
        field2: 'value2',
        // No _SESSION-ID_ key
      };

      await formSessionService.saveSession(formId, sessionData);

      expect(mockDataStore.saveItem).toHaveBeenCalledWith(
        'test_form_sessions',
        expect.objectContaining({
          form_id: formId,
          session_id: undefined, // Should be undefined when _SESSION-ID_ key is missing
          form_data: sessionData,
        }),
      );
    });

    it('should calculate correct expiration timestamp', async () => {
      const formId = 'test-form';
      const sessionData = { '_SESSION-ID_': 'test-id' };

      const beforeTime = Math.floor(Date.now() / 1000);
      await formSessionService.saveSession(formId, sessionData);
      const afterTime = Math.floor(Date.now() / 1000);

      const expectedMinExpiration = beforeTime + 18000; // 5 hours = 18000 seconds
      const expectedMaxExpiration = afterTime + 18000;

      expect(mockDataStore.saveItem).toHaveBeenCalledWith(
        'test_form_sessions',
        expect.objectContaining({
          expires_at: expect.any(Number),
        }),
      );

      const savedSession = mockDataStore.saveItem.mock.calls[0][1] as FormSession;
      expect(savedSession.expires_at).toBeGreaterThanOrEqual(expectedMinExpiration);
      expect(savedSession.expires_at).toBeLessThanOrEqual(expectedMaxExpiration);
    });

    it('should handle empty session data', async () => {
      const formId = 'test-form';
      const sessionData = {};

      await formSessionService.saveSession(formId, sessionData);

      expect(mockDataStore.saveItem).toHaveBeenCalledWith(
        'test_form_sessions',
        expect.objectContaining({
          form_id: formId,
          form_data: {},
        }),
      );
    });
  });

  describe('getSession', () => {
    beforeEach(() => {
      formSessionService = new FormSessionService(mockDataStore);
    });

    it('should return session data when session exists', async () => {
      const formId = 'test-form';
      const sessionId = 'test-session-id';
      const expectedFormData = { field1: 'value1', field2: 'value2' };

      const mockFormSession: FormSession = {
        form_id: formId,
        session_id: sessionId,
        form_data: expectedFormData,
        expires_at: 1234567890,
      };

      mockDataStore.getItem.mockResolvedValue(mockFormSession);

      const result = await formSessionService.getSession(formId, sessionId);

      expect(mockDataStore.getItem).toHaveBeenCalledWith('test_form_sessions', {
        form_id: formId,
        session_id: sessionId,
      });
      expect(result).toEqual(expectedFormData);
    });

    it('should return null when session does not exist', async () => {
      const formId = 'test-form';
      const sessionId = 'non-existent-session';

      mockDataStore.getItem.mockResolvedValue(null);

      const result = await formSessionService.getSession(formId, sessionId);

      expect(mockDataStore.getItem).toHaveBeenCalledWith('test_form_sessions', {
        form_id: formId,
        session_id: sessionId,
      });
      expect(result).toBeNull();
    });

    it('should return null when session exists but form_data is undefined', async () => {
      const formId = 'test-form';
      const sessionId = 'test-session-id';

      const mockFormSession = {
        form_id: formId,
        session_id: sessionId,
        form_data: undefined as any,
        expires_at: 1234567890,
      };

      mockDataStore.getItem.mockResolvedValue(mockFormSession);

      const result = await formSessionService.getSession(formId, sessionId);

      expect(result).toBeNull();
    });

    it('should handle empty form_data correctly', async () => {
      const formId = 'test-form';
      const sessionId = 'test-session-id';

      const mockFormSession: FormSession = {
        form_id: formId,
        session_id: sessionId,
        form_data: {},
        expires_at: 1234567890,
      };

      mockDataStore.getItem.mockResolvedValue(mockFormSession);

      const result = await formSessionService.getSession(formId, sessionId);

      expect(result).toEqual({});
    });
  });

  describe('removeSession', () => {
    beforeEach(() => {
      formSessionService = new FormSessionService(mockDataStore);
    });

    it('should remove session with correct parameters', async () => {
      const formId = 'test-form';
      const sessionId = 'test-session-id';

      await formSessionService.removeSession(formId, sessionId);

      expect(mockDataStore.removeItem).toHaveBeenCalledWith('test_form_sessions', {
        form_id: formId,
        session_id: sessionId,
      });
      expect(mockDataStore.removeItem).toHaveBeenCalledTimes(1);
    });

    it('should handle removal of non-existent session', async () => {
      const formId = 'test-form';
      const sessionId = 'non-existent-session';

      // Mock removeItem to not throw (normal behavior for non-existent items)
      mockDataStore.removeItem.mockResolvedValue();

      await formSessionService.removeSession(formId, sessionId);

      expect(mockDataStore.removeItem).toHaveBeenCalledWith('test_form_sessions', {
        form_id: formId,
        session_id: sessionId,
      });
    });

    it('should handle empty form ID and session ID', async () => {
      await formSessionService.removeSession('', '');

      expect(mockDataStore.removeItem).toHaveBeenCalledWith('test_form_sessions', {
        form_id: '',
        session_id: '',
      });
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      formSessionService = new FormSessionService(mockDataStore);
    });

    it('should handle full session lifecycle', async () => {
      const formId = 'integration-form';
      const sessionId = 'integration-session';
      const sessionData = {
        sessionId: sessionId,
        userInput: 'test data',
      };

      // Save session
      await formSessionService.saveSession(formId, sessionData);
      expect(mockDataStore.saveItem).toHaveBeenCalledTimes(1);

      // Set up mock for getSession
      const mockFormSession: FormSession = {
        form_id: formId,
        session_id: sessionId,
        form_data: sessionData,
        expires_at: 1234567890,
      };
      mockDataStore.getItem.mockResolvedValue(mockFormSession);

      // Get session
      const retrievedData = await formSessionService.getSession(formId, sessionId);
      expect(retrievedData).toEqual(sessionData);
      expect(mockDataStore.getItem).toHaveBeenCalledTimes(1);

      // Remove session
      await formSessionService.removeSession(formId, sessionId);
      expect(mockDataStore.removeItem).toHaveBeenCalledTimes(1);
    });

    it('should work with different table names from environment variable', () => {
      process.env.FORM_SESSION_TABLE_NAME = 'custom_sessions_table';

      const customService = new FormSessionService(mockDataStore);

      expect(customService).toBeDefined();
      // The table name is private, but we can test it indirectly through method calls
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      formSessionService = new FormSessionService(mockDataStore);
    });

    it('should propagate errors from data store saveItem', async () => {
      const error = new Error('Database connection failed');
      mockDataStore.saveItem.mockRejectedValue(error);

      await expect(formSessionService.saveSession('test-form', { sessionId: 'test' })).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should propagate errors from data store getItem', async () => {
      const error = new Error('Query timeout');
      mockDataStore.getItem.mockRejectedValue(error);

      await expect(formSessionService.getSession('test-form', 'test-session')).rejects.toThrow('Query timeout');
    });

    it('should propagate errors from data store removeItem', async () => {
      const error = new Error('Delete operation failed');
      mockDataStore.removeItem.mockRejectedValue(error);

      await expect(formSessionService.removeSession('test-form', 'test-session')).rejects.toThrow(
        'Delete operation failed',
      );
    });
  });
});
