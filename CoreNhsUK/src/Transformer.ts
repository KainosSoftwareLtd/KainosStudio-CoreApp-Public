import {
  CheckboxField,
  CookiesTable,
  ErrorList,
  Footer,
  Panel,
  RadioField,
  SelectListField,
  Summary,
} from 'core-runtime/lib/elements/index.js';
import { DateValueElement, Element } from 'core-runtime/lib/service/Element.js';

import { Environment as NunjucksEnvironment } from 'nunjucks';
import { referenceNumberPlaceholder } from 'core-runtime/lib/consts.js';

export default class Transformer {
  private nunjucksEnv;
  private trans: (textId?: string, params?: any) => string;

  public constructor(nunjucksEnv: NunjucksEnvironment) {
    this.nunjucksEnv = nunjucksEnv;
    this.trans = nunjucksEnv.getFilter('trans');
  }

  public transform(element: Element): any {
    if ('Summary' === element.type) {
      return this.transformSummary(element as Summary);
    }

    if ('RadioField' === element.type) {
      return this.transformRadio(element as RadioField);
    }

    if ('CheckboxField' === element.type) {
      return this.transformCheckbox(element as CheckboxField);
    }

    if ('SelectListField' === element.type) {
      return this.transformSelect(element as CheckboxField);
    }

    if ('ErrorList' === element.type) {
      return this.transformErrorList(element as ErrorList);
    }

    if ('CookiesTable' === element.type) {
      return this.transformCookiesTable(element as CookiesTable);
    }

    if ('Footer' === element.type) {
      return this.transformFooter(element as Footer);
    }

    if ('Panel' === element.type) {
      return this.transformPanel(element as Panel);
    }

    if ((element as any).text) {
      const text = (element as any).text;
      if (element.context) {
        (element as any).text = this.nunjucksEnv.renderString(text, element.context);
      }
    }

    if ((element as any).displayText) {
      const displayText = (element as any).displayText;
      if (element.context) {
        (element as any).displayText = this.nunjucksEnv.renderString(displayText, element.context);
      }
    }

    return {};
  }

  private transformRadio(element: RadioField): any {
    for (const option of element.options) {
      option.text = this.trans(option.text);
      option.valueText = this.trans(option.valueText);

      if (option.hint) {
        option.hint = {
          text: this.trans(option.hint),
        };
      }
    }
  }

  private transformCheckbox(element: CheckboxField): any {
    for (const option of element.options) {
      option.text = this.trans(option.text);
      option.valueText = this.trans(option.valueText);

      if (option.hint) {
        option.hint = {
          text: this.trans(option.hint),
        };
      }
    }
  }

  private transformSelect(element: SelectListField): any {
    for (const option of element.options) {
      option.text = this.trans(option.text);
    }
  }

  private transformErrorList(element: ErrorList): any {
    for (const errorItem of element.errorItems || []) {
      const relatedElement = errorItem.element;
      const forElement = this.trans(relatedElement?.displayText);
      errorItem.text = this.trans(errorItem.text, { for: forElement });

      if (relatedElement?.type === 'DatePickerField') {
        const dateElement = relatedElement as DateValueElement;
        const missingParts: string[] = [];
        if (dateElement.invalidDay) {
          missingParts.push(this.trans('core:date-input.day.missing-part'));
        }
        if (dateElement.invalidMonth) {
          missingParts.push(this.trans('core:date-input.month.missing-part'));
        }
        if (dateElement.invalidYear) {
          missingParts.push(this.trans('core:date-input.year.missing-part'));
        }

        const missingPartsAsString = missingParts.join(this.trans('core:date-input.missing-part-concat-text'));
        errorItem.text = this.trans(errorItem.text, { for: forElement, missingParts: missingPartsAsString });
      }
    }
  }

  private transformCookiesTable(element: CookiesTable): any {
    if (element.cookies) {
      for (const row of element.cookies) {
        for (const item of row) {
          item.text = this.trans(item.text);
        }
      }
    }
  }

  private transformFooter(element: Footer): any {
    for (const link of element.links || []) {
      link.text = this.trans(link.text);
      (link as any).url = link.href;
      (link as any).label = link.text;
    }
  }

  private transformPanel(element: Panel): any {
    if (element.referenceNumber) {
      element.text = this.trans(element.text).replace(referenceNumberPlaceholder, element.referenceNumber);
    }
  }

  private transformSummary(element: Summary) {
    const rows: Array<{
      key: { text: string };
      value: { text: string | undefined };
      actions: { items: Array<{ href: string | undefined; text: string; visuallyHiddenText: string }> };
    }> = [];

    if (!element.summaryDataItems) element.summaryDataItems = [];
    for (const summaryDataItem of element.summaryDataItems) {
      rows.push({
        key: {
          text: this.trans(summaryDataItem.key),
        },
        value: {
          text: replaceHtmlSpecialChars(this.trans(summaryDataItem.value)),
        },
        actions: {
          items: [
            {
              href: summaryDataItem.link,
              text: this.trans(summaryDataItem.linkText),
              visuallyHiddenText: this.trans(summaryDataItem.key),
            },
          ],
        },
      });
    }
    return rows;
  }
}

function replaceHtmlSpecialChars(value: string | undefined) {
  if (!value) {
    return value;
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  } as {
    [key: string]: string;
  };

  return value.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}
