import Form from '../../src/elements/Form.js';
import { Element } from '../../src/service/Element.js';

describe('Form', () => {
  describe('constructor', () => {
    it('should create Form with correct properties', () => {
      const elements: Element[] = [
        { type: 'TestElement1' },
        { type: 'TestElement2' }
      ];

      const form = new Form(elements);

      expect(form.type).toBe('Form');
      expect(form.elements).toBe(elements);
    });

    it('should handle empty elements array', () => {
      const elements: Element[] = [];

      const form = new Form(elements);

      expect(form.elements).toHaveLength(0);
    });

    it('should maintain elements order', () => {
      const elements: Element[] = [
        { type: 'First' },
        { type: 'Second' },
        { type: 'Third' }
      ];

      const form = new Form(elements);

      expect(form.elements[0].type).toBe('First');
      expect(form.elements[1].type).toBe('Second');
      expect(form.elements[2].type).toBe('Third');
    });
  });
});