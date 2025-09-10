import { Action } from '../../src/service/Element.js';
import SubmitButton from '../../src/elements/SubmitButton.js';

describe('SubmitButton', () => {
  describe('constructor', () => {
    it('should create SubmitButton with correct properties', () => {
      const displayText = 'Submit Form';
      const action: Action = {
        value: 'submit',
      };
      const classes = 'button-primary';

      const submitButton = new SubmitButton(displayText, action, classes);

      expect(submitButton.type).toBe('SubmitButton');
      expect(submitButton.displayText).toBe(displayText);
      expect(submitButton.action).toBe(action);
      expect(submitButton.classes).toBe(classes);
    });

    it('should handle empty classes string', () => {
      const displayText = 'Submit';
      const action: Action = {
        value: 'submit',
      };
      const classes = '';

      const submitButton = new SubmitButton(displayText, action, classes);

      expect(submitButton.classes).toBe('');
    });

    it('should handle action with redirect', () => {
      const displayText = 'Next';
      const action: Action = {
        value: 'next',
        redirect: '/next-page',
      };
      const classes = 'button-next';

      const submitButton = new SubmitButton(displayText, action, classes);

      expect(submitButton.action.redirect).toBe('/next-page');
    });
  });
});
