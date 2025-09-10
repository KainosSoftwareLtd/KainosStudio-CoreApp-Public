import { logger } from '../index.js';

/**
 * Checks if a cookie value needs URL decoding (contains %XX patterns)
 */
function needsDecoding(cookieValue: string): boolean {
  return /%[0-9A-Fa-f]{2}/.test(cookieValue);
}

/**
 * Validates if a decoded cookie value looks reasonable for decryption
 */
function isValidCookieFormat(cookieValue: string): boolean {
  if (!cookieValue || cookieValue.trim().length === 0) {
    return false;
  }
  
  const trimmed = cookieValue.trim();
  
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/; // bas64 for prod
  const jsonPattern = /^[{[].*[}\]]$/; // json for dev
  
  return base64Pattern.test(trimmed) || jsonPattern.test(trimmed);
}

/**
 * Decodes URL-encoded cookie values, handling multiple levels of encoding
 * that may occur in Azure Functions environments
 */
export function decodeUrlEncodedCookie(encryptedReference: string): string {
  let decodedReference = encryptedReference;
  let decodeAttempts = 0;
  const maxDecodeAttempts = 3;
  
  while (needsDecoding(decodedReference) && decodeAttempts < maxDecodeAttempts) {
    try {
      const previousValue = decodedReference;
      decodedReference = decodeURIComponent(decodedReference);
      decodeAttempts++;
      
      logger.info(`Applied URL decoding attempt ${decodeAttempts}`);
      logger.debug(`Decode ${decodeAttempts}: ${decodedReference}`);
      
      if (previousValue === decodedReference) {
        logger.warn('Decoding did not change the value, stopping decode loop');
        break;
      }
      
    } catch (decodeError: any) {
      logger.warn(`Failed to decode on attempt ${decodeAttempts + 1}: ${decodeError.toString()}`);
      break;
    }
  }
  
  if (decodeAttempts >= maxDecodeAttempts) {
    logger.warn(`Reached maximum decode attempts (${maxDecodeAttempts}), using current result`);
  }
  
  if (isValidCookieFormat(decodedReference)) {
    return decodedReference;
  } else {
    logger.warn('Decoded cookie appears invalid, keeping original');
    return encryptedReference;
  }
}
