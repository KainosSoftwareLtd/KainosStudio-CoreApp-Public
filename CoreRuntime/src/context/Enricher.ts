import { Action, AddressValueElement, DateValueElement, FileUploadElement, ValueElement } from '../service/Element.js';
import { ConditionalNextPage, Page } from '../service/Page.js';
import { CookiesTable, ErrorList, Panel } from '../elements/index.js';
import { referenceNumberFieldName } from '../consts.js';

import BackButton from '../elements/BackButton.js';
import { Context } from './index.js';
import { CookiesTableItem } from '../elements/CookiesTable.js';
import { FakeCheckboxOption } from '../elements/CheckboxField.js';
import Summary from '../elements/Summary.js';
import _ from 'lodash';
import jmespath from 'jmespath';
import { logger } from '../index.js';
import moment from 'moment';

export class Enricher {
  public enrichPage(page: Page, context: Context) {
    for (const element of context.allElements) {
      if (element.type === 'FileUpload') {
        const fileUploadElement = element as FileUploadElement;
        fileUploadElement.uploadedFileName = context.data[fileUploadElement.name];

        if (!fileUploadElement.hasOwnProperty('valid')) {
          fileUploadElement.valid = true;
        }
      } else if (element.type === 'CookiesTable') {
        this.enrichCookiesTable(element as CookiesTable, context);
      } else if (element.type === 'Panel') {
        const panelElement = element as Panel;
        panelElement.referenceNumber = context.data[referenceNumberFieldName];
      } else if (element.type === 'BackButton') {
        const backButtonElement = element as BackButton;
        if (!backButtonElement.href) {
          const currentPageId = page.id;
          const previousPage = context.service.pages.find((p) => {
            if (typeof p.nextPage === 'string') {
              return p.nextPage === currentPageId;
            } else if (p.nextPage) {
              const conditionalNextPage = p.nextPage as ConditionalNextPage;
              return conditionalNextPage.rules.some(
                (rule) =>
                  rule.page === currentPageId &&
                  Object.keys(rule.match).find((key) => context.data[key] === rule.match[key]),
              );
            }
            return false;
          });
          if (previousPage) {
            backButtonElement.href = previousPage.id;
          }
        }
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
        const valueElement = element as ValueElement;
        if (context.data.hasOwnProperty(valueElement.name) && valueElement.type != 'DatePickerField') {
          valueElement.value = context.data[valueElement.name];
        }

        if (valueElement.type == 'DatePickerField') {
          if (context.data[valueElement.name + '-day']) {
            valueElement.value =
              context.data[valueElement.name + '-day'] +
              ' ' +
              context.data[valueElement.name + '-month'] +
              ' ' +
              context.data[valueElement.name + '-year'];
          } else {
            valueElement.value = '';
          }
        }

        if (valueElement.hasOwnProperty('options')) {
          if (!Array.isArray((valueElement as any).options)) {
            (valueElement as any).options = context.data[(valueElement as any).options];
            logger.debug('Using dynamic options :  ' + JSON.stringify((valueElement as any).options));
          }

          // convert string options to object options
          if (typeof (valueElement as any).options[0] === 'string') {
            for (let i = 0; i < (valueElement as any).options.length; i++) {
              (valueElement as any).options[i] = {
                text: (valueElement as any).options[i],
                value: (valueElement as any).options[i],
              };
            }
          }

          // set the value to checked if required
          for (const option of (valueElement as any).options) {
            const selectedOptions = valueElement.value;
            if (Array.isArray(selectedOptions)) {
              for (let i = 0; i < selectedOptions.length; i++) {
                if (option.value === selectedOptions[i]) {
                  option.checked = true;
                }
              }
            } else if (option.value === selectedOptions) {
              option.checked = true;
              option.selected = true;
            } else {
              const selectedOptionsAfterSplit = selectedOptions?.split(',') || [];
              for (let i = 0; i < selectedOptionsAfterSplit.length; i++) {
                if (option.value === selectedOptionsAfterSplit[i]) {
                  option.checked = true;
                }
              }
            }
          }

          (valueElement as any).checked = true;

          if (valueElement.type == 'CheckboxField') {
            // workaround for checkbox to send 'nothing' if user unselect all options
            // adding fake option on the end, handled in Context class
            (valueElement as any).options.push({
              value: FakeCheckboxOption,
              text: null,
              checked: true,
              attributes: {
                style: 'display: none',
              },
            });
          }
        }
        if (!valueElement.hasOwnProperty('valid')) {
          valueElement.valid = true;
        }
      }
    }
  }

  public enrichSummaryElements(page: Page, context: Context) {
    logger.debug('enriching summary');
    if (page && page.allElements) {
      for (const element of page.allElements) {
        if (['Summary'].includes(element.type)) {
          const summary: Summary = element as Summary;

          logger.info('found summary item for ' + JSON.stringify(summary.fieldNames));

          if (!summary.summaryDataItems) summary.summaryDataItems = [];

          let filedNames: string[] = [];
          if(summary.fieldNames){
            if (_.isArray(summary.fieldNames)) {
              filedNames = summary.fieldNames;
            } else {
              const fieldNamesRule = summary.fieldNames.rules.find((rule) =>
                _.keys(rule.match).some((key) => context.data[key] === rule.match[key]),
              );
              filedNames = fieldNamesRule?.fieldNames || [];
              logger.debug(`used contitional field names: ` + JSON.stringify(summary.fieldNames));
            }
          }

          for (const fieldName of filedNames) {
            const sumElement: any = context.allElements.find((element) => {
              return fieldName === (element as ValueElement).name;
            });
            if (sumElement) {
              var val = sumElement.value;

              if (sumElement.type === 'AddressField') {
                const addressLine1 = context.data[`${fieldName}-line1`] || '';
                const addressLine2 = context.data[`${fieldName}-line2`] || '';
                const town = context.data[`${fieldName}-town`] || '';
                const county = context.data[`${fieldName}-county`] || '';
                const postcode = context.data[`${fieldName}-postcode`] || '';

                val = `${addressLine1}, ${town}`;
                if (addressLine2) val = `${addressLine1}, ${addressLine2}, ${town}`;
                if (county) val = `${val}, ${county}`;
                if (postcode) val = `${val}, ${postcode}`;
              }

              if (sumElement.options) {
                const optionsElement: any = sumElement.options.find((option: any) => {
                  return val === option.value;
                });
                if (typeof optionsElement !== 'undefined' && optionsElement) {
                  val = optionsElement.valueText;
                } else {
                  if (Array.isArray(sumElement.value) && sumElement.value.length > 1) {
                    val = sumElement.value.join('<br>');
                  }
                }
              }

              const validDateFormats = ['D M YYYY', 'DD MM YYYY', 'D MM YYYY', 'DD M YYYY'];
              for (const format of validDateFormats) {
                if (this.isDate(val, format)) {
                  val = this.formatDate(val, format);
                  break;
                }
              }

              if (sumElement.type === 'FileUpload') {
                val = sumElement.uploadedFileName;
              }

              logger.info(
                'found summary element for ' + (sumElement.shortText || sumElement.displayText) + ' = ' + val,
              );
              summary.summaryDataItems.push({
                key: sumElement.shortText || sumElement.displayText,
                value: val,
                link: sumElement.page.id,
                linkText: 'core:summary.change-link-text',
              });
            }
          }

          if (!summary.ancillaryItems) summary.ancillaryItems = [];
          for (const ancillaryItem of summary.ancillaryItems) {
            summary.summaryDataItems.push({
              key: ancillaryItem.displayText,
              value: ancillaryItem.location ? _.get(context, ancillaryItem.location) : '',
              link: '',
              linkText: '',
            });
          }
        }
      }
    }
  }

  private isDate(value: any, format: string): boolean {
    return moment(value, format, true).isValid();
  }

  private formatDate(dateString: string, format: string): string {
    return moment(dateString, format).format('D MMMM YYYY');
  }

  public enrichErrorElements(page: Page, context: Context, action?: Action) {
    logger.info('enriching error elements');
    if (page && page.allElements) {
      for (const element of page.allElements) {
        if (['ErrorList'].includes(element.type)) {
          logger.debug('enriching ErrorList');
          const errorListElement = element as ErrorList;
          errorListElement.errorItems = [];

          // if the page has a page.validation issue add it to the error list
          var p = page as any;
          if (p.validation && p.invalid) {
            logger.debug(`Page has validation and not valid`);
            logger.debug(p.validation.error);
            const error = {
              href: '#' + p.validation.elementName,
              text: p.validation.error,
            };
            errorListElement.errorItems.push(error);
          }

          // add validation issues found in page.allElements
          if (page.allElements) {
            for (const el2 of page.allElements) {
              const vel2 = el2 as ValueElement;

              if (vel2.invalid && vel2.type !== 'DatePickerField' && vel2.type !== 'AddressField') {
                const error = {
                  href: '#' + vel2.name,
                  text: vel2.validation ? vel2.validation.error : '',
                  element: vel2,
                };
                logger.debug('Added error :' + (vel2.validation ? vel2.validation.error : ''));
                errorListElement.errorItems.push(error);
              }
              const dvel2 = el2 as DateValueElement;

              if (dvel2.type === 'DatePickerField') {
                if (dvel2.missingDay && dvel2.missingMonth && dvel2.missingYear) {
                  // Link isMandatory error to the day field
                  const error = {
                    href: `#${dvel2.name}-day`,
                    text: dvel2.validation?.error || 'core:date-input.mandatory-error',
                    element: dvel2,
                  };
                  logger.debug('Added DatePickerField mandatory error: ' + error.text);
                  errorListElement.errorItems.push(error);
                } else if (dvel2.invalidDay || dvel2.invalidMonth || dvel2.invalidYear) {
                  let href = '';
                  if (dvel2.invalidDay) {
                    href = href || '#' + vel2.name + '-day';
                  }
                  if (dvel2.invalidMonth) {
                    href = href || '#' + vel2.name + '-month';
                  }
                  if (dvel2.invalidYear) {
                    href = href || '#' + vel2.name + '-year';
                  }

                  let errorMessage = '';
                  if (dvel2.invalidDay && dvel2.invalidMonth && dvel2.invalidYear) {
                    errorMessage = 'core:date-input.real-date-error';
                  } else {
                    errorMessage = 'core:date-input.missing-part-error';
                  }

                  const error = {
                    href: href,
                    text: errorMessage,
                    element: dvel2,
                  };
                  logger.debug('Added error: ' + errorMessage);
                  errorListElement.errorItems.push(error);
                }
              }
              const avel2 = el2 as AddressValueElement;
              if (avel2.type === 'AddressField') {
                if (avel2.invalidLine1) {
                  errorListElement.errorItems.push({
                    href: `#${avel2.name}-line1`,
                    text: 'core:address.line1-input.invalid-error',
                  });
                  logger.debug('Added error for Address line 1');
                }
                if (avel2.invalidTown) {
                  errorListElement.errorItems.push({
                    href: `#${avel2.name}-town`,
                    text: 'core:address.town-input.invalid-error',
                  });
                  logger.debug('Added error for Town or city');
                }
                if (avel2.invalidPostcode) {
                  errorListElement.errorItems.push({
                    href: `#${avel2.name}-postcode`,
                    text: 'core:address.postcode-input.invalid-error',
                  });
                  logger.debug('Added error for Postcode');
                }
                if (avel2.missingPostcode) {
                  errorListElement.errorItems.push({
                    href: `#${avel2.name}-postcode`,
                    text: 'core:address.postcode-input.missing-error',
                  });
                  logger.debug('Added error for Postcode');
                }
              }
            }

            // add server error message if error received from server
            if (context.service.errorResponse) {
              logger.debug('enriching server error response');
              if (
                context.service.apiMappings &&
                action?.operation &&
                context.service.apiMappings[action.operation].response
              ) {
                logger.debug('error api mapping exists');
                const errorMapping = context.service.apiMappings[action.operation].response;
                const errorResponse = context.service.errorResponse;

                logger.debug(JSON.stringify(errorMapping));

                const pageError = new ErrorList(jmespath.search(errorResponse, errorMapping.title));

                if (errorMapping.numErrors) {
                  const errorListSize = jmespath.search(errorResponse, errorMapping.numErrors);

                  const allElements = context.allElements as ValueElement[];

                  for (var i = 0; i < errorListSize; i++) {
                    let elementWithError;
                    let fieldErrorMessage;
                    if (errorMapping.fieldNames) {
                      const errorFieldName = jmespath.search(
                        errorResponse,
                        errorMapping.fieldNames.replace('*', i.toString()),
                      );

                      logger.debug('errorFieldName: ' + errorFieldName);
                      elementWithError = allElements.find((a) => a.name === errorFieldName);
                    }

                    if (errorMapping.fieldErrorMessages) {
                      fieldErrorMessage = jmespath.search(
                        errorResponse,
                        errorMapping.fieldErrorMessages.replace('*', i.toString()),
                      );
                    }
                    if (fieldErrorMessage) {
                      let errorMessage = fieldErrorMessage;
                      if (elementWithError) {
                        errorMessage += ': {{for}}';
                      }
                      pageError.errorItems.push({
                        element: elementWithError,
                        text: errorMessage,
                      });
                    }
                  }
                }
                context.page.error = pageError;
              }
            }

            logger.debug('elements in error list : ' + errorListElement.errorItems.length);
            logger.debug('elements in server error list: ' + context.page.error?.errorItems.length);
          }
        }
      }
    }
  }

  private enrichCookiesTable(elementData: CookiesTable, context: Context) {
    const cookieConfig = context.getDataCookieConfig();

    const cookieRow = [
      new CookiesTableItem(cookieConfig.name),
      new CookiesTableItem(cookieConfig.purpose),
      new CookiesTableItem(cookieConfig.expires),
    ];

    if (!elementData.cookies) {
      elementData.cookies = [];
    }
    elementData.cookies.push(cookieRow);

    logger.debug(`CookiesTable rows dynamically enriched: ${JSON.stringify(elementData.cookies)}`);
  }
}
