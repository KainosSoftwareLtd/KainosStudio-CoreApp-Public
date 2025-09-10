import Details from '../../src/elements/Details.js';

describe('Details', () => {
  describe('constructor', () => {
    it('should create Details with correct properties', () => {
      const summaryText = 'Click for more info';
      const text = 'Detailed information here';

      const details = new Details(summaryText, text);

      expect(details.type).toBe('Details');
      expect(details.summaryText).toBe(summaryText);
      expect(details.text).toBe(text);
    });

    it('should handle empty strings', () => {
      const summaryText = '';
      const text = '';

      const details = new Details(summaryText, text);

      expect(details.summaryText).toBe('');
      expect(details.text).toBe('');
    });

    it('should handle HTML content in text', () => {
      const summaryText = 'See details';
      const text = '<p>Content with <strong>HTML</strong> formatting</p>';

      const details = new Details(summaryText, text);

      expect(details.text).toBe(text);
    });
  });
});