import BackButton from '../../src/elements/BackButton.js';

describe('BackButton', () => {
  describe('constructor', () => {
    it('should create BackButton with correct properties', () => {
      // Arrange
      const displayText = 'Go Back';
      const classes = 'back-button-primary';

      // Act
      const backButton = new BackButton(displayText, classes);

      // Assert
      expect(backButton.type).toBe('BackButton');
      expect(backButton.displayText).toBe(displayText);
      expect(backButton.href).toBe('#');
      expect(backButton.classes).toBe(classes);
    });

    it('should use default displayText when empty string provided', () => {
      // Arrange
      const displayText = '';
      const classes = 'back-button';

      // Act
      const backButton = new BackButton(displayText, classes);

      // Assert
      expect(backButton.displayText).toBe('core:back-button.link-text');
    });

    it('should handle empty classes string', () => {
      // Arrange
      const displayText = 'Back';
      const classes = '';

      // Act
      const backButton = new BackButton(displayText, classes);

      // Assert
      expect(backButton.classes).toBe('');
    });
  });
});