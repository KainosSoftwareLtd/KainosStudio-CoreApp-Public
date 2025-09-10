import Phase from '../../src/elements/Phase.js';

describe('Phase', () => {
  describe('constructor', () => {
    it('should create Phase with correct properties', () => {
      const name = 'beta';
      const displayText = 'Beta Phase';

      const phase = new Phase(name, displayText);

      expect(phase.type).toBe('Phase');
      expect(phase.name).toBe(name);
      expect(phase.displayText).toBe(displayText);
    });

    it('should handle empty strings', () => {
      const name = '';
      const displayText = '';

      const phase = new Phase(name, displayText);

      expect(phase.name).toBe('');
      expect(phase.displayText).toBe('');
    });

    it('should handle special characters in displayText', () => {
      const name = 'alpha';
      const displayText = 'Alpha Phase (β)';

      const phase = new Phase(name, displayText);

      expect(phase.displayText).toBe(displayText);
    });
  });
});