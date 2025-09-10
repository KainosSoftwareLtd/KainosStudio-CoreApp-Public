import Panel from '../../src/elements/Panel.js';

describe('Panel', () => {
  describe('constructor', () => {
    it('should create Panel with correct properties', () => {
      const title = 'Test Panel';
      const text = 'Panel content';

      const panel = new Panel(title, text);

      expect(panel.type).toBe('Panel');
      expect(panel.title).toBe(title);
      expect(panel.text).toBe(text);
    });

    it('should handle empty strings', () => {
      const title = '';
      const text = '';

      const panel = new Panel(title, text);

      expect(panel.title).toBe('');
      expect(panel.text).toBe('');
    });

    it('should handle special characters and HTML in text', () => {
      const title = 'Special Panel &amp;';
      const text = '<p>Text with <strong>HTML</strong> &amp; special chars</p>';

      const panel = new Panel(title, text);

      expect(panel.title).toBe(title);
      expect(panel.text).toBe(text);
    });
  });
});