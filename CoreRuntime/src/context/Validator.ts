import { FunctionValidation, RegexValidation, Validation } from '../service/Validation.js';

import { Context } from './index.js';
import { ValueElement } from '../service/Element.js';
import XRegExp from 'xregexp';
import { logger } from '../index.js';

const postcodeRegex = /^[A-Za-z]{1,2}[0-9][0-9A-Za-z]?\s*[0-9][A-Za-z]{2}$/;
const phoneNumberRegex = /^(\+44\s?|0)(?:\d{2}\s?\d{4}\s?\d{4}|\d{3}\s?\d{3}\s?\d{4}|\d{4}\s?\d{3}\s?\d{3})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Validator {
  public async validatePage(page: any, context: Context) {
    page.valid = true;
    page.invalidElements = [];

    for (const element of page.allElements) {
      this.setDefaultValidationForElement(element);

      if (element.type === 'AddressField') {
        this.validateAddressField(element, context, page);
        continue;
      }

      if (element.type === 'FileUpload') {
        const elementId = (element as ValueElement).name;
        if (element.validation?.isMandatory && !context.data[elementId]) {
          element.valid = false;
          element.invalid = true;
          const defaultError = this.getDefaultMandatoryMessage(element);
          element.validation.error = element.validation.mandatoryError || defaultError;
          page.invalidElements.push(element);
          page.valid = false;
          page.invalid = true;
          continue;
        }

        element.valid = true;
        element.invalid = false;
      } else if (
        [
          'CheckboxField',
          'DatePickerField',
          'RadioField',
          'SelectListField',
          'TextField',
          'TextAreaField',
          'PhoneNumberField',
          'PostcodeField',
          'EmailField',
        ].includes(element.type)
      ) {
        logger.debug(`Validating ${element.name} (${element.type}) "${element.value}"`);
        const value = element.value;

        if (element.validation?.isMandatory) {
          let day = '';
          let month = '';
          let year = '';

          if (element.type === 'DatePickerField') {
            day = context.data[element.name + '-day'];
            month = context.data[element.name + '-month'];
            year = context.data[element.name + '-year'];
          }

          if (!day) {
            element.missingDay = true;
          }

          if (!month) {
            element.missingMonth = true;
          }

          if (!year) {
            element.missingYear = true;
          }

          if (!value && (!day || !month || !year)) {
            const defaultError = this.getDefaultMandatoryMessage(element);
            const errorMessage = element.validation.mandatoryError || defaultError;

            logger.debug(`Validation failed: ${errorMessage}`);
            element.valid = false;
            element.invalid = true;
            element.validation.error = errorMessage;
            page.invalidElements.push(element);
            page.valid = false;
            page.invalid = true;
            continue;
          }
        }

        if (element.type === 'DatePickerField') {
          let day = context.data[element.name + '-day'];
          let month = context.data[element.name + '-month'];
          let year = context.data[element.name + '-year'];

          const allFieldsEmpty = !day && !month && !year;

          if (!allFieldsEmpty) {
            const validateDateInput = (value: string, validator: (value: string) => boolean, errorField: string) => {
              const isValid = validator(value);
              element[errorField] = !isValid;
              if (!isValid) {
                element.invalid = true;
                page.valid = false;
                page.invalid = true;
                return true;
              }
              return false;
            };

            const hasDayError = validateDateInput(day, this.validateDay, 'invalidDay');
            const hasMonthError = validateDateInput(month, this.validateMonth, 'invalidMonth');
            const hasYearError = validateDateInput(year, this.validateYear, 'invalidYear');
            const hasIndividualErrors = hasDayError || hasMonthError || hasYearError;

            if (!hasIndividualErrors && day && month && year) {
              if (!this.validateFullDate(day, month, year)) {
                element.invalid = true;
                page.invalidElements.push(element);
                page.valid = false;
                page.invalid = true;
              } else {
                element.valid = true;
                element.invalid = false;
                element.invalidDay = false;
                element.invalidMonth = false;
                element.invalidYear = false;
                element.error = '';
              }
            }
          }
        }

        if (element.type === 'TextAreaField' && element.maxLength) {
          if (value.length > element.maxLength) {
            logger.debug(`The number of characters has been exceeded`);
            element.valid = false;
            element.invalid = !element.valid;
            page.invalidElements.push(element);
            page.valid = page.valid && element.valid;
            page.invalid = !page.valid;
          }
        }
        if (element.type !== 'DatePickerField') {
          const valueElement = element as ValueElement;
          if (valueElement.validation) {
            valueElement.valid = await this.validate(valueElement.validation, value, context);
            valueElement.invalid = !valueElement.valid;
            if (valueElement.invalid) {
              page.invalidElements.push(valueElement);
            }
            page.valid = page.valid && valueElement.valid;
            page.invalid = !page.valid;
          } else {
            valueElement.valid = true;
            valueElement.invalid = false;
          }
        }
      }
    }
    if (page.validation) {
      logger.debug(`Page has validation`);
      page.valid = page.valid && (await this.validate(page.validation, '', context));
      page.invalid = !page.valid;
    }

    logger.debug('Page is valid:  ' + page.valid);
  }

  private validateDay(day: string): boolean {
    const dayInt = parseInt(day, 10);
    return XRegExp(/^\d+$/).test(day) && !isNaN(dayInt) && dayInt >= 1 && dayInt <= 31;
  }

  private validateMonth(month: string): boolean {
    const monthInt = parseInt(month, 10);
    return XRegExp(/^\d+$/).test(month) && !isNaN(monthInt) && monthInt >= 1 && monthInt <= 12;
  }

  private validateYear(year: string): boolean {
    const yearInt = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    return XRegExp(/^\d+$/).test(year) && !isNaN(yearInt) && yearInt >= 1900 && yearInt <= currentYear + 200;
  }

  private validateFullDate(day: string, month: string, year: string): boolean {
    const date = new Date(`${year}-${month}-${day}`);
    return (
      date.getFullYear() === parseInt(year, 10) &&
      date.getMonth() + 1 === parseInt(month, 10) &&
      date.getDate() === parseInt(day, 10)
    );
  }
  private validateAddressField(element: any, context: Context, page: any) {
    const { name, validation } = element;
    element.valid = true;
    element.invalid = false;

    const addressLine1 = context.data[`${name}-line1`];
    const townOrCity = context.data[`${name}-town`];
    const postcode = context.data[`${name}-postcode`];

    if (!addressLine1) {
      element.valid = false;
      element.invalid = true;
      element.invalidLine1 = true;
      page.valid = false;
      page.invalid = true;
    }

    if (!townOrCity) {
      element.valid = false;
      element.invalid = true;
      element.invalidTown = true;
      page.valid = false;
      page.invalid = true;
    }

    if (!postcode) {
      element.valid = false;
      element.invalid = true;
      element.missingPostcode = true;
      page.valid = false;
      page.invalid = true;
    } else if (!this.isValidUKPostcode(postcode)) {
      element.valid = false;
      element.invalid = true;
      element.invalidPostcode = true;
      page.valid = false;
      page.invalid = true;
    }
  }

  private isValidUKPostcode(postcode: string): boolean {
    if (!postcode || typeof postcode !== 'string') return false;

    postcode = postcode.trim().toUpperCase();
    const parts = postcode.match(postcodeRegex);

    return !!parts;
  }

  private getDefaultMandatoryMessage(element: any): string {
    switch (element.type) {
      case 'DatePickerField':
        return 'core:date-input.mandatory-error';
      case 'PhoneNumberField':
        return 'core:phone-number-input.mandatory-error';
      case 'PostcodeField':
        return 'core:address.postcode-input.mandatory-error';
      case 'EmailField':
        return 'core:email-input.mandatory-error';
      case 'RadioField':
      case 'SelectListField':
      case 'TextField':
      case 'TextAreaField':
        return 'core:cannot-be-blank-error';
      default:
        return 'core:default-mandatory-error';
    }
  }

  public async validate(validation: Validation, value: any, context?: Context): Promise<boolean> {
    if (!validation) {
      logger.info('No validation, so returning true');
      return true;
    }
    logger.debug('Validation type is : ' + (validation.hasOwnProperty('validator') ? 'Function' : 'Regex'));
    if (validation.hasOwnProperty('validator')) {
      return await (validation as FunctionValidation).validator(value, context);
    }
    const validationRegex = (validation as RegexValidation).regex;
    if (validationRegex) {
      // looks the same but first one invoke XRegExp(string, string?) constructor 
      // and second invoking XRegExp(RegExp), js don't care but ts can't decide when trying to check type
      const isValid =
        typeof validationRegex === 'string'
          ? XRegExp(validationRegex).test(value)
          : XRegExp(validationRegex).test(value);
      logger.info(`validating ${value} against ${validationRegex} ? ${isValid}`);
      return isValid;
    }
    return true;
  }

  private setDefaultValidationForElement(element: ValueElement) {
    if (element.type === 'PhoneNumberField') {
      const phoneNumberDefaultValidation = {
        regex: phoneNumberRegex,
        error: 'core:phone-number-input.invalid-error',
        isMandatory: true,
        mandatoryError: this.getDefaultMandatoryMessage(element),
      };

      this.setDefaultValidation(element, phoneNumberDefaultValidation);
    } else if (element.type === 'PostcodeField') {
      const postcodeDefaultValidation = {
        regex: postcodeRegex,
        error: 'core:address.postcode-input.invalid-error',
        isMandatory: true,
        mandatoryError: this.getDefaultMandatoryMessage(element),
      };

      this.setDefaultValidation(element, postcodeDefaultValidation);
    } else if (element.type === 'EmailField') {
      const emailDefaultValidation = {
        regex: emailRegex,
        error: 'core:email-input.invalid-error',
        isMandatory: true,
        mandatoryError: this.getDefaultMandatoryMessage(element),
      };
      this.setDefaultValidation(element, emailDefaultValidation);
    }
  }

  private setDefaultValidation(
    element: any,
    defaultValidation: { regex: string | RegExp; error: string; isMandatory: boolean; mandatoryError: string },
  ) {
    if (!element.validation) {
      element.validation = defaultValidation;
    } else {
      if (!element.validation.regex) {
        element.validation.regex = defaultValidation.regex;
      }
      if (!element.validation.error) {
        element.validation.error = defaultValidation.error;
      }
      if (element.validation.isMandatory !== false) {
        element.validation.isMandatory = defaultValidation.isMandatory;
      }
      if (!element.validation.mandatoryError) {
        element.validation.mandatoryError = defaultValidation.mandatoryError;
      }
    }
  }
}
