import { Element } from '../service/Element.js';

export default class Email implements Element {
  public type: string;
  public displayText: string;
  public name: string;
  public classes: string;

  public constructor(displayText: string, name: string, classes: string) {
    this.type = 'Email';
    this.displayText = displayText;
    this.name = name;
    this.classes = classes;
  }
}