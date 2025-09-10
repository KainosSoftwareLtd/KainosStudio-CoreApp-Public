import { Element } from '../service/Element.js';

export default class Heading implements Element {
  public type: string;
  public displayText: string;

  public constructor(displayText: string) {
    this.type = 'Heading';
    this.displayText = displayText;
  }
}
