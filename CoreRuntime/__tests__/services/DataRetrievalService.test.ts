import { DataRetrievalRequest, DataRetrievalService } from '../../src/services/DataRetrievalService.js';

import { ValueElement } from '../../src/service/Element.js';
import { logger } from '../../src/index.js';

// Mock the logger
jest.mock('../../src/index.js', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('DataRetrievalService', () => {
  let service: DataRetrievalService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new DataRetrievalService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('enrichData', () => {
    const mockUrl = 'https://api.example.com/data';
    const mockUserId = 'user123';

    it('should successfully enrich data with external API response', async () => {
      const mockElements: ValueElement[] = [
        { type: 'TextField', name: 'firstName', displayText: 'First Name' },
        { type: 'TextField', name: 'lastName', displayText: 'Last Name' },
      ];
      const mockData = { firstName: '', existingField: 'existing' };
      const mockApiResponse = { firstName: 'John', lastName: 'Doe' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await service.enrichData(mockUrl, mockElements, mockData, mockUserId);

      expect(logger.info).toHaveBeenCalledWith(`Enriching data with external API: ${mockUrl}`);
      expect(logger.debug).toHaveBeenCalledWith('Enriching fields:', ['firstName', 'lastName']);
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: mockUserId,
          fields: ['firstName', 'lastName'],
        }),
      });
      expect(mockData).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        existingField: 'existing',
      });
      expect(logger.info).toHaveBeenCalledWith('Successfully enriched data');
    });

    it('should work without userId when not provided', async () => {
      const mockElements: ValueElement[] = [{ type: 'TextField', name: 'email', displayText: 'Email' }];
      const mockData = { email: '' };
      const mockApiResponse = { email: 'test@example.com' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await service.enrichData(mockUrl, mockElements, mockData);

      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: ['email'],
        }),
      });
    });

    it('should return early when no properties need to be filled', async () => {
      const mockElements: ValueElement[] = [{ type: 'TextField', name: 'firstName', displayText: 'First Name' }];
      const mockData = { firstName: 'existing value' };

      await service.enrichData(mockUrl, mockElements, mockData, mockUserId);

      expect(logger.debug).toHaveBeenCalledWith('No fields to fill.');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(`Enriching data with external API: ${mockUrl}`);
      expect(logger.info).not.toHaveBeenCalledWith('Successfully enriched data');
    });

    it('should handle API errors gracefully', async () => {
      const mockElements: ValueElement[] = [{ type: 'TextField', name: 'firstName', displayText: 'First Name' }];
      const mockData = { firstName: '' };
      const mockError = new Error('Network error');

      mockFetch.mockRejectedValueOnce(mockError);

      await service.enrichData(mockUrl, mockElements, mockData, mockUserId);

      expect(logger.error).toHaveBeenCalledWith('Failed to retrieve data from external API:', mockError);
      expect(mockData).toEqual({ firstName: '' }); // Data should remain unchanged
    });

    it('should handle HTTP error responses', async () => {
      const mockElements: ValueElement[] = [{ type: 'TextField', name: 'firstName', displayText: 'First Name' }];
      const mockData = { firstName: '' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resource not found',
      } as Response);

      await service.enrichData(mockUrl, mockElements, mockData, mockUserId);

      expect(logger.error).toHaveBeenCalledWith('Failed to retrieve data from external API:', expect.any(Error));
    });
  });

  describe('makeRequest (private method)', () => {
    it('should make successful API request and return response data', async () => {
      const url = 'https://api.example.com/data';
      const requestData: DataRetrievalRequest = {
        userId: 'user123',
        fields: ['name', 'email'],
      };
      const mockResponse = { name: 'John', email: 'john@example.com' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await (service as any).makeRequest(url, requestData);

      expect(logger.debug).toHaveBeenCalledWith('Sending request to external API', requestData);
      expect(logger.debug).toHaveBeenCalledWith('Response from external API for fields:', mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for failed HTTP responses', async () => {
      const url = 'https://api.example.com/data';
      const requestData: DataRetrievalRequest = {
        fields: ['name'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error details',
      } as Response);

      await expect((service as any).makeRequest(url, requestData)).rejects.toThrow(
        'Data retrieval failed with status 500: Internal Server Error. Response body: Server error details',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Data retrieval failed with status 500: Internal Server Error. Response body: Server error details',
      );
    });
  });

  describe('getPropertiesToFill (private method)', () => {
    it('should identify missing properties for regular fields', () => {
      const elements: ValueElement[] = [
        { type: 'TextField', name: 'firstName', displayText: 'First Name' },
        { type: 'TextField', name: 'lastName', displayText: 'Last Name' },
        { type: 'TextField', name: 'email', displayText: 'Email' },
      ];
      const data = {
        firstName: 'John',
        lastName: '',
        // email is missing
      };

      const result = (service as any).getPropertiesToFill(elements, data);

      expect(result).toEqual(['lastName', 'email']);
    });

    it('should handle DatePickerField elements correctly', () => {
      const elements: ValueElement[] = [{ type: 'DatePickerField', name: 'birthDate', displayText: 'Birth Date' }];
      const data = {
        'birthDate-day': '15',
        // Missing month and year
      };

      const result = (service as any).getPropertiesToFill(elements, data);

      expect(result).toEqual(['birthDate-month', 'birthDate-year']);
    });

    it('should handle AddressField elements correctly', () => {
      const elements: ValueElement[] = [{ type: 'AddressField', name: 'homeAddress', displayText: 'Home Address' }];
      const data = {
        'homeAddress-line1': '123 Main St',
        'homeAddress-town': 'London',
        // Missing line2, county, and postcode
      };

      const result = (service as any).getPropertiesToFill(elements, data);

      expect(result).toEqual(['homeAddress-line2', 'homeAddress-county', 'homeAddress-postcode']);
    });

    it('should handle mixed element types', () => {
      const elements: ValueElement[] = [
        { type: 'TextField', name: 'firstName', displayText: 'First Name' },
        { type: 'DatePickerField', name: 'birthDate', displayText: 'Birth Date' },
        { type: 'AddressField', name: 'address', displayText: 'Address' },
        { type: 'TextField', name: 'phone', displayText: 'Phone' },
      ];
      const data = {
        firstName: 'John',
        'birthDate-day': '15',
        'address-line1': '123 Main St',
        phone: '555-1234',
      };

      const result = (service as any).getPropertiesToFill(elements, data);

      expect(result).toEqual([
        'birthDate-month',
        'birthDate-year',
        'address-line2',
        'address-town',
        'address-county',
        'address-postcode',
      ]);
    });

    it('should return empty array when all properties are filled', () => {
      const elements: ValueElement[] = [
        { type: 'TextField', name: 'firstName', displayText: 'First Name' },
        { type: 'TextField', name: 'lastName', displayText: 'Last Name' },
      ];
      const data = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = (service as any).getPropertiesToFill(elements, data);

      expect(result).toEqual([]);
    });

    it('should handle empty elements array', () => {
      const elements: ValueElement[] = [];
      const data = { someField: 'value' };

      const result = (service as any).getPropertiesToFill(elements, data);

      expect(result).toEqual([]);
    });

    it('should handle elements with falsy but defined values', () => {
      const elements: ValueElement[] = [
        { type: 'TextField', name: 'count', displayText: 'Count' },
        { type: 'TextField', name: 'flag', displayText: 'Flag' },
        { type: 'TextField', name: 'empty', displayText: 'Empty' },
        { type: 'TextField', name: 'missing', displayText: 'Missing' },
      ];
      const data = {
        count: 0,
        flag: false,
        empty: '',
        // missing field should be included
      };

      const result = (service as any).getPropertiesToFill(elements, data);

      // All falsy values (0, false, '', undefined) are considered missing by the implementation
      expect(result).toEqual(['count', 'flag', 'empty', 'missing']);
    });
  });

  describe('integration tests', () => {
    it('should handle complex scenario with multiple field types', async () => {
      const mockUrl = 'https://api.example.com/data';
      const mockElements: ValueElement[] = [
        { type: 'TextField', name: 'firstName', displayText: 'First Name' },
        { type: 'DatePickerField', name: 'birthDate', displayText: 'Birth Date' },
        { type: 'AddressField', name: 'address', displayText: 'Address' },
      ];
      const mockData = {
        firstName: 'John',
        'birthDate-day': '',
        'address-line1': '',
      };
      const mockApiResponse = {
        'birthDate-day': '15',
        'birthDate-month': '06',
        'birthDate-year': '1990',
        'address-line1': '123 Main St',
        'address-line2': 'Apt 4B',
        'address-town': 'London',
        'address-county': 'Greater London',
        'address-postcode': 'SW1A 1AA',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await service.enrichData(mockUrl, mockElements, mockData);

      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: [
            'birthDate-day',
            'birthDate-month',
            'birthDate-year',
            'address-line1',
            'address-line2',
            'address-town',
            'address-county',
            'address-postcode',
          ],
        }),
      });

      expect(mockData).toEqual({
        firstName: 'John',
        ...mockApiResponse,
      });
    });
  });
});
