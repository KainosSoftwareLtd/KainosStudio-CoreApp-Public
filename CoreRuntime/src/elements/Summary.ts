import { Context } from '../context/index.js';
import { Element } from '../service/Element.js';

export default class Summary implements Element {
  public type: string;
  public title: string;
  public fieldNames: string[] | ConditionalFieldNames;
  public ancillaryItems: AncillaryDataItem[] = [];
  public summaryDataItems: SummaryDataItem[] = [];

  public constructor(title: string, fieldNames: string[]) {
    this.type = 'Summary';
    this.title = title;
    this.fieldNames = fieldNames;
  }

  public static formatAddress(context: Context, fieldName: string): string {
    const addressLine1 = context.data[`${fieldName}-line1`] || '';
    const addressLine2 = context.data[`${fieldName}-line2`] || '';
    const town = context.data[`${fieldName}-town`] || '';
    const county = context.data[`${fieldName}-county`] || '';
    const postcode = context.data[`${fieldName}-postcode`] || '';

    let address = `${addressLine1}, ${town}, ${postcode}`;
    if (addressLine2) address = `${addressLine1}, ${addressLine2}, ${town}, ${postcode}`;
    if (county) address = `${address}, ${county}`;
    return address;
  }
}

export class SummaryDataItem {
  public key?: string;
  public value?: string;
  public link?: string;
  public linkText?: string;
}

export class AncillaryDataItem {
  public displayText?: string;
  public location?: string;
}

export interface ConditionalFieldNames {
  rules: FieldNamesRule[]
}

export interface FieldNamesRule {
  match: FieldNamesRuleMatch,
  fieldNames: string[]
}

export interface FieldNamesRuleMatch {
  [field: string]: string
}
