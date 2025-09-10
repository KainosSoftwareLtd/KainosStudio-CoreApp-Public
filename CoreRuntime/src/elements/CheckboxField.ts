import { ValueElement } from '../service/Element.js';

export default class CheckboxField implements ValueElement {
  public type: string;
  public name: string;
  public displayText: string;
  public hint: string;
  public options: CheckboxOption[] = [];

  public constructor(name: string, displayText: string, hint: string, stringOptions: string[]) {
    this.type = 'CheckboxField';
    this.name = name;
    this.displayText = displayText;
    this.hint = hint;
    stringOptions.forEach((option) => this.options.push({ value: option, text: option }));
  }
}

export class CheckboxOption {
  public value?: string;
  public valueText?: string;
  public text?: string;
  public hint?: any;
}

// uses for workaround on server side instead of client side script
export const FakeCheckboxOption = 'c8cd3d74-8b7d-43a8-9d36-251f158c1998';