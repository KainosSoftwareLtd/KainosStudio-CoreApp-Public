import Postcode from '../../src/elements/PostcodeNumber.js';

describe('Postcode', () => {
  describe('constructor', () => {
    it('should create Postcode with correct properties', () => {
      // Arrange
      const displayText = 'Enter Postcode';
      const name = 'postcode-field';
      const classes = 'postcode-input';

      // Act
      const postcode = new Postcode(displayText, name, classes);

      // Assert
      expect(postcode.type).toBe('PostcodeField');
      expect(postcode.displayText).toBe(displayText);
      expect(postcode.name).toBe(name);
      expect(postcode.classes).toBe(classes);
    });

    it('should handle empty classes string', () => {
      // Arrange
      const displayText = 'Postcode';
      const name = 'postcode1';
      const classes = '';

      // Act
      const postcode = new Postcode(displayText, name, classes);

      // Assert
      expect(postcode.classes).toBe('');
    });

    it('should handle special characters in displayText', () => {
      // Arrange
      const displayText = 'Post-code (Required)*';
      const name = 'postcode2';
      const classes = 'required-field';

      // Act
      const postcode = new Postcode(displayText, name, classes);

      // Assert
      expect(postcode.displayText).toBe(displayText);
    });
  });
});