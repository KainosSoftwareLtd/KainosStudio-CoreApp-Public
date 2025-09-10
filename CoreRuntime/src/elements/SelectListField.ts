import { ValueElement } from '../service/Element.js';

export default class SelectListField implements ValueElement {
  public type: string;
  public name: string;
  public displayText: string;
  public options: SelectlistOption[] = [];

  public constructor(name: string, displayText: string, stringOptions: string[]) {
    this.type = 'SelectListField';
    this.name = name;
    this.displayText = displayText;
    stringOptions.forEach((option) => this.options.push({ value: option, text: option }));
  }
}

export class SelectlistOption {
  public value?: string;
  public text?: string;
}
