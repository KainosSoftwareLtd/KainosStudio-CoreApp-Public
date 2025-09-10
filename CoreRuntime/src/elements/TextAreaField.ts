import { ValueElement } from '../service/Element.js';

export default class TextAreaField implements ValueElement {
  public type: string;
  public name: string;
  public displayText: string;
  public shortText?: string;
  public hint?: string;
  public maxLength?: number;

  public constructor(name: string, displayText: string, shortText?: string, hint?: string, maxLength?: number) {
    this.type = 'TextAreaField';

    this.name = name;
    this.displayText = displayText;
    this.shortText = shortText;
    this.hint = hint;
    this.maxLength = maxLength;
  }
}
