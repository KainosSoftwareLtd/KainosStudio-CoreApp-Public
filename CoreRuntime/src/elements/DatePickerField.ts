import { ValueElement } from '../service/Element.js';

export default class DatePickerField implements ValueElement {
  public type: string;
  public name: string;
  public displayText: string;

  public constructor(name: string, displayText: string) {
    this.type = 'DatePickerField';
    this.name = name;
    this.displayText = displayText;
  }
}
