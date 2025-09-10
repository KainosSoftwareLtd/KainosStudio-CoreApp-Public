import { Element } from '../service/Element.js';

export default class Paragraph implements Element {
  public type: string;
  public displayText: string;

  public constructor(displayText: string) {
    this.type = 'Paragraph';
    this.displayText = displayText;
  }
}
