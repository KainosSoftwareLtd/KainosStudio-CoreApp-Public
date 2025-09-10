import PhoneNumber from '../../src/elements/PhoneNumber.js';

describe('PhoneNumber', () => {
  describe('constructor', () => {
    it('should create PhoneNumber with correct properties', () => {
      const displayText = 'Phone Number';
      const name = 'contact-phone';
      const classes = 'phone-input';

      const phoneNumber = new PhoneNumber(displayText, name, classes);

      expect(phoneNumber.type).toBe('PhoneNumberField');
      expect(phoneNumber.displayText).toBe(displayText);
      expect(phoneNumber.name).toBe(name);
      expect(phoneNumber.classes).toBe(classes);
    });

    it('should handle empty classes string', () => {
      const displayText = 'Mobile Number';
      const name = 'mobile';
      const classes = '';

      const phoneNumber = new PhoneNumber(displayText, name, classes);

      expect(phoneNumber.classes).toBe('');
    });

    it('should handle special characters in displayText', () => {
      const displayText = 'Phone Number (Required)*';
      const name = 'phone';
      const classes = 'required-field';

      const phoneNumber = new PhoneNumber(displayText, name, classes);

    });
  });
});