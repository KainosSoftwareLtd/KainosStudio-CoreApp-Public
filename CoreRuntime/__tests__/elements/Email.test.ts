import Email from '../../src/elements/Email.js';

describe('Email', () => {
  describe('constructor', () => {
    it('should create Email with correct properties', () => {
      const displayText = 'Enter email address';
      const name = 'email-field';
      const classes = 'email-input';

      const email = new Email(displayText, name, classes);

      expect(email.type).toBe('Email');
      expect(email.displayText).toBe(displayText);
      expect(email.name).toBe(name);
      expect(email.classes).toBe(classes);
    });

    it('should handle empty classes string', () => {
      const displayText = 'Email';
      const name = 'contact-email';
      const classes = '';

      const email = new Email(displayText, name, classes);

      expect(email.classes).toBe('');
    });

    it('should handle special characters in displayText', () => {
      const displayText = 'Email address (Required)*';
      const name = 'required-email';
      const classes = 'required-field';

      const email = new Email(displayText, name, classes);

      expect(email.displayText).toBe(displayText);
    });
  });
});