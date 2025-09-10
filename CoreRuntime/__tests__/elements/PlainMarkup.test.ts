import PlainMarkup from '../../src/elements/PlainMarkup.js';

describe('PlainMarkup', () => {
  describe('constructor', () => {
    it('should create PlainMarkup with correct properties', () => {
      const markup = '<div>Test markup</div>';

      const plainMarkup = new PlainMarkup(markup);

      expect(plainMarkup.type).toBe('PlainMarkup');
      expect(plainMarkup.markup).toBe(markup);
    });

    it('should handle empty markup string', () => {
      const markup = '';

      const plainMarkup = new PlainMarkup(markup);

      expect(plainMarkup.markup).toBe('');
    });

    it('should handle complex HTML markup', () => {
      const markup = `
        <div class="test-class">
          <h1>Test Header</h1>
          <p>Test paragraph with <strong>bold</strong> text</p>
        </div>
      `;

      const plainMarkup = new PlainMarkup(markup);

      expect(plainMarkup.markup).toBe(markup);
    });
  });
});