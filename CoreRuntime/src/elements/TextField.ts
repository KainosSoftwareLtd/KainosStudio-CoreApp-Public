import { ValueElement } from '../service/Element.js';

export default class TextField implements ValueElement {
  public type: string;
  public name: string;
  public displayText: string;
  public shortText?: string;
  public hint?: string;
  public prefix?: string;
  public classes?: string;

  public constructor(
    name: string,
    displayText: string,
    shortText?: string,
    hint?: string,
    prefix?: string,
    classes?: string,
  ) {
    this.type = 'TextField';

    this.name = name;
    this.displayText = displayText;
    this.shortText = shortText;
    this.hint = hint;
    this.prefix = prefix;
    this.classes = classes;
  }
}
