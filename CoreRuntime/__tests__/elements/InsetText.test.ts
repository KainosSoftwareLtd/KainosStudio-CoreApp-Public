import InsetText from '../../src/elements/InsetText.js';

describe('InsetText', () => {
  describe('constructor', () => {
    it('should create InsetText with correct properties', () => {
      const displayText = 'Test inset text';

      const insetText = new InsetText(displayText);

      expect(insetText.type).toBe('InsetText');
      expect(insetText.displayText).toBe(displayText);
    });

    it('should handle empty display text', () => {
      const displayText = '';

      const insetText = new InsetText(displayText);

      expect(insetText.displayText).toBe('');
    });

    it('should handle display text with HTML content', () => {
      const displayText = '<p>Text with <strong>bold</strong> content</p>';

      const insetText = new InsetText(displayText);

      expect(insetText.displayText).toBe(displayText);
    });
  });
});