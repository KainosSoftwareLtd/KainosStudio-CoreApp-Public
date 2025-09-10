import CryptoJS from 'crypto-js';
import { Service } from '../../src/service/Service.js';
import { SessionManager } from '../../src/context/SessionManager.js';
import { sessionIdKey } from '../../src/consts.js';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

interface SessionData {
  [key: string]: any;
  [sessionIdKey]?: string;
}

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let service: Service;

  beforeEach(() => {
    sessionManager = new SessionManager();
    service = new Service();
  });

  describe('loadSession', () => {
    it('should decode the encrypted reference using the service cookie secret', () => {
      const encryptedReference = CryptoJS.AES.encrypt(
        JSON.stringify({ key: 'value' }),
        service.cookieSecret,
      ).toString();
      const result = sessionManager.decodeSession(encryptedReference, service);

      expect(result).toEqual({ key: 'value' });
    });
  });

  describe('saveSession', () => {
    it('should encode the data without adding a session ID if already present', () => {
      const data: SessionData = { key: 'value', [sessionIdKey]: 'existing-uuid' };
      const result = sessionManager.encodeSession(data, service);

      const decodedResult = sessionManager['decode'](result, service.cookieSecret);
      expect(decodedResult).toEqual(data);
    });
  });

  describe('encode', () => {
    it('should return JSON string in development environment', () => {
      process.env.NODE_ENV = 'dev';
      const obj = { key: 'value' };
      const result = sessionManager['encode'](obj, service.cookieSecret);

      expect(result).toBe(JSON.stringify(obj));
    });

    it('should return encrypted string in non-development environment', () => {
      process.env.NODE_ENV = 'production';
      const obj = { key: 'value' };
      const result = sessionManager['encode'](obj, service.cookieSecret);

      const bytes = CryptoJS.AES.decrypt(result, service.cookieSecret);
      const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      expect(decrypted).toEqual(obj);
    });
  });

  describe('decode', () => {
    it('should parse JSON string in development environment', () => {
      process.env.NODE_ENV = 'dev';
      const str = JSON.stringify({ key: 'value' });
      const result = sessionManager['decode'](str, service.cookieSecret);

      expect(result).toEqual({ key: 'value' });
    });

    it('should decrypt and parse string in non-development environment', () => {
      process.env.NODE_ENV = 'production';
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify({ key: 'value' }), service.cookieSecret).toString();
      const result = sessionManager['decode'](encrypted, service.cookieSecret);

      expect(result).toEqual({ key: 'value' });
    });
  });
});
