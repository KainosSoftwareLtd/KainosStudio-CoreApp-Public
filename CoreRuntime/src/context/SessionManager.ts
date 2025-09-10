import CryptoJS from 'crypto-js';
import { Service } from '../service/index.js';

export class SessionManager {
  public decodeSession(encryptedReference: string, service: Service) {
    return this.decode(encryptedReference, service.cookieSecret);
  }

  public encodeSession(data: Record<string, string>, service: Service): string {
    return this.encode(data, service.cookieSecret);
  }

  private encode(obj: Record<string, string>, secret: string): string {
    if (process.env.NODE_ENV === 'dev') {
      return JSON.stringify(obj);
    }
    return CryptoJS.AES.encrypt(JSON.stringify(obj), secret).toString();
  }

  private decode(str: string, secret: string): Record<string, string> {
    if (process.env.NODE_ENV === 'dev') {
      return JSON.parse(str);
    }
    const bytes = CryptoJS.AES.decrypt(str, secret);
    const asString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(asString);
  }
}
