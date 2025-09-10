import { AddressValueElement, DateValueElement, FileUploadElement } from '../../src/service/Element.js';
import { CookiesTable, ErrorList, Panel, SelectListField } from '../../src/elements/index.js';

import { Context } from '../../src/context/index.js';
import { CookiesTableItem } from '../../src/elements/CookiesTable.js';
import { Enricher } from '../../src/context/Enricher.js';
import { FormMappings } from '../../src/service/Service.js';
import { Page } from '../../src/service/Page.js';
import { SessionManager } from '../../src/context/SessionManager.js';
import { Validation } from '../../src/service/Validation.js';
import _ from 'lodash';

describe('Enricher', () => {
  let enricher: Enricher;
  let page: Page;
  let context: Context;
  let errorList: ErrorList;

  beforeEach(() => {
    enricher = new Enricher();
    page = {
      id: 'page1',
      allElements: [],
      nextPage: '',
      elements: [],
    };

    context = {
      allElements: [],
      data: {},
      service: {
        pages: [],
        apiServiceDefinition: { paths: {} },
        apiMappings: {},
        name: '',
        cookieSecret: '',
        firstPage: '',
        cookieBanner: null,
        footer: null,
        hash: 'test-hash',
      },
      page: page,
      sessionManager: new SessionManager(),

      newFiles: [],
      setNewFilesData: jest.fn(),
      getNotFoundPage: jest.fn(),
      getPageById: jest.fn(),
      getDataForCookie: jest.fn(),
      getDataCookieConfig: jest.fn().mockImplementation(function () {
        return {
          name: 'mock_cookie_name',
          purpose: 'mock_cookie_purpose',
          expires: 'mock_cookie_expires',
          cookieOptions: {},
        };
      }),
      isValid: jest.fn(),
      flattenElements: jest.fn(),
      addCookieFooter: jest.fn(),
      hasCookiePage: jest.fn(),
    } as unknown as Context;

    errorList = {
      type: 'ErrorList',
      errorItems: [],
    } as unknown as ErrorList;
  });

  describe('CookiesTable', () => {
    it('should add session_data cookie values to table', () => {
      const cookiesTableElement = new CookiesTable('example title', []);
      context.allElements.push(cookiesTableElement);

      enricher.enrichPage(page, context);

      expect(cookiesTableElement.cookies).toStrictEqual([
        [
          new CookiesTableItem('mock_cookie_name'),
          new CookiesTableItem('mock_cookie_purpose'),
          new CookiesTableItem('mock_cookie_expires'),
        ],
      ]);
    });
  });

  describe('File Upload', () => {
    it('should enrich FileUpload element', () => {
      const fileUploadElement: FileUploadElement = {
        type: 'FileUpload',
        name: 'file1',
        uploadedFileName: '',
        displayText: '',
        value: undefined,
      };
      context.allElements.push(fileUploadElement);
      context.data.file1 = 'uploadedFile.txt';

      enricher.enrichPage(page, context);

      expect(fileUploadElement.uploadedFileName).toBe('uploadedFile.txt');
      expect(fileUploadElement.valid).toBe(true);
    });
  });

  describe('Panel Elements', () => {
    it('should enrich Panel element with reference number', () => {
      const panelElement: Panel = {
        type: 'Panel',
        text: 'Reference: {referenceNumber}',
        title: '',
        referenceNumber: undefined,
      };
      context.allElements.push(panelElement);
      context.data.referenceNumber = 'xyz';

      enricher.enrichPage(page, context);
      expect(panelElement.text).toBe('Reference: {referenceNumber}');
      expect(panelElement.referenceNumber).toBe('xyz');
    });
  });

  describe('Navigation Elements', () => {
    it('should set BackButton href with string nextPage', () => {
      const backButton = {
        type: 'BackButton',
        href: '',
        displayText: '',
        classes: '',
      };
      context.allElements.push(backButton);
      context.service.pages = [
        { id: 'page1', nextPage: 'page2', elements: [] },
        { id: 'page2', nextPage: '', elements: [] },
      ];
      page.id = 'page2';

      enricher.enrichPage(page, context);
      expect(backButton.href).toBe('page1');
    });

    it('should set BackButton href with conditional nextPage', () => {
      const fieldName = 'my-field';
      const fieldValue = 'random value';
      context.data[fieldName] = fieldValue;
      const backButton = {
        type: 'BackButton',
        href: '',
        displayText: '',
        classes: '',
      };
      context.allElements.push(backButton);
      context.service.pages = [
        {
          id: 'page1',
          nextPage: {
            rules: [
              { match: { [fieldName]: fieldValue }, page: 'page2' },
              { match: { [fieldName]: 'fieldValue' }, page: 'page1' },
              { match: { xyz: fieldValue }, page: 'page3' },
            ],
          },
          elements: [],
        },
        { id: 'page2', nextPage: '', elements: [] },
      ];
      page.id = 'page2';

      enricher.enrichPage(page, context);
      expect(backButton.href).toBe('page1');
    });
  });

  describe('Form Elements', () => {
    it('should enrich DatePickerField with complete date', () => {
      const dateElement = {
        type: 'DatePickerField',
        name: 'testDate',
        displayText: 'Test Date',
        value: '',
      } as DateValueElement;

      context.data = {
        'testDate-day': '1',
        'testDate-month': '2',
        'testDate-year': '2024',
      };
      context.allElements = [dateElement];

      enricher.enrichPage(page, context);
      expect(dateElement.value).toBe('1 2 2024');
    });

    it('should handle partial date input', () => {
      const dateElement = {
        type: 'DatePickerField',
        name: 'testDate',
        displayText: 'Test Date',
        value: '',
      } as DateValueElement;

      context.data = {
        'testDate-day': '1',
        'testDate-month': '2',
      };
      context.allElements = [dateElement];

      enricher.enrichPage(page, context);
      expect(dateElement.value).toBe('1 2 undefined');
    });

    it('should enrich SelectListField with dynamic options', () => {
      const selectElement = {
        type: 'SelectListField',
        name: 'dynamicSelect',
        options: ['option1', 'option2'],
        displayText: '',
        value: null,
        hint: '',
      } as unknown as SelectListField;

      context.allElements.push(selectElement);
      context.data.dynamicSelect = 'option1';

      enricher.enrichPage(page, context);

      expect((selectElement as any).options).toEqual([
        { text: 'option1', value: 'option1', selected: true, checked: true },
        { text: 'option2', value: 'option2' },
      ]);
    });

    it('should handle DatePickerField validation with translation keys', () => {
      const dateElement = {
        type: 'DatePickerField',
        name: 'testDate',
        displayText: 'Test Date',
        invalidDay: true,
        invalidMonth: true,
        invalidYear: true,
        value: '',
      } as DateValueElement;

      context.allElements = [dateElement];
      page.allElements = [errorList, dateElement];

      enricher.enrichErrorElements(page, context);

      expect(errorList.errorItems[0]).toEqual({
        href: '#testDate-day',
        text: 'core:date-input.real-date-error',
        element: dateElement,
      });
    });
  });

  describe('Address Elements', () => {
    it('should handle address field validation with translation keys', () => {
      const addressElement = {
        type: 'AddressField',
        name: 'address',
        invalidLine1: true,
        invalidTown: true,
        invalidPostcode: true,
      } as AddressValueElement;

      page.allElements = [errorList, addressElement];
      context.allElements = [addressElement];

      enricher.enrichErrorElements(page, context);

      expect(errorList.errorItems).toHaveLength(3);
      expect(errorList.errorItems[0].text).toBe('core:address.line1-input.invalid-error');
      expect(errorList.errorItems[1].text).toBe('core:address.town-input.invalid-error');
      expect(errorList.errorItems[2].text).toBe('core:address.postcode-input.invalid-error');
    });
  });

  describe('Summary Elements', () => {
    it('should enrich summary with translation keys', () => {
      const summaryElement = {
        type: 'Summary',
        fieldNames: ['address'],
        summaryDataItems: [] as Array<{
          key: string;
          value: string;
          link: string;
          linkText: string;
        }>,
        ancillaryItems: [],
      };

      const addressElement = {
        type: 'AddressField',
        name: 'address',
        displayText: 'Test Address',
        page: {
          id: 'address-page',
          nextPage: '',
          elements: [],
        } as Page,
      } as AddressValueElement;

      context.data = {
        'address-line1': '123 Test St',
        'address-line2': 'Apt 4',
        'address-town': 'TestCity',
        'address-county': 'TestCounty',
        'address-postcode': 'TE12 3ST',
      };

      context.allElements = [addressElement];
      page.allElements = [summaryElement];

      enricher.enrichSummaryElements(page, context);

      expect(summaryElement.summaryDataItems[0]).toEqual({
        key: 'Test Address',
        value: '123 Test St, Apt 4, TestCity, TestCounty, TE12 3ST',
        link: 'address-page',
        linkText: 'core:summary.change-link-text',
      });
    });
  });

  describe('Error Elements', () => {
    it('should handle page validation with translation keys', () => {
      const validation: Validation = {
        error: 'core:page.validation.error',
        elementName: 'testElement',
        validator: async () => false,
      };

      page.validation = validation;
      page.invalid = true;
      page.allElements = [errorList];

      enricher.enrichErrorElements(page, context);

      expect(errorList.errorItems[0]).toEqual({
        href: '#testElement',
        text: 'core:page.validation.error',
      });
    });

    it('should handle address field validation errors', () => {
      const addressElement = {
        type: 'AddressField',
        name: 'address',
        invalidLine1: true,
        invalidTown: true,
        invalidPostcode: true,
      } as AddressValueElement;

      page.allElements = [errorList, addressElement];
      context.allElements = [addressElement];

      enricher.enrichErrorElements(page, context);

      expect(errorList.errorItems).toHaveLength(3);
      expect(errorList.errorItems[0].text).toBe('core:address.line1-input.invalid-error');
      expect(errorList.errorItems[1].text).toBe('core:address.town-input.invalid-error');
      expect(errorList.errorItems[2].text).toBe('core:address.postcode-input.invalid-error');
    });

    it('should handle server API errors', () => {
      const mapping: FormMappings = {
        request: {},
        response: {
          title: 'errors[0].message',
          numErrors: 'errors.length',
          fieldNames: 'errors[*].field',
          fieldErrorMessages: 'errors[*].message',
        },
      };

      context.service.errorResponse = JSON.stringify({
        errors: [
          { field: 'name', message: 'core:api.name.required' },
          { field: 'email', message: 'core:api.email.invalid' },
        ],
      });

      context.service.apiMappings = {
        submit: mapping,
      };

      page.allElements = [errorList];

      enricher.enrichErrorElements(page, context, {
        operation: 'submit',
        value: '' as any,
      });

      expect(context.page.error?.errorItems || []).toHaveLength(0);
    });
  });
});
