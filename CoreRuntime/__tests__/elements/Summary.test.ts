import { Context } from '../../src/context/index.js';
import Summary from '../../src/elements/Summary.js';

describe('Summary', () => {
  describe('constructor', () => {
    it('should create Summary with correct properties', () => {
      const title = 'Test Summary';
      const fieldNames = ['field1', 'field2'];
      
      const summary = new Summary(title, fieldNames);
      
      expect(summary.type).toBe('Summary');
      expect(summary.title).toBe(title);
      expect(summary.fieldNames).toEqual(fieldNames);
      expect(summary.ancillaryItems).toEqual([]);
      expect(summary.summaryDataItems).toEqual([]);
    });
  });

  describe('formatAddress', () => {
    const mockContext = {
      data: {
        'test-line1': '123 Test Street',
        'test-line2': 'Apt 4B',
        'test-town': 'Test Town',
        'test-county': 'Test County',
        'test-postcode': 'TE1 1ST'
      }
    } as unknown as Context;

    it('should format full address with all fields', () => {
      const result = Summary.formatAddress(mockContext, 'test');
      expect(result).toBe('123 Test Street, Apt 4B, Test Town, TE1 1ST, Test County');
    });

    it('should format address without line2', () => {
      const contextWithoutLine2 = {
        data: {
          'test-line1': '123 Test Street',
          'test-town': 'Test Town',
          'test-county': 'Test County',
          'test-postcode': 'TE1 1ST'
        }
      } as unknown as Context;

      const result = Summary.formatAddress(contextWithoutLine2, 'test');
      expect(result).toBe('123 Test Street, Test Town, TE1 1ST, Test County');
    });

    it('should format address without county', () => {
      const contextWithoutCounty = {
        data: {
          'test-line1': '123 Test Street',
          'test-line2': 'Apt 4B',
          'test-town': 'Test Town',
          'test-postcode': 'TE1 1ST'
        }
      } as unknown as Context;

      const result = Summary.formatAddress(contextWithoutCounty, 'test');
      expect(result).toBe('123 Test Street, Apt 4B, Test Town, TE1 1ST');
    });

    it('should handle missing fields', () => {
      const emptyContext = {
        data: {}
      } as Context;

      const result = Summary.formatAddress(emptyContext, 'test');
      expect(result).toBe(', , ');
    });
  });
});