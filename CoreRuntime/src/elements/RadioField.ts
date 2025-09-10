import { ValueElement } from '../service/Element.js';

export default class RadioField implements ValueElement {
  public type: string;
  public name: string;
  public displayText: string;
  public isPageHeading: boolean;
  public hint: string;
  public options: RadioOption[] = [];

  public constructor(name: string, displayText: string, hint: string, isPageHeading: boolean, stringOptions: string[]) {
    this.type = 'RadioField';
    this.name = name;
    this.displayText = displayText;
    this.hint = hint;
    this.isPageHeading = isPageHeading;
    stringOptions.forEach((option) => this.options.push({ value: option, text: option }));
  }
}

export class RadioOption {
  public value?: string;
  public text?: string;
  public valueText?: string;
  public hint?: any;
}
