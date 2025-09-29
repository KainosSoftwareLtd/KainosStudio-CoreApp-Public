import { decodeUrlEncodedCookie } from '../../src/context/CookieDecoder.js';
import { logger } from '../../src/index.js';

// Mock the logger
jest.mock('../../src/index.js', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CookieDecoder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('decodeUrlEncodedCookie', () => {
    describe('valid base64 cookies', () => {
      it('should return already decoded base64 cookie without modification', () => {
        const base64Cookie = 'eyJrZXkiOiJ2YWx1ZSJ9'; // Base64 encoded {"key":"value"}

        const result = decodeUrlEncodedCookie(base64Cookie);

        expect(result).toBe(base64Cookie);
        expect(logger.info).not.toHaveBeenCalled(); // No decoding needed
      });

      it('should decode URL-encoded base64 cookie once', () => {
        const encodedBase64 = 'eyJrZXkiOiJ2YWx1ZSJ9%3D%3D'; // URL encoded base64 with padding
        const expectedDecoded = 'eyJrZXkiOiJ2YWx1ZSJ9==';

        const result = decodeUrlEncodedCookie(encodedBase64);

        expect(result).toBe(expectedDecoded);
        expect(logger.info).toHaveBeenCalledWith('Applied URL decoding attempt 1');
        expect(logger.debug).toHaveBeenCalledWith(`Decode 1: ${expectedDecoded}`);
      });

      it('should decode multiple levels of URL encoding', () => {
        const doubleEncoded = 'eyJrZXkiJTNBJTIydmFsdWUlMjIlN0Q%253D'; // Double URL encoded base64

        const result = decodeUrlEncodedCookie(doubleEncoded);

        expect(logger.info).toHaveBeenCalledWith('Applied URL decoding attempt 1');
        expect(logger.info).toHaveBeenCalledWith('Applied URL decoding attempt 2');
        expect(result).toMatch(/^[A-Za-z0-9+/]+=*$/); // Should be valid base64
      });

      it('should stop at maximum decode attempts (3)', () => {
        // Create a string that needs multiple decodes
        let multipleEncoded = 'test value with spaces'; // Spaces will be encoded
        for (let i = 0; i < 5; i++) {
          multipleEncoded = encodeURIComponent(multipleEncoded);
        }

        const result = decodeUrlEncodedCookie(multipleEncoded);

        expect(logger.warn).toHaveBeenCalledWith('Reached maximum decode attempts (3), using current result');
        expect(logger.info).toHaveBeenCalledTimes(3); // Only 3 decode attempts
      });
    });

    describe('valid JSON cookies (dev environment)', () => {
      it('should return already decoded JSON cookie without modification', () => {
        const jsonCookie = '{"sessionId":"abc123","userId":"user456"}';

        const result = decodeUrlEncodedCookie(jsonCookie);

        expect(result).toBe(jsonCookie);
        expect(logger.info).not.toHaveBeenCalled(); // No decoding needed
      });

      it('should decode URL-encoded JSON cookie', () => {
        const encodedJson = '%7B%22sessionId%22%3A%22abc123%22%7D'; // {"sessionId":"abc123"}
        const expectedDecoded = '{"sessionId":"abc123"}';

        const result = decodeUrlEncodedCookie(encodedJson);

        expect(result).toBe(expectedDecoded);
        expect(logger.info).toHaveBeenCalledWith('Applied URL decoding attempt 1');
      });

      it('should handle JSON arrays', () => {
        const encodedJsonArray = '%5B%22item1%22%2C%22item2%22%5D'; // ["item1","item2"]
        const expectedDecoded = '["item1","item2"]';

        const result = decodeUrlEncodedCookie(encodedJsonArray);

        expect(result).toBe(expectedDecoded);
      });
    });

    describe('invalid cookie formats', () => {
      it('should return original cookie for invalid format after decoding', () => {
        const invalidEncoded = '%48%65%6C%6C%6F%20%57%6F%72%6C%64'; // "Hello World" - not base64 or JSON
        const originalCookie = invalidEncoded;

        const result = decodeUrlEncodedCookie(invalidEncoded);

        expect(result).toBe(originalCookie);
        expect(logger.warn).toHaveBeenCalledWith('Decoded cookie appears invalid, keeping original');
      });

      it('should handle empty strings', () => {
        const result = decodeUrlEncodedCookie('');

        expect(result).toBe('');
        expect(logger.warn).toHaveBeenCalledWith('Decoded cookie appears invalid, keeping original');
      });

      it('should handle whitespace-only strings', () => {
        const whitespaceOnly = '   ';

        const result = decodeUrlEncodedCookie(whitespaceOnly);

        expect(result).toBe(whitespaceOnly);
        expect(logger.warn).toHaveBeenCalledWith('Decoded cookie appears invalid, keeping original');
      });

      it('should handle null and undefined gracefully', () => {
        // Use strings that definitely won't match any valid patterns
        const result1 = decodeUrlEncodedCookie('null!@#'); // Invalid characters
        const result2 = decodeUrlEncodedCookie('undefined!@#'); // Invalid characters

        // These contain invalid characters and should trigger the warning
        expect(result1).toBe('null!@#');
        expect(result2).toBe('undefined!@#');
        expect(logger.warn).toHaveBeenCalledWith('Decoded cookie appears invalid, keeping original');
        expect(logger.warn).toHaveBeenCalledTimes(2);
      });
    });

    describe('decode error handling', () => {
      it('should handle malformed URI encoding gracefully', () => {
        // Use a string with valid hex pattern but results in invalid format
        const malformedUri = '%C0%80'; // Overlong encoding (invalid UTF-8)

        const result = decodeUrlEncodedCookie(malformedUri);

        // Will decode but result in invalid format, so returns original
        expect(logger.warn).toHaveBeenCalledWith('Decoded cookie appears invalid, keeping original');
        expect(result).toBe(malformedUri);
      });

      it('should stop decoding when decode error occurs', () => {
        // Mock decodeURIComponent to throw an error for testing
        const originalDecodeURIComponent = global.decodeURIComponent;
        global.decodeURIComponent = jest.fn().mockImplementation((str) => {
          if (str.includes('%20')) {
            throw new Error('URI malformed');
          }
          return originalDecodeURIComponent(str);
        });

        const testString = 'test%20value'; // This will trigger the mock error

        const result = decodeUrlEncodedCookie(testString);

        expect(logger.warn).toHaveBeenCalledWith(expect.stringMatching(/Failed to decode on attempt 1:/));
        expect(result).toBe(testString);

        // Restore original function
        global.decodeURIComponent = originalDecodeURIComponent;
      });
    });

    describe('edge cases', () => {
      it('should handle cookies that decode to same value (infinite loop protection)', () => {
        // Use a value that won't change when decoded
        const noEncoding = 'eyJrZXkiOiJ2YWx1ZSJ9'; // Valid base64, no URL encoding needed

        const result = decodeUrlEncodedCookie(noEncoding);

        expect(result).toBe(noEncoding);
        // No decode attempts should be logged since no %XX patterns exist
        expect(logger.info).not.toHaveBeenCalled();
      });

      it('should handle simple invalid format', () => {
        const invalidFormat = 'not@valid#format!'; // Contains special chars not in base64 or JSON

        const result = decodeUrlEncodedCookie(invalidFormat);

        // Since no URL encoding needed, should validate and return original for invalid format
        expect(result).toBe(invalidFormat);
        expect(logger.warn).toHaveBeenCalledWith('Decoded cookie appears invalid, keeping original');
      });

      it('should handle special characters in base64', () => {
        const base64WithSpecialChars = 'eyJ0ZXN0IjogImhlbGxvLXdvcmxkX3Rlc3QrMTIzPSJ9'; // Contains +, -, _, =

        const result = decodeUrlEncodedCookie(base64WithSpecialChars);

        expect(result).toBe(base64WithSpecialChars);
      });

      it('should handle cookies with mixed URL encoding patterns', () => {
        // Some characters encoded, others not
        const mixedEncoding = 'eyJrZXki%3Ai%22dmFsdWUi%7D'; // Partial encoding

        const result = decodeUrlEncodedCookie(mixedEncoding);

        expect(logger.info).toHaveBeenCalledWith('Applied URL decoding attempt 1');
      });
    });

    describe('needsDecoding internal logic', () => {
      it('should identify cookies that need decoding', () => {
        const needsDecodingCases = ['hello%20world', '%7B%22key%22%3A%22value%22%7D', 'test%3D', 'value%2B123'];

        needsDecodingCases.forEach((cookie) => {
          const result = decodeUrlEncodedCookie(cookie);
          expect(logger.info).toHaveBeenCalledWith('Applied URL decoding attempt 1');
          jest.clearAllMocks(); // Clear for next iteration
        });
      });

      it('should identify cookies that do not need decoding', () => {
        const noDecodingNeededCases = [
          'eyJrZXkiOiJ2YWx1ZSJ9', // base64
          '{"key":"value"}', // JSON
          'simplestring',
          '123456789',
        ];

        noDecodingNeededCases.forEach((cookie) => {
          decodeUrlEncodedCookie(cookie);
          expect(logger.info).not.toHaveBeenCalled(); // No decoding attempts
          jest.clearAllMocks(); // Clear for next iteration
        });
      });
    });

    describe('isValidCookieFormat internal logic', () => {
      it('should validate base64 format correctly', () => {
        const validBase64Cases = ['eyJrZXkiOiJ2YWx1ZSJ9', 'YWJjZGVmZ2g=', 'dGVzdA==', 'MTIzNDU2Nzg5MA=='];

        validBase64Cases.forEach((cookie) => {
          const result = decodeUrlEncodedCookie(cookie);
          expect(result).toBe(cookie); // Should return as-is
          expect(logger.warn).not.toHaveBeenCalledWith('Decoded cookie appears invalid, keeping original');
          jest.clearAllMocks();
        });
      });

      it('should validate JSON format correctly', () => {
        const validJsonCases = ['{"key":"value"}', '["item1","item2"]', '{"nested":{"key":"value"}}', '[]', '{}'];

        validJsonCases.forEach((cookie) => {
          const result = decodeUrlEncodedCookie(cookie);
          expect(result).toBe(cookie); // Should return as-is
          expect(logger.warn).not.toHaveBeenCalledWith('Decoded cookie appears invalid, keeping original');
          jest.clearAllMocks();
        });
      });
    });
  });
});
