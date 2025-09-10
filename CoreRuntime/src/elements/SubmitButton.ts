import { Element, Action } from '../service/Element.js';

export default class SubmitButton implements Element {
  public type: string;
  public displayText: string;
  public action: Action
  public classes: string;

  public constructor(displayText: string, action: Action, classes: string) {
    this.type = 'SubmitButton';
    this.displayText = displayText;
    this.action = action;
    this.classes = classes;
  }
}
