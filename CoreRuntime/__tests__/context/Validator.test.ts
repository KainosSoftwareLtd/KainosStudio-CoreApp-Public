import { FunctionValidation, RegexValidation, Validation } from '../../src/service/Validation.js';

import { Context } from '../../src/context/index.js';
import { Validator } from '../../src/context/Validator.js';
import { ValueElement } from '../../src/service/Element.js';

describe('Validator', () => {
  let validator: Validator;
  let context: Context;
  let page: any;

  beforeEach(() => {
    validator = new Validator();
    context = {
      data: {},
      newFiles: [],
    } as unknown as Context;
    page = {
      allElements: [],
      valid: true,
      invalidElements: [],
    };
  });

  describe('validatePage', () => {
    it('should validate a page with valid elements', async () => {
      const element: ValueElement = {
        type: 'TextField',
        name: 'testField',
        value: 'testValue',
        validation: {
          regex: '^[a-z]+$',
          error: 'Invalid value',
        },
        displayText: '',
      };
      page.allElements.push(element);
      context.data[element.name] = 'testValue';

      await validator.validatePage(page, context);

      expect(page.invalidElements).toHaveLength(1);
    });

    it('should validate a DatePickerField with valid date', async () => {
      const element: ValueElement = {
        type: 'DatePickerField',
        name: 'testDate',
        validation: {
          regex: '',
          error: 'Invalid value',
        },
        displayText: '',
      };
      page.allElements.push(element);
      context.data['testDate-day'] = '01';
      context.data['testDate-month'] = '01';
      context.data['testDate-year'] = '2020';

      await validator.validatePage(page, context);

      expect(page.valid).toBe(true);
      expect(page.invalidElements).toHaveLength(0);
    });

    it('should validate AddressField with invalid postcode', async () => {
      const element: ValueElement = {
        type: 'AddressField',
        name: 'testAddress',
        displayText: '',
        validation: {
          regex: '',
          error: 'Invalid address',
        },
      };
      page.allElements.push(element);
      context.data['testAddress-line1'] = '123 Test St';
      context.data['testAddress-town'] = 'Test Town';
      context.data['testAddress-postcode'] = 'INVALID';

      await validator.validatePage(page, context);

      expect(page.valid).toBe(false);
      expect(element.invalid).toBe(true);
    });

    it('should validate PhoneNumberField with default validation', async () => {
      const element: ValueElement = {
        type: 'PhoneNumberField',
        name: 'testPhone',
        value: '1234',
        displayText: 'Phone number',
        validation: {
          regex: '',
          error: '',
        },
      };
      page.allElements.push(element);

      await validator.validatePage(page, context);

      expect(page.valid).toBe(false);
      if (element.validation) {
        expect(element.validation.error).toBe('core:phone-number-input.invalid-error');
      }
    });

    it('should validate EmailField with default validation', async () => {
      const element: ValueElement = {
        type: 'EmailField',
        name: 'testEmail',
        value: 'invalid-email',
        displayText: 'Email',
        validation: {
          regex: '',
          error: '',
        },
      };
      page.allElements.push(element);

      await validator.validatePage(page, context);

      expect(page.valid).toBe(false);
      if (element.validation) {
        expect(element.validation.error).toBe('core:email-input.invalid-error');
      }
    });
  });

  describe('date validation', () => {
    it('should validate individual date components', async () => {
      const element: ValueElement = {
        type: 'DatePickerField',
        name: 'testDate',
        displayText: 'Test Date',
        validation: {
          regex: '',
          error: 'Invalid date',
        },
      };
      page.allElements.push(element);
      context.data['testDate-day'] = '35';
      context.data['testDate-month'] = '13';
      context.data['testDate-year'] = '999';

      await validator.validatePage(page, context);

      expect(page.valid).toBe(false);
      expect(element.invalid).toBe(true);
    });

    it('should validate date as a whole', async () => {
      const element: ValueElement = {
        type: 'DatePickerField',
        name: 'testDate',
        displayText: 'Test Date',
        validation: {
          regex: '',
          error: 'Invalid date',
        },
      };
      page.allElements.push(element);
      context.data['testDate-day'] = '31';
      context.data['testDate-month'] = '02';
      context.data['testDate-year'] = '2023';

      await validator.validatePage(page, context);

      expect(page.valid).toBe(false);
      expect(element.invalid).toBe(true);
    });
  });

  describe('validate', () => {
    it('should validate using a regex validation', async () => {
      const validation: RegexValidation = {
        regex: '^[a-z]+$',
        error: 'Invalid value',
      };
      const result = await validator.validate(validation, 'test', context);

      expect(result).toBe(true);
    });

    it('should invalidate using a regex validation', async () => {
      const validation: RegexValidation = {
        regex: '^[a-z]+$',
        error: 'Invalid value',
      };
      const result = await validator.validate(validation, '123', context);

      expect(result).toBe(false);
    });

    it('should validate using a function validation', async () => {
      const validation: FunctionValidation = {
        validator: jest.fn().mockResolvedValue(true),
        error: 'Invalid value',
      };
      const result = await validator.validate(validation, 'test', context);

      expect(result).toBe(true);
      expect(validation.validator).toHaveBeenCalledWith('test', context);
    });

    it('should invalidate using a function validation', async () => {
      const validation: FunctionValidation = {
        validator: jest.fn().mockResolvedValue(false),
        error: 'Invalid value',
      };
      const result = await validator.validate(validation, 'test', context);

      expect(result).toBe(false);
      expect(validation.validator).toHaveBeenCalledWith('test', context);
    });
  });

  describe('page validation', () => {
    it('should validate page level validation', async () => {
      const pageValidation: Validation = {
        regex: '',
        error: 'Page validation ',
      };
      page.validation = pageValidation;

      await validator.validatePage(page, context);

      expect(page.valid).toBe(true);
    });
  });
});
