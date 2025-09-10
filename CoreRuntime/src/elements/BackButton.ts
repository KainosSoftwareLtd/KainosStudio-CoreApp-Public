import { Element } from '../service/Element.js';

export default class BackButton implements Element {
  public type: string;
  public displayText: string;
  public href: string = '#';
  public classes: string;

  public constructor(displayText: string, classes: string) {
    this.type = 'BackButton';
    this.displayText = displayText || 'core:back-button.link-text';
    this.classes = classes;
  }
}
