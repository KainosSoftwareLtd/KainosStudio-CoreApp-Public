import { Element } from '../service/Element.js';

export default class Postcode implements Element {
  public type: string;
  public displayText: string;
  public name: string;
  public classes: string;

  public constructor(displayText: string, name: string, classes: string) {
    this.type = 'PostcodeField';
    this.displayText = displayText;
    this.name = name;
    this.classes = classes;
  }
}
