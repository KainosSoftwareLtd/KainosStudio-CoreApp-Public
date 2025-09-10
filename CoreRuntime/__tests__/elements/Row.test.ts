import Row from '../../src/elements/Row.js';
import { Element } from '../../src/service/Element.js';

describe('Row', () => {
  describe('constructor', () => {
    it('should create Row with correct properties', () => {
      const columnWidths = [1, 2, 3];
      const elements: Element[] = [
        { type: 'TestElement1' },
        { type: 'TestElement2' },
        { type: 'TestElement3' }
      ];

      const row = new Row(columnWidths, elements);

      expect(row.type).toBe('Row');
      expect(row.columnWidths).toEqual(columnWidths);
      expect(row.elements).toEqual(elements);
    });

    it('should handle empty elements array', () => {
      const columnWidths = [1];
      const elements: Element[] = [];

      const row = new Row(columnWidths, elements);

      expect(row.elements).toHaveLength(0);
      expect(row.columnWidths).toEqual(columnWidths);
    });

    it('should have correct fraction words array', () => {
      const row = new Row([], []);

      expect(row.fractionWords).toEqual([
        'zero',
        'one-twelfth',
        'one-sixth',
        'one-quarter',
        'one-third',
        'five-twelfths',
        'one-half',
        'seven-twelfths',
        'two-thirds',
        'three-quarters',
        'five-sixths',
        'full'
      ]);
    });

    it('should handle empty column widths array', () => {
      const columnWidths: number[] = [];
      const elements: Element[] = [
        { type: 'TestElement1' }
      ];

      const row = new Row(columnWidths, elements);

      expect(row.columnWidths).toHaveLength(0);
      expect(row.elements).toHaveLength(1);
    });
  });
});